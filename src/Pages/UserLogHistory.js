import React, { Component, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import CommonFunctions from "../utils/CommonFunctions";

function UserLogHistory() {
  const $ = window.jQuery;
  const gridRefjsgridreport = useRef();
  const [ListUsersLog, setListUsersLog] = useState([]);
  const [ListUsers, setListUsers] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const GetUserLogLookup = async function () {
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ "api/LoginHistory", {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          let data1 = data.listUsersLoginHistory.map((x) => { x.logInTime = x.logInTime.replace('T', ' '); x.logOutTime = x.logOutTime!=null?x.logOutTime.replace('T', ' '):x.logOutTime; return x; });
          setListUsersLog(data1);
          setListUsers(data.listUsers);
          setTimeout(function () {
            $('#userid').SumoSelect({
              triggerChangeCombined: true, placeholder: 'Select user', floatWidth: 200, selectAll: true,
              search: true
            });
          }, 100);
        }
      }).catch((error) => toast.error('Unable to get the userlog list. Please contact adminstrator'));
  }

  const GetUserLog = async function (param) {
    let authHeader = await CommonFunctions.getAuthHeader();
    let UserName = $("#userid").val();
    if (UserName.length > 0) {
      UserName.join(',')
    }else{
      UserName="all"
    }
    let Fromdate = document.getElementById("fromdateid").value;
    let Todate = document.getElementById("todateid").value;
    if(param =='reset'){
      setTimeout(function () {
        $('.userid')[0].sumo.unSelectAll(); 
        $('.userid')[0].sumo.reload();
      }, 10);
      UserName='';
    }
  let params = new URLSearchParams({ UserName: UserName, Fromdate: Fromdate, Todate: Todate});
    fetch(CommonFunctions.getWebApiUrl()+ "api/LoginHistoryByFilter?"+ params, {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          let data1 = data.map((x) => { x.logInTime = x.logInTime.replace('T', ' '); x.logOutTime = x.logOutTime!=null?x.logOutTime.replace('T', ' '):x.logOutTime; return x; });
          setListUsersLog(data1);
        }
      }).catch((error) => toast.error('Unable to get the userlog list. Please contact adminstrator'));
  }
  useEffect(() => {
    initializeJsGrid();
  });
  useEffect(() => {
    GetUserLogLookup();
  }, [])
  const initializeJsGrid = function () {
    window.jQuery(gridRefjsgridreport.current).jsGrid({
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
        data: ListUsersLog,
        loadData: function (filter) {
          $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-lg border-50");
          $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm device-select-control");
          return $.grep(this.data, function (item) {
            return ((!filter.ipAddress || item.ipAddress.toUpperCase().indexOf(filter.ipAddress.toUpperCase()) >= 0)
            && (!filter.userID || item.userID === filter.userID)
              && (!filter.logInTime || item.logInTime.toUpperCase().indexOf(filter.logInTime.toUpperCase()) >= 0)
              && (!filter.logOutTime || item.logOutTime.toUpperCase().indexOf(filter.logOutTime.toUpperCase()) >= 0)
            );
          });
        }
      },
      fields: [
        { name: "serialNumber", title: "S. No.", width: 30, align: "center", sorting: false, 
          itemTemplate: function(_, item, index) { 
            var index = ListUsersLog.indexOf(item);
            return index + 1; 
          } 
        },
        { name: "userID", title: "User Name", type: "select", items: ListUsers, valueField: "id", textField: "userName", width: 150},
        { name: "ipAddress", title: "IP Address", type: "text", align: "center" },
        { name: "logInTime", title: "Login Time", type: "text", align: "center" },
        { name: "logOutTime", title: "Logout Time", type: "text", align: "center"},
        { type: "control", width: 100, editButton: false, deleteButton: false},
      ]
    });
  }
  
  return (
    <main id="main" className="main" >
      <div className="container">
        <div className="pagetitle">
            <h1>Users Log List</h1>
        </div>
        <section className="section">
          <div className="container">
            <div className="row mt-4">
              <div className="col-sm-12 col-md-3 col-lg-2 mb-2">
                <label className="form-label">User Name</label>
                <select className="form-select userid" id="userid" multiple="multiple">

                  {ListUsers.map((x, y) =>
                    <option value={x.id} key={y} >{x.userName}</option>
                  )}
                </select>
              </div>
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
              <div className="col-sm-12 col-md-3 col-lg-6 mt-4 mb-2 text-right pe-0">
                <button type="button" className="btn btn-primary mx-1 filter-btn" onClick={() => GetUserLog()}>Filter</button>
                <button type="button" className="btn btn-secondary mx-1 reset-btn" onClick={() => GetUserLog('reset')}>Reset</button>
              </div>
            </div>
          </div>
          <div className="container common-table-pd stationList-filter-bg">
            
              <div className="jsGrid" ref={gridRefjsgridreport} />
          </div>
        </section>

      </div>
    </main>
  );
}
export default UserLogHistory;