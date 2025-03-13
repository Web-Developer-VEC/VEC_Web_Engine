import React, { useEffect, useRef } from 'react';
import Vide from '../../Assets/stock.mp4';

const Transportvideo = () => {
    const videoRef = useRef(null);

    const debounce = (func, wait = 100) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const handleScroll = debounce(() => {
        const pos = window.scrollY;
        const scrollThreshold = 300;

        if (videoRef.current) {
            if (pos > scrollThreshold) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    }, 100);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }}>
            <video
                style={{ width: '120%', height: '100%', objectFit: 'cover' }}
                autoPlay
                loop
                muted
                ref={videoRef}
                playsInline
            >
                <source src={Vide} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div
                style={{
                    position: 'absolute',
                    top: '80%',
                    left: 0,
                    width: '40%',
                    textAlign: 'center',
                    color: 'white',
                    margintop:'30px',
                    fontSize: '17spx',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}
            >
                VEC Transport Facilities
            </div>

            {/* Responsive adjustments for mobile view */}
            <style>{`
               
            `}</style>
        </div>
    );
};

export default Transportvideo;
