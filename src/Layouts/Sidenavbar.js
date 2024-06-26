import React, { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import Roles from "../config/Roles";
//import $ from 'jquery';

function Sidenavbar() {
  
  

  let Params = useParams();
  console.log(Params);
  const [permissions, setpermisssions] = useState([]);

  const NavbarActive = function(id){ 
   //alert('hi');onClick={() => NavbarActive(x.value + "-SubPanel")}
  }

  const getUserRole = function () {
    const currentUser = JSON.parse(sessionStorage.getItem('UserData'));

    if (currentUser.role.toUpperCase() == window.UserRoles[0].ADMIN.toUpperCase()) {
      //document.getElementById("Configuration-Panel").style.display="block";
      //document.getElementById("User-subpannel").style.display="block";
      //document.getElementById("Admin-Panel").style.display="block";
    }
    else if (currentUser.role.toUpperCase() == window.UserRoles[0].GUEST.toUpperCase()) {
      //document.getElementById("Configuration-Panel").style.display="none";
      //document.getElementById("User-subpannel").style.display="none";
      //document.getElementById("Admin-Panel").style.display="none";
    }

    setpermisssions(currentUser.permissions.split(","));
  }
  useEffect(() => {
    getUserRole();
    NavbarActive();
  }, []);

  const ispermission = (param) => {
   // let parents = window.nodes.filter(x => x.value == param.value);
    const parents = window.nodes.filter(x => x.value === param.value);
  if (parents.length > 0) {
  if(!Array.isArray(parents[0].children)){
    return true;
  }
    return parents[0].children.some((child) => permissions.includes(child.value));
  }
  return false;
    /* if (parents[0]?.children != false) {
      
      const matchedObjects = parents[0]?.children.filter((obj) => permissions.includes(obj.value));
      if (matchedObjects.length > 0) {
        return true;
      }else{
        return false;
      }
    } */
  }

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        {permissions.length > 0 && (
          window.nodes.map((x, y) =>

            <li className="nav-item" id={x.label + "-Panel"}>
              {ispermission(x) && (
                x.children == false && (
                  <NavLink to={x.url} className="nav-link animation-forwards animate-delay-1" >
                    <img src={x.img} className="sideIcon-img"></img>
                    <span>{x.label}</span>
                  </NavLink>
                )
              )}
               {ispermission(x) && (
              x.children.length > 0 && (
                <a className="nav-link collapsed animation-forwards animate-delay-2" data-bs-target={"#" + x.label + "-nav"} data-bs-toggle="collapse" href="#">
                  {/* <i className={x.icon}></i> */}
                  <img src={x.img} className="sideIcon-img"></img>
                  <span>{x.label}</span><i className={x.expandicon}></i>
                </a>
              )
              )}

              {x.children.length > 0 && (

                <ul id={x.label + "-nav"} className="nav-content collapse" data-bs-parent="#sidebar-nav">
                  {x.children.map((x, y) =>
                    permissions.indexOf(x.value) >= 0 && (
                      <li id={x.value + "-SubPanel"} >
                        <NavLink to={x.url} className="animation-forwards animate-delay-1" >
                          <i className={x.icon}></i>
                          <span>{x.label}</span>
                        </NavLink>
                      </li>
                    )
                  )}
                </ul>
              )}
            </li>
          )
        )}











        {/* <li className="nav-item" id={x.label + "-Panel"}>
            <a className="nav-link collapsed animation-forwards animate-delay-2" data-bs-target={"#"+x.label +"-nav"} data-bs-toggle="collapse" href="#">
              <i className={x.icon}></i><span>{x.label}</span><i className={x.expandicon}></i>
            </a>               
            <ul id={x.label +"-nav"} className="nav-content collapse" data-bs-parent="#sidebar-nav">                        
              {x.children.map((x,y)=>                
                permissions.indexOf(x.value)>=0 && (                  
                  <li id={x.value + "-SubPanel"}>
                    <NavLink to={x.url} className="animation-forwards animate-delay-1" >
                      <i className={x.icon}></i>
                      <span>{x.label}</span>
                    </NavLink>
                  </li> 
                )
              )}
            </ul>
          </li> */}




        {/* <li className="nav-item">
          <NavLink to="/Dashboard" className="nav-link animation-forwards animate-delay-1" >
            <i className="bi bi-grid"></i>
            <span>Dashboard</span>
          </NavLink >
        </li>
            <li className="nav-item" id="Configuration-Panel">
              <a className="nav-link collapsed animation-forwards animate-delay-2" data-bs-target="#configuration-nav" data-bs-toggle="collapse" href="#">
                <i className="bi bi-menu-button-wide"></i><span>Configuration</span><i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul id="configuration-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                <li>
              <NavLink to="/AddStation" className="animation-forwards animate-delay-1" >
                <i className="bi bi-circle"></i>
                <span>Stations</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/AddDevice" className="animation-forwards animate-delay-2" >
                <i className="bi bi-circle"></i>
                <span>Devices</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/AddParameter" className="animation-forwards animate-delay-3" >
                <i className="bi bi-circle"></i>
                <span>Parameters</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/GroupingParameter" className="animation-forwards animate-delay-4" >
                <i className="bi bi-circle"></i>
                <span>Grouping</span>
              </NavLink >
            </li>
              </ul>
            </li>       
        <li className="nav-item" id="Admin-Pannel">
          <a className="nav-link collapsed animation-forwards animate-delay-2" data-bs-target="#admin-nav" data-bs-toggle="collapse" href="#">
            <i className="bi bi-menu-button-wide"></i><span>Admin</span><i className="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul id="admin-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li id="User-subpannel">
              <NavLink to="/Adduser" className="animation-forwards animate-delay-1" >
                <i className="bi bi-circle"></i>
                <span>Users</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/UserLogHistory" className="animation-forwards animate-delay-2" >
                <i className="bi bi-circle"></i>
                <span>Users Log</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/AppLogHistory" className="animation-forwards animate-delay-3" >
                <i className="bi bi-circle"></i>
                <span>Application Log</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/UserGroups" className="animation-forwards animate-delay-3" >
                <i className="bi bi-circle"></i>
                <span>User Group</span>
              </NavLink >
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <a className="nav-link collapsed animation-forwards animate-delay-4" data-bs-target="#report-nav" data-bs-toggle="collapse" href="#">
            <i className="bi bi-bar-chart"></i><span>Reports</span><i className="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul id="report-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
            <li>
              <NavLink to="/StatisticalReport" className="nav-item animation-forwards animate-delay-1" >
                <i className="bi bi-circle"></i>
                <span>Statistical Reports</span>
              </NavLink >
            </li>
            <li>
              <NavLink to="/PredefinedCharts" className="nav-item animation-forwards animate-delay-2" >
                <i className="bi bi-circle"></i>
                <span>Pre Defined Charts</span>
              </NavLink >
            </li>
             <li>
              <NavLink to="/DetailedAnalysisReports" className="nav-item animation-forwards animate-delay-3" >
                <i className="bi bi-circle"></i>
                <span>Detailed Analysis Reports</span>
              </NavLink >
            </li>
            <li>
          <NavLink to="/DataProcessing" className="nav-item animation-forwards animate-delay-4" >
            <i className="bi bi-circle"></i>
            <span>Data Validations</span>
          </NavLink >
        </li>
        <li>
          <NavLink to="/LiveData" className="nav-item animation-forwards animate-delay-5" >
            <i className="bi bi-circle"></i>
            <span>Live Data</span>
          </NavLink >
        </li>
        <li>
          <NavLink to="/HistoricalData" className="nav-item animation-forwards animate-delay-6" >
            <i className="bi bi-circle"></i>
            <span>Data Browsing</span>
          </NavLink >
        </li>
          </ul>
        </li> */}
      </ul>
    </aside>
  );
}
export default Sidenavbar;