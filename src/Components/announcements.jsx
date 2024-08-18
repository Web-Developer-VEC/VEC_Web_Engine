import React, { useEffect, useRef, useState } from 'react';
import './announcements.css';

const Carousel = () => {
  const carouselRef = useRef(null);
  const [itemHeight, setItemHeight] = useState(0);
  const scrollInterval = 3000; // Time in milliseconds (3 seconds)
  const totalItems = 5; // Number of original items

  useEffect(() => {
    const carousel = carouselRef.current;
    const carouselItems = Array.from(carousel.children);
    const height = carouselItems[0].clientHeight;

    setItemHeight(height);

    // Clone items to create an infinite loop effect
    const cloneItems = carouselItems.map(item => item.cloneNode(true));
    carousel.append(...cloneItems);

    // Set the total number of items including clones
    const totalVisibleItems = totalItems * 2;
    carousel.style.height = `${height * totalVisibleItems}px`;

    let currentIndex = 0;

    const autoScroll = () => {
      setInterval(() => {
        currentIndex++;
        if (currentIndex >= totalItems) {
          // Reset to start after scrolling past the original items
          carousel.style.transition = 'none'; // Disable transition during reset
          carousel.style.transform = `translateY(0px)`;
          currentIndex = 0;

          // Re-enable transition after reset
          setTimeout(() => {
            carousel.style.transition = 'transform 0.5s ease-in-out';
          }, 50);
        } else {
          carousel.style.transform = `translateY(-${currentIndex * height}px)`;
        }
      }, scrollInterval);
    };

    autoScroll();
  }, [itemHeight]);

  return (
    <section className="announcements news">
    <h1>News and Announcements</h1>
      <div className="car-container">
        <div className="car" ref={carouselRef}>
          <div className="car-item">B.E / B.Tech Admissions <i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">MBA Admissions <i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">SEE Results for 3rd year <i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">SEE Results for 2nd year <i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">Reavlution Application for B.E/B.Tech<i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">Reavlution Application for MBA<i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">Reavlution Application for M.E<i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
          <div className="car-item">Culturals<i class="fa-solid fa-link"></i> . <a href="#">click here</a></div>
        </div>
      </div>
      <a href="#" className="seal"><h5 className='alan'>All Announcements <i className="fa-solid fa-arrow-right"></i></h5></a>
      
    </section>
  );
};

function announcements() {
  return <Carousel />;
}

export default announcements;
