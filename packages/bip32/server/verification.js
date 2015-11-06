'use strict';

var bitcore = Npm.require('bitcore');


Meteor.methods({
  isValidXPub: function (xpubkey) {
    return bitcore.HDPublicKey.isValidSerialized(xpubkey);
  }
});
