import React, { useEffect, useRef } from 'react';
import Vide from '../../Assets/Bus.mp4';

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
        </div>
    );
};

export default Transportvideo;
