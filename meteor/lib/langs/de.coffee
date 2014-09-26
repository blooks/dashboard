# Let's try to separate strings by views, as much as possible.
i18n.map 'de_DE',

  # Template wide strings
  template:
    headings:
      dashboard: 'Dashboard'
      transactions: 'Transaktionen'
      upload: 'Upload'
      settings: 'Einstellungen'
      help: 'Hilfe'
  
  # Transactions
  transactions:
    headings:
      table:
        inflow: 'Eingang'
        outflow: 'Ausgang'
        date: 'Datum'
        source: 'Quelle'
        inAmount: 'gekaufter Betrag'
        inCurrency: 'Währung'
        outAmount: 'verkaufter Betrag'
        outCurrency: 'Währung'
        volume: 'Umsatz'
      transactions: 'Transaktionen'
      noTransactions: 'Keine Transaktionen...'
      addSingle: 'Einzelne Transaktion hinzufügen'
    buttons:
      newTransaction: 'Transaktion hinzufügen'
      calculateTax: 'Steuerlast berechnen'
      deleteAll: 'Alle Transaktionen löschen'
    text:
      noTransactions: 'Bitte fügen Sie Transaktionen hinzu um. Sie können entweder ein CSV-File importieren oder unten eine Transaktion manuell hinzufügen.'
    help: 'Fügen Sie jetzt Transaktionen hinzu.'
