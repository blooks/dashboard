Template.transferRow.helpers({
  signedSaneAmount : function(transfer) {
    var result = transfer.saneAmount();
    switch (transfer.representation.type) {
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
    switch (this.representation.type) {
        case 'internal' :
            return 2;
        case 'outgoing' :
            return 4;
        //  Not called for incoming tx row
    }
  },
  /*TODO refactor code duplication (reverse logic of colSPandBefore */
  colSpanAfter : function() {
    switch (this.representation.type) {
        case 'internal' :
            return 2;
        // Not called for outgoing tx row
        case 'incoming' :
            return 4;
    }
  },
  recipientLabel : function() {
    return this.representation.recipientLabels[0];
  },
  senderLabel : function() {
    return this.representation.senderLabels[0];
  },
  baseVolumeRep: function() {
    var baseCurrency = Meteor.user().profile.currency;
    return this.volumeInCurrency(baseCurrency);
  },
  currency: function () {
    return Meteor.user().profile.currency;
  }
});
