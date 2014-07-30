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
      for line in csvLines
        console.log line
