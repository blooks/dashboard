var Bitstamp = Meteor.npmRequire('bitstamp');

//Patching Bitstamp NPM Module ; TBR
Bitstamp.prototype.user_transactions = function(limit, callback) {
  if(!callback) {
    callback = limit;
    limit = undefined;
  }
  this._post('user_transactions', callback, {limit: limit});
}



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
var bitstampTradeToTransaction = function(trade) {
  var currencydetails = {}
  var dollar_amount = 0;
   if (trade.btc < 0 ) {// trade is a sale of BTC for USD
          currencydetails.out = {
          amount: trade.btc.substr(1), // Trim off the initial -
          currency: 'BTC'
        }
        dollar_amount = parseFloat(trade.usd) - parseFloat(trade.fee);
        currencydetails.in = {
          amount: dollar_amount.toString(),
          currency: 'USD'
        }
        currencydetails.base = calculateBaseAmount({
          amount: dollar_amount.toString(),
          currency: 'USD'
        }, trade.datetime);
      } else {//trade is a sale of USD for BTC
        dollar_amount = parseFloat(trade.usd.substr(1)) + parseFloat(trade.fee);
        currencydetails.out = {
          amount: dollar_amount.toString(), // Trim off the initial -
          currency: 'USD'
        };
        currencydetails.in = {
          amount: trade.btc,
          currency: 'BTC'
        };
        currencydetails.base = calculateBaseAmount({
          amount: dollar_amount.toString(),
          currency: 'USD'
        }, trade.datetime);
      }
  return currencydetails;
};

var bitstampDepositToTransaction = function(deposit) {
  var currencydetails = {};
  if (deposit.usd > 0) {//Dollar deposit
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
          } else {//bitcoin deposit
            currencydetails.in = {
              amount: deposit.btc,
              currency: 'BTC'
            };
            currencydetails.out = {
              amount: 0,
              currency: 'USD'
            };
            currencydetails.base = {
              amount: 0,
              currency: 'EUR'
            };
          }
    return currencydetails;
}
var bitstampRippleDepositToTransaction = function(deposit) {
  var currencydetails = {};
  if (deposit.usd > 0) {//Dollar deposit
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
          } else {//bitcoin deposit
            currencydetails.in = {
              amount: deposit.btc,
              currency: 'BTC'
            };
            currencydetails.out = {
              amount: 0,
              currency: 'USD'
            };
            currencydetails.base = {
              amount: 0,
              currency: 'EUR'
            };
          }
    return currencydetails;
}

var bitstampWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  if (withdrawal.usd < 0) {//Dollar withdrawel
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
          } else {//bitcoin withdrawel
            currencydetails.out = {
              amount: withdrawal.btc.substr(1),
              currency: 'BTC'
            };
            currencydetails.in = {
              amount: 0,
              currency: 'USD'
            };
            currencydetails.base = {
              amount: 0,
              currency: 'EUR'
            };
          }
  return currencydetails;
}
var bitstampRippleWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  if (withdrawal.usd < 0) {//Dollar withdrawel
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
          } else {//bitcoin withdrawal
            currencydetails.out = {
              amount: withdrawal.btc.substr(1),
              currency: 'BTC'
            };
            currencydetails.in = {
              amount: 0,
              currency: 'USD'
            };
            currencydetails.base = {
              amount: 0,
              currency: 'EUR'
            };
          }
  return currencydetails;
}
//Accepting ONLY API Style JSON objects.
var convertBitstampTx = function(bitstampTx) {
  var transaction = {};
  //Fixing date format
  bitstampTx.datetime = new Date(bitstampTx.datetime);
  transaction.date = bitstampTx.datetime;
  transaction.source = 'Bitstamp';
  transaction.userId = Meteor.userId();
  transaction.foreignId = Meteor.userId() + 'Bitstamp' + bitstampTx.id;
  var currencydetails = {};
   if (bitstampTx.type === 2) {//trade 
      currencydetails = bitstampTradeToTransaction(bitstampTx);
      } else if (bitstampTx.type === 0) {//deposit
        currencydetails = bitstampDepositToTransaction(bitstampTx);
        } else if (bitstampTx.type === 1) {//withdrawal
          currencydetails = bitstampWithdrawalToTransaction(bitstampTx);
          } else if (bitstampTx.type === 3) {//ripple withdrawel
            currencydetails = bitstampRippleWithdrawalToTransaction(bitstampTx);
          } else if (bitstampTx.type === 4) {//ripple deposit
                currencydetails = bitstampRippleDepositToTransaction(bitstampTx);
          } else {
            console.log("FEHLER! BITSTAMP LIEFERT TOTALE SCHEISSE")
          }
  transaction.in = currencydetails.in;
  transaction.out = currencydetails.out;
  transaction.base = currencydetails.base; 
  return transaction;
}



var bitstampJSONtoDB = function(bitstampData) { 
  var errors = [];
  for (i = 0; i < bitstampData.length; ++i) {
    var bitstampTx = bitstampData[i];
    var transaction = convertBitstampTx(bitstampTx);
      try {
          transactionId = Transactions.insert(transaction);
              } catch (_error) {
            e = _error;
               errors.push(e);
        }
  }
        return errors.length === 0;
    };

    Meteor.methods({
      getBitstampData: function () {
        var bitstampAccounts = Exchanges.find({exchange: "Bitstamp"}).fetch();
        if (bitstampAccounts) {
        var bitstamp = new Bitstamp;
        bitstampAccounts.forEach(function(account) {
        var key = account.credentials.APIKey;
        var secret = account.credentials.secret;
        var client_id = account.credentials.userName;
        var privateBitstamp = new Bitstamp(key, secret, client_id);
        var wrappedPrivateBitstamp = Async.wrap(privateBitstamp, ['user_transactions']);
        var jsonData = wrappedPrivateBitstamp.user_transactions(100000);
        bitstampJSONtoDB(jsonData);
      });
      }
    }
    });