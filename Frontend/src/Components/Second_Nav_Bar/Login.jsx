import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      {/* Student Login Section */}
      <div className="card-container">
        <div className="student-login-container card">
          <div className="student-login-bg"></div>
          <h1>Are you a Student?</h1>
          <h5>Login Using this button</h5>
          <div className="student-login-button">
            <a className="fancy" href="https://vecchennai.org/studentlogin/login.php?done=/studentlogin/" target='__blank'>
              <span className="top-key"></span>
              <span className="text">Click Here</span>
              <span className="bottom-key-1"></span>
              <span className="bottom-key-2"></span>
            </a>
          </div>
          <div class="layers">
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>
            <div class="login-layer"></div>   
          </div>
        </div>
      </div>

      {/* Faculty Login Section */}
      {/* Faculty Login Section */}
        <div className="card-container">
          <div className="student-login-container card">
            <div className="student-login-bg"></div> {/* Background Overlay */}
            <h1>Are you a Faculty?</h1>
            <h5>Login Using this button</h5>
            <div className="faculty-login-button">
              <a className="fancy text-black" href="https://vecchennai.org/stafflogin/login.php?done=/stafflogin/" target='__blank'>
                <span className="top-key"></span>
                <span className="text">CLICK HERE</span>
                <span className="bottom-key-1"></span>
                <span className="bottom-key-2"></span>
              </a>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Login;
