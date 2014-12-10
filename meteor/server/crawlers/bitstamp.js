var Bitstamp = Meteor.npmRequire('bitstamp');

//Patching Bitstamp NPM Module ; TODO: REMOVE when NPM Bitstamp Update to 1.0.9
Bitstamp.prototype.user_transactions = function(limit, callback) {
  if(!callback) {
    callback = limit;
    limit = undefined;
  }
  this._post('user_transactions', callback, {limit: limit});
};

var bitstampTradeToTrade = function(trade) {
  var currencydetails = {};
  var dollar_amount = 0;
   if (trade.btc < 0 ) {// trade is a sale of BTC for USD
          currencydetails.sell = {
          amount: Math.abs(trade.btc),
          currency: 'BTC',
          fee: 0
        };
        currencydetails.buy = {
          amount: trade.usd,
          currency: 'USD',
          fee: trade.fee
        };
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
    var base_amount = Coynverter.calculateBaseAmount(deposit.usd, 'USD', deposit.datetime);;
    currencydetails.sell = {
      amount: base_amount,
      currency: base_currency,
      fee: 0
    };
  } else {
    //Bitcoin Deposit is a transfer
    console.log("Warning: You want to make a Bitstamp bitcoin deposit a trade. Simon says No!");
  }
  return currencydetails;
};

var bitstampDepositToTransfer = function(deposit, exchange) {
  var transferdetails = {
    inputs: [],
    outputs: []
  };
  var base_currency = 'EUR';
  if (deposit.btc > 0) {//Bitcoin deposit
    transferdetails.inputs.push({
      amount: deposit.btc,
      nodeId: Meteor.user().profile.dummyNodeIds['BTC']
    });
    transferdetails.outputs.push({
      amount: deposit.btc,
      nodeId: exchange._id
    });
    transferdetails.currency = 'BTC'
  } else {//Dollar deposit

    var base_amount = Coynverter.calculateBaseAmount(deposit.usd, 'USD', deposit.datetime);;
    transferdetails.inputs.push({
      amount: base_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['EUR']
    });
    transferdetails.outputs.push({
      amount: base_amount,
      nodeId: exchange._id
    });
    transferdetails.currency = 'EUR'
  }
  return transferdetails;
};


var bitstampRippleDepositToTrade = function(deposit) {
  var currencydetails = {};
  var base_currency ='EUR';
  if (deposit.usd > 0) {//Dollar deposit
    currencydetails.buy = {
      amount: deposit.usd,
      currency: 'USD',
      fee: 0
    };
    base_amount = Coynverter.calculateBaseAmount(deposit.usd, 'USD', deposit.datetime);
    currencydetails.sell = {
      amount: base_amount,
      currency: base_currency,
      fee: 0
    }
  } else {//bitcoin deposit
    currencydetails.buy = {
      amount: deposit.btc,
      currency: 'BTC',
      fee: 0
    };
    var base_amount = Coynverter.calculateBaseAmount(deposit.btc, 'BTC', deposit.datetime);
    currencydetails.sell = {
      amount: base_amount,
      currency: base_currency,
      fee: 0
    };
  }
  return currencydetails;
};

var bitstampWithdrawalToTrade = function(withdrawal) {
  var currencydetails = {};
  var base_currency = 'EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawal
    var dollar_amount = Math.abs(withdrawal.usd);
    var base_amount = Coynverter.calculateBaseAmount(dollar_amount, 'USD', withdrawal.datetime);
    currencydetails.sell = {
      amount: dollar_amount,
      currency: 'USD',
      fee: 0
    };;
    currencydetails.buy = {
      amount: base_amount,
      currency: base_currency,
      fee: 0
    };
  } else {
    //Bitcoin Withdrawal is a transfer
    console.log("Warning: You want to make a Bitstamp bitcoin withdrawal a trade. Simon says No!");
  }
  return currencydetails;
};


