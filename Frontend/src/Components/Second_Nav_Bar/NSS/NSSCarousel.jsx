import React, { useState, useEffect } from "react";
import "./NSSCarousel.css"; // Import the CSS file

const slideData = [
    {
        title: "NSS Volunteers in Action",
        desc: "Engaging in community service and making a difference.",
        image: "./nssphoto2.jpg",
    },
    {
        title: "Ethinic Day Celebration",
        desc: "Promoting Cultural Diversity and Unity.",
        image: "./nssphoto3.jpg",
    },
    {
        title: "Republic Day Celebration",
        desc: "Patriotic fervor and national pride on display.",
        image: "./nssphoto4.jpg",
    },
    {
        title: "Meet up with the police",
        desc: "Interacting with law enforcement and understanding their role.",
        image: "./nssphoto5.jpg",
    },
    {
        title: "Educational Programs",
        desc: "Spreading awareness and knowledge among the underprivileged.",
        image: "./nssphoto6.jpg",
    },
    {
        title: "Blood Donation Camp",
        desc: "Encouraging students to donate blood and save lives.",
        image: "./nssphoto7.jpg",
    },
    {
        title:"Eye check up camp",
        desc: "Promoting eye health and awareness.",
        image: "./nssphoto8.jpg",
    },
    {
        title: "eye check up program",
        desc: "Promoting eye health and awareness.",
        image: "./nssphoto9.jpg",
    },
    {
        title: "Blood Donation Camp",
        desc: "Encouraging students to donate blood and save lives.",
        image: "./nssphoto10.jpg",
    },
];

const NSSCarousel = () => {
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
        <div className="nss-carousel-wrap">
            <div className="nss-carousel-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slideData.map((slide, index) => (
                    <div className="nss-carousel-slide" key={index}>
                        <img src={slide.image} alt={slide.title} />
                        <div className="nss-carousel-text">
                            <h3>{slide.title}</h3>
                            <p>{slide.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button className="nss-carousel-btn nss-carousel-btn-left" onClick={prevSlide}>&#10094;</button>
            <button className="nss-carousel-btn nss-carousel-btn-right" onClick={nextSlide}>&#10095;</button>

            {/* Dots Indicator */}
            <div className="nss-carousel-dots">
                {slideData.map((_, index) => (
                    <span
                        key={index}
                        className={`nss-dot ${index === currentIndex ? "bg-secd dark:bg-drks" : "bg-gray-500"}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default NSSCarousel;
