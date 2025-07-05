import { useState, useEffect } from "react";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";

const facilities = [
  {
    id: 1,
    title: "Comfortable Rooms",
    description: "Our rooms are designed for comfort and relaxation, ensuring a good night's sleep.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM7KFDxGz0vjoMnZbtF9Wlx2Vze9b6TQXxZg&s",
  },
  {
    id: 2,
    title: "Modern Kitchen",
    description: "A fully equipped kitchen where you can prepare your favorite meals.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR521-msTuln7iMR8YLB-namJ11KKV-8Vqng&s",
  },
  {
    id: 3,
    title: "Cozy Common Area",
    description: "A spacious common area for socializing and relaxing with other guests.",
    image: "https://ugcounselor-content.s3.ap-south-1.amazonaws.com/wp-content/uploads/2024/02/14155408/Velammal-Institute-of-Technology.jpg",
  },
  {
    id: 4,
    title: "Lounge Area",
    description: "A comfortable lounge to unwind and connect with others.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSROIRP2sPDuJfQ6OogQkW7X-JXJNiJcIuWyw&s",
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
