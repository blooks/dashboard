// on the client
Template.nodes.helpers({
  nodes: function(){
    return Nodes.find().fetch();
  }
});