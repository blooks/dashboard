CollectionBehaviours.defineBehaviour('softRemovable', function () {
  var self = this
  self.before.find(function (userId, selector) {
    if (typeof selector === 'undefined') {
      selector = {}
    }
    if (typeof selector.removed === 'undefined') {
      selector.removed = { $exists: false }
    }
  })
  self.before.findOne(function (userId, selector) {
    if (typeof selector === 'undefined') {
      selector = {}
    }
    if (typeof selector.removed === 'undefined') {
      selector.removed = { $exists: false }
    }
  })
})
