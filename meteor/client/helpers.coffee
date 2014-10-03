Template.registerHelper 'prettyDate', (date)->
	moment(date).format('dddd MMMM Do YYYY[:] hh:mm:ss');