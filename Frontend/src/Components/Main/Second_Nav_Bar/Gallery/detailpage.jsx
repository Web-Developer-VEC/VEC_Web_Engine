import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadComp from "../../LoadComp";
// import "./Gallerydetails.css";

export default function Gallerydetails() {
  const [modalImage, setModalImage] = useState(null);
  const [pagetitle, setPageTitle] = useState(null);

  const location = useLocation();
  const [imagePaths, setImagePaths] = useState([]);
  const [links, setLinks] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (location.state && location.state.imagespath) {
      setImagePaths(location.state.imagespath);
      setPageTitle(location.state.title);
      setLinks(location.state.link);
    }
  }, [location.state]);

  // Separate videos and images
  const videos = imagePaths.filter(
    (path) => path.includes("youtube.com") || path.includes("youtu.be"),
  );

  const images = imagePaths.filter(
    (path) =>
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(path) &&
      !path.includes("youtube.com") &&
      !path.includes("youtu.be"),
  );

  const getYouTubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "youtu.be") {
        return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      } else if (urlObj.hostname.includes("youtube.com")) {
        const videoId = urlObj.searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (e) {
      console.error("Invalid YouTube URL:", url);
      return url;
    }
  };

  console.log(links, imagePaths, pagetitle);

  return (
    <>
      {imagePaths.length > 0 ? (
        <div className="gallery-container">
          <h2 className="gallery-title text-brwn dark:text-drkt">
            {pagetitle}
          </h2>

          {/* Videos First */}
          <div className="gallery-videos elementor-widget-wrap">
            {links && (
              <>
                {links?.map((item, i) => (
                  <div key={i} className="gallery-item-video">
                    <div className="video-wrapper">
                      <iframe
                        src={getYouTubeEmbedUrl(item)}
                        title={"Videos"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    {/* <p>{item.title}</p> */}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Images Next */}
          <div className="gallery-grid1">
            {images.map((item, i) => (
              <div key={i} className="gallery-card">
                <img
                  src={UrlParser(item)}
                  alt={`Gallery ${i}`}
                  className="gallery-image"
                  onClick={() => setModalImage(UrlParser(item))}
                />
              </div>
            ))}
          </div>

          {/* Popup Modal */}
          {modalImage && (
            <div className="modal-overlay" onClick={() => setModalImage(null)}>
              <span className="close-btn" onClick={() => setModalImage(null)}>
                &times;
              </span>
              <img
                className="modal-image"
                src={modalImage}
                alt="Popup"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className={
            "h-screen flex items-center justify-center md:mt-[15%] md:block"
          }
        >
          <LoadComp />
                  
        </div>
      )}
    </>
  );
}
