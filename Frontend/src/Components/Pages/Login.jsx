import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      {/* Student Login Section */}
      <div className="student-login-container">
        <h1>Are you a Student?</h1>
        <h5>Login Using this button</h5>
        <div className="student-login-button-wrapper">
          <div className="student-login-button">
            <a className="fancy" href="https://vecchennai.org/studentlogin/login.php?done=/studentlogin/">
              <span className="top-key"></span>
              <span className="text">Click Here</span>
              <span className="bottom-key-1"></span>
              <span className="bottom-key-2"></span>
            </a>
          </div>
        </div>
      </div>

      {/* Faculty Login Section */}
      <div className="faculty-login-container">
        <h1>Are you a Faculty?</h1>
        <h5>Login Using this button</h5>
        <div className="faculty-login-button">
          <a className="fancy" href="https://vecchennai.org/stafflogin/login.php?done=/stafflogin/">
            <span className="top-key"></span>
            <span className="text">CLICK HERE</span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
