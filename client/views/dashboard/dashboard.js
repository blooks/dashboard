


Template.netWorth.helpers({
  trades: function () {
    return Trades.find({}, {sort: ['date', 'asc']}).fetch();
  }
});



// Set active class on menu <li> according to current template
Template.dynamicDashboardMenu.helpers({
  isActive: function (type) {
    if (this.type === type) {
      return "active";
    }
    return "";
  }
});
