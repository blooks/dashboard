// Routes
AccountsTemplates.configure({
  // Behaviour
  showForgotPasswordLink: true,
  sendVerificationEmail: true,
  enablePasswordChange: true
})
AccountsTemplates.configureRoute('changePwd')
AccountsTemplates.configureRoute('enrollAccount')
AccountsTemplates.configureRoute('forgotPwd')
AccountsTemplates.configureRoute('resetPwd')
AccountsTemplates.configureRoute('signIn')
AccountsTemplates.configureRoute('signUp')
AccountsTemplates.configureRoute('verifyEmail')
