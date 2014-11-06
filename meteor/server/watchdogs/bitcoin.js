if (Meteor.isServer) {
    Meteor.startup(function () {
            var WebSocket = Meteor.npmRequire('ws');
            var chainWS = new WebSocket("wss://ws.chain.com/v2/notifications");

            chainWS.on('open', function() {
                var req = {type: "new-transaction", block_chain: "bitcoin"};
                chainWS.send(JSON.stringify(req));
            });
            chainWS.on('message', function (data, flags) {
                var x = JSON.parse(data);
                console.log(x);
            }
            );
        }
    )
}