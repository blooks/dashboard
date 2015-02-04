'use strict';

var bitcore = Meteor.npmRequire('bitcore');
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
  updateTx4Wallet: function (wallet) {
    //TODO: check if wallet exists, user is owner and can trigger update
    console.log("Updating a wallet");
    Dispatcher.wallet.update({walletId: wallet._id, userId: wallet.userId});
  },
  isValidBitcoinAddress: function (address) {
    return bitcore.Address.isValid(address);
  },
  isValidXPub: function (xpubkey) {
    return bitcore.HDPublicKey.isValidSerialized(xpubkey);
  }
});
