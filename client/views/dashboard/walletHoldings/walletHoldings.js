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
      text: ""
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
  });
};

Template.walletHoldings.rendered = function () {
  fundsDistribution();
};