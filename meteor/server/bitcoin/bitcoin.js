var chain = Meteor.npmRequire('chain-node');

Meteor.methods({
	getBitcoinAddressBalance: function (AddressId) {
		var addressObject = (BitcoinAddresses.findOne({"userId": this.userId, "_id": AddressId}))
		var address = addressObject.address;
		chain.apiKeyId = 'a3dcecd08d5ef5476956f88dace0521a';
		chain.apiKeySecret = '9b846d2e90118a901b9666bef6f78a2e';
		syncGetAddress = Async.wrap(chain, 'getAddress');
		BitcoinAddresses.update({ _id: AddressId },
   			{ $set: {
   				balance : syncGetAddress(address).balance
   			}
   		});
  }
});