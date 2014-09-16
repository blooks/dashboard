// on the client
Template.transactions.helpers({
    transactions: function(){
        return Transactions.find().fetch();
    }
});