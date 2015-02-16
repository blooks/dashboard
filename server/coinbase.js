var Coinbase = Meteor.npmRequire('coinbase');

Meteor.methods({
  checkCoinbaseCredentials: function(APIKey, secret) {
    var coinbase = new Coinbase({
      APIKey: APIKey,
      APISecret: secret
    });
    var wrappedCoinbase = Async.wrap(coinbase, ["addresses", "authorization"]);
    try {
      wrappedCoinbase.addresses();
    } catch (err) {
      if (err.error === "API Key disabled") {
        return "deactivated";
      }
      console.log('Invalid API Keys');
      return "noaccess";
    }
    var auth = wrappedCoinbase.authorization();
    if (auth.scopes.length > 1 || auth.scopes.indexOf('addresses') < 0) {
      return "wrongpermissions";
    }
    return;
  }
});
