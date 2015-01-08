# Use an actual Date() object instead of a unix timestamp
CollectionBehaviours.defineBehaviour "timed", (getTransform, args) ->
  @before.insert (userId, doc) ->
    doc.createdAt = new Date()
  @before.update (userId, doc, fieldNames, modifier, options) ->
    modifier.$set = {} unless modifier.$set
    modifier.$set.updatedAt = new Date()

# Ensure that every record is owned by a user
# NOTE: Any value for userId will work, so this should *always* be used in
# conjunction with Collection.allow()
CollectionBehaviours.defineBehaviour 'owned', (getTransform, args) ->
  @before.insert (userId, doc) ->
    # If the document does not have a userId
    unless doc.userId?
      # If there is no also no authenticated user, throw an error
      unless userId?
        throw new Meteor.Error(400, 'Only authenticated users can do that')
      # doc.userId does not exist, but userId does, so set it...
      doc.userId = userId
