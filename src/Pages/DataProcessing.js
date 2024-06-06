import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactDOM from 'react-dom/client';
import { toast } from 'react-toastify';
import 'chartjs-adapter-moment';
import DatePicker from "react-datepicker";
import { Chart, Line } from 'react-chartjs-2';
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import 'jsuites/dist/jsuites.css'; // Import jsuites CSS
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from "sweetalert2";
import CommonFunctions from "../utils/CommonFunctions";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
//import { debounce } from 'lodash';

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
  defaults
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

function DataProcessing() {
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
  const [Groups, setGroups] = useState([]);
  const [StationGroups, setStationGroups] = useState([]);
  const [Pollutents, setPollutents] = useState([]);
  //const [selectedgrid, setselectedgrid] = useState([]);
  const [GroupSelected, setGroupSelected] = useState("");
  const [SelectedPollutents, setSelectedPollutents] = useState([]);
  const [Criteria, setcriteria] = useState([]);
  const [dataForGridcopy, setdataForGridcopy] = useState([]);
  const [ChartData, setChartData] = useState({ labels: [], datasets: [] });
  const [ChartOptions, setChartOptions] = useState({});
  const [ListHistory, setListHistory] = useState([]);
  const [Flagcodelist, SetFlagcodelist] = useState([]);
  const [Nestedheaders, setNestedheaders] = useState([]);
  //const [OldData, setOldData] = useState([]);
  //const [NewData, setNewData] = useState([]);
  const [SaveData, setSaveData] = useState([]);
  const [revert, setrevert] = useState(false);
  const [DataCount, setDataCount] = useState(0);
  const [ReportDataList, setReportDataList] = useState([]);
  const [ReportDataListCopy, setReportDataListCopy] = useState([]);
  const [LoadjsGridData, setLoadjsGridData] = useState(false);
  const [allLegendsChecked, setallLegendsChecked] = useState(true);
  const currentUser = JSON.parse(sessionStorage.getItem('UserData'));
  const SelectedPollutentsRef = useRef();
  SelectedPollutentsRef.current = SelectedPollutents;

  const ChartOptionsRef = useRef();
  //ChartOptionsRef.current=ChartOptions;
  const chartelementRef = useRef();
  const chartlastEventRef = useRef();
  const revertRef = useRef();
  revertRef.current = revert;
  const ReportDataListRef = useRef();
  ReportDataListRef.current = ReportDataList;
  const dataForGridref = useRef();
  const selectedgrid=useRef([]);
  const OldData=useRef([]);
  const NewData=useRef([]);
  const olddata = useRef([]);
  //olddata.current = [];
  const newdata = useRef([]);
  //newdata.current = [];
  const dataold= useRef([]);
 // dataold.current=[];
  const datanew= useRef([]);
 // datanew.current=[];
 const batchrows= useRef();
 const batchcolumns= useRef();
  let jsptable = null;
  let cellnames = [];
  let dataForGrid = [];
 // let olddata = [];
  //let dataold=[];
  //let datanew=[];
  //let newdata = [];
  let flagdata = [];
  let digit = window.decimalDigit
  const spreadsheetcontainer = document.querySelector(".jexcel_content");
  const pageLimit = 25; // Number of records per page
  let currentPage = 1; // Current page
  let startindex = 0;
  let isLoading = false;
  let requestId;
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
    LoadData();
    // initializeJsGrid();
  }, []);

  const LoadData = async function(){
    let authHeader = await CommonFunctions.getAuthHeader();
    await fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/GetAllLookupDataProcessing", {
      method: 'GET',
      headers: authHeader,
    })
      .then((response) => response.json())
      .then((data) => {
        setAllLookpdata(data);
        setStations(data.listStations);
        setStationGroups(data.listStationGroups);
        SetFlagcodelist(data.listFlagCodes);
        let groupNamearray = data.listStationGroups;
        let groupnames = groupNamearray.filter((ele, ind) => ind === groupNamearray.findIndex(elem => elem.groupID === ele.groupID))
        setGroups(groupnames);
        setTimeout(function () {
          /*   $('#stationid').SumoSelect({
              triggerChangeCombined: true, placeholder: 'Select Station', floatWidth: 200, selectAll: true,
              search: true
            }); */
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
    //setselectedgrid([startcolindex, stratrowindex, endcolindex, endrowidex])
    selectedgrid.current=[startcolindex, stratrowindex, endcolindex, endrowidex];
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
  const Calculateparameter = function (Calculatedparameter, calparamname, value, y, Parameter) {
    if(Parameter !=window.parameterNOx){
    let Iscalculated = AllLookpdata.listPollutents.filter(x => x.parameterName == Calculatedparameter[0].parameterName && x.isCalculated == 1);
    if (Iscalculated.length > 0) {
      let findcolumn = SelectedPollutents.findIndex(x => x == calparamname);
      let calvaluefilter = AllLookpdata.listConversionfactors.filter(x => x.parameter == Parameter);
      let calvalue = value == null || calvaluefilter[0].conversionFactor == null ? null : value * calvaluefilter[0].conversionFactor;
      
      let calvalue1 = null;
      calvalue1=ValueRoundoff(calvalue);
     /*  if (window.TruncateorRound == "RoundOff") {
        calvalue1 = calvalue == null ? calvalue : calvalue.toFixed(digit);
      }
      else {
        calvalue1 = calvalue == null ? calvalue : CommonFunctions.truncateNumber(calvalue, digit)
      } */
      let ModifyBy = currentUser.id;
     /*  let index = olddata.current.findIndex(x => x.ID == Calculatedparameter[0].id);
      let index1 = newdata.current.findIndex(x => x.ID == Calculatedparameter[0].id);
      if (index == -1) {
        olddata.current.push({ ID: Calculatedparameter[0].id, Parametervalue: Calculatedparameter.length > 0 ? Calculatedparameter[0].parametervalue : null, col: findcolumn + 1, row: y, loggerFlags: Calculatedparameter.length > 0 ? Calculatedparameter[0].loggerFlags : null,StationID:Calculatedparameter[0].stationID,ParameterID:Calculatedparameter[0].parameterID,ParameterIDRef:Calculatedparameter[0].parameterIDRef,CreatedTime:Calculatedparameter[0].createdTime });
      }
      if (index1 == -1) {
        newdata.current.push({ ID: Calculatedparameter[0].id,ParameterName:Calculatedparameter[0].parameterName, Parametervalue: calvalue, ModifyBy: ModifyBy, LoggerFlags: window.Editflag,StationID:Calculatedparameter[0].stationID,ParameterID:Calculatedparameter[0].parameterID,ParameterIDRef:Calculatedparameter[0].parameterIDRef,CreatedTime:Calculatedparameter[0].createdTime });
      } else {
        newdata.current[index1].Parametervalue = calvalue;
      } */
      changedarray(Calculatedparameter,findcolumn + 1,y,calvalue,ModifyBy);
      if (findcolumn != -1) {
        jspreadRef.current.jexcel.updateCell(findcolumn + 1, y, calvalue1, true);
      }
    }
  }
  }

  const CalculateparameterUpdateFlag = function (Calculatedparameter, calparamname, i, param) {
    let Iscalculated = AllLookpdata.listPollutents.filter(x => x.parameterName == Calculatedparameter[0].parameterName && x.isCalculated == 1);
    if (Iscalculated.length > 0) {
      let ModifyBy = currentUser.id;
      let findcolumn = SelectedPollutents.findIndex(x => x == calparamname);
      if (param.id != 1 || Calculatedparameter[0].loggerFlags != 14) {
        if(Calculatedparameter[0].loggerFlags !=param.id){
        Calculatedparameter[0].loggerFlags = param.id;
        flagdata.push({ ID: Calculatedparameter[0].id,ParameterName:Calculatedparameter[0].parameterName, Parametervalue: Calculatedparameter[0].parametervalue, ModifyBy: ModifyBy, LoggerFlags: param.id,StationID:Calculatedparameter[0].stationID,ParameterID:Calculatedparameter[0].parameterID,ParameterIDRef:Calculatedparameter[0].parameterIDRef,CreatedTime:Calculatedparameter[0].createdTime });
        }
      }//cellnames.push(cellName);
      if (findcolumn != -1) {
        let cellName = jspreadsheet.helpers.getColumnNameFromCoords(findcolumn + 1, i);
        if (cellName) {
          jspreadRef.current.jexcel.getCell(cellName).style.backgroundColor = param.colorCode;
          jspreadRef.current.jexcel.getCell(cellName).classList.remove('cellhelight');
        }
      }
    }
  }

  const CalculateparameterNox=function(filtered,value,y,param,restore){
  //  if(restore){
      revertRef.current=true;
  //  }
    let Parametersplit = param.split("@_");
    let ModifyBy = currentUser.id;
    var NOvalue = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterName == window.parameterNO && row.stationID == filtered[0].stationID);
    var NO2value = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterName == window.parameterNO2 && row.stationID == filtered[0].stationID);
    var NOXvalue = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterName == window.parameterNOx && row.stationID == filtered[0].stationID);
    let findcolumn = -1;
    let findcolumn2 =1;
    let filtercalcparameter = AllLookpdata.listPollutents.filter(x => x.parameterName == window.parameterNOx && x.stationID == filtered[0].stationID);
        filtercalcparameter = AllLookpdata.listPollutents.filter(x => x.parameterID == filtercalcparameter[0].parameterID && x.stationID == filtered[0].stationID && x.isCalculated==1);
    if(Parametersplit.length>1){
      findcolumn = SelectedPollutents.findIndex(x => x == window.parameterNOx +"@_"+Parametersplit[1]);
      findcolumn2 = filtercalcparameter.length>0?SelectedPollutents.findIndex(x => x == (filtercalcparameter[0].parameterName+"@_"+filtercalcparameter.stationID)):-1; 
    }else{
      findcolumn = SelectedPollutents.findIndex(x => x == window.parameterNOx);
      findcolumn2 = filtercalcparameter.length>0?SelectedPollutents.findIndex(x => x == filtercalcparameter[0].parameterName):-1;  
    }
    let NOXvalue1=null;
    let NOXcalvalue=null;
    value=value==null?value:parseFloat(value);
    let Calculatedparameter=[];
    let loggerFlags=null;
    let NoConversionfactor=AllLookpdata.listConversionfactors.filter(x => x.parameter == window.parameterNO)[0].conversionFactor;
    let No2Conversionfactor=AllLookpdata.listConversionfactors.filter(x => x.parameter == window.parameterNO2)[0].conversionFactor;
    if(param==window.parameterNO){
        if(NO2value.length==0 && NOXvalue.length>0){
        let NO2value1=NOXvalue[0].parametervalue==null || NOvalue[0].parametervalue ==null ?null:NOXvalue[0].parametervalue-NOvalue[0].parametervalue;
         NOXvalue1=NO2value1==null?null:value+NO2value1;
         if(findcolumn2>0){
         NOXcalvalue=NO2value1==null?null:(value*NoConversionfactor)+(NO2value1*No2Conversionfactor);
         }
        }else{
           NOXvalue1=NO2value[0].parametervalue==null || NO2value[0].parametervalue==null?null:value+NO2value[0].parametervalue;
           if(findcolumn2>0){
           NOXcalvalue=NOXvalue1==null?null:(value*NoConversionfactor)+(NO2value[0].parametervalue*No2Conversionfactor);
           }
        }
      }else if(param==window.parameterNO2){
        if(NOvalue.length==0 && NOXvalue.length>0){
          let NOvalue1=NOXvalue[0].parametervalue==null || NO2value[0].parametervalue ==null ?null:NOXvalue[0].parametervalue-NO2value[0].parametervalue;
           NOXvalue1=NOvalue1==null?null:value+NOvalue1;
           if(findcolumn2>0){
           NOXcalvalue=NOXvalue1==null?null:(value*No2Conversionfactor)+(NOvalue1*NoConversionfactor);
           }
          }else{
             NOXvalue1=NOvalue[0].parametervalue==null || NO2value[0].parametervalue==null?null:value+NOvalue[0].parametervalue;
             if(findcolumn2>0){
              NOXcalvalue=NOXvalue1==null?null:(value*No2Conversionfactor)+(NOvalue[0].parametervalue*No2Conversionfactor);
              }
          }
      }
      /* if(NOXvalue.length>0){
        changedarray(NOXvalue,findcolumn+1,y,NOXvalue1,ModifyBy);
      } */
      if(findcolumn2>0){
        Calculatedparameter=ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterID === filtercalcparameter[0].id && row.stationID === filtercalcparameter[0].stationID)
        let calparamname=SelectedPollutents[findcolumn2];
        if(Calculatedparameter.length>0){
      // changedarray(Calculatedparameter,findcolumn2+1,y,NOXcalvalue,ModifyBy);
        let calvalue1=ValueRoundoff(NOXcalvalue);
        if (findcolumn2 != -1) {
          jspreadRef.current.jexcel.updateCell(findcolumn2 + 1, y, calvalue1, true);
        }
          //Calculateparameter(Calculatedparameter, calparamname, value, y, Parametersplit[0]);
        }
      }
      
     let calvalue1=ValueRoundoff(NOXvalue1);

      if (findcolumn != -1) {
        jspreadRef.current.jexcel.updateCell(findcolumn + 1, y, calvalue1, true);
      }
  }
  const ValueRoundoff=function(value){
    let calvalue = null; 
    if (window.TruncateorRound == "RoundOff") {
      calvalue = value == null ? value : value.toFixed(digit);
    }
    else {
      calvalue = value == null ? value : CommonFunctions.truncateNumber(value, digit)
    }
    return calvalue;
  }
  const changed = function (instance, cell, x, y, value) {
    let changearr = dataForGridref.current[y];
    if (!revertRef.current) {
      //cell.classList.add('updated');
      let classname = CommonFunctions.SetFlagColor(window.Editflag, Flagcodelist);
      if (cell != undefined) {
        cell.style.backgroundColor = classname;
        //cell.classList.add(classname);
      }
    }
    let filtered = null;
    let Parametername = SelectedPollutents[x - 1];
    if (!revertRef.current) {
      let Parametersplit = SelectedPollutents[x - 1].split("@_");
      let Calculatedparameter = [];
      if (Parametersplit.length > 1) {
        filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == Parametersplit[0] && row.stationID == Parametersplit[1]);
        Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
        if(Parametersplit == window.parameterNO || Parametersplit == window.parameterNO2){
          CalculateparameterNox(filtered,value,y,Parametersplit);
        }
        if (Calculatedparameter.length > 0) {
          let calparamname = Calculatedparameter[0].parameterName + "@_" + Calculatedparameter[0].stationID;
          Calculateparameter(Calculatedparameter, calparamname, value, y, Parametersplit);
        }
      } else {
        filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[x - 1]);
        Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
        if(Parametersplit == window.parameterNO || Parametersplit == window.parameterNO2){
          CalculateparameterNox(filtered,value,y,Parametersplit[0]);
        }
        if (Calculatedparameter.length > 0) {
          let calparamname = Calculatedparameter[0].parameterName;
          Calculateparameter(Calculatedparameter, calparamname, value, y, Parametersplit[0]);
        }
      }
      let ModifyBy = currentUser.id;
      changedarray(filtered,x,y,value,ModifyBy);
      filtered[0].parametervalue = value == null ? value : parseFloat(value);
      filtered[0].loggerFlags = window.Editflag;
      // changearr[Parametername] = value == null ? value : parseFloat(value);
      dataForGridref.current[y][Parametername] = value == null ? value : parseFloat(value);
      //setOldData(olddata.current);
      //setNewData(newdata.current);
      setSaveData(olddata.current);
      OldData.current=olddata.current;
      NewData.current=newdata.current
    }
    dataForGridref.current[y][Parametername] = value == null ? value : parseFloat(value);
    let chart = chartRef.current;
    let chartdata = chart != null ? chart.data : [];
    chartdata.datasets[x - 1].data[y].y = value;
    chart.update();
    revertRef.current = false;
  }

  const changedarray=function(filtered,x,y,value,ModifyBy){
    let index = olddata.current.findIndex(x => x.ID == filtered[0].id);
      let index1 = newdata.current.findIndex(x => x.ID == filtered[0].id);
      if (index == -1) {
        olddata.current.push({ ID: filtered[0].id, Parametervalue: filtered.length > 0 ? filtered[0].parametervalue : null, col: x, row: y, loggerFlags: filtered.length > 0 ? filtered[0].loggerFlags : null,StationID:filtered[0].stationID,ParameterID:filtered[0].parameterID,ParameterIDRef:filtered[0].parameterIDRef,CreatedTime:filtered[0].createdTime });
      }
      if (index1 == -1) {
        newdata.current.push({ ID: filtered[0].id,ParameterName:filtered[0].parameterName, Parametervalue: value, ModifyBy: ModifyBy, LoggerFlags: window.Editflag,StationID:filtered[0].stationID,ParameterID:filtered[0].parameterID,ParameterIDRef:filtered[0].parameterIDRef,CreatedTime:filtered[0].createdTime });
      } else {
        newdata.current[index1].Parametervalue = value;
      }
  }

  const SaveEditedData = function () {
    Swal.fire({
      title: "Are you sure?",
      text: ("You want to save this !"),
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5cb85c",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    })
      .then(async function (isConfirm) {
        if (isConfirm.isConfirmed) {
          revertRef.current = false;
          let authHeader = await CommonFunctions.getAuthHeader();
          authHeader['Accept'] = 'application/json';
          authHeader['Content-Type'] = 'application/json';
          fetch(CommonFunctions.getWebApiUrl()+ 'api/DataProcessing', {
            method: 'POST',
            headers: authHeader ,
            body: JSON.stringify(NewData.current),
          }).then((response) => response.json())
            .then((responseJson) => {
              if (responseJson == 1) {
                revertRef.current = false;
                olddata.current = [];
                newdata.current = [];
                //setNewData([]);
               // setOldData([]);
               setSaveData([]);
               OldData.current=[];
               NewData.current=[]
              }
            }).catch((error) => toast.error('Unable to update the parameter. Please contact adminstrator'));
        } else {
          for (let i = 0; i < OldData.current.length; i++) {
            revertRef.current = true;
            let value = ValueRoundoff(OldData.current[i].Parametervalue);
           /*  if (window.TruncateorRound == "RoundOff") {
              value = OldData.current[i].Parametervalue == null ? OldData.current[i].Parametervalue : OldData.current[i].Parametervalue.toFixed(digit);
            }
            else {
              value = OldData.current[i].Parametervalue == null ? OldData.current[i].Parametervalue : CommonFunctions.truncateNumber(OldData.current[i].Parametervalue, digit)
            } */
            jspreadRef.current.jexcel.updateCell(OldData.current[i].col, OldData.current[i].row, value, true);
            let cell = jspreadRef.current.jexcel.getCellFromCoords(OldData.current[i].col, OldData.current[i].row);
            let classname = CommonFunctions.SetFlagColor(OldData.current[i].loggerFlags == null ? window.Okflag : OldData.current[i].loggerFlags, Flagcodelist);
            if (cell != undefined) {
              cell.style.backgroundColor = classname;
              //cell.classList.add(classname);
            }

            if (i == (OldData.current.length - 1)) {
              olddata.current = [];
              newdata.current = [];
              //setNewData([]);
              //setOldData([]);
              setSaveData([]);
              OldData.current=[];
              NewData.current=[];
              revertRef.current = false;
            }
          }
        }
      })
  }

  const UpdateFlag = function (param) {
    let index = window.ExcludeFlags.findIndex(x => x === param.id);
    if (index > -1) {
      toast.error('Unable to update this flag because this flag in excluded flags list. Please try with another flag')
      return false;
    }
    Swal.fire({
      title: "Are you sure?",
      text: ("You want to update this flag !"),
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5cb85c",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    })
      .then( async function (isConfirm) {
        if (isConfirm.isConfirmed) {
          flagdata = [];
          let ModifyBy = currentUser.id;
          for (var i = selectedgrid.current[1]; i <= selectedgrid.current[3]; i++) {
            let changearr = dataForGridref.current[i];
            for (var k = selectedgrid.current[0]; k <= selectedgrid.current[2]; k++) {
              var cellName = jspreadsheet.helpers.getColumnNameFromCoords(k, i);
              let filtered = null;
              let Parametersplit = SelectedPollutents[k - 1].split("@_");
              let Calculatedparameter = [];
              if (Parametersplit.length > 1) {
                filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == Parametersplit[0] && row.stationID == Parametersplit[1]);
                Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
                if (Calculatedparameter.length > 0) {
                  let calparamname = Calculatedparameter[0].parameterName + "@_" + Calculatedparameter[0].stationID;
                  CalculateparameterUpdateFlag(Calculatedparameter, calparamname, i, param);
                }
              } else {
                filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[k - 1]);
                Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
                if (Calculatedparameter.length > 0) {
                  let calparamname = Calculatedparameter[0].parameterName;
                  CalculateparameterUpdateFlag(Calculatedparameter, calparamname, i, param);
                }
              }
              if (param.id != 1 || filtered[0].loggerFlags != 14) {
                if(filtered[0].loggerFlags !=param.id){
                filtered[0].loggerFlags=param.id;
               flagdata.push({ ID: filtered[0].id,ParameterName:filtered[0].parameterName, Parametervalue: filtered[0].parametervalue, ModifyBy: ModifyBy, LoggerFlags: param.id,StationID:filtered[0].stationID,ParameterID:filtered[0].parameterID,ParameterIDRef:filtered[0].parameterIDRef,CreatedTime:filtered[0].createdTime });
                }
              }//cellnames.push(cellName);
              
              if (cellName) {
                jspreadRef.current.jexcel.getCell(cellName).style.backgroundColor = param.colorCode;
                jspreadRef.current.jexcel.getCell(cellName).classList.remove('cellhelight');
              }
            }
          }
          if (flagdata.length > 0) {
            let authHeader = await CommonFunctions.getAuthHeader();
                authHeader['Accept'] = 'application/json';
                authHeader['Content-Type'] = 'application/json';
              await  fetch(CommonFunctions.getWebApiUrl()+ 'api/DataProcessingUpdateflag', {
              method: 'POST',
              headers: authHeader ,
              body: JSON.stringify(flagdata),
            }).then((response) => response.json())
              .then((responseJson) => {
                if (responseJson == 1) {

                } else {
                  toast.error('Unable to update the parameter. Please contact adminstrator')
                }
              }).catch((error) => toast.error('Unable to update the parameter. Please contact adminstrator'));
          }
        }
      })

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

  const gethistory = async function () {
    let changearr = dataForGridcopy[selectedgrid.current[1]];
    let Parametersplit = SelectedPollutents[selectedgrid.current[0] - 1].split("@_");
    let filtered = null;
    if (Parametersplit.length > 1) {
      filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == Parametersplit[0] && row.stationID == Parametersplit[1]);
    } else {
      filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[selectedgrid.current[0] - 1]);
    }
    let params = new URLSearchParams({ id: filtered[0].id });
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ 'api/DataProcessing?' + params, {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((historydata) => {
        if (historydata) {
          setListHistory(historydata);
        }
      }).catch((error) => toast.error('Unable to update the parameter. Please contact adminstrator'));
    $('#historymodal').modal('show');
  }

  const revertfromolddata=function(filtered,k,i){
    if (filtered.length > 0) {
      let value = 0;
      let data=OldData.current.filter(x => x.ID == filtered[0].id);
      if (data.length > 0) {
        value = data[0].Parametervalue;
        filtered[0].parametervalue=data[0].Parametervalue;
        filtered[0].loggerFlags=data[0].LoggerFlags;
        value=ValueRoundoff(value);
        /* if (window.TruncateorRound == "RoundOff") {
          value = value == null ? value : value.toFixed(digit);
        }
        else {
          value = value == null ? value : CommonFunctions.truncateNumber(value, digit)
        } */
      jspreadRef.current.jexcel.updateCell(k, i,value , true);
      var cellName = jspreadsheet.helpers.getColumnNameFromCoords(k, i);
      if (cellName) {
        let color=CommonFunctions.SetFlagColor(data[0].loggerFlags == null ? window.Okflag : data[0].loggerFlags, Flagcodelist);
        jspreadRef.current.jexcel.getCell(cellName).style.backgroundColor = color;
        //jspreadRef.current.jexcel.getCell(cellName).classList.remove('cellhelight');
      }

      let index = dataold.current.findIndex(x => x.ID === filtered[0].id);
      if (index > -1) {
        dataold.current.splice(index, 1);
        datanew.current.splice(index, 1);
      }
      //setOldData(dataold.current);
      //setNewData(datanew.current);
      setSaveData(dataold.current);
      OldData.current=dataold.current;
      NewData.current=datanew.current;
    }
    }
  }
  const reverttoprevious = function () {
     dataold.current = OldData.current;
     datanew.current = NewData.current;
    if (OldData.current.length > 0) {
      for (var i = selectedgrid.current[1]; i <= selectedgrid.current[3]; i++) {
        let changearr = dataForGridref.current[i];
        for (var k = selectedgrid.current[0]; k <= selectedgrid.current[2]; k++) {
          let filtered = [];
          let Parametersplit = SelectedPollutents[k - 1].split("@_");
          let Calculatedparameter = [];
          revertRef.current=true;
          if (Parametersplit.length > 1) {
            filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == Parametersplit[0] && row.stationID == Parametersplit[1]);
            Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
            if (Calculatedparameter.length > 0) {
              let calparamname = Calculatedparameter[0].parameterName + "@_" + Calculatedparameter[0].stationID;
              RevertCalculateparameter(Calculatedparameter, calparamname, i);
            }
          } else {
            filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[k - 1]);
            Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
            if (Calculatedparameter.length > 0) {
              let calparamname = Calculatedparameter[0].parameterName;
              RevertCalculateparameter(Calculatedparameter, calparamname, i);
            }
          }
          revertRef.current=true;
          revertfromolddata(filtered,k,i);
          if(Parametersplit == window.parameterNO || Parametersplit == window.parameterNO2){
           // revertRef.current=true;
            CalculateparameterNox(filtered,filtered[0].parametervalueOrginal,i,SelectedPollutents[k - 1],true);
          }  
          }
      }
      if (dataold.current.length == 0) {
        olddata.current = [];
        newdata.current = [];
        OldData.current=[];
        NewData.current=[];
        //setNewData([]);
        //setOldData([]);
        setSaveData([]);
      }
    }
  }

  const RestoreCalculateparameter=function(Calculatedparameter,calparamname,i,ModifyBy){
    //let Iscalculated = AllLookpdata.listPollutents.filter(x => x.parameterName == Calculatedparameter[0].parameterName && x.isCalculated == 1);
    if (Calculatedparameter.length > 0) {
      let findcolumn = SelectedPollutents.findIndex(x => x == calparamname);
      let value=Calculatedparameter[0].parametervalueOrginal;
      value=ValueRoundoff(value);
      /* if (window.TruncateorRound == "RoundOff") {
        value = value == null ? value : value.toFixed(digit);
      }
      else {
        value = value == null ? value : CommonFunctions.truncateNumber(value, digit)
      } */
     // Calculatedparameter[0].parametervalue=value;
     Calculatedparameter[0].parametervalue=value==null?value:parseFloat(value);
      jspreadRef.current.jexcel.updateCell(findcolumn+1, i,value , true);
      if(Calculatedparameter[0].parametervalueOrginal !=Calculatedparameter[0].parametervalue || Calculatedparameter[0].loggerFlags !=Calculatedparameter[0].loggerFlagsOriginal){
        flagdata.push({ ID: Calculatedparameter[0].id, Parametervalue: Calculatedparameter[0].parametervalueOrginal,ParameterName:Calculatedparameter[0].parameterName,  ModifyBy: ModifyBy, LoggerFlags: Calculatedparameter[0].loggerFlagsOriginal,StationID:Calculatedparameter[0].stationID,ParameterID:Calculatedparameter[0].parameterID,ParameterIDRef:Calculatedparameter[0].parameterIDRef,CreatedTime:Calculatedparameter[0].createdTime });
      
        if (findcolumn != -1) {
        let cellName = jspreadsheet.helpers.getColumnNameFromCoords(findcolumn + 1, i);
        if (cellName) {
          Calculatedparameter[0].loggerFlags=Calculatedparameter[0].loggerFlagsOriginal;
          let color=AllLookpdata.listFlagCodes.filter(x=>x.id==Calculatedparameter[0].loggerFlagsOriginal)
          jspreadRef.current.jexcel.getCell(cellName).style.backgroundColor = color.length>0?color[0].colorCode:"#FFFFF";
          jspreadRef.current.jexcel.getCell(cellName).classList.remove('cellhelight');
        }
      }
    }
    }
  }

  const RevertCalculateparameter=function(Calculatedparameter,calparamname,i){
    let Iscalculated = AllLookpdata.listPollutents.filter(x => x.parameterName == Calculatedparameter[0].parameterName && x.isCalculated == 1);
    if (Iscalculated.length > 0) {
      let findcolumn = SelectedPollutents.findIndex(x => x == calparamname);
      /* let value=Calculatedparameter[0].parametervalue;
      if (window.TruncateorRound == "RoundOff") {
        value = value == null ? value : value.toFixed(digit);
      }
      else {
        value = value == null ? value : CommonFunctions.truncateNumber(value, digit)
      }
      jspreadRef.current.jexcel.updateCell(findcolumn+1, i,value , true);
        if (findcolumn != -1) {
        let cellName = jspreadsheet.helpers.getColumnNameFromCoords(findcolumn + 1, i);
        if (cellName) {
          let color=AllLookpdata.listFlagCodes.filter(x=>x.id==Calculatedparameter[0].loggerFlags)
          jspreadRef.current.jexcel.getCell(cellName).style.backgroundColor = color.length>0?color[0].colorCode:"#FFFFF";
          jspreadRef.current.jexcel.getCell(cellName).classList.remove('cellhelight');
        }
      } */
      revertfromolddata(Calculatedparameter,findcolumn+1,i);
    }
  }
  const RestoretoOriginal = function (rows,columns) {
    Swal.fire({
      title: "Are you sure?",
      text: ("You want to restore to original values!"),
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5cb85c",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    })
      .then(async function (isConfirm) {
        if (isConfirm.isConfirmed) {
          let rowindex1=rows[0];
          let rowindex2=rows[rows.length-1];
          let colindex1=columns[0];
          let colindex2=columns[columns.length-1];
          let ModifyBy = currentUser.id;
          flagdata=[];
          let restore=true;
          for (var i = rowindex1; i <= rowindex2; i++) {
            let changearr = dataForGridref.current[i];
            for (var k = colindex1; k <= colindex2; k++) {
              let filtered = [];
              let Parametersplit = SelectedPollutents[k - 1].split("@_");
              let Calculatedparameter = [];
              revertRef.current=true;
              let index=null;
              if (Parametersplit.length > 1) {
                filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == Parametersplit[0] && row.stationID == Parametersplit[1]);
                index =olddata.current.findIndex(x=>x.ID==filtered[0].id);
               if(index !=-1 ){
                reverttoprevious();
               }else{
                Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
                if (Calculatedparameter.length > 0) {
                  let calparamname = Calculatedparameter[0].parameterName + "@_" + Calculatedparameter[0].stationID;
                  RestoreCalculateparameter(Calculatedparameter, calparamname, i,ModifyBy);
                }
                if(Parametersplit == window.parameterNO || Parametersplit == window.parameterNO2){
                  revertRef.current=true;
                  CalculateparameterNox(filtered,filtered[0].parametervalueOrginal,i,Parametersplit,true);
                }  
               }   
              } else {
                filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[k - 1]);
                 index =olddata.current.findIndex(x=>x.ID==filtered[0].id);
               if(index !=-1 ){
                reverttoprevious();
               }else{
                Calculatedparameter = ReportDataListRef.current.filter(row => row.interval === filtered[0].interval && row.parameterIDRef === filtered[0].parameterIDRef && row.stationID === filtered[0].stationID && row.parameterName != filtered[0].parameterName);
               
                if (Calculatedparameter.length > 0) {
                  let calparamname = Calculatedparameter[0].parameterName;
                  RestoreCalculateparameter(Calculatedparameter, calparamname, i,ModifyBy);
                }
                if(Parametersplit == window.parameterNO || Parametersplit == window.parameterNO2){
                  revertRef.current=true;
                  CalculateparameterNox(filtered,filtered[0].parametervalueOrginal,i,Parametersplit[0],true);
                }  
              }
              }
              if(index == -1){
              if(filtered[0].parametervalueOrginal !=filtered[0].parametervalue || filtered[0].loggerFlags !=filtered[0].loggerFlagsOriginal){
                revertRef.current=true;
                let value=filtered[0].parametervalueOrginal;
                value=ValueRoundoff(value);
                /* if (window.TruncateorRound == "RoundOff") {
                  value = value == null ? value : value.toFixed(digit);
                }
                else {
                  value = value == null ? value : CommonFunctions.truncateNumber(value, digit)
                } */
                filtered[0].parametervalue=value==null?value:parseFloat(value);
                jspreadRef.current.jexcel.updateCell(k, i,value , true);
                flagdata.push({ ID: filtered[0].id, Parametervalue: filtered[0].parametervalueOrginal,ParameterName:filtered[0].parameterName, ModifyBy: ModifyBy, LoggerFlags: filtered[0].loggerFlagsOriginal,StationID:filtered[0].stationID,ParameterID:filtered[0].parameterID,ParameterIDRef:filtered[0].parameterIDRef,CreatedTime:filtered[0].createdTime });
              
              var cellName = jspreadsheet.helpers.getColumnNameFromCoords(k, i);
              if (cellName) {
                filtered[0].loggerFlags= filtered[0].loggerFlagsOriginal;
                let color=AllLookpdata.listFlagCodes.filter(x=>x.id==filtered[0].loggerFlagsOriginal)
                jspreadRef.current.jexcel.getCell(cellName).style.backgroundColor = color.length>0?color[0].colorCode:"#FFFFF";
                jspreadRef.current.jexcel.getCell(cellName).classList.remove('cellhelight');
              }
            }
                  }
                }
          }
          if (flagdata.length > 0) {
            let authHeader = await CommonFunctions.getAuthHeader();
                authHeader['Accept'] = 'application/json';
                authHeader['Content-Type'] = 'application/json';
            fetch(CommonFunctions.getWebApiUrl()+ 'api/DataProcessingRestoretoOriginal', {
              method: 'POST',
              headers: authHeader ,
              body: JSON.stringify(flagdata,{restore:restore}),
            }).then((response) => response.json())
              .then((responseJson) => {
                if (responseJson == 1) {

                } else {
                  toast.error('Unable to update the parameter. Please contact adminstrator')
                }
              }).catch((error) => toast.error('Unable to update the parameter. Please contact adminstrator'));
          }
        }
      })

  }

    const EditMultipleValues = function(rows,columns){
     document.getElementById("multiplier").value=null;
    document.getElementById("constant").value=null;
    batchrows.current=rows;
    batchcolumns.current=columns;
     $("#batchedit").modal("show"); 
    }
    const UpdateValues = function(){
      let rows=batchrows.current;
      let columns=batchcolumns.current;
        let rowindex1=rows[0];
        let rowindex2=rows[rows.length-1];
        let colindex1=columns[0];
        let colindex2=columns[columns.length-1];
        let ModifyBy = currentUser.id;
        let multiplier=document.getElementById("multiplier").value;
        let constant=document.getElementById("constant").value;
        flagdata=[];
        let restore=true;
        for (var i = rowindex1; i <= rowindex2; i++) {
          let changearr = dataForGridref.current[i];
          for (var k = colindex1; k <= colindex2; k++) {
            let filtered = [];
            let Parametersplit = SelectedPollutents[k - 1].split("@_");
            let Calculatedparameter = [];
            if (Parametersplit.length > 1) {
              filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == Parametersplit[0] && row.stationID == Parametersplit[1]);
            } else {
              filtered = ReportDataListRef.current.filter(row => row.interval === changearr["Date"] && row.parameterName == SelectedPollutents[k - 1]);
            }
            if(multiplier==null || constant==null || multiplier=="" || constant==""){
              return false;
            }
            let value=filtered[0].parametervalue*parseFloat(multiplier)+parseFloat(constant);
            value=ValueRoundoff(value);
           /*  if (window.TruncateorRound == "RoundOff") {
              value = value == null ? value : value.toFixed(digit);
            }
            else {
              value = value == null ? value : CommonFunctions.truncateNumber(value, digit)
            } */
            jspreadRef.current.jexcel.updateCell(k, i,value , true);
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
    dataForGrid = [];
    let Interval = document.getElementById("criteriaid").value;
    setallLegendsChecked(true);
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
    layout.push({ name: "Date", title: "Date", type: "text", width: "140px", sorting: true,readOnly: true, });
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
      let Iscalculated = filter[0].isCalculated;
      layout.push({
        name: SelectedPollutents[i], title: gridheadertitle, type: "text", width: "100px", readOnly: Iscalculated == 1 || Interval!=window.Intervalval || filter[0].parameterName.toLowerCase()==window.parameterNOx.toLowerCase() ? true : false, sorting: false, cellRenderer: function (item, value) {
          let flag = AllLookpdata.listFlagCodes.filter(x => x.id == value[Object.keys(value).find(key => value[key] === item) + "flag"]);
          let bgcolor = flag.length > 0 ? flag[0].colorCode : "#FFFFFF";
          console.log(item);
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
    //dataForGrid1.current = dataForGrid;
    // setdataForGridcopy(dataForGrid);
    // if (!jspreadRef) {
    jsptable = jspreadsheet(jspreadRef.current, {
      data: dataForGrid,
      rowResize: true,
      tableWidth: '100%',
      tableOverflow: true,
      freezeColumns: 1,
      columns: layout,
      nestedHeaders: headers,
      allowComments: true,
      contextMenu: function (obj, x, y, e) {
        var items = [];
        let Interval = document.getElementById("criteriaid").value;
        let columns=obj.getSelectedColumns(true);
        let Parameterssplit = SelectedPollutents[columns[0]-1].split("@_");
        if(columns.length==1 && (columns[0]==0 || Parameterssplit[0].toLowerCase() == window.parameterNOx.toLowerCase() || Parameterssplit[0].toLowerCase()==window.Noxparamcalc.toLowerCase())){
          return items;
        }
        if(Interval == window.Intervalval){
        let rows=obj.getSelectedRows(true);
        items.push({
          title: "Restore to Original",
          onclick: function () {
            RestoretoOriginal(rows,columns);
          }
        });
        let filter = [];
        if(Parameterssplit.length>1){
          filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == Parameterssplit[1] && x.isCalculated==1);
        }else{
          filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == selectedStations && x.isCalculated==1);
        }
        if(columns.length ==1 && (Parameterssplit[0].toLowerCase() == window.parameterNOx.toLowerCase() || Parameterssplit[0].toLowerCase()==window.Noxparamcalc.toLowerCase())){
          return items;
        }else if(columns.length ==1 && filter.length ==1){
          return items;
        }else{
          items.push({
            title: "Batch Edit",
            onclick: function () {
              EditMultipleValues(rows,columns);
            }
          });
        }
       
      }
        return items;
      },
      //  lazyLoading: true,
      // loadingSpin: true,
      onselection: selectionActive,
      onchange: changed,
      onload: loadtable
    });

    if (jspreadRef.current != null) {
      getchartdata(ListReportData, SelectedPollutents, "line", "Raw");
      //Visiblerecords();
    }
    // }
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
      max = visibleRecords.reduce((max, current) => {
        if (current[excludedKey] > max[excludedKey]) {
          return current;
        } else {
          return max;
        }
      })[excludedKey];
      //  max = visibleRecords.reduce((a, b) => a[excludedKey] > b[excludedKey] ? a[excludedKey] : b[excludedKey])[excludedKey];
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
      roundedNumber=ValueRoundoff(ReportData[k].parametervalue);
      /* if (window.TruncateorRound == "RoundOff") {

        let num = ReportData[k].parametervalue;
        roundedNumber = num == null ? num : num.toFixed(digit);
      }
      else {
        roundedNumber = ReportData[k].parametervalue == null ? ReportData[k].parametervalue : CommonFunctions.truncateNumber(ReportData[k].parametervalue, digit);
      } */
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

  // Function to fetch data for a specific page
  const fetchDataonscroll = async function (currentpage, limit) {
    let Station = "";
    let Pollutent = "";
    let GroupId = $("#groupid").val();
    /* if(GroupId==0){

    }
    else{ */
    Station = $("#stationid").val();
    /*  if (Station.length > 0) {
       Station.join(',')
     } */
    Pollutent = $("#pollutentid").val();
    if (Pollutent.length > 0) {
      Pollutent.join(',')
    }
    if (GroupId == "") {
      setSelectedPollutents(Pollutent);
    } else {
      Pollutent = SelectedPollutents;
    }
    //}

    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    let Interval = document.getElementById("criteriaid").value;
    let valid = ReportValidations(Station, Pollutent, Fromdate, Todate, Interval, GroupId);
    if (!valid) {
      return false;
    }
    // document.getElementById('loader').style.display = "block";
    let Intervaltype;
    let Intervaltypesplit = Interval.split('-');
    if (Intervaltypesplit[1] == 'H') {
      Intervaltype = Intervaltypesplit[0] * 60;
    } else {
      Intervaltype = Intervaltypesplit[0];
    }
    let isAvgData = false;
    if (Interval == window.Intervalval) {
      isAvgData = false;
    }
    else {
      isAvgData = true;
    }
    startindex = (currentpage - 1) * pageLimit;
    let params = new URLSearchParams({ Group: GroupId, Station: Station, Pollutent: Pollutent, Fromdate: Fromdate, Todate: Todate, Interval: Intervaltype, isAvgData: isAvgData, StartIndex: startindex, PageLimit: pageLimit });
    let authHeader = await CommonFunctions.getAuthHeader();
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality?"
    if (GroupId != "") {
      url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/StationGroupingData?"
    }
    fetch(url + params, {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          //console.log(new Date());
          //let Chart_data = JSON.parse(data);
          let data1 = data.map((x) => { x.interval = x.interval.replace('T', ' '); return x; });
          appendDataToSpreadsheet(data1, GroupId);
        }
        //      document.getElementById('loader').style.display = "none";
      }).catch((error) => {
        //console.log(error)
        return [];
      });

  }

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
    isLoading = false;
  }

  // Function to check if scroll reaches the bottom of the container
  const isScrollAtBottom = function () {
    const scrollTop = spreadsheetcontainer.scrollTop;
    const scrollHeight = spreadsheetcontainer.scrollHeight;
    const containerHeight = spreadsheetcontainer.clientHeight;
    const scrollThreshold = 0; // Adjust the threshold if needed
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
    if (type[1] == 'H') {
      Intervaltype = type[0] * 60;
    } else {
      Intervaltype = type[0];
    }
    let isAvgData = false;
    if (Interval == window.Intervalval) {
      isAvgData = false;
    }
    else {
      isAvgData = true;
    }
    startindex = (currentPage - 1) * pageLimit;
    let params = new URLSearchParams({ Group: GroupId, Station: Station, Pollutent: Pollutent, Fromdate: Fromdate, Todate: Todate, Interval: Intervaltype, isAvgData: isAvgData, StartIndex: startindex, PageLimit: pageLimit });
    // currentPage++;
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality?"
    if (GroupId != "") {
      url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/StationGroupingData?"
    }
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(url + params, {
      method: 'GET',
      headers: authHeader ,
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
    //;
    currentPage = 1;
    /* if (chartRef.current) {
      chartRef.current.destroy();
    } */
    setListReportData([]);
    setReportDataList([]);
    setReportDataListCopy([]);
    //setselectedgrid([]);
    selectedgrid.current=[];
    setLoadjsGridData(false);
    olddata.current = [];
    newdata.current = [];
    OldData.current=[];
    NewData.current=[];
    setSaveData([]);
   // setNewData([]);
    //setOldData([]);
    //setChartOptions({});
    GetProcessingData(currentPage, true);
    setTimeout(function(){
    let id=document.getElementById("getdata");
    if(id !=null){
    id.disabled=false;
      }
     }, 500);
  }

  const ReportValidations = function (Station, Pollutent, Fromdate, Todate, Interval, GroupId) {
    let isvalid = true;
    /* if (GroupId != "") {
      return isvalid
    } */
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

  const ChangeStation = function (e) {
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
  const ChangeGroupName = function (e) {
    let stationParamaters = [];
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
    //   let parameters = StationGroups.filter(x => x.stationID == finalstationID[i] && x.groupID == selectedGroup).map(a => ({ parameterID: a.parameterID }));
    //   let station = Stations.filter(x => x.id == finalstationID[i]);
    //   let obj = { title: station.length > 0 ? station[0].stationName : "", colspan: parameters.length };
    //   headers.push(obj);
    //   for (let j = 0; j < parameters.length; j++) {
    //     let value1 = AllLookpdata.listPollutents.filter(x => x.stationID == finalstationID[i] && x.id == parameters[j].parameterID);
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
    /*  for(var i=0; i<StationGroups.length;i++){
         stationParamaters.push({"Station": StationGroups[i].stationID,"ParameterName":StationGroups[i].parameterID});
     } */
  }

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

    // let finaldata = AllLookpdata.listPollutentsConfig.filter(obj => obj.stationID == stationID && obj.parameterName == e.target.value);
    let finaldata = AllLookpdata.listPollutents.filter(obj => stationID.includes(obj.stationID) || filter1.includes(obj.parameterName));
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
  })
  const Resetfilters = function () {
    $('.pollutentid')[0].sumo.reload();
    $('.pollutentid')[0].sumo.unSelectAll();
    $('#stationid').val("");
    $('#groupid').val("");
    //$('.stationid')[0].sumo.unSelectAll();
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

    // afterUpdate(chart, args, options) {
    //   // Modify legend labels
    //   const legend = chart.legend;
    //   const labels = legend.legendItems;
   
    //   if (labels.length > 20) {
    //     // Set max height and overflow
    //     legend.options.maxHeight = 50; // Set the desired max height
    //     legend.options.overflow = 'scroll';
    //   } else {
    //     // Reset max height and overflow if not needed
    //     legend.options.maxHeight = null;
    //     legend.options.overflow = null;
    //   }
    //   labels.forEach(label => {
        
    //   });
  
      
    // }
  };
  /* Drag and drop end */
  const widthStyle = {
    width: GroupSelected == "all" ? '250vh' : '100%'
  };



  const getchartdata = function (data, pollutent, charttype, criteria) {
    
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
          offset: true,
          // afterFit: function(scale) {
          //   scale.width = 40; // Adjust the width of the y-axis
          // },
          title: {
            display: true,
            text: Stationname != "" ? Stationname + " - " + Parametersplit[0] : Parametersplit[0]
          },
          ticks: {
            font: {
              size: 10, // Adjust the font size for x-axis labels
              family: 'Roboto Light',// Change the font type for x-axis labels
              weight: 'bold',
              color: 'blue'
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
          family: 'Roboto Light',// Change the font type for x-axis labels
          weight: 'bold',
          color: 'blue'
        }
      }
    };
    
    let Finaloptions = {
      responsive: true,
      scales: Scaleslist,
      events: ['mousedown', 'mouseup', 'mousemove', 'mouseout'],
      //maintainAspectRatio: false, // Ensure the chart can take full width/height of the container
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
              family: "Roboto Light",
              weight: 'bold'
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
    };

    
    setChartOptions(Finaloptions);
    //setTimeout(() => {
    setChartData({
      // labels,
      datasets: datasets
    })
    // }, 10);
  }
  

  const DownloadPng=function() {
    const chartElement = chartRef.current.canvas;
    html2canvas(chartElement, {
      backgroundColor: 'white', // Set null to preserve the original chart background color
    }).then((canvas) => {
      const image = canvas.toDataURL('image/png');

      // Create a download link and trigger click event
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = 'DataValidationChart.png';
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
    pdf.save('DataValidationChart.pdf');
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
        <div className="modal-dialog modal-lg modal-dialog-centered">
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
                      <th>Old Flag </th>
                      <th>New Flag</th>
                      <th>Modified By</th>
                      <th>Modified On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ListHistory && (
                      ListHistory.map((x, y) =>
                        <tr className="body_active">
                          <td>{AllLookpdata.listPollutents.filter(z => z.id == x.parameterID)[0]?.parameterName}</td>
                          <td>{CommonFunctions.truncateNumber(x.oldValue, 5)}</td>
                          <td>{CommonFunctions.truncateNumber(x.newValue, 5)}</td>
                          <td style={{ backgroundColor: x.oldLoggerFlags != null ? Flagcodelist.filter(z => z.id == x.oldLoggerFlags)[0].colorCode : "#FFFFFF" }} >{x.oldLoggerFlags != null ? Flagcodelist.filter(z => z.id == x.oldLoggerFlags)[0]?.name : ""}</td>
                          <td style={{ backgroundColor: x.newLoggerFlags != null ? Flagcodelist.filter(z => z.id == x.newLoggerFlags)[0].colorCode : "#FFFFFF" }} >{x.newLoggerFlags != null ? Flagcodelist.filter(z => z.id == x.newLoggerFlags)[0]?.name : ""}</td>
                          <td>{x.modifyUserName}</td>
                          <td>{x.modifyOn != null ? generateDatabaseDateTime(x.modifyOn) : x.modifyOn}</td>
                        </tr>
                      )
                    )}
                    {ListHistory.length == 0 && (
                      <tr className="text-center">
                        <td colspan="6"><b>No History</b></td>
                      </tr>
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

      <div className="modal fade zoom dashboard_dmodal" id="batchedit" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" aria-labelledby="batchedit">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Batch Edit</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
          <div className="row">
          <div className="col">
          <label for="multiplier" className="form-label">Orginal Value</label>
          </div>
          (&nbsp;
          <div className="col">
          <label for="multiplier" className="form-label">Multiplier</label>
          <input type="number" className="form-control" id="multiplier"/>
        </div>
        &nbsp;)
        &nbsp; + &nbsp;
        <div className="col">
          <label for="constant" className="form-label">Constant</label>
        <input type="number" className="form-control" id="constant"/>
        </div>
          </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" data-bs-target="#batchedit" data-bs-toggle="modal" onClick={UpdateValues}>Ok</button>
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
                    <label className="form-label">Group Name</label>
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
                    {/*  <select className="form-select stationid" id="stationid" multiple="multiple" onChange={ChangeStation}> */}
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
                    </select>
                  </div>
                  <div className="col-sm-12 mt-2">
                    <button type="button" className="btn btn-primary download-btn" id="getdata" onClick={getdatareport}>Get Data</button>
                    <button type="button" className="btn btn-secondary mx-3 reset-btn" onClick={Resetfilters}>Reset</button>
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
              <div className="card">
                <div className="card-body p-2">
                  <div className="row">
                    <div className="col-md-9 mb-3">
                      {AllLookpdata.listFlagCodes.map((x, y) =>
                        <button type="button" className={y == 0 ? "btn btn-primary flag" : "btn btn-primary flag mx-1"} style={{ backgroundColor: x.colorCode, borderColor: x.colorCode }} onClick={() => UpdateFlag(x)} data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" data-bs-title={x.name} >{x.code}</button>
                      )}
                    </div>
                    {/*  </div>
                <div className="row"> */}
                    <div className="col-md-3 mb-3">
                      <div className="float-end">
                        <button type="button" className="btn btn-primary" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" data-bs-title="History" onClick={gethistory}><i class="bi bi-clock-history"></i></button>
                        <button type="button" className="btn btn-primary mx-1" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" data-bs-title="Revert" onClick={reverttoprevious}><i class="bi bi-back"></i></button>
                        <button type="button" className={SaveData.length > 0 ? "btn btn-primary mx-1" : "btn btn-primary mx-1 disable"} data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" data-bs-title="Save" onClick={SaveEditedData}><i class="bi bi-save"></i></button>
                      </div>
                    </div>
                  </div>

                  <div className="jsGrid" id="jspreadRefid" ref={jspreadRef} />


                </div>
              </div>
            )}
            {ListReportData.length == 0 && LoadjsGridData && (
              <div class="nodatamessage" id="nodatamessage">No data found</div>
            )}
            {ListReportData.length > 0 && ChartData && jspreadRef.current != null && (
              <div className="card p-2">
                <div className="card-body">
                  <div className="chartmaindiv" style={{width:'100%', overflowX:'auto'}}>
                    
                      <div className="graphCanvas d-none d-sm-none d-md-block"  style={widthStyle}>
                        <Line ref={chartRef} options={ChartOptions} data={ChartData} plugins={[dragger]} height={100} style={{width:'2000px', overflowX:'scroll', overflowY:'scroll'}} id="chartCanvas" />
                      </div>

                      <div className="graphCanvas d-block d-sm-block d-md-none"  style={widthStyle}>
                        <Line ref={chartRef} options={ChartOptions} data={ChartData} plugins={[dragger]} height={500} style={{width:'2000px', overflowX:'scroll', overflowY:'scroll'}} id="chartCanvas" />
                      </div>


                    
                    <div className="text-right mt-4 mb-3 pe-2 col-sm-12"> 
                      <input
                      className="form-check-input"
                        type="checkbox"
                        checked={allLegendsChecked}
                        onChange={toggleAllLegends}
                      />&nbsp;
                      <label className="form-check-label">Select All</label>
                    </div>
                    <div className="text-right col-sm-12">
                    <button type="button" className="btn btn-primary mx-3 download-btn"  onClick={DownloadPng}>Download as Image</button>
                    <button type="button" className="btn btn-primary download-btn"  onClick={DownloadPdf}>Download as Pdf</button>
                    </div>
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
export default DataProcessing;