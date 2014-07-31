# Inspired by https://coderwall.com/p/7tpa8w
Template.upload.events
  'change .file-upload-input': (event, template) ->
    file = event.currentTarget.files[0]
    reader = new FileReader()
    reader.onload = (fileLoadEvent) ->
      Meteor.call 'uploadCSV', file, reader.result, (err, response) ->
        message = if response then 'done' else 'failed' 
        @$('#file-upload').text(message)
    reader.readAsBinaryString(file)
