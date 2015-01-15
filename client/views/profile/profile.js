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
  this.userMessageOnEditingSection = new ReactiveVar(false,'');
};
 
Template.userProfile.helpers({
  /*TODO @levin, on profile page should be:
   email/username
   change password
   delete user */
  displayUsername: function () {
    return Meteor.user().profile.username;
  },
    userEmail: function () {
    var user = Meteor.user();
    if (user && user.emails) {
      return user.emails[0].address;
    }
  },
  hasUserMessage: function() {
    return Template.instance().userMessageOnEditingSection.get();
  },
  activateDebugger: function() {
    debugger;
  },
  // DGB 2015-01-12 04:42
  // This functions controls the inline edit of forms
  getEditingSection: function (section) {
    var editingSection = Template.instance().editingSection.get();
    return (editingSection===section);
  },
});

Template.userProfile.events({
  "click #change_password": function (event, template) {
    event.preventDefault();
    var oldPassword = template.$("#old_password").val();
    var newPassword = template.$("#new_password").val();
    var newPasswordAgain = template.$("#new_password_again").val();
    if(newPassword.length>0 && newPasswordAgain.length>=6 && (newPasswordAgain===newPassword)){
      Accounts.changePassword(oldPassword, newPassword, function (err) {
        if(err){
          template.userMessageOnEditingSection.set({class: 'error', message: err.reason});
        }else{
          template.userMessageOnEditingSection.set({class: 'success', message:'The password was changed, and we have sent you an email'}) 
          Meteor.call('sendEmail','resetPassword');
          template.$("#passwordChange").remove("");
        }
      });
    }
    else {
      template.userMessageOnEditingSection.set({class: 'error', message:'Password is too short (need at least 6 characters) or passwords do not match'}) 
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
  'click #setEditingSectionEmail': function (event, template) {
    template.editingSection.set('email');
	},


  'click #saveEmail': function (event, template) {
    // DGB 2015-01-12 05:19 
    // On Hold. This can get tricky as per 
    // https://github.com/meteor-useraccounts/core/issues/193
    
    // DGB 2015-01-12 05:29 Reset status
    template.editingSection.set('');
	},
  'click #saveUsername': function (event, template) {
    template.editingSection.set(''); 
    Meteor.users.update(
      {_id: Meteor.userId()}, 
      {$set: {'profile.username':$("#newUsername").val()}},
      false, 
      function(err,result) {
        // DGB 2015-01-12 05:29 Reset status on callback
        template.editingSection.set(''); 
    }); 
	}
}); 


