Template.addWallet.helpers({
  guideTemplate: function () {
    return "importGuide";
  },
  isExchange: function() {
    return (Meteor.settings["public"].coyno.supportedExchangeTypes.indexOf(this.actiontype) >= 0);
  }
});

AutoForm.hooks({
  addNewBitcoinWallet: {
    after: {
      insert: function (error, result, template) {
        if (error) return;
        Router.go('/nodes');
      }
    }
  }
});

Template.addWallet.rendered = function () {
  var self = this;
  this.autorun(function () {
    if (AutoForm.getValidationContext("addNewBitcoinWallet").isValid()) {
      self.$('#submitWalletButton').removeClass('disabled');
    } else {
      self.$('#submitWalletButton').addClass('disabled');
    }
  });
};
