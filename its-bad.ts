/* eslint-disable @typescript-eslint/no-var-requires */
const fetch = require(`node-fetch`);

// HELPER FUNCTION TO GENERATE REDIRECTS
// TODO: can this be gatsby-node.ts instead?
const generateRedirects = (redirectBases) => {
	const expandedRedirects = {};

	// go through object and append expandedRedirects with an array of new redirects for each state
	Object.keys(redirectBases).forEach((state) => {
		const originalRedirect = redirectBases[state];

		// array of variations, starting with what's in the bases object, and the object key variations
		const variations = [
			originalRedirect, // rhode-island
			state, // RI
			state.toLowerCase(), // ri
		];

		if (originalRedirect.includes(`-`)) {
			// get array of words separated by hypehens to work with
			const wordArray = originalRedirect.split(`-`);

			// i.e. rhodeisland
			const smushedLowerRedirect = wordArray.join(``);
			variations.push(smushedLowerRedirect);

			const upperWordArray = [];
			wordArray.forEach((word) => {
				const firstCapitalized =
					word.charAt(0).toUpperCase() + word.slice(1);
				upperWordArray.push(firstCapitalized);
			});

			// i.e. Rhode-Island
			const hyphenatedUpperRedirect =
				upperWordArray.join(`-`);
			// i.e. RhodeIsland
			const smushedUpperRedirect = upperWordArray.join(``);
			// i.e. rhodeIsland
			const smushedUpperRedirectFirstLower =
				smushedUpperRedirect.charAt(0).toLowerCase() +
				smushedUpperRedirect.slice(1);
			variations.push(
				hyphenatedUpperRedirect,
				smushedUpperRedirect,
				smushedUpperRedirectFirstLower
			);
		} else {
			const firstCapitalized =
				originalRedirect.charAt(0).toUpperCase() +
				originalRedirect.slice(1);
			variations.push(firstCapitalized);
		}
		expandedRedirects[state] = variations;
	});
	return expandedRedirects;
};

exports.sourceNodes = async ({
	actions,
	createNodeId,
	createContentDigest,
}) => {
	const { createNode } = actions;

	const stateDataResult = await fetch(
		`https://www.distilledspirits.org/wp-json/wp/v2/states_data?per_page=100`
	);
	const stateData = await stateDataResult.json();

	stateData.forEach((datum) => {
		const nodeContent = JSON.stringify(datum);

		const workingDatum = datum;

		// reassign value as object with null values if it's a string
		if (
			workingDatum.ACF.yes__no
				.distilled_spirits_tastings_type === ``
		) {
			workingDatum.ACF.yes__no.distilled_spirits_tastings_type =
				{ value: null, label: null };
		}

		// reassign value as empty array if it's a false boolean
		if (workingDatum.ACF.contacts === false) {
			workingDatum.ACF.contacts = [];
		}
		const nodeMeta = {
			id: createNodeId(`state-data-${workingDatum.id}`),
			parent: null,
			children: [],
			internal: {
				type: `WpV2StateData`,
				mediaType: `text/html`,
				content: nodeContent,
				contentDigest: createContentDigest(workingDatum),
			},
		};
		const node = { ...workingDatum, ...nodeMeta };
		createNode(node);
	});

	const postDataResult = await fetch(
		`https://www.distilledspirits.org/wp-json/wp/v2/news?shipmyspirits=162&per_page=100`
	);
	const postData = await postDataResult.json();

	postData.forEach((datum) => {
		const nodeContent = JSON.stringify(datum);

		const workingDatum = datum;

		const nodeMeta = {
			id: createNodeId(`post-data-${workingDatum.id}`),
			parent: null,
			children: [],
			internal: {
				type: `WpV2PostData`,
				mediaType: `text/html`,
				content: nodeContent,
				contentDigest: createContentDigest(workingDatum),
			},
		};
		const node = { ...workingDatum, ...nodeMeta };
		createNode(node);
	});
	return null;
};

exports.createPages = async ({ graphql, actions }) => {
	// TODO: This is a helper object, defined here as importing data into gatsby-node.js is rather difficult?
	const redirectBases = {
		AL: `alabama`,
		AK: `alaska`,
		AZ: `arizona`,
		AR: `arkansas`,
		CA: `california`,
		CO: `colorado`,
		CT: `connecticut`,
		DE: `delaware`,
		DC: `district-of-columbia`,
		FL: `florida`,
		GA: `georgia`,
		HI: `hawaii`,
		ID: `idaho`,
		IL: `illinois`,
		IN: `indiana`,
		IA: `iowa`,
		KS: `kansas`,
		KY: `kentucky`,
		LA: `louisiana`,
		ME: `maine`,
		MD: `maryland`,
		MA: `massachusetts`,
		MI: `michigan`,
		MN: `minnesota`,
		MS: `mississippi`,
		MO: `missouri`,
		MT: `montana`,
		NE: `nebraska`,
		NV: `nevada`,
		NH: `new-hampshire`,
		NJ: `new-jersey`,
		NM: `new-mexico`,
		NY: `new-york`,
		NC: `north-carolina`,
		ND: `north-dakota`,
		OH: `ohio`,
		OK: `oklahoma`,
		OR: `oregon`,
		PA: `pennsylvania`,
		RI: `rhode-island`,
		SC: `south-carolina`,
		SD: `south-dakota`,
		TN: `tennessee`,
		TX: `texas`,
		UT: `utah`,
		VT: `vermont`,
		VA: `virginia`,
		WA: `washington`,
		WV: `west-virginia`,
		WI: `wisconsin`,
		WY: `wyoming`,
	};

	const allRedirectsPaths = generateRedirects(redirectBases);

	const { createPage, createRedirect } = actions;

	Object.keys(allRedirectsPaths).forEach((state) => {
		const pathStringsArray = allRedirectsPaths[state];

		pathStringsArray.forEach((string) => {
			createRedirect({
				fromPath: `/${string}`,
				toPath: `/state-facts?state=${state}`,
			});
		});
	});
};
