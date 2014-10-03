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
    if (foreigncurrency !== 'USD' && foreigncurrency !== 'EUR') {
      throw new Meteor.Error('400', 'Sorry, can only convert from USD right now...');
    }
    to = 'EUR';
    rate = getExchangeRate(foreigncurrency, to, date);
    return accounting.toFixed(amount * rate, 0);
    } catch (_error) {
    e = _error;
    return console.log(e);
    }
};
var bitstampTradeToTransaction = function(trade) {
  var currencydetails = {}
  var dollar_amount = 0;
   if (trade.btc < 0 ) {// trade is a sale of BTC for USD
      var bitcoin_amount = -1*trade.btc;
          currencydetails.out = {
          amount: bitcoin_amount, // Trim off the initial -
          currency: 'BTC',
          node: 'Bitstamp'
        }
        dollar_amount = trade.usd - trade.fee;
        currencydetails.in = {
          amount: dollar_amount,
          currency: 'USD',
          node: 'Bitstamp'
        }
      } else {//trade is a sale of USD for BTC
        dollar_amount = -1*trade.usd + trade.fee;
        currencydetails.out = {
          amount: dollar_amount,
          currency: 'USD',
          node: 'Bitstamp'
        };
        currencydetails.in = {
          amount: trade.btc,
          currency: 'BTC',
          node: 'Bitstamp'
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
          }
    return currencydetails;
}

var bitstampWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawel
    var dollar_amount = -1 * withdrawal.usd;
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
          } else {//bitcoin withdrawel
            bitcoin_amount = -1 * withdrawal.btc,
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
          }
  return currencydetails;
}
var bitstampRippleWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawel
      var dollar_amount = -1*withdrawal.usd;
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
          } else {//bitcoin withdrawal
            var bitcoin_amount = -1*withdrawal.btc;
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
  
  //preconditioning. Bitstamp gives float-style-strings for amounts
  bitstampTx.usd = parseInt(Math.round(parseFloat(bitstampTx.usd)*100));
  bitstampTx.btc = parseInt(Math.round(parseFloat(bitstampTx.btc)*100000000));
  bitstampTx.fee = parseInt(Math.round(parseFloat(bitstampTx.fee)*100));

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
               //console.log(e);
               //console.log(transaction);
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