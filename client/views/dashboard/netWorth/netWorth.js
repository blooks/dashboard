/*
 * Function to draw the chart with local data
 */

var builtStockLocal = function (currency) {
  Meteor.call("dataForChartDashboardBasedOnCurrency", currency, function (err, result) {
    if(result){
      var data = result;
      $('#holdingsovertime').highcharts('StockChart', {
        rangeSelector: {
          selected: 1,
          inputEnabled : false
        },
        title: {
          text: 'Networth over time in '+currency
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
  },
  totalBalanceFiat: function() {
    console.log(Meteor.user().totalBalanceInFiat());
    return Meteor.user().totalBalanceInFiat();
  },
  userCurrency : function () {
    return Meteor.user().profile.currency;
  }
});

Template.netWorth.rendered = function () {
  console.log(this);
  if (this.currency === 'fiat') {
    builtStockLocal(Meteor.user().profile.currency);
  } else {
    builtStockLocal('BTC');
  }
};
