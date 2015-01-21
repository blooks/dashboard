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
   * DGB 2015-01-14 04:43 Converted into a generic function to be able to send
   * any template
   * @return {undefined}         [description]
   */
  sendEmail: function (template) {
    var self = this;
    if (!self.userId || !template) return; //DGB 2015-01-14 04:41 Minimal security just-in-case
    var user = Meteor.users.findOne({_id: self.userId}).emails[0].address;
    console.log(template);
    if (template === 'resetPassword') {
      self.unblock();
      Accounts.sendResetPasswordEmail(self.userId);
    }
    // DGB 2015-01-21 07:50 Removed eval
    else if(template = Accounts.emailTemplates[template]){
      self.unblock();
      Email.send({
        to: self.user,
        from: Accounts.emailTemplates.from,
        subject: template.subject(user),
        text: template.text(user)
      });
    }
  },
  /**
   * 13.01.2015 LFG
   * [removeAccount removes the user account, in meteor is not possible to use the remove in a correct way from cliente, needs to be done in server side]
   * DGB 2015-01-13 06:02 This method needs to remove ALL data related to
   * the user, at the moment is only removing the user from the database but not
   * the related transactions.
   * @return {undefined} [description]
   */
  removeAccount: function () {
    var self = this;
    if (!self.userId) return; 
    var user = Meteor.users.findOne({_id: self.userId});
    self.unblock();
    Email.send({
      to: user.emails[0].address,
      from: Accounts.emailTemplates.from,
      subject: Accounts.emailTemplates.deleteAccount.subject(user),
      text: Accounts.emailTemplates.deleteAccount.text(user)
    });
    Meteor.users.remove({_id: self.userId});
  },
  // DGB 2015-01-15 05:43 
  // Returns true if the passed username is unique on the database. 
  verifyUsernameIsUnique: function (username) {
    return (Meteor.users.findOne({'profile.username':username})===undefined);
  },
  /**
   * getConversion returns the conversion value for a date based on a currency
   * @param  {String} date     The date to calculate the exchange rate
   * @param  {String} currency The currency which the conversion will be done
   * @param  {Number} amount   The amount of BTC to convert
   * @return {Number}          The value of the amount in the provided currency
   */
  //Example call to server method from client: Meteor.call('getConversion', '2015-01-10', 'USD', 0.1213, function (err, result) {console.log(result)});
  getConversion: function (date, currency, amount) {
    var Coynverter = Meteor.npmRequire("coyno-converter");
    var coynverter = new Coynverter();
    var conversion = Async.runSync(function (done) {
      coynverter.convert("meteor", date, currency, amount, "bitcoinExchangeRates", function (err, exchangeRate) {
        done(null, exchangeRate);
      });
    });
    return conversion.result;
  }
});
