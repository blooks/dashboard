Template.transferRow.helpers({
  signedSaneAmount : function(transfer) {
    var result = transfer.saneAmount();
    switch (transfer.transferType()) {
     case "internal":
     result = " " + result;
     break;
     case "incoming":
     result =  "+" + result;
     break;
     case "outgoing":
     result = "-" + result;
     break;
     }
    return result;
  },
  colSpanBefore: function() {
    switch (this.transferType()) {
        case 'internal' :
            return 2;
            break;
        case 'outgoing' :
            return 4;
            break;
        //  Not called for incoming tx row
    }
  },
  /*TODO refactor code duplication (reverse logic of colSPandBefore */
  colSpanAfter : function() {
    switch (this.transferType()) {
        case 'internal' :
            return 2;
            break;
        // Not called for outgoing tx row
        case 'incoming' :
            return 4;
            break;
    }
  }

});