var bitstampWithdrawalToTransfer = function(withdrawal, exchange) {
  var transferdetails = {
    inputs: [],
    outputs: []
  };
  var base_currency = 'EUR';
  if (withdrawal.btc < 0) {//Bitcoin withdrawal
    var bitcoin_amount = Math.abs(withdrawal.btc);
    transferdetails.inputs.push({
      amount: bitcoin_amount,
      nodeId: exchange._id
    });
    transferdetails.outputs.push({
      amount: bitcoin_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['BTC']
    });
    transferdetails.currency = 'BTC'
  } else {//Dollar withdrawal

    var dollar_amount = Math.abs(withdrawal.usd);
    var base_amount = Coynverter.calculateBaseAmount(dollar_amount, 'USD', withdrawal.datetime);
    transferdetails.inputs.push({
      amount: base_amount,
      nodeId: exchange._id
    });
    transferdetails.outputs.push({
      amount: base_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['EUR']
    });
    transferdetails.currency = base_currency;
  }
  return transferdetails;
};

var bitstampRippleWithdrawalToTransfer = function(withdrawal, exchange) {
  var transferdetails = {
    inputs: [],
    outputs: []
  };
  var base_currency = 'EUR';
  if (withdrawal.btc < 0) {//Bitcoin withdrawal
    var bitcoin_amount = Math.abs(withdrawal.btc);
    var base_amount = Coynverter.calculateBaseAmount(bitcoin_amount, 'BTC', withdrawal.datetime);
    transferdetails.inputs.push({
      amount: base_amount,
      nodeId: exchange._id
    });
    transferdetails.outputs.push({
      amount: base_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['Ripple']
    });
    transferdetails.currency = 'EUR'
  } else {//Dollar withdrawal
    var dollar_amount = Math.abs(withdrawal.usd);
    var base_amount = Coynverter.calculateBaseAmount(dollar_amount, 'USD', withdrawal.datetime);
    transferdetails.inputs.push({
      amount: base_amount,
      nodeId: exchange._id
    });
    transferdetails.outputs.push({
      amount: base_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['EUR']
    });
    transferdetails.currency = base_currency;
  }
  return transferdetails;
};

var bitstampRippleDepositToTransfer = function(deposit, exchange) {
  var transferdetails = {
    inputs: [],
    outputs: []
  };
  var base_currency = 'EUR';
  if (deposit.btc > 0) {//Bitcoin deposit
    var base_amount = Coynverter.calculateBaseAmount(deposit.btc, 'BTC', deposit.datetime);
    transferdetails.outputs.push({
      amount: base_amount,
      nodeId: exchange._id
    });
    transferdetails.inputs.push({
      amount: base_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['EUR']
    });
    transferdetails.currency = 'EUR'
  } else {//Dollar deposit
    var base_amount = Coynverter.calculateBaseAmount(deposit.usd, 'USD', deposit.datetime);
    transferdetails.outputs.push({
      amount: base_amount,
      nodeId: exchange._id
    });
    transferdetails.inputs.push({
      amount: base_amount,
      nodeId: Meteor.user().profile.dummyNodeIds['EUR']
    });
    transferdetails.currency = base_currency;
  }
  return transferdetails;
};




var bitstampRippleWithdrawalToTrade = function(withdrawal) {
  var currencydetails = {};
  var base_currency ='EUR';
  if (withdrawal.usd < 0) {//Dollar withdrawal
    var dollar_amount = Math.abs(withdrawal.usd);
    currencydetails.sell = {
      amount: dollar_amount,
      currency: 'USD', 
      fee: 0
    };
    base_amount = Coynverter.calculateBaseAmount(dollar_amount, 'USD', withdrawal.datetime);;
    currencydetails.buy = {
      amount: base_amount,
      currency: base_currency, 
      fee: 0
    }
  } else {//bitcoin withdrawal
    var bitcoin_amount = Math.abs(withdrawal.btc);
    currencydetails.sell = {
      amount: bitcoin_amount,
      currency: 'BTC',
      fee: 0
    };
    var base_amount = Coynverter.calculateBaseAmount(bitcoin_amount, 'BTC', withdrawal.datetime);
    currencydetails.buy = {
      amount: base_amount,
      currency: base_currency,
      fee: 0
    };
  }
  return currencydetails;
};

