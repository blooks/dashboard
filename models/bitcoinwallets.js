


this.BitcoinWallets = new Mongo.Collection('bitcoinwallets');

if (this.Schemas == null) {
  this.Schemas = {};
}

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
      if (this.field('type').value === 'single-addresses') {
        return;
      }
      var rawSeedData = this.value;

      //An HD Seed is required for all wallets that are not single-addresses wallets
      if (!this.value) {
        return 'required';
      }

      switch (this.field('type').value) {
        case 'electrum':
          if (!Electrum.verifyMPK(this.value)) {
            return 'invalidElectrumSeed';
          }
          break;
        case 'bitcoin-wallet':
        case 'electrum2' :
        case 'trezor':
        case 'mycelium':
          var uri = URI.parse(this.value);
          var errorMessage = BIP32.checkxpuburi(uri);
          if (errorMessage) {
            return (errorMessage);
          }
          rawSeedData = uri.path;
          if (Meteor.isClient && this.isSet) {
            Meteor.call("isValidXPub", rawSeedData, function (error, result) {
              if (!result) {
                BitcoinWallets.simpleSchema().namedContext("addNewBitcoinWallet").addInvalidKeys([
                  {
                    name: "hdseed",
                    type: "checksumfailed"
                  }
                ]);
              }
            });
          } else if (Meteor.isServer) {
            Meteor.call("isValidXPub", rawSeedData);
          }
          break;
        case 'armory':
          if (this.value) {
            var rootData = Armory.convertStringToRootData(this.value);
            if (!rootData) {
              return 'invalidArmorySeed';
            }
            else if (BitcoinWallets.findOne({
                userId: Meteor.userId(),
                'hdseed.id': rootData[1],
                'hdseed.data': rootData[2]})) {
              return "seedAlreadyStored";
            }
          }
          break;
      }
      // DGB 2015-01-22 08:09 Common test for all wallet types
      if (BitcoinWallets.findOne({userId: Meteor.userId(),hdseed:rawSeedData})) {
        return "seedAlreadyStored";
      }
      return;
    }
  },
  superNode: {
    type: Schemas.nodeReference,
    optional: true
  },
  updating:  {
    type: Boolean,
    defaultValue: false
  },
  /*
    externalId needs to be userId+externalId for the "unique" to properly work.
    Mongo does not support spare, compound and unique indexes.
   */
  externalId: {
    type: String,
    unique: true,
    optional: true
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
  invalidBIP32xpub: "xpub string is not of the correct format!",
  invalidElectrumSeed: "[label] is not of the correct electrum Master Public Key format.",
  seedAlreadyStored: "A wallet with this [label] is already in the database.",
  invalidHierarchie: "Bitcoin Wallet only supports the BIP32 hierarchie. Check the value of the query parameter &quot;h&quot;",
  missingHierarchieParam: "Giving a URL, but the hierarchie parameter is missing.",
  invalidArmorySeed: "[label] is not of the correct Armory Watch-Only Root ID/Data format.",
  checksumfailed: "There is a typo in the input for [label]. Please check again."
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
  singleAddresses: function() {
    return BitcoinAddresses.find({"walletId": this._id, "order" : { $lt: 0 } }).fetch();
  },
  update: function () {
    Meteor.call('updateTx4Wallet', this);
  },
  saneBalance: function () {
    return (this.balance() / 10e7).toFixed(8);
  },
  //If the wallet has a supernode it is readonly for the user.
  readOnly: function () {
    return (this.superNode !== undefined);
  }
});

BitcoinWallets.before.remove(function (userId, doc) {
  var self = BitcoinWallets.findOne({_id: doc._id});
  if (self.superNode) {
    switch (self.superNode.nodeType) {
      case 'exchange':
        Exchanges.remove({_id: self.superNode.id});
        break;
    }
  };
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
  BitcoinWallets.before.insert(function (userId, doc) {
    switch (doc.type) {
      case 'armory':
        if (typeof doc.hdseed === 'string') {
          var match = Armory.convertStringToRootData(doc.hdseed);
          doc.hdseed = {
            id: match[1],
            data: match[2]
          };
        }
        break;
      case 'bitcoin-wallet':
      case 'trezor':
      case 'mycelium':
        if (!BIP32.localXPubCheck(doc.hdseed)) {
          var cleanedHDSeed = URI.parse(doc.hdseed).path;
          if (BIP32.localXPubCheck(cleanedHDSeed)) {
            doc.hdseed = cleanedHDSeed;
          } else {
            console.log("Found broken hdseed string on wallet insert");
          }
        }
        break;
    }
  });
  BitcoinWallets.after.insert(function (userId, doc) {
    Meteor.call('updateTx4Wallet', doc);
  });
}
