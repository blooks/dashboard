# Show placeholders if no string exists
i18n.showMissing(true) 

# Let's try to separate strings by views, as much as possible.
i18n.map 'en_GB',
  
  # Transactions
  transactions:
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
      transactions: 'Transactions'
      noTransactions: 'No transactions...'
      addSingle: 'Add Single Transaction'
    buttons:
      newTransaction: 'Add Transaction'
      calculateTax: 'Calculate Tax'
    text:
      noTransactions: 'Please add some transactions to get started. Either import or add manually below.'
