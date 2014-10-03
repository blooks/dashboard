BankAccounts.helpers({
  balance: function() {
  currencies = [this.currency];
    var bank = this.bank;
    var transactionsin = Transactions.find({"in.node": bank}).fetch();
    var transactionsout = Transactions.find({"out.node": bank}).fetch();
    currencies.forEach(function(currency) {
      var balance = 0.0;
      transactionsin.forEach(function(transaction) {
      if (transaction.in.currency == currency) {
        balance+=parseFloat(transaction.in.amount);
      }
      });
      transactionsout.forEach(function(transaction) {
      if (transaction.out.currency == currency) {
        balance-=parseFloat(transaction.out.amount);
      }
      });
      result = balance;
    });
    return result;
}
});