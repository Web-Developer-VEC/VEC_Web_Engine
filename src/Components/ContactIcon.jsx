import React, { useState } from 'react';
import './ContactIcon.css'; // Import CSS for styling

const ContactIcon = () => {
    const [showPopup, setShowPopup] = useState(false);
    

    const handleClick = () => {
        setShowPopup(!showPopup);
    };

    return (
        <div 
            className="contact-icon-container"
            
        >
            <img 
                src="/images/phone.png"
                alt="Contact Icon"
                className="contact-icon"
                onClick={handleClick}
            />
            
            {showPopup && (
                <div className="click-popup">
                  <h3 >Call us: <a href = 'tel:+044-26590758'>  +044-26590758 </a>  | <a href='tel=1234567899'>1234567899</a></h3>
                  <br></br>
                    <h3>For Admission: <a href='tel=+9123547550'>9123547550 </a>|<a href='+918939221120'> 8939221120</a></h3>
                    
                </div>
            )}
        </div>
    );
};

export default ContactIcon;
