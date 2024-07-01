
import React from "react";
import { toast } from 'react-toastify';
//import bcrypt from 'bcryptjs';
import CommonFunctions from "../utils/CommonFunctions";
function ResetPassword() {

    //const [newPassword, setNewPassword] = useState('');
    //const [confirmPassword, setConfirmPassword] = useState('');
    const $ = window.jQuery;

    const Passwordvalidation = function (UserName, Password, NewPassword, ConfirmPassword) {
        let isvalid = true;
        let form = document.querySelectorAll('#ForgotPWD')[0];
        if (UserName == "") {
            form.classList.add('was-validated');
            isvalid = false;
        } else if (Password == "") {
            form.classList.add('was-validated');
            isvalid = false;
        } else if (NewPassword == "") {
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
        
        let form = document.querySelectorAll('#ForgotPWD')[0];
        let UserName = document.getElementById("UserName").value;
        let Password = document.getElementById("Password").value;
        let NewPassword = document.getElementById("NewPassword").value;
        let ConfirmPassword = document.getElementById("confirmNewPassword").value;
        
        //Password=await handleEncrypt(Password);
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

        let validation = Passwordvalidation(UserName, Password, NewPassword, ConfirmPassword);
        if (!validation) {
            return false;
        }
        //NewPassword=await handleEncrypt(NewPassword);
        fetch(CommonFunctions.getWebApiUrl() + 'api/Users/ResetPassword', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            //body: JSON.stringify({ UserName: UserName, Password: Password, NewPassword: NewPassword }),
            body: JSON.stringify({ UserName: UserName, Password: Password, NewPassword: NewPassword }),
          }).then((response) => response.json())
            .then((responseJson) => {
              if (responseJson.passwordReset != null) {
                toast.success('Password Reset Completed');
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
    /* const handleEncrypt = async (password) => {

        // Generate a salt (number of rounds determines the complexity)
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
    
        // Hash the password with the salt
        const encryptedPassword = await bcrypt.hash(password, salt);
    
        return encryptedPassword ;
    } */

  return (
    <main>
      <div className="col-sm-12 login-bg">

        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center">
          <div className="container">
            <div className="row d-flex align-items-center justify-content-center">
              <div className="col-sm-12">
                <div className="d-flex justify-content-center pb-3">
                  <a href="index.html" className="d-flex align-items-center w-auto">
                    <img src="images/bluelogo.png" alt="" className="loginLogo" />
                    {/*  <span className="d-none d-lg-block">NiceAdmin</span> */}
                  </a>
                </div>
              </div>
              <div className="card col-lg-7 col-11 col-md-11  gray-boxShadow">
                <div className="col-lg-6 col-md-6 m-auto">
                  <div className="card-body">

                    <div className="pt-4 pb-2 login-header-title">
                      <h5 className="text-center pb-0 fs-3">Reset Password</h5>
                      {/* <p className="text-center small">Enter your username & password to login</p> */}
                    </div>

                    <form className="row g-3 mt-3 mb-3" autoComplete="false" id="ForgotPWD" novalidate>

                      <div className="col-12">
                        <label htmlFor="yourUsername" className="form-label login-label">User Name</label>
                        <div className="input-group has-validation">
                          <span className="input-group-text d-none" id="inputGroupPrepend">@</span>
                          <input type="text" name="username" className="form-control border-50 required" id="UserName" required />
                          <div className="invalid-feedback">Please enter your username.</div>
                        </div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="yourPassword" className="form-label login-label">Password</label>
                        <input type="password" name="password" className="form-control border-50" id="Password" required />
                        <div className="invalid-feedback">Please enter your password!</div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="yourNewPassword" className="form-label login-label">New Password</label>
                        <input type="password" name="password" className="form-control border-50" id="NewPassword" required />
                        <div className="invalid-feedback">Please enter your new password!</div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="yourConfirmNewPassword" className="form-label login-label">Confirm New Password</label>
                        <input type="password" name="password" className="form-control border-50" id="confirmNewPassword" required />
                        <div className="invalid-feedback">Please enter Confrim new password!</div>                        
                        <div id="lblbothmatch" style={{display:"none"}} className="invalid-feedback">New Password and Confirm Password should Match</div>
                        <div id="lblPassword" style={{display:"none"}} className="invalid-feedback">Password must contain 8 charecters</div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary w-100 filter-btn" onClick={handleSubmit} type="button">Reset</button>
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
export default ResetPassword;