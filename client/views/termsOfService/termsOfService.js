Template.termsOfService.events({
  'click #termsOfServiceButton': function (event, template) {
    Meteor.users.update({ _id: Meteor.userId() }, { $set: { 'profile.hasSignedTOS': true } })
  },
  'click input': function (event, template) {
    if (($('input').prop('checked'))) {
      $('#termsOfServiceButton').removeClass('disabled')
    } else {
      $('#termsOfServiceButton').addClass('disabled')
    }
  }
})
