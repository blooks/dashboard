
@getExchangeRate = (from, to, date = new Date()) ->
  jurisdiction = 'undefined'
  if Meteor.user?.profile?.jurisdiction?
    jurisdiction = Meteor.user.profile.jurisdiction
  else
    jurisdiction = 'de' # This needs to be improved. We should require the user to have a jurisdiction and set the default there if it is missing.
  year = date.getFullYear()
  month = date.getMonth()
  if from is 'EUR' and to is 'USD'
    exchangeRates[jurisdiction]['USD'][year][month]
  else
    if from is 'USD' and to is 'EUR'
      1/exchangeRates[jurisdiction]['USD'][year][month]
    else 0 #Better throw an error or message here.