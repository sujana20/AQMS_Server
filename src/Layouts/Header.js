import React from "react";
import { NavLink } from "react-router-dom";
import CommonFunctions from "../utils/CommonFunctions";
import { useState,useEffect } from "react";
import { toast } from 'react-toastify';
function Header() {
  const [LicenseMessage,setLicenseMessage]=useState("");
  const user = JSON.parse(sessionStorage.getItem('UserData'));
  useEffect(() => {
    
  const licenseInfo = sessionStorage.getItem('LicenseInformation');
  if(licenseInfo==null)
  {
    GetLicenseInfo();
  }
  else{
   // showLicenseMessage(JSON.parse(licenseInfo));
  }
    
  }, [])

  const GetLicenseInfo =async function () {
    let authHeader = await CommonFunctions.getAuthHeader();    
    fetch(CommonFunctions.getWebApiUrl() + "api/ValidateLicense", {
      method: 'GET',
      headers:authHeader,
    }).then((response) => response.json())
      .then((data) => {
       console.log(data);
       sessionStorage.setItem("LicenseInformation",JSON.stringify(data));      
      //showLicenseMessage(data);
      }).catch((error) => toast.error('Unable to get the license information. Please contact adminstrator'));

  }

  function showLicenseMessage(licenseInfo)
  {
    /*if(!licenseInfo.IsLicenseValid)
    {
      window.location.href =process.env.REACT_APP_BASE_URL+ "/License";
      
    }
    else{*/
      if(licenseInfo.LicenseType=="Free")
      {
        var licenseExpiryDate=new Date(licenseInfo.EndDate);
        const currentDate=new Date();
        if (licenseExpiryDate < currentDate) {
        window.location.href =process.env.REACT_APP_BASE_URL+ "/License";        
        }
        else{
        var daysUntilExpiration=30;
        setLicenseMessage(`This is a trail license mode. For testing and non-commercial use only`);
       }
      }
      else if(licenseInfo.LicenseType!="Free")
      {
        var licenseExpiryDate=new Date(licenseInfo.EndDate);
        const currentDate=new Date();
        let gracePeriodEndDate = new Date(licenseExpiryDate);
        gracePeriodEndDate=gracePeriodEndDate.setMonth(licenseExpiryDate.getMonth() + 1); 
      
        if (licenseExpiryDate < currentDate) {
          if(gracePeriodEndDate < currentDate)
          {
            setLicenseMessage("redirect");           
          }
          else{
            setLicenseMessage("The license has expired, but you are within the grace period. System will work for the next 1 month.");
          }

        }        
      }
  }



  const sidebartoggle = (e) => {
    document.querySelector('body').classList.toggle('toggle-sidebar')
  }
  const Signout = function () {
    fetch(CommonFunctions.getWebApiUrl()+'api/Users/Logout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ID: user.id }),
    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson) {
          sessionStorage.clear();
          window.location.href =process.env.REACT_APP_BASE_URL+ "/";
        }
      })
  }
  return (
    <header id="header" className="header fixed-top d-flex">
      {!sessionStorage.getItem('UserData') ? window.location.href = "/" : ""}
      <div className="d-flex">
      <NavLink to="/Dashboard" className="logo d-flex align-items-center">
          <img src="images/AI_airquality.png" alt="" />
          </NavLink>
       
        
      </div>
      
      { <div className="d-flex align-items-center justify-content-between">
        <div style={{ color: "white"}} id="LisenceMessage">{ LicenseMessage }</div>
      </div> }

      <nav className="header-nav">
        <i className="bi bi-list toggle-sidebar-btn" onClick={sidebartoggle}></i>
        
        <ul className="d-flex align-items-center">
            <li className="nav-item text-white">
            <a class="nav-link nav-profile d-flex align-items-center pe-0" href="#">
              <img src="images/admin-icon.png" alt="Profile" class="rounded-circle" />
              <span class="ps-2">{user.userName}</span>
            </a>
                {/* <img src="images/admin-icon.png" />
                <h6>{user.userName}</h6>
                <span>User</span> */}
            </li>
          {/* <li className="nav-item d-block d-lg-none">
            <a className="nav-link nav-icon search-bar-toggle " href="#">
              <i className="bi bi-search"></i>
            </a>
          </li> */}
          {/* <li className="nav-item dropdown pe-3">
            <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
              <span className="d-none d-md-block dropdown-toggle ps-2">{user.userName}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{user.userName}</h6>
                <span>User</span>
              </li>
             
            </ul>
          </li> */}
        </ul>
        <div className="d-flex align-items-center justify-content-between">
        <div className="Smart_head">Smart Sense -- Air Quality Monitoring</div>
        </div>
        <span className="text-right text-white logout-button">
          <a className="dropdown-item d-flex align-items-center justify-content-between" style={{cursor:"pointer"}} onClick={Signout}>
            <span className="ps-3">Logout</span>
            <img src="images/logout-icon.png" className="me-3" width='15' height='15' />
            {/* <i className="bi bi-box-arrow-right pe-3"></i> */}
          </a>
        </span>
        
      </nav>
    </header>
  )
            }
export default Header;