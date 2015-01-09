Template.transferRow.helpers({
  signedSaneAmount : function(transfer) {
    var result = transfer.saneAmount();
    switch (transfer.transferType()) {
     case "internal":
     result = " &nbsp; " + result;
     break;
     case "incoming":
     result =  "+" + result;
     break;
     case "outgoing":
     result = "-" + result;
     break;
     }
    return result;
  }
});
