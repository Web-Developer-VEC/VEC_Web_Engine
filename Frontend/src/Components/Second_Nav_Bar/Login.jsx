import React from 'react';
import './Login.css';

const Login = () => {
    return (
        <div className="login-container place-content-center justify-items-center">
            {/* Student Login Section */}
            <a className="size-fit" href="https://vecchennai.org/studentlogin/login.php?done=/studentlogin/" target='__blank'>
                <div className="card-container">
                    <div className="group student-login-container min-h-[55vh] max-w-[30vw]
                        bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] !text-accn dark:!text-drka
                        dark:bg-[color-mix(in_srgb,theme(colors.drkp)_90%,white)]">
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
            </a>

            {/* Faculty Login Section */}
            {/* Faculty Login Section */}
            <a className="" href="https://vecchennai.org/stafflogin/login.php?done=/stafflogin/"
               target='__blank'>
                <div className="card-container">
                    <div className="group student-login-container min-h-[55vh] max-w-[30vw]
                        bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] !text-accn dark:!text-drka
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_90%,white)]">
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
            </a>
        </div>
    )
        ;
};

export default Login;
