# Take the output from parseBitstamp and create transactions
insertBitstampTransactions = (importId, lineObjs) ->
  errors = []
  for line in lineObjs
    # Instantiate an empty transaction
    txn = {}
    txn.date = new Date(line.date) #40
    txn.importId = importId
    txn.importLineId = line._id
    txn.source = 'bitstamp'
    if line.type is '2' # trade
      if line.btc_amount.substr(0,1) is '-' # trade is a sale of bitcoin for USD
        txn.in =
          amount: line.btc_amount.substr(1) # Trim off the initial -
          currency: 'BTC'
        txn.out =
          amount: line.usd_amount
          currency: 'USD'
      else if line.usd_amount.substr(0,1) is '-' # trade is a buy of bitcoin with USD
        txn.in =
          amount: line.usd_amount.substr(1) # Trime off the initial -
          currency: 'USD'
        txn.out =
          amount: line.btc_amount
          currency: 'BTC'
      temp_amount = undefined
      if txn.in.currency is 'USD'
        temp_amount = txn.in.amount
      else
        temp_amount = txn.out.amount
      txn.base =
        #Hardcoded base currency! To be improved
        amount: Math.round(temp_amount * getExchangeRate('DE', 'USD', 'EUR', txn.date)*100)/100.toFixed 2 
        currency: 'EUR'
      # For now, only insert if it's a trade
      try
        txnId = Transactions.insert txn
      catch e
        errors.push e
        console.log e
    if line.type is '0'
      if line.btc_amount is '0.00000000' #Fiat deposit (in Euros for the time being)
        txn.in =
          amount: line.usd_amount
          currency: 'USD'
        txn.out =
          amount: Math.round(txn.in.amount * getExchangeRate('DE', 'USD', 'EUR', txn.date)*100)/100.toFixed 2 
          currency: 'EUR'
        txn.base = 
          amount: Math.round(txn.in.amount * getExchangeRate('DE', 'USD', 'EUR', txn.date)*100)/100.toFixed 2 
          currency: 'EUR'
        try
          txnId = Transactions.insert txn
        catch e
          errors.push e
          console.log e       
    if line.type is '1'
      if line.btc_amount is '0.00000000' #Fiat withdrawel (in Euros for the time being)
        txn.out =
          amount: line.usd_amount.substr(1)
          currency: 'USD'
        txn.in =
          amount: Math.round(txn.out.amount * getExchangeRate('DE', 'USD', 'EUR', txn.date)*100)/100.toFixed 2 
          currency: 'EUR'
        txn.base = 
          amount: Math.round(txn.out.amount * getExchangeRate('DE', 'USD', 'EUR', txn.date)*100)/100.toFixed 2 
          currency: 'EUR'
        try
          txnId = Transactions.insert txn
        catch e
          errors.push e
          console.log e       

  # If no errors, return true, otherwise, false
  errors.length is 0

# Parse the bitstamp CSV text
parseBitstamp = (csvLines) ->
  # Define the CSV format
  fields = [
    'type' # 0 = deposit, 1 = withdrawal, 2 = trade, 3/4 = ripple
    'date'
    'btc_amount'
    'usd_amount'
    'exchange_rate'
    'fee'
  ]
  # Parse the lines one at a time
  lineObjs = []
  for line in csvLines
    lineObj = {}
    for field, i in line
      lineObj[fields[i]] = field
    lineObj._id = Random.id()
    lineObjs.push(lineObj)
  # Insert the import into the imports collection
  try
    importId = Imports.insert
      source: 'bitstamp_upload_csv'
      format: 'bitstamp_csv_1'
      lines: lineObjs
  catch e
    console.log 'Inserting the import failed:'
    console.log e
    return false # If the insert failed, return false and stop here
  # Create the transactions from lineObjs
  insertBitstampTransactions(importId, lineObjs)

# Async parse CSV function
asyncParseCSV = (csvText, callback) ->
  CSV().from.string(csvText).to.array (parsedData) ->
    callback(null, parsedData)
    return
# Wrap the async in a sync wrapper for meteor friendliness
syncParseCSV = Meteor._wrapAsync(asyncParseCSV)

# Define our methods
Meteor.methods
  # Handle CSV client sent by the browser
  # Inspired by https://coderwall.com/p/7tpa8w
  'uploadCSV': (fileInfo, fileData) ->
    # file name = fileInfo.name
    # text = fileData
    # Parse the CSV with our sync wrapped function
    try
      csvLines = syncParseCSV(fileData)
    catch e
      console.log 'Parsing of the uploaded CSV data failed:'
      console.log e
      return false # If the parse failed, return false and stop here
    parseBitstamp(csvLines)
