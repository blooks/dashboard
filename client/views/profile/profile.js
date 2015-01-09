/*TODO edit profile should take user to userProfile template*/

/*Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        event.stopPropagation();
        Template._loginButtons.toggleDropdown();
        Router.go('profileEdit');
    }
});*/

Template.userProfile.helpers({
  /*TODO @levin, on profile page should be:
   email/username
   change password
   delete user */
  displayName: function () {
    return Accounts._loginButtons.displayName();
  },
  userEmail: function () {
    var user = Meteor.user();
    if (user && user.emails) {
      return user.emails[0].address;
    }
  }
});
