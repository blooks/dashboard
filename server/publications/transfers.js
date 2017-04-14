Meteor.publish('transfers', function (page, documentsPerPage) {
  var self = this
  var totalAvailableResults = Transfers.find({ userId: this.userId, hidden: false }).count()
  var maxNumPages = Math.ceil(totalAvailableResults / documentsPerPage)
  page = Math.max(Math.min(page, maxNumPages), 1)
  var handle = Transfers.find({userId: this.userId, hidden: false}, {
    skip: parseInt(page - 1, 10) * parseInt(documentsPerPage, 10),
    limit: documentsPerPage,
    sort: {date: -1}
  }).observeChanges({
    added: function (id, fields) {
      fields.totalAvailable = totalAvailableResults
      self.added('transfers', id, fields)
    },
    changed: function (id, fields) {
      fields.totalAvailable = totalAvailableResults
      self.changed('transfers', id, fields)
    },
    removed: function (id) {
      self.removed('transfers', id)
    }
  })
  self.ready()
  self.onStop(function () {
    handle.stop()
  })
})
