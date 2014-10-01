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

var bitstampDepositToTransaction = function(deposit) {
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

var bitstampWithdrawalToTransaction = function(withdrawal) {
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



var bitstampJSONtoDB = function(bitstampData) { 
  var errors = [];
  for (i = 0; i < bitstampData.length; ++i) {
    var bitstampTx = bitstampData[i];
    var transaction = convertBitstampTx(bitstampTx);
    //Hack because we ignore Bitcoin withdrawals atm
    if (Object.keys(transaction).length > 0) {
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
      getBitstampData: function () {
        var bitstamp = new Bitstamp;
        var profile = Meteor  .user().profile;
        var key = profile.bitstampAPIKey;
        var secret = profile.bitstampSecret;
        var client_id = profile.bitstampUserId;
        var privateBitstamp = new Bitstamp(key, secret, client_id);
        var wrappedPrivateBitstamp = Async.wrap(privateBitstamp, ['user_transactions']);
        var jsonData = wrappedPrivateBitstamp.user_transactions(100000);
        bitstampJSONtoDB(jsonData);
      }
    });