Template.bitcoinWallets.helpers({
  bitcoinwallets: function(){
    return BitcoinWallets.find().fetch();
  }
});