var KrakenClient = Meteor.npmRequire('kraken-api');


/**
var calculateBaseAmount;

calculateBaseAmount = function(amt, date) {
  var e, rate, to;
  if (date == null) {
    date = new Date();
  }
  try {
    check(amt, {
      amount: String,
      currency: String
    });
    check(date, Date);
    if (amt.currency !== 'USD') {
      throw new Meteor.Error('400', 'Sorry, can only convert from USD right now...');
    }
    to = 'EUR';
    rate = getExchangeRate(amt.currency, to, date);
    return {
      amount: accounting.toFixed(amt.amount * rate, 2),
      currency: to
    };
  } catch (_error) {
    e = _error;
    return console.log(e);
  }
};
**/

var krakenAssettoCoynoAsset = function (krakenAsset) {
  if (krakenAsset === "ZEUR") return "EUR";
  if (krakenAsset === "XXBT") return "BTC";
  return "Unkown";
}
var krakenTradeToTransaction = function(trade) {
  var currencydetails = {}
  var krakenIn = trade[0];
  var krakenOut = trade[1];
  //We assume Kraken always gives the inflow first, outflow second
  if (krakenIn.amount < 0) {
    throw new Meteor.Error('400', 'Kraken not giving buy as first part of the trade!');
  }
  currencydetails.in = {
          amount: krakenIn.amount, // Trim off the initial -
          currency: krakenAssettoCoynoAsset(krakenIn.asset)
        }
        currencydetails.out = {
          amount: krakenOut.amount.substr(1),
          currency: krakenAssettoCoynoAsset(krakenOut.asset)
        }
        currencydetails.base = {amount: 0, currency: 'EUR'};
        return currencydetails;
      };
/**
var krakenDepositToTransaction = function(deposit) {
  var currencydetails = {};
  if (deposit.btc === '0.00000000') {
            currencydetails["in"] = {
              amount: deposit.usd,
              currency: 'USD'
            };
            currencydetails.out = calculateBaseAmount({
              amount: deposit.usd,
              currency: 'USD'
            }, deposit.datetime);
            currencydetails.base = calculateBaseAmount({
              amount: deposit.usd,
              currency: 'USD'
            }, deposit.datetime);
          }
    return currencydetails;
}
      if (krakenData[i].refid !== krakenTx.refid) {
      throw new Meteor.Error('400', 'Kraken not giving both sides of the trade!');
    }
var krakenWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  if (withdrawal.btc === '0.00000000') {//Dollar withdrawel
            currencydetails.in = calculateBaseAmount({
              amount: withdrawal.usd.substr(1),
              currency: 'USD'
            }, withdrawal.datetime);
            currencydetails.out = {
              amount: withdrawal.usd.substr(1),
              currency: 'USD'
            };
            currencydetails.base = calculateBaseAmount({
              amount: withdrawal.usd.substr(1),
              currency: 'USD'
            }, withdrawal.datetime);
          } else {//Bitcoin withdrawal
            return {};
          }
  return currencydetails;
}

**/

var krakenJSONtoDB = function(krakenData) { 
  var errors = [];
  for (i = 0; i < krakenData.length; ++i) {
    var krakenTx = krakenData[i];
    var transaction = {};
    transaction.date = new Date(krakenTx.time*1000);//Milliseconds
    transaction.source = 'Kraken';
    transaction.userId = Meteor.userId();
    transaction.foreignId = Meteor.userId() + 'Kraken' + krakenTx.refid;
    var currencydetails = {};
    var transactionValid = false;
    if (krakenTx.type === 'trade') {//trade consists of two json objects
      ++i;
      if (krakenData[i].refid !== krakenTx.refid) {
        throw new Meteor.Error('400', 'Kraken not giving both sides of the trade!');
      }
      var krakenTrade = [krakenTx , krakenData[i]];
      currencydetails = krakenTradeToTransaction(krakenTrade);
      transactionValid = true;
    }
      /** else if (krakenTx.type === 'deposit') {//deposit
        currencydetails = krakenDepositToTransaction(krakenTx);
        } else if (krakenTx.type === 'withdrawal') {//withdrawal
          currencydetails = krakenWithdrawalToTransaction(krakenTx);
          } else {
            console.log("WARNING: Kraken returning unrecognized transactions!")
          }**/
      if (transactionValid) {
          transaction.in = currencydetails.in;
          transaction.out = currencydetails.out;
          transaction.base = currencydetails.base; 
          try {
            transactionId = Transactions.insert(transaction);
          } catch (_error) {
            e = _error;
            errors.push(e);
          }
        }
      }

        return errors.length === 0;
      };

Meteor.methods({
  getKrakenData: function () {
    var krakenAccounts = Exchanges.find({exchange: "Kraken"}).fetch();
        if (krakenAccounts) {//only do if a Kraken account has been added
          krakenAccounts.forEach(function(account) {
            var key = account.credentials.APIKey;
            var secret = account.credentials.secret;
            var kraken = new KrakenClient(key, secret);
            var asyncApiCall = kraken.api;      
            var syncApiCall = Async.wrap(asyncApiCall);
            var unixStartStamp = new Date(0).getTime();
            var apiDataPackage = syncApiCall('Ledgers', {});
            //turn JSON Object to array
            var numberOfKrakenTrades = apiDataPackage.result.count;
            var krakenData = []
            var ledgerIdOfLastEntry = "";
            while (krakenData.length < numberOfKrakenTrades) {//making sure we get ALL the transactions from Kraken
            for (var entry in apiDataPackage.result.ledger) {
              var newKrakenTransaction = apiDataPackage.result.ledger[entry];
              if (entry !== ledgerIdOfLastEntry) {
              krakenData.push(newKrakenTransaction);
            } 
              ledgerIdOfLastEntry = entry;
            }
            apiDataPackage = syncApiCall('Ledgers', {end: ledgerIdOfLastEntry});
          }
          if (krakenData.length != numberOfKrakenTrades) {
            console.log("Warning: Not all or even more Trades extracted than reported by Kraken!");
            console.log("Number of extracted trades: " + krakenData.length);
            console.log("Number of Kraken Trades: " + numberOfKrakenTrades);
          }
          krakenJSONtoDB(krakenData);
          }
          );
        }
      }
    });