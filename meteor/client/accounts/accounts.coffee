Meteor.startup ->
  Accounts.ui.config
    passwordSignupFields: 'EMAIL_ONLY'

  AccountsEntry.config
    homeRoute: '/'
    dashboardRoute: '/dashboard'
    loginRoute: '/login'
    language: 'en'
    showSignupCode: false
