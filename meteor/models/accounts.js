Meteor.users.helpers({
    networthData: function () {

        var satoshiToBTC = function(amount) {
            return (amount/100000000).toFixed(8)
        };
        var balances = [];
        var changes = [];
        var balance = 0;
        var change = 0;
        var time = 0;
        var timeDelta = 86400;
        Transfers.find({"details.currency": 'BTC'} , {sort: ['date','asc']}).forEach(function(transfer) {
            //Start from timedelta before the time of the first transaction
            if (time == 0) {
                time = transfer.date.getTime() - timeDelta;
            }
            while (transfer.date.getTime() >= time) {
                balances.push([time, parseFloat(satoshiToBTC(balance))]);
                changes.push([time, parseFloat(satoshiToBTC(change))]);
                change = 0;
                time += timeDelta;
            }
            if (transfer.fromExternal()) {
                balance += transfer.amount();
                change += transfer.amount();
            }
            if (transfer.toExternal()) {
                balance -= (transfer.amount() - transfer.fee());
                change -= (transfer.amount() - transfer.fee());
            }
        });
        balances.push([time, parseFloat(satoshiToBTC(balance))]);
        changes.push([time, parseFloat(satoshiToBTC(change))]);
        return  [balances, changes];
    },
    totalBalance: function(currency) {
        var result = 0;
        Transfers.find({"details.currency": currency}).forEach(function(transfer) {
            if (transfer.fromExternal()) {
                result += transfer.amount();
            }
            if (transfer.toExternal()) {
                result -= (transfer.amount() + transfer.fee());
            }
        });
        return result;
    }
});