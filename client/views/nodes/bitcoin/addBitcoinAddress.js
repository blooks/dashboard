Template.addBitcoinAddress.events({
});
Template.addBitcoinAddress.events({
  'click .bitcoin-address-add-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .bitcoin-address-add").slideToggle(400, function () {
      jQuery(targetID + " .data-toggle")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
    });
  }
});
