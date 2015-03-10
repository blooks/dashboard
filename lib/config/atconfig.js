//Routes
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn', {
  redirect: function() {
    var user = Meteor.user();
    if (user)
      Router.go('/dashboard');
  }
});
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');


AccountsTemplates.configure({
  // Behaviour
  showForgotPasswordLink: true,
  sendVerificationEmail: true,
  enablePasswordChange: true
});
