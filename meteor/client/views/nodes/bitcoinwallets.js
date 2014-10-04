Template.bitcoinWallets.helpers({
  bitcoinwallets: function(){
		return BitcoinWallets.find().fetch();
  }
});

Template.bitcoinWallets.events({
  'click .delete-bitcoin-wallet': function(event, template) {
    return BitcoinWallets.remove({
      _id: this._id
    });
  }
});