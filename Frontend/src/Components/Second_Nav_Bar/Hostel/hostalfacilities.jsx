import { useState, useEffect } from "react";
import "./hostelfacilities.css";

const facilities = [
  {
    id: 1,
    title: "Comfortable Rooms",
    description: "Our rooms are designed for comfort and relaxation, ensuring a good night's sleep.",
    image: "https://images.pexels.com/photos/1845208/pexels-photo-1845208.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: 2,
    title: "Modern Kitchen",
    description: "A fully equipped kitchen where you can prepare your favorite meals.",
    image: "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: 3,
    title: "Cozy Common Area",
    description: "A spacious common area for socializing and relaxing with other guests.",
    image: "https://images.pexels.com/photos/36469/woman-person-flowers-wreaths.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: 4,
    title: "Lounge Area",
    description: "A comfortable lounge to unwind and connect with others.",
    image: "https://images.pexels.com/photos/247322/pexels-photo-247322.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
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

  return (
    <div className="facility">
      <h2 className="hostel-head">Our Facilities</h2>
      <div className="facilities-wrapper">
        <div className="hostal-fac-container">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className={`hostel-fac-item ${isMobile && expandedId === facility.id ? "expanded" : ""}`}
              onClick={() => handleExpand(facility.id)}
              style={{
                backgroundImage: `url(${facility.image})`,
              }}
            >
              <div className="content">
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
