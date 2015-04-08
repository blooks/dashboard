'use strict';

var bitcore = Meteor.npmRequire('bitcore');


Meteor.methods({
  isValidXPub: function (xpubkey) {
    return bitcore.HDPublicKey.isValidSerialized(xpubkey);
  }
});
