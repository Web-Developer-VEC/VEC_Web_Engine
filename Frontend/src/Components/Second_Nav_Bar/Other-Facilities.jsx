import { useEffect, useState } from "react";
import "./Other-Facilities.css";
import Banner from "../Banner";
import LoadComp from "../LoadComp";
import axios from "axios";

export default function OtherFacilities({ theme, toggle }) {
  const [activeTab, setActiveTab] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [otherFacilities, setOtherFacilities] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const getSafe = (value, index) => {
    return Array.isArray(value) ? value[index] || value[0] : value;
  };

  const currentFacility = otherFacilities?.find(
    (facility) => facility?.title === activeTab
  );

  const nextImage = () => {
    if (!currentFacility) return;
    const images = Array.isArray(currentFacility.image_path)
      ? currentFacility.image_path
      : [currentFacility.image_path];
    setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (!currentFacility) return;
    const images = Array.isArray(currentFacility.image_path)
      ? currentFacility.image_path
      : [currentFacility.image_path];
    setImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/other_facilities", {
          type: "other_facilities",
        });
        const data = response.data.data;
        setOtherFacilities(data);
        setActiveTab(data[0]?.title || null);
      } catch (error) {
        console.error("Error fetching Other facilities", error);
      }
    };
    fetchData();
  }, []);

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

  if (!otherFacilities || !currentFacility) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }

  const images = Array.isArray(currentFacility.image_path)
    ? currentFacility.image_path
    : [currentFacility.image_path];

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Others.webp"
        headerText="OTHER FACILITES"
        subHeaderText="Fostering excellence in social service and community well-being."
      />
      <div className="facilities-container bg-prim dark:bg-drkp">
        {/* Tabs */}
        <div className="tabs-container">
          {otherFacilities?.map((facility) => (
            <button
              key={facility?.title}
              className={`tab-button ${
                activeTab === facility?.title ? "active-tab" : ""
              } bg-secd dark:bg-drks text-text`}
              onClick={() => {
                setActiveTab(facility?.title);
                setImageIndex(0);
              }}
            >
              {facility?.title}
            </button>
          ))}
        </div>


        {/* Content Section */}
        <div className="content-container">
          <h2 className="current-facility text-brwn dark:text-drkt">
            {getSafe(currentFacility.name, imageIndex)}
          </h2>
          <p>{getSafe(currentFacility.description, imageIndex)}</p>
          {/* Image Carousel */}
          <div className="carousel">
            {images.length > 1 && (
              <button className="prev" onClick={prevImage}>
                ❮
              </button>
            )}
            <img
              src={UrlParser(images[imageIndex])}
              alt={activeTab}
              className="carousel-img"
            />
            {images.length > 1 && (
              <button className="next" onClick={nextImage}>
                ❯
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
