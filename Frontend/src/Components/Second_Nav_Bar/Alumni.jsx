import React, { useState,useEffect,useCallback} from "react";
import Banner from "../Banner";
import "./Alumni.css";
import axios from "axios";
import star from "../Assets/championship.gif";

const Alumni = ({ theme, toggle }) => {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // State for flipbook functionality
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [spcannouncements, setSpcAnnouncements] = useState([]);
  const [alumniData, setAlumniData] = useState(null);
  console.log('Alumni',alumniData?.alumni_image_path);
  
  
  const content = spcannouncements[0]?.list_of_contents || [];
  const links = spcannouncements[0]?.list_of_links || [];

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/specialannouncements`);
            setSpcAnnouncements(response.data);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };
    fetchData();
}, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/alumni');
      setAlumniData(response.data[0]);
    } catch (error) {
      console.error("Error fetching alumni data",error);
    }
  }
  fetchData();
})

const handleNext = useCallback(() => {
  if (!isFlipping && currentPage < alumniData?.alumni_image_path.length - 1) {
    setIsFlipping(true);
    setFlipDirection("right");

    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setFlipDirection(""); // Reset flip direction
      setIsFlipping(false);
    }, 500); // Match CSS transition duration
  }
}, [isFlipping, currentPage, alumniData?.alumni_image_path.length]);

const handlePrev = useCallback(() => {
  if (!isFlipping && currentPage > 0) {
    setIsFlipping(true);
    setFlipDirection("left");

    setTimeout(() => {
      setCurrentPage((prev) => prev - 1);
      setFlipDirection(""); // Reset flip direction
      setIsFlipping(false);
    }, 500); // Match CSS transition duration
  }
}, [isFlipping, currentPage]);

// Auto-scroll every 3 seconds
useEffect(() => {
  const interval = setInterval(handleNext, 3000);
  return () => clearInterval(interval);
}, [handleNext]);

  return (
    <div>
      {/* Banner Component */}
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Alumni Cell"
        subHeaderText="Get inspired by our Legacy"
      />

      {/* Flipbook Section - Placed directly below the Banner */}
      <div className="alumni-announcement">
        <div className="proud-alumni">
          <div className="app-container h-full">
            <div className="text-content">
              <h1>Get</h1>
              <h2 style={{ margin: "0 20px" }}>Inspired</h2>
              <h3 style={{ margin: "0 40px" }}>by</h3>
              <h1 style={{ margin: "0 21px" }}>Our Legacy</h1>
            </div>

            <div className="flipbook">
              <div className="pages">
                <div
                  className={`page ${
                    flipDirection === "right" ? "flip-right" : ""
                  } ${flipDirection === "left" ? "flip-left" : ""}`}
                >
                  {alumniData?.alumni_image_path.length > 0 && (
                    <img
                      src={UrlParser(alumniData?.alumni_image_path[currentPage])}
                      alt={`Alumni ${currentPage + 1}`}
                      className="image"
                    />
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="controls">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 0 || isFlipping}
                  className="button"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === alumniData?.alumni_image_path.length - 1 || isFlipping}
                  className="button"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement section for alumni */}
          <div className="w-100">
              {spcannouncements.map((item) => (
                  <div key={item.title}>
                      <h2 className="text-3xl text-accn dark:text-drka mt-5 mb-3">{item.title}</h2>
                      <p className="text-xl">{item.content}</p>
                  </div>
              ))}
              <br/>
              <ul className="list-none">
                  {content?.map((item, index) => (
                      <li className="text-xl mb-2" key={index}>
                          <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy"/>
                          <a href={links[index]} className="text-black no-underline">{item}</a>
                      </li>
                  ))}
              </ul>
              {/* <button className="hover:animate-[AnimationName_3s_ease-out_infinite]">Apply Now</button> */}
          </div>
      </div>
      
      {/* Static Sections */}
      <div className="alumni-container">
        <section className="alumni-section">
          <h2 className="asection-title">Alumni Cell Overview</h2>
          <p className="section-content">
            The VEC Alumni Cell fosters relationships between alumni, students,
            and the institution, nurturing lifelong connections and mutual
            growth. It plays a crucial role in engaging alumni, leveraging their
            expertise, and strengthening institutional ties for the benefit of
            current students and the alma mater.
          </p>
        </section>

        <section className="alumni-section two-column">
          <div
            className="column rounded-xl,theme(colors.secd),transparent_70%)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka"
          >
            <h2 className="asection-title">Vision</h2>
            <p className="section-content">
              To establish a strong, lifelong bond between the institution and
              its alumni, fostering a mutually beneficial relationship that
              enhances professional growth, knowledge sharing, and institutional
              development.
            </p>
          </div>
          <div
            className="column rounded-xl ,theme(colors.secd),transparent_70%)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka"
          >
            <h2 className="asection-title">Mission</h2>
            <ul className="section-content">
              <li>
                To build a dynamic and engaged alumni network that contributes
                to the academic and career growth of current students.
              </li>
              <li>
                To facilitate mentorship programs, networking opportunities, and
                industry collaborations through alumni involvement.
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

        <section className="alumni-section two-column alumni-objectives">
          <div className="column">
            <h2 className="asection-title">Objectives of the Alumni Cell</h2>
            <ul className="section-content">
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
                Industry Collaboration – To leverage alumni expertise for guest
                lectures, workshops, internships, and job opportunities.
              </li>
              <li>
                Institutional Growth & Development – To contribute to the
                institution’s progress through feedback, donations, and
                infrastructure support.
              </li>
              <li>
                Reunions & Networking Events – To organize meetups, reunions,
                and networking sessions for alumni to reconnect and collaborate.
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

export default Alumni;