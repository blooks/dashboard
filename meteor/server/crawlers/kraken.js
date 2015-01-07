var Kraken = Meteor.npmRequire('kraken-api');

var krakenJSONtoDB = function (krakenData, exchange) {
  var baseCurrency = 'EUR';

  //Helper function to translate awkward kraken naming.
  var krakenAssetToCoynoAsset = function (krakenAsset) {
    if (krakenAsset === "ZEUR") {
      return "EUR";
    }
    if (krakenAsset === "XXBT") {
      return "BTC";
    }
    return "Altcoin";
  };

  var krakenTradeToTradeDetails = function (tradepart1, tradepart2) {
    var tradedetails = {};
    var krakenBuy = tradepart1;
    var krakenSell = tradepart2;
    //We assume Kraken always gives the inflow first, outflow second.
    //If this is wrong we swap them trades here
    if (krakenBuy.amount < 0) {
      krakenBuy = tradepart2;
      krakenSell = tradepart1;
    }
    tradedetails.buy = {
      amount: krakenBuy.amount,
      currency: krakenAssetToCoynoAsset(krakenBuy.asset),
      fee: krakenBuy.fee
    };
    var absSellAmount = Math.abs(krakenSell.amount);
    tradedetails.sell = {
      amount: absSellAmount,
      currency: krakenAssetToCoynoAsset(krakenSell.asset),
      fee: krakenSell.fee
    };
    return tradedetails;
  };

  var krakenDepositToTransfer = function (deposit, exchange) {
    var transfer = {};
    transfer.date = new Date(deposit.time * 1000);//Milliseconds
    transfer.sourceId = exchange._id;
    transfer.userId = Meteor.userId();
    transfer.foreignId = Meteor.userId() + exchange._id + deposit.refid;
    var currency = krakenAssetToCoynoAsset(deposit.asset);
    var transferdetails = {
      inputs: [],
      outputs: [],
      currency: currency
    };
    transferdetails.inputs.push({
      amount: deposit.amount,
      nodeId: Meteor.user().profile.dummyNodeIds[currency]
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
    });
    transfer.details = transferdetails;
    try {
      Transfers.insert(transfer);
    }
    catch (e) {
      console.log(e);
    }
  };

  var krakenWithdrawalToTransfer = function (withdrawal, exchange) {
    var transfer = {};
    transfer.date = new Date(withdrawal.time * 1000);//Milliseconds
    transfer.sourceId = exchange._id;
    transfer.userId = Meteor.userId();
    transfer.foreignId = Meteor.userId() + exchange._id + withdrawal.refid;
    var currency = krakenAssetToCoynoAsset(withdrawal.asset);
    var transferdetails = {
      inputs: [],
      outputs: [],
      currency: currency
    };
    var absWithdrawalAmount = Math.abs(withdrawal.amount);
    transferdetails.inputs.push({
      amount: absWithdrawalAmount + withdrawal.fee,
      nodeId: exchange._id
    });
    if (withdrawal.fee > 0) {
      transferdetails.outputs.push({
        amount: withdrawal.fee
      });
    }
    transferdetails.outputs.push({
      amount: absWithdrawalAmount,
      nodeId: Meteor.user().profile.dummyNodeIds[currency]
    });
    transfer.details = transferdetails;
    try {
      Transfers.insert(transfer);
    }
    catch (e) {
      console.log(e);
    }
  };

  var krakenTradeToTrade = function (firstPart, secondPart) {
    //Trade on Kraken involving only unknown currencies
    if (
      (krakenAssetToCoynoAsset(firstPart.asset) === "Unknown") &&
      (krakenAssetToCoynoAsset(secondPart.asset) === "Unknown")) {
      return;
    }
    var trade = {};
    trade.foreignId = Meteor.userId() + exchange._id + firstPart.refid;
    trade.userId = Meteor.userId();
    trade.date = new Date(firstPart.time * 1000);//Milliseconds
    trade.venueId = exchange._id;

    var tradeDetails = krakenTradeToTradeDetails(firstPart, secondPart);
    trade.buy = tradeDetails.buy;
    trade.sell = tradeDetails.sell;
    try {
      Trades.insert(trade);
    }
    catch (e) {
      console.log(e);
    }
  };


  var krakenDataLength = krakenData.length;

  //preconditioning. Kraken gives us ugly floatsies! Shoo floatsies!
  krakenData.forEach(function (transaction) {
    transaction.amount = parseInt(
      Math.round(parseFloat(transaction.amount) * 100000000));
    transaction.fee = parseInt(
      Math.round(parseFloat(transaction.fee) * 100000000));
  });
  for (var i = 0; i < krakenDataLength; ++i) {
    try {
      var krakenTx = krakenData[i];
      switch (krakenTx.type) {
        case 'trade':
          ++i;
          if (krakenData[i].refid !== krakenTx.refid) {
            console.log('Kraken not giving both sides of the trade!');
          }
          krakenTradeToTrade(krakenTx, krakenData[i]);
          break;
        case 'deposit':
          //We ignore unknown currency deposits
          if (krakenAssetToCoynoAsset(krakenTx.asset) !== "Unknown") {
            krakenDepositToTransfer(krakenTx, exchange);
          }
          break;
        case 'withdrawal':
          //We ignore unknown currency withdrawals
          if (krakenAssetToCoynoAsset(krakenTx.asset) !== "Unknown") {
            krakenWithdrawalToTransfer(krakenTx, exchange);
          }
          break;
      }
    }
    catch (e) {
      console.log('Some threw an error!');
      console.log(e);
    }
  }
};

Meteor.methods({
  getKrakenData: function (exchange) {
    var key = exchange.credentials.APIKey;
    var secret = exchange.credentials.secret;
    var krakenClient = new Kraken(key, secret);
    var syncKrakenClient = Async.wrap(krakenClient, ['api']);
    var unixStartStamp = new Date(0).getTime();
    var apiDataPackage = syncKrakenClient.api('Ledgers', {});
    //turn JSON Object to array
    var numberOfKrakenTrades = apiDataPackage.result.count;
    var krakenData = [];
    var ledgerIdOfLastEntry = "";
    var securityLoopCounter = 0;
    //TODO: Better not use such a cheap hack to exit the loop.
    while (
      krakenData.length < numberOfKrakenTrades &&
      securityLoopCounter < 100000000) {
        for (var entry in apiDataPackage.result.ledger) {

          var newKrakenTransaction = apiDataPackage.result.ledger[entry];
          if (entry !== ledgerIdOfLastEntry) {
            krakenData.push(newKrakenTransaction);
          }
          ledgerIdOfLastEntry = entry;
        }
        apiDataPackage = syncKrakenClient.api('Ledgers',
          {end: ledgerIdOfLastEntry});
        ++securityLoopCounter;
    }
    if (krakenData.length !== numberOfKrakenTrades) {
      console.log("Warning: Not all or even more Trades extracted" +
      " than reported by Kraken!");
      console.log("Number of extracted trades: " + krakenData.length);
      console.log("Number of Kraken Trades: " + numberOfKrakenTrades);
    }
    krakenJSONtoDB(krakenData, exchange);
  }
});
