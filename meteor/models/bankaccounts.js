BankAccounts.helpers({
  balance: function() {
    var nodeId = this._id;
    var transfers = Transfers.find(
        { $or : [
          { 'details.inputs': { $elemMatch : {'nodeId': nodeId }} },
          { 'details.outputs': { $elemMatch : {'nodeId': nodeId }} }
            ]
        }).fetch();
    var balance = 0.0;
    transfers.forEach(function(transfer) {
      transfer.details.inputs.forEach(function(input) {
        if (input.nodeId == nodeId) {
          balance -= input.amount;
        }
      });
      transfer.details.outputs.forEach(function(output) {
        if (output.nodeId == nodeId) {
          balance += output.amount;
        }
      });
    });
    return balance;
  }
});