var KrakenClient = Meteor.npmRequire('kraken-api');


var krakenAssettoCoynoAsset = function (krakenAsset) {
  if (krakenAsset === "ZEUR") return "EUR";
  if (krakenAsset === "XXBT") return "BTC";
  return "Unkown";
};
var krakenTradeToTransaction = function(trade) {
  var currencydetails = {}
  var base_currency = 'EUR'
  var krakenIn = trade[0];
  var krakenOut = trade[1];
  //We assume Kraken always gives the inflow first, outflow second
  if (krakenIn.amount < 0) {
    krakenIn = trade[1];
    krakenOut = trade[0];
  }
    in_amount = krakenIn.amount-krakenIn.fee;
  currencydetails.in = {
          amount: in_amount, // Trim off the initial -
          currency: krakenAssettoCoynoAsset(krakenIn.asset),
          node: 'Kraken'
        }
    out_amount = -1*krakenOut.amount+krakenOut.fee;
        currencydetails.out = {
          amount: out_amount,
          currency: krakenAssettoCoynoAsset(krakenOut.asset),
          node: 'Kraken'
        }
        var baseAmount = in_amount;
        if (krakenOut.asset == base_currency) {
          baseAmount = out_amount;
        }
        currencydetails.base = {
          amount: baseAmount, 
          currency: base_currency
        };
        return currencydetails;
      };

var krakenDepositToTransaction = function(deposit) {
  var currencydetails = {};
  var base_currency = 'EUR';
  var currency = krakenAssettoCoynoAsset(deposit.asset);
  currencydetails.in = {
              amount: deposit.amount,
              currency: currency,
              node: 'Kraken'
              };
  var second_node = 'BankAccount';
  if (currency === 'BTC') {
    second_node = 'BitcoinWallet';
  }
            currencydetails.out = {
              amount: deposit.amount,
              currency: currency,
              node: second_node
            };
            currencydetails.base = {
              amount: 0,
              currency: base_currency
            };
    return currencydetails;
  };

var krakenWithdrawalToTransaction = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  var currency = krakenAssettoCoynoAsset(withdrawal.asset);
  //Hacky workaround to consider fees
  withdrawal_amount = -1*withdrawal.amount+withdrawal.fee;
  currencydetails.out = {
              amount: withdrawal_amount,
              currency: currency,
              node: 'Kraken'
              };
  var second_node = 'BankAccount';
  if (currency === 'BTC') {
    second_node = 'BitcoinWallet';
  }
            currencydetails.in = {
              amount: -1*withdrawal.amount,
              currency: currency,
              node: second_node
            };
            currencydetails.base = {
              amount: 0,
              currency: base_currency
            };
    return currencydetails;
  };

var krakenJSONtoDB = function(krakenData) { 
  var krakenDataLength = krakenData.length;

  //preconditioning. Kraken gives us ugly floatsies! Shoo floatsies!
  krakenData.forEach(function(transaction) {
    transaction.amount = parseInt(Math.round(parseFloat(transaction.amount)*100000000));
    transaction.fee = parseInt(Math.round(parseFloat(transaction.fee)*100000000));
  });


  var errors = [];
  for (i = 0; i < krakenDataLength; ++i) {
    try {
      var krakenTx = krakenData[i];
      var transaction = {};
      transaction.date = new Date(krakenTx.time*1000);//Milliseconds
      transaction.source = 'Kraken';
      transaction.userId = Meteor.userId();
      transaction.foreignId = Meteor.userId() + 'Kraken' + krakenTx.refid;
      var currencydetails = {};
      if (krakenTx.type === 'trade') {//trade consists of two json objects
        ++i;
        if (krakenData[i].refid !== krakenTx.refid) {
          console.log('Kraken not giving both sides of the trade!');
        }
        var krakenTrade = [krakenTx , krakenData[i]];
        currencydetails = krakenTradeToTransaction(krakenTrade);
      } else if (krakenTx.type === 'deposit') {//deposit
        currencydetails = krakenDepositToTransaction(krakenTx);
      } else if (krakenTx.type === 'withdrawal') {//withdrawal
        currencydetails = krakenWithdrawalToTransaction(krakenTx);
      } else {
        console.log("WARNING: Kraken returning unrecognized transactions!");
      } 
      transaction.in = currencydetails.in;
      transaction.out = currencydetails.out;
      transaction.base = currencydetails.base; 
      try {
        transactionId = Transactions.insert(transaction);
      } catch (e) {
        errors.push(e);
          //console.log(e);
      }
    }
    catch (e) {
      console.log('Some threw an error!');
      //console.log(e);
    }
  }
  return errors.length === 0;
};

Meteor.methods({
  getKrakenData: function () {
    var krakenAccounts = Exchanges.find({exchange: "Kraken"}).fetch();
    for (var i = 0; i < krakenAccounts.length; ++i) {
      var account = krakenAccounts[i];
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
      var security_loop_counter = 0;
      while (krakenData.length < numberOfKrakenTrades && security_loop_counter < 10) {//making sure we get ALL the transactions from Kraken
        for (var entry in apiDataPackage.result.ledger) {
          var newKrakenTransaction = apiDataPackage.result.ledger[entry];
          if (entry !== ledgerIdOfLastEntry) {
          krakenData.push(newKrakenTransaction);
        } 
        ledgerIdOfLastEntry = entry;
        }
        apiDataPackage = syncApiCall('Ledgers', {end: ledgerIdOfLastEntry});
        ++security_loop_counter;
      }
      if (krakenData.length != numberOfKrakenTrades) {
        console.log("Warning: Not all or even more Trades extracted than reported by Kraken!");
        console.log("Number of extracted trades: " + krakenData.length);
        console.log("Number of Kraken Trades: " + numberOfKrakenTrades);
      }
      //console.log(krakenData);
      krakenJSONtoDB(krakenData);
    }
  }
});