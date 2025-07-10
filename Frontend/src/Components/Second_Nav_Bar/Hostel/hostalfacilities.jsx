import { useState, useEffect } from "react";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";

const facilities = [
  {
    id: 1,
    title: "Girls Hostel",
    description: "The girls’ hostel ensures safety, comfort, and privacy, with round-the-clock supervision and facilities tailored to students' well-being and convenience.",
    image: "/static/images/hostel/Girls Hostel Room.webp",
  },
  {
    id: 2,
    title: "Boys Hostel",
    description: "The boys’ hostel offers a secure and disciplined environment with all necessary facilities, promoting academic focus and healthy social interaction.",
    image: "/static/images/hostel/Boys Hostel.webp",
  },
  {
    id: 3,
    title: "Hostel Room",
    description: "A spacious common area for socializing and relaxing with other guests.",
    image: "/static/images/hostel/Boys Hostel Room.webp",
  },
  {
    id: 4,
    title: "Mess",
    description: "The hostel mess serves hygienic, nutritious, and tasty meals daily, with a rotating menu and options to suit different dietary preferences.",
    image: "/static/images/hostel/Hostel mess.webp",
  },
];

export default function HostelFacilities() {
  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setExpandedId(null); // Reset expanded state when switching to desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExpand = (id) => {
    if (isMobile) {
      setExpandedId(expandedId === id ? null : id);
    }
  };
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
  
  return (
    <div className="facility">
      <h2 className="hostel-head text-brwn dark:text-drkt">Our Facilities</h2>
      <div className="facilities-wrapper">
        <div className="hostal-fac-container">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className={`hostel-fac-item ${isMobile && expandedId === facility.id ? "expanded" : ""}`}
              onClick={() => handleExpand(facility.id)}
              style={{
                backgroundImage: `url(${UrlParser(facility.image)})`,
              }}
            >
              <div className="content bg-gradient-to-t from-[color-mix(in_srgb,theme(colors.accn)_69%,black)]
                  dark:from-[color-mix(in_srgb,theme(colors.drka)_50%,black)] via-transparent via-35 to-transparent">
                <h2>{facility.title}</h2>
                <span>{facility.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
