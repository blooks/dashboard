Meteor.methods({
  addCoinbaseAccount: function(code) {
    var tokens = Coinbase.authorize(code);
    var user = Meteor.user();
    var coinbaseExchange = {};
    var exchangeCredentials = {
      exchange: "coinbase",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
    coinbaseExchange = {
      userId: user._id,
      label: "Coinbase",
      exchange: "coinbase",
      credentials: exchangeCredentials,
    };
    Exchanges.insert(coinbaseExchange);
  }
});
