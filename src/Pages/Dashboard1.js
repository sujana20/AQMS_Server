
import React, { Component, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import CommonFunctions from "../utils/CommonFunctions";
import Chart from 'react-apexcharts'
function Dashboard1() {
  const $ = window.jQuery;
  const [Parameterslist, setParameterslist] = useState([]);
  const [Parameters, setParameters] = useState([]);
  const [Stationslist, setStationslist] = useState([]);
  const [MainStationslist, setMainStationslist] = useState([]);
  const [GroupData, setGroupData] = useState(null);
  const [GuageData, setGuageData] = useState([]);
  const [Calander, setCalander] = useState(false);
  const [fromDate, setFromDate] = useState(new Date('March 28, 2024'));
  const [toDate, setToDate] = useState(new Date('March 30, 2024'));
  const [needlerotation, setneedlerotation] = useState("rotate(0deg)");
  const [ChartOptions, setChartOptions] = useState();
  const [HeatMapChartOptions, setHeatMapChartOptions] = useState();
  const [HeatMapChartData, setHeatMapChartData] = useState([]);
  const currentUser = JSON.parse(sessionStorage.getItem('UserData'));

  const getGaugeValue = function(avgValue, maxValue) {
   let value = (avgValue/maxValue);
    if (value < 0 || value > 1) {
      return;
    }
     return value / 2;
  }
  const GetAvergaevalue = function(data,parameterName){
  // Calculate the total sum of the parameter across all rooms
  const totalSum = Object.values(data).reduce((sum, room) => sum + (room[parameterName] || 0), 0);

  // Calculate the average for the parameter
  const average = totalSum / Object.keys(data).length;
  return average;
  }
  const generateHTML = (data,parameterNames) => {
    const htmlArray = [];
    for (let i = 0; i < parameterNames.length; i++) {
      let avgValue=GetAvergaevalue(data,parameterNames[i].name);
      let rotationValue=0.0;
      if(parameterNames[i].name.toLowerCase() == "temperature" || parameterNames[i].name.toLowerCase() == "temp"){
        rotationValue=getGaugeValue(avgValue,100);
      }else if(parameterNames[i].name.toLowerCase() == "humidity"){
        rotationValue=getGaugeValue(avgValue,60);
      }else if(parameterNames[i].name == "PM2.5"){
        rotationValue=getGaugeValue(avgValue,40);
      }else if(parameterNames[i].name == "PM10"){
        rotationValue=getGaugeValue(avgValue,40);
      }else if(parameterNames[i].name == "CO2"){
        rotationValue=getGaugeValue(avgValue,1000);
      }else if(parameterNames[i].name == "TVOCS"){
        rotationValue=getGaugeValue(avgValue,200);
      }
      let rotation = "rotate("+rotationValue+"turn)";
      let content=(<div key={i} className="gauge">
                  <div className="gauge__body">
                    <div className="gauge__fill" style={{ transform: rotation }}></div>
                    <div className="gauge__cover">{avgValue.toFixed(1)}</div>
                    <div className="gauge_text">{parameterNames[i]?.name} ({parameterNames[i]?.unit})</div>
                  </div>
                </div>);
      if(parameterNames[i]?.name !="AQI Index"){
        htmlArray.push(content);
      }
    }
    return htmlArray;
  };
  const AQIranges=[
    { title: "Good", range:"0-50", value : 70,  color: "#9cd84e",class:"active-success" },
    { title: "Moderate", range: "51-100", value: 25, color: "#facf39" ,class:"active-warning"},
    { title: "Unhealthy for Sensitive Groups", range: "101-150", value: 15, color: "#c83e3a",class:"active-lightdanger" },
    { title: "Unhealthy", range: "151-200", value: 10, color: "#852626",class:"active-danger" },
    { title: "Very Unhealthy", range: "201-300", value: 10, color: "#78243e",class:"active-Lightred" },
    { title: "Hazardous", range: "301-500", value: 15, color: "#73236c",class:"active-red" } 
  ];
  const Tempranges=[
    { title: "Good", range:"18-27", value : 36,  color: "#9cd84e",class:"active-success" },
    { title: "Moderate", range: "28-35", value: 36, color: "#facf39" ,class:"active-warning"},
    { title: "Unhealthy", range: "36-50", value: 36, color: "#852626",class:"active-danger" },
    { title: "Hazardous", range: "51-100", value: 144, color: "#73236c",class:"active-red" } 
  ];
  const Humudityranges=[
    { title: "Good", range:"0-50", value : 36,  color: "#9cd84e",class:"active-primary" },
    { title: "Moderate", range: "51-100", value: 36, color: "#facf39" ,class:"active-Darkprimary"},
  ];
  const PM25ranges=[
    { title: "Good", range:"0-25", value : 36,  color: "#9cd84e",class:"active-success" },
    { title: "Moderate", range: "26-50", value: 36, color: "#facf39" ,class:"active-warning"},
    { title: "Unhealthy", range: "51-100", value: 36, color: "#852626",class:"active-danger" },
    { title: "Hazardous", range: "101-300", value: 144, color: "#73236c",class:"active-red" } 
  ];
  const PM10ranges=[
    { title: "Good", range:"0-39", value : 36,  color: "#9cd84e",class:"active-success" },
    { title: "Moderate", range: "40-79", value: 36, color: "#facf39" ,class:"active-warning"},
    { title: "Unhealthy", range: "80-120", value: 36, color: "#852626",class:"active-danger" },
    { title: "Hazardous", range: "121-300", value: 144, color: "#73236c",class:"active-red" } 
  ];
  const CO2ranges=[
    { title: "Good", range:"0-400", value : 36,  color: "#9cd84e",class:"active-success" },
    { title: "Moderate", range: "401-800", value: 36, color: "#facf39" ,class:"active-warning"},
    { title: "Unhealthy", range: "801-1500", value: 36, color: "#852626",class:"active-danger" },
    { title: "Hazardous", range: "1501-2000", value: 144, color: "#73236c",class:"active-red" } 
  ];
  const TVOCSranges=[
    { title: "Good", range:"0-40", value : 36,  color: "#9cd84e",class:"active-success" },
    { title: "Moderate", range: "41-65", value: 36, color: "#facf39" ,class:"active-warning"},
    { title: "Unhealthy", range: "66-130", value: 36, color: "#852626",class:"active-danger" },
    { title: "Hazardous", range: "131-200", value: 144, color: "#73236c",class:"active-red" } 
  ];
  const getClassNameByValueAndRange = (value, parameterName) => {
    let data=AQIranges;
    if(parameterName=="Temperature"){
      data=Tempranges;
    }else if(parameterName=="Humidity"){
      data=Humudityranges;
    }else if(parameterName=="PM2.5"){
      data=PM25ranges;
    }else if(parameterName=="PM10"){
      data=PM10ranges;
    }else if(parameterName=="CO2"){
      data=CO2ranges;
    }else if(parameterName=="TVOCS"){
      data=TVOCSranges;
    }
    for (const item of data) {
      const [min, max] = item.range.split('-').map(Number);
      if (value >= min && value <= max) {
        return item.class;
      }
    }
    return "active-success"; // Return null if value is not in any range
  };
  
  const GetDoughnutChart = function(data,id){
    let avgValue=GetAvergaevalue(data,"AQI Index");
    let rotationvalue=(170/500)*avgValue;
    $("#"+id).html('<div class="needle" style=transform:rotate('+rotationvalue+'deg)></div>');
    var myChart =  $("#"+id).drawDoughnutChart(AQIranges,avgValue,id);
   // setneedlerotation("rotate("+rotationvalue+"deg)");
    // Event listener to hide tooltips on tab change
   /*  document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
          // Disable tooltips
          myChart.options.tooltips.enabled = false;
      } else {
          // Enable tooltips
          myChart.options.tooltips.enabled = true;
      }
      myChart.update();
  }); */
  }
  const GetDashboardData= async function(){
    let authHeader = await CommonFunctions.getAuthHeader();
    document.getElementById('loader').style.display = "block";
    fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/DataForDashboard", {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          const parameterNames = [...new Set(data.map(item => item.parameterName))];
          const parameterNamesWithUnit = parameterNames.map(parameterName => {
            const { unitName } = data.find(item => item.parameterName === parameterName);
            return { name: parameterName, unit: unitName };
          });
          setParameters(parameterNames);
          setParameterslist(parameterNamesWithUnit);
          const stationNames = [...new Set(data.map(item => item.stationName))];
          setStationslist(stationNames);
          // Group the data by station name and parameter name
          const groupedData = data.reduce((acc, curr) => {
            const { stationName, parameterName, parametervalue } = curr;
            if (!acc[stationName]) {
              acc[stationName] = {};
            }
            acc[stationName][parameterName] = parametervalue;
            return acc;
          }, {});
          setGroupData(groupedData);
          console.log(groupedData);
          const generatedHTML = generateHTML(groupedData,parameterNamesWithUnit);
            setGuageData(generatedHTML);
            GetDoughnutChart(groupedData,"DashboarddoughnutChart");
            document.getElementById('loader').style.display = "none";
          }else{
            document.getElementById('loader').style.display = "none";
          }
      }).catch((error) => {
        document.getElementById('loader').style.display = "none";
        toast.error('Unable to get the dashboard data. Please contact administrator');
    });
  }

  const GetSitedData= async function(){
    let stationID=document.getElementById("Stations").value;
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    document.getElementById('loader').style.display = "block";
    let params = new URLSearchParams({ StationID: stationID,FromDate: Fromdate, ToDate: Todate});
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/DataForSite?"+params, {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          const parameterNames = [...new Set(data.map(item => item.parameterName))];
          const parameterNamesWithUnit = parameterNames.map(parameterName => {
            const { unitName } = data.find(item => item.parameterName === parameterName);
            return { name: parameterName, unit: unitName };
          });
          setParameters(parameterNames);
          setParameterslist(parameterNamesWithUnit);
          const stationNames = [...new Set(data.map(item => item.stationName))];
          setStationslist(stationNames);
          // Group the data by station name and parameter name
          const groupedData = data.reduce((acc, curr) => {
            const { stationName, parameterName, parametervalue } = curr;
            if (!acc[stationName]) {
              acc[stationName] = {};
            }
            acc[stationName][parameterName] = parametervalue;
            return acc;
          }, {});
          setGroupData(groupedData);
          console.log(groupedData);
          const generatedHTML = generateHTML(groupedData,parameterNamesWithUnit);
            setGuageData(generatedHTML);
            GetDoughnutChart(groupedData,"SitedoughnutChart");
            GetBrushChart(data);
            document.getElementById('loader').style.display = "none";
        }else{
          document.getElementById('loader').style.display = "none";
        }
      }).catch((error) => {
        document.getElementById('loader').style.display = "none";
        toast.error('Unable to get the dashboard data. Please contact administrator');
    });
  }

  const GetHeatMapData= async function(){
    let stationID=document.getElementById("Stations").value;
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    document.getElementById('loader').style.display = "block";
    let params = new URLSearchParams({ StationID: stationID,FromDate: Fromdate, ToDate: Todate});
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/DataForHeatMap?"+params, {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          GetHeatMapChart(data);
          document.getElementById('loader').style.display = "none";
        }else{
          document.getElementById('loader').style.display = "none";
        }
      }).catch((error) => {
        document.getElementById('loader').style.display = "none";
        toast.error('Unable to get the dashboard data. Please contact administrator');
    });;
  }

  const DashboardDetails = function(){
    setCalander(false);
    GetDashboardData();
  }
  const SiteDetails = function(){
    setFromDate(new Date('March 28, 2024'));
    setToDate(new Date('March 30, 2024'));
    setCalander(true);
    setTimeout(() => {
      GetSitedData();
    }, 10);
  }
  const HeatMapDetails = function(){
    setFromDate(new Date('March 26, 2024'));
    setToDate(new Date('April 06, 2024'));
    setCalander(true);
    setTimeout(() => {
      GetHeatMapData();
    }, 10);
  }

  const GetStationsList= async function(){
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ "api/Stations", {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          setMainStationslist(data);
        }
      }).catch((error) => toast.error('Unable to get the dashboard data. Please contact adminstrator'));
  }

  const ChangeStation = function(event){
    document.getElementById("Stations").value=event.target.value;
    setTimeout(() => {
      GetSitedData();
    }, 10);
  }
  const ChangeFromDate = function(param){
    //document.getElementById("fromdateid").value=new Date(param);
    setTimeout(() => {
      GetSitedData();
    }, 10);
  }
  const ChangeToDate = function(param){
  //  document.getElementById("todateid").value=new Date(param);
  setTimeout(() => {
    GetSitedData();
  }, 10);
  }

  const GetBrushChart = function(param){
    let AQIObject = param.filter(obj => obj.parameterName == 'AQI Index');

    const data = AQIObject.map(obj => ({
      x: new Date(obj.interval+"Z").getTime(),
      y: obj.parametervalue
  }));  
    const options = {
      series: [{
        name: "AQI",
        data: data
      }],
      chart: {
        id: 'chart2',
        type: 'line',
        height: 230,
        toolbar: {
          autoSelected: 'pan',
          show: false
        }
      },
      colors: ['#86c396'],
      stroke: {
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1,
      },
      markers: {
        size: 0
      },
      grid: {
        yaxis: {
            lines: {
                show: false
            }
        },
      },
      xaxis: {
        type: 'datetime',
      },
      tooltip: {
        x: {
            format: 'dd MMM yyyy HH:mm:ss' // Format for date and time
        }
      }
    };
    setChartOptions(options);
  }

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  const GetHeatMapChart = function(param){
    const heatmapData = param.map(item => ({
      x: new Date(item.interval).toLocaleDateString(), // Date as x-axis
      y: formatTime(item.interval), // Customized time format as y-axis
      value: item.parametervalue, // Changes in parameter value as the value for the heatmap
    }));
    const newData = heatmapData.map(item => {
      const dateTimeParts = item.x.split('/');
      const year = dateTimeParts[2];
      const month = dateTimeParts[0].padStart(2, '0');
      const day = dateTimeParts[1].padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
  
      return { "name": item.y, "data": [{ "x": dateStr, "y": item.value }] };
  });
    // Configuration options for the heatmap chart
    /* const series = [{
      name: "AQI",
      data: newData
    }]; */

    const series=[{
      name: '10 pm',
      data: [
      {
          "x": "1",
          "y": 28
      },
      {
          "x": "2",
          "y": 30
      },
      {
          "x": "3",
          "y": 31
      },
      {
          "x": "4",
          "y": 26
      },
      {
          "x": "5",
          "y": 34
      },
      {
          "x": "6",
          "y": 35
      },
      {
          "x": "7",
          "y": 32
      },
      {
          "x": "8",
          "y": 28
      },
      {
          "x": "9",
          "y": 30
      },
      {
          "x": "10",
          "y": 31
      },
      {
          "x": "11",
          "y": 34
      },
      {
          "x": "12",
          "y": 35
      }
  ]
  },
  {
      name: '8 pm',
      data: [
      {
          "x": "1",
          "y": 47
      },
      {
          "x": "2",
          "y": 37
      },
      {
          "x": "3",
          "y": 40
      },
      {
          "x": "4",
          "y": 38
      },
      {
          "x": "5",
          "y": 34
      },
      {
          "x": "6",
          "y": 42
      },
      {
          "x": "7",
          "y": 45
      },
      {
          "x": "8",
          "y": 46
      },
      {
          "x": "9",
          "y": 41
      },
      {
          "x": "10",
          "y": 37
      },
      {
          "x": "11",
          "y": 39
      },
      {
          "x": "12",
          "y": 37
      }
  ]
  },
  {
      name: '6 pm',
      data: [
      {
          "x": "1",
          "y": 44
      },
      {
          "x": "2",
          "y": 45
      },
      {
          "x": "3",
          "y": 47
      },
      {
          "x": "4",
          "y": 51
      },
      {
          "x": "5",
          "y": 36
      },
      {
          "x": "6",
          "y": 50
      },
      {
          "x": "7",
          "y": 49
      },
      {
          "x": "8",
          "y": 43
      },
      {
          "x": "9",
          "y": 46
      },
      {
          "x": "10",
          "y": 39
      },
      {
          "x": "11",
          "y": 41
      },
      {
          "x": "12",
          "y": 38
      }
  ]
  },
  {
      name: '4 pm',
      data: [
      {
          "x": "1",
          "y": 50
      },
      {
          "x": "2",
          "y": 46
      },
      {
          "x": "3",
          "y": 48
      },
      {
          "x": "4",
          "y": 46
      },
      {
          "x": "5",
          "y": 46
      },
      {
          "x": "6",
          "y": 49
      },
      {
          "x": "7",
          "y": 48
      },
      {
          "x": "8",
          "y": 47
      },
      {
          "x": "9",
          "y": 47
      },
      {
          "x": "10",
          "y": 49
      },
      {
          "x": "11",
          "y": 51
      },
      {
          "x": "12",
          "y": 47
      }
  ]
  },
  {
      name: '2 pm',
      data: [
      {
          "x": "1",
          "y": 54
      },
      {
          "x": "2",
          "y": 46
      },
      {
          "x": "3",
          "y": 53
      },
      {
          "x": "4",
          "y": 47
      },
      {
          "x": "5",
          "y": 51
      },
      {
          "x": "6",
          "y": 47
      },
      {
          "x": "7",
          "y": 47
      },
      {
          "x": "8",
          "y": 52
      },
      {
          "x": "9",
          "y": 55
      },
      {
          "x": "10",
          "y": 47
      },
      {
          "x": "11",
          "y": 48
      },
      {
          "x": "12",
          "y": 54
      }
  ]
  },
  {
      name: '12 pm',
      data: [
      {
          "x": "1",
          "y": 54
      },
      {
          "x": "2",
          "y": 52
      },
      {
          "x": "3",
          "y": 49
      },
      {
          "x": "4",
          "y": 52
      },
      {
          "x": "5",
          "y": 58
      },
      {
          "x": "6",
          "y": 53
      },
      {
          "x": "7",
          "y": 50
      },
      {
          "x": "8",
          "y": 52
      },
      {
          "x": "9",
          "y": 58
      },
      {
          "x": "10",
          "y": 55
      },
      {
          "x": "11",
          "y": 53
      },
      {
          "x": "12",
          "y": 48
      }
  ]
  },
  {
      name: '10 am',
      data: [
      {
          "x": "1",
          "y": 45
      },
      {
          "x": "2",
          "y": 48
      },
      {
          "x": "3",
          "y": 44
      },
      {
          "x": "4",
          "y": 44
      },
      {
          "x": "5",
          "y": 50
      },
      {
          "x": "6",
          "y": 46
      },
      {
          "x": "7",
          "y": 53
      },
      {
          "x": "8",
          "y": 48
      },
      {
          "x": "9",
          "y": 51
      },
      {
          "x": "10",
          "y": 43
      },
      {
          "x": "11",
          "y": 52
      },
      {
          "x": "12",
          "y": 48
      }
  ]
  },
  {
      name: '8 am',
      data: [
      {
          "x": "1",
          "y": 40
      },
      {
          "x": "2",
          "y": 45
      },
      {
          "x": "3",
          "y": 39
      },
      {
          "x": "4",
          "y": 36
      },
      {
          "x": "5",
          "y": 40
      },
      {
          "x": "6",
          "y": 40
      },
      {
          "x": "7",
          "y": 44
      },
      {
          "x": "8",
          "y": 43
      },
      {
          "x": "9",
          "y": 42
      },
      {
          "x": "10",
          "y": 42
      },
      {
          "x": "11",
          "y": 42
      },
      {
          "x": "12",
          "y": 37
      }
  ]
  },
  {
      name: '6 am',
      data: [
      {
          "x": "1",
          "y": 35
      },
      {
          "x": "2",
          "y": 33
      },
      {
          "x": "3",
          "y": 34
      },
      {
          "x": "4",
          "y": 33
      },
      {
          "x": "5",
          "y": 35
      },
      {
          "x": "6",
          "y": 40
      },
      {
          "x": "7",
          "y": 40
      },
      {
          "x": "8",
          "y": 35
      },
      {
          "x": "9",
          "y": 32
      },
      {
          "x": "10",
          "y": 40
      },
      {
          "x": "11",
          "y": 38
      },
      {
          "x": "12",
          "y": 37
      }
  ]
  },
  {
      name: '4 am',
      data: [
      {
          "x": "1",
          "y": 30
      },
      {
          "x": "2",
          "y": 22
      },
      {
          "x": "3",
          "y": 23
      },
      {
          "x": "4",
          "y": 22
      },
      {
          "x": "5",
          "y": 21
      },
      {
          "x": "6",
          "y": 27
      },
      {
          "x": "7",
          "y": 25
      },
      {
          "x": "8",
          "y": 34
      },
      {
          "x": "9",
          "y": 31
      },
      {
          "x": "10",
          "y": 28
      },
      {
          "x": "11",
          "y": 23
      },
      {
          "x": "12",
          "y": 34
      }
  ]
  },
  {
      name: '2 am',
      data: [
      {
          "x": "1",
          "y": 22
      },
      {
          "x": "2",
          "y": 24
      },
      {
          "x": "3",
          "y": 24
      },
      {
          "x": "4",
          "y": 24
      },
      {
          "x": "5",
          "y": 27
      },
      {
          "x": "6",
          "y": 26
      },
      {
          "x": "7",
          "y": 25
      },
      {
          "x": "8",
          "y": 27
      },
      {
          "x": "9",
          "y": 28
      },
      {
          "x": "10",
          "y": 30
      },
      {
          "x": "11",
          "y": 29
      },
      {
          "x": "12",
          "y": 28
      }
  ]
  },
  {
      name: '12 am',
      data: [
      {
          "x": "1",
          "y": 6
      },
      {
          "x": "2",
          "y": 18
      },
      {
          "x": "3",
          "y": 20
      },
      {
          "x": "4",
          "y": 5
      },
      {
          "x": "5",
          "y": 7
      },
      {
          "x": "6",
          "y": 20
      },
      {
          "x": "7",
          "y": 5
      },
      {
          "x": "8",
          "y": 6
      },
      {
          "x": "9",
          "y": 13
      },
      {
          "x": "10",
          "y": 15
      },
      {
          "x": "11",
          "y": 16
      },
      {
          "x": "12",
          "y": 11
      }
  ]
  }
];
    setHeatMapChartData(series);
    const heatmapOptions = {
      chart: {
        type: 'heatmap', // Specify the chart type as heatmap
        toolbar: {
          show: false // Hide toolbar
        }
      },
      plotOptions: {
        heatmap: {
          // shadeIntensity: 0.5,
          radius: 0,
          // useFillColorAsStroke: true,
          colorScale: {
            ranges: [{
              from: 0,
              to: 20,
              name: '0-20',
              color: '#00A100'
          },
          {
              from: 21,
              to: 30,
              name: '20-30',
              color: '#e7d574'
          },
          {
              from: 31,
              to: 40,
              name: '31-50',
              color: '#eeb26d'
          },
{
              from: 41,
              to: 50,
              name: '41-50',
              color: '#e87b40'
          },
          {
              from: 51,
              to: 60,
              name: '50+',
              color: '#d8665a'
          }
      ]
          }
        }
      },
      xaxis: {
        type: 'category',
       categories: ['Mar 26 2024', 'Mar 27 2024', 'Mar 28 2024', 'Mar 29 2024', 'Mar 30 2024','Mar 31 2024', 'Apr 1 2024', 'Apr 2 2024', 'Apr 3 2024', 'Apr 4 2024','Apr 5 2024', 'Apr 6 2024'] // Change the labels according to your need
    },
    yaxis: {
        type: 'category',
        categories: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00']
    },
      tooltip: {
        enabled: true // Enable tooltip
      },
      dataLabels: {
        enabled: false // Enable data labels
      },
      title: {
        text: 'Heatmap Chart', // Chart title
        align: 'center'
      },
    };
setHeatMapChartOptions(heatmapOptions);
  }
 
   useEffect(() => {  
    GetStationsList();
    GetDashboardData();
  },[]);
  

  return (
    <main id="main" className="main" >
      <div className="container px-0">
        <div className="pagetitle">
            <h1>Dashboard</h1>
        </div>
        <section className="section">
          <div className="container  mt-3">
          <section className="wrapper">
          <div className="row pt-3">
            <div className="col-sm-12">
            <div className="col-md-4">
                    <div className="row">
                      <div id="loader" className="loader"></div>
                    </div>
                  </div>
              <nav className="d-flex justify-content-between">
                <div className="nav nav-tabs mb-3 bottom-transparent" id="nav-tab" role="tablist">
                  <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true" onClick={DashboardDetails}>
                    Dashboard
                  </button>
                  <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false" onClick={SiteDetails}>
                    Site Details
                  </button>
                  <button className="nav-link" id="nav-heat-tab" data-bs-toggle="tab" data-bs-target="#nav-heat" type="button" role="tab" aria-controls="nav-heat" aria-selected="false" onClick={HeatMapDetails}>
                    Heat Map 
                  </button>
                  {/* <button className="nav-link" id="nav-heat-tab" data-bs-toggle="tab" data-bs-target="#nav-heat" type="button" role="tab" aria-controls="nav-heat" aria-selected="false">
                    Overtime
                  </button> */}
                </div>
                {Calander &&(
                <div className="wrapperpicker">
                  <ul>
                    <li>
                      <label for="datepicker">
                      <DatePicker className="form-control me-2" id="fromdateid" selected={fromDate} onChange={(date) => {setFromDate(date);ChangeFromDate(date);}} />
                      </label>	
                      <label for="datepicker">
                      <DatePicker className="form-control" id="todateid" selected={toDate} onChange={(date) =>{setToDate(date); ChangeToDate(date);}} />
                      </label>	
                    </li>
                  </ul>
                </div>
                )}
              </nav>
              <div className="tab-content" id="nav-tabContent">
                <div className="tab-pane fade active show" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                <div className="col-sm-12 p-3 light-shadow">
                  <h6 className="h6-tabs">Current Indoor Air Quality</h6>
                  <div className="row">
                    <div className="col-md-4 position-relative">
                      <div id="DashboarddoughnutChart" className="chart doughnutChart">
                        <div className="needle" style={{ transform: needlerotation }}></div>
                      </div>
                    </div>
                    <div className="col-md-8 text-center">
                      {GuageData}
                    </div>
                  </div>
                  </div>

                  <div className="col-sm-12 mt-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="h6-tabs">Indoor Air Quality By Space</h6>
                  <div class="pollutants-legend-heading">
                          <div class="pollutants-legend-series">
                            <span class="pollutants-legend-marker good-span"></span>
                            <span class="pollutants-legend-text">Good</span>
                          </div>
                          <div class="pollutants-legend-series">
                            <span class="pollutants-legend-marker moderate-span"></span>
                            <span class="pollutants-legend-text">Moderate</span>
                          </div>
                          <div class="pollutants-legend-series">
                            <span class="pollutants-legend-marker unhealth-span"></span>
                            <span class="pollutants-legend-text">Unhealthy</span>
                          </div>
                          <div class="pollutants-legend-series">
                            <span class="pollutants-legend-marker hazar-span"></span>
                            <span class="pollutants-legend-text">Hazardous</span>
                          </div>
                        </div>
                  <hr/>
                  <div className="table-responsive">
                    <table className="table table-borderless custom-table me-auto ms-auto">
                      <thead>
                        <tr className="text-center">
                          <th className="text-left">Space</th>
                          {Parameterslist.map(({ name, unit }) => (
                              <th key={name}>{name == "AQI Index"?`${name}`:`${name} (${unit})`}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                     {Stationslist.map(stationName => (
                        <tr key={stationName}>
                          <td className="text-left bottom-bottom-1">{stationName}</td>
                          {Parameters.map(parameterName => (   
                            <td key={parameterName} className={getClassNameByValueAndRange(GroupData[stationName][parameterName],parameterName)}>
                              {GroupData[stationName][parameterName]}
                            </td>
                          ))}
                        </tr>
                      )) 
                    }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
                </div>
                <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                <div className="col-sm-12 d-flex align-item-center justify-content-end">
                    <div className="dropdown custom-dropdown me-2">
                      <label for="countries">Site : </label>
                      <select className="one" name="group" id="Group">
                        <option value="1">85 Main Street</option>
                      </select>
                    </div>
                    <div className="dropdown custom-dropdown">
                      <label for="countries">Sensor : </label>
                      <select className="one" name="Stations" id="Stations" onChange={ChangeStation}>
                      {MainStationslist.map(station => (
                        <option value={station.id}>{station.stationName}</option>
                      ))}
                      </select>
                    </div>
                  </div>
                
                <div className="col-sm-12 p-3 light-shadow">
                  <h6 className="h6-tabs">Current Indoor Air Quality</h6>
                  <div className="row">
                    <div className="col-md-4 position-relative">
                      <div id="SitedoughnutChart" className="chart doughnutChart1">
                        <div className="needle" style={{ transform: needlerotation }}></div>
                      </div>
                    </div>
                    <div className="col-md-8 text-center">
                      {GuageData}
                    </div>
                  </div>
                  </div>

                  <div class="col-sm-12 mt-3">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="h6-tabs">Sensor Details - Overtime</h6>
                        <hr/>
                        <div id="wrapper-brush">
                          <div id="chart-line2">
                           {ChartOptions !=null && (
                          <Chart options={ChartOptions} series={ChartOptions?.series} type="line" height={230} />
                          )} 
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="nav-heat" role="tabpanel" aria-labelledby="nav-heat-tab">
                <div className="col-sm-12 d-flex align-item-center justify-content-end">
                    <div className="dropdown custom-dropdown me-2">
                      <label for="countries">Site : </label>
                      <select className="one" name="group" id="Group">
                        <option value="1">85 Main Street</option>
                      </select>
                    </div>
                    <div className="dropdown custom-dropdown">
                      <label for="countries">Sensor : </label>
                      <select className="one" name="Stations" id="Stations" onChange={ChangeStation}>
                      {MainStationslist.map(station => (
                        <option value={station.id}>{station.stationName}</option>
                      ))}
                      </select>
                    </div>
                  </div>
                  <div class="col-sm-12 p-3 light-shadow">
                    <h6 class="h6-tabs">Sensor Details - HeatMap</h6>
                    {HeatMapChartOptions !=null && (
                    <Chart id="heatchart" options={HeatMapChartOptions} series={HeatMapChartData} type="heatmap" height={700} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        </section>
          </div>
        </section>
      </div>
    </main>
  );
}
export default Dashboard1;