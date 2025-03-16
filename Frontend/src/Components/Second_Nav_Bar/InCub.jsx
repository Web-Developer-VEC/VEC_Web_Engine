import { useState } from "react";
import "./Incub.css";
import Banner from "../Banner";

const Incub = () => {
    const [selectedSection, setSelectedSection] = useState("Home");
    const [currentIndex, setCurrentIndex] = useState(0);

    // Data for Incubated Startups
    const startupsData = [
        { slNo: 1, groupName: "Vivid", leadName: "Mr. Shrinivas S, CSBS" },
        { slNo: 2, groupName: "Green M", leadName: "Mr. Andrew Vikas, CSBS" },
        { slNo: 3, groupName: "Coarve IT", leadName: "Mr. Jayadevan, Data Science (AMCS)" },
        { slNo: 4, groupName: "Farm Far Away", leadName: "Mr. Muruganath" },
        { slNo: 5, groupName: "Cataract prediction using transfer learning", leadName: "Ms. Dayalaxmi. S (IT)" }
    ];

    // Data for MOUs
    const mouData = [
        { slNo: 1, organization: "Tech Corp", duration: "2024-2027", area: "AI Research" },
        { slNo: 2, organization: "Health Innovate", duration: "2023-2026", area: "Medical Tech" },
    ];

    // Data for Facilities Carousel
    const slideData = [
        { image: "/lab1.jpg", title: "Advanced Robotics Lab", dscrp: "State-of-the-art robotics research facility" },
        { image: "/workshop.jpg", title: "Innovation Workshop", dscrp: "Collaborative space for student projects" },
    ];

    // Data for Mentors
    const mentorsData = [
        {
            name: "Dr.S.Rajendraprasath",
            image: "/mentor1.jpg",
            qualification: "B.Sc., M.A., M.L.Sc., M.phil, Ph.D",
            position: "Librarian/HOD"
        },
        {
            name: "T.Senthivel",
            image: "/mentor2.jpg",
            qualification: "M.A., M.L.Sc",
            position: "Library Assistant"
        },
        {
            name: "P.Kumaravel",
            image: "/mentor3.jpg",
            qualification: "B.A.",
            position: "Library Assistant"
        },
        {
            name: "M.Panchavarnam",
            image: "/mentor4.jpg",
            qualification: "B.Com",
            position: "Library Assistant"
        },
        {
            name: "P.Udayakai",
            image: "/mentor5.jpg",
            qualification: "B.A., B.L.Sc",
            position: "Library Assistant"
        }
    ];

    // Carousel Controls
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slideData.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slideData.length - 1 : prev - 1));
    };

    const renderContent = () => {
        switch(selectedSection) {
            case "Home":
                return (
                    <div className="ic-home-container">
                        <div className="ic-about-section">
                            <h2>About Us</h2>
                            <p className="ic-centered-text">
                                The NAAC conducts assessment and accreditation of Higher Educational Institutions (HEI) 
                                such as colleges, universities, or other recognised institutions to derive an understanding 
                                of the 'Quality Status' of the institution.
                            </p>
                        </div>
                        
                        <div className="ic-vision-mission-grid">
                            <div className="ic-vm-card">
                                <h3>Vision</h3>
                                <p>To be a premier institution fostering innovation and entrepreneurship through quality education and industry collaboration</p>
                            </div>
                            
                            <div className="ic-vm-card">
                                <h3>Mission</h3>
                                <ul>
                                    <li>Promote innovative thinking among students</li>
                                    <li>Facilitate industry-academia partnerships</li>
                                    <li>Support startup incubation</li>
                                    <li>Enhance research capabilities</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case "Incubated Startups":
                return (
                    <div className="ic-table-container">
                        <table className="ic-data-table">
                            <thead>
                                <tr>
                                    <th>SL No</th>
                                    <th>Group Name</th>
                                    <th>Student Lead Name & Dept.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {startupsData.map((startup) => (
                                    <tr key={startup.slNo}>
                                        <td>{startup.slNo}</td>
                                        <td>{startup.groupName}</td>
                                        <td>{startup.leadName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case "MOU's":
                return (
                    <div className="ic-table-container">
                        <table className="ic-data-table">
                            <thead>
                                <tr>
                                    <th>SL No</th>
                                    <th>Organization</th>
                                    <th>Duration</th>
                                    <th>Area of Collaboration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mouData.map((mou) => (
                                    <tr key={mou.slNo}>
                                        <td>{mou.slNo}</td>
                                        <td>{mou.organization}</td>
                                        <td>{mou.duration}</td>
                                        <td>{mou.area}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case "Student Support Mechanism":
                return (
                    <div className="ic-support-image-container">
                        <img 
                            src="/support-mechanism.jpg" 
                            alt="Student Support Mechanisms"
                            className="ic-support-image"
                        />
                    </div>
                );

            case "Facilities":
                return (
                    <div className="ic-wrap-h-fit">
                        <div className="ic-container" 
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                            {slideData.map((slide, index) => (
                                <div className="ic-carousel-slide" key={index}>
                                    <img src={slide.image} alt={slide.title} />
                                    <div className="ic-carousel-texty bottom-0 lg:bottom-24 lg:mb-4 lg:px-8">
                                        <h3 className="text-sm lg:text-2xl lg:mb-4">{slide.title}</h3>
                                        <p className="text-xs lg:text-xl">{slide.dscrp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="ic-carousel-btn ic-carousel-btn-left" onClick={prevSlide}>❮</button>
                        <button className="ic-carousel-btn ic-carousel-btn-right" onClick={nextSlide}>❯</button>

                        <div className="ic-carousel-dots">
                            {slideData.map((_, index) => (
                                <span
                                    key={index}
                                    className={`ic-dot ${index === currentIndex ? "bg-secd dark:bg-drks" : "bg-gray-500"}`}
                                    onClick={() => setCurrentIndex(index)}
                                ></span>
                            ))}
                        </div>
                    </div>
                );

            case "Mentor's":
                return (
                    <div className="ic-mentors-grid">
                        {mentorsData.map((mentor, index) => (
                            <div className="ic-mentor-card" key={index}>
                                <img 
                                    src={mentor.image} 
                                    alt={mentor.name}
                                    className="ic-mentor-image"
                                />
                                <div className="ic-mentor-details">
                                    <h3>{mentor.name}</h3>
                                    <p className="ic-qualification">{mentor.qualification}</p>
                                    <p className="ic-position">{mentor.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "Apply Now":
                window.location.href = "https://forms.google.com/your-form-link";
                return null;

            default:
                return (
                    <div className="ic-content-section">
                        <h2>Welcome to IIC</h2>
                        <p>Select a section from the sidebar to view details</p>
                    </div>
                );
        }
    };

    return (
        <>
            <Banner
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="IIC"
                subHeaderText="Innovation & Incubation Center"
            />
            
            <div className="ic-container">
                <div className="ic-sidebar-responsive-sidebar">
                    {[
                        "Home",
                        "Incubated Startups",
                        "MOU's",
                        "Student Support Mechanism",
                        "Facilities",
                        "Mentor's",
                        "Apply Now"
                    ].map((item) => (
                        <button
                            key={item}
                            className={`ic-sidebar-item ${selectedSection === item ? "active" : ""}`}
                            onClick={() => setSelectedSection(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="ic-main-content">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default Incub;