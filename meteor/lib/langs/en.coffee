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
      addSingle: 'Add Single Transaction'
    buttons:
      newTransaction: 'Add Transaction'
      calculateTax: 'Calculate Tax'
