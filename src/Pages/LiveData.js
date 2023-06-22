import React, { useCallback, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-dragdata'
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import CommonFunctions from "../utils/CommonFunctions";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

function LiveData() {
  const $ = window.jQuery;
  const chartRef = useRef();
  const jspreadRef = useRef(null);
  const [selectedStations, setselectedStations] = useState([]);
  const [ListReportData, setListReportData] = useState([]);
  const [AllLookpdata, setAllLookpdata] = useState(null);
  const [Stations, setStations] = useState([]);
  const [Pollutents, setPollutents] = useState([]);
  const [selectedgrid, setselectedgrid] = useState([]);
  const [SelectedPollutents, setSelectedPollutents] = useState([]);
  const [Criteria, setcriteria] = useState([]);
  const [dataForGridcopy, setdataForGridcopy] = useState([]);
  const [ChartData, setChartData] = useState({ labels: [], datasets: [] });
  const [ChartOptions, setChartOptions] = useState();
  const [ListHistory, setListHistory] = useState([]);
  const [SelectedCells, setSelectedCells] = useState([]);
  const [Flagcodelist,SetFlagcodelist]=useState([]);
  const [Nestedheaders, setNestedheaders] = useState([]);
  const [revert, setrevert] = useState(false);
  const [Groups, setGroups] = useState([]);
  const [StationGroups, setStationGroups] = useState([]);
  const [GroupSelected, setGroupSelected] = useState("");
  const [RefreshGrid, setRefreshGrid] = useState(false);
  const getDuration = window.LiveDataDuration;
  const revertRef = useRef();
  revertRef.current = revert;
  let jsptable = null;
  var lastSelectedRow;
  let cellnames = [];
  var dataForGrid = [];

  const colorArray = ["#96cdf5", "#fbaec1", "#00ff00", "#800000", "#808000", "#008000", "#008080", "#000080", "#FF00FF", "#800080",
    "#CD5C5C", "#FF5733 ", "#1ABC9C", "#F8C471", "#196F3D", "#707B7C", "#9A7D0A", "#B03A2E", "#F8C471", "#7E5109"];

  useEffect(() => {
    fetch(process.env.REACT_APP_WSurl + "api/AirQuality/GetAllLookupData")
      .then((response) => response.json())
      .then((data) => {
        setAllLookpdata(data);
        setStations(data.listStations);
        SetFlagcodelist(data.listFlagCodes);
        setStationGroups(data.listStationGroups);
        let groupNamearray= data.listStationGroups;
        let groupnames = groupNamearray.filter( (ele, ind) => ind === groupNamearray.findIndex( elem => elem.groupID === ele.groupID))
        setGroups(groupnames);
        setRefreshGrid(true);
        //getdatareport();
        setTimeout(function () {
          // $('#stationid').SumoSelect({
          //   triggerChangeCombined: true, placeholder: 'Select Station', floatWidth: 200, selectAll: true,
          //   search: true
          // });
          $('#pollutentid').SumoSelect({
            triggerChangeCombined: true, placeholder: 'Select Parameter', floatWidth: 200, selectAll: true,
            search: true
          });
        }, 10);
        
      })
      .catch((error) => console.log(error));
  }, []);
  useEffect(() => {
    if (jsptable) {
      jsptable.refresh();
    }
    initializeJsGrid();
  }, [RefreshGrid,ListReportData]);

  useEffect(() => {
    if(AllLookpdata !=null){
    ChangeGroupName('load');
    getdatareport();
  }
  }, [AllLookpdata]);

  useEffect(() => {
    const interval = setInterval(() => {
      getdatareport('refresh');
    }, getDuration);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  })

  const selectionActive = function (a, startcolindex, stratrowindex, endcolindex, endrowidex) { //a-enire value,b-1stcolumn index, c-start row index, d-last column index
    var data = jsptable.getData(true);
    var data1 = jsptable.getSelectedRows(true);
    setselectedgrid([startcolindex, stratrowindex])
    setdataForGridcopy(dataForGrid)
    let cellnames1 = [];
    for (var i = stratrowindex; i <= endrowidex; i++) {
      for (var k = startcolindex; k <= endcolindex; k++) {
        var cellName1 = jspreadsheet.helpers.getColumnNameFromCoords(k, i);
        cellnames1.push(cellName1);
      }
    }
    for (var p = 0; p < cellnames.length; p++) {
      let index = cellnames1.indexOf(cellnames[p]);
      if (index == -1) {
        jsptable.getCell(cellnames[p]).classList.remove('cellhelight');
      }
    }


    cellnames = [];
    for (var i = stratrowindex; i <= endrowidex; i++) {
      for (var k = startcolindex; k <= endcolindex; k++) {
        var cellName = jspreadsheet.helpers.getColumnNameFromCoords(k, i);
        cellnames.push(cellName);
        if (cellName) {
          jsptable.getCell(cellName).classList.add('cellhelight');
        }
      }
    }

    // let finalarr = [];
    // for (let j = data1[0]; j <= data1[(data1.length - 1)]; j++) {
    //   finalarr.push(dataForGrid[j]);
    // }
    // let key = Object.keys(finalarr[0]);
    // let chart = chartRef.current;
    // let chartdata = chart != null ? chart.data : [];
    // for (let j = 0; j < SelectedPollutents.length; j++) {
    //   chartdata.datasets[j].pointRadius = chartdata.datasets[j].pointRadius.map(function (x) { x = 2; return x });
    // }
    // for (let k = startcolindex; k <= endcolindex; k++) {
    //   for (var i = 0; i < chartdata.datasets[k - 1].data.length; i++) {
    //     const index = finalarr.findIndex(data => data.Date == chartdata.labels[i]);
    //     if (index > -1) {
    //       chartdata.datasets[k - 1].pointRadius[i] = 10;
    //     } else {
    //       chartdata.datasets[k - 1].pointRadius[i] = 2;
    //     }
    //   }
    // }
    // chart.update();
  }
 
  const loadtable = function (instance) {
    for (let i = 0; i < SelectedPollutents.length; i++) {
      let Parameterssplit = SelectedPollutents[i].split("_");
      let filnallist = ListReportData.filter(x => x.parameterName.toLowerCase() === Parameterssplit[0].toLowerCase());
      for (let j = 0; j < filnallist.length; j++) {
        let index = dataForGrid.findIndex(y => y.Date === filnallist[j].interval);
        if (index > -1) {
          let cell = instance.jexcel.getCellFromCoords(i + 1, index);
          if (filnallist[j].loggerFlags != null) {
            let classname = CommonFunctions.SetFlagColor(filnallist[j].loggerFlags, Flagcodelist);
            if (cell != undefined) {
              cell.style.backgroundColor = classname;
              //cell.classList.add(classname);
            }
          }
        }
      }
    }
  }

  const gethistory = function () {
    let changearr = dataForGridcopy[selectedgrid[1]];
    let filtered = ListReportData.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[selectedgrid[0] - 1]);
    let params = new URLSearchParams({ id: filtered[0].id });

    fetch(process.env.REACT_APP_WSurl + 'api/DataProcessing?' + params, {
      method: 'GET',
    }).then((response) => response.json())
      .then((historydata) => {
        if (historydata) {
          setListHistory(historydata);
        }
      }).catch((error) => toast.error('Unable to update the parameter. Please contact adminstrator'));
    $('#historymodal').modal('show');
  }

  const generateDatabaseDateTime = function (date) {
    return date.replace("T", " ").substring(0, 19);
  }
  /* reported data start */
  const initializeJsGrid = function () {
    dataForGrid = [];
    let Groupid = document.getElementById("groupid").value;
    var layout = [];
    let headers = [];
    if (Groupid != "") {
      headers = Nestedheaders;
    }
    var gridheadertitle;
    layout.push({ name: "Date", title: "Date", type: "text", width: "140px", sorting: true,readOnly:true, });
    for (var i = 0; i < SelectedPollutents.length; i++) {
      let Parameterssplit = SelectedPollutents[i].split("_");
      let filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0]);
      let unitname = AllLookpdata.listReportedUnits.filter(x => x.id == filter[0].unitID);
      gridheadertitle = Parameterssplit[0] + "-" + unitname[0].unitName
      layout.push({
        name: SelectedPollutents[i], title: gridheadertitle, type: "text", width: "100px", sorting: false,readOnly:true, cellRenderer: function (item, value) {
          let flag = AllLookpdata.listFlagCodes.filter(x => x.id == value[Object.keys(value).find(key => value[key] === item) + "flag"]);
          let bgcolor = flag.length > 0 ? flag[0].colorCode : "#FFFFFF";
          return $("<td>").css("background-color", bgcolor).append(item);
        }
      });
    }
    if (SelectedPollutents.length < 10) {
      for (var p = SelectedPollutents.length; p < 10; p++) {
        layout.push({ name: " " + p, title: " ", type: "text", width: "100px", sorting: false,readOnly:true, });
      }
    }
    
    for (var k = 0; k < ListReportData.length; k++) {
      var obj = {};
      var temp = dataForGrid.findIndex(x => x.Date === ListReportData[k].interval);

      let roundedNumber = 0;

      let digit = window.decimalDigit

      if (window.TruncateorRound == "RoundOff") {

        let num = ListReportData[k].parametervalue;
        roundedNumber = num==null?num:num.toFixed(digit);
      }

      else {
        roundedNumber = ListReportData[k].parametervalue==null?ListReportData[k].parametervalue:CommonFunctions.truncateNumber(ListReportData[k].parametervalue, digit);
      }
      let Groupid=document.getElementById("groupid").value;
      if(Groupid !=""){
        if (temp >= 0) {
          dataForGrid[temp][ListReportData[k].parameterName+"_"+ListReportData[k].stationID] = roundedNumber;
        } else {
          obj["Date"] = ListReportData[k].interval;
          obj[ListReportData[k].parameterName+"_"+ListReportData[k].stationID] = roundedNumber;
          dataForGrid.push(obj);
        }
      }else{
        if (temp >= 0) {
          dataForGrid[temp][ListReportData[k].parameterName] = roundedNumber;
        } else {
          obj["Date"] = ListReportData[k].interval;
          obj[ListReportData[k].parameterName] = roundedNumber;
          dataForGrid.push(obj);
        } 
      }
    }
    jsptable = jspreadsheet(jspreadRef.current, {
      data: dataForGrid,
      rowResize: true,
      tableWidth: '100%',
      tableOverflow: true,
      freezeColumns: 1,
      columns: layout,
      nestedHeaders: headers,
      lazyLoading: true,
      loadingSpin: true,
      onselection: selectionActive,
      onload: loadtable,
    });
    
  }
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
  const getdatareport = function () {
    setListReportData([]);
    
    console.log(new Date());
    
    let Station="";
    let Pollutent="";
    let GroupId = $("#groupid").val();
    Station = $("#stationid").val();
    Pollutent = $("#pollutentid").val();
      if (Pollutent.length > 0) {
        Pollutent.join(',')
      }
      if(GroupId==""){
        setSelectedPollutents(Pollutent);
      }else{
        Pollutent=SelectedPollutents;
      }
      // if (param == 'reset' || Pollutent.length == 0) {
      //   if(GroupId==""){
      //     setSelectedPollutents(Pollutent);
      //   }else{
      //     Pollutent=SelectedPollutents;
      //   }
      // } else {
      //    //setSelectedPollutents(finalpollutent);
      // }
      setRefreshGrid(RefreshGrid?false:true);
    let Interval = document.getElementById("criteriaid").value;
    let valid = ReportValidations(Station, Pollutent, Interval,GroupId);
    if (!valid) {
      return false;
    }

    document.getElementById('loader').style.display = "block";
    let type = Interval.substr(Interval.length - 1);
    let Intervaltype;
    if (type == 'H') {
      Intervaltype = Interval.substr(0, Interval.length - 1) * 60;
    } else {
      Intervaltype = Interval.substr(0, Interval.length - 1);
    }
    let isAvgData=false;
    if(Interval=='15-M'){
      isAvgData=false;
    }
    else{
      isAvgData=true;
    }
    let params = new URLSearchParams({Group:GroupId, Station: Station, Pollutent: Pollutent, Interval: Intervaltype,isAvgData: isAvgData });
    let url = process.env.REACT_APP_WSurl + "api/AirQuality/LiveData?"
    if(GroupId !=""){
      url = process.env.REACT_APP_WSurl + "api/AirQuality/StationGroupingLiveData?"
    }
    
    fetch(url + params, {
      method: 'GET',
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
            let data1 = data.map((x) => { x.interval = x.interval.replace('T', ' '); return x; });
            setListReportData(data1);
            getchartdata(data1, "line", "Raw");
        }
        document.getElementById('loader').style.display = "none";
      }).catch((error) => console.log(error));
  }

  const DownloadExcel = function () {
    let Station = $("#stationid").val();
    if (Station.length > 0) {
      Station.join(',')
    }

    let Interval = document.getElementById("criteriaid").value;
    let valid = ReportValidations(Station);
    if (!valid) {
      return false;
    }
    let params = new URLSearchParams({ Station: Station, Interval: Interval });
    window.open(process.env.REACT_APP_WSurl + "api/AirQuality/ExportToExcel?" + params, "_blank");
  }

  const ReportValidations = function (Station, Pollutent, Interval,GroupId) {
    let isvalid = true;
    if (GroupId == "" && Station == "") {
      toast.error('Please select group or station', {
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
    } else if (Station != "" && Pollutent == "") {
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
    } else if (Interval == "") {
      toast.error('Please select interval', {
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
  const GetInterval = function () {
    setcriteria([]);
    let stationID =  $("#stationid").val();
    let finaldata = AllLookpdata.listPollutents.filter(obj => obj.stationID == stationID);
    if (finaldata.length > 0) {
      let finalinterval = [];
      let intervalarr = finaldata[0].serverAvgInterval==null?[]:finaldata[0].serverAvgInterval.split(',');
      for (let i = 0; i < intervalarr.length; i++) {
        let intervalsplitarr = intervalarr[i].split('-');
        finalinterval.push({ value: intervalsplitarr[0], type: intervalsplitarr[1] })
      }
      // let finalinterval1 = finalinterval.reduce((unique, o) => {
      //   if (!unique.some(obj => obj.value != o.value && obj.type === o.type)) {
      //     unique.push(o);
      //   }
      //   return unique;
      // }, []);
      setcriteria(finalinterval);
    }
  }
  
  $('#stationid').change(function (event) {
   
    let filter = $(this).val();
    setselectedStations(filter);
    let Pollutent = AllLookpdata.listPollutents.filter(function (item) {
      for (var i = 0; i < filter.length; i++) {
        if (item['stationID'] == filter[i])
          return true;
      }
    });
    
    setSelectedPollutents(Pollutent);
    GetInterval(); 
    
  })
  
  const Resetfilters = function () {
    $('.pollutentid')[0].sumo.reload();
    $('.pollutentid')[0].sumo.unSelectAll();
    $('#stationid').val("");
    getdatareport();
  }
  const Changepollutent = function (e) {
    setcriteria([]);
    console.log(selectedStations);
    let stationID = document.getElementById("stationid").val();
    let finaldata = AllLookpdata.listPollutents.filter(obj => obj.stationID == stationID && obj.parameterName == e.target.value);
    if (finaldata.length > 0) {
      let finalinterval = [];
      let intervalarr = finaldata[0].serverAvgInterval.split(',');
      for (let i = 0; i < intervalarr.length; i++) {
        let intervalsplitarr = intervalarr[i].split('-');
        finalinterval.push({ value: intervalsplitarr[0], type: intervalsplitarr[1] })
      }
      let finalinterval1 = finalinterval.reduce((unique, o) => {
        if (!unique.some(obj => obj.value != o.value && obj.type === o.type)) {
          unique.push(o);
        }
        return unique;
      }, []);
      setcriteria(finalinterval1);
    }
  }
  const ChangeStation = function (e) {
    setPollutents([]);
    setcriteria([]);
    document.getElementById("groupid").value="";
    if(e.target.value !=""){
      $('#groupid').addClass("disable");
    }else{
      $('#groupid').removeClass("disable");
    }
    let finaldata = AllLookpdata.listPollutents.filter(obj => obj.stationID == e.target.value);
    setPollutents(finaldata);
    setTimeout(function () {
      // $('.pollutentid')[0].sumo.unSelectAll(); 
      $('.pollutentid')[0].sumo.reload();
    }, 10);
  }
  const ChangeGroupName = function (e) {
    let stationParamaters=[];
    let selectedGroup = document.getElementById("groupid").value;
    let headers = [];
    if(e !="load"){
    $('.pollutentid')[0].sumo.reload();
    $('.pollutentid')[0].sumo.unSelectAll();
    $('#stationid').val("");
    if (selectedGroup != "") {
      $('#stationid').addClass("disable");
      $('.pollutentid')[0].sumo.disable();
    } else {
      $('#stationid').removeClass("disable");
      $('.pollutentid')[0].sumo.enable();
    }
  }else{
    setTimeout(function () {
      $('.pollutentid')[0].sumo.reload();
      $('.pollutentid')[0].sumo.unSelectAll();
      $('#stationid').val("");
      if (selectedGroup != "") {
        $('#stationid').addClass("disable");
        $('.pollutentid')[0].sumo.disable();
      } else {
        $('#stationid').removeClass("disable");
        $('.pollutentid')[0].sumo.enable();
      }
    }, 10);
  }
    setGroupSelected(selectedGroup);
    setcriteria([]);
    let stationID = StationGroups.filter(x => x.groupID == selectedGroup).map(a => a.stationID);
    var finalstationID = stationID.filter(function (item, pos) {
      return stationID.indexOf(item) == pos;
    });
    let filter1 = StationGroups.filter(x => x.groupID == selectedGroup && finalstationID.includes(x.stationID)).map(a => a.parameterID);
    let filter2 = [];
    for (let i = 0; i < finalstationID.length; i++) {
      let parameters = StationGroups.filter(x => x.stationID == finalstationID[i] && x.groupID == selectedGroup).map(a => a.parameterID);
      let station = Stations.filter(x => x.id == finalstationID[i]);
      let obj = { title: station.length > 0 ? station[0].stationName : "", colspan: parameters.length };
      headers.push(obj);
      for (let j = 0; j < parameters.length; j++) {
        let value1=AllLookpdata.listPollutents.filter(x => x.stationID == finalstationID[i] && x.parameterID == parameters[j]);
        let value = value1.length>0?value1[0].parameterName:"";
        filter2.push(value + "_" + finalstationID[i]);
      }
    }
    if (filter2.length < 10) {
      let obj = { title: "", colspan: 10 - filter2.length };
      headers.push(obj);
    }
    setSelectedPollutents(filter2);
    setNestedheaders(headers);

    let finaldata = AllLookpdata.listPollutents.filter(obj => stationID.includes(obj.stationID) || filter1.includes(obj.parameterID));
    if (finaldata.length > 0) {
      let finalinterval = [];
      for (let j = 0; j < finaldata.length; j++) {
        let intervalarr = finaldata[j].serverAvgInterval==null?[]:finaldata[j].serverAvgInterval.split(',');
        for (let i = 0; i < intervalarr.length; i++) {
          if(intervalarr[i] !=null){
          let intervalsplitarr = intervalarr[i].split('-');
          let index = finalinterval.findIndex(x => x.value === intervalsplitarr[0] && x.type === intervalsplitarr[1]);
          if (index == -1) {
            finalinterval.push({ value: intervalsplitarr[0], type: intervalsplitarr[1] })
          }
        }
        }
      }
      setcriteria(finalinterval);
    }
   /*  for(var i=0; i<StationGroups.length;i++){
        stationParamaters.push({"Station": StationGroups[i].stationID,"ParameterName":StationGroups[i].parameterID});
    } */
  }
  $('#pollutentid').change(function (e) {
    setcriteria([]);
    let stationID = $("#stationid").val();
    let filter1 = $(this).val();

    // let finaldata = AllLookpdata.listPollutentsConfig.filter(obj => obj.stationID == stationID && obj.parameterName == e.target.value);
    let finaldata = AllLookpdata.listPollutents.filter(obj => stationID.includes(obj.stationID) || filter1.includes(obj.parameterName));
    if (finaldata.length > 0) {
      let finalinterval = [];
      for (let j = 0; j < finaldata.length; j++) {
        let intervalarr = finaldata[j].serverAvgInterval==null?[]:finaldata[j].serverAvgInterval.split(',');
        for (let i = 0; i < intervalarr.length; i++) {
          if(intervalarr[i] !=null){
          let intervalsplitarr = intervalarr[i].split('-');
          let index = finalinterval.findIndex(x => x.value === intervalsplitarr[0] && x.type === intervalsplitarr[1]);
          if (index == -1) {
            finalinterval.push({ value: intervalsplitarr[0], type: intervalsplitarr[1] })
          }
        }
        }
      }
      setcriteria(finalinterval);
    }
  })
  const getchartdata = function (data, charttype, criteria) {
    if (chartRef.current != null) {
      chartRef.current.data = {};
    }
    
    setChartData({ labels: [], datasets: [] });
    setChartOptions();
    let datasets = [];
    let chartdata = [];
    let labels = [];
    let pointRadius = [];
    let xAxislabel = [];
    for (let i = 0; i < SelectedPollutents.length; i++) {
      chartdata = [];
      pointRadius = [];
      let parameterlabel="";
      let pollutentdata = data.filter(val => val.parameterID == SelectedPollutents[i].id);
      if(pollutentdata.length>0){
        for (let k = 0; k < pollutentdata.length; k++) {
          parameterlabel=pollutentdata[k].parameterName;
          let index = labels.indexOf(pollutentdata[k].interval);
          if (index == -1) {
            labels.push(pollutentdata[k].interval)
          }
          chartdata.push(pollutentdata[k].parametervalue)
          pointRadius.push(2);
        }
        datasets.push({ label: parameterlabel, data: chartdata, borderColor: colorArray[i], backgroundColor: hexToRgbA(colorArray[i]), pointRadius: pointRadius, spanGaps: false, })
      }
      
    }
    setChartOptions({
      responsive: true,
      dragData: true,
      onDragStart: function (e) {
        console.log(e)
      },
      onDrag: function (e, datasetIndex, index, value) {
        console.log(datasetIndex, index, value)
      },
      
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          //text: 'Chart.js Bar Chart',
        },
      },
    });
    if (criteria == 'MeanTimeseries') {
      labels = xAxislabel;
    }
    setTimeout(() => {
      setChartData({
        labels,
        datasets: datasets
      })
    }, 10);
  }

  return (
    <main id="main" className="main" >
      <div className="modal fade zoom dashboard_dmodal" id="historymodal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">Parameter History</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <thead>
                    <tr className="header_active">
                      <th>Parameter Name</th>
                      <th>Old Value </th>
                      <th>New Value</th>
                      <th>Modified By</th>
                      <th>Modified On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ListHistory && (
                      ListHistory.map((x, y) =>
                        <tr className="body_active">
                          <td>{AllLookpdata.listPollutents.filter(z => z.id == x.parameterID)[0].parameterName}</td>
                          <td>{x.parameterValueOld}</td>
                          <td>{x.parameterValueNew}</td>
                          <td>{x.modifiedBy}</td>
                          <td>{x.modifiedOn != null ? generateDatabaseDateTime(x.modifiedOn) : x.modifiedOn}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Ok</button>
            </div>
          </div>
        </div>
      </div>
      <section>
        <div>
          <div>
            <div className="row">
            <div className="col-md-2">
                <label className="form-label">Group Name</label>
                <select className="form-select" id="groupid" onChange={ChangeGroupName}>
                    <option value="">None</option>
                    {Groups.map((x, y) =>
                       ///<option value={x.groupID} key={y} >{x.groupName}</option>
                       <option value={x.groupID} key={y} selected={Groups[0]}>{x.groupName}</option>
                    )}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Station Name</label>
                <select className="form-select stationid" id="stationid" onChange={ChangeStation}>
                <option value="" selected> Select Station</option>
                  {Stations.map((x, y) =>
                    <option value={x.id} key={y} >{x.stationName}</option>
                  )}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Parameters</label>
                <select className="form-select pollutentid" id="pollutentid" multiple="multiple" onChange={Changepollutent}>
                  {/* <option selected> Select Pollutents</option> */}
                  {Pollutents.map((x, y) =>
                    <option value={x.parameterName} key={y} >{x.parameterName}</option>
                  )}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Interval</label>
                <select className="form-select" id="criteriaid">
                  <option value="" selected>Select Interval</option>
                  <option value="15-M" selected>15-M</option>
                  {Criteria.map((x, y) =>
                    <option value={x.value + x.type} key={y} >{x.value + '-' + x.type}</option>
                  )}
                </select>
              </div>
              <div className="col-md-2 my-4">
                <button type="button" className="btn btn-primary" onClick={getdatareport}>GetData</button>
                <button type="button" className="btn btn-primary mx-1" onClick={Resetfilters}>Reset</button>
              </div>
              <div className="col-md-4">
                <div className="row">
                  <div id="loader" className="loader"></div>
                </div>
              </div>

            </div>
            {ListReportData.length > 0 && (
              <div>
                {/* <div className="row">
                  <div className="col-md-12 mb-3">
                    <button type="button" className="btn btn-primary" title="History" onClick={gethistory}><i class="bi bi-clock-history"></i></button>
                  </div>
                </div> */}
                <div className="row">
                  <div className="col-md-12 mb-3">
                    {AllLookpdata.listFlagCodes.map((i) =>
                      <button type="button" className="btn btn-primary flag mx-1" style={{ backgroundColor: i.colorCode }} data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title={i.name}>{i.code}</button>
                    )}                    
                  </div>
                </div>
                <div className="jsGrid" ref={jspreadRef} />
              </div>
            )}
            {ListReportData.length > 0 && ChartData && (
              <div >
                <Line ref={chartRef} options={ChartOptions} data={ChartData} height={120} />
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
export default LiveData;