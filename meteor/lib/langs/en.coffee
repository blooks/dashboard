# Let's try to separate strings by views, as much as possible.
i18n.map 'en_GB',

  # Template wide strings
  template:
    headings:
      dashboard: 'Dashboard'
      transactions: 'Transactions'
      upload: 'Upload'
  
  # Transactions
  transactions:
    headings:
      table:
        inflow: 'Inflow'
        outflow: 'Outflow'
        date: 'Date'
        source: 'Source'
        inAmount: 'Volume bought'
        inCurrency: 'Currency'
        outAmount: 'Volume sold'
        outCurrency: 'Currency sold'
        volume: 'Volume'
      transactions: 'Transactions'
      noTransactions: 'No transactions...'
      addSingle: 'Add Single Transaction'
    buttons:
      newTransaction: 'Add Transaction'
      calculateTax: 'Calculate Tax'
    text:
      noTransactions: 'Please add some transactions to get started. Either import or add manually below.'
