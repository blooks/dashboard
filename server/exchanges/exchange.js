import CoynoJobs from '@blooks/jobs'
if (!process.env.REDIS_URL && process.env.REDIS_HOST && process.env.REDIS_PORT) {
  process.env.REDIS_URL = 'redis://' + process.env.REDIS_HOST + ':' + process.env.REDIS_HOST
}

if (!process.env.REDIS_URL) {
  log.warn('No redis URL set. Defaulting to localhost')
  process.env.REDIS_URL = 'redis://localhost'
}

var jobs = new CoynoJobs(process.env.REDIS_URL)

Meteor.methods({
  /**
   * Updating the wallet data. Getting all transactions for
   * the addresses in the wallet and pushing them to the database.
   * Then the balances get updated.
   * TODO: In case of a HD Wallet a certain buffer
   * size of non-used addresses has to be built.
   *
   * @param wallet
   */
  updateExchange: function (exchange) {
    jobs.addJob('exchange.update', { exchangeId: exchange._id, userId: exchange.userId })
  }
})
