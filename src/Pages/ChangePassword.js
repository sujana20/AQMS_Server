
import React from "react";
import { toast } from 'react-toastify';
//import bcrypt from 'bcryptjs';
import CommonFunctions from "../utils/CommonFunctions";
function ChangePassword() {

    const $ = window.jQuery;

    const Passwordvalidation = function ( NewPassword, ConfirmPassword) {
        let isvalid = true;
        let form = document.querySelectorAll('#ForgotPWD')[0];
        if (NewPassword == "") {
          form.classList.add('was-validated');
          isvalid = false;
        } else if (ConfirmPassword == "") {
          form.classList.add('was-validated');
          isvalid = false;
        } 
        return isvalid;
      }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let form = document.querySelectorAll('#ChangePWD')[0];
        let currentUrl = window.location.href;
        let urlsplitdata= currentUrl.split("?");
        let UserName = urlsplitdata[1];
        let Password=urlsplitdata[2];
        let NewPassword = document.getElementById("NewPassword").value;
        let ConfirmPassword = document.getElementById("confirmNewPassword").value;
        
        
        $("#lblbothmatch")[0].style.display="none"; 
        $("#lblPassword")[0].style.display="none";  
        if (NewPassword != ConfirmPassword) {            
            $("#lblbothmatch")[0].style.display="block";            
            return false;
        }
        if(NewPassword.length<8){
          $("#lblPassword")[0].style.display="block";
          return false;
        }
        let validation = Passwordvalidation(NewPassword, ConfirmPassword);
        if (!validation) {
            return false;
        }
      //  NewPassword = await handleEncrypt(NewPassword);
        fetch(CommonFunctions.getWebApiUrl() + 'api/Users/ChangePassword' , {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ UserName: UserName,Password:Password, NewPassword: NewPassword }),
          }).then((response) => response.json())
            .then((responseJson) => {
              if (responseJson.passwordReset != null) {
                toast.success('Password Changed');
                window.location.href =process.env.REACT_APP_BASE_URL+ "/Login";
              } else {
                toast.error('Given User Name or Password is not valid. Please try again', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                });
                return false;
              }
            }).catch((error) => 
              toast.error('User name or password is incorrect. Please try again')
              //console.log(error)
              );
        
    };
   /*  const handleEncrypt = async (password) => {

        // Generate a salt (number of rounds determines the complexity)
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
    
        // Hash the password with the salt
        const encryptedPassword = await bcrypt.hash(password, salt);
    
        return encryptedPassword ;
    }
 */
  return (
    <main>
      <div className="container">

        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

                <div className="d-flex justify-content-center py-3">
                  <a href="index.html" className="logo d-flex align-items-center w-auto">
                    <img src="images/logo.png" alt="" />
                    {/*  <span className="d-none d-lg-block">NiceAdmin</span> */}
                  </a>
                </div>

                <div className="card mb-3">

                  <div className="card-body">

                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">Change Password</h5>
                      {/* <p className="text-center small">Enter your username & password to login</p> */}
                    </div>

                    <form className="row g-3" autoComplete="false" id="ChangePWD" novalidate>

                      {/* <div className="col-12">
                        <label htmlFor="yourUsername" className="form-label">User Name</label>
                        <div className="input-group has-validation">
                          <span className="input-group-text" id="inputGroupPrepend">@</span>
                          <input type="text" name="username" className="form-control required" id="UserName" required />
                          <div className="invalid-feedback">Please enter your username.</div>
                        </div>
                      </div> */}

                      <div className="col-12">
                        <label htmlFor="yourNewPassword" className="form-label">New Password</label>
                        <input type="password" name="password" className="form-control" id="NewPassword" required />
                        <div className="invalid-feedback">Please enter your new password!</div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="yourConfirmNewPassword" className="form-label">Confirm New Password</label>
                        <input type="password" name="password" className="form-control" id="confirmNewPassword" required />
                        <div className="invalid-feedback">Please enter Confrim new password!</div>                        
                        <div id="lblbothmatch" style={{display:"none"}} className="invalid-feedback">New Password and Confirm Password should Match</div>
                        <div id="lblPassword" style={{display:"none"}} className="invalid-feedback">Password must contain 8 charecters</div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary w-100" onClick={handleSubmit} type="button">Submit</button>
                      </div>
                    </form>

                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
export default ChangePassword;