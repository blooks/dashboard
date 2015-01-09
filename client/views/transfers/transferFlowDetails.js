Template.transferRow.helpers({
  signedSaneNumber : function(transfer) {
    var result = transfer.saneAmount();
    switch (transferType) {
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
