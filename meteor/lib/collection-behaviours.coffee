CollectionBehaviours.defineBehaviour 'owned', (getTransform, args) ->
  @before.insert (userId, doc) ->
    # If the document does not have a userId
    unless doc.userId?
      # If there is no also no authenticated user, throw an error
      unless userId?
        throw new Meteor.Error(400, 'Only authenticated users can do that')
      # doc.userId does not exist, but userId does, so set it...
      doc.userId = userId
