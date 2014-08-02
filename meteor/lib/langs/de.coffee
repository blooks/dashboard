# Show placeholders if no string exists
i18n.showMissing(true) 

# Let's try to separate strings by views, as much as possible.
i18n.map 'de_DE',

  # Template wide strings
  template:
    headings:
      dashboard: 'Dashboard'
      transactions: 'Transaktionen'
      upload: 'Upload'
  
  # Transactions
  transactions:
    headings:
      table:
        inflow: 'Eingang'
        outflow: 'Ausgang'
        date: 'Datum'
        source: 'Quelle'
        inAmount: 'Menge Einkauf'
        inCurrency: 'Währung'
        outAmount: 'Menge Verkauf'
        outCurrency: 'Währung'
        volume: 'Umsatz'
      transactions: 'Transaktionen'
      noTransactions: 'Keine Transaktionen...'
      addSingle: 'Einzelne Transaktion hinzufügen'
    buttons:
      newTransaction: 'Transaktion hinzufügen'
      calculateTax: 'Steuerlast berechnen'
    text:
      noTransactions: 'Bitte fügen Sie Transaktionen hinzu um. Sie können entweder ein CSV-File importieren oder unten eine Transaktion manuell hinzufügen.'
