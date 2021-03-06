'use strict'

var bitcore = Npm.require('bitcore-lib')
var Jobs = Npm.require('@blooks/jobs')
if (!process.env.REDIS_URL && process.env.REDIS_HOST && process.env.REDIS_PORT) {
  process.env.REDIS_URL = 'redis://' + process.env.REDIS_HOST + ':' + process.env.REDIS_HOST
}
if (!process.env.REDIS_URL) {
  log.warn('No redis URL set. Defaulting to localhost')
  process.env.REDIS_URL = 'redis://localhost'
}
var jobs = new Jobs(process.env.REDIS_URL)

Meteor.methods({
  /**
   * Updating the wallet data. Getting all transactions for
   * the addresses in the wallet and pushing them to the database.
   * Then the balances get updated.
   * size of non-used addresses has to be built.
   *
   * @param wallet
   */
  updateTx4Wallet: function (wallet) {
    var self = this
    // TODO: check if wallet exists, user is owner and can trigger update
    wallet = BitcoinWallets.findOne({ _id: wallet._id })
    if (wallet) {
      Notification.info('Updating Wallet', 'Wallet "' + wallet.label + '" is being updated.')
      if (wallet.superNode) {
        if (wallet.superNode.nodeType === 'exchange') {
          var exchange = Exchanges.findOne({ _id: wallet.superNode.id })
          if (exchange) {
            exchange.update()
          }
        }
      } else {
        // BitcoinWallets.update({_id: wallet._id}, {$set: {updating: true}})
        jobs.addJob('wallet.update', { walletId: wallet._id, userId: wallet.userId, complete: true })
      }
    }
  },
  isValidBitcoinAddress: function (address) {
    if (!bitcore.Address.isValid(address)) {
      return 'invalidFormat'
    }
    if (BitcoinAddresses.findOne({userId: this.userId, address: address})) {
      return 'duplicate'
    }

  }
})
