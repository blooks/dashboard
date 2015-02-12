Template.bitcoinWalletHeader.events({
  'click .delete-bitcoin-wallet': function () {
    return BitcoinWallets.remove({
      _id: this._id
    });
  },
  'click .update-wallet': function () {
    return this.update();
  },
  'click .body-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .node-body").slideToggle(400, function () {
      jQuery(targetID + " .body-toggle")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
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
