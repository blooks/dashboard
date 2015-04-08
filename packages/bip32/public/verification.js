BIP32 = {}

BIP32.localXPubCheck = function (xpubkey) {
    return xpubkey.match(/^xpub[A-Za-z0-9]{107}$/);
}

BIP32.checkxpuburi = function(uri) {
  var query = uri.query;
  var xpubkey = uri.path;
  if (!xpubkey || !BIP32.localXPubCheck(xpubkey)) {
        return 'invalidBIP32xpub';
  }
  if (query) {
    var queryParams = URI.parseQuery(query);
    if (!queryParams.h) {
      return 'missingHierarchieParam';
    }
    else if (queryParams.h !== "bip32") {
      return 'invalidHierarchie';
    }
  }
}
