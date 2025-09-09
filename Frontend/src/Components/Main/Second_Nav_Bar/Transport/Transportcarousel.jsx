import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
 
import { use } from "react";

const TransportCarousel = ({ items,loading }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageList = items?.[0]?.image_path || [];

  const showPreviousItem = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  const showNextItem = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const interval = setInterval(showNextItem, 3000);
    return () => clearInterval(interval);
  }, [imageList]);

  if (loading) return <div>Loading...</div>;
  if (!imageList.length) return <div>No transport images found.</div>;
  
  const UrlParser = (path) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";
  if (typeof path !== "string") return "";
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     showNextItem();
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, []);

 if (loading) {
  return <div>Loading...</div>;
}

const images = items[0].image_path;

if (!items || items.length === 0) {
  return <div>No data found</div>;
}

const currentItem = items[activeIndex];
const currentImage = images[activeIndex];

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
            src={UrlParser(imageList[activeIndex])}
            alt={`Transport ${activeIndex + 1}`}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          {/* Optional content below image */}
          {/* <div className="p-4 text-black">
            <h2 className="text-xl font-bold">{currentItem.title}</h2>
            <p className="mt-2 text-sm">{currentItem.description}</p>
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