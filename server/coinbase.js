Meteor.methods({
  addCoinbaseAccount: function(code) {
    var tokens = Coinbase.authorize(code);
    var user = Meteor.user();
    var coinbaseExchange = {};
    var exchangeCredentials = {
      exchange: "coinbase",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      externalId: tokens.externalId
    };
    coinbaseExchange = {
      userId: user._id,
      label: tokens.userName,
      exchange: "coinbase",
      credentials: exchangeCredentials,
    };
    var exchanges = Exchanges.find({"userId": user._id, "credentials.externalId": tokens.externalId}).fetch();
    if (exchanges.length > 0) {
      var exchange = exchanges[0];
      var newId = Exchanges.update({_id: exchange._id}, {$set : coinbaseExchange});
      Exchanges.findOne({_id: exchange._id}).update();
    } else {
      Exchanges.insert(coinbaseExchange);
    }
  },
  coinbaseId: function() {
    return process.env.COINBASE_ID;
  }
});
