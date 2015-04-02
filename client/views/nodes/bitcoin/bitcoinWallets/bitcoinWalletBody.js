Template.bitcoinWalletBody.helpers({

  bitcoinwallets: function () {
    return BitcoinWallets.find().fetch();
  },
  dynamicTemplate: function() {
    if (this.action === "add") {
      return "newBitcoinWallet";
    }
    return "";
  },
  singleAddressess: function() {
    return this.singleAddresses();
  }
});

Template.bitcoinWalletBody.events({
  'click .delete-bitcoin-address': function () {
    return BitcoinAddresses.remove({
      _id: this._id
    });
  }
});
