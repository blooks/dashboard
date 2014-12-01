var WebSocket = require('ws');
var MongoDb = require('mongodb');
var MongoClient = MongoDb.MongoClient;
var assert = require('assert');



var chainWS = new WebSocket("wss://ws.chain.com/v2/notifications");

chainWS.on('open', function() {
    var req = {type: "new-transaction", block_chain: "bitcoin"};
    chainWS.send(JSON.stringify(req));
});
chainWS.on('message', function (data, flags) {
    var x = JSON.parse(data);
    if (x.payload.type == "new-transaction") {
        var outputs = x.payload.transaction.outputs;
        var inputs = x.payload.transaction.inputs;
        var inoutputs = inputs.concat(outputs);
        var addresses  = [];
        inoutputs.forEach(function (input) {
             addresses = addresses.concat(input.addresses);
        });
        // Connection URL
        var url = 'mongodb://localhost:3001/meteor';
        // Use connect method to connect to the Server
        MongoClient.connect(url, function(err, db) {
            var bitcoinaddresses = db.collection('bitcoinaddresses');

            bitcoinaddresses.find({ "address": { $in : addresses}}).toArray(function (err, knownAddresses) {
                if (knownAddresses.length) {
                    console.dir(knownAddresses.address);
                }
              db.close();
            });
        });

        /*
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
         );*/
    }
});