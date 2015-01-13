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

Template.userProfile.events({
  "click #change_password": function (event, template) {
    event.preventDefault();
    var oldPassword = template.$("#old_password").val();
    var newPassword = template.$("#new_password").val();
    var newPasswordAgain = template.$("#new_password_again").val();
    if(newPassword.length>0 && newPasswordAgain.length>0 && (newPasswordAgain===newPassword)){
      Accounts.changePassword(oldPassword, newPassword, function (err) {
        if(err){
          console.log(err);
        }else{
          console.log("The password was changed");
          Meteor.call("sendEmail");
          template.$("#old_password").val("");
          template.$("#new_password").val("");
          template.$("#new_password_again").val("");
        }
      });
    }
  },
  "click #confirm_delete_account": function () {
    Meteor.call('removeAccount');
  }
});