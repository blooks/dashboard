SSR.compileTemplate('emailFooter',  Assets.getText('emailtemplates/emailFooter.html'));
SSR.compileTemplate('welcome',  Assets.getText('emailtemplates/welcome.html'));
SSR.compileTemplate('deleteUser',  Assets.getText('emailtemplates/deleteuser.html'));
SSR.compileTemplate('passwordReset',  Assets.getText('emailtemplates/passwordreset.html'));
SSR.compileTemplate('changePassword',  Assets.getText('emailtemplates/changepassword.html'));

// DGB 2015-01-12 03:39 This setup should be at lib/config.coffee, but there is
// no environment control there. Left here for now.
// DGB 2015-01-13 05:57 Deprecated as LVO wants to use MAIL_URL env variable.
// EXAMPLE: process.env.MAIL_URL = 'smtp://USER:PASSWORD@SMTPSERVER:587';

Accounts.emailTemplates.siteName = "Coyno";
Accounts.emailTemplates.from = "Coyno <noreply@coyno.com>";

// DGB 2015-01-12 03:40
// This email is sent when a new user registers. If we want to validate EMAILS
// addresses this is the place where to inform the user where to go next to
// validate the email.
Accounts.emailTemplates.verifyEmail = {
  subject: function (user) {
    return "Welcome to the Coyno Beta!";
  },
  text: function (user, url) {
    var t = null;
    t= "Hello! \n\n Thank you for opening your account at Coyno. \n\n Please confirm here: " + url + "\n\n";
    t+="Sincerely,\n\nthe Coyno team";
    return t;
  },
  html: function(user, url) {
    return SSR.render("welcome", {verifyUrl: url});
  }
};

// DGB 2015-01-21 07:17
// This email is send when the user request to change his email
Accounts.emailTemplates.changePassword ={
  subject: function () {
    return "Password change on Coyno.com";
  },
  text: function () {
    var t = null;
    t= "Hello!\n\n";
    t+="You changed your password. If you did not execute this change yourself please contact us asap on support@coyno.com.";
    t+="Sincerely,\n\nthe Coyno team";
    return t;
  },
  html: function() {
    return SSR.render("changePassword");
  }
};
// DGB 2015-01-21 07:17
// This email is send when the user request to change his email
Accounts.emailTemplates.changeEmail ={
  subject: function () {
    return "E-Mail change on Coyno.com";
  },
  text: function () {
    var t = null;
    t= "Hello!\n\n";
    t+="You changed your e-mail. If you did not execute this change yourself please contact us asap on support@coyno.com.";
    t+="Sincerely,\n\nthe Coyno team";
    return t;
  },
  html: function() {
    return SSR.render("changeEmail");
  }
};



Accounts.emailTemplates.resetPassword ={
  subject: function (user) {
    return "Coyno password reset e-mail";
  },
  text: function (user,url) {
    var t = null;
    t= "Hello!\n\n";
    t+="You requested a password reset. Go to this URL: " + url + " to reset your password.";
    t+="Sincerely,\n\nthe Coyno team";
    return t;
  },
  html: function (user, url) {
    return SSR.render("passwordReset", {resetUrl: url});
  }
};
// DGB 2015-01-12 03:43
// This is NOT a standard Meteor.Accounts email template
Accounts.emailTemplates.deleteAccount = {
  subject: function (user) {
    return "Coyno user deleted.";
  },
  text: function (user) {
    var t = null;
    t= "Goodbye!\n\nWe deleted your Coyno Account following your request. We deleted all data connected to your account.\n\n";
    t+="We are sorry to see you go, but hope you come back in the future!\n\n";
    t+="Sincerely,\n\nthe Coyno team";
    return t;
  },
  html: function (user, url) {
    return SSR.render("deleteUser");
  }
};
