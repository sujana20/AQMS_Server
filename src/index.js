import React,{Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import  'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap-icons/bootstrap-icons.css'
import 'font-awesome/css/font-awesome.min.css';
//import './style.css';
import './common.css';
import './headerstyle.css';
import './sidebar.css';
import './stylenew.css';
import './responsive.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router basename={process.env.REACT_APP_BASE_URL}>

    <ToastContainer />

    <App />

  </Router>
    // <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

//test