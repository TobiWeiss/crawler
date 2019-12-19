const rp = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
process.setMaxListeners(200);
const ws = fs.createWriteStream("out.csv");

const url = "https://www.wg-gesucht.de/wohnungen-in-Bamberg.5.2.1.0.html?offer_filter=1&noDeact=1&city_id=5&category=2&rent_type=0";
const options = {
    uri: url,
    headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36"
    }
};

function getOffers(options) {
    rp(options)
        .then(function (html) {
            const descriptionElementsObject = cheerio(".list-details-panel-inner", html);
            const descriptionElementsArray = Object.values(descriptionElementsObject);
            const descriptionsStringArray = getDescriptions(descriptionElementsArray);
            //console.table(descriptionsStringArray);
            const priceSizeElementsObject = cheerio(".detailansicht", html);
            const priceSizeElementsArray = Object.values(priceSizeElementsObject);
            const priceSizeStringArray = getSizeAndPrice(priceSizeElementsArray);
            console.table(priceSizeStringArray);

        })
        .catch(function (err) {
            console.log(err);
        });
}

const getDescriptions = (descriptionElementsArray) => {
    let descriptions = [];
    descriptionElementsArray.forEach((offer) => {
        if (Array.isArray(offer.children)) {
            offer.children.forEach((child) => {
                if (child && child.name === "p" && child.children && child.children[0]) {
                    descriptions.push(child.children[0].data);
                }
            });
        }
    });
    descriptions = _removeWhiteSpaces(descriptions);
    return descriptions;
};

const getSizeAndPrice = (priceSizeElementsArray) => {
    let pricesAndSizes = [];
    priceSizeElementsArray.forEach(element => {
        if (element && element.children && Array.isArray(element.children)) {
            element.children.forEach(child => {
                if (child && child.type === "text" && child.data.includes("€") && !child.data.includes("ab")) {
                    pricesAndSizes.push(child.data);
                }
            });
        }
    });
    pricesAndSizes = _removeWhiteSpaces(pricesAndSizes);
    return pricesAndSizes;
    //console.info(priceSizeElementsArray);
};

const _removeWhiteSpaces = (stringArray) => {
    stringArray = stringArray.map(string => string.replace(/  +/g, " "));
    stringArray = stringArray.map(string => string.replace(/(\r\n|\n|\r)/gm, ""));
    return stringArray;
};

getOffers(options);



