Template.newBitcoinWallet.helpers({
  hdWallets: function () {
    return Meteor.settings.public.coyno.supportedHDWallets
  },
  currentRoute: function () {
    return Router.current().url
  },
  unavailableWallets: function () {
    return Meteor.settings.public.coyno.unavailableWallets
  },
  hybridWallets: function () {
    return Meteor.settings.public.coyno.availableExchanges
  }
})
