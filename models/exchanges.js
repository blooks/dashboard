this.Exchanges = new Meteor.Collection('exchanges');

if (this.Schemas == null) {
  this.Schemas = {};
}


var checkAPIKeyCoinbase = function(string) {
  return string.match(/^[A-Z,a-z,0-9]{16}$/);
};

var checkAPISecretCoinbase = function(string) {
  return string.match(/^[A-Z,a-z,0-9]{32}$/);
};

Schemas.exchangeCredentials = new SimpleSchema({
  secret: {
    type: String,

    custom: function() {
      if (this.value) {
        if (!checkAPISecretCoinbase(this.value)) {
          return "coinbaseapisecretwrongformat";
        }
        if (
          this.field('credentials').value["APIKey"] &&
          checkAPIKeyCoinbase(this.field('credentials').value["APIKey"])
        ) {
          if (Meteor.isClient) {

              Meteor.call('checkCoinbaseCredentials', this.field('credentials').value["APIKey"], this.value, function (error, result) {
                switch (result) {
                  case "noaccess":
                    Exchanges.simpleSchema().namedContext("insertExchangeForm").addInvalidKeys([
                      {
                        name: "credentials.APIKey",
                        type: "noaccess"
                      }
                    ]);
                    Exchanges.simpleSchema().namedContext("insertExchangeForm").addInvalidKeys([
                    {
                      name: "credentials.secret",
                      type: "noaccess"
                    }
                  ]);
                    break;
                  case "toomanypermissions":
                    break;
                  case "missingpermissions":
                    break;
                }
              });
            } else {
               return Meteor.call('checkCoinbaseCredentials', this.field('credentials').value["APIKey"], this.value);
            }
        }
      }
      else {
        return "required";
      }
    }
  },
  APIKey: {
    type: String,
    custom: function() {
      if (this.value) {
        if (!checkAPIKeyCoinbase(this.value)) {
          return "coinbaseapikeywrongformat";
        }
      } else {
        return "required";
      }
    }
  },
  exchange: {
    type: String,
    optional: true,
    allowedValues: Meteor.settings["public"].coyno.supportedExchanges
  }
});

Schemas.Exchanges = new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  label: {
    type: String
  },
  exchange: {
    type: String,
    allowedValues: Meteor.settings["public"].coyno.supportedExchanges
  },
  credentials: {
    type: Schemas.exchangeCredentials
  },
  subNode : {
    type: Schemas.nodeReference,
    optional: true
  }
});

Exchanges.attachSchema(Schemas.Exchanges);

Exchanges.timed();

Exchanges.owned();

Exchanges.allow({
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

if (Meteor.isClient)
{
Exchanges.helpers({

  update: function () {
    Meteor.call('updateExchange', this);
  }
});
}
if (Meteor.isServer)
{
  var Coinbase = Meteor.npmRequire('coinbase');
  Exchanges.helpers({
  update: function() {
    var userId = this.userId,
      self = this;
    if (this.exchange && this.exchange === 'coinbase') {
      var coinbase = new Coinbase({
        APIKey: this.credentials.APIKey,
        APISecret: this.credentials.secret
      });
      var wrappedCoinbase = Async.wrap(coinbase, ["listAllAddresses"]);
      var addresses = wrappedCoinbase.listAllAddresses();
      var wallet = null;
      var numNewAddresses = 0;
      if (this.subNode) {
        wallet = BitcoinWallets.findOne({_id: this.subNode.id});
      } else {
        var shadowWallet = {
          userId: this.userId,
          label: this.label,
          type: "single-addresses",
          superNode: {
            nodeType: 'exchange',
            id: this._id
          }
        };
        var walletId = null;
        try {
          walletId = BitcoinWallets.insert(shadowWallet);
          var subNode = {
            nodeType: 'bitcoinwallet',
            id: walletId
          };
          Exchanges.update({_id: this._id},{$set : {subNode: subNode}});
        } catch (err) {
          //Duplicate key. Do nothing.
        }
        wallet = BitcoinWallets.findOne({_id: walletId});
      }
      addresses.forEach(function(address) {
        var coynoAddress = {
          userId: userId,
          walletId: wallet._id,
          address: address,
          order: -1
        };
        try {
          BitcoinAddresses.insert(coynoAddress);
          ++numNewAddresses;
        } catch (err) {
          console.log(err);
        }
      });
      if (numNewAddresses > 0) {
        wallet.update();
      }
    }
  }
  });
}

if (Meteor.isServer) {
  Exchanges.after.insert(function (userId, doc) {
    Exchanges.findOne({_id: doc._id}).update();
  });
}



Exchanges.simpleSchema().messages({
  noaccess: "The credentials are invalid. We cannot get access to Coinbase."
});


// ---
// generated by coffee-script 1.9.0
