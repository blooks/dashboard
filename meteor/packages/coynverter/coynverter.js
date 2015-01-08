/**
 * Created by levin on 30.10.14.
 */
/**
 * Providing the methods for exchanging currencies
 */
Coynverter = (function () {

    /**
     * Get the exchange rate on a certain date
     * @param {String} from
     * @param {String} to
     * @param {Date} date
     * @returns {Number}
     */
    var exchangeRate = function (from, to, date) {

        // TODO: usage scenarios? - decide if it'll throw errors or return nulls

        /**
         * @returns {String} User's jurisdiction (the 2-letter id). Default: 'de'
         */
        var userJurisdiction = function () {
            var _ref, _ref1;
            return ((_ref = Meteor.user) != null ? (_ref1 = _ref.profile) != null ? _ref1.jurisdiction : void 0 : void 0) != null ?
                Meteor.user.profile.jurisdiction :
                'de';
        };

        /**
         * @returns {Number} The EUR to USD conversion rate
         */
        var eurToUsd = function () {
            var jurisdiction, year = date.getFullYear(), month = date.getMonth() + 1;
            jurisdiction = userJurisdiction();
            return (exchangeRates[jurisdiction] && exchangeRates[jurisdiction]['USD'] &&
            exchangeRates[jurisdiction]['USD'][year] && exchangeRates[jurisdiction]['USD'][year][month]) ?
                exchangeRates[jurisdiction]['USD'][year][month] :
                null;
        };

        /**
         * @returns {Number} The EUR to USD conversion rate or its inverse
         */
        var btcToFiat = function (currency) {
            var startDate = date;
            var endDate = new Date(date.getTime() + 24000 * 3600);
            var rateRecord = BtcToFiat.findOne({date: {$gte: startDate, $lt: endDate}});
            if (!rateRecord) {
                endDate = startDate;
                startDate = new Date(date.getTime() - 24000 * 3600);
                rateRecord = BtcToFiat.findOne({date: {$gte: startDate, $lt: endDate}});
            }
            return (rateRecord && rateRecord[currency]) ? Number(rateRecord[currency]) : null;
        };

        // validate and dispatch the exchange request:
        date = date || new Date();
        var acceptedCurrencies = ['USD', 'EUR', 'BTC'];
        if (acceptedCurrencies.indexOf(from) < 0 || acceptedCurrencies.indexOf(to) < 0) {
            throw new Error('400', 'Sorry, can\'t use currency \'' + from + '\'.');
        }

        switch (from) {
            case to:
                return 1;
            case 'BTC':
                return to === 'USD' ? btcToFiat('USD') : btcToFiat('EUR');
            case 'EUR':
                if (to === 'USD') {
                    return eurToUsd();
                } else {
                    var b2e = btcToFiat('EUR');
                    return b2e ? 1 / b2e : null;
                }
            case 'USD':
                if (to === 'BTC') {
                    var b2u = btcToFiat('USD');
                    return b2u ? 1 / b2u : null;
                }
                else {
                    var e2u = eurToUsd();
                    return e2u ? 1 / e2u : null;
                }
        }
    };


    /**
     * Note: Base currency is always EUR at the moment
     * @param {Number} amount
     * @param {String} from
     * @param {Date} date
     * @returns {Number} The corresponding amount in the base currency
     */
    var calculateBaseAmount = function (amount, from, date) {
        var baseCurrency = 'EUR', rate;
        check(date = date || new Date(), Date);
        from = from || 'USD';
        rate = exchangeRate(from, baseCurrency, date);
        if (!rate) {
            return 1;
        }
        return rate ? parseInt(amount * rate) : null;
    };


    /**
     * Import rates from a csv text. first value has to be date, second has to be the corresponding value.
     * @param {String} currency
     * @param {String} dbOp Specifically ask to 'insert' or 'update' the records (using 'upsert' would be too slow)
     * @param {String} text containing information to parse
     */
    var importCurrency = function (currency, dbOp, btcs) {
        var fileLines, dailyData, doc;
        fileLines = btcs.split('\n');
        fileLines.shift();  // remove the table header
        var i = fileLines.length - 1;
        for(i=fileLines.length-1; i>0;i--) {
            dailyData = fileLines[i].split(',');
            if (dailyData.length > 1) {
                if (dbOp === 'insert') {
                    var rateDate = dailyData[0];
                    var rateRecord = BtcToFiat.findOne({date: rateDate});
                    if (rateRecord) {
                        i = 0;
                        break;
                    }
                    doc = {date: new Date(rateDate)};
                    doc[currency] = dailyData[1];
                    BtcToFiat.insert(doc);
                }
                else {
                    doc = {};
                    doc[currency] = dailyData[1];
                    BtcToFiat.update({date: new Date(dailyData[0])}, {$set: doc})
                }
            }
            i--;
        }
    };

    // the public API:
    return {
        importCurrency: importCurrency,
        calculateBaseAmount: calculateBaseAmount,
        getExchangeRate: exchangeRate
    };
})();


// Create the BtcToUsd collection if not existing or recreate it if enforced by the environment variable COYNO_REFRESH_RATES.
Meteor.startup(function () {
    var BitcoinAverageClient = Npm.require('bitcoinaverage-client');
    var bitcoinAverageClient = new BitcoinAverageClient();
    BtcToFiat = BtcToFiat || new Mongo.Collection('BtcToFiat');

    /**
     * Requests the average values from bitcoinaverage.com for each day.
     * @param currency Currency to request average value for.  ISO 4217
     */
    var importCurrency = function (currency) {
        var asyncCli = Async.wrap(bitcoinAverageClient, ['getHistory']);
        var cliRes = asyncCli.getHistory(currency);
        if (cliRes !== null && cliRes) {
            Coynverter.importCurrency(currency, 'insert', cliRes);
        }
    }
    /**
     * Cycles through all available currencies in config.coffee to update corresponding prices
     */
    var updateCurrency = function () {
        Meteor.settings.public.coyno.valuedCurrencies.forEach(importCurrency);
    }

    if (Meteor.isServer) {
        updateCurrency();
    }

    //Creates timer that executes a job every day to pull new exchange rates
    var cronScheduler = new Cron(function () {
        updateCurrency();
    }, {
          minute: 10,
           hour: 3
    });
});