Template.addBitcoinAddress.rendered = function () {
  var self = this;
  this.autorun(function () {
    if (AutoForm.getValidationContext("insertBitcoinAddressForm").isValid()) {
      self.$('#submitSingleAddressButton').removeClass('disabled');
    } else {
      self.$('#submitSingleAddressButton').addClass('disabled');
    }
  });
};
