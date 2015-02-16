Template.addBitcoinAddress.events({
  'click .bitcoin-add-address-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .bitcoin-add-address").slideToggle(400, function () {
      jQuery(targetID + " .toggle-button")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
    });
  }
});
