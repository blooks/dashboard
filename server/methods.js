Meteor.methods({
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
   * the user, at the is only removing the user from the database but not
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
  // DGB 2015-01-21 06:32
  // Changes the email of the user. As we only allow one email per user, we know
  // the email will be on the position 0 of the email array. We send the email to the old address to inform of the change
  changeUserEmail: function (email) {
    var self = this;
    if (!self.userId) return;
    // DGB 2015-01-21 06:46 Validate email with Collection2
    if (Meteor.users.simpleSchema().namedContext().validate({$set:{'emails.$.address':email}}, {modifier: true})) {
      try {
        oldEmail=Meteor.users.findOne({_id: self.userId}).emails[0].address;
        Meteor.users.update({_id: self.userId},{$set:{'emails.0.address':email}})
      } catch (e) {
      // DGB 2015-01-21 07:04 The reason Mongo complain after passing validation
      // is that the email is not unique (Collection2 doesn't check this ?,
      // weird)
        throw new Meteor.Error(402, "Invalid Email. Some other user has already this email, please insert a different one", "", "");
      }
      // DGB 2015-01-21 07:16 Cannot use the method, we want to send it to the
      // old Address
      try {
       Email.send({
        to: oldEmail,
        from: Accounts.emailTemplates.from,
        subject: Accounts.emailTemplates.changeEmail.subject(),
        text: Accounts.emailTemplates.changeEmail.text()
      });
      } catch (e) {
      throw new Meteor.Error(500, "Error while delivering an email warning you of the modification of your email", "", "");
      }
    }
    else {
     // DGB 2015-01-21 06:49 Return error, to indicate the client the email is
      // valid
      throw new Meteor.Error(402, "Invalid Email: Please insert a valid email address", "", "");
    }
    return true; //DGB 2015-01-21 06:52 Returns a result
  },
  /**
   * [dataForChartDashboardBasedOnCurrency description]
   * @param  {[type]} currency [description]
   * @return {[type]}          [description]
   */
  dataForChartDashboardBasedOnCurrency: function (currency) {
    var self = this;
    var convertToSaneAmount = function (amount, currency) {
      if (currency === 'BTC') {
        return parseFloat((amount / 10e7).toFixed(8));
      } else {
        return parseFloat((amount / 10e7).toFixed(2));
      }

    };
    var balances = [];
    var balance = 0;
    var time = 0;
    var currencies = ["EUR", "USD", "BTC"];
    currencies.forEach(function(currency) {
      balances[currency] = [];
    });
    //21.01.2015 LFG one day for time delta 60*60*24*1000 = 86400000 ms
    var timeDelta = 86400000;
    Transfers.find({"details.currency": 'BTC', userId: self.userId}, {sort: ['date', 'asc']}).forEach(function (transfer) {
      //console.log(transfer.baseVolume);
      //Start from timedelta before the time of the first transaction
      var transferTime = transfer.date.getTime();
      if (time === 0) {
        time = transferTime-timeDelta;
      }
      if (transfer.isIncoming()) {
        balance += transfer.representation.amount;
      }
      if (transfer.isOutgoing()) {
        balance -= (transfer.representation.amount + transfer.representation.fee);
      }
      while (transferTime >= time) {
        time += timeDelta;
        if (currency === 'BTC') {
          balances.push([time, convertToSaneAmount(balance, 'BTC')]);
        } else {
          balances.push([time, convertToSaneAmount(parseFloat(Math.round(Coynverter.convert('BTC', currency, balance, new Date(time)))), currency)]);
        }
      }
    });
    return balances;
  },
  convert: function (fromCurrency, toCurrency, amount, time) {
    return Coynverter.convert(fromCurrency, toCurrency, amount, new Date(time));
  }
});
