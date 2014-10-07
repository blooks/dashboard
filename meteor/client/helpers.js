Template.registerHelper('labelForNodeId', function(nodeId) {
    var temp = Exchanges.findOne({"_id": nodeId});
    if (temp) {
      return temp.exchangeLabel;
    }
    return "Unkown";
}); 