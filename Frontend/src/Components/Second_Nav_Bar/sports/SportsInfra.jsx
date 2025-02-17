import React, { useState, useEffect } from "react";
import "./SportsInfra.css";

const SportsInfra = () => {
  const items = [
    {
      title: "BALL BADMINTON COURT",
      description:
        "Our Ball Badminton Court offers a vibrant space for both recreational and competitive play. Perfect for a fun and engaging experience, this court is ideal for teams looking to challenge each other.",
      imageUrl: "/sports/ballbadminton.png",
    },
    {
      title: "WILMA RUDOLPH INDOOR STADIUM",
      description:
        "The Wilma Rudolph Indoor Stadium provides a versatile environment for a wide range of indoor sports. With state-of-the-art facilities, it's the perfect venue for both practice and competition.",
      imageUrl: "/sports/indoorstadium.png",
    },
    {
      title: "WILMA RUDOLPH INDOOR STADIUM",
      description:
        "This iconic indoor stadium hosts various sports events and training sessions. With its ample space and excellent infrastructure, it's designed to cater to athletes of all levels.",
      imageUrl: "/sports/indoorstadium2.png",
    },
    {
      title: "WILMA RUDOLPH VOLLEY BALL COURT",
      description:
        "The Volleyball Court at Wilma Rudolph Indoor Stadium is the perfect setting for exciting matches and tournaments. Whether you're a beginner or a pro, this court is designed to elevate your game.",
      imageUrl: "/sports/volleyball.png",
    },
    {
      title: "FITNESS CENTRE",
      description:
        "Our Fitness Centre is equipped with a wide range of modern equipment to help you reach your fitness goals. Whether you prefer weightlifting, cardio, or group classes, this centre has something for everyone.",
      imageUrl: "/sports/fitnesscentre.png",
    },
    {
      title: "KAPIL DAV CRICKET GROUND",
      description:
        "Kapil Dav Cricket Ground is a professional-level cricket field designed for intense matches and practice sessions. Whether you're a budding cricketer or an experienced player, this ground is built to meet your needs.",
      imageUrl: "/sports/cricketground.png",
    },
    {
      title: "KABADDI COURT",
      description:
        "The Kabaddi Court is designed for this fast-paced and action-packed sport. With all the right equipment and a high-quality surface, it offers an ideal setting for both casual and competitive Kabaddi matches.",
      imageUrl: "/sports/kabaddi.png",
    },
    {
      title: "LADIES HOSTEL GYM",
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
    const scrollPosition = window.scrollY + window.innerHeight; // scroll position + viewport height
    if (scrollPosition >= window.innerHeight * 1.1) {
      // Trigger animation when scrolling to 110vh
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
    <div className="sports">
      <main className={`intro1-section ${animate ? "animate" : ""}`}>
        <div className="container1">
          <div className="grid1">
            <div className="column-xs-12">
              <ul className="slider">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className={`slider-item ${
                      index === activeIndex ? "active" : ""
                    }`}
                  >
                    <div className="grid1 vertical">
                      <div className="column-xs-12 column-md-2 hide-mobile">
                        <div className="intro1">
                          <a href="#">
                            <h1 className="title">
                              <span className="underline">{item.title}</span>
                            </h1>
                          </a>
                        </div>
                      </div>
                      <div className="column-xs-12 column-md-10">
                        <div className="image-holder1">
                          <img className="sport_img" src={item.imageUrl} alt={item.title} />
                        </div>
                        <div className="grid1">
                          <div className="column-xs-12 column-md-9">
                            <div className="intro1 show-mobile">
                              <a href="#">
                                <h1 className="title">
                                  <span className="underline">
                                    {item.title}
                                  </span>
                                </h1>
                              </a>
                            </div>
                            <p className="sports_description">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="grid1">
                <div className="column-xs-12">
                  <div className="controls">
                    <div className="indicator">
                    <button className="previous" onClick={showPreviousItem}>
                      <span className="visually-hidden">Previous</span>
                      <span
                        className="icon arrow-left"
                        aria-hidden="true"
                      ></span>
                    </button>
                    </div>
                    <div className="indicator">
                    <button className="next" onClick={showNextItem}>
                      <span className="visually-hidden">Next</span>
                      <span
                        className="icon arrow-right"
                        aria-hidden="true"
                      ></span>
                    </button>
                    </div>
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

export default SportsInfra;
