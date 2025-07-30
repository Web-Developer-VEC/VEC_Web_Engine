import React, { useState, useEffect } from "react";
import "./NCCNCarousel.css"; // Import the CSS file
import LoadComp  from "../../../LoadComp";

const NCCNCarousel = ({data}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
    
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
        setCurrentIndex((prev) => (prev === 0 ? data?.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === data?.length - 1 ? 0 : prev + 1));
    };

    return (
<>
        {data  ? (
            
            <div className="ncc-carousel-wrap">
            <div className="ncc-carousel-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {data?.map((slide, index) => (
                    <div className="ncc-carousel-slide" key={index}>
                        <img src={UrlParser(slide?.image_path)} alt={slide?.title} />
                        <div className="ncc-carousel-text">
                            <h3>{slide?.title}</h3>
                            <p>{slide?.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Navigation Buttons */}
            <button className="ncc-carousel-btn ncc-carousel-btn-left" onClick={prevSlide}>&#10094;</button>
            <button className="ncc-carousel-btn ncc-carousel-btn-right" onClick={nextSlide}>&#10095;</button>
            
            {/* Dots Indicator */}
            {/* <div className="ncc-carousel-dots">
                {data?.image_path?.map((_, index) => (
                    <span
                    key={index}
                    className={`ncc-dot ${index === currentIndex ? "active" : ""}`}
                    onClick={() => setCurrentIndex(index)}
                    ></span>
                        ))}
                        </div> */}
                        </div>
                    ):(
            <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
                    )}
 </>
    );
};

export default NCCNCarousel;
