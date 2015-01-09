var nodeLabel = function nodeLabel(nodeId) {
  if (nodeId) {
    var result = Exchanges.findOne({"_id": nodeId});
    if (result) {
      return result.exchangeLabel;
    }
    result = BitcoinAddresses.findOne({"_id": nodeId});
    if (result) {
      return BitcoinWallets.findOne({"_id": result.walletId}).label;
    }
    result = BitcoinWallets.findOne({"_id": nodeId});
    if (result) {
      return result.label;
    }
    result = BankAccounts.findOne({"_id": nodeId});
    if (result) {
      return result.label;
    }
  }
  return "";
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

Transfers.helpers({
  transfer: function () {

  },
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
   * Fetches label of a known recipient. Note that calling this
   * function assumes
   * that the transfer has a valid recipientNodeId.
   * @returns {string} Label of the Node.
   */
  internalRecipientLabel: function () {
    return nodeLabel(this.recipientNodeId());
  },
  /**
   * Fetches label of a known sender. Note that calling this function assumes
   * that the transfer has a valid senderNodeId.
   * @returns {string} Label of the Node.
   */
  outgoingRecipientLabel: function () {
    return nodeLabel(this.senderNodeId());
  },
  outgoingLabel: function () {
    return "Outgoing";
  },
  incomingLabel: function () {
    return "Incoming";
  },
  valueLabel: function () {
    return this.baseVolume;
  },
  /**
   * Determines if transfer is internal
   * @returns {boolean} true if the sender and the recipient of the
   * transfer are known
   */
  isInternal: function () {
    if (this.senderNodeId() && this.recipientNodeId()) {
      return true;
    }
    return false;
  },
  /**
   * Determines if transfer is outgoing
   * @returns {boolean} true if the sender of the transfer is known
   */
  isOutgoing: function () {
    if (this.senderNodeId()) {
      return true;
    }
    return false;
  },
  /**
   * Determines if transfer is incoming
   * @returns {boolean} true if the recipient of the transfer is known
   */
  isIncoming: function () {
    if (this.recipientNodeId()) {
      return true;
    }
    return false;
  },
  /**
   * Determines the type of the transfer
   * @returns {string} type of transfer. 'internal', 'outgoing' or 'incoming'
   */
  transferType: function() {
    if(this.isInternal()) {
      return "internal";
    } else if(this.isOutgoing()){
      return "outgoing";
    } else {
      return "incoming";
    }
  }
});

if (Meteor.isServer) {
  /**
   * Calculates the baseVolume for the transfer.
   * @param docId id of the transfer document to update BaseVolume of
   */
  var updateBaseVolume = function (docId) {
    var transfer = Transfers.findOne({"_id": docId});
    var baseVolume = Coynverter.calculateBaseAmount(
      transfer.amount(), transfer.details.currency, transfer.date);
    Transfers.update({"_id": docId}, {$set: {"baseVolume": baseVolume}});
  };

  Transfers.after.insert(function (userId, doc) {
    updateBaseVolume(doc._id);
  });
}
