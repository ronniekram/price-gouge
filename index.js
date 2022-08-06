// https://api.census.gov/data/2018/acs/acs5/subject?get=NAME,S1903_C03_001E&for=zip%20code%20tabulation%20area:*
let zipObjects = [];

const getMedianIncomes = async () => {
  const response = await fetch(`https://api.census.gov/data/2018/acs/acs5/subject?get=NAME,S1903_C03_001E&for=zip%20code%20tabulation%20area:*`);
  const data = await response.json();
  data.splice(1).map((obj) => {
    zipObjects.push({
    zip: obj[3],
    income: parseInt(obj[1]),
    });
  });
};


document.addEventListener(`DOMContentLoaded`, getMedianIncomes);

document.getElementById(`search`).addEventListener(`submit`, (e) => {
    e.preventDefault();
    const el = document.getElementById(`income`);
    el.innerHTML = ``;
    const foundIncome = zipObjects.find((obj) => obj.zip === document.getElementById(`input`).value);
    console.log(foundIncome.income);

    let costPer = 0;
    switch (true) {
      case (foundIncome.income < 40000):
        costPer = 0;
        break;
      case (foundIncome.income > 40000 && foundIncome.income < 50000):
        costPer = 2;
        break;
      case (foundIncome.income > 50000 && foundIncome.income < 70000):
        costPer = 4;
        break;
      case (foundIncome.income > 70000 && foundIncome.income < 90000):
        costPer = 6;
        break;
      case (foundIncome.income > 90000 && foundIncome.income < 120000):
        costPer = 10;
        break;
      case foundIncome.income > 120000:
        costPer = 15;
        break;
    }

    const dollars = Intl.NumberFormat(`en-US`);
    const p = document.createElement(`p`);
    p.innerText = costPer === 0 ? `Free answers for you, my guy!` : `Answers will cost you $${dollars.format(costPer)}/lesson element, chump.`;
    el.appendChild(p);
});
