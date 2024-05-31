
import React, { Component, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import CommonFunctions from "../utils/CommonFunctions";

function ExceedenceReport() {
  const $ = window.jQuery;
  const gridRefjsgridreport = useRef();
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [AllData, setAllData] = useState([]);
  const [Stations, setStations] = useState([]);
  const [Pollutents, setPollutents] = useState([]);
  const [Units, setUnits] = useState([]);
  const [Criteria, setcriteria] = useState([]);
  const [ListExceedence, setListExceedence] = useState(null);

  const GetLookupData = async function () {
    let authHeader = await CommonFunctions.getAuthHeader();
    await fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/GetExceedenceLookupData", {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          setAllData(data);
        setStations(data.listStations);  
        let resArr = [];
        data.listParameters.filter(function(item){
          let i = resArr.findIndex(x => (x.parameter == item.parameter));
          if(i <= -1){
                resArr.push(item);
          }
          return null;
        });
        setPollutents(resArr);
        console.log(resArr)
        }
      }).catch((error) => toast.error('Unable to get the users list. Please contact adminstrator'));
  }

  const Parameterchange=function(e){
      let value = e.target.value;
     // setUnits([]);
      //setcriteria([]);
      document.getElementById("unitid").value="";
      document.getElementById("intervalid").value="";
        let resArr=[];
        let resArr1=[];
      AllData.listParameters.filter(function(item){
        if(item.parameter == value){
        let i = resArr.findIndex(x => (x.unitID == item.unitID));
        let j = resArr1.findIndex(x => (x.interval == item.interval));
        if(i <= -1){
              resArr.push(item);
        }
        if(j <= -1){
          resArr1.push(item);
            }
      }
        return null;
      });
    setUnits(resArr);
    setcriteria(resArr1);
  }

  const GetUnitName=function(param){
    let unitName=AllData.listReportedunits.filter(x=>x.id==param)[0]?.unitName;
    return unitName;
  }
  const GetInterval=function(param){
    let Interval=param / 60;
    return Interval+"-H";
  }

  const ReportValidations = function (Station, Pollutent, UnitID,Fromdate, Todate, Interval) {
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
      toast.error('Please select pollutent', {
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
    } else if (UnitID == "") {
      toast.error('Please select from unit', {
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
    }else if (Fromdate == "") {
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
  const GenarateReport= async function(){
    let StationID = document.getElementById("stationid").value;
    let PollutentName = document.getElementById("pollutentid").value;
    let UnitID=document.getElementById("unitid").value;
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    let Interval = document.getElementById("intervalid").value;
    let valid = ReportValidations(StationID, PollutentName,UnitID, Fromdate, Todate, Interval);
    if (!valid) {
      return false;
    }
    let Exceedencevalue=AllData.listParameters.filter(x=>x.parameter==PollutentName && x.interval == Interval && x.unitID==UnitID)[0]?.excedenceValue;
    let params = new URLSearchParams({StationID: StationID, FromDate: Fromdate, ToDate: Todate, Parameter: PollutentName, UnitID:UnitID, Interval: Interval,Exceedencevalue:Exceedencevalue});
    let authHeader = await CommonFunctions.getAuthHeader();
    await fetch(CommonFunctions.getWebApiUrl()+ "api/AirQuality/ParameterExceedence?"+params, {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          setListExceedence(data);
        }
      }).catch((error) => console.log(error));
  }

  useEffect(() => {
    initializeJsGrid();
  });
  useEffect(() => {
    GetLookupData();
  }, [])
  const initializeJsGrid = function () {
    window.jQuery(gridRefjsgridreport.current).jsGrid({
      width: "100%",
      height: "auto",
      filtering: false,
      editing: false,
      inserting: false,
      sorting: true,
      paging: true,
      autoload: true,
      pageSize: 100,
      pageButtonCount: 5,
      controller: {
        data: ListExceedence,
        loadData: function (filter) {
          $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-lg border-50");
          $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm device-select-control");
          return $.grep(this.data, function (item) {
            return ((!filter.average || item.average.includes(filter.average))
              && (!filter.date || item.date.includes(filter.date))
              && (!filter.hour || item.hour.includes(filter.hour))
            );
          });
        }
      },
      fields: [
        { title: "Rank",   itemTemplate: function(_, item) {
          var index = window.jQuery(gridRefjsgridreport.current).jsGrid("option", "data").indexOf(item);
          return index + 1; // Display index (add 1 for 1-based indexing)
            },
            width: 50 // Set the column width as needed},
          },
        { name: "average", title: "Average", type: "text" },
        { name: "date", title: "Date", type: "text" },
        { name: "hour", title: "Hour", type: "text", },
        /* {
          type: "control", width: 100, editButton: false, deleteButton: false
        }, */
      ]
    });
  }

  const PDFDataContent=function(layout,strTime,PollutentName,UnitName,AvgInterval,Fromdate,Todate,StationName,Exceedencevalue){
    var pdf = new jsPDF("p", "pt", "a4");
          pdf.setFont("helvetica");
          pdf.setFontSize(10);          
          //const columns = tableheading;
          pdf.text(35, 10,"Current Date : "+ String(layout.getDate()).padStart(2, '0') + "/" + String(layout.getMonth() + 1).padStart(2, '0') + "/" + layout.getFullYear());
          pdf.text(35, 30,"Current Time : "+ strTime);
          var width = pdf.internal.pageSize.getWidth();
          pdf.text("Violation of Standard Reports", width/2, 50, { align: 'center' });
          pdf.setFontSize(8);
          pdf.text(PollutentName+'_'+UnitName[0].unitName +" " + AvgInterval + " limit", width/2, 70, { align: 'center' });
          pdf.setFontSize(10);
          pdf.text(Fromdate+" "+"00:00 "+"- "+Todate+" "+"23:59", width/2, 90, { align: 'center' });
          pdf.text(35, 110, "Site : "+StationName[0].stationName, { "text-align": 'left' });
          pdf.text(550,110, "Parameter : "+PollutentName, { align: 'right' });
          pdf.text(35, 130, "Average Interval : "+AvgInterval, { align: 'left' });
          pdf.text(550,130, "Units : "+UnitName[0].unitName, { align: 'right' });
          pdf.text(35, 150, "Average Type : Normal", { align: 'left' });
          pdf.text(550, 150, "Violation Limit : "+Exceedencevalue, { align: 'right' });
          return pdf;
  }

  const DownloadPDF = async function () {
    let StationID = document.getElementById("stationid").value;
    let PollutentName = document.getElementById("pollutentid").value;
    let UnitID=document.getElementById("unitid").value;
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    let Interval = document.getElementById("intervalid").value;
    let valid = ReportValidations(StationID, PollutentName,UnitID, Fromdate, Todate, Interval);
    if (!valid) {
      return false;
    }
    let Exceedencevalue=AllData.listParameters.filter(x=>x.parameter==PollutentName && x.interval == Interval && x.unitID==UnitID)[0]?.excedenceValue;
    let params = new URLSearchParams({StationID: StationID, FromDate: Fromdate, ToDate: Todate, Parameter: PollutentName, UnitID:UnitID, Interval: Interval,Exceedencevalue:Exceedencevalue});

    var UnitName=AllData.listReportedunits.filter(x=>x.id==UnitID);
    var StationName=AllData.listStations.filter(x=>x.id==StationID);
    var AvgInterval;
    var Interval1= Interval/60

    AvgInterval=Interval1 + (Interval1==1 ? " Hour":" Hours");

    var tableheading = [];
    tableheading.push("Rank");
    tableheading.push("Average");
    tableheading.push("Date");
    tableheading.push("Hour");
    var rows=[];
    var layout = new Date();
    var hours = layout.getHours();
    var minutes = layout.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      let authHeader = await CommonFunctions.getAuthHeader();
      await fetch(CommonFunctions.getWebApiUrl()+ 'api/AirQuality/ParameterExceedence?' + params, {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((pdfdata) => {
        if (pdfdata.length!=0) {   
          var b = 0;
          var c1=1;
          var c2=2;
          var c3=3;
          for (var k = 0; k < pdfdata.length; k++) {            
            var temprank=pdfdata[k].rank;
            if(temprank==0){
              temprank=k+1;
            }
            rows.push([temprank])
            rows[b][c1] = pdfdata[k].average;
            rows[b][c2] = pdfdata[k].date;
            rows[b][c3] = pdfdata[k].hour;
            b++;
          }

          var PDFData= PDFDataContent(layout,strTime,PollutentName,UnitName,AvgInterval,Fromdate,Todate,StationName,Exceedencevalue);
          const columns = tableheading;
          PDFData.autoTable(columns, rows, {
            theme: "grid",
            startY: 200
          });          
          PDFData.save("Exceedence Data Report");
        }
        else{
          var rowdata='No values exceeded the limit of the selected time period';
          var PDFData= PDFDataContent(layout,strTime,PollutentName,UnitName,AvgInterval,Fromdate,Todate,StationName,Exceedencevalue);
          const columns = tableheading;
          PDFData.autoTable(columns, rows,{
            theme: "grid",
            startY: 200
          });
          let finalY=250;
          var width = PDFData.internal.pageSize.getWidth();
          PDFData.text(rowdata, width/2, finalY, { align: 'center' });
          PDFData.save("Exceedence Data Report");
        }
      }).catch((error) => toast.error('Unable to download the PDF File. Please contact adminstrator'));
  }
 
  return (
    <main id="main" className="main" >

        <section className="section">
          <div className="container">
          <div className="card">
              <div className="card-body">
                <div className="row filtergroup statics-col-div">
                  <div className="col mb-3">
                    <label className="form-label">Station Name</label>
                    <select className="form-select stationid border-50" id="stationid">
                    <option selected> Select Station Name</option>
                      {Stations.map((x, y) =>
                        <option value={x.id} key={y}>{x.stationName}</option>
                      )}
                    </select>
                  </div>
                  <div className="col mb-3">
                    <label className="form-label">Parameters</label>
                    <select className="form-select pollutentid border-50" id="pollutentid" onChange={(e)=>Parameterchange(e)}>
                    <option selected> Select Parameter</option>
                      {Pollutents.map((x, y) =>
                        <option value={x.parameter} key={y} >{x.parameter}</option>
                      )}
                    </select>
                  </div>
                  <div className="col mb-3">
                    <label className="form-label">Units</label>
                    <select className="form-select pollutentid border-50" id="unitid">
                    <option value="" selected> Select Unit</option>
                      {Units.map((x, y) =>
                        <option value={x.unitID} key={y} >{GetUnitName(x.unitID)}</option>
                      )}
                    </select>
                  </div>
                  <div className="col mb-3 position-relative">
                    <label className="form-label">From Date</label>
                    <img src="images/calendar-icon.png" className="calender-icon-bg" alt="calenderIcon" />
                    <DatePicker className="form-control border-50" id="fromdateid" selected={fromDate} onChange={(date) => setFromDate(date)} />
                  </div>
                  <div className="col mb-3 position-relative">
                    <label className="form-label">To Date</label>
                    <img src="images/calendar-icon.png" className="calender-icon-bg" alt="calenderIcon" />
                    <DatePicker className="form-control border-50" id="todateid" selected={toDate} onChange={(date) => setToDate(date)} />
                  </div>
                  <div className="col mb-3">
                    <label className="form-label">Interval</label>
                    <select className="form-select border-50" id="intervalid">
                      <option value="" selected>Select Interval</option>
                      {Criteria.map((x, y) =>
                        <option value={x.interval} key={y} >{GetInterval(x.interval)}</option>
                      )}
                    </select>
                  </div>

                  <div className="col-md-12  mt-4">
                    <button type="button" className="btn btn-primary download-btn mb-3" onClick={GenarateReport}>Generate Report</button>

                    {ListExceedence && (
                        <button type="button" className="btn btn-primary mx-2 datashow download-btn mb-3" onClick={DownloadPDF}>Download PDF</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {ListExceedence && (
              <div className="jsGrid" ref={gridRefjsgridreport} />
            )}
          </div>

        </section>
    </main>
  );
}
export default ExceedenceReport;