/*
 * Function to draw the chart with local data
 */
var builtStockLocal = function () {
  var networtData = Meteor.user().networthData();
  var data = networtData[0];
  $('#holdingsovertime').highcharts('StockChart', {
    rangeSelector: {
      selected: 1
    },
    title: {
      text: 'Total Bitcoin Holdings'
    },
    series: [{
      name: 'BTC',
      data: data,
      tooltip: {
        valueDecimals: 2
      }
    }]
  });
};

var fundsDistribution = function () {
  var dataPairs = [];
  BitcoinWallets.find({}).forEach(function (wallet) {
    dataPairs.push([wallet.label, wallet.balance()]);
  });
  $('#currentholdingsperwallet').highcharts({
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false
    },
    title: {
      text: "Distribution of Bitcoin holdings"
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          },
          connectorColor: 'silver'
        }
      }
    },
    series: [{
      name: 'BTC',
      type: 'pie',
      data: dataPairs
    }]
  });
};

// on the client
Template.dashboard.helpers({
  trades: function () {
    return Trades.find({}, {sort: ['date', 'asc']}).fetch();
  },
  showPieChart: function () {
    return (true);
    //TODO: @Levin Please make this now show when there is no data.
  },
  /**
   * [totalBalance description]
   * @param  {[type]} currency [description]
   * @return {[type]}          [description]
   */
  totalBalance: function (currency) {
    //TODO: Remove this. It is redundant to the global helper
    var saneNumber = function (internalNumber, currency) {
      HTTP.get("https://api.coindesk.com/v1/bpi/currentprice/EUR.json", function (err, result){
        var resultGet = JSON.parse(result.content);
        var value = resultGet.bpi['EUR'].rate_float;
        var conversion = (internalNumber/100000000)*value;
        console.log("Value today in EUR: "+conversion);
      });
      if (currency === 'BTC') {
        return (internalNumber / 10e7).toFixed(8);
      } else {
        return (internalNumber / 10e7).toFixed(2);
      }
    };
    if(Meteor.user()){
      return saneNumber(Meteor.user().totalBalance(currency), currency);
    }
  }
});

/*
 * Call the function to built the chart when the template is rendered
 */
Template.dashboard.rendered = function () {
  builtStockLocal();
  fundsDistribution();
};

Template.dashboard.events({
  'click .delete-trade': function () {
    return Trades.remove({
      _id: this._id
    });
  }
});
