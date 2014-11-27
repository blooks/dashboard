Template.bitcoinWalletAddresses.helpers({
  addresses: function(){
	return this.addresses();
  },
  showAddress: function(address) {
    return true; //(address.balance > 0);
  }
});