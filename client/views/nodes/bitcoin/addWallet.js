Template.addWallet.helpers({
  guideTemplate: function () {
    return "importGuide";
  }

});

AutoForm.hooks({
  addNewBitcoinWallet: {

    after: {
      insert: function(error, result, template) {
        if (error) return;
        Router.go('/nodes');
      },
      update: function(error, result, template) {},
      "methodName": function(error, result, template) {}
    },
      onSuccess :  function(insertDoc, updateDoc, currentDoc) {
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
