this.BitcoinAddresses = new Mongo.Collection('bitcoinaddresses');

if (this.Schemas == null) {
  this.Schemas = {};
}

Schemas.BitcoinAddresses = new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  walletId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  label: {
    type: String,
    optional: true
  },
  order: {
    type: Number,
    defaultValue: -1
  },
  address: {
    type: String,
    custom: function() {
      console.log('Client sided address checking for: ' + this.value);
      if (!this.value.match(/^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/)) {
        return "invalidAddress";
      }
      if (Meteor.isClient && this.isSet) {
        return Meteor.call("isValidBitcoinAddress", this.value, function(error, result) {
          switch (result) {
            case "invalidFormat":
            BitcoinAddresses.simpleSchema().namedContext("insertBitcoinAddressForm").addInvalidKeys([
              {
                name: "address",
                type: "invalidAddress"
              }
            ]);
            break;
            case "duplicate":
              BitcoinAddresses.simpleSchema().namedContext("insertBitcoinAddressForm").addInvalidKeys([
                {
                  name: "address",
                  type: "duplicate"
                }
              ]);
          }
        });
      }
    }
  },
  balance: {
    type: Number,
    defaultValue: 0
  }
});

BitcoinAddresses.attachSchema(Schemas.BitcoinAddresses);

BitcoinAddresses.timed();

BitcoinAddresses.owned();

BitcoinAddresses.allow({
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


if (Meteor.isServer) {
  var computeBalance = function (transactions, address) {
    var result = 0;
    transactions.forEach(function (transaction) {
      if (transaction.details.currency !== "BTC") {
        throw new Meteor.Error(500, 'Minion to compute balance for Bitcoin Addresses here: You gave non bitcoin transfers to me! Shame on you!');
      }
      transaction.details.inputs.forEach(function (input) {
        var inputNode = BitcoinAddresses.findOne({"_id": input.nodeId});
        if (inputNode) {
          if (inputNode.address === address) {
            result -= input.amount;
          }
        }
      });
      transaction.details.outputs.forEach(function (output) {
        var outputNode = BitcoinAddresses.findOne({"_id": output.nodeId});
        if (outputNode) {
          if (outputNode.address === address) {
            result += output.amount;
          }
        }
      });
    });
    return result;
  };
  BitcoinAddresses.after.remove(function (userId, doc) {
    //TODO: @LEVIN redundant code! Remove!
    var transactions = function (doc) {
      var nodeId = doc._id;
      return Transfers.find(
        {
          $or: [
            {'details.inputs': {$elemMatch: {'nodeId': nodeId}}},
            {'details.outputs': {$elemMatch: {'nodeId': nodeId}}}
          ]
        });
    };
    var transfers = transactions(doc);
    transfers.forEach(function (transfer) {
      transfer.update();
      transfer = Transfers.findOne({"_id": transfer._id});
      if (transfer.representation.type === 'orphaned') {
        Transfers.remove({"_id": transfer._id});
      }
    });
  });
  BitcoinAddresses._ensureIndex({userId: 1, address: 1}, {unique: true});
}


BitcoinAddresses.simpleSchema().messages({
  invalidAddress: "[label] is not a Bitcoin Address",
  duplicate: "[label] is already stored in another wallet"
});

BitcoinAddresses.helpers({
  update: function () {
    var transactions = this.transactions();
    var balance = computeBalance(transactions, this.address);
    BitcoinAddresses.update({"_id": this._id}, {$set: {"balance": balance}});
  },
  transactions: function () {
    var nodeId = this._id;
    return (Transfers.find(
      {
        $or: [
          {'details.inputs': {$elemMatch: {'nodeId': nodeId}}},
          {'details.outputs': {$elemMatch: {'nodeId': nodeId}}}
        ]
      }).fetch());
  }
});
