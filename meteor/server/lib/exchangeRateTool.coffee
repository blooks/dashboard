
@getExchangeRate = (jurisdiction, forex, base, date) ->
  year = date.getFullYear()
  month = date.getMonth()
  if base is "EUR"
    exchangeRates[jurisdiction][forex][year][month]
  else
    0 #Better throw an error or message here.