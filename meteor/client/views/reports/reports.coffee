
trades2balances = (trades) ->

  selling_bitcoin_cursor = -1
  buying_bitcoin_cursor = -1

  balances = []

  carryover = null

  while (selling_bitcoin_cursor < trades.length) and (buying_bitcoin_cursor < trades.length)

    balance = satisfyWith:[]
    balance.satisfy = _.find trades, (trade, index, all) ->
      if (index > selling_bitcoin_cursor) and (all[index].sell.currency == "BTC")
        selling_bitcoin_cursor = index
        return true

    if not balance.satisfy?
      # return early
      selling_bitcoin_cursor = trades.length
      continue

    amountNeedsSatisfaction = balance.satisfy.sell.amount

    while amountNeedsSatisfaction > 0

      if carryover?
        satisfyThisAmount = carryover.leftToSatisfy
        satisfyWith = carryover
        carryover = null
      else
        satisfyWith = _.find trades, (trade, index, all) ->
          if (index > buying_bitcoin_cursor) and (all[index].buy.currency == "BTC")
            buying_bitcoin_cursor = index
            return true

        if not satisfyWith?.buy?.amount?
          console.warn("Didn't find BTC buy for", balance.satisfy, "don't know where these bitcoins came from!")
          return balances

        satisfyThisAmount = satisfyWith.buy.amount

      amountNeedsSatisfaction -= satisfyThisAmount

      if amountNeedsSatisfaction < 0

        if satisfyWith.partial?
          satisfyWith = satisfyWith.trade

        carryover =
          partial:true
          leftToSatisfy:-amountNeedsSatisfaction
          trade:satisfyWith

        satisfyWith =
          partial:true
          trade:satisfyWith

      if satisfyWith.partial?
        satisfyWith.fraction = satisfyThisAmount
        if amountNeedsSatisfaction < 0
          satisfyWith.fraction += amountNeedsSatisfaction

        satisfyWith.partial_amount = (satisfyWith.fraction / satisfyWith.trade.buy.amount) * satisfyWith.trade.sell.amount

      balance.satisfyWith.push satisfyWith

    balances.push balance

  if carryover?
    balances.push
      satisfy: null
      satisfyWith:[carryover]

  return balances

# TEST FIXTURES

SATOSHIS = 10000000

sell = (btc) ->
  sell:
    currency: "BTC"
    amount: btc*SATOSHIS
  buy:
    currency: "EUR"
    amount: 5

buy = (btc) ->
  sell:
    currency: "EUR"
    amount: 100
  buy:
    currency: "BTC"
    amount: btc*SATOSHIS

# TESTS

sell1Bitcoinbuy1Bitcoin = trades2balances [
  sell(1), buy(1),
]
console.assert sell1Bitcoinbuy1Bitcoin.length == 1

sell1Bitcoinbuy1BitcoinTwice = trades2balances [
  sell(1), buy(1), sell(1), buy(1),
]
console.assert sell1Bitcoinbuy1BitcoinTwice.length == 2

# overlapping
sell1bitcoinbuyTwoHalfBitcoins = trades2balances [
  sell(3),
  buy(1),
  buy(1),
  sell(3),
  buy(1),
  buy(1),
  buy(1),
  buy(1),
]
console.assert sell1bitcoinbuyTwoHalfBitcoins.length == 2

overlapping_trades = trades2balances [
  sell(3),
  sell(2),
  buy(2),
  buy(3),
]

console.assert overlapping_trades.length == 2

console.assert overlapping_trades[0].satisfy.sell.amount == 3*SATOSHIS
console.assert overlapping_trades[0].satisfyWith.length == 2
console.assert overlapping_trades[0].satisfyWith[0].buy.amount == 2*SATOSHIS

console.assert overlapping_trades[0].satisfyWith[1].fraction == 1*SATOSHIS
console.assert overlapping_trades[0].satisfyWith[1].trade.buy.amount == 3*SATOSHIS

console.assert overlapping_trades[1].satisfy.sell.amount == 2*SATOSHIS
console.assert overlapping_trades[1].satisfyWith.length == 1
console.assert overlapping_trades[1].satisfyWith[0].fraction == 2*SATOSHIS
console.assert overlapping_trades[1].satisfyWith[0].trade.buy.amount == 3*SATOSHIS


multi_carryover = trades2balances [
  sell(10),
  buy(3),
  buy(2),
  buy(1),
  sell(1),
  buy(6),
]
console.assert multi_carryover.length == 3

# TEMPLATE HELPERS

Template.reports.helpers reports: ->
  trades = Trades.find({}, sort: [ "date", "asc" ]).fetch()
  balances = trades2balances(trades)
  balances

