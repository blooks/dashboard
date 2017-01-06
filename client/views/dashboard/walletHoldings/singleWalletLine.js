Template.singleWalletLine.helpers({
  relativeBalance: function () {
    return parseFloat(this.balance() / Meteor.user().totalBalance('BTC') * 100).toFixed(2)
  }

})
