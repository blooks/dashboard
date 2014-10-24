// on the client
/** Template.nodes.helpers({
    'tabContent': function(){
        return TemplateVar.get('currencyExchanges');
    }
})

Template.nodes.events({
    'click button.exchanges-link': function() {
        if(TemplateVar.get('tabContent'))
        	TemplateVar.set('tabContent', false);
        else
        	TemplateVar.set('tabContent', true);
    }
}); **/