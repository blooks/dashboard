// on the client
Template.nodes.helpers({
  exchanges: function(){
    return Exchanges.find().fetch();
  }
});

Template.nodes.helpers({
  bankaccounts: function(){
    return BankAccounts.find().fetch();
  }
});
// on the client
Template.nodes.helpers({
  bitcoinwallets: function(){
    return BitcoinWallets.find().fetch();
  }
});