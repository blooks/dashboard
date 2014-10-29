// on the client
Template.nodes.helpers({
    showNodesOverview: function () {
        return this.type == "nodesOverview";
    },

    showCurrencyExchanges: function () {
        return this.type == "currencyExchanges";
    },

    showBankAccounts: function () {
        return this.type == "bankAccounts";
    },

    showBitcoinWallets: function () {
        return this.type == "bitcoinWallets";
    }
);