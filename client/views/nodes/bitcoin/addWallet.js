Template.addWallet.helpers({
  guideTemplate: function () {
    return 'importGuide'
  },
  isExchange: function () {
    return (Meteor.settings[ 'public' ].coyno.supportedExchangeTypes.indexOf(this.actiontype) >= 0)
  },
  typeLabel: function () {
    var self = this
    return Meteor.settings[ 'public' ].coyno.availableWallets.filter(function (item) {
      return self.actiontype === item.type
    })[ 0 ].label
  }
})

AutoForm.hooks({
  addNewBitcoinWallet: {
    after: {
      insert: function (error, result, template) {
        if (error) return
        Router.go('/nodes')
      }
    }
  }
})

Template.addWallet.rendered = function () {
  var self = this
  this.autorun(function () {
    if (AutoForm.getValidationContext('addNewBitcoinWallet').isValid()) {
      self.$('#submitWalletButton').removeClass('disabled')
    } else {
      self.$('#submitWalletButton').addClass('disabled')
    }
  })
}
