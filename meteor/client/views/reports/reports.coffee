
trades2balances = (trades) ->

  buying_bitcoin_cursor = -1
  selling_bitcoin_cursor = -1

  balances = []

  carryover = null

  while (buying_bitcoin_cursor < trades.length) and (selling_bitcoin_cursor < trades.length)

    balance = satisfyWith:[]
    balance.satisfy = _.find trades, (trade, index, all) ->
      if (index > buying_bitcoin_cursor) and (all[index].buy.currency == "BTC")
        buying_bitcoin_cursor = index
        return true

    if not balance.satisfy?
      # return early
      buying_bitcoin_cursor = trades.length
      continue

    amountNeedsSatisfaction = balance.satisfy.buy.amount

    while amountNeedsSatisfaction > 0

      if carryover?
        satisfyThisAmount = carryover.leftToSatisfy
        satisfyWith = carryover
        carryover = null
      else
        satisfyWith = _.find trades, (trade, index, all) ->
          if (index > selling_bitcoin_cursor) and (all[index].sell.currency == "BTC")
            selling_bitcoin_cursor = index
            return true

        if not satisfyWith?.sell?.amount?
          console.warn("Didn't find BTC sell for", balance.satisfy, "don't know where these bitcoins came from!")
          return balances

        satisfyThisAmount = satisfyWith.sell.amount

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

        satisfyWith.partial_amount = (satisfyWith.fraction / satisfyWith.trade.sell.amount) * satisfyWith.trade.buy.amount

      balance.satisfyWith.push satisfyWith

    balances.push balance

  if carryover?
    balances.push
      satisfy: null
      satisfyWith:[carryover]

  return balances

# TEST FIXTURES

SATOSHIS = 10000000

buy = (btc) ->
  buy:
    currency: "BTC"
    amount: btc*SATOSHIS
  sell:
    currency: "EUR"
    amount: 5

sell = (btc) ->
  buy:
    currency: "EUR"
    amount: 100
  sell:
    currency: "BTC"
    amount: btc*SATOSHIS

# TESTS

buy1BitcoinSell1Bitcoin = trades2balances [
  buy(1), sell(1),
]
console.assert buy1BitcoinSell1Bitcoin.length == 1

buy1BitcoinSell1BitcoinTwice = trades2balances [
  buy(1), sell(1), buy(1), sell(1),
]
console.assert buy1BitcoinSell1BitcoinTwice.length == 2

# overlapping
buy1bitcoinSellTwoHalfBitcoins = trades2balances [
  buy(3),
  sell(1),
  sell(1),
  buy(3),
  sell(1),
  sell(1),
  sell(1),
  sell(1),
]
console.assert buy1bitcoinSellTwoHalfBitcoins.length == 2

overlapping_trades = trades2balances [
  buy(3),
  buy(2),
  sell(2),
  sell(3),
]

console.assert overlapping_trades.length == 2

console.assert overlapping_trades[0].satisfy.buy.amount == 3*SATOSHIS
console.assert overlapping_trades[0].satisfyWith.length == 2
console.assert overlapping_trades[0].satisfyWith[0].sell.amount == 2*SATOSHIS

console.assert overlapping_trades[0].satisfyWith[1].fraction == 1*SATOSHIS
console.assert overlapping_trades[0].satisfyWith[1].trade.sell.amount == 3*SATOSHIS

console.assert overlapping_trades[1].satisfy.buy.amount == 2*SATOSHIS
console.assert overlapping_trades[1].satisfyWith.length == 1
console.assert overlapping_trades[1].satisfyWith[0].fraction == 2*SATOSHIS
console.assert overlapping_trades[1].satisfyWith[0].trade.sell.amount == 3*SATOSHIS


multi_carryover = trades2balances [
  buy(10),
  sell(3),
  sell(2),
  sell(1),
  buy(1),
  sell(6),
]
console.assert multi_carryover.length == 2

# TEMPLATE HELPERS

Template.reports.helpers reports: ->
  trades = Trades.find({}, sort: [ "date", "asc" ]).fetch()
  balances = trades2balances(trades)
  balances

