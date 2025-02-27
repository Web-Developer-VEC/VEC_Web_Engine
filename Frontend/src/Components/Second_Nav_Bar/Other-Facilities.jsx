    import React, { useEffect, useState } from 'react'
    import Banner from '../Banner'
    import './Other-Facilities.css'
    import { ArrowBigLeft, ArrowBigRight, Building2 } from 'lucide-react';

    const OtherFacilities = ({theme, toggle}) => {

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
          const [direction, setDirection] = useState(null);
          
            const showNextItem = () => {
              setDirection('next');
              setActiveIndex((prevIndex) =>
                prevIndex < items.length - 1 ? prevIndex + 1 : 0
              );
            };
          
            const showPreviousItem = () => {
              setDirection('previous');
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
         <>
             <Banner toggle={toggle} theme={theme}
          backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
          headerText="Campus Facilities"
          subHeaderText="Excellence in Infrastructure"
          // className="banner-ofac"
        />
        <div className='ofac'>
        <div className="card-oth dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-b-8 border-secd dark:border-drks">
          <div className="card-content">
            <div className="icon-wrapper">
              <div className="icon-bg text-accn dark:text-drka">
                <Building2 className="icon" />
              </div>
            </div>
            <h3 className="card-title-oth text-accn dark:text-drka">World Class Infrastructure</h3>
            <div className="relative">
              <p className="card-text">
                Velammal Engineering College in Chennai offers excellent facilities, including well-equipped laboratories, a central library with vast digital and physical resources, and modern classrooms. The campus also provides hostel accommodations, sports facilities, a cafeteria, an auditorium, seminar halls, and dedicated research centers.
              </p>
            </div>
          </div>
          <div className="gradient-bar"></div>
        </div>

        <main className={`intro1-section ${animate ? "animate" : ""}`}>
          <div className="container1">
            <div className="grid1">
              <div className="column-xs-12">
                <ul className="slider card-oth dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] p-4">
                  {items.map((item, index) => (
                    <li
                      key={index}
                      className={`slider-item ${
                        index === activeIndex ? "active" : ""
                      }`}
                    >
                      <div className="grid1 vertical">
                        <div className="column-xs-12 column-md-10 image-container">
                          <div className="image-holder">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className={`relative ${
                                index === activeIndex
                                  ? 'active'
                                  : direction === 'next'
                                  ? 'next'
                                  : direction === 'previous'
                                  ? 'previous'
                                  : ''
                              }`}
                            />
                            <div className="column-xs-12 column-md-2 hide-mobile title-overlay">
                              <div className="intro1">
                                <a href="#">
                                  <h1 className="title">
                                    <span className="underline">{item.title}</span>
                                  </h1>
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="grid1 text-text dark:text-drkt">
                            <div className="column-xs-12 column-md-9">
                              <div className="intro1 show-mobile">
                                <a href="#">
                                  <h1 className="title">
                                    <span className="underline">{item.title}</span>
                                  </h1>
                                </a>
                              </div>
                              <div className="arrow">
                                <div className="grid2">
                                  <div className="column-xs-12 ">
                                    <div className="controls">
                                      <div className="indicator">
                                        <button className="previous" onClick={showPreviousItem}>
                                          <span aria-hidden="true">
                                            <ArrowBigLeft className='w-10 h-auto' />
                                          </span>
                                        </button>
                                      </div>
                                      <div className="indicator">
                                        <button className="next" onClick={showNextItem}>
                                          <span aria-hidden="true">
                                            <ArrowBigRight className='w-10 h-auto' />
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <p className="description">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
</>
      )
    }

    export default OtherFacilities