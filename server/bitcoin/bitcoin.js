'use strict';

var bitcore = Meteor.npmRequire('bitcore');
var Dispatcher = Meteor.npmRequire('coyno-dispatcher');

/**
 * Creates Coynoaddresses out of strings and puts them in the Database
 * It adds addresses again if the are already in the DB.
 * TODO: The latter is a bug! See below.
 *
 * @param {[String]} addresses array of strings giving addresses
 * @param {BitcoinWallets} wallet the wallet these addresses belong to
 */
var addAddressesToWallet = function (addresses, wallet) {
  addresses.forEach(function (address) {
    var coynoAddress = {
      userId: Meteor.userId(),
      walletId: wallet._id,
      address: address
    };
    try {
      //TODO: Correct this bug. Addresses are added even
      // if they are already in the wallet!
      BitcoinAddresses.insert(coynoAddress);
    } catch (e) {
      console.log(e);
      //console.log(transfer);
    }
  });
};

/**
 * Updates a wallet in BIP32 style
 * Assumes: wallet.type is BIP32 and the wallet.hdseed is a valid seed
 * TODO: Do not only query for the first 100 addresses but all
 * TODO: addresses that could have been used.
 *
 * @param wallet
 */
var updateBIP32Wallet = function (wallet) {
  var HDPublicKey = bitcore.HDPublicKey;
    var Address = bitcore.Address,
    knownMasterPublicKey = wallet.hdseed,
    masterPubKey = new HDPublicKey(knownMasterPublicKey),
    addresses = [];
  for (var i = 0; i < 100; ++i) {
    addresses.push(
      Address.fromPublicKey(
        masterPubKey.derive("m/0/" + i.toString()).publicKey
      ).toString());
    addresses.push(
      Address.fromPublicKey(
        masterPubKey.derive("m/1/" + i.toString()).publicKey
      ).toString());
  }
  addAddressesToWallet(addresses, wallet);
  Dispatcher.wallet.update({walletId: wallet._id, userId: wallet.userId});
};

/**
 * Gets and stores all transactions for the addresses in the
 * single Addresses Wallet to the Database. An balance Update
 * for the wallet is called in the end.
 * @param wallet
 */
var updateSingleAddressWallet = function (wallet) {
  var schemaWallet = BitcoinWallets.findOne({"_id": wallet._id});
  var addresses = [];
  schemaWallet.addresses().forEach(function (address) {
    addresses.push(address.address);
    console.log(address.address);
  });
  addAddressesToWallet(addresses, wallet);
  Dispatcher.wallet.update({walletId: wallet._id, userId: wallet.userId});
};

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
    switch (wallet.type) {
      case 'electrum':
        Dispatcher.wallet.update({walletId: wallet._id, userId: wallet.userId});
        break;
      case 'bitcoin-wallet':
        updateBIP32Wallet(wallet);
        break;
      case 'single-addresses':
        updateSingleAddressWallet(wallet);
        break;
      case 'armory':
        Dispatcher.wallet.update({walletId: wallet._id, userId: wallet.userId});
        break;
    }
  },
  isValidBitcoinAddress: function (address) {
    return bitcore.Address.isValid(address);
  }
});
