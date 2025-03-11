import React, { useState,useEffect,useCallback} from "react";
import Banner from "../../Banner";
import "./ProudAlumni.css";
const ProudAlumni = ({ theme, toggle }) => {
  // Sample data for the flipbook (replace with actual data source in production)
  const data = [
    {
      alumni: {
        
        students: [
          {  photo: "./cropped_pages/page_1.jpg" },
          {  photo: "./cropped_pages/page_2.jpg" },
          {  photo: "./cropped_pages/page_3.jpg" },
          {  photo: "./cropped_pages/page_4.jpg" },
          {  photo: "./cropped_pages/page_5.jpg" },
          {  photo: "./cropped_pages/page_6.jpg" },
          {  photo: "./cropped_pages/page_7.jpg" },
          {  photo: "./cropped_pages/page_8.jpg" },
          {  photo: "./cropped_pages/page_9.jpg" },
          {  photo: "./cropped_pages/page_10.jpg" },
          {  photo: "./cropped_pages/page_11.jpg" },
          {  photo: "./cropped_pages/page_12.jpg" },
          {  photo: "./cropped_pages/page_13.jpg" },
          {  photo: "./cropped_pages/page_14.jpg" },
          {  photo: "./cropped_pages/page_15.jpg" },
          {  photo: "./cropped_pages/page_16.jpg" },
          {  photo: "./cropped_pages/page_17.jpg" },
          {  photo: "./cropped_pages/page_18.jpg" },
          {  photo: "./cropped_pages/page_19.jpg" },
          {  photo: "./cropped_pages/page_20.jpg" },
          {  photo: "./cropped_pages/page_21.jpg" },
          {  photo: "./cropped_pages/page_22.jpg" },
          {  photo: "./cropped_pages/page_23.jpg" },
          {  photo: "./cropped_pages/page_24.jpg" },
          {  photo: "./cropped_pages/page_25.jpg" },
          {  photo: "./cropped_pages/page_26.jpg" },
          {  photo: "./cropped_pages/page_27.jpg" },
          {  photo: "./cropped_pages/page_28.jpg" },
          {  photo: "./cropped_pages/page_29.jpg" },
          {  photo: "./cropped_pages/page_30.jpg" },
          {  photo: "./cropped_pages/page_31.jpg" },
          {  photo: "./cropped_pages/page_32.jpg" },
          {  photo: "./cropped_pages/page_33.jpg" },
          {  photo: "./cropped_pages/page_34.jpg" },
          {  photo: "./cropped_pages/page_35.jpg" },
          {  photo: "./cropped_pages/page_36.jpg" },
          {  photo: "./cropped_pages/page_37.jpg" },
          {  photo: "./cropped_pages/page_38.jpg" },
          {  photo: "./cropped_pages/page_39.jpg" },
          {  photo: "./cropped_pages/page_40.jpg" },
          {  photo: "./cropped_pages/page_41.jpg" },
          {  photo: "./cropped_pages/page_42.jpg" },
          {  photo: "./cropped_pages/page_43.jpg" },
          {  photo: "./cropped_pages/page_44.jpg" },
          {  photo: "./cropped_pages/page_45.jpg" },
          {  photo: "./cropped_pages/page_46.jpg" },
          {  photo: "./cropped_pages/page_47.jpg" },
          {  photo: "./cropped_pages/page_48.jpg" },
          {  photo: "./cropped_pages/page_49.jpg" },
          {  photo: "./cropped_pages/page_50.jpg" },
          {  photo: "./cropped_pages/page_51.jpg" },
          {  photo: "./cropped_pages/page_52.jpg" },
          {  photo: "./cropped_pages/page_53.jpg" },
          {  photo: "./cropped_pages/page_54.jpg" },
          {  photo: "./cropped_pages/page_55.jpg" },
          {  photo: "./cropped_pages/page_56.jpg" },
          {  photo: "./cropped_pages/page_57.jpg" },
          {  photo: "./cropped_pages/page_58.jpg" },
          {  photo: "./cropped_pages/page_59.jpg" },
          {  photo: "./cropped_pages/page_60.jpg" },
          {  photo: "./cropped_pages/page_61.jpg" },
          {  photo: "./cropped_pages/page_62.jpg" },
          {  photo: "./cropped_pages/page_63.jpg" },
          {  photo: "./cropped_pages/page_64.jpg" },
          {  photo: "./cropped_pages/page_65.jpg" },
          {  photo: "./cropped_pages/page_66.jpg" },
          {  photo: "./cropped_pages/page_67.jpg" },
          {  photo: "./cropped_pages/page_68.jpg" },
          {  photo: "./cropped_pages/page_69.jpg" },
          {  photo: "./cropped_pages/page_70.jpg" },
          {  photo: "./cropped_pages/page_71.jpg" },
          {  photo: "./cropped_pages/page_72.jpg" },
          {  photo: "./cropped_pages/page_73.jpg" },
          {  photo: "./cropped_pages/page_74.jpg" },
          {  photo: "./cropped_pages/page_75.jpg" },
          {  photo: "./cropped_pages/page_76.jpg" },
          {  photo: "./cropped_pages/page_77.jpg" },
          {  photo: "./cropped_pages/page_78.jpg" },
          {  photo: "./cropped_pages/page_79.jpg" },
          {  photo: "./cropped_pages/page_80.jpg" },
          {  photo: "./cropped_pages/page_81.jpg" },
          {  photo: "./cropped_pages/page_82.jpg" },
          {  photo: "./cropped_pages/page_83.jpg" },
          {  photo: "./cropped_pages/page_84.jpg" },
          {  photo: "./cropped_pages/page_85.jpg" },
          {  photo: "./cropped_pages/page_86.jpg" },
          {  photo: "./cropped_pages/page_87.jpg" },
          {  photo: "./cropped_pages/page_88.jpg" },
          {  photo: "./cropped_pages/page_89.jpg" },
          {  photo: "./cropped_pages/page_90.jpg" },
          {  photo: "./cropped_pages/page_91.jpg" },
          {  photo: "./cropped_pages/page_92.jpg" },
          {  photo: "./cropped_pages/page_93.jpg" },
          {  photo: "./cropped_pages/page_94.jpg" },
          {  photo: "./cropped_pages/page_95.jpg" },
          {  photo: "./cropped_pages/page_96.jpg" },
          {  photo: "./cropped_pages/page_97.jpg" },
          {  photo: "./cropped_pages/page_98.jpg" },
          {  photo: "./cropped_pages/page_99.jpg" },
          {  photo: "./cropped_pages/page_100.jpg" },
          {  photo: "./cropped_pages/page_101.jpg" },
          {  photo: "./cropped_pages/page_102.jpg" },
          {  photo: "./cropped_pages/page_103.jpg" },


          
          
        ],
      },
    },
   
  ];

  // State for flipbook functionality
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);

  // Handle navigation to the next page
  const handleNext = useCallback(() => {
    if (!isFlipping && currentPage < data.length - 1) {
      setIsFlipping(true);
      setFlipDirection("right");
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setCurrentIndex(0);
        setIsFlipping(false);
      }, 600); // Matches CSS animation duration
    }
  }, [isFlipping, currentPage, data.length]);

  // Handle navigation to the previous page
  const handlePrev = useCallback(() => {
    if (!isFlipping && currentPage > 0) {
      setIsFlipping(true);
      setFlipDirection("left");
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setCurrentIndex(0);
        setIsFlipping(false);
      }, 600); // Matches CSS animation duration
    }
  }, [isFlipping, currentPage]);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
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
      <div className="pproud-alumni">
        <div className="papp-container">
          <div className="ptext-content">
            <h1>Get</h1>
            <h2 style={{ margin: "0 20px" }}>Inspired</h2>
            <h3 style={{ margin: "0 40px" }}>by</h3>
            <h1 style={{ margin: "0 21px" }}>Our Legacy</h1>
          </div>

          <div className="pflipbook">
            <div className="ppages">
              <div
                className={`ppage ${
                  flipDirection === "right" ? "flip-right" : ""
                } ${flipDirection === "left" ? "flip-left" : ""}`}
              >
                {data.length > 0 && (
                  <div>
                    <h2>{data[currentPage].alumni.department_name}</h2>
                    <img
                      src={data[currentPage].alumni.students[currentIndex].photo}
                      alt={data[currentPage].alumni.students[currentIndex].name}
                      className="pimage"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pcontrols">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0 || isFlipping}
                className="pbutton"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === data.length - 1 || isFlipping}
                className="pbutton"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>



  

      {/* Static Sections */}
      <div className="palumni-container">
        <section className="palumni-section">
          <h2 className="pasection-title">Alumni Cell Overview</h2>
          <p className="psection-content">
            The VEC Alumni Cell fosters relationships between alumni, students,
            and the institution, nurturing lifelong connections and mutual
            growth. It plays a crucial role in engaging alumni, leveraging their
            expertise, and strengthening institutional ties for the benefit of
            current students and the alma mater.
          </p>
        </section>

        <section className="palumni-section two-column">
          <div
            className="column rounded-xl,theme(colors.secd),transparent_70%)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka"
          >
            <h2 className="pasection-title">Vision</h2>
            <p className="psection-content">
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
            <h2 className="pasection-title">Mission</h2>
            <ul className="psection-content">
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

        <section className="palumni-section two-column palumni-objectives">
          <div className="pcolumn">
            <h2 className="pasection-title">Objectives of the Alumni Cell</h2>
            <ul className="psection-content">
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

export default ProudAlumni;