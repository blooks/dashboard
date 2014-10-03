Template.bankAccounts.helpers({
  bankaccounts: function(){
    return BankAccounts.find().fetch();
  }
});