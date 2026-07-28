import { useEffect, useState, useRef } from "react";
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
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();

  // Tracks which full URLs have already finished loading at least once,
  // so we don't show the spinner again for images already in the browser cache.
  const loadedUrlsRef = useRef(new Set());

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

  const currentImageUrl = images.length ? UrlParser(images[imageIndex]) : null;

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

  // Whenever the image we're about to show changes, decide up front whether
  // we already have it cached. If we do, skip the spinner entirely so there's
  // no flicker; if not, show the spinner until it finishes loading.
  useEffect(() => {
    if (!currentImageUrl) {
      setImageLoading(false);
      return;
    }
    setImageLoading(!loadedUrlsRef.current.has(currentImageUrl));
  }, [currentImageUrl]);

  // Preload every image in the active category in the background as soon as
  // the category is known, so switching between images the user has already
  // "visited" in this session feels instant.
  useEffect(() => {
    if (!images.length) return;

    images.forEach((path) => {
      const url = UrlParser(path);
      if (!url || loadedUrlsRef.current.has(url)) return;

      const img = new Image();
      img.onload = () => {
        loadedUrlsRef.current.add(url);
        // If the image that just finished preloading is the one currently
        // shown on screen, clear its spinner right away.
        if (url === currentImageUrl) {
          setImageLoading(false);
        }
      };
      img.src = url;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleImageLoaded = () => {
    if (currentImageUrl) {
      loadedUrlsRef.current.add(currentImageUrl);
    }
    setImageLoading(false);
  };

  const handleImageError = () => {
    // Don't leave the spinner spinning forever on a broken image.
    setImageLoading(false);
  };

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
                if (facility?.category === activeTab) return;
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
          <div className="carousel" style={{ position: "relative" }}>
            {images.length > 1 && (
              <button className="prev" onClick={prevImage} disabled={imageLoading}>
                ❮
              </button>
            )}

            {images.length > 0 && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {imageLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                  >
                    <LoadComp txt={""} />
                  </div>
                )}
                <img
                  key={currentImageUrl}
                  src={currentImageUrl}
                  alt={activeTab}
                  className="carousel-img"
                  onLoad={handleImageLoaded}
                  onError={handleImageError}
                  style={{
                    opacity: imageLoading ? 0 : 1,
                    transition: "opacity 0.25s ease-in-out",
                  }}
                />
              </div>
            )}

            {images.length > 1 && (
              <button className="next" onClick={nextImage} disabled={imageLoading}>
                ❯
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}