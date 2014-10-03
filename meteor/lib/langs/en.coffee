# Let's try to separate strings by views, as much as possible.
i18n.map 'en_GB',

  # Template wide strings
  template:
    headings:
      dashboard: 'Dashboard'
      trades: 'Trades'
      upload: 'Upload'
      settings: 'Settings'
      help: 'Help'
      accounts: 'Accounts'
  
  # Transactions
  trades:
    headings:
      table:
        inflow: 'Inflow'
        outflow: 'Outflow'
        date: 'Date'
        source: 'Source'
        inAmount: 'Value bought'
        inCurrency: 'Currency'
        outAmount: 'Value sold'
        outCurrency: 'Currency sold'
        volume: 'Volume'
      trades: 'Trades'
      noTransactions: 'No trades...'
      addSingle: 'Add Single Transaction'
    buttons:
      newTransaction: 'Add Transaction'
      calculateTax: 'Calculate Tax'
    text:
      noTransactions: 'Please add some transactions to get started. Either import or add manually below.'
    help: 'Put in the transactions please.'
    tooltip:
      date: 'Input date must be in format: dd/mm/yyyy'
      source: 'Lorem Ipsum Tooltip Text'
      inAmount: 'Lorem Ipsum Tooltip Text'
      inCurrency: 'Lorem Ipsum Tooltip Text'
      outAmount: 'Lorem Ipsum Tooltip Text'
      outCurrency: 'Lorem Ipsum Tooltip Text'
      volume: 'Lorem Ipsum Tooltip Text'
  # Nodes
  nodes:
    headings:
      nodes: "Accounts"
      addSingle: "New Account"
    buttons:
      save: "Save"
      updateTransactions: 'Update Transactions'
      deleteAll: 'Delete All Transactions'
    exchanges:
      addNewExchange: "Add exchange"
      deleteExchange: "Delete exchange"