import React, { useCallback, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import 'chartjs-adapter-moment';
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
  TimeScale,
  Filler,
  Title,
  Tooltip,
  Legend,
  defaults
} from 'chart.js';
import { Chart, Bar, Line, Scatter } from 'react-chartjs-2';
import annotationPlugin from "chartjs-plugin-annotation";
import { color } from "chart.js/helpers";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  annotationPlugin,
  Filler,
  Title,
  Tooltip,
  Legend
);
function DetailedAnalysisReports() {
  //defaults.animation=false;
  const $ = window.jQuery;
  const gridRefjsgridreport = useRef();
  const chartRef = useRef();
  const chartRefMain = useRef();
  const [selectedStations, setselectedStations] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [ChartDataAvg, setChartDataAvg] = useState({ labels: [], datasets: [] });
  const [ChartOptionsAvg, setChartOptionsAvg] = useState();
  const [ChartDataMax, setChartDataMax] = useState({ labels: [], datasets: [] });
  const [ChartOptionsMax, setChartOptionsMax] = useState();
  const [ChartData24h, setChartData24h] = useState({ labels: [], datasets: [] });
  const [ChartOptions24h, setChartOptions24h] = useState();
  const [ChartDatah, setChartDatah] = useState({ labels: [], datasets: [] });
  const [ChartOptionsh, setChartOptionsh] = useState();
  const [ChartDataExcedence24h, setChartDataExcedence24h] = useState({ labels: [], datasets: [] });
  const [ChartOptionsExcedence24h, setChartOptionsExcedence24h] = useState();
  const [ChartDataExcedence1h, setChartDataExcedence1h] = useState({ labels: [], datasets: [] });
  const [ChartOptionsExcedence1h, setChartOptionsExcedence1h] = useState();
  const [AllLookpdata, setAllLookpdata] = useState(null);
  const [AllDataList, setAllDataList] = useState(null);
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
    var d = new Date();
    var currentyear = d.getFullYear();
    $(".js-range-slider").ionRangeSlider({
      min: 2007,
      max: currentyear,
      from: currentyear - 5,
      type: "double",
      to: currentyear,
      grid: true,
      grid_snap: true,
      from_fixed: false, // fix position of FROM handle
      to_fixed: false,
      onStart: function (data) {
        // console.log("onstart", data);
        setFromDate(data.from);
        setToDate(data.to);
      },
      onFinish: function (data) {
        //console.log("afterchange", data);
        setFromDate(data.from);
        setToDate(data.to);
      }
    });
  })
  useEffect(() => {
    LoadData();
    // initializeJsGrid();
  }, []);

  const LoadData = async function(){
    let authHeader = await CommonFunctions.getAuthHeader();
    await fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/GetLookupDataDetailedAnalysis",{
      method: 'GET',
      headers: authHeader ,
   })
      .then((response) => response.json())
      .then((data) => {
        setAllLookpdata(data);
        setStations(data.listStations);
      })
      .catch((error) => console.log(error));
  }

  const GenarateChart = async function () {
    let Station = $("#stationid").val();
    let Pollutent = $("#pollutentid").val();
    let FromYear = fromDate;
    let ToYear = toDate;
    let Interval = '1440,60';
    let Interval1 = Interval.split(',');
    let valid = ReportValidations(Station, Pollutent, FromYear, ToYear, Interval);
    let unitid=AllLookpdata.listPollutents.filter(x=>x.parameterName==Pollutent && x.stationID==Station)[0]?.unitID;
    let Pollutent1=Pollutent+"_"+unitid;
    if (!valid) {
      return false;
    }
   
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/"
    let suburl = "getAnnualAveragesbyYear";
    let authHeader = await CommonFunctions.getAuthHeader();
    authHeader['Accept'] = 'application/json';
    authHeader['Content-Type'] = 'application/json';
    await fetch(url + suburl, {
      method: 'POST',
      headers: authHeader ,
      body: JSON.stringify({ StationName: Station, FromYear: FromYear, ToYear: ToYear, DataFilter: Interval, Pollutant: Pollutent1 }),
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          let data1 = JSON.parse(data);
          getchartdataAvg(data1.AvgData, Pollutent, ChartType, Criteria);
          getchartdataMax(data1.MaxData, Pollutent, ChartType, Criteria);
          getchartdata24Hourly(data1.Hourly24Data, Pollutent, ChartType, Criteria);
          getchartdataHourly(data1.HourlyData, Pollutent, ChartType, Criteria);
          getchartdataExcedence24H(data1['HourlyDataExedence' + Interval1[0]], Pollutent, ChartType, Criteria, data1.Excedencevalues, Interval1[0]);
          getchartdataExcedence1H(data1['HourlyDataExedence' + Interval1[1]], Pollutent, ChartType, Criteria, data1.Excedencevalues, Interval1[1]);
          setAllDataList(data1);
        }
      }).catch((error) => console.log(error));
  }

  const ReportValidations = function (Station, Pollutent, Fromdate, Todate, Interval) {
    let isvalid = true;
    if (Station == "") {
      toast.error('Please select station', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      isvalid = false;
    } else if (Pollutent == "") {
      toast.error('Please select parameter', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      isvalid = false;
    }
    return isvalid;
  }
  /* reported data end */
  const Stationchange = function (e) {
    setPollutents([]);
    let filter = e.currentTarget.value;
    setselectedStations(filter);
    let finaldata = AllLookpdata.listPollutents.filter(function (item) {
      if (item['stationID'] == filter)
        return true;
    });
    setPollutents(finaldata);
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
      console.log('rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)';
    }
    throw new Error('Bad Hex');
  }

  const getchartdataAvg = function (data, pollutent, charttype, criteria) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartType(charttype);
    setChartDataAvg({ labels: [], datasets: [] });
    setChartOptionsAvg();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let bgcolors = [];
    let pollutentdata = data;
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].YearValue);
      if (index == -1) {
        labels.push(pollutentdata[k].YearValue);
        chartdata.push(pollutentdata[k].PollutantValue)
        bgcolors.push(hexToRgbA(colorArray[k]));
      }
    }
    datasets.push({ label: "", data: chartdata, borderColor: colorArray, borderWidth: 2, borderRadius: 5, backgroundColor: bgcolors })
    setChartOptionsAvg({
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
        y: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
      },
     
      /* interaction: {
        mode: 'index',
        intersect: false,
      }, */
      //maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        title: {
          display: true,
          text: 'ANNUAL AVERAGE CONCENTRATION',
          color: '#111',
        },
      },
    });
    setTimeout(() => {
      setChartDataAvg({
        labels,
        datasets: datasets
      })
    }, 10);
  }
  const getchartdataMax = function (data, pollutent, charttype, criteria) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartDataMax({ labels: [], datasets: [] });
    setChartOptionsMax();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let bgcolors = [];
    let pollutentdata = data;
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].YearValue);
      if (index == -1) {
        labels.push(pollutentdata[k].YearValue);
        chartdata.push(pollutentdata[k].PollutantValue)
        bgcolors.push(hexToRgbA(colorArray[k]));
      }
    }
    datasets.push({ label: "", data: chartdata, borderColor: colorArray, borderWidth: 2, borderRadius: 5, backgroundColor: bgcolors })
    setChartOptionsMax({
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
        y: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
      },
      /* interaction: {
        mode: 'index',
        intersect: false,
      }, */
      //maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        title: {
          display: true,
          text: 'MAXIMUM 1-HOUR CONCENTRATION',
          color: '#111',
        },
      },
    });
    setTimeout(() => {
      setChartDataMax({
        labels,
        datasets: datasets
      })
    }, 10);
  }

  const getchartdata24Hourly = function (data, pollutent, charttype, criteria) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartData24h({ labels: [], datasets: [] });
    setChartOptions24h();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let bgcolors = [];
    let pollutentdata = data;
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].YearValue);
      if (index == -1) {
        labels.push(pollutentdata[k].YearValue);
        //   bgcolors.push(hexToRgbA(colorArray[k]));
      }
    }
    for (let i = 0; i < labels.length; i++) {
      chartdata = [];
      for (let j = 0; j < pollutentdata.length; j++) {
        if (pollutentdata[j].YearValue == labels[i]) {
          chartdata.push({ x: pollutentdata[j].Interval, y: pollutentdata[j].PollutantValue });
        }
      }
      datasets.push({ label: labels[i], data: chartdata, borderColor: colorArray[i], borderWidth: 1, borderRadius: 5, backgroundColor: hexToRgbA(colorArray[i]) });
    }
    //    chartdata.push(pollutentdata[k].PollutantValue)
    setChartOptions24h({
      responsive: true,
      /* interaction: {
        mode: 'index',
        intersect: false,
      }, */
      //maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year"
          },
          ticks: {
            color: 'black', // Color of the x-axis labels
          },
          bounds: 'ticks',
        },
         y: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        }, 
      },
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
          // display: false,
          position: 'top',
        },
        title: {
          display: true,
          text: pollutent + ' HOUR CONCENTRATIONS - 24Hr',
          color: '#111',
        },
      },
    });
    setTimeout(() => {
      setChartData24h({
        // labels,
        datasets: datasets
      })
    }, 10);
  }
  const getchartdataHourly = function (data, pollutent, charttype, criteria) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartDatah({ labels: [], datasets: [] });
    setChartOptionsh();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let bgcolors = [];
    let pollutentdata = data;
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].YearValue);
      if (index == -1) {
        labels.push(pollutentdata[k].YearValue);
        //   bgcolors.push(hexToRgbA(colorArray[k]));
      }
    }
    for (let i = 0; i < labels.length; i++) {
      chartdata = [];
      for (let j = 0; j < pollutentdata.length; j++) {
        if (pollutentdata[j].YearValue == labels[i]) {
          chartdata.push({ x: pollutentdata[j].Interval, y: pollutentdata[j].PollutantValue });
        }
      }
      datasets.push({ label: labels[i], data: chartdata, borderColor: colorArray[i], borderWidth: 1, borderRadius: 5, backgroundColor: hexToRgbA(colorArray[i]) });
    }
    //    chartdata.push(pollutentdata[k].PollutantValue)
    setChartOptionsh({
      responsive: true,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year"
          },
          ticks: {
            color: 'black', // Color of the x-axis labels
          },
          bounds: 'ticks'
        },
         y: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          },
        }, 
      },
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
          // display: false,
          position: 'top',
        },
        title: {
          display: true,
          text: pollutent + ' HOUR CONCENTRATIONS - 1Hr',
          color: '#111',
        },
      },
    });
    setTimeout(() => {
      setChartDatah({
        labels,
        datasets: datasets
      })
    }, 10);
  }
  const toggleLabel = function (ctx, event) {
    const oneThirdWidth = ctx.element.width / 3;
    const chart = ctx.chart;
    const annotationOpts = chart.options.plugins.annotation?.annotations[0];
    annotationOpts.label.display = !annotationOpts.label.display;
    annotationOpts.label.position = (event.x / ctx.chart.chartArea.width * 100) + '%';
    chart.update();
  }
  const getchartdataExcedence24H = function (data, pollutent, charttype, criteria, ExcedenceValue, Type) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartDataExcedence24h({ labels: [], datasets: [] });
    setChartOptionsExcedence24h();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let bgcolors = [];
    let pollutentdata = data;
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].YearValue);
      if (index == -1) {
        labels.push(pollutentdata[k].YearValue);
        chartdata.push(pollutentdata[k].PollutantValue)
        bgcolors.push(hexToRgbA(colorArray[k]));
      }
    }
    let Excedence = ExcedenceValue?.filter(x => x.Interval == Type).length > 0 ? ExcedenceValue?.filter(x => x.Interval == Type)[0].ExcedenceValue : "";
    let Annotations = Excedence == "" || data.length == 0 ? [] : [
      {
        type: 'line',
        /*   yMin: Excedence,
          yMax: Excedence, */
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 4,
        label: {
          display: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 0,
          drawTime: 'afterDraw',
          color: 'white',
          content: (ctx) => ['Excedence value is: ' + Excedence.toFixed(3)],
          textAlign: 'center'
        },
        scaleID: 'y',
        value: Excedence,
        enter(ctx, event) {
          toggleLabel(ctx, event);
        },
        leave(ctx, event) {
          toggleLabel(ctx, event);
        }
      },
    ];
    datasets.push({ label: "", data: chartdata, borderColor: colorArray, borderWidth: 2, borderRadius: 5, backgroundColor: bgcolors })
    setChartOptionsExcedence24h({
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
        y: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
      },
      /* interaction: {
        mode: 'index',
        intersect: false,
      }, */
      //maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        title: {
          display: true,
          text: pollutent + ' HOURS EXCEEDING -24Hr',
          color: '#111',
        },
        annotation: {
          annotations: Annotations
        },
      },
    });
    setTimeout(() => {
      setChartDataExcedence24h({
        labels,
        datasets: datasets
      })
    }, 10);
  }

  const getchartdataExcedence1H = function (data, pollutent, charttype, criteria, ExcedenceValue, Type) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    setChartDataExcedence1h({ labels: [], datasets: [] });
    setChartOptionsExcedence1h();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let bgcolors = [];
    let pollutentdata = data;
    for (let k = 0; k < pollutentdata.length; k++) {
      let index = labels.indexOf(pollutentdata[k].YearValue);
      if (index == -1) {
        labels.push(pollutentdata[k].YearValue);
        chartdata.push(pollutentdata[k].PollutantValue)
        bgcolors.push(hexToRgbA(colorArray[k]));
      }
    }
    let Excedence = ExcedenceValue?.filter(x => x.Interval == Type).length > 0 ? ExcedenceValue?.filter(x => x.Interval == Type)[0].ExcedenceValue : "";
    let Annotations = Excedence == "" || data.length == 0 ? [] : [
      {
        type: 'line',
        /*   yMin: Excedence,
          yMax: Excedence, */
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 4,
        label: {
          display: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 0,
          drawTime: 'afterDraw',
          color: 'white',
          content: (ctx) => ['Excedence value is: ' + Excedence.toFixed(3)],
          textAlign: 'center'
        },
        scaleID: 'y',
        value: Excedence,
        enter(ctx, event) {
          toggleLabel(ctx, event);
        },
        leave(ctx, event) {
          toggleLabel(ctx, event);
        }
      },
    ];
    datasets.push({ label: "", data: chartdata, borderColor: colorArray, borderWidth: 2, borderRadius: 5, backgroundColor: bgcolors })
    setChartOptionsExcedence1h({
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
        y: {
          ticks: {
            color: 'black', // Color of the x-axis labels
          }
          
        },
      },
      /* interaction: {
        mode: 'index',
        intersect: false,
      }, */
      //maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        title: {
          display: true,
          text: pollutent + ' HOURS EXCEEDING -1Hr',
          color: '#111',
        },
        annotation: {
          annotations: Annotations
        },
      },
    });
    setTimeout(() => {
      setChartDataExcedence1h({
        labels,
        datasets: datasets
      })
    }, 10);
  }
  /* Barchart End */

  const DownloadPng=function() {
    const chartElement = chartRefMain.current;
    html2canvas(chartElement, {
      backgroundColor: 'white', // Set null to preserve the original chart background color
    }).then((canvas) => {
      const image = canvas.toDataURL('image/png');

      // Create a download link and trigger click event
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = 'DetailedAnalysisReport.png';
      downloadLink.click();
    });
    /* var a = document.createElement('a');
    a.href = chartRef.current.toBase64Image();
    a.download = 'chart.png';
    a.click(); */
    return;
}

