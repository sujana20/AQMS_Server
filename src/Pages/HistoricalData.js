import React, { useCallback, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment';
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import CommonFunctions from "../utils/CommonFunctions";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  TimeScale,
  defaults,
  elements,
} from 'chart.js';

import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin
);

function HistoricalData() {
  const $ = window.jQuery;
  const gridRefjsgridreport = useRef();
  const chartRef = useRef();
  const jspreadRef = useRef(null);
  const [selectedStations, setselectedStations] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [ListReportData, setListReportData] = useState([]);
  const [AllLookpdata, setAllLookpdata] = useState(null);
  const [Stations, setStations] = useState([]);
  const [Pollutents, setPollutents] = useState([]);
  const [selectedgrid, setselectedgrid] = useState([]);
  const [SelectedPollutents, setSelectedPollutents] = useState([]);
  const [Criteria, setcriteria] = useState([]);
  const [isRolling, setisRolling] = useState(false);
  const [dataForGridcopy, setdataForGridcopy] = useState([]);
  const [ChartData, setChartData] = useState({ labels: [], datasets: [] });
  const [ChartOptions, setChartOptions] = useState();
  const [ListHistory, setListHistory] = useState([]);
  const [SelectedCells, setSelectedCells] = useState([]);
  const [Nestedheaders, setNestedheaders] = useState([]);
  const [Flagcodelist, SetFlagcodelist] = useState([]);
  const [revert, setrevert] = useState(false);
  const [Groups, setGroups] = useState([]);
  const [StationGroups, setStationGroups] = useState([]);
  const [GroupSelected, setGroupSelected] = useState("");
  const [LoadjsGridData, setLoadjsGridData] = useState(false);
  const [DataCount, setDataCount] = useState(0);
  const [ReportDataList, setReportDataList] = useState([]);
  const [allLegendsChecked, setallLegendsChecked] = useState(true);

  const chartelementRef = useRef();
  const chartlastEventRef = useRef();
  const revertRef = useRef();
  revertRef.current = revert;
  const ReportDataListRef = useRef();
  ReportDataListRef.current = ReportDataList;
  const dataForGridref = useRef();
  let jsptable = null;
  var lastSelectedRow;
  let cellnames = [];
  var dataForGrid = [];
  let digit = window.decimalDigit
  const spreadsheetcontainer = document.querySelector(".jexcel_content");
  const pageLimit = 25; // Number of records per page
  let currentPage = 1; // Current page
  let startindex = 0;
  let isLoading = false;
  let requestId;

  //const colorArray = ["#96cdf5", "#fbaec1", "#00ff00", "#800000", "#808000", "#008000", "#008080", "#000080", "#FF00FF", "#800080",
  // "#CD5C5C", "#FF5733", "#1ABC9C", "#F8C471", "#196F3D", "#707B7C", "#9A7D0A", "#B03A2E", "#F8C471", "#7E5109"];
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
    GetAllLookupData();
  }, []);

  const GetAllLookupData= async function(){
    let authHeader = await CommonFunctions.getAuthHeader();
    await fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/GetAllLookupData", {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
    .then((data) => {
      setAllLookpdata(data);
      setStations(data.listStations);
      SetFlagcodelist(data.listFlagCodes);
      setStationGroups(data.listStationGroups);

      let groupNamearray = data.listStationGroups;
      let groupnames = groupNamearray.filter((ele, ind) => ind === groupNamearray.findIndex(elem => elem.groupID === ele.groupID))
      setGroups(groupnames);
      setTimeout(function () {
        // $('#stationid').SumoSelect({
        //   triggerChangeCombined: true, placeholder: 'Select Station', floatWidth: 200, selectAll: true,
        //   search: true
        // });
        $('#pollutentid').SumoSelect({
          triggerChangeCombined: true, placeholder: 'Select Parameter', floatWidth: 200, selectAll: true,
          search: true
        });
      }, 100);
      //setcriteria(data.listPollutentsConfig);
    })
    .catch((error) => console.log(error));
  }

  useEffect(() => {
    // if (!jspreadRef.current) {
    if (jsptable) {
      jsptable.refresh();
    }
    initializeJsGrid();
    initializeTooltip();
    // }
  }, [ListReportData, LoadjsGridData]);


  const initializeTooltip = function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    return () => {
      tooltipList.map(t => t.dispose())
    }
  }

  const selectionActive = function (a, startcolindex, stratrowindex, endcolindex, endrowidex) { //a-enire value,b-1stcolumn index, c-start row index, d-last column index
    var data = jsptable.getData(true);
    var data1 = jsptable.getSelectedRows(true);
    setselectedgrid([startcolindex, stratrowindex, endcolindex, endrowidex])
    setdataForGridcopy(dataForGridref.current)
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

    let finalarr = [];
    for (let j = data1[0]; j <= data1[(data1.length - 1)]; j++) {
      finalarr.push(dataForGridref.current[j]);
    }
    let key = Object.keys(finalarr[0]);
    let chart = chartRef.current;
    let chartdata = chart != null ? chart.data : [];
    for (let j = 0; j < SelectedPollutents.length; j++) {
      chartdata.datasets[j].pointRadius = chartdata.datasets[j].pointRadius.map(function (x) { x = 2; return x });
    }
    for (let k = startcolindex; k <= endcolindex; k++) {
      for (var i = 0; i < chartdata.datasets[k - 1]?.data.length; i++) {
        // const index = finalarr.findIndex(data => data.Date == chartdata.labels[i]);
        const index = finalarr.findIndex(x => x.Date == chartdata.datasets[k - 1].data[i].x);
        if (index > -1) {
          chartdata.datasets[k - 1].pointRadius[i] = 10;
        } else {
          chartdata.datasets[k - 1].pointRadius[i] = 2;
        }
      }
    }
    chart.update();
  }

  const loadtable = function (instance) {
    let Interval = document.getElementById("criteriaid").value;
    if(Interval==window.Intervalval){
    for (let i = 0; i < SelectedPollutents.length; i++) {
      let Parameterssplit = SelectedPollutents[i].split("@_");
      let filnallist = [];
      if (Parameterssplit.length > 1) {
        filnallist = ReportDataListRef.current.filter(x => x.parameterName.toLowerCase() === Parameterssplit[0].toLowerCase() && x.stationID == Parameterssplit[1]);
      } else {
        filnallist = ReportDataListRef.current.filter(x => x.parameterName.toLowerCase() === Parameterssplit[0].toLowerCase());
      }
      for (let j = 0; j < filnallist.length; j++) {
        let index = dataForGridref.current.findIndex(y => y.Date === filnallist[j].interval);
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
  }


  const generateDatabaseDateTime = function (date) {
    return date.replace("T", " ").substring(0, 19);
  }
  const generateDatabaseDateTime16 = function (date) {
    return date.replace("T", " ").substring(0, 16);
  }
  /* reported data start */
  const initializeJsGrid = function () {
    setallLegendsChecked(true);
    dataForGrid = [];
    // var layout = [];
    // layout.push({ name: "Date", title: "Date", type: "text", readOnly: true });
    // for (var i = 0; i < SelectedPollutents.length; i++) {
    //   layout.push({ name: SelectedPollutents[i], title: SelectedPollutents[i] + " - ppb", type: "numaric" });
    // }
    let Groupid = document.getElementById("groupid").value;
    var layout = [];
    let headers = [];
    if (Groupid != "") {
      headers = Nestedheaders;
    }
    var gridheadertitle;
    layout.push({ name: "Date", title: "Date", type: "text", width: "140px", sorting: true,readOnly: true });
    for (var i = 0; i < SelectedPollutents.length; i++) {
      let Parameterssplit = SelectedPollutents[i].split("@_");
      let filter = [];
      if(Parameterssplit.length>1){
        filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == Parameterssplit[1]);
      }else{
        filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == selectedStations);
      }
      let unitname = AllLookpdata.listReportedUnits.filter(x => x.id == filter[0].unitID);
      gridheadertitle = Parameterssplit[0] + "\n" + unitname[0].unitName
      layout.push({
        name: SelectedPollutents[i], title: gridheadertitle, type: "text", width: "100px",readOnly: true, sorting: false, cellRenderer: function (item, value) {
          let flag = AllLookpdata.listFlagCodes.filter(x => x.id == value[Object.keys(value).find(key => value[key] === item) + "flag"]);
          let bgcolor = flag.length > 0 ? flag[0].colorCode : "#FFFFFF";
          return $("<td>").css("background-color", bgcolor).append(item);
        }
      });
    }
    if (SelectedPollutents.length < 10) {
      for (var p = SelectedPollutents.length; p < 10; p++) {
        layout.push({ name: " " + p, title: " ", type: "text", width: "100px", sorting: false, readOnly: true, });
      }
    }
    //  layout.push({ type: "control", width: 100, editButton: false, deleteButton: false });
    dataForGrid = GridData(ListReportData, Groupid);
    dataForGridref.current = dataForGrid;

    jsptable = jspreadsheet(jspreadRef.current, {
      data: dataForGrid,
      rowResize: true,
      tableWidth: '100%',
      tableOverflow: true,
      freezeColumns: 1,
      columnSorting: false,
      columns: layout,
      nestedHeaders: headers,
      onselection: selectionActive,
      onload: loadtable,
    });
    if (jspreadRef.current != null) {
      getchartdata(ListReportData, SelectedPollutents, "line", "Raw");
      //Visiblerecords();
    }
  }

  const Visiblerecords = function (param) {
    const sheetcontainer = document.querySelector(".jexcel_content");
    const rowHeight = window.spreadsheetrowHeight; // Height of a single row in pixels 
    let records = 1;
    if (param != "") {
      records = 2;
    }
    const visibleRowCount = Math.ceil(sheetcontainer.clientHeight / rowHeight) - records;
    const scrollPosition = sheetcontainer.scrollTop;
    const firstVisibleRow = Math.floor(scrollPosition / rowHeight);
   // console.log(visibleRowCount, firstVisibleRow);
    const visibleRecords = dataForGridref.current.slice(firstVisibleRow, firstVisibleRow + visibleRowCount); // Perform operations with the visibleRecords data, such as updating the display // or executing any other desired actions
    return visibleRecords;
    /* const targetRowIndex = 15; // Index of the target row
    const scrollOffset = targetRowIndex * rowHeight;
    sheetcontainer.scrollTop = scrollOffset; */

    //const rowElement = document.querySelector(`.jexcel_content tr:nth-child(${rowIndex + 1})`);
    //rowElement.scrollIntoView();
  }

  const ScrolltoDrop = function (index) {
    const sheetcontainer = document.querySelector(".jexcel_content");
    const rowHeight = window.spreadsheetrowHeight; // Height of a single row in pixels 
    const targetRowIndex = index; // Index of the target row
    const scrollOffset = targetRowIndex * rowHeight;
    sheetcontainer.scrollTop = scrollOffset;
  }

  const Getmaxvalue = function (visibleRecords, Key) {
    let max;
    let excludedKey = 'Date';
    if(visibleRecords.length>0){
    if (Key != "") {
      // max = visibleRecords.reduce((a, b) => a[excludedKey] > b[excludedKey] ? a[excludedKey] : b[excludedKey])[excludedKey];
      max = visibleRecords.reduce((max, current) => {
        if (current[excludedKey] > max[excludedKey]) {
          return current;
        } else {
          return max;
        }
      })[excludedKey];
      return generateDatabaseDateTime16(max);
    } else {

      let maxValue = -Infinity;
      for (let i = 0; i < visibleRecords.length; i++) {
        const object = visibleRecords[i];
        for (const key in object) {
          if (key !== excludedKey) {
            const value = object[key];
            //  if (typeof value === 'number') {
            maxValue = Math.max(maxValue, value);
            //}
          }
        }
      }
      return maxValue;

    }
  }
    //return max;

  }
  const Getminvalue = function (visibleRecords, Key) {
    let min;
    let min1 = 0;
    let excludedKey = 'Date';
    if(visibleRecords.length>0){
    if (Key != "") {
      min = visibleRecords.reduce((min, current) => {
        if (current[excludedKey] < min[excludedKey]) {
          return current;
        } else {
          return min;
        }
      })[excludedKey];
      return generateDatabaseDateTime16(min);
    } else {
      let minValue = Infinity;

      for (let i = 0; i < visibleRecords.length; i++) {
        const object = visibleRecords[i];

        for (const key in object) {
          if (key !== excludedKey) {
            const value = object[key];
            // if (typeof value === 'number') {
            minValue = Math.min(minValue, value);
            // }
          }
        }
      }
      return minValue;
    }
  }
    // return min;

  }

  const GridData = function (ReportData, Groupid) {
    for (var k = 0; k < ReportData.length; k++) {
      var obj = {};
      dataForGrid = dataForGridref.current;
      var temp = dataForGrid.findIndex(x => x.Date === ReportData[k].interval);
      let roundedNumber = 0;
      if (window.TruncateorRound == "RoundOff") {

        let num = ReportData[k].parametervalue;
        roundedNumber = num == null ? num : num.toFixed(digit);
      }
      else {
        roundedNumber = ReportData[k].parametervalue == null ? ReportData[k].parametervalue : CommonFunctions.truncateNumber(ReportData[k].parametervalue, digit);
      }
      if (Groupid != "") {
        if (temp >= 0) {
          dataForGrid[temp][ReportData[k].parameterName + "@_" + ReportData[k].stationID] = roundedNumber;
        } else {
          obj["Date"] = ReportData[k].interval;
          obj[ReportData[k].parameterName + "@_" + ReportData[k].stationID] = roundedNumber;
          dataForGrid.push(obj);
        }
      } else {
        if (temp >= 0) {
          dataForGrid[temp][ReportData[k].parameterName] = roundedNumber;
        } else {
          obj["Date"] = ReportData[k].interval;
          obj[ReportData[k].parameterName] = roundedNumber;
          dataForGrid.push(obj);
        }
      }
    }
    return dataForGrid;
  }

  /* Scroll with pageing start */

  // Function to append new data to the jSpreadsheet-CE instance
  const appendDataToSpreadsheet = function (data, GroupId) {
    const spreadsheet = jspreadRef.current.jexcel;
    const currentData = spreadsheet.getData();
    let finaldata = GridData(data, GroupId);
    let newData = ReportDataListRef.current.concat(data);
    setReportDataList(newData);
    ReportDataListRef.current = newData;
    getchartdata(newData, SelectedPollutents, "line", "Raw");
    if(finaldata.length>0){
    spreadsheet.setData(finaldata);
  }
    /* let jspcontainer = jspreadRef.current.jexcel;;
    let scrollTop = jspcontainer.scrollTop;

    // Update the data in your spreadsheet

    // Adjust the scroll position to maintain the current view
    jspcontainer.scrollTop = scrollTop; */
    isLoading = false;
  }

  // Function to check if scroll reaches the bottom of the container
  const isScrollAtBottom = function () {
    const scrollTop = spreadsheetcontainer.scrollTop;
    const scrollHeight = spreadsheetcontainer.scrollHeight;
    const containerHeight = spreadsheetcontainer.clientHeight;
    const scrollThreshold = 100; // Adjust the threshold if needed
    //return scrollTop + containerHeight  >= scrollHeight;
    return scrollTop + containerHeight >= (scrollHeight - scrollThreshold);
  }

  const handleScroll = function () {
    if (!chartelementRef.current) {
      getchartdata(ReportDataListRef.current, SelectedPollutents, "line", "Raw");
    }
    if (startindex >= DataCount) {
      return false;
    }
    if (!isLoading && isScrollAtBottom() && !isScrollAtTop()) {
      isLoading = true;
      currentPage++; // Increment the current page
      //fetchDataonscroll(currentPage, pageLimit)
      GetProcessingData(currentPage, false);
    }
  }

  const scrollHandler = function () {
    cancelAnimationFrame(requestId);
    requestId = requestAnimationFrame(handleScroll);
  }

  const isScrollAtTop = function () {
    const scrollTop = spreadsheetcontainer.scrollTop;

    return scrollTop === 0;
  }

  useEffect(() => {
    // const jspreadsheetContainer = document.getElementById('my-jspreadsheet');
    if (ListReportData.length > 0 && spreadsheetcontainer) {
      spreadsheetcontainer.addEventListener('scroll', scrollHandler);

      return () => {
        // Clean up the scroll event listener when the component is unmounted
        spreadsheetcontainer.removeEventListener('scroll', scrollHandler);
      };
    }
  }, [ListReportData, spreadsheetcontainer]);

  // Fetch initial data for the first page
  /*Scroll with pageing end  */

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

  const GetProcessingData = async function (currentPage, isInitialized) {
    let Station = "";
    let Pollutent = "";
    let GroupId = $("#groupid").val();
    Station = $("#stationid").val();
    Pollutent = $("#pollutentid").val();
    if (Pollutent.length > 0) {
      Pollutent.join(',')
    }
    if (GroupId == "") {
      setSelectedPollutents(Pollutent);
    } else {
      Pollutent = SelectedPollutents;
    }
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    let Interval = document.getElementById("criteriaid").value;
    let valid = ReportValidations(Station, Pollutent, Fromdate, Todate, Interval, GroupId);
    if (!valid) {
      return false;
    }
    document.getElementById('loader').style.display = "block";
    let type = Interval.split('-');
    let Intervaltype;
    let isRollingAvg=false;
    let isAvgData = false;
    if(Interval != "Rolling"){
    if (type[1] == 'H') {
      Intervaltype = type[0] * 60;
    } else {
      Intervaltype = type[0];
    }
    }else{
      isRollingAvg=true;
      Intervaltype =60;
    }
    if (Interval == window.Intervalval) {
      isAvgData = false;
    }
    else {
      isAvgData = true;
    }
    startindex = (currentPage - 1) * pageLimit;
    let params = new URLSearchParams({ Group: GroupId, Station: Station, Pollutent: Pollutent, Fromdate: Fromdate, Todate: Todate, Interval: Intervaltype, isAvgData: isAvgData,isRollingAvg:isRollingAvg, StartIndex: startindex, PageLimit: pageLimit });
    // currentPage++;
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality?"
    if (GroupId != "") {
      url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/StationGroupingData?"
    }
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(url + params, {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          let data1 = data.map((x) => { x.interval = x.interval.replace('T', ' '); return x; });
          if (isInitialized) {
            setListReportData(data1);
            setReportDataList(data1);
            setDataCount(data1.length > 0 ? data1[0].count : 0)
            setLoadjsGridData(true);
            //getchartdata(data1, Pollutent, "line", "Raw");
          }
          else {
            appendDataToSpreadsheet(data1, GroupId);
          }
        }

        document.getElementById('loader').style.display = "none";

      }).catch((error) => console.log(error));

  }

  const getdatareport = function (event) {
    event.currentTarget.disabled=true;
    currentPage = 1;
    setListReportData([]);
    setReportDataList([]);
    setLoadjsGridData(false);
    GetProcessingData(currentPage, true);
    setTimeout(function(){
      let id=document.getElementById("getdata");
      if(id !=null){
      id.disabled=false;
        }
       }, 500);
  }

  const DownloadExcel = async function (filetype) {
    
    document.getElementById('loader').style.display = "block";

    let Station = "";
    let Pollutent = "";
    let GroupId = $("#groupid").val();
    Station = $("#stationid").val();
    Pollutent = $("#pollutentid").val();
    if (Pollutent.length > 0) {
      Pollutent.join(',')
    }
    if (GroupId == "") {
      setSelectedPollutents(Pollutent);
    } else {
      Pollutent = SelectedPollutents;
    }


    setSelectedPollutents(Pollutent);
    if (Pollutent.length > 0) {
      Pollutent.join(',')
    }
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    let Interval = document.getElementById("criteriaid").value;

    let valid = ReportValidations(Station, Pollutent, Fromdate, Todate, Interval, GroupId);
    if (!valid) {
      return false;
    }
    document.getElementById('loader').style.display = "block";
    let Intervaltype;
    let isAvgData = false;
    let isRollingAvg=false;
    let Intervaltypesplit = Interval.split('-');
    if(Interval !="Rolling"){
    if (Intervaltypesplit[1] == 'H') {
      Intervaltype = Intervaltypesplit[0] * 60;
    } else {
      Intervaltype = Intervaltypesplit[0];
    }
  }else{
    isRollingAvg=true;
    Intervaltype =60;
  }
    if (Interval == window.Intervalval) {
      isAvgData = false;
    }
    else {
      isAvgData = true;
    }
    let paramUnitnames;

    for (var i = 0; i < SelectedPollutents.length; i++) {
      let filter;
      let unitname;
      if (GroupId != "") {
        let Parameterssplit = SelectedPollutents[i].split("@_");
        let stationName = AllLookpdata.listStations.filter(x => x.id == Parameterssplit[1]);
        filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == Parameterssplit[1]);
        unitname = AllLookpdata.listReportedUnits.filter(x => x.id == filter[0].unitID);
        if (paramUnitnames == undefined) {
          paramUnitnames = stationName[0].stationName + "-" + filter[0].parameterName + "-" + unitname[0].unitName + ",";
        }
        else {
          paramUnitnames += stationName[0].stationName + "-" + filter[0].parameterName + "-" + unitname[0].unitName + ",";
        }
      }
      else {
        filter = AllLookpdata.listPollutents.filter(x => x.parameterName == SelectedPollutents[i] && x.stationID == selectedStations);
        unitname = AllLookpdata.listReportedUnits.filter(x => x.id == filter[0].unitID);
        if (paramUnitnames == undefined) {
          paramUnitnames = filter[0].parameterName + "-" + unitname[0].unitName + ",";
        }
        else {
          paramUnitnames += filter[0].parameterName + "-" + unitname[0].unitName + ",";
        }
      }
    }
    let validRecord = "";
    if (document.getElementById("ValidCheck").checked == true) {
      validRecord = "Valid";
    }
    else if (document.getElementById("invalidCheck").checked == true) {
      validRecord = "Invalid";
    }

    let params = new URLSearchParams({ Group: GroupId, Station: Station, Pollutent: Pollutent, Fromdate: Fromdate, Todate: Todate, Interval: Intervaltype, isAvgData: isAvgData,isRollingAvg:isRollingAvg, Units: paramUnitnames, digit: window.decimalDigit, TruncateorRound: window.TruncateorRound, validRecord: validRecord,fileType:filetype });
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/ExportToExcel?"
    if (GroupId != "") {
      url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/StationGroupingDataExportExcel?"
    }
  //  window.open(url + params, "_blank");
  let authHeader = await CommonFunctions.getAuthHeader();
   
    await fetch(url + params, {
      method: 'GET',
      headers:authHeader
    })
      .then(response => response.blob())
      .then(blob => {
        // Create a link element and trigger a click on it to download the file
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        if(filetype=='excel'){
       link.download = Date.now()+".xlsx";
        }else{
          link.download = Date.now()+".csv";
        }
        link.click();
      })
      .catch(error => console.error('Error:', error));
    document.getElementById('loader').style.display = "none";
    /*  fetch(url + params, {
       method: 'GET',
     }).then((response) => response.json())
       .then((data) => {
       }).catch((error) => console.log(error)); */
  }

  const ReportValidations = function (Station, Pollutent, Fromdate, Todate, Interval, GroupId) {
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
    } else if (Fromdate == "") {
      toast.error('Please select from date', {
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
    } else if (Todate == "") {
      toast.error('Please select to date', {
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
  const ChangeGroupName = function (e) {
    let stationParamaters = [];
    setisRolling(false);
    let selectedGroup = document.getElementById("groupid").value;
    let headers = [];
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
    setGroupSelected(selectedGroup);
    // setPollutents([]);
    setcriteria([]);
    // setStations([]);

    let filter2 = [];
    let filter1 = [];
    let stationID = [];
    if (selectedGroup !== "all") {
      stationID = StationGroups.filter(x => x.groupID == selectedGroup).map(a => a.stationID);
      var finalstationID = stationID.filter(function (item, pos) {
        return stationID.indexOf(item) == pos;
      });
      filter1 = StationGroups.filter(x => x.groupID == selectedGroup && finalstationID.includes(x.stationID)).map(a => a.parameterID);
      for (let i = 0; i < finalstationID.length; i++) {
        let parameters = StationGroups.filter(x => x.stationID == finalstationID[i] && x.groupID == selectedGroup).map(a => a.parameterID);
        let station = Stations.filter(x => x.id == finalstationID[i]);
        let obj = { title: station.length > 0 ? station[0].stationName : "", colspan: parameters.length };
        headers.push(obj);
        for (let j = 0; j < parameters.length; j++) {
          let value1 = AllLookpdata.listPollutents.filter(x => x.stationID == finalstationID[i] && x.id == parameters[j]);
          let value = value1.length > 0 ? value1[0].parameterName : "";
          filter2.push(value + "@_" + finalstationID[i]);
        }
      }
    }
    else {
      stationID = Stations.map(a => a.id);
      var finalstationID = stationID.filter(function (item, pos) {
        return stationID.indexOf(item) == pos;
      });
      for (let i = 0; i < finalstationID.length; i++) {
        let parameters = AllLookpdata.listPollutents.filter(x => x.stationID == finalstationID[i]).map(a => a.id);
        let station = Stations.filter(x => x.id == finalstationID[i]);
        let obj = { title: station.length > 0 ? station[0].stationName : "", colspan: parameters.length };
        headers.push(obj);
        for (let j = 0; j < parameters.length; j++) {
          let value1 = AllLookpdata.listPollutents.filter(x => x.stationID == finalstationID[i] && x.id == parameters[j]);
          let value = value1.length > 0 ? value1[0].parameterName : "";
          filter2.push(value + "@_" + finalstationID[i]);
        }
      }
    }


    // let stationID = StationGroups.filter(x => x.groupID == selectedGroup).map(a => a.stationID);
    // var finalstationID = stationID.filter(function (item, pos) {
    //   return stationID.indexOf(item) == pos;
    // });
    // let filter1 = StationGroups.filter(x => x.groupID == selectedGroup && finalstationID.includes(x.stationID)).map(a => a.parameterID);
    // let filter2 = [];
    // for (let i = 0; i < finalstationID.length; i++) {
    //   let parameters = StationGroups.filter(x => x.stationID == finalstationID[i] && x.groupID == selectedGroup).map(a => a.parameterID);
    //   let station = Stations.filter(x => x.id == finalstationID[i]);
    //   let obj = { title: station.length > 0 ? station[0].stationName : "", colspan: parameters.length };
    //   headers.push(obj);
    //   for (let j = 0; j < parameters.length; j++) {
    //     let value1 = AllLookpdata.listPollutents.filter(x => x.stationID == finalstationID[i] && x.id == parameters[j]);
    //     let value = value1.length > 0 ? value1[0].parameterName : "";
    //     filter2.push(value + "@_" + finalstationID[i]);
    //   }
    // }
    if (filter2.length < 10) {
      let obj = { title: "", colspan: 10 - filter2.length };
      headers.push(obj);
    }
    //  console.log(filter2);
    setSelectedPollutents(filter2);
    setNestedheaders(headers);
    // let filter2 = AllLookpdata.listPollutents.filter(obj => stationID.includes(obj.stationID) && filter1.includes(obj.parameterID)).map(a => a.parameterName);
    // setSelectedPollutents(filter2);
    // let finaldata = AllLookpdata.listPollutentsConfig.filter(obj => obj.stationID == stationID && obj.parameterName == e.target.value);
    let finaldata = AllLookpdata.listPollutents.filter(obj => stationID.includes(obj.stationID) || filter1.includes(obj.id));
    if (finaldata.length > 0) {
      let finalinterval = [];
      for (let j = 0; j < finaldata.length; j++) {
        let intervalarr = finaldata[j].serverAvgInterval == null ? [] : finaldata[j].serverAvgInterval.split(',');
        for (let i = 0; i < intervalarr.length; i++) {
          if (intervalarr[i] != null) {
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
  }
  const ChangeStation = function (e) {
    setisRolling(false);
    setPollutents([]);
    setcriteria([]);
    document.getElementById("groupid").value = "";
    if (e.target.value != "") {
      $('#groupid').addClass("disable");
    } else {
      $('#groupid').removeClass("disable");
    }
    let finaldata = AllLookpdata.listPollutents.filter(obj => obj.stationID == e.target.value);
    setselectedStations(e.target.value);
    setPollutents(finaldata);
    setTimeout(function () {
      $('.pollutentid')[0].sumo.reload();
      $('.pollutentid')[0].sumo.unSelectAll(); 
    }, 10);
  }
 /*  $('#stationid').change(function (event) {
    setPollutents([]);
    setcriteria([]);
    let filter = $(this).val();
    setselectedStations(filter);
    let finaldata = AllLookpdata.listPollutents.filter(function (item) {
      for (var i = 0; i < filter.length; i++) {
        if (item['stationID'] == filter[i])
          return true;
      }
    });
    var finaldata1 = [];
    if (filter.length >= 2) {
      finaldata1 = finaldata.reduce((unique, o) => {
        if (!unique.some(obj => obj.stationID != o.stationID && obj.pollutentName === o.pollutentName)) {
          unique.push(o);
        }
        return unique;
      }, []);
    } else {
      finaldata1 = finaldata;
    }
    setPollutents(finaldata1);
    setTimeout(function () {
      // $('.pollutentid')[0].sumo.unSelectAll(); 
      $('.pollutentid')[0].sumo.reload();
    }, 10);
  }) */
  const Changepollutent = function (e) {
    setcriteria([]);
    //console.log(selectedStations);
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
  $('#pollutentid').change(function (e) {
    setcriteria([]);
    let stationID = $("#stationid").val();
    let filter1 = $(this).val();
    let Pollutent = $("#pollutentid").val();
    // let finaldata = AllLookpdata.listPollutentsConfig.filter(obj => obj.stationID == stationID && obj.parameterName == e.target.value);
    //let finaldata = AllLookpdata.listPollutentsConfig.filter(obj => stationID.includes(obj.stationID) || filter1.includes(obj.parameterName));
    if(Pollutent.length>0){
    let finaldata = AllLookpdata.listPollutents.filter(obj => stationID.includes(obj.stationID) || filter1.includes(obj.parameterName));
    if (finaldata.length > 0) {

      let finalinterval = [];

      for (let j = 0; j < finaldata.length; j++) {

        let intervalarr = finaldata[j].serverAvgInterval == null ? [] : finaldata[j].serverAvgInterval.split(',');

        for (let i = 0; i < intervalarr.length; i++) {

          let intervalsplitarr = intervalarr[i].split('-');

          let index = finalinterval.findIndex(x => x.value === intervalsplitarr[0] && x.type === intervalsplitarr[1]);

          if (index == -1) {

            finalinterval.push({ value: intervalsplitarr[0], type: intervalsplitarr[1] })

          }

        }

      }
      setcriteria(finalinterval);
    }
    var res = Pollutent.filter( function(n) { 
      return !this.has(n.toLowerCase()) 
    }, new Set(window.RollingParameters.map(v => v.toLowerCase())) );
    if(res.length==0){
      setisRolling(true);
    }else{
      setisRolling(false);
    }
  }
  })
  const Resetfilters = function () {
    $('.pollutentid')[0].sumo.reload();
    $('.pollutentid')[0].sumo.unSelectAll();
    // $('.stationid')[0].sumo.reload();
    // $('.stationid')[0].sumo.unSelectAll();
    setcriteria([]);
    setToDate(new Date());
    setFromDate(new Date());
    setListReportData([]);
    setSelectedPollutents([]);
    setLoadjsGridData(false);
  }
  /* Drag and drop start */

  const FormatedDate = function (timestamp) {
    const date = new Date(timestamp);

    // Extract the date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Extract the time components
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Format the date and time
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDateTime;
  }

  const findClosestTimeIndex = function (targetTime) {
    // Convert the target time to a Date object
    const targetDate = new Date(targetTime);

    // Find the index of the object with the closest time
    let closestIndex = -1;
    let closestDiff = Infinity;

    for (let i = 0; i < dataForGridref.current.length; i++) {
      const time = dataForGridref.current[i].Date;
      const currentDate = new Date(time);
      const diff = Math.abs(targetDate - currentDate);

      if (diff < closestDiff) {
        closestIndex = i;
        closestDiff = diff;
      }
    }

    return closestIndex;
  }


  const drag = function (moveX, moveY) {
    chartelementRef.current.x += moveX;
    //chartelementRef.current.y += moveY;
    chartelementRef.current.x2 += moveX;
    //chartelementRef.current.y2 += moveY;
    chartelementRef.current.centerX += moveX;
    // chartelementRef.current.centerY += moveY;
    if (chartelementRef.current.elements && chartelementRef.current.elements.length) {
      for (const subEl of chartelementRef.current.elements) {
        subEl.x += moveX;
        //subEl.y += moveY;
        subEl.x2 += moveX;
        //subEl.y2 += moveY;
        subEl.centerX += moveX;
        // subEl.centerY += moveY;
        subEl.bX += moveX;
        //  subEl.bY += moveY;
        //const value = xAxis.getValueForPixel(subEl.x);
       // console.log(subEl.x, subEl.x2)
      }
    }
  };

  const handleElementDragging = function (event) {
    let visibleRecords = Visiblerecords();
    if (!chartlastEventRef.current || !chartelementRef.current) {
      return;
    }
    const moveX = event.x - chartlastEventRef.current.x;
    const moveY = event.y - chartlastEventRef.current.y;
    drag(moveX, moveY);
    ChartOptions.plugins.annotation.annotations[0].xMin = Getminvalue(visibleRecords, "Date");
    ChartOptions.plugins.annotation.annotations[0].xMax = Getmaxvalue(visibleRecords, "Date");
    ChartOptions.plugins.annotation.annotations[0].yMin = Getminvalue(visibleRecords, "");
    ChartOptions.plugins.annotation.annotations[0].yMax = Getmaxvalue(visibleRecords, "");
    setChartOptions(ChartOptions);
    chartlastEventRef.current = event;
    return true;
  };

  const handleDrag = function (event) {
    if (chartelementRef.current) {
      switch (event.type) {
        case 'mousemove':
          return handleElementDragging(event);
        case 'mouseout':
        case 'mouseup':
          chartlastEventRef.current = undefined;
          break;
        case 'mousedown':
          chartlastEventRef.current = event;
          break;
        default:
      }
    }
  };

  const dragger = {
    id: 'dragger',
    beforeEvent(chart, args, options) {
      if (handleDrag(args.event)) {
        args.changed = true;
        const xAxis = chart.scales['x'];
        let xmin = chartelementRef.current.x;
        let xmax = chartelementRef.current.x2;
        // Retrieve the corresponding x-axis scale value based on the pixel position
        const xminvalue = xAxis.getValueForPixel(xmin);
        const xmaxvalue = xAxis.getValueForPixel(xmax);
        let index = findClosestTimeIndex(FormatedDate(xminvalue));
        ScrolltoDrop(index);
        // console.log(findClosestTimeIndex(FormatedDate(xminvalue)),findClosestTimeIndex(FormatedDate(xmaxvalue)));
        return;
      }
    },
    beforeInit(chart, legend, options){
      //console.log('hello',chart.legend.fit);
      const fitValue = chart.legend.fit;
      chart.legend.fit = function fit(){
        fitValue.bind(chart.legend)();
        return this.height += 30;
      }
    },
    // afterUpdate: function(chart) {
    //     const legend = chart.legend;
    //     const itemCount = legend.legendItems.length;
    //     alert(itemCount);
    //     // if (itemCount > 20) {
    //     //   legend.options.maxHeight = 150; // Set max height for the legend container
    //     //   legend.options.overflow = 'auto'; // Add scrollbar when overflow occurs
    //     // }
    //   }
  };
  /* Drag and drop end */

  /* Chart Start */
  const getchartdata = function (data, pollutent, charttype, criteria) {
    /* if (chartRef.current != null) {
      chartRef.current.data = {};
    } */

    /*  setChartData({ labels: [], datasets: [] });*/
    setChartOptions({});
    let visibleRecords = Visiblerecords();
    let datasets = [];
    let chartdata = [];
    let tempdata = [];
    let NinetyEightPercentile = [];
    let FiftyPercentile = [];
    let labels = [];
    let NinetyEightPercentileValue = 0;
    let FiftyPercentileValue = 0;
    let MaxVal = 0;
    let pointRadius = [];
    let xAxislabel = [];
    let Scaleslist = {};
    for (let i = 0; i < pollutent.length; i++) {
      chartdata = [];
      pointRadius = [];
      NinetyEightPercentile = [];
      FiftyPercentile = [];
      // let pollutentdata = data[pollutent[i]];
      let Parametersplit = pollutent[i].split("@_")
      let Groupid = document.getElementById("groupid").value;
      let pollutentdata = [];
      let Stationlist = Stations.filter(x => x.id == Parametersplit[1]);
      let Stationname = Stationlist.length > 0 ? Stationlist[0].stationName : "";
      if (Groupid != "") {
        pollutentdata = data.filter(val => val.parameterName.toLowerCase() == Parametersplit[0].toLowerCase() && val.stationID == Parametersplit[1]);
      } else {
        pollutentdata = pollutentdata = data.filter(val => val.parameterName.toLowerCase() == Parametersplit[0].toLowerCase());
      }

      for (let k = 0; k < pollutentdata.length; k++) {
        let index = labels.indexOf(pollutentdata[k].interval);
        if (index == -1) {
          labels.push(pollutentdata[k].interval)
        }
        chartdata.push({ x: pollutentdata[k].interval, y: pollutentdata[k].parametervalue });
        pointRadius.push(2);
      }
      let chartele = chartRef.current?.options?.scales[Parametersplit[1] + "_" + Parametersplit[0]];

      if (charttype == 'line') {
        Scaleslist[Parametersplit[1] + "_" + Parametersplit[0]] = {
          type: 'linear',
          display: chartele?.display == undefined ? true : chartele?.display,
          position: chartele?.position ? chartele.position : i % 2 === 0 ? 'left' : 'right',
          title: {
            display: true,
            text: Stationname != "" ? Stationname + " - " + Parametersplit[0] : Parametersplit[0]
          },
          ticks: {
            font: {
              size: 10, // Adjust the font size for x-axis labels
              family: 'Roboto Light',// Change the font type for x-axis labels
              weight: 'bold',
              color: '#111',
            }
          }
        }
        let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        datasets.push({ label: Stationname != "" ? Stationname + " - " + Parametersplit[0] : Parametersplit[0], yAxisID: Parametersplit[1] + "_" + Parametersplit[0], data: chartdata, borderWidth: 1, borderColor: colorArray[(colorArray.length) - (i + 1)], backgroundColor: colorArray[(colorArray.length) - (i + 1)], pointRadius: pointRadius, spanGaps: false, })
      }
    }

    Scaleslist["x"] = {
      type: 'time',
      ticks: {
        font: {
          size: 11, // Adjust the font size for x-axis labels
          family: 'Roboto bold',// Change the font type for x-axis labels
          weight: 'bold',
          color: '#111'
        }
      }
    };

    setChartOptions({
      responsive: true,
      scales: Scaleslist,
      events: ['mousedown', 'mouseup', 'mousemove', 'mouseout'],
      // maintainAspectRatio: true,
      tension: 0.4,
      elements:{
        point:{
          pointStyle: 'circle',
          pointRadius: 15,
        },
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          fullSize: true,
          labels: {
            color: '#111',
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            padding: 10,
            //boxHeight:20
            font: {
              size: 11,
              family: "Roboto bold",
            }
          },
          onClick: function (event, legendItem) {
            let chart = chartRef.current;
            const datasetIndex = legendItem.datasetIndex;
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.hidden = !meta.hidden;

            const yAxisID = chart.data.datasets[datasetIndex].yAxisID;
            const allHidden = chart.options.scales[yAxisID].display;

            if (allHidden) {
              chart.options.scales[yAxisID].display = false;
            } else {
              chart.options.scales[yAxisID].display = true;
            }
            // Determine the visible y-axes
            const visibleAxes = Object.keys(chart.options.scales).filter((axis) => {
              if (axis != 'x') {
                return chart.options.scales[axis].display;
              }
            });

            // Update the positions of the visible y-axes
            // const numVisibleAxes = visibleAxes.length;
            // const yAxisPositions = ['left', 'right']; // Modify if needed

            visibleAxes.forEach((axis, index) => {
              chart.options.scales[axis].position = index % 2 === 0 ? 'left' : 'right';
            });
            // Update the chart to reflect the visibility changes
            chart.update();
          },
        },
        title: {
          display: true,
        },
        annotation: {
          enter(ctx) {
            chartelementRef.current = ctx.element;
          },
          leave() {
            chartelementRef.current = undefined;
            chartlastEventRef.current = undefined;
          },
          annotations: [
            {
              type: 'box',
              id: 'dragabbleAnnotation',
              mode: 'vertical',
              drawTime: 'afterDraw',
              xScaleID: 'x',
              yScaleID: '1_SO2',
              /* xMin: '2023-06-01 00:00',
               xMax: '2023-06-01 2:15',
                yMin: 0,
               yMax: 2, */
              xMin: Getminvalue(visibleRecords, "Date"),
              xMax: Getmaxvalue(visibleRecords, "Date"),
              yMin: Getminvalue(visibleRecords, ""),
              yMax: Getmaxvalue(visibleRecords, ""),
              borderWidth: 2,
              borderColor: '#2663ac',
              backgroundColor: '#2663ac3b',
              
             
            },
          ],
        },
      },
    });

    // setTimeout(() => {

    setChartData({
      // labels,
      datasets: datasets
    })
    // }, 10);
  }
  /* Chart End */

  const DownloadPng=function() {
    const chartElement = chartRef.current.canvas;
    html2canvas(chartElement, {
      backgroundColor: 'white', // Set null to preserve the original chart background color
    }).then((canvas) => {
      const image = canvas.toDataURL('image/png');

      // Create a download link and trigger click event
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = 'DataBrowsingChart.png';
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
    pdf.save('DataBrowsingChart.pdf');
  });
};

  const toggleAllLegends = function () {
    let chartinstance = chartRef.current;
    if (allLegendsChecked) {
      chartinstance.data.datasets.forEach(function (ds) {
        ds.hidden = true;
      });

      chartinstance.legend.legendItems.forEach((legendItem) => {
        const datasetIndex = legendItem.datasetIndex;
        const meta = chartinstance.getDatasetMeta(datasetIndex);
        meta.hidden = true;

        const yAxisID = chartinstance.data.datasets[datasetIndex].yAxisID;
        chartinstance.options.scales[yAxisID].display = false;
      });
    } else {
      chartinstance.data.datasets.forEach(function (ds) {
        ds.hidden = false;
      });
      chartRef.current.legend.legendItems.forEach((legendItem) => {
        const datasetIndex = legendItem.datasetIndex;
        const meta = chartinstance.getDatasetMeta(datasetIndex);
        meta.hidden = false;

        const yAxisID = chartinstance.data.datasets[datasetIndex].yAxisID;
        chartinstance.options.scales[yAxisID].display = true;
      });
    }
    setallLegendsChecked(!allLegendsChecked);
    chartinstance.update();
  }
  return (
    <main id="main" className="main" >
      {/* Same as */}
      {/* <section className="section grid_section h100 w100">
        <div className="h100 w100"> */}
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
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 col-lg-2 mb-3">
                    <label className="form-label">Group</label>
                    <select className="form-select border-50" id="groupid" onChange={ChangeGroupName}>
                      <option value="" selected>None</option>
                      <option value="all">All Stations</option>
                      {Groups.map((x, y) =>
                        <option value={x.groupID} key={y} >{x.groupName}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-4 col-lg-2 mb-3">
                    <label className="form-label">Station Name</label>
                    <select className="form-select stationid border-50" id="stationid" onChange={ChangeStation}>
                      <option value="" selected> Select Station</option>
                      {Stations.map((x, y) =>
                        <option value={x.id} key={y} >{x.stationName}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-4 col-lg-2 mb-3">
                    <label className="form-label">Parameters</label>
                    <select className="form-select pollutentid" id="pollutentid" multiple="multiple" onChange={Changepollutent}>
                      {/* <option selected> Select Pollutents</option> */}
                      {Pollutents.map((x, y) =>
                        <option value={x.parameterName} key={y} >{x.parameterName}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-4 col-lg-2 mb-3 position-relative">
                    <label className="form-label">From Date</label>
                    <img src="images/calendar-icon.png" className="calender-icon-bg" alt="calenderIcon" />
                    <DatePicker className="form-control border-50" id="fromdateid" selected={fromDate} onChange={(date) => setFromDate(date)} />
                  </div>
                  <div className="col-md-4 col-lg-2 mb-3 position-relative">
                    <label className="form-label">To Date</label>
                    <img src="images/calendar-icon.png" className="calender-icon-bg" alt="calenderIcon" />
                    <DatePicker className="form-control border-50" id="todateid" selected={toDate} onChange={(date) => setToDate(date)} />
                  </div>
                  <div className="col-md-4 col-lg-2 mb-3">
                    <label className="form-label">Interval</label>
                    <select className="form-select border-50" id="criteriaid">
                      <option value="" selected>Select Interval</option>
                      <option value="15-M" selected>15-M</option>
                      {Criteria.map((x, y) =>
                        <option value={x.value + '-' + x.type} key={y} >{x.value + '-' + x.type}</option>
                      )}
                      {isRolling &&(
                       <option value="Rolling">8-H Rolling Averages</option>
                       )}
                    </select>
                  </div>
                  <div className="mt-2">
                    <div class="col-md-12 float-start">
                      <button type="button" className="btn btn-primary filter-btn" id="getdata" onClick={getdatareport}>Get Data</button>
                      <button type="button" className="btn btn-secondary mx-3 reset-btn" onClick={Resetfilters}>Reset</button>
                    </div>
                    {ListReportData != 0 && (
                      <div class="col-md-12 float-end text-end px-0">

                        <div class="form-check form-check-inline">
                          <label className="form-check-label" htmlFor="ValidCheck">
                            Valid Records
                          </label>
                          <input className="form-check-input check-w16" type="checkbox" id="ValidCheck" />
                        </div>
                        <div class="form-check form-check-inline">
                          <label className="form-check-label" htmlFor="invalidCheck">
                            Invalid Records
                          </label>
                          <input className="form-check-input check-w16" type="checkbox" id="invalidCheck" />
                        </div>
                        <button type="button" className="btn btn-primary datashow me-0 download-btn" onClick={() => DownloadExcel('excel')} >Download Excel</button>&nbsp;
                        <button type="button" className="btn btn-primary datashow me-0 download-btn" onClick={() => DownloadExcel('csv')} >Download Csv</button>
                      </div>
                    )}

                  </div>
                  <div className="col-md-4">
                    <div className="row">
                      <div id="loader" className="loader"></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {ListReportData.length > 0 && (
              <div>
                <div className="card">
                  <div className="cad-body p-2">
                    <div className="row">
                      <div className="col-md-12 mb-3 mt-3">
                        {AllLookpdata.listFlagCodes.map((i) =>
                          <button type="button" className="btn btn-primary flag mx-1" style={{ backgroundColor: i.colorCode }} data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" data-bs-title={i.name}>{i.code}</button>
                        )}
                      </div>
                    </div>


                    <div className="jsGrid" ref={jspreadRef} data={ListReportData} />
                  </div>
                </div>
              </div>
            )}

            {ListReportData.length == 0 && LoadjsGridData && (
              <div class="nodatamessage" id="nodatamessage">No data found</div>
            )}
            {ListReportData.length > 0 && ChartData && jspreadRef.current != null && (
              <div className="card p-2" >
                <div className="card-body">
                  <div className="graphCanvas">
                    <Line ref={chartRef} options={ChartOptions} data={ChartData} plugins={[dragger]} height={100} />
                  </div>
                  <div className="text-right mt-4 mb-3 pe-2 col-sm-12">
                    <input className="form-check-input check-w16"
                      type="checkbox"
                      checked={allLegendsChecked}
                      onChange={toggleAllLegends}
                    />
                    <label className="checkboxStylelabel">Select All</label>
                  </div>
                  <div className="text-right col-sm-12">
                    <button type="button" className="btn btn-primary mx-3 download-btn"  onClick={DownloadPng}>Download as Image</button>
                    <button type="button" className="btn btn-primary download-btn"  onClick={DownloadPdf}>Download as Pdf</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
export default HistoricalData;