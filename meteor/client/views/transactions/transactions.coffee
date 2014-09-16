Template.transactions.events
  'click .delete-transaction': (event, template) ->
    Transactions.remove(_id: @_id)
