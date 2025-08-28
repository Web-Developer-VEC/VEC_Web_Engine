import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const windowScroll = window.scrollY || document.documentElement.scrollTop;
    const bodyScroll = document.body.scrollTop;
    if (windowScroll > 150 || bodyScroll > 150) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    document.body.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      document.body.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="
            fixed bottom-6 right-6 z-[99]
            p-3 rounded-full
            bg-prim dark:bg-drkp border-1 border-prim text-orange-500
            shadow-md hover:shadow-xl
            hover:bg-secd dark:hover:bg-drks hover:text-black
            transition-transform duration-300 ease-in-out
            hover:scale-110
            animate-bounce
            cursor-pointer
          "
          aria-label="Scroll to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;