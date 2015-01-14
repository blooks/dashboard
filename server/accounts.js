// DGB 2015-01-14 07:25 This should probably be on the /models
Meteor.users.deny({remove: function () { return false; }});

// DGB 2015-01-14 07:42 Added this to make possible updates of the profile (Non critical information) directly from
// the client 
Meteor.users.allow({
  update:function(userId, doc, fields, modifier){
    if((fields[0].indexOf('profile')!==-1) && doc._id===userId){
      return true;
    }
    return false;
  }
});

Accounts.onCreateUser(function(options, user) {
  user.profile = options.profile || {};
  if(!user.profile.username){
    if (options.email) {
      // DGB 2015-01-14 07:28 We need a server side check here to make sure the
      // username is unique
      user.profile.username = options.email.match(/[^@]*/i)[0];
    }
  }
  return user;
});
