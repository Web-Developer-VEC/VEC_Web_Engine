import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadComp from "../../LoadComp";
import { Send, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Admingallerydetails() {
  const [modalImage, setModalImage] = useState(null);
  const [pagetitle, setPageTitle] = useState(null);

  const location = useLocation();
  const [imagePaths, setImagePaths] = useState([]);

  // Modal for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletedItems, setDeletedItems] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (location.state && location.state.imagespath) {
      setImagePaths(location.state.imagespath);
      setPageTitle(location.state.title || "Gallery Details");
    }
  }, [location.state]);

  // Separate videos and images
  const videos = imagePaths.filter(
    (path) => path.includes("youtube.com") || path.includes("youtu.be")
  );

  const images = imagePaths.filter(
    (path) =>
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(path) &&
      !path.includes("youtube.com") &&
      !path.includes("youtu.be")
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

  // Confirm delete
  const confirmDelete = () => {
    // Track what’s deleted
    // setDeletedItems((prev) => [...prev, deleteTarget ]);
    setDeletedItems((prev) => [
      ...prev,
      { action: "Deleted", section: pagetitle, target: deleteTarget }
    ]);

    // Hide delete modal
    setShowDeleteModal(false);
    setDeleteTarget(null);

    // Update UI immediately (soft delete)
    setImagePaths(imagePaths.filter((p) => p !== deleteTarget));
  };
  
  const deletedImages = deletedItems.filter(
    (item) => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(item.target)
  );

  const deletedLinks = deletedItems.filter(
    (item) => item.target.includes("youtube.com") || item.target.includes("youtu.be")
  );

  return (
    <>
      {videos || images ? (
        <div className="admingallery-container">
          <h2 className="admingallery-title">{pagetitle}</h2>

          {/* Videos */}
          <div className="admingallery-videos elementor-widget-wrap">
            {videos?.map((item, i) => (
              <div key={i} className="admingallery-item-video relative">
                <div className="video-wrapper">
                  <iframe
                    src={getYouTubeEmbedUrl(item)}
                    title={"Videos"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => {
                    setDeleteTarget(item);
                    setShowDeleteModal(true);
                  }}
                  className="absolute top-2 right-2 bg-red-600 p-2 rounded-full hover:bg-red-800"
                >
                  <Trash2 size={18} color="white" />
                </button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="admingallery-gri">
            {images?.map((item, i) => (
              <div key={i} className="admingallery-item relative">
                <img
                  src={UrlParser(item)}
                  alt={"Images"}
                  onClick={() => setModalImage(UrlParser(item))}
                />
                {/* Delete Button */}
                <button
                  onClick={() => {
                    setDeleteTarget(item);
                    setShowDeleteModal(true);
                  }}
                  className="absolute top-2 right-2 bg-red-600 p-2 rounded-full hover:bg-red-800"
                >
                  <Trash2 size={18} color="white" />
                </button>
              </div>
            ))}
          </div>
          <ToastContainer position="bottom-right" autoClose={3000} />
          {deletedItems.length > 0 && (
            <div className="p-6 flex justify-end">
              <button className="p-[12px] bg-secd dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                    onClick={() => setShowRequestModal(true)}
              ><Send/>Request</button>
            </div>
          )}
          {/* Popup Modal */}
          {modalImage && (
            <div
              className="modal-overlay"
              onClick={() => setModalImage(null)}
            >
              <span
                className="close-btn"
                onClick={() => setModalImage(null)}
              >
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
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[350px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 dark:text-drkt text-text">Confirm Delete</h2>
            <p className="dark:text-drkt text-text mb-4">
              Are you sure you want to delete this item?
            </p>
            <div className="p-4 mb-2">
              <img src={UrlParser(deleteTarget)} alt="Delete Image" className="w-full h-auto rounded" />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-800 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request model */}
      {showRequestModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. 
              Once approved, they will be applied automatically to the live site.
            </p>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Action</th>
                  <th className="py-2">Section</th>
                  <th className="py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-red-500 font-medium">Deleted</td>
                  <td className="py-2">{pagetitle}</td>
                  <td className="py-2">
                    {deletedImages.length} images
                    {deletedLinks.length > 0 ? `, ${deletedLinks.length} links` : ""}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin-backend/gallery/delete`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "gallery",
                        category: pagetitle,
                        image_path: deletedItems.map((d) => d.target), // send full list to backend
                      }),
                    });
                    const data = await res.json();
                    // alert("Request sent successfully!");
                    setShowRequestModal(false);
                    setDeletedItems([]);
                    toast.success("Request submitted successfully!");
                  } catch (error) {
                    console.error("Error sending request:", error);
                    alert("Failed to send request");
                  }
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
