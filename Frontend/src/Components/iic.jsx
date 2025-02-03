import React, { useEffect, useRef, useState } from "react";
import './iic.css';
import banner from "./Assets/banner image.jpg";
import Banner from "./Banner"; 
import facilityImage1 from "./Assets/iic-facility-1.png";
import facilityImage2 from"./Assets/iic-facility-2.png";
import facilityImage3 from"./Assets/iic-facility-3.png";
import facilityImage4 from"./Assets/iic-facility-4.png";
import facilityImage5 from"./Assets/iic-facility-5.png";
import facilityImage6 from"./Assets/iic-facility-6.png";

const Iic = () => {
  const leftCardsRef = useRef([]);
  const rightCardsRef = useRef([]);

  const leftPerspectives = [
    { x: -6, z: -4 },
    { x: -12, z: -8 },
    { x: -18, z: -12 },
    { x: -24, z: -16 },
    { x: -30, z: -20 },
    { x: 6, z: -4 }
  ];

  const rightPerspectives = [
    { x: 6, z: -4 },
    { x: 12, z: -8 },
    { x: 18, z: -12 },
    { x: 24, z: -16 },
    { x: 30, z: -20 },
    { x: -6, z: -4 }
  ];

  const translateImage = (target, p) => {
    if (target) {
      target.style.transform = `translate3d(${p.x}rem, 0, ${p.z}rem)`;
    }
  };

  const animateCards = (element, perspectives) => {
    if (element) {
      const count = parseInt(element.dataset.counter, 10);
      translateImage(element, perspectives[count - 1]);
      element.dataset.counter = (count === 6 ? 1 : count + 1).toString();
    }
  };

  const loop = () => {
    return setInterval(() => {
      leftCardsRef.current.forEach((card) => {
        animateCards(card, leftPerspectives);
      });
      rightCardsRef.current.forEach((card) => {
        animateCards(card, rightPerspectives);
      });
    }, 2000);
  };

  const initializeCards = () => {
    leftCardsRef.current.forEach((card, index) => {
      translateImage(card, leftPerspectives[index]);
      card.dataset.counter = (index + 1).toString();
    });
    rightCardsRef.current.forEach((card, index) => {
      translateImage(card, rightPerspectives[index]);
      card.dataset.counter = (index + 1).toString();
    });
  };

  useEffect(() => {
    initializeCards();
    const intervalId = loop();
    return () => clearInterval(intervalId);
  }, []);

  const images = {
    left: [
      facilityImage1,
      facilityImage2,
      facilityImage3,
      facilityImage4,
      facilityImage5,
      facilityImage6,
    ],
    right: [
      facilityImage6,
      facilityImage5,
      facilityImage4,
      facilityImage3,
      facilityImage2,
      facilityImage1,
    ],
  };

  const [selectedYear, setSelectedYear] = useState("Certificate");
  const [selectedAction, setSelectedAction] = useState(null);

  const certificateArray = [
    { year: "2022 - 23", path: "/pdfs/IIC 21-22.pdf" },
    { year: "2021 - 22", path: "/pdfs/IIC 22-23.pdf" },
  ];

  const eventsOrganizedArray = [
    { year: "2020 - 21", path: "/pdfs/eo IIC 20-21.pdf" },
    { year: "2021 - 22", path: "/pdfs/eo IIC 21-22.pdf" },
    { year: "2022 - 23", path: "/pdfs/eo IIC 22-23.pdf" },
    { year: "2023 - 24", path: "/pdfs/eo IIC 23-24.pdf" },
  ];

  const policyArray = [
    { year: "National Innovation Startup Policy", path: "/pdfs/National-Innovation-and-Startup-Policy.pdf" },
    { year: "Tamilnadu Innovation and Startup Policy", path: "/pdfs/Tamilnadu-Innovation-and-Startup-Policy.pdf" },
    { year: "TNMSMEpolicy", path: "/pdfs/TNMSMEpolicy.pdf" },
    { year: "Velammal Innovation and Startup Policy", path: "/pdfs/Velammal-Innovation-and-Startup-Policy.pdf" },
  ];

  const membersArray = [
    {
      name: "Dr.A.Nirmal Raj ",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Vishal_at_CCL_4_Launch_%28cropped%29",
      designation: "HoD MBA",
      keyRole: "President",
    },
    {
      name: "Dr.A.Balaji Ganesh ",
      image: "https://via.placeholder.com/150",
      designation: "Research Dean",
      keyRole: "Vice President"
    },
    {
      name: "Mr.Viveak M Palanivasan",
      image: "https://via.placeholder.com/150",
      designation: "Founder of Voltrix Mobility",
      keyRole: "Industry Expert"
    },
    {
      name: "Member 4",
      image: "https://via.placeholder.com/150",
      designation: "Designation",
      keyRole: "Industry Expert"
    },
    {
      name: "Member 5",
      image: "https://via.placeholder.com/150",
      designation: "Designation",
      keyRole: "Industry Expert"
    },
    {
      name: "Member 6",
      image: "https://via.placeholder.com/150",
      designation: "Designation",
      keyRole: "Industry Expert"
    },
  ];

  const nirSectionsArray = [
    {
      heading: "Registration Statistics",
      buttons: [
        { text: "Total Individuals Registered: 2119", path: "/pdfs/Total-Individuals-Registered.pdf" },
        { text: "Total Ideas Submitted: 265", path: "/pdfs/Total-Ideas-Submitted.pdf" },
        { text: "Total Ideas Assigned: 254", path: "/pdfs/Total-Ideas-Assigned.pdf" },
        { text: "Total Ideas Verified: 250", path: "/pdfs/Total-Ideas-Verified.pdf" },
        { text: "Total Ideas Recommended: 220", path: "/pdfs/Total-Ideas-Recommended.pdf" },
        { text: "Total Ideas Implemented: 180", path: "/pdfs/Total-Ideas-Implemented.pdf" },
      ],
    },
    {
      heading: "Innovation Metrics",
      buttons: [
        { text: "Patents Filed: 45", path: "/pdfs/Patents-Filed.pdf" },
        { text: "Startups Incubated: 32", path: "/pdfs/Startups-Incubated.pdf" },
        { text: "Research Publications: 156", path: "/pdfs/Research-Publications.pdf" },
        { text: "Industry Collaborations: 28", path: "/pdfs/Industry-Collaborations.pdf" },
        { text: "Funding Received: ₹2.5Cr", path: "/pdfs/Funding-Received.pdf" },
        { text: "Mentorship Hours: 1200", path: "/pdfs/Mentorship-Hours.pdf" },
      ],
    },
    {
      heading: "Impact Assessment",
      buttons: [
        { text: "Student Participation: 85%", path: "/pdfs/Student-Participation.pdf" },
        { text: "Faculty Involvement: 92%", path: "/pdfs/Faculty-Involvement.pdf" },
        { text: "Success Rate: 78%", path: "/pdfs/Success-Rate.pdf" },
        { text: "Industry Adoption: 45%", path: "/pdfs/Industry-Adoption.pdf" },
        { text: "Community Impact: High", path: "/pdfs/Community-Impact.pdf" },
        { text: "Overall Rating: 4.8/5", path: "/pdfs/Overall-Rating.pdf" },
      ],
    },
  ];

  const otherStuffsArray = [
    { year: "STARTUP", path: "/pdfs/STARTUP.pdf" },
    { year: "SEED_MONEY", path: "/pdfs/SEED_MONEY.pdf" },
    { year: "MENTEE_INSTRUCTIONS", path: "/pdfs/MENTEE_INSTRUCTIONS.pdf" },
    { year: "PATENTS", path: "/pdfs/PATENTS.pdf" },
  ];

  const openPdf = (category, year) => {
    setSelectedAction({ category, year });
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedAction(null);
  };

  const renderNIRContent = () => {
    return (
      <div className="nir-container">
        {nirSectionsArray.map((section, index) => (
          <div key={index} className="nir-section">
            <h3 className="nir-heading">{section.heading}</h3>
            <div className="nir-buttons">
              {section.buttons.map((button, btnIndex) => (
                <div key={btnIndex} className="nir-action-button">
                  {button.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="nirf-page">
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="IIC"
        subHeaderText="Instituition's Innovation Council"
      />

      <div className="about-section">
        <div className="naac-info-panel">
          <h2>About IIC</h2>
          <p>
            The Ministry of Education (MoE), Govt. of India has established ‘MoE’s Innovation Cell (MIC)’ to systematically foster the culture of Innovation amongst all Higher Education Institutions (HEIs). The primary mandate of MIC is to encourage, inspire and nurture young students by supporting them to work with new ideas and transform them into prototypes while they are in their formative years.
            <br />
            MIC has envisioned encouraging creation of ‘Institution’s Innovation Council (IICs)’ across selected HEIs. A network of these IICs will be established to promote innovation in the Institutions through multitudinous modes leading to an innovation promotion eco-system in the campuses.
          </p>
        </div>

        <div className="naac-info-panel">
          <h2>Major Focus of IIC</h2>
          <p>
            <br />
            • To create a vibrant local innovation ecosystem, Start-up supporting Mechanism in HEIs, IIC should prepare the institution for ATAL Ranking of Institutions on Innovation Achievements Framework.
            <br />
            • To establish a Function Ecosystem for Scouting Ideas and Pre-incubation of Ideas.
            <br />
            • To develop better Cognitive Ability for Technology Students.
            <br />
          </p>
        </div>

        <div className="iqac-info-panel">
          <h2>Vision</h2>
          <p>
            To facilitate a conducive environment with the intention of making an innovation to reach the society or industries for the betterment of our country and its citizen through entrepreneurial assets.
          </p>
        </div>

        <div className="iqac-info-panel">
          <h2>Mission</h2>
          <p>
            To enable student and faculty to establish a start-up to market their innovative products; an enhanced coordination and priority setting across the start-up eco-system; an improved customizable strategy and planning for pursuing productivity growth and better operational efficiencies and value for the start-up companies.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <div className="card functions-info-panel">
          <h2>Functions of IIC</h2>
          <p>
            <br />
            • To conduct various innovation and entrepreneurship-related activities prescribed by Central MIC in a time-bound manner.
            <br />
            • To identify and reward innovations and share success stories.
            <br />
            • To organize periodic workshops/ seminars/ interactions with entrepreneurs, investors, professionals and create a mentor pool for student innovators.
            <br />
            • Networking with peers and national entrepreneurship development organizations.
            <br />
            • To create an Institution’s Innovation portal to highlight innovative projects carried out by institution’s faculty and students.
            <br />
            • To organize Hackathons, idea competitions, mini-challenges etc. with the involvement of industries.
            <br />
          </p>
        </div>
      </div>

      <div className="">
        <h3 className="iic-faici">Facilities And Infrastructure</h3>
        <div className="gallery">
          <div className="left iic-left">
            <div className="inner">
              {images.left.map((src, index) => (
                <img
                  key={src}
                  ref={(el) => (leftCardsRef.current[index] = el)}
                  className="item"
                  src={src}
                  data-counter={(index + 1).toString()}
                  alt={`Left card ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="right iic-right">
            <div className="inner">
              {images.right.map((src, index) => (
                <img
                  key={src}
                  ref={(el) => (rightCardsRef.current[index] = el)}
                  className="item"
                  src={src}
                  data-counter={(index + 1).toString()}
                  alt={`Right card ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="nirf-content">
        <div className="nirf-years">
          {["Certificate", "Events Organized", "Policy", "Members", "NIR", "Other Stuffs"].map((category) => (
            <button
              key={category}
              className={`nirf-year-button ${selectedYear === category ? "active" : ""}`}
              onClick={() => handleYearClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={`nirf-details height ${selectedYear === "Members" ? "members-section" : ""}`}>
          {selectedYear === "NIR" ? (
            renderNIRContent()
          ) : (
            <div className="nirf-year-actions faculty-icc">
              {selectedYear === "Certificate" &&
                certificateArray.map((action, index) => (
                  <div
                    key={index}
                    className="nirf-action-button"
                    onClick={() => openPdf("Certificate", action.year)}
                  >
                    {action.year}
                  </div>
                ))}
              {selectedYear === "Events Organized" &&
                eventsOrganizedArray.map((action, index) => (
                  <div
                    key={index}
                    className="nirf-action-button"
                    onClick={() => openPdf("Events Organized", action.year)}
                  >
                    {action.year}
                  </div>
                ))}
              {selectedYear === "Policy" &&
                policyArray.map((action, index) => (
                  <div
                    key={index}
                    className="nirf-action-button"
                    onClick={() => openPdf("Policy", action.year)}
                  >
                    {action.year}
                  </div>
                ))}
              {selectedYear === "Members" && (
                <div className="members-grid">
                  {membersArray.map((member, index) => (
                    <div key={index} className="members">
                      <img src={member.image} alt={member.name} className="member-image" />
                      <p>{member.name}</p>
                      <h6>{member.designation}</h6>
                      <p>{member.keyRole}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedYear === "Other Stuffs" &&
                otherStuffsArray.map((action, index) => (
                  <div
                    key={index}
                    className="nirf-action-button"
                    onClick={() => openPdf("Other Stuffs", action.year)}
                  >
                    {action.year}
                  </div>
                ))}
            </div>
          )}

          {selectedAction && (
            <div className="nirf-pdf-container">
              <h3>{`Viewing: ${selectedAction.year}`}</h3>
              <embed
                className="embed"
                src={
                  selectedAction.category === "Certificate"
                    ? certificateArray.find((item) => item.year === selectedAction.year)?.path
                    : selectedAction.category === "Events Organized"
                    ? eventsOrganizedArray.find((item) => item.year === selectedAction.year)?.path
                    : selectedAction.category === "Policy"
                    ? policyArray.find((item) => item.year === selectedAction.year)?.path
                    : otherStuffsArray.find((item) => item.year === selectedAction.year)?.path
                }
                type="application/pdf"
                width="100%"
                height="600px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Iic;