import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TransportCarousel = () => {
  const items = [
    {
      title: "Bus 1",
      description:
        "",
      imageUrl: "/static/images/Transport/Bus View 1.webp",
    },
    {
      title: "BUS 2",
      description:
        "",
      imageUrl: "/static/images/Transport/Bus View 2.webp",
    },
    {
      title: "BUS 3",
      description:
        "",
      imageUrl: "/static/images/Transport/Bus View 3.webp",
    },
    {
      title: "BUS 4",
      description:
        "",
      imageUrl: "/static/images/Transport/Bus View 4.webp",
    },
    {
      title: "BUS 5",
      description:
        "",
      imageUrl: "/static/images/Transport/Bus View 5.webp",
    },

  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const showNextItem = () => {
    setActiveIndex((prevIndex) => (prevIndex < items.length - 1 ? prevIndex + 1 : 0));
  };
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  const showPreviousItem = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : items.length - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      showNextItem();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto p-4">
  <AnimatePresence mode="wait">
    <motion.div
      key={activeIndex}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-r from-white to-gray-100 shadow-xl rounded-2xl overflow-hidden" 
    >
      <img
        src={UrlParser(items[activeIndex].imageUrl)}
        alt={items[activeIndex].title}
        className="w-full h-64 object-cover rounded-t-2xl"
      />
      {/* <div className="p-4 text-black">
        <h2 className="text-xl font-bold">{items[activeIndex].title}</h2>
        <p className="mt-2 text-sm">{items[activeIndex].description}</p>
      </div> */}
    </motion.div>
  </AnimatePresence>

  <button
    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-300"
    onClick={showPreviousItem}
  >
    <ChevronLeft className="w-6 h-6 text-gray-700" />
  </button>
  <button
    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-300"
    onClick={showNextItem}
  >
    <ChevronRight className="w-6 h-6 text-gray-700" />
  </button>
</div>
  );
};

export default TransportCarousel;