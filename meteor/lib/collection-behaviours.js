CollectionBehaviours.defineBehaviour('softRemovable', function(getTransform, args){
  var self = this;
  self.before.find(function (userId, selector, options) {
    if (typeof selector === 'undefined')
      selector = {}
    if(typeof selector.removed === 'undefined')
      selector.removed = {$exists: false};
  });
  self.before.findOne(function (userId, selector, options) {
    if (typeof selector === 'undefined')
      selector = {}
    if(typeof selector.removed === 'undefined')
      selector.removed = {$exists: false};
  });
});
