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
   * [sendEmail description]
   * @return {undefined}         [description]
   */
  sendEmail: function () {
    Log.info("Called method to send an email");
    var self = this;
    self.unblock();
    Email.send({
      to: Meteor.users.findOne({_id: self.userId}).emails[0],
      from: Accounts.emailTemplates.from,
      subject: Accounts.emailTemplates.resetPassword.subject,
      text: Accounts.emailTemplates.resetPassword.text
    });
  },
  removeAccount: function () {
    var self = this;
    Meteor.users.remove({_id: self.userId});
  }
});
