Template.bitcoinWalletDetailsModal.events({
  'click .delete-bitcoin-address': function () {
    return BitcoinAddresses.remove({
      _id: this._id
    });
  },
  'click .body-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .node-data").slideToggle(400, function () {
      jQuery(targetID + " .body-toggle")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
    });
  }
});
Template.bitcoinWalletDetailsModal.helpers({
  singleAddressess: function() {
    return this.singleAddresses();
  }
});
