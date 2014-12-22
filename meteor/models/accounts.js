Meteor.users.helpers({
    networthData: function () {

        var satoshiToBTC = function(amount) {
            return (amount/100000000).toFixed(8)
        };
        var balances = [];
        var changes = [];
        var balance = 0;
        var change = 0;
        var week = 1357603200000;
        var timeDelta = 86400000;
        Transfers.find({"details.currency": 'BTC'} , {sort: ['date','asc']}).forEach(function(transfer) {
            while (transfer.date.getTime() >= week) {
                balances.push([week, satoshiToBTC(balance)]);
                changes.push([week, satoshiToBTC(change)]);
                change = 0;
                week += timeDelta;
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
        balances.push([week, satoshiToBTC(balance)]);
        changes.push([week, satoshiToBTC(change)]);
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