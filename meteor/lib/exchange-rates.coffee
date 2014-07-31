rates = require("../../data/exchangerates.json")

var computeValue, rates, legislation;

rates = require("../../data/exchangerates.json");

computeBaseValue = function(amount, forex, base, date) {
    if (base == "EUR") {
        return (amount / rates.legislation.forex.(date.getFullYear()).date.getMonth());
    } else {
        return 0;
    }
    };