var addBitstampTxToTransfers = function(bitstampTx, exchange) {
  
  //Storing errors
  var errors = [];

  if (bitstampTx.type === 2) return; //trade not transfer

  //Create empty transfer
  var transfer = {};

  //initialise basic values
  transfer.date = bitstampTx.datetime;
  transfer.userId = Meteor.userId();
  transfer.foreignId = Meteor.userId() + exchange._id + bitstampTx.id;
  
  //new transferdetails object
  var transferdetails = {};

  //fill it depending on type of transaction
  switch (bitstampTx.type) {
    case 0: //deposit
    {
      transferdetails = bitstampDepositToTransfer(bitstampTx, exchange);
    }
      break;
    case 1://withdrawal
    {
      transferdetails = bitstampWithdrawalToTransfer(bitstampTx, exchange);
    }
      break;
    case 3://rippleWithdrawal
    {
      transferdetails = bitstampRippleWithdrawalToTransfer(bitstampTx, exchange);
    }
      break;
    case 4:
    {
      transferdetails = bitstampRippleDepositToTransfer(bitstampTx, exchange);
    }
      break;
  }

  //Putting stuff together and throwing it in the DBc
  transfer.details = transferdetails;
  transfer.sourceId = exchange._id;
  try {
    Transfers.insert(transfer);
  } catch (e) {
    errors.push(e);
    console.log(e);
    //console.log(transfer);
  }
  return errors.length === 0;
};

//Accepting ONLY API Style JSON objects.
var addBitstampTxToTrades = function(bitstampTx, exchange) {

  //storing errors
  var errors = [];

  if (bitstampTx.type === 0 && bitstampTx.btc > 0) return; //bitcoin deposit is a transfer, not a trade
  if (bitstampTx.type === 1 && bitstampTx.btc < 0) return; //bitcoin withdrawal is a transfer, not a trade

  //create empty trade
  var trade = {};

  //initialise basic values
  trade.date = bitstampTx.datetime;
  trade.userId = Meteor.userId();
  trade.foreignId = Meteor.userId() + exchange._id + bitstampTx.id;

  //Empty currencydetails object.
  var currencydetails = {};

  //Filling the currencydetails object dependent on type of transaction
  if (bitstampTx.type === 2) {//trade
    currencydetails = bitstampTradeToTrade(bitstampTx);
  } else if (bitstampTx.type === 0) {//deposit
    currencydetails = bitstampDepositToTrade(bitstampTx);
  } else if (bitstampTx.type === 1) {//withdrawal of dollars
    currencydetails = bitstampWithdrawalToTrade(bitstampTx);
  }  else if (bitstampTx.type === 3) {//ripple withdrawel
    currencydetails = bitstampRippleWithdrawalToTrade(bitstampTx);
  } else if (bitstampTx.type === 4) {//ripple deposit
    currencydetails = bitstampRippleDepositToTrade(bitstampTx);
  } else {//If this triggers something went wrong. What could it be?
    console.log("Warning when adding Bitstamp Trade: Unknown type: " + type);
  }
  trade.buy = currencydetails.buy;
  trade.sell = currencydetails.sell;
  trade.venueId = exchange._id;
  try {
    var tradeId = Trades.insert(trade);
  } catch (_error) {
    var e = _error;
    errors.push(e);
    console.log(e);
    //console.log(trade);
  }
  return errors.length === 0;
};



var bitstampJSONtoDB = function(bitstampData, exchange) { 

  for (var i = 0; i < bitstampData.length; ++i) {
    var bitstampTx = bitstampData[i];

    //Fixing date format
    bitstampTx.datetime = new Date(bitstampTx.datetime);

    //preconditioning. Bitstamp gives float-style-strings for amounts
    bitstampTx.usd = parseInt(Math.round(parseFloat(bitstampTx.usd)*100000000));
    bitstampTx.btc = parseInt(Math.round(parseFloat(bitstampTx.btc)*100000000));
    bitstampTx.fee = parseInt(Math.round(parseFloat(bitstampTx.fee)*100000000));


    addBitstampTxToTrades(bitstampTx, exchange);
    addBitstampTxToTransfers(bitstampTx, exchange);
  }
};



Meteor.methods({
  getBitstampData: function (exchange) {
    var key = exchange.credentials.APIKey;
    var secret = exchange.credentials.secret;
    var client_id = exchange.credentials.userName;
    var privateBitstamp = new Bitstamp(key, secret, client_id);
    var wrappedPrivateBitstamp = Async.wrap(privateBitstamp, ['user_transactions']);
    var jsonData = wrappedPrivateBitstamp.user_transactions(1000);
    console.log("Got " + jsonData.length + " transactions from Bitstamp");
    bitstampJSONtoDB(jsonData, exchange);
  }
});