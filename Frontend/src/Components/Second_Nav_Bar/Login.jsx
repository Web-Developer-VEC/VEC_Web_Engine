import React from 'react';
import './Login.css';

const Login = () => {
    return (
        <div className="login-container">
            {/* Student Login Section */}
                <div className="card-container">
                    <div className="group student-login-container
                        bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] !text-accn dark:!text-drka
                        dark:bg-[color-mix(in_srgb,theme(colors.drkp)_90%,white)]"
                        onClick={() => {window.open("https://vecchennai.org/studentlogin/login.php?done=/studentlogin/")}}>
                        <div className="student-login-bg group-hover:bg-secd dark:group-hover:bg-drks
                            text-secd dark:text-drks"></div>
                        <h1 className="group-hover:text-text dark:group-hover:text-drkt">Are you a Student?</h1>
                        <h5 className="group-hover:text-text dark:group-hover:text-drkt">Click to access your login</h5>
                        {/*<div className="student-login-button">*/}

                        {/*<span className="top-key"></span>*/}
                        {/*<span className="text">Click Here</span>*/}
                        {/*<span className="bottom-key-1"></span>*/}
                        {/*<span className="bottom-key-2"></span>*/}
                        {/*</div>*/}
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
                <div className="group student-login-container
                    bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] !text-accn dark:!text-drka
                        dark:bg-[color-mix(in_srgb,theme(colors.drkp)_90%,white)]"
                    onClick={() => {window.open("https://vecchennai.org/stafflogin/login.php?done=/stafflogin/")}}>
                    <div className="student-login-bg group-hover:bg-secd dark:group-hover:bg-drks"></div>
                    {/* Background Overlay */}
                    <h1 className="group-hover:text-text dark:group-hover:text-drkt">Are you a Faculty?</h1>
                    <h5 className="group-hover:text-text dark:group-hover:text-drkt">Click to access your login</h5>
                    {/*<div className="faculty-login-button">*/}
                    {/*<span className="top-key"></span>*/}
                    {/*<span className="text">CLICK HERE</span>*/}
                    {/*<span className="bottom-key-1"></span>*/}
                    {/*<span className="bottom-key-2"></span>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    )
        ;
};

export default Login;
