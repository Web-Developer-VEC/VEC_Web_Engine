import React from "react";
import "./SportsInfra.css";

const SportsInfra = () => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const items = [
    // {
    //   title: "BALL BADMINTON COURT",
    //   description:
    //     "Our Ball Badminton Court offers a vibrant space for both recreational and competitive play. Perfect for a fun and engaging experience, this court is ideal for teams looking to challenge each other.",
    //   imageUrl: "static/images/sports/infrastructure/fitnesscenter.webp",
    // },
    {
      title: "WILMA RUDOLPH INDOOR STADIUM",
      description:
        "The Wilma Rudolph Indoor Stadium provides a versatile environment for a wide range of indoor sports. With state-of-the-art facilities, it's the perfect venue for both practice and competition.",
      imageUrl: "static/images/sports/infrastructure/Indoor Stadium.webp",
    },
    // {
    //   title: "WILMA RUDOLPH INDOOR STADIUM",
    //   description:
    //     "This iconic indoor stadium hosts various sports events and training sessions. With its ample space and excellent infrastructure, it's designed to cater to athletes of all levels.",
    //   imageUrl: "static/images/sports/infrastructure/Indoor Stadium.webp",
    // },
    {
      title: "WILMA RUDOLPH VOLLEYBALL COURT",
      description:
        "The Volleyball Court at Wilma Rudolph Indoor Stadium is the perfect setting for exciting matches and tournaments. Whether you're a beginner or a pro, this court is designed to elevate your game.",
      imageUrl: "static/images/sports/infrastructure/Indoor Volleyball Court.webp",
    },
    {
      title: "FITNESS CENTRE",
      description:
        "Our Fitness Centre is equipped with a wide range of modern equipment to help you reach your fitness goals. Whether you prefer weightlifting, cardio, or group classes, this centre has something for everyone.",
      imageUrl: "static/images/sports/infrastructure/fitnesscenter.webp",
    },
    {
      title: "KAPIL DEV CRICKET GROUND",
      description:
        "Kapil Dev Cricket Ground is a professional-level cricket field designed for intense matches and practice sessions. Whether you're a budding cricketer or an experienced player, this ground is built to meet your needs.",
      imageUrl: "static/images/sports/infrastructure/Kapil Dev Cricket Ground.webp",
    },
    
    {
      title: "KABADDI COURT",
      description:
        "The Kabaddi Court is designed for this fast-paced and action-packed sport. With all the right equipment and a high-quality surface, it offers an ideal setting for both casual and competitive Kabaddi matches.",
      imageUrl: "static/images/sports/infrastructure/Kabaddi Court.webp",
    },
    {
      title: "LADIES HOSTEL GYM",
      description:
        "The Ladies Hostel Gym is a fully equipped space for women to work out and stay fit. Whether you're looking to build strength, improve endurance, or practice yoga, the gym offers a comfortable and private environment.",
      imageUrl: "static/images/sports/infrastructure/ladies_hostel_gym.webp",
    },
  ];

  return (
    <div className="sports-container">  
      {items.map((item, index) => (
        index % 2 === 0 ? (
          <div key={index} className="sports-row">
            <div className="sports-item border-1 border-black dark:bg-text">
              <img className="sport-img" src={UrlParser(item.imageUrl)} alt={item.title} />
              <h2 className="sports-title">{item.title}</h2>
              <p className="sports-description">{item.description}</p>
            </div>
            {index + 1 < items.length && (
              <div className="sports-item border-1 border-black dark:bg-text">
                <img className="sport-img" src={UrlParser(items[index + 1].imageUrl)} alt={items[index + 1].title} />
                <h2 className="sports-title">{items[index + 1].title}</h2>
                <p className="sports-description">{items[index + 1].description}</p>
              </div>
            )}
          </div>
        ) : null
      ))}
    </div>
  );
};

export default SportsInfra