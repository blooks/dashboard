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
    optional: true
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
      switch (this.field('type').value) {
        case 'single-addresses':
          break;
        case 'electrum':
          if (!this.value.match(/^[a-f0-9]{128}$/)) {
            return 'invalidElectrumSeed';
          }
          break;
        case 'bitcoin-wallet':
          if (this.value.match(/^xpub[A-Za-z0-9]{107}$/)) {
            break;
          }
          return 'invalidBIP32xpub';
      }
      // DGB 2015-01-22 08:09 Common test for all wallet types
      if (BitcoinWallets.findOne({userId: Meteor.userId(),hdseed:this.value})) {
        return "seedAlreadyStored";
      }
      return;
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

BitcoinWallets.simpleSchema().messages({
  invalidBIP32xpub: "[label] is not of the correct format!",
  invalidElectrumSeed: "[label] is not of the correct electrum Master Public Key format.",
  seedAlreadyStored: "A wallet [label] already in the database"
});



BitcoinWallets.helpers({
  balance: function () {
    var result = 0;
    var walletId = this._id;
    BitcoinAddresses.find({"walletId": walletId}).forEach(
      function (address) {
        result += address.balance;
      });
    Transfers.find(
      {
        $or: [
          {'details.inputs': {$elemMatch: {'nodeId': walletId}}},
          {'details.outputs': {$elemMatch: {'nodeId': walletId}}}
        ]
      }).forEach(function (transfer) {
        transfer.details.inputs.forEach(function (input) {
          if (input.nodeId === walletId) {
            result -= input.amount;
          }
        });
        transfer.details.outputs.forEach(function (output) {
          if (output.nodeId === walletId) {
            result += output.amount;
          }
        });
      });
    return result;
  },
  /**
   *
   * @returns {any|*}
   */
  addresses: function () {
    return BitcoinAddresses.find({"walletId": this._id}).fetch();
  },
  update: function () {
    Meteor.call('updateTx4Wallet', this);
  },
  saneBalance: function () {
    return (this.balance() / 10e7).toFixed(8);
  }
});

BitcoinWallets.before.remove(function (userId, doc) {
  var addresses = BitcoinAddresses.find({"walletId": doc._id});
  addresses.forEach(function (address) {
    BitcoinAddresses.remove({"_id": address._id});
  });
});

if (Meteor.isServer) {
  BitcoinWallets.after.remove(function (userId, doc) {
    var oneTransfer = Transfers.findOne({'userId': doc.userId});
    if (!oneTransfer) {
      Meteor.users.update({_id: userId}, {$set: {'profile.hasTransfers': false}});
    }
  });
  BitcoinWallets.after.insert(function (userId, doc) {
    Meteor.call('updateTx4Wallet', doc);
  });
}
