# Bitstamp parser
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
  Imports.insert
    source: 'bitstamp_upload_csv'
    format: 'bitstamp_csv_1'
    lines: lineObjs

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
      console.log 'Exception thrown'
      console.log e
    finally
      parseBitstamp(csvLines)
