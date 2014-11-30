if (Meteor.isServer) {
    Meteor.startup(function () {
            var WebSocket = Meteor.npmRequire('ws');
            var Fiber = Meteor.npmRequire('fibers');
            var chainWS = new WebSocket("wss://ws.chain.com/v2/notifications");

            chainWS.on('open', function() {
                var req = {type: "new-transaction", block_chain: "bitcoin"};
                chainWS.send(JSON.stringify(req));
            });
            chainWS.on('message', Meteor.bindEnvironment(function (data, flags) {
                var x = JSON.parse(data);
                var outputs = x.payload.transaction.outputs;
                var inputs = x.payload.transaction.inputs;
                var inoutputs = inputs.concat(outputs);

                inoutputs.forEach(function (input) {
                        var addresses = input.addresses;
                        addresses.forEach(function (address) {
                            var knownAddresses = BitcoinAddresses.find({'address': address}).fetch();
                            if (knownAddresses) {
                                knownAddresses.forEach(function (address) {
                                    {
                                        console.log('Received transaction for a user!');
                                        var wallet = BitcoinWallets.findOne({_id: address.walletId});
                                        Meteor.call('updateTx4Wallet', wallet);
                                    }
                                });
                            }
                        });
                    }
                );
                }, function () { console.log('Failed to bind environment'); }));
            });
        }