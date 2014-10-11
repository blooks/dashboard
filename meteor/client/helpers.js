Template.registerHelper('labelForVolumeFragment', function(volumeFragment) {
    var temp = Exchanges.findOne({"_id": volumeFragment.nodeId});
    if (temp) {
      return temp.exchangeLabel;
    }
    temp = BitcoinAddresses.findOne({"_id": volumeFragment.nodeId});
    if (temp) {
      return BitcoinWallets.findOne({"_id": temp.walletId}).label;
    }
    return volumeFragment.note;
}); 