BitcoinExchangeRates = new Mongo.Collection('bitcoinExchangeRates');
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
   * [dataForChartDashboardBasedOnCurrency description]
   * @param  {[type]} currency [description]
   * @return {[type]}          [description]
   */
  dataForChartDashboardBasedOnCurrency: function (currency) {
    var satoshiToBTC = function (amount) {
      return (amount / 10e7).toFixed(8);
    };
    var convertToBTC = function (time, amount, currency){
      var rate = BitcoinExchangeRates.findOne({date: new Date(moment(time).format("YYYY-MM-DD"))});
      //Log.info(amount);
      return Math.round((amount*rate[currency])/100000000);
    };
    var balances = [];
    var changes = [];
    var balance = 0;
    var change = 0;
    var time = 0;
    //21.01.2015 LFG one day for time delta 60*60*24*1000 = 86400000 ms
    var timeDelta = 86400000;
    Transfers.find({"details.currency": 'BTC'}, {sort: ['date', 'asc']}, {limit: 5}).forEach(function (transfer) {
      //console.log(transfer.baseVolume);
      //Start from timedelta before the time of the first transaction
      if (time === 0) {
        time = moment(transfer.date-timeDelta).valueOf();
      }
      while (moment(transfer.date).valueOf() >= moment(time).valueOf()) {
        change = 0;
        time += timeDelta;
        if(currency==="EUR" || currency==='USD'){
          balances.push([time, convertToBTC(time, balance, currency)]);
          changes.push([time, convertToBTC(time, balance, currency)]);
        }
        if(currency==="BTC"){
          balances.push([time, parseFloat(satoshiToBTC(balance))]);
          changes.push([time, parseFloat(satoshiToBTC(change))]);
        }
      }
      if (transfer.isIncoming()) {
        balance += transfer.representation.amount;
        change += transfer.representation.amount;
      }
      if (transfer.isOutgoing()) {
        //TODO: Respect the fee!
        balance -= (transfer.representation.amount);
        change -= (transfer.representation.amount);
      }
    });
    //console.log(balances);
    return [balances, changes];
  },
  connectTransfer: function(transfer) {
    console.log(transfer);
    transfer.update();
  }
});
