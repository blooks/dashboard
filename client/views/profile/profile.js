Template.userProfile.created = function () {
  this.editingSection = new ReactiveVar('', '')
  this.userMessage = new ReactiveVar(false, '')

  // DGB 2015-01-20 03:58 This variable has an unfortunatene name, pleas notice
  // this section and the section from editingSection relate to different
  // things.
  this.openedSection = new ReactiveVar('', '')
}

Template.userProfile.helpers({
  displayUsername: function () {
    return Meteor.user().profile.username
  },
  userEmail: function () {
    if (Meteor.user() && Meteor.user().emails) {
      return Meteor.user().emails[ 0 ].address
    }
  },
  getOpenedSection: function (section) {
    var openedSection = Template.instance().openedSection.get()
    return (openedSection === section)
  },
  // DGB 2015-01-12 04:42
  // This functions controls the inline edit of forms
  getEditingSection: function (section) {
    var editingSection = Template.instance().editingSection.get()
    return (editingSection === section)
  },
  getUserMessage: function (section) {
    return Template.instance().userMessage.get()[ section ]
  }
})

Template.userProfile.events({
  'click #confirm_delete_account': function () {
    Meteor.call('removeAccount')
  },
  'click .setEditingSectionUsername': function (event, template) {
    template.editingSection.set('username')
  },
  'click .setEditingSectionEmail': function (event, template) {
    template.editingSection.set('email')
  },
  'submit [name="saveEmail"]': function (event, template) {
    event.preventDefault()
    event.stopPropagation()
    var email = $('#newEmail').val()
    template.editingSection.set('email')
    Meteor.call('changeUserEmail', email, function (err, result) {
      if (err) {
        template.userMessage.set({ email: { class: 'error', message: err.reason } })
      } else {
        if (!result) {
          template.$('#newEmail').val()
          template.userMessage.set({
            username: {
              class: 'error',
              message: '"' + email + '" is not a valid Email, please select another username'
            }
          })
        } else {
          template.editingSection.set('')
          template.userMessage.set(false)
        }
      }
    })
  },
  'submit [name="saveUsername"]': function (event, template) {
    event.preventDefault()
    event.stopPropagation()
    var username = $('#newUsername').val()
    // DGB 2015-01-15 07:05 If the user wants to save again the current username
    // we ignore the event
    if (username === Meteor.user().profile.username) {
      template.editingSection.set('')
      return
    }
    template.editingSection.set('username')
    // DGB 2015-01-15 05:48 If the username is new, we check if the username is
    // unique. This can only be done on the server
    // because the client doesn't have the whole user database
    Meteor.call('verifyUsernameIsUnique', username, function (err, result) {
      if (err) {
        template.userMessage.set({ username: { class: 'error', message: err.reason } })
      } else {
        if (!result) {
          template.$('#newUsername').val()
          template.userMessage.set({
            username: {
              class: 'error',
              message: '"' + username + '" is already in use, please select another username'
            }
          })
        } else {
          // DGB 2015-01-15 07:42 Username is unique. For extra confidence that the username is unique, it should not be editable on the profile
          Meteor.users.update(
            {_id: Meteor.userId()},
            { $set: { 'profile.username': username } },
            false,
            function (err, result) {
              template.editingSection.set('')
              template.userMessage.set(false)
            })
        }
      }
    })
  }
})
