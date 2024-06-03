import React, { useState, Component, useEffect } from "react";
//import { useNavigate, redirect } from "react-router-dom";
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import CommonFunctions from "../utils/CommonFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
//function Login() {

  
  //const Navigate = useNavigate();
  const Login = ({ handleAuthentication }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("rememberedUsername");
    const storedPassword = localStorage.getItem("rememberedPassword");
    if (storedUsername && storedPassword) {
      setUsername(storedUsername);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);


    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };

  const handleLogin = async(event) => {
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", username);
      localStorage.setItem("rememberedPassword", password);
    } else {
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    }
    let form = document.querySelectorAll('#Loginform')[0];
    let UserName = document.getElementById("UserName").value;
    let Password = document.getElementById("Password").value;
    //Password=await handleEncrypt(Password);
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
    } else {
      fetch(CommonFunctions.getWebApiUrl()+ 'api/Users/Login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UserName: UserName, Password: Password }),
      }).then((response) => response.json())
        .then((responseJson) => {
          if (responseJson != null) {
            sessionStorage.setItem("UserData", JSON.stringify(responseJson.users[0]));
            sessionStorage.setItem("Token",responseJson.token);
            var currentDate=new Date();
            currentDate.setMinutes(currentDate.getMinutes()+responseJson.tokenExpirationTime-1);
            sessionStorage.setItem("TokenExpTime",currentDate);
            window.location.href =process.env.REACT_APP_BASE_URL+ "/Dashboard";
          } else {
            toast.error('User name or password is incorrect. Please try again', {
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
        );
    
        }
  }

  const handleEncrypt = async (password) => {

    // Generate a salt (number of rounds determines the complexity)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the salt
    const encryptedPassword = await bcrypt.hash(password, salt);

    return encryptedPassword ;
  }
  const forgotPassword = () => {
    window.location.href =process.env.REACT_APP_BASE_URL+ "/ForgotPassword";
  };
  const redirectToReset = () => {
    window.location.href =process.env.REACT_APP_BASE_URL+ "/ResetPassword";
  };
  return (
    <main>
      <div className="col-sm-12 login-bg">

        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center">
          <div className="container">
            <div className="row d-flex align-items-center  justify-content-center">
              <div className="col-sm-12">
                <div className="d-flex justify-content-center pb-3">
                  <a href="index.html" className="d-flex align-items-center w-auto">
                    <img src="images/bluelogo.png" alt="" className="loginLogo"/>
                    {/*  <span className="d-none d-lg-block">NiceAdmin</span> */}
                  </a>
                </div>
              </div>
              <div className="card col-lg-7 col-11 col-md-11  gray-boxShadow">
                <div className="col-lg-6 col-md-6 m-auto">
                  <div className=" mb-3">
                    <div className="card-body">

                      <div className="pt-4 pb-2 login-header-title">
                        <h5 className="text-center pb-0 fs-3">Login to Your Account</h5>
                        <p className="text-center small">Enter your username & password to login</p>
                      </div>

                      <form className="row g-3 mt-3 mb-3" autoComplete="false" id="Loginform" novalidate>

                        <div className="col-12">
                          <label htmlFor="yourUsername" className="form-label login-label">Username</label>
                          <div className="input-group has-validation">
                            <span className="input-group-text d-none" id="inputGroupPrepend">@</span>
                            <input type="text" name="username" className="form-control border-50" id="UserName" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <div className="invalid-feedback">Please enter your username.</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <label htmlFor="yourPassword" className="form-label login-label">Password</label>
                          <div>
                          <input type={passwordVisible ? 'text' : 'password'} name="password" className="form-control border-end-0 border-50" id="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                          <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                          </span>
                          </div>
                          <div className="invalid-feedback">Please enter your password!</div>
                        </div>
                        <div className="col-6">
                          <div className="form-check login-checkbox">
                            <input className="form-check-input" type="checkbox" name="remember" value="true" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                            <label className="form-check-label" for="rememberMe">Remember me</label>
                          </div>
                        </div>
                        <div className="col-6 text-right">
                          <a className="form-check-label fnt-600" style={{cursor:"pointer"}} onClick={redirectToReset}>Reset Password</a>
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100 filter-btn" onClick={handleLogin} type="button">Login</button>
                        </div>
                        <div className="col-12 text-center">
                          <a className="form-check-label fnt-600" style={{cursor:"pointer"}} onClick={forgotPassword}>Forgot Password?</a>
                        </div>
                      </form>

                    </div>
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
export default Login;