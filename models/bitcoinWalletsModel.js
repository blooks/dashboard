this.BitcoinWallets = new Meteor.Collection('bitcoinwallets');

if (this.Schemas == null) {
  this.Schemas = {};
}

Schemas.ArmoryRootData = new SimpleSchema;

Schemas.ElectrumRootData = new SimpleSchema;

Schemas.BitcoinWallets = new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  label: {
    type: String,
    optional: true,
    max: 50, //DGB 2015-01-22 06:01 50 characteres max
    min: 1,
    custom: function() {
      // DGB 2015-01-22 07:15 Checks if this label is unique for this user,
      // returns string if invalid
      return (BitcoinWallets.findOne({userId: Meteor.userId(),label:this.value})!==undefined)?'Wallet is not unique':true;
    }
  },
  type: {
    type: String,
    allowedValues: Meteor.settings["public"].coyno.supportedBitcoinWalletTypes
  },
  hdseed: {
    type: String,
    optional: true,
    custom: function() {
      // DGB 2015-01-22 07:15 Checks if this seed is unique for this user,
      // returns string if invalid
      if (this.field('type').value==='Single Addresses') {
        // This field is actually not needed for Single Addresses
      }
      if (this.field('type').value==='Electrum') {
        if (this.value.length!==128) {
          return 'Seed does not have the proper length for this wallet type';
        }
        // DGB 2015-01-22 09:33 Correct char set 
        if (!(/^[0-9A-HJ-NP-Za-km-z]*$/.test(this.value))) {
          return 'Seed has non valid characters';
        }
      }
      if (this.field('type').value==='BIP32') {
        if (this.value.length!==111) {
          return 'Seed does not have the proper length for this wallet type';
        }
        // DGB 2015-01-22 09:33 Correct char set 
        if (!(/^[0-9A-HJ-NP-Za-km-z]*$/.test(this.value))) {
          return 'Seed has non valid characters';
        }
      } 
      // DGB 2015-01-22 08:09 Common test for all wallet types 
      return (BitcoinWallets.findOne({userId: Meteor.userId(),hdseed:this.value})!==undefined)?'Seed is not unique':true;
    }
  }
});

BitcoinWallets.attachSchema(Schemas.BitcoinWallets);

BitcoinWallets.timed();

BitcoinWallets.owned();

BitcoinWallets.allow({
  insert: function(userId, item) {
    if (userId == null) {
      throw new Meteor.Error(400, "You need to log in to insert.");
    }
    return _.extend(item, {
      userId: userId
    });
  },
  update: function(userId, doc, filedNames, modifier) {
    if (userId !== doc.userId) {
      throw new Meteor.Error(400, "You can only edit your own entries.");
    }
    return true;
  },
  remove: function(userId, doc) {
    if (doc.userId !== userId) {
      throw new Meteor.Error(400, "You can only delete your own entries.");
    }
    return true;
  }
});
  

