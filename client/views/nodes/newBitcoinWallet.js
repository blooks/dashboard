
Template.newBitcoinWallet.created = function() {
  this.newWalletStage = new ReactiveVar('first','');
  this.newWalletData = new ReactiveVar(false,'');
};

Template.newBitcoinWallet.helpers({
  areWeOnThisStage: function(s) {
    var stage = Template.instance().newWalletStage.get();
    return Template.instance().newWalletStage.get()===s;
  },
  getNewWalletData: function(s) {
    return Template.instance().newWalletData.get();
  }
});

Template.newBitcoinWallet.events({
  'click .wallet-thumbs': function (event,template) {
    // DGB 2015-01-20 06:57 There are better ways to get this data
    var wallet=$($(event.currentTarget).children()[1]).html()
    if (!(['Armory','Electrum','Bitcoin Wallet','Electrum'].indexOf(wallet) === -1)) {
      template.newWalletData.set({type:wallet}); 
      template.newWalletStage.set('second'); 
    }
  } 
});


