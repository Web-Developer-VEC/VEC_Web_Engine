import React, { useState, useEffect } from "react";
import "./NCCNCarousel.css"; // Import the CSS file


const NCCNCarousel = ({data}) => {
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
        setCurrentIndex((prev) => (prev === 0 ? data?.carousal_images?.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === data?.carousal_images?.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="ncc-carousel-wrap">
            <div className="ncc-carousel-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {data?.carousal_images?.map((slide, index) => (
                    <div className="ncc-carousel-slide" key={index}>
                        <img src={slide} alt={data?.carousal_title[index]} />
                        <div className="ncc-carousel-text">
                            <h3>{data?.carousal_title[index]}</h3>
                            <p>{data?.carousal_description[index]}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button className="ncc-carousel-btn ncc-carousel-btn-left" onClick={prevSlide}>&#10094;</button>
            <button className="ncc-carousel-btn ncc-carousel-btn-right" onClick={nextSlide}>&#10095;</button>

            {/* Dots Indicator */}
            <div className="ncc-carousel-dots">
                {data?.carousal_images?.map((_, index) => (
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
