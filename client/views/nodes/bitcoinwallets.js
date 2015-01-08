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
  }
});

Template.bitcoinWallets.events({
  'click .delete-bitcoin-wallet': function () {
    return BitcoinWallets.remove({
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
        .toggleClass('fa-angle-up')
        .toggleClass('fa-angle-down');
    });
  }
});



