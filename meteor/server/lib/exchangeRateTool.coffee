
@getExchangeRate = (jurisdiction, from, to, date) ->
  year = date.getFullYear()
  month = date.getMonth()
  if from is 'EUR' and to is 'USD'
    exchangeRates[jurisdiction]['USD'][year][month]
  else
    if from is 'USD' and to is 'EUR'
      1/exchangeRates[jurisdiction]['USD'][year][month]
    else 0 #Better throw an error or message here.