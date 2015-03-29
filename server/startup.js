Meteor.startup(function () {
  SyncedCron.add({
    name: 'Update Wallets',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.cron('10 0 * * * *');
    },
    job: function() {
      BitcoinWallets.find().forEach(function(wallet) {
        wallet.update();
      });
    }
  });
  SyncedCron.start();
});
