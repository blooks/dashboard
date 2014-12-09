Template.dashboard.rendered = function(){

	//Regular pie chart example
nv.addGraph(function() {
  var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(true)
      .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
      .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"      ;

    d3.select("#chart svg")
        .datum(exampleData())
        .transition().duration(350)
        .call(chart);

  return chart;
});


//Pie chart example data. Note how there is only a single array of key-value pairs.
function exampleData() {
    var result = [];
    BitcoinWallets.find({}).forEach(function(wallet){
        result.push({"label": wallet.label, "value": wallet.balance()});
    });
  return result;
}
};

// on the client
Template.dashboard.helpers({
  trades: function(){
    return Trades.find({},{sort: ['date','asc']}).fetch();
  }
});
Template.dashboard.events({
  'click .delete-trade': function(event, template) {
    return Trades.remove({
      _id: this._id
    });
  }
});

