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
    Exchanges.upsert({"userId": user._id, "credentials.externalId": tokens.externalId}, { $set: coinbaseExchange });
  }
});
