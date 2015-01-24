Template.addWallet.helpers({
  guideTemplate: function () {
    return "importGuide-"+this.actiontype;
  },
  isArmory: function() {
  	return (this.actiontype === 'armory');
  }
  /* Disabling/enabling button
	buttonState: function () {
	if (AutoForm.getValidationContext(formId).isValid()) {
	  return "Enabled";
	}
		return "Disabled";
	}*/

});