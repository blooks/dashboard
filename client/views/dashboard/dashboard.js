/*
 * Function to draw the chart with local data
 */
var builtStockLocal = function () {
  var networthData = Meteor.user().networthData();
  var data = networthData[0];
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

Template.netWorth.helpers({
  trades: function () {
    return Trades.find({}, {sort: ['date', 'asc']}).fetch();
  },
  /**
   * [totalBalance description]
   * @param  {[type]} currency [description]
   * @return {[type]}          [description]
   */
  totalBalance: function (currency) {
    //TODO: Remove this. It is redundant to the global helper
    var saneNumber = function (internalNumber, currency) {
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

/*Template.walletHoldings.helpers({
  showPieChart: function () {
    return (true);
    //TODO: @Levin Please make this now show when there is no data.
  }
});
*/
/*
 * Call the function to build the chart when the template is rendered
 */
Template.netWorth.rendered = function () {
  builtStockLocal();
};

Template.walletHoldings.rendered = function () {
  fundsDistribution();
};



// Set active class on menu <li> according to current template
Template.dynamicDashboardMenu.helpers({
  isActive: function (type) {
    if (this.type === type) {
      return "active";
    }
    return "";
  }
});
