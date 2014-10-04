Template.registerHelper 'prettyDate', (date)->
	moment(date).format('dddd MMMM Do YYYY[:] hh:mm:ss');

Template.registerHelper 'saneNumber', (internalNumber, currency)->
	if currency is 'BTC'
		(internalNumber/100000000).toFixed(8)
	else
		(internalNumber/100000000).toFixed(2);	
	
Template.registerHelper 'saneAmount', () ->
	if this.in.currency is 'BTC'
		(this.in.amount/100000000).toFixed(8)
	else
		(this.in.amount/100000000).toFixed(2);