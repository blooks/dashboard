Template.bitcoinWalletAddresses.helpers({
  addresses: function () {
    return this.addresses();
  },
  showAddress: function (address) {
    return (address.balance > 0);
  },
  singleAddressWallet: function (wallet) {
    console.log(wallet);
    var result = (wallet.type === 'Single Addresses');
    console.log(result);
    return result;
  }
});
