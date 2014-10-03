Template.bitcoinWallets.events
  'click #addPublicAddress':(e,t)->
    Session.set('showAddWalletAddress',@_id)
  'click #saveBitcoinWalletAddress':(e,t)->
    address = t.find('#bitcoinWalletAddressInput').value
    console.log 'adding address'
    console.log address
    BitcoinWallets.update({_id:@_id},{$addToSet:{addresses:{address:address,balance:0}}})
  'click #updatePublicAddress':(e,t)->
    Meteor.call('updateBitcoinWalletAddresses',(err,result)->
      console.log 'updateBitcoinWalletAddresses response:'
      console.log result

    )
  'click #deleteWalletButton':(e,t)->
    BitcoinWallets.remove({_id:@_id})
    $('#delete-wallet').modal('hide')
    $('.modal-backdrop').remove()

