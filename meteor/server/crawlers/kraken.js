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
var krakenTradeToTransaction = function(trade) {
  var currencydetails = {}
   if (trade.btc.substr(0,1) === '-' ) {// trade is a sale of bitcoin for USD
          currencydetails.in = {
          amount: trade.btc.substr(1), // Trim off the initial -
          currency: 'BTC'
        }
        currencydetails.out = {
          amount: trade.usd,
          currency: 'USD'
        }
        currencydetails.base = calculateBaseAmount({amount: trade.usd, currency: 'USD'}, trade.datetime);
      } else {
        currencydetails.in = {
          amount: trade.usd.substr(1), // Trim off the initial -
          currency: 'USD'
        };
        currencydetails.out = {
          amount: trade.btc,
          currency: 'BTC'
        };
        currencydetails.base = calculateBaseAmount({
          amount: trade.usd.substr(1),
          currency: 'USD'
        }, trade.datetime);
      }
  return currencydetails;
};

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
//Accepting ONLY API Style JSON objects.
var convertKrakenTx = function(krakenTx) {
  var transaction = {};
  //Fixing date format
  krakenTx.datetime = new Date(krakenTx.datetime);
  transaction.date = krakenTx.datetime;
  transaction.source = 'Kraken';
  transaction.userId = Meteor.userId();
  transaction.foreignId = Meteor.userId() + 'Kraken' + krakenTx.id;
  var currencydetails = {};
   if (krakenTx.type === 2) {//trade 
      currencydetails = krakenTradeToTransaction(krakenTx);
      } else if (krakenTx.type === 0) {//deposit
        currencydetails = krakenDepositToTransaction(krakenTx);
        } else if (krakenTx.type === 1) {//withdrawal
          currencydetails = krakenWithdrawalToTransaction(krakenTx);
          }

  //Hack as we ignore bitcoin withdrawals atm.
  if (Object.keys(currencydetails).length == 0) {
    return {};
  }

  transaction.in = currencydetails.in;
  transaction.out = currencydetails.out;
  transaction.base = currencydetails.base; 
  return transaction;
}



var krakenJSONtoDB = function(krakenData) { 
  var errors = [];
  for (i = 0; i < krakenData.length; ++i) {
    var krakenTx = krakenData[i];
    var transaction = convertKrakenTx(krakenTx);
    //Hack because we ignore Bitcoin withdrawals atm
    if (Object.keys(transaction).length > 0) {
      try {
          transactionId = Transactions.insert(transaction);
              } catch (_error) {
            e = _error;
               errors.push(e);
        }
    }

        return errors.length === 0;
    };
  }
  **/
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
            var jsonData = syncApiCall('Ledgers', {});
            console.log(jsonData.result)
            ;}
            );
        }
      }
    });