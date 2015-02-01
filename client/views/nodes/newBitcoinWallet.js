Template.newBitcoinWallet.created = function() {
  this.newWalletStage = new ReactiveVar('first','');
  this.newWalletData = new ReactiveVar(false,'');
  this.newWalletFormValid = new ReactiveVar(false,'');
  this.newWalletFormValidLabel = new ReactiveVar(false,'');
  this.newWalletFormValidSeed = new ReactiveVar(false,'');
};

Template.newBitcoinWallet.helpers({
  availableWallets: function () {
    return Meteor.settings.public.coyno.availableWallets;
  },
  currentRoute: function () {
    return Router.current().url;
  },
  unavailableWallets: function () {
    return Meteor.settings.public.coyno.unavailableWallets;
  }
});
