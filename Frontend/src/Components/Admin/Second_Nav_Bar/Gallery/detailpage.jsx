import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadComp from "../../LoadComp";
import { Pencil } from "lucide-react";
//import "./Gallerydetails.css";

export default function Admingallerydetails() {
  const [modalImage, setModalImage] = useState(null);
  const [pagetitle, setPageTitle] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const [imagePaths, setImagePaths] = useState([]);
  const [links, setLinks] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [galleryItem, setGalleryItem] = useState(null);

  // Add these
  const [showManageImagesModal, setShowManageImagesModal] = useState(false);
  const [manageImagesTarget, setManageImagesTarget] = useState(null);
  const [deleteImageTarget, setDeleteImageTarget] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [files, setManageImagesPreview] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (location.state && location.state.imagespath) {
      setImagePaths(location.state.imagespath);
      setPageTitle(location.state.title);
      setLinks(location.state.link);

      setEditMode(location.state.editMode || false);
      setGalleryItem(location.state.galleryItem || null);
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
      {links || imagePaths ? (
        <div className="gallery-container">
          <div className="relative mb-8">
            {/* Edit Button - Top Right */}
            <div className="flex justify-end mb-4">
              <button
                className="read-more-button bg-secd dark:bg-drks"
                onClick={() =>
                  navigate("/gallery", {
                    state: {
                      editMode: true,
                    },
                  })
                }
              >
                Edit
              </button>
            </div>

            {/* Heading */}
            <h2 className="gallery-title text-brwn dark:text-drkt">
              {pagetitle}
            </h2>

            {/* Edit Images Button */}
            {editMode && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setManageImagesTarget(galleryItem);
                    setShowManageImagesModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-black font-semibold shadow-md"
                >
                  <Pencil size={18} />
                  Edit Images
                </button>
              </div>
            )}
          </div>

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
          <div className="gallery-images-container">
            <div className="gallery-grid-details">
              {images.map((item, i) => (
                <div key={i} className="gallery-card-details">
                  <img
                    src={UrlParser(item)}
                    alt={`Gallery ${i}`}
                    className="gallery-image-details"
                    onClick={() => setModalImage(UrlParser(item))}
                  />
                </div>
              ))}
            </div>
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
