Template.inputExchange.rendered = function () {
  var self = this;
  this.autorun(function () {
    if (AutoForm.getValidationContext("inputExchangeForm").isValid()) {
      self.$('#submitExchangeButton').removeClass('disabled');
    } else {
      self.$('#submitExchangeButton').addClass('disabled');
    }
  });
};
