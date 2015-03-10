/*
 * Function to draw the chart with local data
 */

var digits = function (currency) {
  if (currency === 'BTC') {
    return 4
  }
  return 2;
}

var builtStockLocal = function (currency) {
  Meteor.call("dataForChartDashboardBasedOnCurrency", currency, function (err, result) {
    if(result){
      $('#holdingsovertime').removeClass("icon-spinner").highcharts('StockChart', {
        rangeSelector: {
          selected: 1,
          inputEnabled : false
        },
        title: {
          text: 'Net worth over time in '+currency
        },
        series: [{
          name: currency  ,
          data: result,
          tooltip: {
            valueDecimals: digits(currency)
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
  totalFiat: function() {
    return Meteor.user().profile.totalFiat;
  },
  currencyIsFiat: function() {
    return (this.currency === 'fiat');
  },
  userCurrency : function () {
    return Meteor.user().profile.currency;
  }
});

Template.netWorth.rendered = function () {
  Meteor.call('updateTotalFiat');
  builtStockLocal(Meteor.user().profile.currency);
  };
Template.netWorth.events = {
  'click #dashboardChangeStockCurrency': function () {
    if (this.currency === 'BTC') {
      builtStockLocal(Meteor.user().profile.currency);
    } else {
      builtStockLocal('BTC');
    }
  }
};
