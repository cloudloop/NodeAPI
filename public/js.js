// Assuming the existing options object
var options = {
    chart: {
      toolbar: false,
      type: 'rangeArea',
      height: 350,
      animations: {
        speed: 200
      }
    },
    colors: ['#d4526e', '#33b2df', '#d4526e', '#33b2df'],
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: [0.24, 0.24, 1, 1]
    },
    stroke: {
      curve: 'straight',
      width: [0, 0, 2, 2]
    },
    series: [{
      type: 'rangeArea',
      name: 'tempRange',
      data: []
    }, {
      type: 'rangeArea',
      name: 'windRange',
      data: []
    }, {
      type: 'line',
      name: 'temp',
      data: []
    }, {
      type: 'line',
      name: 'wind',
      data: []
    }],
    yaxis: [{
      seriesName: 'temp',
      min: 0,
      max: 40,
      title: {
        text: "Temp",
        style: {
          color: '#d4526e'
        }
        },
      axisBorder: {
          show: true,
          color: '#d4526e'
        },
        labels: {
          style: {
            colors: '#d4526e',
          }
        },
      }, {
        seriesName: 'wind',
        min: 0,
        max: 240,
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#33b2df'
        },
        labels: {
          style: {
            colors: '#33b2df',
          }
        },
        title: {
          text: "Wind",
          style: {
            color: '#33b2df',
          }
        }
        },{
          show: false
        },{
          show: false
        }]}


timeSeriesData = window.chartData;
timeArray = new Array;
timeSeriesData.forEach((entry) => {
  timeArray.push(entry["time"])
});
console.log(timeSeriesData);

windArray = new Array;
timeSeriesData.forEach((entry) => {
  windArray.push(entry["data"]["instant"]["details"]["wind_speed"]);
});

windDirectionArray = new Array;
timeSeriesData.forEach((entry) => {
  windDirectionArray.push(entry["data"]["instant"]["details"]["wind_from_direction"]);
});

const x = timeArray;
const wind = windArray;
const temp = windDirectionArray;
const windRange = [160,200]
const tempRange = [7,11]

const newTempData = x.map( (x, index) => {
  let newArray = {x: x, y: temp[index]};
  return newArray;
});

const newWindData = x.map( (x, index) => {
    let newArray = {x: x, y: wind[index]};
    return newArray;
});

const newWindRangeData = x.map( (x) => {
  let newArray = {x: x, y: windRange};
  return newArray;
});

const newTempRangeData = x.map( (x) => {
  let newArray = {x: x, y: tempRange};
  return newArray;
});

options.series[0].data = newTempRangeData;
options.series[1].data = newWindRangeData;
options.series[2].data = newTempData;
options.series[3].data = newWindData;

document.addEventListener('DOMContentLoaded', function() {
var Origin_chart = document.querySelector("#Apex_chart")


if (Origin_chart) {
  const Apex_chart = new ApexCharts(document.querySelector("#Apex_chart"), options);
  Apex_chart.render();
}
});
