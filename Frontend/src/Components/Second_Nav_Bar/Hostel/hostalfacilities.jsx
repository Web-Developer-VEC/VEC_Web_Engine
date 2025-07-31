import { useState, useEffect } from "react";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";

export default function HostelFacilities({hostelData}) {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

   const UrlParser = (path) => {
    
    return encodeURI(path?.startsWith("http") ? path : `${BASE_URL}${path}`);
   };

  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <=  768);

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
    <>
      {hostelData ? (
        <div className="facility">
          <h2 className="hostel-head text-brwn dark:text-drkt">Our Facilities</h2>
          <div className="facilities-wrapper">
            <div className="hostal-fac-container">
              {hostelData?.map((facility, index) => (
                <div
                  key={index}
                  className={`hostel-fac-item ${isMobile && expandedId === index ? "expanded" : ""}`}
                  onClick={() => handleExpand(index)}
                  style={{
                    backgroundImage: `url('${UrlParser(facility.image_path)}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  
                  <div className="content bg-gradient-to-t from-[color-mix(in_srgb,theme(colors.accn)_69%,black)]
                    dark:from-[color-mix(in_srgb,theme(colors.drka)_50%,black)] via-transparent via-35 to-transparent">
                    <h2 className="text-xl">{facility.title}</h2>
                    <p className="text-[18px]">{facility.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}
    </>
  );
}
