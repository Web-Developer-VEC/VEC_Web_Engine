import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie-player';
import './ContactIcon.css'; 

const ContactIcon = ({ data }) => {
    const [showPopup, setShowPopup] = useState(false);
      useEffect(() => {
        const handleScroll = () => {
        const footer = document.querySelector('.footer');
        const contactIcon = document.querySelector('.contact-icon-container');
        const banner = document.querySelector('.landing-banner'); // 👈 select your banner section

        let shouldShow = true;

        // 👇 Hide if banner is still covering screen
        if (banner) {
            const bannerRect = banner.getBoundingClientRect();
            // If banner bottom is still below the top of the viewport, user is still in banner
            if (bannerRect.bottom > 600) {
                shouldShow = false;
            }
        }

        // 👇 Hide if footer is in view
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.top < window.innerHeight) {
            shouldShow = false;
            }
        }

        // Apply visibility
        if (contactIcon) {
            contactIcon.style.display = shouldShow ? 'block' : 'none';
        }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // run once on mount
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
                  animationData={require('../../Assets/Call.json')}
                  play
                  style={{ width: 80, height: 80 }} // Add cursor pointer for better UX
                />
            </div>
            {showPopup && (
                <div className="click-popup rounded-xl font-popp">
                    <p className='bg-secd dark:bg-drks'>📞 Call us: 
                        <a href={`tel:${data?.phone_number}`} className='font-popp'> {data?.phone_number} </a>  
                        {/* <a href="tel:+1234567899" className='font-popp'>1234567899</a> */}
                    </p>
                    <p className='bg-secd dark:bg-drks'>🎓 For Admission:  
                        <a href={`tel:${data?.addmission_contact[0]}`} className='font-popp'> {data?.addmission_contact[0]} </a> | 
                        <a href={`tel:${data?.addmission_contact[1]}`} className='font-popp'> {data?.addmission_contact[1]} </a>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ContactIcon;
