Meteor.methods
  'uploadCSV': (fileInfo, fileData) ->
    # file name = fileInfo.name
    # text = fileData
    console.log("received file " + fileInfo.name + " data: " + fileData)
    
    future = new Future()
    csv = require 'csv'
    csv().from.string(fileData).to.array (parsedData) ->
      console.log parsedData
      future.ret('data processed')
    
    future.wait()
