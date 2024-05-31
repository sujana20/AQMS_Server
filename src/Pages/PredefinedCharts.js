import React, { useCallback, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CommonFunctions from "../utils/CommonFunctions";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  defaults
} from 'chart.js';
import { Chart, Bar, Line, Scatter } from 'react-chartjs-2';
import { color } from "chart.js/helpers";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);
function PredefinedCharts() {
  //defaults.animation=false;
  const $ = window.jQuery;
  const gridRefjsgridreport = useRef();
  const chartRef = useRef();
  const [selectedStations, setselectedStations] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [ChartData, setChartData] = useState({ labels: [], datasets: [] });
  const [ChartOptions, setChartOptions] = useState();
  const [AllLookpdata, setAllLookpdata] = useState(null);
  const [Stations, setStations] = useState([]);
  const [Pollutents, setPollutents] = useState([]);
  const [Criteria, setcriteria] = useState([]);
  const [ChartType, setChartType] = useState();
  const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
  useEffect(() => {
    GenarateChart();
  }, []);
  const GenarateChart = async function () {
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/getPredefinedchartData";
    let Pollutent = $("input[type='radio'][name='parametersradio']:checked").val();
    let DataFilter = 1440;
    let authHeader = await CommonFunctions.getAuthHeader();
    authHeader['Accept'] = 'application/json';
    authHeader['Content-Type'] = 'application/json';
    await fetch(url, {
      method: 'POST',
      headers: authHeader ,
      body: JSON.stringify({ DataFilter: DataFilter, Pollutant: Pollutent.toString() }),
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          let data1 = JSON.parse(data);
          getchartdata(data1, Pollutent, ChartType, Criteria)
        }
      }).catch((error) => console.log(error));
  }

  /* Barchart Start */
  const hexToRgbA = function (hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)';
    }
    throw new Error('Bad Hex');
  }

  const legendMargin = {
    id: 'legendMargin',
    beforeInit(chart, legend, options){
      //console.log('hello',chart.legend.fit);
      const fitValue = chart.legend.fit;
      chart.legend.fit = function fit(){
        fitValue.bind(chart.legend)();
        return this.height += 25;
      }
    },
    
  };

  const getchartdata = function (data, pollutent, charttype, criteria) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartType(charttype);
    setChartData({ labels: [], datasets: [] });
    setChartOptions();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let Stations = [];
    let pollutentdata = data[pollutent];
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].Period);
      let index1 = Stations.indexOf(pollutentdata[k].StationName);
      if (index == -1) {
        labels.push(pollutentdata[k].Period)
      }
      if (index1 == -1) {
        Stations.push(pollutentdata[k].StationName)
      }
    }
    for (let i = 0; i < Stations.length; i++) {
      chartdata = [];
      for (let j = 0; j < pollutentdata.length; j++) {
        if (pollutentdata[j].StationName === Stations[i]) {
          chartdata.push(pollutentdata[j].PollutantValue)
        }
      }
     // let color='#' + Math.floor(Math.random()*16777215).toString(16);
      datasets.push({ label: Stations[i] + " - " + pollutent, data: chartdata, borderWidth:1,borderColor: colorArray[(colorArray.length) - (i + 1)], backgroundColor: colorArray[(colorArray.length) - (i + 1)] })
    }



    setChartOptions({
      responsive: true,
      tension: 0.4,
      /* interaction: {
        mode: 'index',
        intersect: false,
      }, */
    maintainAspectRatio: false,
    scales: {
        y: {
          border:{
            display: false,
            borderWidth: 0,
            drawBorder: false,
          },
        },
        x:{
          border:{
            display: false,
            borderWidth: 0,
            drawBorder: false,
          },
          grid: {
            display: false,
            borderWidth: 0,
            drawBorder: false,
          }, 
        }
    },
    /* scales: {
      y: {
        beginAtZero: true,
      },
    }, */
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            color: '#111',
            font: {
              family: "Roboto Bold",
            }
          },
          position: 'top',
          align: 'start',
        },
        title: {
          display: true,
          text: pollutent+' ANNUAL TENDENCY DIAGRAM',
          color: '#2663AC',
        },
      },
    });
    setTimeout(() => {
      setChartData({
        labels,
        datasets: datasets
      })
    }, 10);
  }

  /* Barchart End */

  const DownloadPng=function() {
    const chartElement = chartRef.current.canvas;
    html2canvas(chartElement, {
      backgroundColor: 'white', // Set null to preserve the original chart background color
    }).then((canvas) => {
      const image = canvas.toDataURL('image/png');

      // Create a download link and trigger click event
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = 'PredefinedChart.png';
      downloadLink.click();
    });
    /* var a = document.createElement('a');
    a.href = chartRef.current.toBase64Image();
    a.download = 'chart.png';
    a.click(); */
    return;
}

const DownloadPdf = () => {
  const chartElement = chartRef.current.canvas;
    html2canvas(chartElement, {
      backgroundColor: 'white', // Set null to preserve the original chart background color
    }).then((canvas) => {
    const chartImage = canvas.toDataURL('image/png');

    // Create a PDF using jsPDF
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(chartImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('PredefinedChart.pdf');
  });
};

  return (
    <main id="main" className="main" >
      <div className="container">
      <div class="pagetitle"><h1>Predefined Chart</h1></div>
        <section>
          <div className="common-table-pd">
            <div className="ps-2 pe-2">
              <div>
                <label className="my-3 subheading-title">Select Parameter(To Genarate Chart)</label>
              </div>
              <div className="">
                <div className="form-check form-check-inline radio-input-box">
                  <input className="form-check-input" type="radio" name="parametersradio" onChange={GenarateChart} id="coradio" value="CO" />
                  <label className="form-check-label" for="coradio">CO</label>
                </div>
                <div className="form-check form-check-inline radio-input-box">
                  <input className="form-check-input" type="radio" name="parametersradio" onChange={GenarateChart} id="no2radio" value="NO2" />
                  <label className="form-check-label" for="no2radio">NO2</label>
                </div>
                <div className="form-check form-check-inline radio-input-box">
                  <input className="form-check-input" type="radio" name="parametersradio" onChange={GenarateChart} defaultChecked={true} id="so2radio" value="SO2" />
                  <label className="form-check-label" for="so2radio">SO2</label>
                </div>
                <div className="form-check form-check-inline radio-input-box">
                  <input className="form-check-input" type="radio" name="parametersradio" onChange={GenarateChart} id="o3radio" value="O3" />
                  <label className="form-check-label" for="o3radio">O3</label>
                </div>
                <div className="form-check form-check-inline radio-input-box">
                  <input className="form-check-input" type="radio" name="parametersradio" onChange={GenarateChart} id="pm10radio" value="PM10" />
                  <label className="form-check-label" for="pm10radio">PM10</label>
                </div>
              </div>
              {ChartData && (
                <div className="col-md-12">
                  <div className="d-none d-sm-none d-md-block">
                     <Line ref={chartRef} options={ChartOptions} data={ChartData} plugins={[legendMargin]} height={120}/>
                  </div>
                  <div className="d-block d-sm-block d-md-none">
                     <Line ref={chartRef} options={ChartOptions} data={ChartData} plugins={[legendMargin]} height={320}/>
                  </div>
                 
                  <div className="text-right col-sm-12 mt-2 mb-2">
                    <button type="button" className="btn btn-primary mx-1 mb-2 download-btn"  onClick={DownloadPng}>Download as Image</button>
                    <button type="button" className="btn btn-primary mx-1 mb-2 download-btn"  onClick={DownloadPdf}>Download as Pdf</button>
                </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
export default PredefinedCharts;