Template.bitcoinWalletAddresses.helpers({
  addresses: function () {
    return this.addresses();
  },
  showAddress: function (address) {
    return (address.balance > 0);
  },
  singleAddressWallet: function () {
    return (this.hdseed === null || this.hdseed === undefined);
  }
});
