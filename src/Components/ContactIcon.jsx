import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie-player';
import './ContactIcon.css'; 

const ContactIcon = () => {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.querySelector('.footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                const contactIcon = document.querySelector('.contact-icon-container');

                if (footerRect.top < window.innerHeight) {
                    contactIcon.style.display = 'none'; // Hide the contact icon when the footer is in view
                } else {
                    contactIcon.style.display = 'block'; // Show the contact icon otherwise
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClick = () => {
        setShowPopup(!showPopup);
    };

    return (
        <div className="contact-icon-container">
            <div onClick={handleClick}> {/* Click event added here */}
                <Lottie
                  loop
                  animationData={require('./Assets/Call.json')}
                  play
                  style={{ width: 80, height: 80, cursor: 'pointer' }} // Add cursor pointer for better UX
                />
            </div>
            {showPopup && (
                <div className="click-popup font-popp">
                    <p>Call us: 
                        <a href="tel:+044-26590758" className='font-popp'> +044-26590758 </a> | 
                        <a href="tel:+1234567899" className='font-popp'>1234567899</a>
                    </p>
                    <p>For Admission:  
                        <a href="tel:+9123547550" className='font-popp'> 9123547550</a> | 
                        <a href="tel:+918939221120" className='font-popp'>8939221120</a>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ContactIcon;
