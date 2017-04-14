Template.exchangeHeader.helpers({
  typeString: function () {
    return 'nodes.exchanges.type.' + this.exchange
  }
})

Template.exchangeHeader.events({
  'click .delete-exchange': function () {
    return Exchanges.remove({
      _id: this._id
    })
  },
  'click .update-exchange': function () {
    return this.update()
  }
})
