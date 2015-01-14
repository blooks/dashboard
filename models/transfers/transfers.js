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

if (Meteor.isServer) {
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
    },senderNodeId: function () {
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
      //If we do know neither the sender nor the
      // recipient this is a malformed transfer
      // TODO: Implement proper error.
      console.log('Trying to determine type of malformed transfer');
      return "error";
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
    updateRepresentation: function () {
      var transfer = Transfers.findOne({"_id": this._id});
      var representation = {};
      representation.type = transfer.transferType();
      representation.amount = transfer.amount();
      representation.senderLabels = [transfer.senderLabel()];
      representation.recipientLabels = [transfer.recipientLabel()];
      representation.baseVolume =
        Coynverter.calculateBaseAmount(
          transfer.amount(),
          transfer.details.currency,
          transfer.date);
      Transfers.update(
        {"_id": this._id},
        {$set: {"representation": representation}}
      );
    }
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
  }
});
