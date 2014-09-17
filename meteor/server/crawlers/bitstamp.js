var Bitstamp = Meteor.require('bitstamp');

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


var bitstampJSONtoDB = function(bitstampData) {
  console.log(bitstampData.length); 
  var errors = [];
  for (i = 0; i < bitstampData.length; ++i) {
    var entry = bitstampData[i];
    var transaction = {};
    transaction.date = new Date(entry.datetime);
    transaction.source = 'Bitstamp'
    transaction.userId = Meteor.userId()
    if (entry.type === 2) {//trade 
        if (entry.btc.substr(0,1) === '-' ) {// trade is a sale of bitcoin for USD
          transaction.in = {
          amount: entry.btc.substr(1), // Trim off the initial -
          currency: 'BTC'
        }
        transaction.out = {
          amount: entry.usd,
          currency: 'USD'
        }
        transaction.base = calculateBaseAmount({amount: entry.usd, currency: 'USD'}, transaction.date);
      }
      else {
        transaction.in = {
          amount: entry.usd.substr(1), // Trime off the initial -
          currency: 'USD'
        };
        transaction.out = {
          amount: entry.btc,
          currency: 'BTC'
        };
        transaction.base = calculateBaseAmount({
          amount: entry.usd.substr(1),
          currency: 'USD'
        }, transaction.date);
      }
        } else if (entry.type === 0) {//deposit
          if (entry.btc === '0.00000000') {
            transaction["in"] = {
              amount: entry.usd,
              currency: 'USD'
            };
            transaction.out = calculateBaseAmount({
              amount: entry.usd,
              currency: 'USD'
            }, transaction.date);
            transaction.base = calculateBaseAmount({
              amount: entry.usd,
              currency: 'USD'
            }, transaction.date);
          }
        } else if (entry.type === 1) {//withdrawel
          if (entry.btc === '0.00000000') {//Dollar withdrawel
            transaction["in"] = calculateBaseAmount({
              amount: entry.usd.substr(1),
              currency: 'USD'
            }, transaction.date);
            transaction.out = {
              amount: entry.usd.substr(1),
              currency: 'USD'
            };
            transaction.base = calculateBaseAmount({
              amount: entry.usd.substr(1),
              currency: 'USD'
            }, transaction.date);
          } 
          }
          try {
            transactionId = Transactions.insert(transaction);
              } catch (_error) {
            e = _error;
               errors.push(e);
        }
    }
  return errors.length === 0;
    };

    var asyncGetBitstampData = function(privateBitstamp, callback) {
      return privateBitstamp.user_transactions(1000, function(jsonData){
        console.log(jsonData);
      });
    };



    var syncGetBitstampData = Meteor._wrapAsync(asyncGetBitstampData);

    Meteor.methods({
      getBitstampData: function () {
        var bitstamp = new Bitstamp;
        var profile = Meteor.user().profile;
        var key = profile.bitstampAPIKey;
        var secret = profile.bitstampSecret;
        var client_id = profile.bitstampUserId;
        var privateBitstamp = new Bitstamp(key, secret, client_id);
        var wrappedPrivateBitstamp = Async.wrap(privateBitstamp, ['user_transactions']);
        var jsonData = wrappedPrivateBitstamp.user_transactions(1000);
        bitstampJSONtoDB(jsonData);
      }
    });