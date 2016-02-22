'use strict';

var bitcore = Npm.require('bitcore-lib');


Meteor.methods({
  isValidXPub: function (xpubkey) {
    return bitcore.HDPublicKey.isValidSerialized(xpubkey);
  }
});
