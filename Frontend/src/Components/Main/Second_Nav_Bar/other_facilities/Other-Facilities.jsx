import { useEffect, useState } from "react";
import "./Other-Facilities.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";

export default function OtherFacilities({ theme, toggle }) {
  const [activeTab, setActiveTab] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [otherFacilities, setOtherFacilities] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const currentFacility = otherFacilities?.find(
    (facility) => facility?.category === activeTab
  );

  // All image paths for the active category (content is an array of {name, description, image_path})
  const images =
    currentFacility?.content?.map((item) => item?.image_path).filter(Boolean) || [];

  // Only the first content item usually carries name/description;
  // subsequent ones (extra images) have them blank, so fall back to the first.
  const currentName =
    currentFacility?.content?.[imageIndex]?.name ||
    currentFacility?.content?.[0]?.name ||
    "";
  const currentDescription =
    currentFacility?.content?.[imageIndex]?.description ||
    currentFacility?.content?.[0]?.description ||
    "";

  const nextImage = () => {
    if (!images.length) return;
    setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/other_facilities", {
          type: "other_facilities",
        });

        // Response shape: [{ type: "other_facilities", data: [ {category, content: [...]}, ... ] }]
        const payload = response.data;
        const data = Array.isArray(payload) ? payload[0]?.data : payload?.data;

        setOtherFacilities(data || []);
        setActiveTab(data?.[0]?.category || null);
      } catch (error) {
        console.error("Error fetching Other facilities", error);
        if (error?.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
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

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Others.webp"
        headerText="OTHER FACILITIES"
        subHeaderText="Fostering excellence in social service and community well-being."
      />
      <div className="facilities-container bg-prim dark:bg-drkp">
        {/* Tabs */}
        <div className="tabs-container">
          {otherFacilities?.map((facility) => (
            <button
              key={facility?.category}
              className={`tab-button ${
                activeTab === facility?.category ? "active-tab" : ""
              } bg-secd dark:bg-drks text-text`}
              onClick={() => {
                setActiveTab(facility?.category);
                setImageIndex(0);
              }}
            >
              {facility?.category}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="content-container">
          <h2 className="current-facility text-brwn dark:text-drkt">
            {currentName}
          </h2>
          <p>{currentDescription}</p>

          {/* Image Carousel */}
          <div className="carousel">
            {images.length > 1 && (
              <button className="prev" onClick={prevImage}>
                ❮
              </button>
            )}
            {images.length > 0 && (
              <img
                src={UrlParser(images[imageIndex])}
                alt={activeTab}
                className="carousel-img"
              />
            )}
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