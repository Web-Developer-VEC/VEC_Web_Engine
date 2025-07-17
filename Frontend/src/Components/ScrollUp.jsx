import React, { useState, useEffect } from 'react';
import './ScrollUp.css'; // CSS in separate file or inline
import { FaArrowUp } from 'react-icons/fa';

const ScrollUp = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 200) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      {visible && (
        <button className="scroll-up-btn" onClick={scrollToTop}>
          < FaArrowUp />
        </button>
      )}
    </>
  );
};

export default ScrollUp;
