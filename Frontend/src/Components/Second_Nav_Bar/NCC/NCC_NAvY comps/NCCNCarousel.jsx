import React, { useState, useEffect } from "react";
import "./NCCNCarousel.css"; // Import the CSS file

const slideData = [
    {
        title: "NSS Volunteers in Action",
        desc: "Engaging in community service and making a difference.",
        image: ".",
    },
    {
        title: "Ethinic Day Celebration",
        desc: "Promoting Cultural Diversity and Unity.",
        image: "./NCCN2.png",
    },
    {
        title: "Republic Day Celebration",
        desc: "Patriotic fervor and national pride on display.",
        image: "./NCCN3.png",
    },
    {
        title: "Meet up with the police",
        desc: "Interacting with law enforcement and understanding their role.",
        image: "./NCCN4.png",
    },
    {
        title: "Educational Programs",
        desc: "Spreading awareness and knowledge among the underprivileged.",
        image: "./NCCN5.png",
    },
    {
        title: "Blood Donation Camp",
        desc: "Encouraging students to donate blood and save lives.",
        image: "./NCCN6.png",
    },
    {
        title:"Eye check up camp",
        desc: "Promoting eye health and awareness.",
        image: "./NCCN7.png",
    },
    
];

const NCCNCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Auto-slide functionality
    useEffect(() => {
        if (isAutoPlay) {
            const interval = setInterval(() => {
                nextSlide();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [currentIndex, isAutoPlay]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slideData.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slideData.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="ncc-carousel-wrap">
            <div className="ncc-carousel-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slideData.map((slide, index) => (
                    <div className="ncc-carousel-slide" key={index}>
                        <img src={slide.image} alt={slide.title} />
                        <div className="ncc-carousel-text">
                            <h3>{slide.title}</h3>
                            <p>{slide.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button className="ncc-carousel-btn ncc-carousel-btn-left" onClick={prevSlide}>&#10094;</button>
            <button className="ncc-carousel-btn ncc-carousel-btn-right" onClick={nextSlide}>&#10095;</button>

            {/* Dots Indicator */}
            <div className="ncc-carousel-dots">
                {slideData.map((_, index) => (
                    <span
                        key={index}
                        className={`ncc-dot ${index === currentIndex ? "active" : ""}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default NCCNCarousel;
