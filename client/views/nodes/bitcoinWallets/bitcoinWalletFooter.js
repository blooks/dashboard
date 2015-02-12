Template.bitcoinWalletFooter.events({
  'click .delete-bitcoin-address': function () {
    return BitcoinAddresses.remove({
      _id: this._id
    });
  },
  'click .data-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .node-data").slideToggle(400, function () {
      jQuery(targetID + " .data-toggle")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
    });
  }
});
