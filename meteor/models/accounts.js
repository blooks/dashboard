Meteor.users.helpers({
    networthData: function () {

        var satoshiToBTC = function(amount) {
            return (amount/100000000).toFixed(8)
        };
        var balances = [];
        var incomes = [];
        var expenses = [];
        var income = 0;
        var expense = 0;
        var balance = 0;
        var week = 1357603200000;
        Transfers.find({"details.currency": 'BTC'} , {sort: ['date','asc']}).forEach(function(transfer) {
            while (transfer.date.getTime() >= week) {
                balances.push({key: 'balance', data: {x: week, y: satoshiToBTC(balance)}});
                incomes.push({date: week, amount: satoshiToBTC(income)});
                expenses.push({date: week, amount: satoshiToBTC(expense)});
                income = 0;
                expense = 0;
                week += 604800000;
            }
            if (transfer.fromExternal()) {
                balance += transfer.amount();
                income += transfer.amount();
            }
            if (transfer.toExternal()) {
                balance -= (transfer.amount() - transfer.fee());
                expense += (transfer.amount() - transfer.fee());
            }
        });
        balances.push({key: 'balance', data: [week, satoshiToBTC(balance)]});
        incomes.push({date: week, amount: satoshiToBTC(income)});
        expenses.push({date: week, amount: satoshiToBTC(expense)});
        return  balances;
    }
});