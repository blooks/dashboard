'use strict';

var bitcore = Meteor.npmRequire('bitcore');
var Dispatcher = Meteor.npmRequire('coyno-dispatcher');

Meteor.methods({
  /**
   * Updating the wallet data. Getting all transactions for
   * the addresses in the wallet and pushing them to the database.
   * Then the balances get updated.
   * size of non-used addresses has to be built.
   *
   * @param wallet
   */
  updateTx4Wallet: function (wallet) {
    //TODO: check if wallet exists, user is owner and can trigger update
    wallet = BitcoinWallets.findOne({_id: wallet._id});
    if (wallet) {
      if (wallet.superNode) {
        if (wallet.superNode.nodeType === 'exchange') {
          var exchange = Exchanges.findOne({_id: wallet.superNode.id});
          if (exchange) {
            exchange.update();
          }
        }
      } else {
        BitcoinWallets.update({_id: wallet._id}, {$set: {updating: true}});
        Dispatcher.wallet.update({walletId: wallet._id, userId: wallet.userId});
      }
    }
  },
  isValidBitcoinAddress: function (address) {
    if (!bitcore.Address.isValid(address)) {
      return "invalidFormat";
    }
    if (BitcoinAddresses.findOne({userId: this.userId, address: address})) {
      return "duplicate";
    }
    return;
  },
  isValidXPub: function (xpubkey) {
    return bitcore.HDPublicKey.isValidSerialized(xpubkey);
  }
});
