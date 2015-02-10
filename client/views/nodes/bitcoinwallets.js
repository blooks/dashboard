Template.bitcoinWallets.helpers({

  bitcoinwalletsinpacks: function (numberInPack) {
    var result = [];
    var temp = [];
    BitcoinWallets.find().forEach(function (wallet) {
      temp.push(wallet);
      if (temp.length > (numberInPack - 1)) {
        result.push(temp);
        temp = [];
      }
    });
    if (temp.length > 0) {
      result.push(temp);
    }
    return result;
  },
  bitcoinwallets: function () {
    return BitcoinWallets.find().fetch();
  },
  dynamicTemplate: function() {
    if (this.action === "add") {
      return "newBitcoinWallet";
    }
    return "";
  },
  singleAddressess: function() {
    return this.singleAddresses();
  }
});

Template.bitcoinWallets.events({
  'click .delete-bitcoin-wallet': function () {
    return BitcoinWallets.remove({
      _id: this._id
    });
  },
  'click .delete-bitcoin-address': function () {
  return BitcoinAddresses.remove({
    _id: this._id
  });
  },
  'click .update-wallet': function () {
    return this.update();
  },
  'click .body-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .node-body").slideToggle(400, function () {
      jQuery(targetID + " .body-toggle")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
    });
  },
  'click .data-toggle': function () {
    var targetID = "#" + this._id;
    jQuery(targetID + " .node-data").slideToggle(400, function () {
      jQuery(targetID + " .data-toggle")
        .toggleClass('icon-up-open-big')
        .toggleClass('icon-down-open-big');
    });
  }
});



