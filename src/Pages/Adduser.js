
import React, { Component, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";
import CommonFunctions from "../utils/CommonFunctions";
// import bcrypt from '../../node_modules/bcryptjs/dist/bcrypt';
import bcrypt from 'bcryptjs';
function Adduser() {
  const $ = window.jQuery;
  const gridRefjsgridreport = useRef();
  const [ListUsers, setListUsers] = useState([]);
  const [UserList, setUserList] = useState(true);
  const [UserId, setUserId] = useState(0);
  const [UserPwd, setUserPwd] = useState(null);
  const [Notification, setNotification] = useState(true);
  
  const [ListUserGroup, setListUserGroup] = useState([]);
  const Useraddvalidation = function (UserName, UserEmail,Password, UserGroup, UserRole) {
    let isvalid = true;
    let form = document.querySelectorAll('#AddUserform')[0];
    let validmail=validateEmail(UserEmail);
    if (UserName == "") {
      //toast.warning('Please enter user name');
      form.classList.add('was-validated');
      isvalid = false;
    } else if (UserEmail == "" || !validmail) {
      //toast.warning('Please enter user email');
      form.classList.add('was-validated');
      isvalid = false;
    }
    else if (Password == "") {
      form.classList.add('was-validated');
      isvalid = false;
    } 
    else if (Password.length < 8) {
      form.classList.add('was-validated');
      $('#lblsignpwd').css("display", "block");
      isvalid = false;
    } else if (UserGroup == "") {
      //toast.error('Please select user group');
      form.classList.add('was-validated');
      isvalid = false;
    }else if (UserRole == "") {
      //toast.warning('Please select user role');
      form.classList.add('was-validated');
      isvalid = false;
    }
    return isvalid;
  }
  const validateEmail = (email) => {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  const UserEditvalidation = function ( UserEmail, UserGroup, UserRole) {
    let isvalid = true;
    let form = document.querySelectorAll('#AddUserform')[0];
    let validmail=validateEmail(UserEmail);
    if (UserEmail == "" || !validmail) {
      //toast.warning('Please enter user email');
      form.classList.add('was-validated');
      isvalid = false;
    }
    else if (UserGroup == "") {
      //toast.error('Please select user group');
      form.classList.add('was-validated');
      isvalid = false;
    }else if (UserRole == "") {
      //toast.warning('Please select user role');
      form.classList.add('was-validated');
      isvalid = false;
    }
    return isvalid;
  }
  const Useradd = async(event) => {
    let UserName = document.getElementById("username").value;
    let UserEmail = document.getElementById("useremail").value;
    let Password = document.getElementById("password").value;
    let UserGroup=document.getElementById("usergroup").value;
    let UserRole = document.getElementById("userrole").value;
    
    //let encryptPassword=await handleEncrypt(Password);
    let encryptPassword=Password;
    let validation = Useraddvalidation(UserName, UserEmail,encryptPassword, UserGroup, UserRole);
    if (!validation) {
      return false;
    }
    let authHeader = await CommonFunctions.getAuthHeader();
    authHeader.Accept='application/json';
    authHeader["Content-Type"]='application/json';
    await  fetch(CommonFunctions.getWebApiUrl()+ 'api/Users/' + Notification, {
      method: 'POST',
      headers: authHeader ,
      body: JSON.stringify({ UserName: UserName, UserEmail: UserEmail,Password: encryptPassword, GroupID: UserGroup, Role: UserRole }),
    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson == "useradd") {
          toast.success('User added successfully');
          GetUser();
          setUserList(true);
        } else if (responseJson == "userexist") {
          toast.error('User already exist with given email. Please try with another email.');
        } else {
          toast.error('Unable to add the user. Please contact adminstrator');
        }
      }).catch((error) => toast.error('Unable to add the user. Please contact adminstrator'));
  }
  const handleEncrypt = async (password) => {

    // Generate a salt (number of rounds determines the complexity)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the salt
    const encryptedPassword = await bcrypt.hash(password, salt);

    return encryptedPassword ;
  }
  const EditUser = function (param) {
    setUserList(false);
    setUserId(param.id);
    setUserPwd(param.password);
    setTimeout(() => {
      //document.getElementById("username").value = param.userName;
      document.getElementById("useremail").value = param.userEmail;
      //document.getElementById("password").value = param.password;
      document.getElementById("usergroup").value = param.groupID;
      document.getElementById("userrole").value = param.role;
      $('#password').addClass("disable");     
    }, 10);
   
  }

  const UpdateUser=async(event) => {
    
    //let UserName = document.getElementById("username").value;
    let UserEmail = document.getElementById("useremail").value;
    //let Password = document.getElementById("password").value;
    let UserGroup=document.getElementById("usergroup").value;
    let UserRole = document.getElementById("userrole").value;
    //let encryptPassword=Password;
    // if(Password != UserPwd){
    //   encryptPassword=await handleEncrypt(Password);
    // }
    let validation = UserEditvalidation( UserEmail, UserGroup, UserRole);
    if (!validation) {
      return false;
    }
    let authHeader = await CommonFunctions.getAuthHeader();
    authHeader.Accept='application/json';
    authHeader["Content-Type"]='application/json';
    await fetch(CommonFunctions.getWebApiUrl()+ 'api/Users/' + UserId, {
      method: 'PUT',
      headers: authHeader ,
      body: JSON.stringify({ UserEmail: UserEmail,GroupID: UserGroup, Role: UserRole,ID:UserId }),
    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson == 1) {
          toast.success('User Updated successfully');
          GetUser();
          setUserList(true);
        }else if (responseJson == 2) {
          toast.error('User already exist with given email. Please try with another email.');
        } else {
          toast.error('Unable to update the user. Please contact adminstrator');
        }
      }).catch((error) => toast.error('Unable to update the user. Please contact adminstrator'));
  }

  const DeleteUser = function (item) {
    Swal.fire({
      title: "Are you sure?",
      text: ("You want to delete this User !"),
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5cb85c",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    })
      .then(async function (isConfirm) {
        let authHeader = await CommonFunctions.getAuthHeader();
        if (isConfirm.isConfirmed) {
          let id = item.id;
          await  fetch(CommonFunctions.getWebApiUrl()+ 'api/Users/' + id, {
            method: 'DELETE',
            headers: authHeader ,
          }).then((response) => response.json())
            .then((responseJson) => {
              if (responseJson == 1) {
                toast.success('User deleted successfully')
                GetUser();
              } else {
                toast.error('Unable to delete user. Please contact adminstrator');
              }
            }).catch((error) => toast.error('Unable to delete user. Please contact adminstrator'));
        }
      });
  }
  const GetUser = async function () {
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ "api/Users", {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          setListUsers(data);
        }
      }).catch((error) => toast.error('Unable to get the users list. Please contact adminstrator'));
  }
  const GetGroupDetails = async function () {
    let authHeader = await CommonFunctions.getAuthHeader();
    fetch(CommonFunctions.getWebApiUrl()+ "api/UsersGroup", {
      method: 'GET',
      headers: authHeader ,
    }).then((response) => response.json())
      .then((data) => {
        if (data) {
          setListUserGroup(data);
        }
      }).catch((error) => toast.error('Unable to get the users list. Please contact adminstrator'));
  }
  useEffect(() => {
    initializeJsGrid();
  });
  useEffect(() => {
    GetUser();
    GetGroupDetails();
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
        data: ListUsers,
        loadData: function (filter) {
          $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-lg station-width-control");
          $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
          return $.grep(this.data, function (item) {
            return ((!filter.userName || item.userName.toUpperCase().indexOf(filter.userName.toUpperCase()) >= 0)
              && (!filter.userEmail || item.userEmail.toUpperCase().indexOf(filter.userEmail.toUpperCase()) >= 0)
              // && (!filter.password || item.password.toUpperCase().indexOf(filter.password.toUpperCase()) >= 0)
              && (!filter.role || item.role.toUpperCase().indexOf(filter.role.toUpperCase()) >= 0)
            );
          });
        }
      },
      fields: [
        { name: "serialNumber", title: "S. No.", width: 30, align: "center", sorting: false, 
          itemTemplate: function(_, item, index) { 
            var index = ListUsers.indexOf(item);
            return index + 1; 
          } 
        },
        { name: "userName", title: "User Name", type: "text" },
        { name: "userEmail", title: "User Email", type: "text" },
        // { name: "password", title: "Password", type: "text" },
        { name: "role", title: "Role", type: "text", },
        {
          type: "control", width: 100, editButton: false, deleteButton: false,
          itemTemplate: function (value, item) {
            // var $result = gridRefjsgrid.current.fields.control.prototype.itemTemplate.apply(this, arguments);

            var $customEditButton = $("<button>").attr({ class: "customGridEditbutton jsgrid-button jsgrid-edit-button" })
              .click(function (e) {
                
                EditUser(item);

                /* alert("ID: " + item.id); */
                e.stopPropagation();
              });

            var $customDeleteButton = $("<button>").attr({ class: "customGridDeletebutton jsgrid-button jsgrid-delete-button" })
              .click(function (e) {
                DeleteUser(item);
                e.stopPropagation();
              });

            return $("<div>").append($customEditButton).append($customDeleteButton);
            //return $result.add($customButton);
          }
        },
      ]
    });
  }
  const Adduserchange = function (param) {
    if (param) {
      setUserList(true);
    } else {
      setUserList(false);
      
      setUserId(0);
      $('#password').removeClass("disable");
    }
  }
  return (
    <main id="main" className="main" >
      <div className="container">
        <div className="pagetitle">
          {!UserList && UserId==0 && (
            <h1>Add User</h1>
          )}
           {!UserList && UserId!=0 && (
            <h1>Update User</h1>
          )}
          {UserList && (
            <h1>Users List</h1>
          )}
        </div>
        <section className="section">
          <div className="container common-table-pd stationList-filter-bg ">
            <div className="me-2 mb-2 col-sm-12 text-right">
              {UserList && (
                <span className="operation_class mx-2" onClick={() => Adduserchange()}><img src="images/full-plusicon.png" width="25" height="25" /> <span>Create New User</span></span>
              )}
              {!UserList && (
                <span className="operation_class mx-2" onClick={() => Adduserchange('gridlist')}><img src="images/listingicon.png" width="25" height="25" /> <span>View All Users</span></span>
              )}
            </div>
            {!UserList && (
              <form id="AddUserform" className="row field-props">
                {!UserList && UserId==0 && (
                <div className="col-md-12 mb-3">
                    <label for="username" className="form-label">User Name:</label>
                    <input type="text" className="form-control" id="username" placeholder="Enter user name" required />
                    <div class="invalid-feedback">Please enter user name.</div>
                  </div>
                )}
                <div className="col-md-12 mb-3">
                  <label for="useremail" className="form-label">User Email:</label>
                  <input type="email" className="form-control" id="useremail" placeholder="Enter user email" required />
                  <div class="invalid-feedback">Please enter valid user email.</div>
                </div>
                {!UserList && UserId==0 && (
                  <div className="col-md-12 mb-3">
                    <label for="password" className="form-label">Password:</label>
                    <input type="password" className="form-control" id="password" placeholder="Enter Password"  />
                    {/* <div class="invalid-feedback">Please enter password.</div> */}
                    <div class="invalid-feedback" id="lblsignpwd" style={{display:"none"}}>Password must contain minimum 8 characters</div>
                  </div>
                )}
                
                <div className="col-md-12 mb-3">
                  <label for="Group" className="form-label">User Group:</label>
                  <select className="form-select" id="usergroup" required>
                    <option value="" selected>None</option>
                    {ListUserGroup.map((x, y) =>
                      <option value={x.id} key={y}>{x.groupName}</option>
                    )}
                  </select>
                  <div class="invalid-feedback">Please select group name.</div>                  
                </div>
                <div className="col-md-12 mb-3">
                  <label for="userrole" className="form-label">User Role:</label>
                  <select className="form-select" id="userrole" required>
                    <option value="" selected>select user role</option>
                    <option value="Admin">Admin</option>
                    <option value="Guest">Guest</option>
                   {/*  <option value="dataentry">Data Entry</option> */}
                  </select>
                  <div class="invalid-feedback">Please select user role.</div>
                </div>
                {!UserList && UserId==0 && (
                  <div className="col-md-12 mb-3">
                    <label for="Notification" className="form-label">Notification: </label>
                    <div className="form-check d-inline-block form-switch ms-3">
                      <input className="form-check-input font-15" type="checkbox" role="switch" id="Notification" onChange={(e) => setNotification(e.target.checked)} defaultChecked={Notification} />
                      {Notification && (
                        <label className="form-check-label" for="flexSwitchCheckChecked">On</label>
                      )}
                      {!Notification && (
                        <label className="form-check-label" for="flexSwitchCheckChecked">Off</label>
                      )}
                    </div>
                  </div>
                )}
                <div className="col-md-12 text-center">
                {!UserList && UserId==0 && (
                  <button className="btn btn-primary download-btn" onClick={Useradd} type="button">Add User</button>
                  )}
                  {!UserList && UserId!=0 && (
                      <button className="btn btn-primary download-btn" onClick={UpdateUser} type="button">Update User</button>
                  )}
                </div>
              </form>
            )}
            {UserList && (
              <div className="jsGrid" ref={gridRefjsgridreport} />
            )}
          </div>

        </section>

      </div>
    </main>
  );
}
export default Adduser;