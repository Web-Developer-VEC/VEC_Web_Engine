import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Student_activities.css';
import LoadComp from '../../../LoadComp';

const ImageCarousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const student_achievements_content = data?.find((item) => item.category === "student_achievements_content")?.content || [];
  const student_achievements_details = data?.find((item) => item.category === "student_achievements_details")?.images || [];

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleClick = (image) => {
    if (image.status) {
      setSelectedImage(image);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (student_achievements_details?.length > 0) setCurrentIndex(0);
  }, [student_achievements_details]);

 const [isPaused, setIsPaused] = useState(false);

useEffect(() => {
  if (student_achievements_details?.length === 0 || isPaused) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev === student_achievements_details?.length - 1 ? 0 : prev + 1));
  }, 5000);

  return () => clearInterval(interval);
}, [student_achievements_details, isPaused])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === student_achievements_details?.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? student_achievements_details?.length - 1 : prev - 1));
  };

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );

  return (
    <div className="carousel-container">
      {student_achievements_details?.length > 0 ? (
        <>
          {/* 🔹 Section Heading */}
          <h1 className="intro-title text-accn dark:text-drkt">
            <i className="inline-block mr-2 mb-1" /> Student Achievements
          </h1>
          {student_achievements_content?.length > 0 && (
            <div className="intro-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
              <p className="intro-text-act text-text dark:text-drkt">{student_achievements_content?.[0]}</p>
            </div>   
          )}

          {/* 🔹 Carousel Wrapper */}
          <div className="carousel-wrapper">
            <div
              className="carousel-slides"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                display: 'flex',
                transition: 'transform 0.3s ease',
              }}
            >
              {student_achievements_details?.map((item, index) => (
                <div
                  key={index}
                  className="carousel-slide"
                  style={{ left: `${index * 100}%` }}
                >
                  <div className="image-wrapper">
                    <img
                      src={UrlParser(item?.image_path)}
                      alt={item?.event_name}
                      className="carousel-image"
                    />
                    {item?.status && (
                      <button
                        className="know-more-button"
                          onClick={() => {
                            handleClick(item);
                            setIsPaused(true);
                          }}
                        >
                        Know More
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 🔹 Modal for Selected Image */}
            {selectedImage && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-stud" onClick={(e) => e.stopPropagation()}>
                  {selectedImage?.video_link && (
                    <>
                        <h2 className={`description-title text-accn dark:text-drka ${student_achievements_details[currentIndex]?.image_content ? "" : "text-center"}`}>
                          {student_achievements_details[currentIndex]?.event_name}
                        </h2>
                        <p className="description-text-act">
                          {student_achievements_details[currentIndex]?.image_content}
                        </p>
                      <a
                        href={selectedImage?.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="youtube-link"
                      >
                        View Full Playllist
                      </a>
                    </>
                  )}
                  <button onClick={closeModal} className="student-close">X</button>
                </div>
              </div>
            )}

            {/* 🔹 Navigation Buttons */}
            <button onClick={prevSlide} className="nav-button prev-button">
              <ChevronLeft className="nav-icon" />
            </button>
            <button onClick={nextSlide} className="nav-button next-button">
              <ChevronRight className="nav-icon" />
            </button>
          </div>

          {/* 🔹 Image Description Box */}
          <div className="description-box bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h2 className={`description-title text-accn dark:text-drka ${student_achievements_details?.[currentIndex]?.image_content ? "" : "text-center"}`}>
              {student_achievements_details?.[currentIndex]?.event_name}
            </h2>
            <p className="description-text-act">
              {student_achievements_details?.[currentIndex]?.image_content}
            </p>
          </div>
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
