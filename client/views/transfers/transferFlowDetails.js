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
       if (result > 0) {
         result = "-" + result;
       } else {
         result = " " + result;
       }
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
  },
  editing:function(){
    var instance = Template.instance();
    return  instance.vars.get('editing');
  }
});

var saveTransfer = function(templateInstance) {
    var instance = Template.instance();
    var newNote = instance.$('.note-input').val();
    var customValue = Number(instance.$('.value-input').val());
    var oldValue = Number(instance.$('.value-input').data('old-valuation'));
    var update;
    if (newNote) {
      update = {
        note : newNote
      };
    }
    if (customValue !== oldValue) {
      if (!update) {
        update = {};
      }
      update.customValue = Math.round(customValue * 10e7);
    }
  if (update) {
    Transfers.update(templateInstance._id, {$set: update});
  }
    instance.vars.set('editing', false);
};

Template.transferRow.events({
  'click #editButton, click .fiat-value-cell, click .note-cell' : function(event, template) {
    var instance = Template.instance();
    instance.vars.set('editing', true);
  },
  'click #saveButton' : function(event, template) {
    saveTransfer(this);
  },
  'keypress': function(event) {
    var instance = Template.instance();
    var editing = instance.vars.get('editing');
    if (editing && event.keyCode === 13) {
      saveTransfer(this);
    }
  }
});

Template.transferRow.onCreated( function(){
  var self = this;
  self.vars = new ReactiveDict();
  self.vars.setDefault( 'editing' , false );
});
