chain = Meteor.npmRequire("chain-node")




Meteor.methods
  'updateBitcoinWalletAddresses':()->
    if Meteor.user()
      counter = 0
      BitcoinWallets.find({userId:Meteor.userId()}).forEach((wallet)->
        addresses = _.map wallet.addresses, (address)->
          address.address

        console.log 'calling chaing with'
        console.log addresses
        chain.getAddresses addresses, Meteor.bindEnvironment((err, resp) ->
          console.log resp
          newArray = _.map resp,(address) ->
            newObj = {}
            newObj.address = address.hash
            newObj.balance = address.balance
            return newObj

          console.log 'new object'
          console.log newArray


          BitcoinWallets.update({userId:Meteor.userId(),label:wallet.label},{$set:{addresses:newArray}})


#        addresses.forEach((address)->
#          console.log 'updating address:',address
#
#          chain.getAddress address.address, Meteor.bindEnvironment((err, resp) ->
#            console.log 'chain info callback'
##            BitcoinWallets.update({userId:Meteor.userId()},{$set:{}})
#            console.log resp
#            return
#
#        )
#        )

      ))