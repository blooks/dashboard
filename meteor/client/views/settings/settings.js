Template.user_settings.events({'submit' : function(event) {
	var bitstampAPIKey = $('#bitstampAPIKey').val();
	var userprofile = Meteor.user().profile;
	Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.bitstampUserId":$('#bitstampUserId').val()}});
	Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.bitstampAPIKey":$('#bitstampAPIKey').val()}});
	Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.bitstampSecret":$('#bitstampSecret').val()}});
    return false;
}});


Template.user_settings.helpers({
     bitstampAPIKey: function() {return Meteor.user().profile.bitstampAPIKey},
     bitstampUserId: function() {return Meteor.user().profile.bitstampUserId} 
});