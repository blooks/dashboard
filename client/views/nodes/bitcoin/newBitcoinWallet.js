Template.newBitcoinWallet.helpers({
  availableWallets: function () {
    return Meteor.settings.public.coyno.availableWallets;
  },
  currentRoute: function () {
    return Router.current().url;
  },
  unavailableWallets: function () {
    return Meteor.settings.public.coyno.unavailableWallets;
  },
  hybridWallets: function () {
    return Meteor.settings.public.coyno.availableExchanges;
  }
});
