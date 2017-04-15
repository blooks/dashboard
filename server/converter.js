"use strict"
import {HTTP} from 'meteor/http'
import moment from 'moment'
let bitcoinPrices = {}

const convert = ({date, toCurrency, btcAmount}) => {
  const now = moment()
  if (moment(date).isAfter(now)) {
    date = now
  }
  const day = moment(date).startOf('day').subtract(1, 'day').format('YYYY-MM-DD')
  const price = bitcoinPrices[toCurrency][day]
  if (!price) {
    throw new Error('Something went wrong when looking up the price of a bitcoin.')
  }
  return price * btcAmount
}

const update = () => {
  try {
    bitcoinPrices['USD'] = HTTP.call('GET', 'http://api.coindesk.com/v1/bpi/historical/close.json', {
      params: {
        start: '2010-07-17',
        end: moment().format('YYYY-MM-DD')
      }
    }).data.bpi
    bitcoinPrices['EUR'] = HTTP.call('GET', 'http://api.coindesk.com/v1/bpi/historical/close.json', {
      params: {
        start: '2010-07-17',
        end: moment().format('YYYY-MM-DD'),
        currency: 'EUR'
      }
    }).data.bpi
  } catch (err) {
    return console.error(err)
  }
  console.log('Coynverter Update done')
}

Meteor.startup(() => {
  update()
  SyncedCron.add({
    name: 'Update Exchange Rates',
    schedule: function (parser) {
      // parser is a later.parse object
      return parser.cron('5 * * * * *')
    },
    job: update
  })
})

export default convert