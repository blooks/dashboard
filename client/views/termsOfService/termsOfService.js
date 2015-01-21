Template.termsOfService.created = function() {
};
 
Template.termsOfService.helpers({
});

Template.termsOfService.events({
  "click input": function (event,template) {
    if ($(event.target).prop('checked'))
    {
      Meteor.users.update({_id: Meteor.userId()},{$set:{'profile.hasSignedTOS':true}})
    }
    else
    {
      Meteor.users.update({_id: Meteor.userId()},{$set:{'profile.hasSignedTOS':false}})
    }
  }
}); 


