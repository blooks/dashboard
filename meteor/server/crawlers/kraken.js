var Kraken = Meteor.npmRequire('kraken-api');


var krakenAssettoCoynoAsset = function (krakenAsset) {
  if (krakenAsset === "ZEUR") return "EUR";
  if (krakenAsset === "XXBT") return "BTC";
  return "Unkown";
};
var krakenTradeToTradeDetails = function(tradepart1, tradepart2, exchange) {
  var tradedetails = {}
  var base_currency = 'EUR'
  var krakenBuy = tradepart1;
  var krakenSell = tradepart2;
  //We assume Kraken always gives the inflow first, outflow second
  if (krakenBuy.amount < 0) {
    krakenBuy = tradepart2;
    krakenSell = tradepart1;
  }
  tradedetails.buy = {
    amount: krakenBuy.amount, // Trim off the initial -
    currency: krakenAssettoCoynoAsset(krakenBuy.asset),
    fee: krakenBuy.fee
  }
  abs_sell_amount = Math.abs(krakenSell.amount);
  tradedetails.sell = {
    amount: abs_sell_amount,
    currency: krakenAssettoCoynoAsset(krakenSell.asset),
    fee: krakenSell.fee
  }
  return tradedetails;
};

var krakenDepositToTransfer = function(deposit, exchange) {
  var transfer = {};
  transfer.date = new Date(deposit.time*1000);//Milliseconds
  transfer.sourceId = exchange._id;
  transfer.userId = Meteor.userId();
  transfer.foreignId = Meteor.userId() + exchange._id + deposit.refid;
  var base_currency = 'EUR';
  var currency = krakenAssettoCoynoAsset(deposit.asset);
  var transferdetails = {
    inputs : [],
    outputs : [],
    currency : currency
  };
  transferdetails.inputs.push({
    amount: deposit.amount
  });
  if (deposit.fee > 0) {
    transferdetails.outputs.push({
      amount: deposit.fee,
      nodeId: exchange._id
    });
  }
  transferdetails.outputs.push({
    amount: deposit.amount,
    nodeId: exchange._id
  })
  transfer.details = transferdetails;
  try {
    transactionId = Transfers.insert(transfer);
  } catch (e) {
    //console.log(e);
  }
};

var krakenWithdrawalToTransfer = function(withdrawal, exchange) {
  var transfer = {};
  transfer.date = new Date(withdrawal.time*1000);//Milliseconds
  transfer.sourceId = exchange._id;
  transfer.userId = Meteor.userId();
  transfer.foreignId = Meteor.userId() + exchange._id + withdrawal.refid;
  var base_currency = 'EUR';
  var currency = krakenAssettoCoynoAsset(withdrawal.asset);
  var transferdetails = {
    inputs : [],
    outputs : [],
    currency : currency
  };
  abs_withdrawal_amount = Math.abs(withdrawal.amount);
  transferdetails.inputs.push({
    amount: abs_withdrawal_amount+withdrawal.fee,
    nodeId: exchange._id
  });
  if (withdrawal.fee > 0) {
    transferdetails.outputs.push({
      amount: withdrawal.fee
    });
  }
  transferdetails.outputs.push({
    amount: abs_withdrawal_amount,
  })
  transfer.details = transferdetails;
    try {
    transferId = Transfers.insert(transfer);
  } catch (e) {
    //console.log(e);
  }
};

var krakenTradeToTrade = function(firstPart, secondPart, exchange) {
  var trade = {};
  trade.date = new Date(firstPart.time*1000);//Milliseconds
  trade.source = 'Kraken';
  trade.userId = Meteor.userId();
  trade.foreignId = Meteor.userId() + exchange._id + firstPart.refid;
  trade.venueId = exchange._id;
  var tradeDetails = krakenTradeToTradeDetails(firstPart, secondPart, exchange);
  trade.buy = tradeDetails.buy;
  trade.sell = tradeDetails.sell;
  try {
    tradeId  = Trades.insert(trade);
  } catch (e) {
    //console.log(e);
  }
}


var krakenJSONtoDB = function(krakenData, exchange) { 
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
      if (krakenTx.type === 'trade') {//trade consists of two json objects
        ++i;
        if (krakenData[i].refid !== krakenTx.refid) {
          console.log('Kraken not giving both sides of the trade!');
        }
        krakenTradeToTrade(krakenTx, krakenData[i], exchange);
      } else if (krakenTx.type === 'deposit') {//deposit
        krakenDepositToTransfer(krakenTx, exchange);
      } else if (krakenTx.type === 'withdrawal') {//withdrawal
        krakenWithdrawalToTransfer(krakenTx, exchange);
      } else {
        console.log("WARNING: Kraken returning unrecognized transactions!");
      };
    }
    catch (e) {
      console.log('Some threw an error!');
      //console.log(e);
    }
  }
  return errors.length === 0;
};

Meteor.methods({
  getKrakenData: function (exchange) {
    var key = exchange.credentials.APIKey;
    var secret = exchange.credentials.secret;syncKrakenClient
    var krakenClient = new Kraken(key, secret);
    var syncKrakenClient = Async.wrap(krakenClient, ['api']);
    var unixStartStamp = new Date(0).getTime();
    var apiDataPackage = syncKrakenClient.api('Ledgers', {});
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
      apiDataPackage = syncKrakenClient.api('Ledgers', {end: ledgerIdOfLastEntry});
      ++security_loop_counter;
    }
    if (krakenData.length != numberOfKrakenTrades) {
      console.log("Warning: Not all or even more Trades extracted than reported by Kraken!");
      console.log("Number of extracted trades: " + krakenData.length);
      console.log("Number of Kraken Trades: " + numberOfKrakenTrades);
    }
    krakenJSONtoDB(krakenData, exchange);
  }
});