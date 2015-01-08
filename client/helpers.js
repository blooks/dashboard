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
