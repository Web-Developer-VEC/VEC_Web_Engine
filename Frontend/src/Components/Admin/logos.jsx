import React from "react";
import insta from './Assets/insta-logo.png';
import linkedin from './Assets/linkedin-logo.png';
import youtube from './Assets/Youtube-logo.png';
import x from './Assets/X-logo.png';
import facebook from './Assets/facebook-logo.png';
import "./logos.css";

const logos = () => {
    return(
        <div className="logo-container">
            <img src={insta} alt="Insta" />
            <img src={linkedin} alt="linkedin" />
            <img className = "youtube" src={youtube} alt="youtube" />
            <img src={x} alt="twitter" />
            <img src={facebook} alt="facebook" />
        </div>
    );
};

export default logos;
