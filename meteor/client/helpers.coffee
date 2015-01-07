Template.registerHelper 'prettyDate', (date)->
  moment(date).format('DD/MM/YYYY hh:mm');

Template.registerHelper 'prettyDateLong', (date)->
  moment(date).format('dddd DD/MM/YYYY hh:mm:ss');

Template.registerHelper 'saneNumber', (internalNumber, currency)->
	if currency is 'BTC'
		(internalNumber/10e8).toFixed(8)
	else
		(internalNumber/10e8).toFixed(2)