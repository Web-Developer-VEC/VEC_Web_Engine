import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TransportCarousel = () => {
  const items = [
    {
      title: "Bus 1",
      description:
        "Our Ball Badminton Court offers a vibrant space for both recreational and competitive play. Perfect for a fun and engaging experience, this court is ideal for teams looking to challenge each other.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 1.webp",
    },
    {
      title: "BUS 2",
      description:
        "The Wilma Rudolph Indoor Stadium provides a versatile environment for a wide range of indoor sports. With state-of-the-art facilities, it's the perfect venue for both practice and competition.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 2.webp",
    },
    {
      title: "BUS 3",
      description:
        "This iconic indoor stadium hosts various sports events and training sessions. With its ample space and excellent infrastructure, it's designed to cater to athletes of all levels.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 3.webp",
    },
    {
      title: "BUS 4",
      description:
        "The Volleyball Court at Wilma Rudolph Indoor Stadium is the perfect setting for exciting matches and tournaments. Whether you're a beginner or a pro, this court is designed to elevate your game.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 4.webp",
    },
    {
      title: "BUS 5",
      description:
        "Our Fitness Centre is equipped with a wide range of modern equipment to help you reach your fitness goals. Whether you prefer weightlifting, cardio, or group classes, this centre has something for everyone.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 5.webp",
    },
    {
      title: "BUS 6",
      description:
        "Kapil Dav Cricket Ground is a professional-level cricket field designed for intense matches and practice sessions. Whether you're a budding cricketer or an experienced player, this ground is built to meet your needs.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 1.webp",
    },
    {
      title: "BUS 7",
      description:
        "The Kabaddi Court is designed for this fast-paced and action-packed sport. With all the right equipment and a high-quality surface, it offers an ideal setting for both casual and competitive Kabaddi matches.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 2.webp",
    },
    {
      title: "BUS 8",
      description:
        "The Ladies Hostel Gym is a fully equipped space for women to work out and stay fit. Whether you're looking to build strength, improve endurance, or practice yoga, the gym offers a comfortable and private environment.",
      imageUrl: "/static/images/other_facilities/Transport/Bus View 3.webp",
    }
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
      <div className="p-4 text-black"> {/* Changed text color to black for better contrast */}
        <h2 className="text-xl font-bold">{items[activeIndex].title}</h2>
        <p className="mt-2 text-sm">{items[activeIndex].description}</p>
      </div>
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