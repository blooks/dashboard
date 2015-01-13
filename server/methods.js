Meteor.methods({
  /**
   * [calculateBaseAmount description]
   * @param  {[type]} amount [description]
   * @param  {[type]} from   [description]
   * @param  {[type]} date   [description]
   * @return {[type]}        [description]
   */
  calculateBaseAmount: function (amount, from, date) {
    Coynverter.calculateBaseAmount(amount, from, date, function (err, result) {
      return result;
    });
  },
  /**
   * 12.01.2015 LFG
   * [sendEmail send an email notification when the password is changed]
   * @return {undefined}         [description]
   */
  sendEmail: function () {
    var self = this;
    var user = Meteor.users.findOne({_id: self.userId}).emails[0].address;
    self.unblock();
    //LFG 13.01.2015 getaddrinfo ENOTFOUND is usually a DNS error (address not found)
    Email.send({
      to: user,
      from: Accounts.emailTemplates.from,
      subject: Accounts.emailTemplates.resetPassword.subject,
      text: Accounts.emailTemplates.resetPassword.text
    });
  },
  /**
   * 13.01.2015 LFG
   * [removeAccount removes the user account, in meteor is not possible to use the remove in a correct way from cliente, needs to be done in server side]
   * @return {undefined} [description]
   */
  removeAccount: function () {
    var self = this;
    var user = Meteor.users.findOne({_id: self.userId}).emails[0].address;
    self.unblock();
    //LFG 13.01.2015 breaks because of the email configuration, if this block is removed, the process works fine
    Email.send({
      to: user,
      from: Accounts.emailTemplates.from,
      subject: Accounts.emailTemplates.deleteAccount.subject,
      text: Accounts.emailTemplates.deleteAccount.text
    });
    Meteor.users.remove({_id: self.userId});
  }
});
