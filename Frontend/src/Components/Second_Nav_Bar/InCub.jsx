import {useState,useEffect} from "react";
import "./Incub.css";
import Banner from "../Banner";
import SideNav from "./SideNav";
import LoadComp from "../LoadComp";


const Incub = ( {toggle, theme}) => {
    const [selectedSection, setSelectedSection] = useState("Home");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cub, setCub] = useState("Home")
    const navData = {
        "Home": <CubHme/>,
        "Incubated Startups": <CubStr/>,  //CubStr
        "MOU's": <CubMou/>,               //CubMou
        "Student Support Mechanism": <CubMec/>, //CubMec
        "Facilities": <CubFcl/>,          //CubFcl
        "Mentor's": <CubMnt/>,            //CubMnt
        "Apply Now": <CubApy/>            //CubApy
    };

    // Data for Incubated Startups
    const startupsData = [
        {slNo: 1, groupName: "Vivid", leadName: "Mr. Shrinivas S, CSBS"},
        {slNo: 2, groupName: "Green M", leadName: "Mr. Andrew Vikas, CSBS"},
        {slNo: 3, groupName: "Coarve IT", leadName: "Mr. Jayadevan, Data Science (AMCS)"},
        {slNo: 4, groupName: "Farm Far Away", leadName: "Mr. Muruganath"},
        {slNo: 5, groupName: "Cataract prediction using transfer learning", leadName: "Ms. Dayalaxmi. S (IT)"}
    ];

    // Data for MOUs
    const mouData = [
        {slNo: 1, organization: "Tech Corp", duration: "2024-2027", area: "AI Research"},
        {slNo: 2, organization: "Health Innovate", duration: "2023-2026", area: "Medical Tech"},
    ];

    // Data for Facilities Carousel
    const slideData = [
        {image: "/section1.jpg", title: "Advanced Robotics Lab", dscrp: "State-of-the-art robotics research facility"},
        {image: "/section2.jpg", title: "Innovation Workshop", dscrp: "Collaborative space for student projects"},
       
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


    function CubHme() {
        return (
            <div className="ic-home-container">
                <div className="ic-about-section dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h2 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About Us</h2>
                    <p className="ic-centered-text text-text dark:text-drkt">
                        The NAAC conducts assessment and accreditation of Higher Educational Institutions (HEI)
                        such as colleges, universities, or other recognised institutions to derive an understanding
                        of the 'Quality Status' of the institution.
                    </p>
                </div>

                <div className="ic-vision-mission-grid">
                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Vision</h3>
                        <p>To be a premier institution fostering innovation and entrepreneurship through quality
                            education and industry collaboration</p>
                    </div>

                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Mission</h3>
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
    }

    function CubStr() {
        return (
            <div className="ic-table-container m-4">
                <table className="ic-data-table">
                    <thead>
                    <tr>
                        <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Group Name</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Student Lead Name & Dept.</th>
                    </tr>
                    </thead>
                    <tbody>
                    {startupsData.map((startup) => (
                        <tr key={startup.slNo}>
                            <td className="ic-table-data">{startup.slNo}</td>
                            <td className="ic-table-data">{startup.groupName}</td>
                            <td className="ic-table-data">{startup.leadName}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }

    function CubMou() {
        return (
            <div className="ic-table-container m-4 overflow-x-scroll">
                <table className="ic-data-table">
                    <thead>
                    <tr>
                        <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Organization</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Duration</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Area of Collaboration</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mouData.map((mou) => (
                        <tr key={mou.slNo}>
                            <td className="ic-table-data">{mou.slNo}</td>
                            <td className="ic-table-data">{mou.organization}</td>
                            <td className="ic-table-data">{mou.duration}</td>
                            <td className="ic-table-data">{mou.area}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }

    function CubMec() {
        return (
            <div className="ic-support-image-container">
                <img
                    src="/support-mechanism.jpg"
                    alt="Student Support Mechanisms"
                    className="ic-support-image"
                />
            </div>
        );
    }

    function CubFcl() {
        return (
            <div className="ic-wrap-h-fit dark:bg-drkp">
                <div className="ic-container">
                    {slideData.map((slide, index) => (
                        <div className={`ic-carousel-slide ${index === currentIndex ? "visible" : "hidden"}`} key={index}>
                            <img src={slide.image} alt={slide.title} />
                            <div className="ic-carousel-texty bottom-0 lg:bottom-24 lg:mb-3 lg:px-8 lg:py-4">
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
    }

    function CubMnt() {
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
                            <h3 className="text-text dark:text-drkt">{mentor.name}</h3>
                            <p className="ic-qualification text-brwn dark:text-drka">{mentor.qualification}</p>
                            <p className="ic-position text-brwn dark:text-drka">{mentor.position}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function CubApy() {
        window.open("https://forms.google.com/your-form-link", "_blank");
        return null;
    }    
const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }
    return (
        
        <>
            <Banner
                toggle={toggle} theme={theme}
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="IIC"
                subHeaderText="Innovation & Incubation Center"
            />
            <SideNav sts={cub} setSts={setCub} navData={navData} cls={"w-screen"}/>
        </>
    );
};

export default Incub;