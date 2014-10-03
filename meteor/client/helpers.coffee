Template.registerHelper 'prettyDate', (date)->
	moment(date).format('YYYY MM DD');