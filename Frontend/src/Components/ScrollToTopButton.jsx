import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
        const [isHovered, setIsHovered] = useState(false);

    const toggleVisibility = () => {
        const windowScroll = window.scrollY || document.documentElement.scrollTop;
        const bodyScroll = document.body.scrollTop;
        if (windowScroll > 150 || bodyScroll > 150) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };
const buttonStyle = {
        position: 'fixed',
        bottom: '1.5rem', // bottom-6
        right: '1.5rem',  // right-6
        zIndex: 9999,
        padding: '0.75rem', // p-3
        borderRadius: '9999px', // rounded-full
        backgroundColor: isHovered ? '#fdcc03' : '#ffffffff', // yellow-400 on hover, gray-200 otherwise
        color:  isHovered ? '#000000ff' : '#ff8e3a', // text color
        boxShadow: isHovered
            ? '0 10px 25px rgba(0, 0, 0, 0.2)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
        transform: isHovered ? 'scale(1.10)' : 'scale(1)',
        animation: 'bounceSlow 2s infinite',
        cursor: 'pointer',
    };

    const scrollToTop = () => {
        // Scroll both to handle all pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        // Attach to window and body for universal detection
        window.addEventListener('scroll', toggleVisibility);
        document.body.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            document.body.removeEventListener('scroll', toggleVisibility);
        };
    }, []);


    
    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    style={buttonStyle}
                                onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Scroll to top"

                >
                    <FaArrowUp size={20} />
                </button>
            )}
        </>
    );
};

export default ScrollToTopButton;
