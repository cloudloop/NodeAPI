var options = {
    chart: {
      type: 'line'
    },
    series: [{
      name: 'Wind Direction',
      data: [30,40,45,50,49,60,70,91,125]
    }, {
      name: 'Temperatur',
      data: [12,10,15,20,22,24,20,17,15]
    }],
    xaxis: {
      categories: [1991,1992,1993,1994,1995,1996,1997,1998,1999],
    },
    yaxis: [
        {
            title: {
              text: "Wind Direction"
            },
          },
          {
            opposite: true,
            title: {
              text: "Temperature"
            }
          }
        ],
  }
  

  document.addEventListener('DOMContentLoaded', function() {
  var Origin_chart = document.querySelector("#Apex_chart")

  if (Origin_chart) {
    const Apex_chart = new ApexCharts(document.querySelector("#Apex_chart"), options);
    Apex_chart.render();
  }
  });
