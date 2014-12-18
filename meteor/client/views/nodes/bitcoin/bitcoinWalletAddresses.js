Template.bitcoinWalletAddresses.helpers({
  addresses: function(){
	return this.addresses();
  },
  showAddress: function(address) {
    return (address.balance > 0);
  }
});