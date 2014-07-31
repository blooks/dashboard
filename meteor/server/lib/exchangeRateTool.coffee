
computeBaseValue = (jurisdiction, forex, base, date) ->
  year = date.getFullYear()
  month = date.getMonth()
  if base is "EUR"
    amount / exchangeRates.jurisdiction.forex.year.month
  else
    0 #Better throw an error or message here.