Meteor.users.deny({remove: function () { return false; }});
Accounts.onCreateUser(function(options, user) {
  return user;
});
