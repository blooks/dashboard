


Template.dashboard.rendered = function(){
//Pie chart for wallet overview 
function walletData() {
    var result = [];
    BitcoinWallets.find({}).forEach(function(wallet){
        result.push({"label": wallet.label, "value": wallet.balance()});
    });
  return result;
};
	//Regular pie chart example
nv.addGraph(function() {
  var areaWidth   = parseInt(d3.select("#chart svg").style("width").replace("px", ""),0);
  var centerWidth = -Math.floor(areaWidth/2);
  
  var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(true)
      .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
      .labelType("key") //Configure what type of data to show in the label. Can be "key", "value" or "percent"      
      .color(['#9A2158', '#67163B', '#5A1333', '#A7245F', '#4E0928'])
      // Brand primary shades ['#9A2158', '#67163B', '#5A1333', '#A7245F', '#4E0928']
      // Brand secondary shades ['#0C5967', '#0D6574', '#159CB4', '#1CD3F3', '#09434E']
      // Brand .negative shades ['#FE2C2A', '#B11F1D', '#FE4543', '#981B19', '#711413']
      ;

    d3.select("#chart svg")
        .datum(walletData())
        .transition().duration(450)
        .call(chart)
        ;
    
    d3.select("#chart .nv-legendWrap")
     .attr("transform", function () { return "translate(" + centerWidth + ",10)" ; 
    });

  return chart;
});
};



// on the client
Template.dashboard.helpers({
  trades: function(){
    return Trades.find({},{sort: ['date','asc']}).fetch();
  },
  showPieChart: function(){
    return (true);
    //TODO: @Levin Please make this now show when there is no data.
  }
});

Template.dashboard.events({
  'click .delete-trade': function(event, template) {
    return Trades.remove({
      _id: this._id
    });
  }
});