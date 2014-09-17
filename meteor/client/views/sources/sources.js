// on the client
Template.sources.helpers({
  sources: function(){
    return Sources.find().fetch();
  }
});