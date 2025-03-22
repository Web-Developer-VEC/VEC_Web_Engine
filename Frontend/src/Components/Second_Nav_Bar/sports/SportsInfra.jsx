import React from "react";
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
      title: "WILMA RUDOLPH VOLLEYBALL COURT",
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

  return (
    <div className="sports-container">
      {items.map((item, index) => (
        index % 2 === 0 ? (
          <div key={index} className="sports-row">
            <div className="sports-item">
              <img className="sport-img" src={item.imageUrl} alt={item.title} />
              <h2 className="sports-title">{item.title}</h2>
              <p className="sports-description">{item.description}</p>
            </div>
            {index + 1 < items.length && (
              <div className="sports-item">
                <img className="sport-img" src={items[index + 1].imageUrl} alt={items[index + 1].title} />
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