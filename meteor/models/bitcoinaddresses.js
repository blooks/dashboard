if (Meteor.isServer) {
BitcoinAddresses.after.insert(function (userId, doc) {
	Meteor.call('getBitcoinAddressBalance', doc._id);
});
}