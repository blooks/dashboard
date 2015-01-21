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
  },
  getLogoImageFromWalletType: function(s) {
    if (s==='Single Address') return '/img/wallet-icon-default.png' 
    return '/img/external-logos/' + s.replace(/\s/g, '-').toLowerCase() + '-logo.png';
  },
  isElectrum: function() {
    return (this.type==='Electrum')
  },
  isBitcoinWallet: function() {
    return (this.type==='Bitcoin Wallet')
  },
  getWalletFormatFromWalletType: function(s) {
    // DGB 2015-01-21 08:33 We need to think of a more elegant way to make this
    // less fragile, otherwise a change on the config.coffee file may break the
    // site
    if (s==='Bitcoin Wallet') return 'BIP32';
    if (s==='Single Address') return 'Single Addresses';
    return s; // DGB 2015-01-21 08:25 True for Armory & Electrum
  }
});

Template.newBitcoinWallet.events({
  'click .back': function (event,template) {
     template.newWalletStage.set('first');
  },
  'click .wallet-thumbs': function (event,template) {
    // DGB 2015-01-20 06:57 There are better ways to get this data
    var wallet=$($(event.currentTarget).children()[1]).html()
    if (!(['Armory','Electrum','Bitcoin Wallet','Electrum','Single Address'].indexOf(wallet) === -1)) {
      template.newWalletData.set({type:wallet});
      template.newWalletStage.set('second');
    }
  }
});


