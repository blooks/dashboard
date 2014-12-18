Template.dashboard.rendered = function(){
//Pie chart for wallet overview 
function walletData() {
    var result = [];
    BitcoinWallets.find({}).forEach(function(wallet){
        result.push({"label": wallet.label, "value": wallet.balance()});
    });
  return result;
};

// Wallet Pie chart
nv.addGraph(function() {
  var areaWidth   = parseInt(d3.select("#pieChart svg").style("width").replace("px", ""),0);
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

    d3.select("#pieChart svg")
        .datum(walletData())
        .transition().duration(450)
        .call(chart)
        ;
    
/*    d3.select("#pieChart .nv-legendWrap")
     .attr("transform", function () { return "translate(" + centerWidth + ",10)" ; 
    });
*/

  nv.utils.windowResize(chart.update);

  return chart;
});

/* Line chart graph */

nv.addGraph(function() {
    var networthData = Meteor.user().networthData();
    var chart = nv.models.linePlusBarChart()
          .margin({top: 30, right: 100, bottom: 50, left: 70})
          //We can set x data accessor to use index. Reason? So the bars all appear evenly spaced.
          .x(function(d,i) { return i })
          .y(function(d,i) {return d[1] })
      /*
        TODO need to exclude data from day 1 --> current date where holdings = 0 
        (to avoid a long time frame of no action) e.g. something like:
      .filter(function(d){return networthData.values[d][1] !== "0.00000000";})*/          
          .tooltips(true)
          .tooltipContent(function(key,i, d) {
           return '<h3>' + key + '</h3>' +'<span class="btc-value">' + d + '</span>' + '<span class="transaction-date">' + i + '</span>' 
          });

    chart.xAxis.tickFormat(function(d) {
      var dx = networthData[0].values[d] && networthData[0].values[d][0] || 0;
      return d3.time.format('%d/%m/%Y')(new Date(dx))
    });

    chart.y1Axis
        .tickFormat(function(d) { return d3.format('.4f')(d) + ' ' +'BTC' })
        .scale().domain([-2, 2]);

    chart.y2Axis
        .tickFormat(function(d) { return d3.format(".4f")(d) + ' ' +'BTC' })
        ;

    /*TODO set range dynamically*/
    chart.lines.forceY([-2, d3.max(networthData[0].values, function(d) { 
        console.log("MAX ENTRY IS:" + d);
        return 2;
      })]);
    chart.bars.forceY([-2,2]);

    d3.select('#networthChart svg')
      .datum(networthData)
      .transition()
      .duration(0)
      .call(chart)
      ;

    nv.utils.windowResize(chart.update);

    return chart;
});

};

// End dahsboard.rendered

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