const DownloadPdf = () => {
  const chartElement = chartRefMain.current;
    html2canvas(chartElement, {
      backgroundColor: 'white', // Set null to preserve the original chart background color
    }).then((canvas) => {
    const chartImage = canvas.toDataURL('image/png');

    // Create a PDF using jsPDF
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(chartImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('DetailedAnalysisReport.pdf');
  });
};

  return (
    <main id="main" className="main" >
      {/* Same as */}
      {/* <section className="section grid_section h100 w100">
        <div className="h100 w100"> */}
      <section>
        <div>
          <div>

            <div className="card">
              <div className="card-body">
                <div className="row filtergroup">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Station Name</label>
                    <select className="form-select stationid border-50" id="stationid" onChange={Stationchange}>
                      <option selected value="">Select Station</option>
                      {Stations.map((x, y) =>
                        <option value={x.id} key={y} >{x.stationName}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Parameters</label>
                    <select className="form-select pollutentid border-50" id="pollutentid">
                      <option selected value=""> Select Parameter</option>
                      {Pollutents.map((x, y) =>
                        <option value={x.parameterName} key={y} >{x.parameterName}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="ion-slider-container pull-left" style={{ width: '98%' }}>
                      <input type="range" className="js-range-slider" value="3" data-orientation="vertical" />
                    </div>
                  </div>
                  <div className="col-sm-12 mt-2">
                    <button type="button" className="btn btn-primary download-btn" onClick={GenarateChart}>Generate Chart</button>
                  </div>
                </div>
              </div>
            </div>


            <div className="" >
              <div className="row mt-0" ref={chartRefMain}>
              {ChartOptionsAvg && (
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-2 d-none d-sm-none d-md-none d-lg-block">
                      <Bar ref={chartRef} options={ChartOptionsAvg} data={ChartDataAvg} height={90} />
                    </div>
                    <div className="card-body p-2 d-block d-sm-block d-md-block d-lg-none">
                      <Bar ref={chartRef} options={ChartOptionsAvg} data={ChartDataAvg} height={250} />
                    </div> 
                  </div>
                </div>
              )}
              {ChartOptionsMax && (
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-2 d-none d-sm-none d-md-none d-lg-block">
                      <Bar ref={chartRef} options={ChartOptionsMax} data={ChartDataMax} height={90} />
                    </div>
                    <div className="card-body p-2 d-block d-sm-block d-md-block d-lg-none">
                      <Bar ref={chartRef} options={ChartOptionsMax} data={ChartDataMax} height={250} />
                    </div>
                  </div>
                </div>
              )}
              {ChartOptions24h && (
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-2 d-none d-sm-none d-md-none d-lg-block">
                      <Line ref={chartRef} options={ChartOptions24h} data={ChartData24h} height={90} />
                    </div>
                    <div className="card-body p-2 d-block d-sm-block d-md-block d-lg-none">
                      <Line ref={chartRef} options={ChartOptions24h} data={ChartData24h} height={250} />
                    </div>
                  </div>
                </div>
              )}
              {ChartOptionsh && (
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-2 d-none d-sm-none d-md-none d-lg-block">
                      <Line ref={chartRef} options={ChartOptionsh} data={ChartDatah} height={90} />
                    </div>
                    <div className="card-body p-2 d-block d-sm-block d-md-block d-lg-none">
                      <Line ref={chartRef} options={ChartOptionsh} data={ChartDatah} height={250} />
                    </div>

                  </div>
                </div>
              )}
              {ChartOptionsExcedence24h && (
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-2 d-none d-sm-none d-md-none d-lg-block">
                      <Bar ref={chartRef} options={ChartOptionsExcedence24h} data={ChartDataExcedence24h} height={90} />
                    </div>
                    <div className="card-body p-2 d-block d-sm-block d-md-block d-lg-none">
                      <Bar ref={chartRef} options={ChartOptionsExcedence24h} data={ChartDataExcedence24h} height={250} />
                    </div>
                  </div>
                </div>
              )}
              {ChartOptionsExcedence1h && (
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body p-2 d-none d-sm-none d-md-none d-lg-block">
                      <Bar ref={chartRef} options={ChartOptionsExcedence1h} data={ChartDataExcedence1h} height={90} />
                    </div>
                    <div className="card-body p-2 d-block d-sm-block d-md-block d-lg-none">
                      <Bar ref={chartRef} options={ChartOptionsExcedence1h} data={ChartDataExcedence1h} height={250} />
                    </div>

                  </div>
                </div>
              )}
              </div>
              {AllDataList !=null &&(
               <div className="text-center col-sm-12 mt-3">
                <button type="button" className="btn btn-primary mx-1 mb-3 download-btn"  onClick={DownloadPng}>Download as Image</button>
                <button type="button" className="btn btn-primary mx-1 mb-3 download-btn"  onClick={DownloadPdf}>Download as Pdf</button>
                </div>
                )}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
export default DetailedAnalysisReports;