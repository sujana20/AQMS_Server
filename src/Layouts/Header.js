import React from "react";
import { NavLink } from "react-router-dom";
import CommonFunctions from "../utils/CommonFunctions";

function Header() {
  const user = JSON.parse(sessionStorage.getItem('UserData'));

  const Lisence = JSON.parse(sessionStorage.getItem('LisenceInformation'));
  var startdate=Lisence.startDate.split("T")[0];
  var enddate=Lisence.endDate.split("T")[0];
  var LisenceValidity;
  if(startdate<=enddate){
    LisenceValidity="Application valid till "+ startdate + " to "+ enddate + " Please contact Adminstrator";
  }
  else{
    LisenceValidity="License Expired.! Please contact Adminstrator";
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
    <header id="header" className="header fixed-top d-flex align-items-center">
      {!sessionStorage.getItem('UserData') ? window.location.href = "/" : ""}
      <div className="d-flex align-items-center justify-content-between">
      <NavLink to="/Dashboard" className="logo d-flex align-items-center">
          <img src="images/logo.png" alt="" />
          </NavLink>
        <i className="bi bi-list toggle-sidebar-btn" onClick={sidebartoggle}></i>
        
      </div>

      {/* <div className="d-flex align-items-center justify-content-between">
        <marquee style={{ color: "white"}} id="LisenceMessage">{ LisenceValidity }</marquee>
      </div> */}
     {/*  <div className="col-lg-4" style={{ flex:-1, textAlign:"center",marginLeft:"50px"}}>
        <marquee class="scrollmarque" id="LisenceMessage">{ LisenceValidity }</marquee>
      </div> */}

     {/*  <div className="search-bar">
        <form className="search-form d-flex align-items-center" method="POST" action="#">
          <input type="text" name="query" placeholder="Search" title="Enter search keyword" />
          <button type="submit" title="Search"><i className="bi bi-search"></i></button>
        </form>
      </div> */}

      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">

          <li className="nav-item d-block d-lg-none">
            <a className="nav-link nav-icon search-bar-toggle " href="#">
              <i className="bi bi-search"></i>
            </a>
          </li>
          <li className="nav-item dropdown pe-3">
            <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
              <span className="d-none d-md-block dropdown-toggle ps-2">{user.userName}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{user.userName}</h6>
                <span>User</span>
              </li>
             {/*  <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="users-profile.html">
                  <i className="bi bi-person"></i>
                  <span>My Profile</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="users-profile.html">
                  <i className="bi bi-gear"></i>
                  <span>Account Settings</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="pages-faq.html">
                  <i className="bi bi-question-circle"></i>
                  <span>Need Help?</span>
                </a>
              </li> */}
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" style={{cursor:"pointer"}} onClick={Signout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  )
}
export default Header;