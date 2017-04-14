var fundsDistribution = function () {
  var dataPairs = []
  BitcoinWallets.find({}).forEach(function (wallet) {
    dataPairs.push([ wallet.label, wallet.balance() ])
  })
  $('#currentholdingsperwallet').highcharts({
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false,
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
  })
}

Template.walletHoldings.rendered = function () {
  fundsDistribution()
}

Template.walletHoldings.helpers({
  wallets: function () {
    return BitcoinWallets.find({}).fetch()
  },
  /**
   * [totalBalance description]
   * @param  {[type]} currency [description]
   * @return {[type]}          [description]
   */
  totalBalance: function (currency) {
    // TODO: Remove this. It is redundant to the global helper
    var saneNumber = function (internalNumber, currency) {
      if (currency === 'BTC') {
        return (internalNumber / 10e7).toFixed(8)
      } else {
        return (internalNumber / 10e7).toFixed(2)
      }
    }
    if (Meteor.user()) {
      return saneNumber(Meteor.user().totalBalance(currency), currency)
    }
  }
})
