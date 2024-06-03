import React, { Component, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import CommonFunctions from "../utils/CommonFunctions";
function AppLogHistory() {
  const $ = window.jQuery;
  const gridRefLogHistoryreport = useRef();
  const [ListAppLog, setListAppLog] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const GetAppLogLookup = async function () {
    let authHeader = await CommonFunctions.getAuthHeader();
    await fetch(CommonFunctions.getWebApiUrl()+ "api/AppLogHistory", {
      method: 'GET',
      headers: authHeader,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          let data1 = data.listAppLogHistory.map((x) => { x.logTime = x.logTime.replace('T', ' ');  return x; });
          setListAppLog(data1);
        }
      }).catch((error) => toast.error('Unable to get the application log list. Please contact adminstrator'));
  }

  const GetAppLog = async function (param) {
    // let Fromdate = document.getElementById("fromdateid").value;
    // let Todate = document.getElementById("todateid").value;
    let authHeader = await CommonFunctions.getAuthHeader();
    if(param =='reset'){
      let Fromdate="01-01-0001 0:00:00";
      let Todate="01-01-0001 0:00:00";
      let params = new URLSearchParams({ Fromdate: Fromdate, Todate: Todate});
      await fetch(CommonFunctions.getWebApiUrl()+ "api/AppLogHistoryByFilter?"+ params, {
        method: 'GET',
        headers: authHeader,
      }).then((response) => response.json())
        .then((data) => {
          if (data) {
            let data1 = data.map((x) => { x.logTime = x.logTime.replace('T', ' '); return x; });
            setListAppLog(data1);
          }
        }).catch((error) => toast.error('Unable to get the application log list. Please contact adminstrator'));
    }
    else{
      let Fromdate = document.getElementById("fromdateid").value;
      let Todate = document.getElementById("todateid").value;
      let params = new URLSearchParams({ Fromdate: Fromdate, Todate: Todate});
      await  fetch(CommonFunctions.getWebApiUrl()+ "api/AppLogHistoryByFilter?"+ params, {
        method: 'GET',
        headers: authHeader,
      }).then((response) => response.json())
        .then((data) => {
          if (data) {
            let data1 = data.map((x) => { x.logTime = x.logTime.replace('T', ' '); return x; });
            setListAppLog(data1);
          }
        }).catch((error) => toast.error('Unable to get the application log list. Please contact adminstrator'));
    }
  }
  useEffect(() => {
    initializeJsGrid();
  });
  useEffect(() => {
    GetAppLogLookup();
  }, [])
  const initializeJsGrid = function () {
    window.jQuery(gridRefLogHistoryreport.current).jsGrid({
      width: "100%",
      height: "auto",
      filtering: true,
      editing: false,
      inserting: false,
      sorting: true,
      paging: true,
      autoload: true,
      pageSize: 100,
      pageButtonCount: 5,
      controller: {
        data: ListAppLog,
        loadData: function (filter) {
          $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-lg border-50");
          $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
          return $.grep(this.data, function (item) {
            return (!filter.logID || item.logID === filter.logID)
            && ((!filter.logDescription || item.logDescription.toUpperCase().indexOf(filter.logDescription.toUpperCase()) >= 0)
              && (!filter.logSource || item.logSource.toUpperCase().indexOf(filter.logSource.toUpperCase()) >= 0)
              && (!filter.logTime || item.logTime.toUpperCase().indexOf(filter.logTime.toUpperCase()) >= 0)
            );
          });
        }
      },
      fields: [
        { name: "serialNumber", title: "S. No.", width: 30, align: "center", sorting: false, 
          itemTemplate: function(_, item, index) { 
            var index = ListAppLog.indexOf(item);
            return index + 1; 
          } 
        },
        { name: "logID", title: "App ID", type: "text", align: "center" },
        { name: "logDescription", title: "Description", type: "text", align: "center" },
        { name: "logSource", title: "Source", type: "text", align: "center" },
        { name: "logTime", title: "Log Inserted Time", type: "text", align: "center" },
        { type: "control", width: 100, editButton: false, deleteButton: false},
      ]
    });
  }
  
  return (
    <main id="main" className="main" >
      <div className="container">
        <div className="pagetitle">
            <h1>Application Log List</h1>
        </div>
        <section className="section">
          <div className="container">
            <div className="row mt-4">
              <div className="col-sm-12 col-md-3 col-lg-2 mb-2 position-relative">
                <label className="form-label">From Date</label>
                <img src="images/calendar-icon.png" className="calender-icon-bg" alt="calenderIcon" />
                <DatePicker className="form-control border-50" id="fromdateid" selected={fromDate} onChange={(date) => setFromDate(date)} />
              </div>
              <div className="col-sm-12 col-md-3 col-lg-2 mb-2 position-relative">
                <label className="form-label">To Date</label>
                <img src="images/calendar-icon.png" className="calender-icon-bg" alt="calenderIcon" />
                <DatePicker className="form-control border-50" id="todateid" selected={toDate} onChange={(date) => setToDate(date)} />
              </div>
              <div className="col-sm-12 col-md-6 col-lg-8 mt-4 mb-2 text-right pe-0">
                <button type="button" className="btn btn-primary mx-1 filter-btn" onClick={() => GetAppLog()}>Filter</button>
                <button type="button" className="btn btn-secondary mx-1 reset-btn" onClick={() => GetAppLog('reset')}>Reset</button>
              </div>
            </div>
          </div>
          <div className="container common-table-pd stationList-filter-bg">
            
              <div className="jsGrid" ref={gridRefLogHistoryreport} />
          </div>
        </section>

      </div>
    </main>
  );
}
export default AppLogHistory;