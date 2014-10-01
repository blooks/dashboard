Template.newNode.helpers({
  nodeTypes : function() {
    return Meteor.settings.public.coyno.allowedNodeTypes;
  }
})