Template.newExchange.rendered = function () {
  var self = this;
  this.autorun(function () {
    if (AutoForm.getValidationContext("insertExchangeForm").isValid()) {
      self.$('#submitExchangeButton').removeClass('disabled');
    } else {
      self.$('#submitExchangeButton').addClass('disabled');
    }
  });
};
