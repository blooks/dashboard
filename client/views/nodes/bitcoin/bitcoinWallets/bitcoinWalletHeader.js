Template.bitcoinWalletHeader.events({
  'click .delete-bitcoin-wallet': function () {
    return BitcoinWallets.remove({
      _id: this._id
    })
  },
  'click .update-wallet': function () {
    return this.update()
  },
  'click .body-toggle': function () {
    var targetID = '#' + this._id
    jQuery(targetID + ' .node-body').slideToggle(400, function () {
      jQuery(targetID + ' .body-toggle')
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big')
    })
  },
  'click .add-address-toggle': function (event, template) {
    jQuery('#bitcoinWalletAddAddress #addAddressModalTitle').text(template.data.label)
    jQuery('#bitcoinWalletAddAddress #addBitcoinAddressWalletIdField').val(template.data._id)
    jQuery('#bitcoinWalletAddAddress').modal('toggle')
  }
})

Template.bitcoinWalletHeader.rendered = function () {
  $('[data-toggle="tooltip"]').tooltip()
}
