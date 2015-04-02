
var Dispatcher = Meteor.npmRequire('coyno-dispatcher');

Meteor.methods({
  /**
   * Updating the wallet data. Getting all transactions for
   * the addresses in the wallet and pushing them to the database.
   * Then the balances get updated.
   * TODO: In case of a HD Wallet a certain buffer
   * size of non-used addresses has to be built.
   *
   * @param wallet
   */
  updateExchange: function (exchange) {
    Dispatcher.exchange.update({exchangeId: exchange._id, userId: exchange.userId});
  }
});
