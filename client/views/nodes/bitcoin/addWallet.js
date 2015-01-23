Template.addWallet.helpers({
  guideTemplate: function () {
    return "importGuide-"+this.actiontype;
  },
  isArmory: function() {
  	return (this.actiontype === 'armory');
  }
});