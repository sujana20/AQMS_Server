
import React, { Component, useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";
//import bcrypt from 'bcryptjs';
import CommonFunctions from "../utils/CommonFunctions";

const AddLicense = ({ handleAuthentication }) => {
  const $ = window.jQuery;   
  const currentUser = JSON.parse(sessionStorage.getItem('UserData'));
  const Licenceadd = async(event) => {   
    let form = document.querySelectorAll('#Lisenceform')[0];
    let files = document.getElementById('licencefile').files; 
    let jsonData=null;
    let selectedFile=files[0];
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
    }
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (e)=> {
        try {
          jsonData = JSON.parse(e.target.result);
          jsonData.StartDate=jsonData.StartDate.split("T")[0] + " 00:00:00";
          jsonData.EndDate=jsonData.EndDate.split("T")[0] + " 00:00:00";;
          var EncryptData=jsonData.LicenseKey+','+jsonData.StartDate+','+jsonData.EndDate+','+jsonData.NumberofDevices+','+jsonData.NumberofParameters+','+jsonData.MachineID+','+jsonData.Version+','+jsonData.Edition+','+jsonData.NumberofUsers+','+jsonData.IsActive;
          //var DataKey=await handleEncrypt(EncryptData); 
          var DataKey=EncryptData;
          jsonData.LicenseKey=DataKey;
          let isvalid=ValaidatelicenceFile(jsonData);
          if(!isvalid){
            return false;
          }

          let authHeader = await CommonFunctions.getAuthHeader();
          authHeader.Accept='application/json';
          authHeader["Content-Type"]='application/json';

          fetch(CommonFunctions.getWebApiUrl()+ 'api/Licence', {
            method: 'POST',
            headers: authHeader ,
            body: JSON.stringify(jsonData),
          }).then((response) => response.json())
            .then((responseJson) => {
              if (responseJson == "Licenceadd") {
                toast.success('Licence added successfully');
                Licencereset();
              } else if (responseJson == "Licenceexist") {
                toast.error('Licence already exist with given Licence Key. Please try with another Licence Key.');
              } else {
                toast.error('Unable to add the Licence. Please contact adminstrator');
              }
            }).catch((error) => toast.error('Unable to add the Licence. Please contact adminstrator'));
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(selectedFile);
    }
  }

 /*  const handleEncrypt = async (selectedfile) => {

    // Generate a salt (number of rounds determines the complexity)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the salt
    const encryptedPassword = await bcrypt.hash(selectedfile, salt);

    return encryptedPassword ;
  } */


// function AddLicense() {
//   const $ = window.jQuery;
//   const currentUser = JSON.parse(sessionStorage.getItem('UserData'));
//   const Licenceadd = function(){
//     let files = document.getElementById('licencefile').files;
//     let jsonData=null;
//     let selectedFile=files[0];
//     if (selectedFile) {
//       const reader = new FileReader();
//       reader.onload = function (e) {
//         try {
//           jsonData = JSON.parse(e.target.result);
//           let isvalid=ValaidatelicenceFile(jsonData);
//           if(!isvalid){
//             return false;
//           }
//           fetch(CommonFunctions.getWebApiUrl()+ 'api/Licence', {
//             method: 'POST',
//             headers: {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(jsonData),
//           }).then((response) => response.json())
//             .then((responseJson) => {
//               if (responseJson == "Licenceadd") {
//                 toast.success('Licence added successfully');
//                 Licencereset();
//               } else if (responseJson == "Licenceexist") {
//                 toast.error('Licence already exist with given Licence Key. Please try with another Licence Key.');
//               } else {
//                 toast.error('Unable to add the Licence. Please contact adminstrator');
//               }
//             }).catch((error) => toast.error('Unable to add the Licence. Please contact adminstrator'));
//         } catch (error) {
//           console.error('Error parsing JSON:', error);
//         }
//       };
//       reader.readAsText(selectedFile);
//     }
//   }




  















  const ValaidatelicenceFile=function(data){
    let isvalid=true;
    let files = document.getElementById('licencefile').value;
    if(files == ""){
      isvalid=false;
      toast.error('Please select file');
    }
    // else if(data.LicenseKey =="" || data.LicenseKey == undefined || data.StartDate == "" || data.StartDate==undefined || data.EndDate =="" || data.EndDate == undefined || data.NumberofDevices == "" || data.NumberofDevices==undefined || data.NumberofParameters =="" || data.NumberofParameters == undefined || data.NumberofUsers == "" || data.NumberofUsers==undefined || data.MachineID == "" || data.MachineID==undefined || data.IsActive == "" || data.IsActive==undefined){
    //   isvalid=false;
    //   toast.error('Please select valid json file or contact your adminstrator');
    // }
    return isvalid;
  }
  const Licencereset=function(){
    document.getElementById('licencefile').value="";
  }
  return (
    <main id="main" className="main" >
      <div className="container">
        <div className="pagetitle">
            <h1>Add Licence</h1>
        </div>
        <section className="section">
        <form id="Lisenceform" className="row" novalidate>
        <div className="row mx-0">
          <div className="col-md-3 mb-3">
                  <label for="username" className="form-label">Upload File:</label>
                  <input  type="file"  className="licencefile col-md-3 form-control" id="licencefile" accept=".json" required />
                </div>
                <div className="col-md-3 text-center mt-1">
                  <button className="btn btn-primary mt-4 mx-3" onClick={Licenceadd} type="button">Add Licence</button>
                  <button className="btn btn-primary mt-4" onClick={Licencereset} type="button">Reset</button>
                </div>
          </div>
        </form>
          
        </section>
      </div>
    </main>
  );
}
export default AddLicense;