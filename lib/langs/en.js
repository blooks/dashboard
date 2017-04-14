var exchangeTypes = {}
_.map(Meteor.settings[ 'public' ].coyno.availableExchanges,
  function (element) {
    exchangeTypes[ element.type ] = element.label
  })

i18n.map('en_GB', {
  template: {
    headings: {
      dashboard: 'Dashboard',
      trades: 'Trades',
      transfers: 'Transfers',
      upload: 'Upload',
      settings: 'Settings',
      help: 'Help',
      accounts: 'Wallets',
      exchanges: 'Exchanges',
      label: 'Label',
      wallets: 'Wallets'
    },
    buttons: {
      save: 'Save',
      add: 'Add'
    },
    modal: {
      noData: 'To get started with Coyno, please connect your Bitcoin wallets and exchanges.',
      connectExchange: 'Connect exchange',
      connectWallet: 'Connect wallet'
    }
  },
  trades: {
    headings: {
      table: {
        inflow: 'Inflow',
        outflow: 'Outflow',
        date: 'Date',
        source: 'Source',
        inAmount: 'Value bought',
        inCurrency: 'Currency',
        outAmount: 'Value sold',
        outCurrency: 'Currency sold',
        volume: 'Volume'
      },
      trades: 'Trades',
      noTransactions: 'No trades...',
      addSingle: 'Add Single Transaction'
    },
    buttons: {
      newTransaction: 'Add Transaction',
      calculateTax: 'Calculate Tax'
    },
    text: {
      noTransactions: 'Please add some transactions to get started. Either import or add manually below.'
    },
    help: 'Put in the transactions please.',
    tooltip: {
      date: 'Input date must be in format: dd/mm/yyyy',
      source: 'Lorem Ipsum Tooltip Text',
      inAmount: 'Lorem Ipsum Tooltip Text',
      inCurrency: 'Lorem Ipsum Tooltip Text',
      outAmount: 'Lorem Ipsum Tooltip Text',
      outCurrency: 'Lorem Ipsum Tooltip Text',
      volume: 'Lorem Ipsum Tooltip Text'
    }
  },
  transfers: {
    headings: {
      table: {
        inflow: 'Inflow',
        outflow: 'Outflow',
        date: 'Date',
        amount: 'Amount',
        currency: 'Currency',
        source: 'From',
        target: 'To',
        unknown: 'External',
        known: 'Internal',
        value: 'value'
      },
      transfers: 'Transfers',
      noTransfers: 'No transfers...'
    },
    text: {
      noTransfers: 'Please add some transactions to get started. Either import or add manually below.'
    },
    help: 'Put in the transactions please.',
    tooltip: {
      date: 'Input date must be in format: dd/mm/yyyy',
      source: 'Lorem Ipsum Tooltip Text',
      inAmount: 'Lorem Ipsum Tooltip Text',
      inCurrency: 'Lorem Ipsum Tooltip Text',
      outAmount: 'Lorem Ipsum Tooltip Text',
      outCurrency: 'Lorem Ipsum Tooltip Text',
      volume: 'Lorem Ipsum Tooltip Text',
      knownSource: 'Lorem Ipsum Tooltip Text',
      unknownSource: 'Lorem Ipsum Tooltip Text',
      value: 'Lorem Ipsum Tooltip Text'
    }
  },
  nodes: {
    headings: {
      nodes: 'Wallets',
      exchanges: 'Exchanges',
      addSingle: 'New Account',
      bitcoinWallets: 'Wallets',
      // not to be used
      wallets: 'Wallets'
    },
    buttons: {
      save: 'Save',
      updateTransactions: 'Update Transactions',
      deleteAll: 'Delete All Transactions'
    },
    exchanges: {
      label: 'Exchange label',
      addNewExchange: 'Connect exchange',
      add: 'Connect an exchange',
      addedExchange: 'Connected exchanges',
      home: 'Exchanges',
      title: 'Exchanges',
      deleteExchange: 'Delete exchange',
      type: exchangeTypes
    },
    wallets: {
      wallets: 'Wallets',
      walletLabelTitle: 'Wallet label',
      singleAddressHeader: '...or add addresses one-by-one manually',
      singleAddressExplainer: "If you want to manually connect addresses or a wallet that isn't listed above, you can do so by connecting a Single Address wallet."
    },
    bitcoinWallets: {
      home: 'Wallets',
      title: 'Wallets',
      add: 'Connect a wallet'
    }
  },
  profile: {
    headings: {
      profile: 'Profile'
    }
  }
})
