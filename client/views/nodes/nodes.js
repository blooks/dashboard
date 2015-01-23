// on the client
Template.dynamicNodeMenu.helpers({
  actionIs: function (action) {
    if (this.action === action) {
      return "active";
    }
    return "";
  }
});
