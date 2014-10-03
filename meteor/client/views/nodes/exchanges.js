Template.currencyExchanges.helpers({
  exchanges: function(){
    return Exchanges.find().fetch();
  }
});