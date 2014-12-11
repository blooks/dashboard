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
    transfer: function() {

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
    fromExtern: function () {
        var senderNodeId = this.senderNodeId();
        if (this.senderNodeId()) {
            return "";
        }
        return "Incoming";
    },
    internSender: function () {
        var senderNodeId = this.senderNodeId();
        if (this.senderNodeId()) {
            return nodeLabel(senderNodeId);
        }
        return "";
    },
    internReceiver: function () {
        var recipientNodeId = this.recipientNodeId();
        if (this.recipientNodeId()) {
            return nodeLabel(recipientNodeId);
        }
        return "";
    },
    toExtern: function () {
        var recipientNodeId = this.recipientNodeId();
        if (this.recipientNodeId()) {
            return "";
        }
        return "Outgoing";
    },
    valueLabel: function () {
        return this.baseVolume
    },

    getState: function () {
        var senderNode = this.senderNodeId();
        var recipientNode = this.recipientNodeId();

        if(senderNode && recipientNode) {
            return "internal";
        } else if(senderNode) {
            return "fromExternal";
        } else {
            return "toExternal";
        }
    }
});

if (Meteor.isServer) {
    Transfers.after.insert(function (userId, doc) {
        var transfer = Transfers.findOne({"_id": doc._id});
        var valuedCurrency = transfer.details.currency;
        var valuedCurrencyAmount = transfer.amount();
        var valuedDate = transfer.date;
        console.log("1:CurrencyAmount: " + valuedCurrencyAmount);
        console.log("2:Currency: " + valuedCurrency);
        console.log("3:Date: " + valuedDate);
        var baseVolume = Coynverter.calculateBaseAmount(valuedCurrencyAmount, valuedCurrency, valuedDate);
        console.log("4:baseVolume: " + baseVolume);
        Transfers.update({"_id": doc._id}, {$set: {"baseVolume": baseVolume}});
    });
}

