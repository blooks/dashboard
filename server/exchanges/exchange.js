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
    if (exchange) {
      exchange = Exchanges.findOne({_id: exchange._id});
      if (exchange) {
        exchange.update();
      }
    }
  }
});
