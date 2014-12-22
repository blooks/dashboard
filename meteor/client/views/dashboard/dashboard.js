Template.dashboard.rendered = function(){

};

// End dahsboard.rendered

// on the client
Template.dashboard.helpers({
    trades: function () {
        return Trades.find({}, {sort: ['date', 'asc']}).fetch();
    },
    showPieChart: function () {
        return (true);
        //TODO: @Levin Please make this now show when there is no data.
    },
    totalBalance: function (currency) {
        //TODO: Remove this. It is redundant to the global helper
        var saneNumber = function (internalNumber, currency) {
            if (currency === 'BTC') {
                return (internalNumber / 100000000).toFixed(8);
            } else {
                return (internalNumber / 100000000).toFixed(2);
            }
        };
        return saneNumber(Meteor.user().totalBalance(currency), currency);
    },
    fundsHistory: function () {
         var netWorthData = Meteor.user().networthData();
         return {

             chart: {
                 type: 'area'
             },

             title: {
                 text: 'Total Bitcoin balance'
             },

             credits: {
                 enabled: false
             },

             xAxis: {
                 allowDecimals: false,
                 labels: {
                     formatter: function () {
                         return this.value; // clean, unformatted number for year
                     }
                 }
             },

             yAxis: {
                 title: {
                     text: 'Total BTC Balance'
                 },
                 labels: {
                     formatter: function () {
                         return this.value / 1000 + 'k';
                     }
                 }
             },

             tooltip: {
                 pointFormat: '{series.name} was <b>{point.y:,.4f}</b><br/> BTCs in {point.x}'
             },

             plotOptions: {
                 area: {
                     pointStart: netWorthData[0][0][0],
                     marker: {
                         enabled: false,
                         symbol: 'circle',
                         radius: 2,
                         states: {
                             hover: {
                                 enabled: true
                             }
                         }
                     }
                 }
             },

             series: [{
                 name: 'Balance',
                 data: netWorthData[0].map(function (element) {return parseFloat(element[1]);})
             }]
         }
     },
    fundsDistribution : function() {
        var dataPairs = [];
        BitcoinWallets.find({}).forEach(function (wallet) {
            dataPairs.push([wallet.label, wallet.balance()]);
        });
        return  {
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
        };
    }
});

Template.dashboard.events({
    'click .delete-trade': function(event, template) {
        return Trades.remove({
            _id: this._id
        });
    }
});