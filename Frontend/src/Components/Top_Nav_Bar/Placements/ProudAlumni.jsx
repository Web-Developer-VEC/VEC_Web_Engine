import React, { useState, useEffect, useCallback } from "react";
import Banner from "../../Banner";
import "./ProudAlumni.css";
import axios from "axios";
import star from '../../Assets/championship.gif'
import { useNavigate } from "react-router";

const ProudAlumni = ({ theme, toggle }) => {
  // Data for the flipbook images
  const data = [
    {
      alumni: {
        students: Array.from({ length: 103 }, (_, i) => ({
          photo: `./cropped_pages/page_${i + 1}.jpg`,
          
          
        })),
      },
    },
  ];

  // State variables
  const [currentPage, setCurrentPage] = useState(0); // Note: Unused in this implementation but retained from original code
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the current image index
  const [flipDirection, setFlipDirection] = useState(""); // Controls flip animation direction
  const [isFlipping, setIsFlipping] = useState(false); // Indicates if a flip animation is in progress
  const [spcannouncements, setSpcAnnouncements] = useState([]);
  
  const content = spcannouncements[0]?.list_of_contents || [];
  const links = spcannouncements[0]?.list_of_links || [];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/specialannouncements`);
            setSpcAnnouncements(response.data);
        } catch (error) {
            console.error("Error fetching data:", error.message);
            if (error.response.data.status === 429) {
              navigate('/ratelimit', { state: { msg: error.response.data.message}})
            }
        }
    };
    fetchData();
}, []);

  // Handler for navigating to the next image
  const handleNext = useCallback(() => {
    if (!isFlipping && currentIndex < data[0].alumni.students.length - 1) {
      setIsFlipping(true);
      setFlipDirection("right");
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipping(false);
      }, 600); // Matches animation duration
    }
  }, [isFlipping, currentIndex, data]);

  // Handler for navigating to the previous image
  const handlePrev = useCallback(() => {
    if (!isFlipping && currentIndex > 0) {
      setIsFlipping(true);
      setFlipDirection("left");
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsFlipping(false);
      }, 600); // Matches animation duration
    }
  }, [isFlipping, currentIndex]);

  // Effect to handle auto-scrolling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFlipping && currentIndex < data[0].alumni.students.length - 1) {
        handleNext();
      }
    }, 3000); // Advances every 3 seconds
    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [isFlipping, currentIndex, handleNext, data]);

  return (
    <div>
      {/* Banner Component */}
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Alumni Cell"
        subHeaderText="Get inspired by our Legacy"
      />

      <div className="alumni-announcement font-[poppins]">
        {/* Flipbook Section */}
        <div className="pproud-alumni">
          <div className="papp-container">
            <div className="ptext-content ">
              <h1>Get</h1>
              <h2 style={{ margin: "0 20px" }}>Inspired</h2>
              <h3 style={{ margin: "0 40px" }}>by</h3>
              <h1 style={{ margin: "0 21px" }}>Our Legacy</h1>
            </div>

            <div className="pflipbook">
              {/* Image Container */}
              <div className="ppages">
                <div
                  className={`ppage ${
                    flipDirection === "right"
                      ? "flip-right"
                      : flipDirection === "left"
                      ? "flip-left"
                      : ""
                  }`}
                >
                  <img
                    src={data[0].alumni.students[currentIndex].photo}
                    alt={`Alumni ${currentIndex + 1}`}
                    className="pimage"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pcontrols">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0 || isFlipping}
                  className="pbutton"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    currentIndex === data[0].alumni.students.length - 1 ||
                    isFlipping
                  }
                  className="pbutton"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement section for alumni */}
          <div className="main pr-10 pl-10 w-1/2">
              {spcannouncements.map((item) => (
                  <div key={item.title}>
                      <h2 className="text-[24px] text-accn dark:text-drka mt-5 mb-3 font-[poppins]">{item.title}</h2>
                      <p className="text-[24px] font-[poppins]">{item.content}</p>
                  </div>
              ))}
              <br/>
              <ul className="list-none">
                  {content?.map((item, index) => (
                      <li className="text-16 font-[poppins] mb-2" key={index}>
                          <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy"/>
                          <a href={links[index]} className="text-black no-underline">{item}</a>
                      </li>
                  ))}
              </ul>
              {/* <button className="hover:animate-[AnimationName_3s_ease-out_infinite]">Apply Now</button> */}
          </div>
      </div>

      {/* Static Content Sections */}
      <div className="palumni-container font-[poppins]">
        <section className="palumni-section">
          <h2 className="pasection-title font-[poppins]">Alumni Cell Overview</h2>
          <p className="psection-content">
            The VEC Alumni Cell fosters relationships between alumni, students,
            and the institution, nurturing lifelong connections and mutual
            growth. It plays a crucial role in engaging alumni, leveraging
            their expertise, and strengthening institutional ties for the
            benefit of current students and the alma mater.
          </p>
        </section>

        <section className="palumni-section two-column font-[poppins]">
          <div
            className="column rounded-xl,theme(colors.secd),transparent_70%)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka"
          >
            <h2 className="pasection-title text-[24px] font-[poppins]">Vision</h2>
            <p className="psection-content font-[poppins] text-[16px]">
              To establish a strong, lifelong bond between the institution and
              its alumni, fostering a mutually beneficial relationship that
              enhances professional growth, knowledge sharing, and
              institutional development.
            </p>
          </div>
          <div
            className="column rounded-xl ,theme(colors.secd),transparent_70%)] font-[poppins]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka"
          >
            <h2 className="pasection-title font-[poppins]">Mission</h2>
            <ul className="psection-content font-[poppins]">
              <li>
                To build a dynamic and engaged alumni network that contributes
                to the academic and career growth of current students.
              </li>
              <li>
                To facilitate mentorship programs, networking opportunities,
                and industry collaborations through alumni involvement.
              </li>
              <li>
                To organize events and initiatives that strengthen
                alumni-institution relationships.
              </li>
              <li>
                To create a platform for alumni to contribute to institutional
                growth through knowledge sharing, placements, and corporate
                connections.
              </li>
            </ul>
          </div>
        </section>

        <section className="palumni-section two-column palumni-objectives font-[poppins]">
          <div className="pcolumn">
            <h2 className="pasection-title font-[poppins]">Objectives of the Alumni Cell</h2>
            <ul className="psection-content font-[poppins]">
              <li>
                Strengthening Alumni Network – To create and maintain a strong
                bond among alumni, faculty, and current students.
              </li>
              <li>
                Mentorship & Career Support – To provide guidance, career
                counseling, and professional mentorship to students and recent
                graduates.
              </li>
              <li>
                Industry Collaboration – To leverage alumni expertise for
                guest lectures, workshops, internships, and job opportunities.
              </li>
              <li>
                Institutional Growth & Development – To contribute to the
                institution’s progress through feedback, donations, and
                infrastructure support.
              </li>
              <li>
                Reunions & Networking Events – To organize meetups, reunions,
                and networking sessions for alumni to reconnect and
                collaborate.
              </li>
              <li>
                Academic & Research Contributions – To support research,
                knowledge sharing, and industry-academic collaborations.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProudAlumni;