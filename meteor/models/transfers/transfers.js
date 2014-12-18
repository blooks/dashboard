var labelForVolumeFragment = function (volumeFragment) {
    return nodeLabel(volumeFragment.nodeId);
};
var nodeLabel = function (nodeId) {
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
            return result.label
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
    } else return null;
};

var serverVar = false;

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
            if (getNodeIdForInOutput(output) == senderNodeId) {
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
                if (temp != senderNodeId) {
                    result = temp;
                }
            }
        });
        return result;
    },
    toInternalLabel: function () {
        return nodeLabel(this.recipientNodeId());
    },
    fromInternalLabel: function () {
        return nodeLabel(this.senderNodeId());
    },
    toExternalLabel: function () {
        return "Outgoing";
    },
    fromExternalLabel: function () {
        return "Incoming";
    },
    valueLabel: function () {
        return this.baseVolume
    },
    isInternal: function () {
        if (this.senderNodeId() && this.recipientNodeId()) {
            return true;
        }
        return false;
    },
    toExternal: function () {
        if (this.senderNodeId()) {
            return true;
        }
        return false;
    },
    fromExternal: function () {
        if (this.recipientNodeId()) {
            return true;
        }
        return false;
    }
});

if (Meteor.isServer) {
    Transfers.after.insert(function (userId, doc) {
        var transfer = Transfers.findOne({"_id": doc._id});
        var valuedCurrency = transfer.details.currency;
        var valuedCurrencyAmount = transfer.amount();
        var valuedDate = transfer.date;
        var baseVolume = Coynverter.calculateBaseAmount(valuedCurrencyAmount, valuedCurrency, valuedDate);
        Transfers.update({"_id": doc._id}, {$set: {"baseVolume": baseVolume}});
        //  updateBaseVolume(baseVolume);
    });

    var updateBaseVolume = function (baseVolume) {
        Transfers.update({"_id": doc._id}, {$set: {"baseVolume": baseVolume}});
    }
}

