import React, { useCallback, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import CommonFunctions from "../utils/CommonFunctions";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
function AverageDataReport() {

  const $ = window.jQuery;

  const gridRefjsgridreport = useRef();

  const [selectedStations, setselectedStations] = useState([]);

  const [fromDate, setFromDate] = useState(new Date());

  const [toDate, setToDate] = useState(new Date());

  const [ListReportData, setListReportData] = useState(0);

  const [ReportData, setReportData] = useState([]);

  const [sortOrder, setsortOrder] = useState('asc');
  const [Groups, setGroups] = useState([]);
  const [isRolling, setisRolling] = useState(false);
  const [StationGroups, setStationGroups] = useState([]);
  const [Flagcodelist, SetFlagcodelist] = useState([]);
  const [Stations, setStations] = useState([]);
  const [ItemCount, setItemCount] = useState(0);
  const [Nestedheaders, setNestedheaders] = useState([]);
  const [GroupSelected, setGroupSelected] = useState("");
  const [SelectedPollutents, setSelectedPollutents] = useState([]);

  const [AllLookpdata, setAllLookpdata] = useState(null);

  const [Pollutents, setPollutents] = useState([]);

  const [Criteria, setcriteria] = useState([]);
  const PollutentsRef = useRef([]);
  PollutentsRef.current = SelectedPollutents;
  const Itemcount = useRef();

  Itemcount.current = ItemCount;
  var dataForGrid = [];

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

    initializeJsGrid();
  }, [SelectedPollutents]);
  /* reported data start */

  const UpdateColPos = function (cols) {

    var left = $('.jsgrid-grid-body').scrollLeft() < $('.jsgrid-grid-body .jsgrid-table').width() - $('.jsgrid-grid-body').width() + 16

      ? $('.jsgrid-grid-body').scrollLeft() : $('.jsgrid-grid-body .jsgrid-table').width() - $('.jsgrid-grid-body').width() + 16;

    $('.jsgrid-header-row th:nth-child(-n+' + cols + '), .jsgrid-filter-row td:nth-child(-n+' + cols + '), .jsgrid-insert-row td:nth-child(-n+' + cols + '), .jsgrid-grid-body tr td:nth-child(-n+' + cols + ')')

      .css({

        "position": "relative",

        "left": left

      });

  }

  const Codesinformation = function () {

    $('#alertcode').modal('show');

  }

  const initializeJsGrid = function () {

    dataForGrid = [];

    var layout = [];
    var gridheadertitle;
    layout.push({ name: "Date", title: "Date", type: "text", width: "140px", sorting: true });

    for (var i = 0; i < SelectedPollutents.length; i++) {

      let Parameterssplit = SelectedPollutents[i].split("@_");
      let filter = [];
      if(Parameterssplit.length>1){
        filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == Parameterssplit[1]);
      }else{
        filter = AllLookpdata.listPollutents.filter(x => x.parameterName == Parameterssplit[0] && x.stationID == selectedStations);
      }
      let unitname = AllLookpdata.listReportedUnits.filter(x => x.id == filter[0].unitID);
      //gridheadertitle = Parameterssplit[0] + "\n" + unitname[0].unitName
       gridheadertitle = Parameterssplit[0] + "<br>" + unitname[0].unitName +"<br>Min: <br>Max: "
      let Selectedparametersplit = SelectedPollutents[i].split(".");
      let Selectedparameter = Selectedparametersplit.length > 1 ? SelectedPollutents[i].replace(/\./g, '_@_') : SelectedPollutents[i];

      layout.push({
        // name: SelectedPollutents[i], title: gridheadertitle, type: "text", width: "100px", sorting: false, cellRenderer: function (item, value) {
        name: Selectedparameter, title: gridheadertitle, type: "text", width: "100px", sorting: false, cellRenderer: function (item, value) {
          let flag = AllLookpdata.listFlagCodes.filter(x => x.id == value[Selectedparameter + "flag"]);
        //  let flag = AllLookpdata.listFlagCodes.filter(x => x.id == value[Object.keys(value).find(key => value[key] === item) + "flag"]);
          let bgcolor = flag.length > 0 ? flag[0].colorCode : "#FFFFF"
          return $("<td>").css("background-color", bgcolor).append(item);
        }
      });

      // layout.push({ name:SelectedPollutents[i] , title:  gridheadertitle , type: "text",width:"100px" });

    }

    if (SelectedPollutents.length < 10) {

      for (var p = SelectedPollutents.length; p < 10; p++) {
        layout.push({ name: " " + p, title: " ", type: "text", width: "100px", sorting: false });
      }

    }

    window.jQuery(gridRefjsgridreport.current).jsGrid({

      width: "100%",

      height: "auto",

      filtering: false,

      editing: false,

      inserting: false,

      sorting: true,

      autoload: true,

      paging: true,

      pageLoading: true,

      pageButtonCount: 5,

      pageSize: 100,

      pageIndex: 1,

      controller: {

        loadData: async function (filter) {

          var startIndex = (filter.pageIndex - 1) * filter.pageSize;
          let data = await AvgDataReport(startIndex, startIndex + filter.pageSize, filter.sortOrder);
         updateHeaderWithMinMaxValues(data);
          return {
              data: data,
              itemsCount: await Itemcount.current
          };

          /*return {

            data: await AvgDataReport(startIndex, startIndex + filter.pageSize, filter.sortOrder),

            itemsCount: await Itemcount.current

          };*/

        }

      },

      fields: layout

    });

    $('.jsgrid-grid-body').scroll(function () {
      UpdateColPos(1);
    });

  }

  function updateHeaderWithMinMaxValues(data) {
    let minMaxValues = {};

    // Calculate min and max values for each pollutant
    SelectedPollutents.forEach(item => {
        //Object.keys(item).forEach(key => {
            if (!minMaxValues[item]) {
                minMaxValues[item] = { min: "", max: "" };
            }
            let finalitem = item.split(".").length > 1 ? item.replace(/\./g, '_@_') : item;
            let finadata = data.filter(key => key.hasOwnProperty(item));
            if(finadata.length>0){
                 minMaxValues[item].min = finadata[0][finalitem+"minValue"]==null?"":finadata[0][finalitem+"minValue"];
                minMaxValues[item].max = finadata[0][finalitem+"maxValue"]==null?"":finadata[0][finalitem+"maxValue"];
            }
        });
    //});

    // Update the header
    Object.keys(minMaxValues).forEach(key => {
        if (key !== "Date" && key !== " ") {
          let headerCell = $('th').filter(function() {
            let finaltext =$(this).html().split("<br>")[0];
            let finalparametersplit = finaltext.split(".");
            let finalparameter = finalparametersplit.length > 1 ? finaltext.replace(/\./g, '_@_') : finaltext;
      
            return finalparameter === key;
        });
            if (headerCell.length > 0) {
                let unitname = headerCell.html().split("<br>")[1];
                headerCell.html(`${key.replace(/\_@_/g, '.')}<br>${unitname}<br>Min: ${minMaxValues[key].min}<br>Max: ${minMaxValues[key].max}`);
            }
        }
    });
}

  const generateDatabaseDateTime = function (date) {

    return date.replace("T", " ").substring(0, 19);

  }

  const AvgDataReport = async function (startIndex, lastIndex, sortorder) {
    let Station = "";
    let Pollutent = "";
    let GroupId = $("#groupid").val();
    Station = $("#stationid").val();
    Pollutent = $("#pollutentid").val();
    if (Pollutent.length > 0) {
      Pollutent.join(',')
    }
    if (GroupId != "") {
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
    
    let SortOrder= sortorder==undefined || sortorder=='desc'?'asc':'desc'

    let params = new URLSearchParams({ Group: GroupId, Station: Station, Pollutent: Pollutent, Fromdate: Fromdate, Todate: Todate, Interval: Intervaltype, isAvgData: isAvgData,isRollingAvg:isRollingAvg, StartIndex: startIndex, SortOrder: SortOrder  });
    
    let url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/RawDataReport?"
    if (GroupId != "") {
      url = CommonFunctions.getWebApiUrl()+ "api/AirQuality/StationGroupingData?"
    }

        let authHeader = await CommonFunctions.getAuthHeader();
    return await fetch(url + params, {

      method: 'GET',
      headers:authHeader

    }).then((response) => response.json())

      .then((data) => {

        if (data) {

          dataForGrid = [];

          let data1 = data.map((x) => { x.interval = x.interval.replace('T', ' '); return x; });

          for (var k = 0; k < data1.length; k++) {

            if (k == 0) {
              Itemcount.current = data1[0].count;
            }
            var obj = {};

            var temp = dataForGrid.findIndex(x => x.Date === data1[k].interval);

            let tempparameter = AllLookpdata.listPollutents

            let paramater = AllLookpdata.listPollutents.filter(x => x.id == data1[k].parameterID);

            if (paramater.length > 0) {

              let roundedNumber = 0;
              let minValue = 0;
              let maxValue = 0;

              let digit = window.decimalDigit

              if (window.TruncateorRound == "RoundOff") {
                let num = data1[k].parametervalue;
                let minnum = data1[k].minValue;
                let maxnum = data1[k].maxValue;
                roundedNumber = num == null ? num : num.toFixed(digit);
                minValue = minnum == null ? minnum : minnum.toFixed(digit);
                maxValue = maxnum == null ? maxnum : maxnum.toFixed(digit);
              }
              else {
                roundedNumber = data1[k].parametervalue == null ? data1[k].parametervalue : CommonFunctions.truncateNumber(data1[k].parametervalue, digit);
                minValue = data1[k].minValue == null ? data1[k].minValue : CommonFunctions.truncateNumber(data1[k].minValue, digit);
                maxValue = data1[k].maxValue == null ? data1[k].maxValue : CommonFunctions.truncateNumber(data1[k].maxValue, digit);
              }
              let Selectedparametersplit = paramater[0].parameterName.split(".")
              let Selectedparameter = Selectedparametersplit.length > 1 ? paramater[0].parameterName.replace(/\./g, '_@_') : paramater[0].parameterName;

              if (temp >= 0) {

                //dataForGrid[temp][paramater[0].parameterName] = roundedNumber;
                dataForGrid[temp][Selectedparameter] = roundedNumber;
                dataForGrid[temp][paramater[0].parameterName + "flag"] = data1[k].loggerFlags;
                dataForGrid[temp][paramater[0].parameterName + "minValue"] = minValue;
                dataForGrid[temp][paramater[0].parameterName + "maxValue"] = maxValue;

              } else {

                //obj[paramater[0].parameterName] = roundedNumber;

                //obj[paramater[0].parameterName + "flag"] = data1[k].loggerFlags;
                obj[Selectedparameter] = roundedNumber;
                obj[Selectedparameter + "flag"] = data1[k].loggerFlags;
                obj[Selectedparameter + "minValue"] = minValue;
                obj[Selectedparameter + "maxValue"] = maxValue;

                obj["Date"] = data1[k].interval;
                dataForGrid.push(obj);

              }

            }
          }

          document.getElementById('loader').style.display = "none";

          setReportData(dataForGrid);

          return dataForGrid;

        }

        document.getElementById('loader').style.display = "none";

      }).catch((error) => console.log(error));

  }

  const getdtareport = function () {

   let Station = $("#stationid").val();
    let Pollutent = $("#pollutentid").val();

    setSelectedPollutents(Pollutent);
    if (Pollutent.length > 0) {

      Pollutent.join(',')

    }
    let GroupId = $("#groupid").val();

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

    setListReportData(1);

    //initializeJsGrid();

    // AvgDataReport();

  }

  const DownloadPDF = async function () {
    let Pollutent = $("#pollutentid").val();
    if (Pollutent.length > 0) {
      Pollutent.join(',')
    }
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    let interval = document.getElementById("criteriaid").value;
    let valid = ReportValidations(Pollutent, Fromdate, Todate, interval);
    if (!valid) {
      return false;
    }
    let type = interval.substr(interval.length - 1);
    let Interval;
    if (type == 'H') {
      Interval = interval.substr(0, interval.length - 1) * 60;
    } else {
      Interval = interval.substr(0, interval.length - 1);
    }
    let paramUnitnames;
    var tableheading = [];
    var rows = [];
    var layout = "";
    layout = "Date";
    tableheading.push(layout);
    for (var i = 0; i < SelectedPollutents.length; i++) {
      let filter = AllLookpdata.listPollutents.filter(x => x.parameterName == SelectedPollutents[i]);
      let unitname = AllLookpdata.listReportedUnits.filter(x => x.id == filter[0].unitID);
      if (paramUnitnames == undefined) {
        paramUnitnames = filter[0].parameterName + "-" + unitname[0].unitName + ",";
        layout = filter[0].parameterName + "-" + unitname[0].unitName;
        tableheading.push(layout);
      }
      else {
        paramUnitnames += filter[0].parameterName + "-" + unitname[0].unitName + ",";
        layout = filter[0].parameterName + "-" + unitname[0].unitName;
        tableheading.push(layout);
      }
    }

    const styles = {
      fontFamily: "sans-serif",
      textAlign: "center"
    };
    const colstyle = {
      width: "30%"
    };
    const tableStyle = {
      width: "100%"
    };
    var b = 0;
    let authHeader = await CommonFunctions.getAuthHeader();
    let params = new URLSearchParams({ Pollutent: Pollutent, Fromdate: Fromdate, Todate: Todate, Interval: Interval });
    await fetch(CommonFunctions.getWebApiUrl() + 'api/AirQuality/ExportToPDFAverageData?' + params, {
      method: 'GET',
      headers:authHeader
    }).then((response) => response.json())
      .then((pdfdata) => {
        if (pdfdata) {
          for (var k = 0; k < pdfdata.length; k++) {
            var temp = rows.findIndex(x => x[0] === pdfdata[k].interval.replace('T', ' '));
            let roundedNumber = 0;
            let digit = window.decimalDigit;
            if (window.TruncateorRound == "RoundOff") {
              let num = pdfdata[k].parametervalue;
              roundedNumber = num == null ? num : num.toFixed(digit);
            }
            else {
              roundedNumber = pdfdata[k].parametervalue == null ? pdfdata[k].parametervalue : CommonFunctions.truncateNumber(pdfdata[k].parametervalue, digit);
            }
            if (temp >= 0) {
              var n = 1;
              for (var e = 0; e < SelectedPollutents.length; e++) {
                if (pdfdata[k].parameterName == SelectedPollutents[e]) {
                  rows[temp][n] = roundedNumber;
                }
                n++;
              }
            }
            else {
              var d = 1;
              rows.push([pdfdata[k].interval.replace('T', ' ')]);
              for (var e = 0; e < SelectedPollutents.length; e++) {
                if (pdfdata[k].parameterName == SelectedPollutents[e]) {
                  //Columnfields.push([ListReportData[k].interval ,roundedNumber]); 
                  rows[b][d] = roundedNumber;
                }
                d++;
              }
              b++;
            }
          }
          var pdf = new jsPDF("p", "pt", "a4");
          const columns = tableheading;
          pdf.text(235, 40, "Average Data Report");
          pdf.autoTable(columns, rows, {
            startY: 65,
            theme: "grid",
            styles: {
              font: "times",
              halign: "center",
              cellPadding: 3.5,
              lineWidth: 0.5,
              lineColor: [0, 0, 0],
              textColor: [0, 0, 0]
            },
            headStyles: {
              textColor: [0, 0, 0],
              fontStyle: "normal",
              lineWidth: 0.5,
              lineColor: [0, 0, 0],
              fillColor: [166, 204, 247]
            },
            alternateRowStyles: {
              fillColor: [212, 212, 212],
              textColor: [0, 0, 0],
              lineWidth: 0.5,
              lineColor: [0, 0, 0]
            },
            rowStyles: {
              lineWidth: 0.5,
              lineColor: [0, 0, 0]
            },
            tableLineColor: [0, 0, 0]
          });
          console.log(pdf.output("datauristring"));
          pdf.save("Average Data Report");
        }
      }).catch((error) => toast.error('Unable to download the PDF File. Please contact adminstrator'));
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

    setcriteria([]);

    setToDate(new Date());

    setFromDate(new Date());

    setListReportData(0);

    setSelectedPollutents([]);

  }

  return (

    <main id="main" className="main" >

      <div className="modal fade zoom dashboard_dmodal" id="alertcode" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">

            <div className="modal-header">

              <h1 className="modal-title fs-5" id="staticBackdropLabel">Codes Information</h1>

              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

            </div>

            <div className="modal-body">

              <div className="table-responsive">

                <table className="table align-middle table-bordered">

                  <thead>

                    <tr className="header_active">

                      <th>Code</th>

                      <th>Message</th>

                    </tr>

                  </thead>

                  {AllLookpdata && (

                    <tbody>

                      {AllLookpdata.listFlagCodes.map((x, y) =>

                        <tr>

                          <td>{x.code}</td>

                          <td style={{ backgroundColor: x.colorCode }}>{x.name}</td>

                        </tr>

                      )}

                    </tbody>

                  )}

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
                  <div className="col-md-2">
                    <label className="form-label">Group</label>
                    <select className="form-select" id="groupid" onChange={ChangeGroupName}>
                      <option value="" selected>None</option>
                      <option value="all">All Stations</option>
                      {Groups.map((x, y) =>
                        <option value={x.groupID} key={y} >{x.groupName}</option>
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
                    <label className="form-label">From Date</label>
                    <DatePicker className="form-control" id="fromdateid" selected={fromDate} onChange={(date) => setFromDate(date)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">To Date</label>
                    <DatePicker className="form-control" id="todateid" selected={toDate} onChange={(date) => setToDate(date)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Interval</label>
                    <select className="form-select" id="criteriaid">
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
                  <div className=" mt-4">
                    <div class="col-md-2 float-start">
                      <button type="button" className="btn btn-primary" id="getdata" onClick={getdtareport}>Get Data</button>
                      <button type="button" className="btn btn-secondary mx-1" onClick={Resetfilters}>Reset</button>
                    </div>
                    {ListReportData != 0 && (
                      <div class="col-md-6 float-end text-end px-0">
                        <button type="button" className="btn btn-primary datashow me-0" onClick={() => DownloadExcel('excel')} >Download Excel</button>&nbsp;
                        <button type="button" className="btn btn-primary datashow me-0" onClick={() => DownloadExcel('csv')} >Download Csv</button>
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
            {ListReportData != 0 && (

              <div id="jsGridData" className="jsGrid" ref={gridRefjsgridreport} />

            )}
          </div>

        </div>

      </section>
    </main>

  );

}

export default AverageDataReport;