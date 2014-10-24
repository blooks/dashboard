Transfers.helpers({
	amountIncomingToNode: function(nodeId) {
		var result = 0;
		this.details.outputs.forEach(function (output) {
			if (output.nodeId == nodeId) result += output.amount;
		});
		return result;
	},
	amountOutgoingFromNode: function(nodeId) {
		var result = 0;
		this.details.inputs.forEach(function (input) {
			if (input.nodeId == nodeId) {
				result += input.amount;
			}
		});
		return result;
	}
});