Template.dynamicNodeMenu.helpers({
  add: function () {
    return "nodes." + this.type + ".add";
  },
  home: function() {
    return "nodes." + this.type + ".home";
  },
  title: function() {
  return "nodes."+ this.type + ".title";
  },
  actionIs: function (action) {
      if (this.action === action) {
        return "active";
      }
      return "";
  }
});
