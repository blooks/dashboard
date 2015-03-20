//22.01.2015 LFG POSSIBLE values for currencies, constant
Template.header.events({
  'click #menu-toggle': function (event) {
    event.preventDefault();
    $("#wrapper").toggleClass("nav-toggled");
  },
  'change #user_currency': function (event) {
    event.preventDefault();
    var userCurrency = $('#user_currency').val();
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.currency': userCurrency}});
    Meteor.call("updateTotalFiat");
  },
  'click #login-buttons-logout': function() {
    Meteor.logout(function () {
      loginButtonsSession.closeDropdown();
    });
  }
});

Template.header.helpers({
  isSelected: function (currency) {
    if(currency === Meteor.user().profile.currency){
      return 'selected';
    }
  },
  possibleCurrencies: function () {
    return ['EUR', 'USD'];
  }
});
