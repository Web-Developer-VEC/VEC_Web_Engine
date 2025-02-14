import React, { useState, useEffect } from "react";
import "./Transportcarousel.css";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Transportcarousel = () => {
  const items = [
    {
      title: "Bus 1",
      description:
        "Our Ball Badminton Court offers a vibrant space for both recreational and competitive play. Perfect for a fun and engaging experience, this court is ideal for teams looking to challenge each other.",
      imageUrl: "/sports/ballbadminton.png",
    },
    {
      title: "BUS 2",
      description:
        "The Wilma Rudolph Indoor Stadium provides a versatile environment for a wide range of indoor sports. With state-of-the-art facilities, it's the perfect venue for both practice and competition.",
      imageUrl: "/sports/indoorstadium.png",
    },
    {
      title: "BUS 3",
      description:
        "This iconic indoor stadium hosts various sports events and training sessions. With its ample space and excellent infrastructure, it's designed to cater to athletes of all levels.",
      imageUrl: "/sports/indoorstadium2.png",
    },
    {
      title: "BUS 4",
      description:
        "The Volleyball Court at Wilma Rudolph Indoor Stadium is the perfect setting for exciting matches and tournaments. Whether you're a beginner or a pro, this court is designed to elevate your game.",
      imageUrl: "/sports/volleyball.png",
    },
    {
      title: "BUS 5",
      description:
        "Our Fitness Centre is equipped with a wide range of modern equipment to help you reach your fitness goals. Whether you prefer weightlifting, cardio, or group classes, this centre has something for everyone.",
      imageUrl: "/sports/fitnesscentre.png",
    },
    {
      title: "BUS 6",
      description:
        "Kapil Dav Cricket Ground is a professional-level cricket field designed for intense matches and practice sessions. Whether you're a budding cricketer or an experienced player, this ground is built to meet your needs.",
      imageUrl: "/sports/cricketground.png",
    },
    {
      title: "BUS 7",
      description:
        "The Kabaddi Court is designed for this fast-paced and action-packed sport. With all the right equipment and a high-quality surface, it offers an ideal setting for both casual and competitive Kabaddi matches.",
      imageUrl: "/sports/kabaddi.png",
    },
    {
      title: "BUS 8",
      description:
        "The Ladies Hostel Gym is a fully equipped space for women to work out and stay fit. Whether you're looking to build strength, improve endurance, or practice yoga, the gym offers a comfortable and private environment.",
      imageUrl: "/sports/ladiesgym.png",
    },
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  const showNextItem = () => {
    setActiveIndex((prevIndex) =>
      prevIndex < items.length - 1 ? prevIndex + 1 : 0
    );
  };

  const showPreviousItem = () => {
    setActiveIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : items.length - 1
    );
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 37) {
      showPreviousItem();
    } else if (e.keyCode === 39) {
      showNextItem();
    }
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    if (scrollPosition >= window.innerHeight * 1.1) {
      setAnimate(true);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <main className={`transport-carousel-section ${animate ? "animate" : ""}`}>
        <div className="transport-container">
          <div className="transport-grid">
            <div className="transport-column-xs-12">
              <ul className="transport-slider">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className={`transport-slider-item ${index === activeIndex ? "active" : ""}`}
                  >
                    <div className="transport-grid vertical">
                      <div className="transport-column-xs-12 transport-column-md-2 hide-mobile">
                        <div className="transport-intro">
                          <a href="#">
                            <h1 className="transport-title">
                              <span className="transport-underline">{item.title}</span>
                            </h1>
                          </a>
                        </div>
                      </div>
                      <div className="transport-column-xs-12 transport-column-md-10">
                        <div className="transport-image-holder">
                          <img className="transport-sport-img" src={item.imageUrl} alt={item.title} />
                        </div>
                        <div className="transport-grid">
                          <div className="transport-column-xs-12 transport-column-md-9">
                            <div className="transport-intro show-mobile">
                              <a href="#">
                                <h1 className="transport-title">
                                  <span className="transport-underline">{item.title}</span>
                                </h1>
                              </a>
                            </div>
                            <p className="transport-sports-description">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="transport-grid">
                <div className="transport-column-xs-12">
                  <div className="transport-controls h-auto">
                    <button className="transport-previous" onClick={showPreviousItem}>
                      <span className=""><ChevronLeft className="w-6 h-6 text-gray-700" /></span>
                    </button>
                    <button className="transport-next" onClick={showNextItem}>
                      <span className=""><ChevronRight className="w-6 h-6 text-gray-700" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transportcarousel;
