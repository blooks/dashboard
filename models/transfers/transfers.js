var nodeLabel = function nodeLabel(nodeId) {
  if (nodeId) {
    var result = BitcoinAddresses.findOne({"_id": nodeId});
    if (result) {
      return BitcoinWallets.findOne({"_id": result.walletId}).label;
    }
    result = BitcoinWallets.findOne({"_id": nodeId});
    if (result) {
      return result.label;
    }
  }
  return "External";
};

if (Meteor.isServer) {
  /**
   * [conversor function that saved to database the value of the bitcoin is USD and EUR for one date]
   * @param  {[type]} amount     [description]
   * @param  {[type]} date       [description]
   * @param  {[type]} transferId [description]
   * @return {[type]}            [description]
   */
  var conversor = function (amount, date, transferId) {
    var Fiber = Npm.require("fibers");
    var Coynverter = Meteor.npmRequire("coyno-converter");
    var coynverter = new Coynverter();
    var currencies = ["EUR", "USD"];
    currencies.forEach(function (currency){
      coynverter.convert("meteor", moment(date).format('YYYY-MM-DD'), currency, amount, "bitcoinExchangeRates", function (err, exchangeRate) {
        if(exchangeRate){
          Fiber(function() {
            var rateCurrency = {};
            rateCurrency[currency]=Math.round(exchangeRate);
            Transfers.update({"_id": transferId}, {$push: {"baseVolume": rateCurrency}});
          }).run();
        }
      });
    });
  };
  /**
   *
   * @param inoutput
   * @returns {*}
   */
  var getNodeIdForBitcoinAddress = function (userId, address) {
    var internalAddress = BitcoinAddresses.findOne({"userId": userId, "address": address});
    if (internalAddress) {
      return internalAddress._id;
    }
    //The Address does not belong to the user.
    return null;
  };
  /**
   *
   * @param inoutput
   * @returns {*}
   */
  var getNodeIdForInOutput = function (inoutput) {
    //The input comes from a known Node in our DB.
    var existingNodeId = inoutput.nodeId;
    //Lets find out whether there is a BitcoinWallet for this Node.
    var bitcoinWallet = null;
    if (existingNodeId) {
      var bitcoinAddress = BitcoinAddresses.findOne({"_id": existingNodeId});
      if (bitcoinAddress) {
        bitcoinWallet = BitcoinWallets.findOne({"_id": bitcoinAddress.walletId});
      }
    }
    if (bitcoinWallet) {
      return bitcoinWallet._id;
    }
    else {
      return null;
    }
  };

  Transfers.after.insert(function (userId, doc) {
    //Sanity check.
    var user = Meteor.users.findOne({_id: userId});
    if (! user.profile.hasTransfers) {
      Meteor.users.update({_id: userId}, {$set: {'profile.hasTransfers' : true}});
    }
    var transfer = Transfers.findOne({_id: doc._id, userId: userId});
    transfer.update();
  });
  Transfers.after.update(function (userId, doc, fieldNames, modifier, options) {
    var transfer = Transfers.findOne({_id: doc._id, userId: userId});
    if (transfer && !transfer.connected) {
      transfer.update();
    }
  });
  Transfers.helpers({
    inputSum: function () {
      var result = 0;
      this.details.inputs.forEach(function (input) {
        result += input.amount;
      });
      return result;
    },
    outputSum: function () {
      var result = 0;
      this.details.outputs.forEach(function (output) {
        result += output.amount;
      });
      return result;
    },
    fee: function () {
      return (this.inputSum() - this.outputSum());
    },
    senderNodeId: function () {
      var result = null;
      this.details.inputs.forEach(function (input) {
        if (!result) {
          result = getNodeIdForInOutput(input);
        }
      });
      return result;
    },
    recipientNodeId: function () {
      var senderNodeId = this.senderNodeId();
      var result = null;
      this.details.outputs.forEach(function (output) {
        if (!result) {
          var temp = getNodeIdForInOutput(output);
          if (temp !== senderNodeId) {
            result = temp;
          }
        }
      });
      return result;
    },
    /**
     * Fetches label of a the recipient. If the recipient
     * is unknown "External" is returned.
     * @returns {string} Label of the Node.
     */
    recipientLabel: function () {
      return nodeLabel(this.recipientNodeId());
    },
    /**
     * Fetches label of the sender. If the recipient is
     * unknown, "External" is returned.
     * @returns {string} Label of the sender.
     */
    senderLabel: function () {
      return nodeLabel(this.senderNodeId());
    },
    /**
     * Determines the type of the transfer
     * @returns {string} type of transfer. 'internal', 'outgoing' or 'incoming'
     */
    transferType: function () {
      if (this.senderNodeId()) {
        //We know the node it has been sent from so it is
        //either internal or outgoing.
        if (this.recipientNodeId()) {
          return 'internal';
        } else {
          return 'outgoing';
        }
      } else if (this.recipientNodeId()) {
        return "incoming";
      } else {
        return "orphaned";
      }
    },
    amount: function () {
      var result = this.outputSum();
      var senderNodeId = this.senderNodeId();
      this.details.outputs.forEach(function (output) {
        if (getNodeIdForInOutput(output) === senderNodeId) {
          result -= output.amount;
        }
      });
      return result;
    },
    update: function () {
      if (!this.connected) {
        this.connect();
      }
      var transfer = Transfers.findOne({"_id": this._id});
      var representation = {};
      representation.type = transfer.transferType();
      representation.amount = transfer.amount();
      representation.senderLabels = [transfer.senderLabel()];
      representation.recipientLabels = [transfer.recipientLabel()];
      conversor(representation.amount, transfer.date, transfer._id);
      Transfers.update(
        {"_id": transfer._id},
        {$set: {"representation": representation}}
      );
    },
    connect: function() {
      var inputs = [];
      var outputs = [];
      var userId = this.userId;
      this.details.inputs.forEach(function (input) {
          var nodeId = getNodeIdForBitcoinAddress(userId, input.note);
          if (nodeId) {
            input.nodeId = nodeId;
          }
          inputs.push(input);
        }
      );
      this.details.outputs.forEach(function(output) {
          var nodeId = getNodeIdForBitcoinAddress(userId, output.note);
          if (nodeId) {
            output.nodeId = nodeId;
          }
          outputs.push(output);
        }
      );
      Transfers.update({"_id": this._id},
        {$set: {'details.inputs' : inputs, 'details.outputs': outputs, 'connected': true}}
      );
    },
  });
}
Transfers.helpers({
  /**
   * Determines if transfer is internal
   * @returns {boolean} true if the sender and the recipient of the
   * transfer are known
   */
  isInternal: function () {
    return (this.representation.type === 'internal');
  },
  /**
   * Determines if transfer is outgoing
   * @returns {boolean} true if the sender of the transfer is known
   */
  isOutgoing: function () {
    return (this.representation.type === 'outgoing');
  },
  /**
   * Determines if transfer is incoming
   * @returns {boolean} true if the recipient of the transfer is known
   */
  isIncoming: function () {
    return (this.representation.type === 'incoming');
  },
  saneAmount: function () {
    if (this.details.currency === 'BTC') {
      return (this.representation.amount / 10e7).toFixed(8);
    } else {
      return (this.representation.amount / 10e7).toFixed(2);
    }
  },
  volumeInCurrency: function(currency) {
    return this.baseVolume.filter(function (entry) {
      return entry[currency];
    })[0][currency];
  }
});
