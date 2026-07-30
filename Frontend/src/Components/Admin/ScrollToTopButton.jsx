import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const container = document.getElementById("main-content");

    if (container) {
      setIsVisible(container.scrollTop > 150);
    } else {
      setIsVisible(window.scrollY > 150);
    }
  };

  const scrollToTop = () => {
    const container = document.getElementById("main-content");

    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = document.getElementById("main-content");

    if (container) {
      container.addEventListener("scroll", toggleVisibility);
    } else {
      window.addEventListener("scroll", toggleVisibility);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", toggleVisibility);
      } else {
        window.removeEventListener("scroll", toggleVisibility);
      }
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