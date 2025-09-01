import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Gallery.css";
import Banner from "../../Banner";
import axios from "axios";
import LoadComp from "../../LoadComp";
import { Plus, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admingallery = ({ toggle, theme }) => {
  const navigate = useNavigate();

  const [gallery, setGallery] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newPhotos, setNewPhotos] = useState([]);
  const [newGallery,setNewGalleries] = useState([]);
  const [confirmpopup,setConfirmPopup] = useState(false);
  const [newLinks, setNewLinks] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.post("/api/main-backend/gallery", {
          type: "gallery",
        });
        const data = response.data.data;
        setGallery(data);
      } catch (error) {
        console.error("Error fetching gallery data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };

    fetchdata();
  }, []);

  // Track network
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

  // Add new gallery
  const handleAddGallery = () => {
    if (!newTitle.trim() || newPhotos.length === 0) return;

    const newGalleryData = {
      category: newTitle,
      files: newPhotos,
      youtubeUrl : newLinks,
      previewUrls: newPhotos.map((f) => URL.createObjectURL(f)),
    };

    const categoryExists = gallery.some(
      (g) => g.category.toLowerCase() === newGalleryData.category.toLowerCase()
    );

    setGallery([
      ...gallery,
      { category: newGalleryData.category, image_path: newGalleryData.previewUrls}
    ]);

    setNewGalleries((prev) => [
      ...prev,
      { category: newGalleryData.category, files: newGalleryData.files, links: newGalleryData.youtubeUrl, action: categoryExists ? "insert" : "update",}
    ]);

    setNewTitle("");
    setNewPhotos([]);
    setNewLinks([]);
    setShowAddModal(false);
    alert("Gallery image added successfully");
  };

  const handleConfirmRequest = () => {
    if (newGallery.length === 0) {
      alert("No new galleries to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("type", "gallery");

    newGallery.forEach((galleryItem, galleryIndex) => {
      galleryItem.files.forEach((file, fileIndex) => {
        const extension = file.name.split(".").pop();
        const newFileName = `${galleryItem.category}_${fileIndex + 1}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });

        // Use structured keys so backend can group them
        formData.append("files", renamedFile);
        formData.append("categories", galleryItem.category);
        formData.append("action", galleryItem.action);
      });

      formData.append("links", JSON.stringify(galleryItem.links));
    });

    fetch(`/api/admin-backend/${"gallery"}/temp`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Gallery uploaded:", data);
        setConfirmPopup(false);
        setNewGalleries([]);
        toast.success("Request submitted successfully!");
      })
      .catch((err) => {
        console.error("Upload failed", err);
      });
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      {gallery ? (
        <>
          <Banner
            toggle={toggle}
            theme={theme}
            backgroundImage="./Banners/Gallery.webp"
            headerText="Gallery"
            subHeaderText="Some pics of velammal Engineering Collage"
          />
          <div className="admingallery-container overflow-y-auto">
            <h1 className="admingallery-title text-brwn dark:text-drkt">
              Gallery
            </h1>
            <div className="admingallery-grid1">
              {gallery?.map((img, i) => (
                <div key={i} className="admingallery-card relative">
                  <img
                    src={UrlParser(img?.image_path[0])}
                    alt={img?.category}
                    className="admingallery-image"
                  />
                  <div className="admingallery-content">
                    <h2 className="admingallery-title-text">{img?.category}</h2>
                                        <button
                      className="read-more-button bg-secd dark:bg-drks"
                      onClick={() =>
                        navigate(`/admin_gallery-details`, {
                          state: { imagespath: img?.image_path, title: img?.category },
                        })
                      }
                    >
                      Read More
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Card */}
              <div
                onClick={() => setShowAddModal(true)}
                className="admingallery-card flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-yellow-500"
              >
                <Plus size={40} color="gray" />
              </div>
            </div>
            <div className="p-6 flex justify-end">
              <button className="p-[12px] bg-secd dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                      onClick={() => setConfirmPopup(true)}
              ><Send/>Request</button>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
            onClick={() => {
              setShowAddModal(false);
              setNewTitle("");
              setNewPhotos([]);
            }}
        >
          <div
            className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title */}
            <h2 className="text-xl font-bold mb-2 dark:text-drkt text-text">
              Add New Gallery
            </h2>

            {/* Instructions */}
            <p className="text-sm text-red-500 dark:text-red-300 mb-4">
              *Provide a clear and appropriate title for the event. <br />
              *Upload event images carefully — <span className="font-semibold">the first image</span> you upload will be used as the thumbnail. <br />
              *Once submitted, images cannot be modified.
            </p>

            {/* Title Input */}
            <input
              type="text"
              placeholder="Category Title"
              className="border p-2 mb-3 w-full rounded bg-transparent text-text dark:text-drkt"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            {/* File Input */}
            <input
              type="file"
              multiple
              className="mb-3"
              onChange={(e) => setNewPhotos([...e.target.files])}
            />

            {/* Preview Section */}
            {newPhotos?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 max-h-[120px] overflow-y-auto">
                {newPhotos.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            {/* YouTube Link Input */}
            <div className="mb-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="YouTube video link"
                  className="border p-2 w-full rounded bg-transparent text-text dark:text-drkt"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-secd dark:drks text-text rounded"
                  onClick={() => {
                    if (linkInput.trim()) {
                      setNewLinks([...newLinks, linkInput.trim()]);
                      setLinkInput("");
                    }
                  }}
                >
                  Add
                </button>
              </div>

              {/* Preview Links */}
              {newLinks.length > 0 && (
                <ul className="mt-2 text-sm text-text dark:text-drkt">
                  {newLinks.map((link, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span>{link}</span>
                      <button
                        onClick={() =>
                          setNewLinks(newLinks.filter((_, idx) => idx !== i))
                        }
                        className="text-red-500"
                      >
                        <X />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTitle("");
                  setNewPhotos([]);
                  setNewLinks([]);
                }}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGallery}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmpopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            
            {/* Title */}
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            {/* Note */}
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. 
              Once approved, they will be applied automatically to the live site.
            </p>

            {/* Summary List */}
            <div className="max-h-[200px] overflow-y-auto mb-4">
              {newGallery.length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt">
                  <thead>
                    <tr>
                      <th className="py-1">Action</th>
                      <th className="py-1">Section</th>
                      <th className="py-1">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newGallery.map((g, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          {g.action === "insert" && <span className="text-green-600">+ Added</span>}
                          {g.action === "update" && <span className="text-blue-600">✎ Edited</span>}
                        </td>
                        <td className="py-1">{g.category}</td>
                        <td className="py-1">{g.files.length} images{g.links.length > 0 ? `, ${g.links.length} links` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No gallery changes found.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admingallery;