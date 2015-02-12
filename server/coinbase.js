var Coinbase = Meteor.npmRequire('coinbase');

Meteor.methods({
  checkCoinbaseCredentials: function(APIKey, secret) {
    var coinbase = new Coinbase({
      APIKey: APIKey,
      APISecret: secret
    });
    var wrappedCoinbase = Async.wrap(coinbase, ["addresses"]);
    try {
      wrappedCoinbase.addresses();
    } catch (err) {
      console.log('Invalid API Keys');
      return "noaccess";
    }
    return;
  }
});
