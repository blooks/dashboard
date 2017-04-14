if (this.Schemas == null) {
  this.Schemas = {}
}

Schemas.nodeReference = new SimpleSchema({
  nodeType: {
    type: String,
    allowedValues: Meteor.settings[ 'public' ].coyno.supportedNodeTypes
  },
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
})
