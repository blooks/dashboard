var Coinbase = Meteor.npmRequire('coinbase');

Meteor.methods({
  addCoinbaseAccount: function(code) {
    console.log(code);
  }
});
