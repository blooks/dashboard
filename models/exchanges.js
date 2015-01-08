Exchanges.helpers({
  balances: function () {
    var result = [];
    var currencies = Meteor.settings.public.coyno.allowedCurrencies;
    var exchangeId = this._id;
    //Performance issue!
    currencies.forEach(function (currency) {
      var balance = 0.0;
      Trades.find({"venueId": exchangeId}).forEach(function (trade) {
        if (trade.buy.currency === currency) {
          balance += (trade.buy.amount - trade.buy.fee);
        }
        if (trade.sell.currency === currency) {
          balance -= (trade.sell.amount + trade.sell.fee);
        }
      });
      Transfers
        .find({
          $or: [
            {'details.inputs': {$elemMatch: {'nodeId': exchangeId}}},
            {'details.outputs': {$elemMatch: {'nodeId': exchangeId}}}
          ]
        })
        .forEach(function (transfer) {
          if (transfer.details.currency === currency) {
            transfer.details.inputs.forEach(function (input) {
              if (input.nodeId === exchangeId) {
                balance -= input.amount;
              }
            });
            transfer.details.outputs.forEach(function (output) {
              if (output.nodeId === exchangeId) {
                balance += output.amount;
              }
            });
          }
        });
      result.push({currency: currency, balance: balance});
    });
    return result;
  },
  update: function () {
    if (this.exchange === "Bitstamp") {
      Meteor.call('getBitstampData', this);
    }
    if (this.exchange === "Kraken") {
      Meteor.call('getKrakenData', this);
    }
  },
  logoUrl: function () {
    if (this.exchange === "Bitstamp") {
      return "/img/external-logos/Bitstamp_logo.png";
    }
    if (this.exchange === "Kraken") {
      return "/img/external-logos/Kraken-logo.png";
    }
    return "/img/exchange-icon-default-handshake.png";
  }
});
if (Meteor.isServer) {
  Exchanges.before.remove(function (userId, doc) {
    var trades = Trades.find({"venueId": doc._id});
    trades.forEach(function (trade) {
      Trades.remove({"_id": trade._id});
    });
    //TODO: @Levin: Important! Fix this! Bitcoin Balance Wrong!
    var transfers = Transfers.find({"venueId": doc._id});
    transfers.forEach(function (transfer) {
      Transfers.remove({"_id": transfer._id});
    });
  });
}
