var Bitstamp = Meteor.npmRequire('bitstamp');

//Patching Bitstamp NPM Module ; TBR 

Bitstamp.prototype.user_transactions = function(limit, callback) {
  if(!callback) {
    callback = limit;
    limit = undefined;
  }
  this._post('user_transactions', callback, {limit: limit});
}

var calculateBaseAmount = function(amount, foreigncurrency, date) {
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
var bitstampTradeToTrade = function(trade) {
  var currencydetails = {}
  var dollar_amount = 0;
   if (trade.btc < 0 ) {// trade is a sale of BTC for USD
          currencydetails.sell = {
          amount: Math.abs(trade.btc),
          currency: 'BTC',
          fee: 0
        }
        currencydetails.buy = {
          amount: trade.usd,
          currency: 'USD',
          fee: trade.fee
        }
      } else {//trade is a sale of USD for BTC
        currencydetails.sell = {
          amount: Math.abs(trade.usd),
          currency: 'USD',
          fee: trade.fee
        };
        currencydetails.buy = {
          amount: trade.btc,
          currency: 'BTC',
          fee: 0
        };
      }
  return currencydetails;
};

var bitstampDepositToTrade = function(deposit) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (deposit.usd > 0) {//Dollar deposit
            currencydetails.buy = {
              amount: deposit.usd,
              currency: 'USD',
              fee: deposit.fee
            };
            base_amount = calculateBaseAmount(deposit.usd, 'USD', deposit.datetime)
          currencydetails.sell = {
          amount: base_amount,
          currency: base_currency,
          fee: 0
        };
          }
          //A bitcoin deposit on bitstamp is for free and within Bitcoin
          //so it counts as a transfer.
    return currencydetails;
}
/**
var bitstampRippleDepositToTransfer = function(deposit) {
  var currencydetails = {};
  var base_currency ='EUR';
  if (deposit.usd > 0) {//Dollar deposit
            currencydetails.in = {
              amount: deposit.usd,
              currency: 'USD', 
              fee: 0.5
            };
            currencydetails.out = {
              amount: deposit.usd,
              currency: 'USD', 
              fee: 'Ripple'
            }
          } else {//bitcoin deposit
            currencydetails.in = {
              amount: deposit.btc,
              currency: 'BTC',
              fee: 0.5
            };
            currencydetails.out = {
              amount: deposit.btc,
              currency: 'BTC',
              fee: 'Ripple'
            };
          }
    return currencydetails;
}
**/
var bitstampWithdrawalToTrade = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawal
    var dollar_amount = Math.abs(withdrawal.usd);
    var base_amount = calculateBaseAmount(dollar_amount, 'USD', withdrawal.datetime);
            currencydetails.sell = {
              amount: dollar_amount,
              currency: 'USD',
              fee: 0
            }
            currencydetails.buy = {
              amount: base_amount,
              currency: base_currency,
              fee: 0
            };
          }
      //Bitcoin Withdrawal is a transfer
  return currencydetails;
}
/**
var bitstampRippleWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawel
      var dollar_amount = -1*withdrawal.usd;
            currencydetails.in = {
              amount: dollar_amount,
              currency: 'USD',
              fee: 'Ripple'
            };
            currencydetails.out = {
              amount: dollar_amount,
              currency: 'USD',
              fee: 0.5
            };
          } else {//bitcoin withdrawal
            var bitcoin_amount = -1*withdrawal.btc;
            currencydetails.out = {
              amount: bitcoin_amount,
              currency: 'BTC',
              fee: 0.5
            };
            currencydetails.in = {
              amount: bitcoin_amount,
              currency: 'BTC',
              fee: 'Ripple'
            };
          }
  return currencydetails;
}**/
//Accepting ONLY API Style JSON objects.
var convertBitstampTx = function(bitstampTx) {
  var trade = {};
  //Fixing date format
  bitstampTx.datetime = new Date(bitstampTx.datetime);
  trade.date = bitstampTx.datetime;
  trade.userId = Meteor.userId();
  trade.foreignId = Meteor.userId() + 'Bitstamp' + bitstampTx.id;
  
  //preconditioning. Bitstamp gives float-style-strings for amounts
  bitstampTx.usd = parseInt(Math.round(parseFloat(bitstampTx.usd)*100000000));
  bitstampTx.btc = parseInt(Math.round(parseFloat(bitstampTx.btc)*100000000));
  bitstampTx.fee = parseInt(Math.round(parseFloat(bitstampTx.fee)*100000000));

  var currencydetails = {};
   if (bitstampTx.type === 2) {//trade 
      currencydetails = bitstampTradeToTrade(bitstampTx);
      } /** else if (bitstampTx.type === 0) {//deposit
        currencydetails = bitstampDepositToTrade(bitstampTx);
        } else if (bitstampTx.type === 1) {//withdrawal
          currencydetails = bitstampWithdrawalToTrade(bitstampTx);
          }  else if (bitstampTx.type === 3) {//ripple withdrawel
            currencydetails = bitstampRippleWithdrawalToTransaction(bitstampTx);
          } else if (bitstampTx.type === 4) {//ripple deposit
                currencydetails = bitstampRippleDepositToTransaction(bitstampTx);
          } **/ else {
            return {};
            console.log("FEHLER! BITSTAMP LIEFERT TOTALE SCHEISSE")
          }
  trade.buy = currencydetails.buy;
  trade.sell = currencydetails.sell;
  return trade;
}



var bitstampJSONtoDB = function(bitstampData, exchange) { 
  var errors = [];
  for (i = 0; i < bitstampData.length; ++i) {
    var bitstampTx = bitstampData[i];
    var trade = convertBitstampTx(bitstampTx);
    if (Object.keys(trade).length > 0) {
      trade.venueId = exchange._id;
        try {
          tradeId = Trades.insert(trade);
              } catch (_error) {
            e = _error;
               errors.push(e);
               console.log(e);
               console.log(trade);
        }
      }
    }
    return errors.length === 0;
};



Meteor.methods({
  getBitstampData: function (exchange) {
    var key = exchange.credentials.APIKey;
    var secret = exchange.credentials.secret;
    var client_id = exchange.credentials.userName;
    var privateBitstamp = new Bitstamp(key, secret, client_id);
    var wrappedPrivateBitstamp = Async.wrap(privateBitstamp, ['user_transactions']);
    var jsonData = wrappedPrivateBitstamp.user_transactions(100000);
    bitstampJSONtoDB(jsonData, exchange);
  }
});