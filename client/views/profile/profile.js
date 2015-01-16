/*TODO edit profile should take user to userProfile template*/

/*Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        event.stopPropagation();
        Template._loginButtons.toggleDropdown();
        Router.go('profileEdit');
    }
});*/

Template.userProfile.created = function() {
  this.editingSection = new ReactiveVar('','');
  this.userMessage = new ReactiveVar(false,'');
};
 
Template.userProfile.helpers({
  displayUsername: function () {
    return Meteor.user().profile.username;
  },
  userEmail: function () {
    if (Meteor.user() && Meteor.user().emails) {
      return Meteor.user().emails[0].address;
    }
  },
  // DGB 2015-01-12 04:42
  // This functions controls the inline edit of forms
  getEditingSection: function (section) {
    var editingSection = Template.instance().editingSection.get();
    return (editingSection===section);
  },
  getUserMessage: function(section) {
    return Template.instance().userMessage.get()[section];
  },
});

Template.userProfile.events({
  "click #change_password": function (event, template) {
    event.preventDefault();
    template.editingSection.set('password'); 
    var oldPassword = template.$("#old_password").val();
    var newPassword = template.$("#new_password").val();
    var newPasswordAgain = template.$("#new_password_again").val();
    if(newPassword.length>0 && newPasswordAgain.length>=6 && (newPasswordAgain===newPassword)){
      Accounts.changePassword(oldPassword, newPassword, function (err) {
        if(err){
          template.userMessage.set({password: {class: 'error', message: err.reason}});
        }else{
          template.userMessage.set({password: {class: 'success', message:'The password was changed, and we have sent you an email'}}) 
          Meteor.call('sendEmail','resetPassword');
          template.$("#passwordChange").remove("");
         template.editingSection.set(''); 
         template.userMessage.set(false);

        }
      });
    }
    else {
      template.userMessage.set({password: {class: 'error', message:'Password is too short (need at least 6 characters) or passwords do not match'}}) 
    }
  },
  "click #confirm_delete_account": function () {
    Meteor.call('removeAccount');
  },
  // DGB 2015-01-12 05:11
  // We can refactor this by including classes on the parents to identify the
  // button who raises the events 
  'click #setEditingSectionUsername': function (event, template) {
    template.editingSection.set('username');
	},
 
   // DGB 2015-01-12 05:19 
  // On Hold. This can get tricky as per 
  // https://github.com/meteor-useraccounts/core/issues/193
  
  // DGB 2015-01-15 07:16 Commented out until it is clear we can do this
  // 'click #setEditingSectionEmail': function (event, template) {
  //   template.editingSection.set('email');
	// },
  // 'click #saveEmail': function (event, template) {
  //   template.editingSection.set('');
	// },
  'click #saveUsername': function (event, template) {
    var username = $("#newUsername").val();
    // DGB 2015-01-15 07:05 If the user wants to save again the current username
    // we ignore the event
    if (username === Meteor.user().profile.username) {
      template.editingSection.set(''); 
      return;
    }
    template.editingSection.set('username');
    // DGB 2015-01-15 05:48 If the username is new, we check if the username is
    // unique. This can only be done on the server 
    // because the client doesn't have the whole user database
    Meteor.call('verifyUsernameIsUnique',username, function(err,result) {
      if (err) {
          template.userMessage.set({username: {class: 'error', message: err.reason}});
      }
      else {
        if (!result) {
          template.$("#newUsername").val();
          template.userMessage.set({username: {class: 'error', message: '"' + username + '" is already in use, please select another username'}});
        }
        else {
          // DGB 2015-01-15 07:42 Username is unique
          Meteor.users.update(
            {_id: Meteor.userId()}, 
            {$set: {'profile.username':username}},
            false, 
            function(err,result) {
              template.editingSection.set(''); 
              template.userMessage.set(false);
          }); 
        }
      }
    });
	}
}); 


