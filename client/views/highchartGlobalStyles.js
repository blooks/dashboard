/**
 * Highcharts JS styling for Coyno
 */

// Load the fonts
Highcharts.createElement('link', {
  href: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700',
  rel: 'stylesheet',
  type: 'text/css'
}, null, document.getElementsByTagName('head')[ 0 ])

var brandPrimary = '#9A2158'

Highcharts.theme = {
  colors: [
    brandPrimary, '#4E0928', '#E73183', '#811C49', '#5A1333', // Brand pinks
    '#0C5967', '#1CD3F3', '#09434E', // Secondary blues
    '#90CD17', '#69A74D', '#4FDA7A' // Greens
  ],
  chart: {
    backgroundColor: null,
    style: {
      fontFamily: "'Source Sans Pro', sans-serif"
    }
  },
  title: {
    style: {
      fontSize: '16px',
      textTransform: 'uppercase'
    }
  },
  tooltip: {
    borderWidth: 1,
    borderColor: brandPrimary,
    borderRadius: 0, // No rounded corners
    color: brandPrimary,
    backgroundColor: '#fff',
    shadow: false,
    valueDecimals: 6,
    style: {
      fontSize: '16px',
      textTransform: 'uppercase'
    }
  },
  legend: {
    itemStyle: {
      fontWeight: 'bold',
      fontSize: '13px'
    }
  },

  navigator: {
    maskFill: 'rgba(85,85,85, 0.05)',
    series: {
      /*                color: '#9A2158',
       fillOpacity: 0.5,*/
      lineColor: '#9A2158',
      lineRadius: 2
    }
  },

  xAxis: {
    labels: {
      style: {
        fontSize: '12px'
      }
    }
  },
  yAxis: {
    gridLineWidth: 1,
    lineColor: '#ddd',
    title: {
      style: {
        textTransform: 'uppercase'
      }
    },
    labels: {
      style: {
        fontSize: '12px'
      }
    }
  },
  plotOptions: {
    line: {
      lineColor: brandPrimary,
      color: brandPrimary,
      dataLabels: {
        color: '#CCC'
      },
      marker: {
        /*lineColor: brandPrimary,*/
        fillColor: '#9A2158'
      }
    }
  },

  // General
  background2: '#F0F0EA'

}

// Apply the theme
Highcharts.setOptions(Highcharts.theme)
