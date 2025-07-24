// src/components/ScrollUpButton.jsx
import React, { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa'; // optional: for icon
import './ScrollFromBottom.css'; // for custom styles

const ScrollFromBottom = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button after scrolling down
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    isVisible && (
      <button onClick={scrollToTop} className="scroll-up-button">
        <FaArrowUp />
      </button>
    )
  );
};

export default ScrollFromBottom;
