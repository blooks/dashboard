Template.registerHelper('labelForVolumeFragment', function (volumeFragment) {
  var temp = Exchanges.findOne({"_id": volumeFragment.nodeId});
  if (temp) {
    return temp.exchangeLabel;
  }
  temp = BitcoinAddresses.findOne({"_id": volumeFragment.nodeId});
  if (temp) {
    return BitcoinWallets.findOne({"_id": temp.walletId}).label;
  }
  temp = BitcoinWallets.findOne({"_id": volumeFragment.nodeId});
  if (temp) {
    return temp.label;
  }
  temp = BankAccounts.findOne({"_id": volumeFragment.nodeId});
  if (temp) {
    return temp.label;
  }
  return "Unknown";
});

Template.registerHelper('prettyDate', function (date) {
  return moment(date).format('ddd, DD MMM YYYY, HH:mm');
});

Template.registerHelper('prettyDateLong', function (date) {
  return moment(date).format('dddd DD/MM/YYYY hh:mm:ss');
});

Template.registerHelper('saneNumber', function (internalNumber, currency) {
  var result = "";
  if (currency === 'BTC') {
    result = (internalNumber / 10e7).toFixed(8);
  } else {
    result = (internalNumber / 10e7).toFixed(2);
  }
  return result;
});
Template.registerHelper('noData', function () {
    return !Meteor.user().profile.hasTransfers;
  }
);
