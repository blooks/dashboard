/*
 * Function to draw the chart with local data
 */
var builtStockLocal = function (currency) {
  console.log(currency);
  Meteor.call("dataForChartDashboardBasedOnCurrency", currency, function (err, result) {
    if(result && result[0]){
      var data = result[0];
      $('#holdingsovertime').highcharts('StockChart', {
        rangeSelector: {
          selected: 1
        },
        title: {
          text: 'Total '+currency+' Holdings'
        },
        series: [{
          name: currency,
          data: data,
          tooltip: {
            valueDecimals: 2
          }
        }]
      });
    }
  });
};


Template.netWorth.helpers({
  totalBalanceCurrency: function (currency) {
    if(Meteor.user()){
      return Meteor.user().totalBalanceBasedOnUserCurrency(currency);
    }
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

Template.netWorth.rendered = function () {
  if(Meteor.user().profile.currency){
    builtStockLocal(Meteor.user().profile.currency);
  }
};
