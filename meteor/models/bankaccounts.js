BankAccounts.helpers({
  balance: function() {
  var transactions = Transactions.find().fetch();
  var balance = 0.0;
  for (i=0; i < transactions.length; ++i) {
    if (transactions[i].in.currency == "EUR") {
      balance+=parseFloat(transactions[i].in.amount);
    } else if (transactions[i].out.currency == "EUR") {
      balance-=parseFloat(transactions[i].out.amount);
    }
  }
  return balance
}
});