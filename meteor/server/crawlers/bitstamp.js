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

calculateBaseAmount = function(amount, foreigncurrency, date) {
  var e, rate, to;
  if (date == null) {
    date = new Date();
  }
  try {
    check(date, Date);
    if (foreigncurrency !== 'USD') {
      throw new Meteor.Error('400', 'Sorry, can only convert from USD right now...');
    }
    to = 'EUR';
    rate = getExchangeRate(foreigncurrency, to, date);
    return accounting.toFixed(amount * rate, 2);
    } catch (_error) {
    e = _error;
    return console.log(e);
    }
};
var bitstampTradeToTransaction = function(trade) {
  var currencydetails = {}
  var dollar_amount = 0;
   if (trade.btc < 0 ) {// trade is a sale of BTC for USD
      var bitcoin_amount = trade.btc.substr(1);
          currencydetails.out = {
          amount: bitcoin_amount, // Trim off the initial -
          currency: 'BTC',
          node: 'Bitstamp'
        }
        dollar_amount = parseFloat(trade.usd) - parseFloat(trade.fee);
        currencydetails.in = {
          amount: dollar_amount.toString(),
          currency: 'USD',
          node: 'Bitstamp'
        }
        currencydetails.base = {
          amount: calculateBaseAmount(dollar_amount, 'USD', trade.datetime),
          currency: 'EUR'
        };
      } else {//trade is a sale of USD for BTC
        dollar_amount = parseFloat(trade.usd.substr(1)) + parseFloat(trade.fee);
        currencydetails.out = {
          amount: dollar_amount.toString(),
          currency: 'USD',
          node: 'Bitstamp'
        };
        currencydetails.in = {
          amount: trade.btc,
          currency: 'BTC',
          node: 'Bitstamp'
        };
        currencydetails.base = {
          amount: calculateBaseAmount(dollar_amount, 'USD', trade.datetime),
          currency: 'EUR'
        };
      }
  return currencydetails;
};

var bitstampDepositToTransaction = function(deposit) {
  var currencydetails = {};
  if (deposit.usd > 0) {//Dollar deposit
    var dollar_amount = deposit.usd;
            currencydetails.in = {
              amount: dollar_amount,
              currency: 'USD',
              node: 'Bitstamp'
            };
            base_amount = calculateBaseAmount(dollar_amount, 'USD', deposit.datetime)
        currencydetails.out = {
          amount: base_amount,
          currency: 'EUR',
          node: 'BankAccount'
        };
        currencydetails.base = {
          amount: base_amount,
          currency: 'EUR'
        };
          } else {//bitcoin deposit
            currencydetails.in = {
              amount: deposit.btc,
              currency: 'BTC',
              node: 'Bitstamp'
            };
            currencydetails.out = {
              amount: deposit.btc,
              currency: 'BTC',
              node: 'BitcoinWallet'
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
  var base_currency ='EUR';
  if (deposit.usd > 0) {//Dollar deposit
            currencydetails.in = {
              amount: deposit.usd,
              currency: 'USD', 
              node: 'Bitstamp'
            };
            currencydetails.out = {
              amount: deposit.usd,
              currency: 'USD', 
              node: 'Ripple'
            }
            currencydetails.base = {
              amount: 0,
              currency: base_currency
            }
          } else {//bitcoin deposit
            currencydetails.in = {
              amount: deposit.btc,
              currency: 'BTC',
              node: 'Bitstamp'
            };
            currencydetails.out = {
              amount: deposit.btc,
              currency: 'BTC',
              node: 'Ripple'
            };
            currencydetails.base = {
              amount: 0,
              currency: base_currency
            }
          }
    return currencydetails;
}

var bitstampWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawel
    var dollar_amount = withdrawal.usd.substr(1);
    var base_amount = calculateBaseAmount(dollar_amount, 'USD', withdrawal.datetime);
            currencydetails.out = {
              amount: dollar_amount,
              currency: 'USD',
              node: 'Bitstamp'
            }
            currencydetails.in = {
              amount: base_amount,
              currency: base_currency,
              node: 'BankAccount'
            };
            currencydetails.base = {
              amount: base_amount,
              currency: base_currency
            };
          } else {//bitcoin withdrawel
            bitcoin_amount = withdrawal.btc.substr(1),
            currencydetails.out = {
              amount: bitcoin_amount,
              currency: 'BTC',
              node: 'Bitstamp'
            };
            currencydetails.in = {
              amount: bitcoin_amount,
              currency: 'BTC',
              node: 'BitcoinWallet'
            };
            currencydetails.base = {
              amount: 0,
              currency: base_currency
            };
          }
  return currencydetails;
}
var bitstampRippleWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawel
      var dollar_amount = withdrawal.usd.substr(1);
            currencydetails.in = {
              amount: dollar_amount,
              currency: 'USD',
              node: 'Ripple'
            };
            currencydetails.out = {
              amount: dollar_amount,
              currency: 'USD',
              node: 'Bitstamp'
            };
            currencydetails.base = {
              amount: 0,
              currency: base_currency
            };
          } else {//bitcoin withdrawal
            var bitcoin_amount = withdrawal.btc.substr(1);
            currencydetails.out = {
              amount: bitcoin_amount,
              currency: 'BTC',
              node: 'Bitstamp'
            };
            currencydetails.in = {
              amount: bitcoin_amount,
              currency: 'BTC',
              node: 'Ripple'
            };
            currencydetails.base = {
              amount: 0,
              currency: base_currency
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