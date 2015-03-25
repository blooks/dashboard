Template.chooseExchange.helpers({
  availableExchanges: function () {
    return Meteor.settings.public.coyno.availableExchanges;
  },
  currentRoute: function () {
    return Router.current().url;
  },
  unavailableExchanges: function () {
    return Meteor.settings.public.coyno.unavailableExchanges;
  }
});
