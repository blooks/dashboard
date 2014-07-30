//tests/posts.js
var assert = require('assert');

suite('Transactions', function() {
  test('in the server', function(done, server) {
    server.eval(function() {
      Transactions.insert(  {
       "_id": "1"
  ,  "userId": "1"
  ,  "in" : {
        "amount": "1"
    , "currency": "BTC"
  }
  , "out" : {
      "amount": "100"
    , "currency": "USD"
  }
  , "base" : {
      "amount": "100"
      , "currency": "USD"
  }
  , "date" : "2013-04-10T09:14:29+01"
  , "source" : "bitstamp"
  , "importId" : "1"
  , "importLineId" : "1"
  }
  );
      var trades = Transactions.find().fetch();
      emit('trades', trades);
    });

    server.once('trades', function(trades) {
      assert.equal(trades.length, 1);
      done();
    });
  });
});