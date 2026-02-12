import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Gallery.css";
import Banner from "../../Banner";
import axios from "axios";
import LoadComp from "../../LoadComp";
import { Pencil, Plus, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const Admingallery = ({ toggle, theme }) => {
  const navigate = useNavigate();

  const [gallery, setGallery] = useState([]);
  const [originalGallery, setOriginalGallery] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Edit mode
  const [editMode, setEditMode] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmpopup, setConfirmPopup] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newPhotos, setNewPhotos] = useState([]);
  const [newGallery, setNewGalleries] = useState([]);
  const [newLinks, setNewLinks] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [showRequest, setShowrequest] = useState(false);

  const { sendRequest, loading, error } = useAdminRequest();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") || path?.startsWith("blob")
      ? path
      : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.post("/api/main-backend/gallery", {
          type: "gallery",
        });
        const data = response.data.data;
        setGallery(data);
        setOriginalGallery(data); // keep original snapshot
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
  }, [navigate]);

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
      youtubeUrl: newLinks,
      previewUrls: newPhotos.map((f) => URL.createObjectURL(f)),
    };

    const categoryExists = gallery.some(
      (g) =>
        g.category.toLowerCase() === newGalleryData.category.toLowerCase()
    );

    setGallery([
      ...gallery,
      {
        category: newGalleryData.category,
        image_path: newGalleryData.previewUrls,
      },
    ]);

    setNewGalleries((prev) => [
      ...prev,
      {
        category: newGalleryData.category,
        files: newGalleryData.files,
        links: newGalleryData.youtubeUrl,
        action: !categoryExists ? "insert" : "update",
        original: categoryExists
          ? originalGallery.find(
              (g) =>
                g.category.toLowerCase() ===
                newGalleryData.category.toLowerCase()
            )
          : null,
      },
    ]);

    setNewTitle("");
    setNewPhotos([]);
    setNewLinks([]);
    setShowAddModal(false);
    toast.success("Gallery image added successfully");
  };

  const handleConfirmRequest = async () => {
    if (newGallery.length === 0) {
      toast.error("No new galleries to upload.");
      return;
    }

    const payload = newGallery.map((galleryItem) => {
      const imagePaths = [];

      if (galleryItem.files?.length) {
        galleryItem.files.forEach((f) => {
          imagePaths.push(
            `/static/images/gallery/${galleryItem.category
              .toLowerCase()
              .replace(/\s+/g, "_")}/${f.name}`
          );
        });
      }

      if (galleryItem.image_path?.length) {
        imagePaths.push(...galleryItem.image_path);
      }

      if (galleryItem.links?.length) {
        imagePaths.push(...galleryItem.links);
      }

      const metaData = {
        category: galleryItem.category,
        image_path: imagePaths,
      };

      return {
        collectionName: "gallery",
        collection_type: "gallery",
        action: galleryItem.action,
        title:
          galleryItem.action === "insert"
            ? "insertion of gallery"
            : galleryItem.action === "delete"
            ? "deletion of gallery"
            : "update of gallery",
        category: galleryItem.category,
        meta_data: metaData,
        original_data: galleryItem.original || null,
      };
    });

    const files = newGallery.flatMap((item) => item.files || []);

    const result = await sendRequest(payload, files);

    if (result) {
      setConfirmPopup(false);
      setNewGalleries([]);
      setEditMode(false);
      toast.success("Changes requested successfully");
    }
  };

  const confirmDelete = () => {
    setGallery(gallery.filter((g) => g !== deleteTarget));
    setNewGalleries((prev) => [
      ...prev,
      {
        category: deleteTarget.category,
        files: [],
        links: [],
        action: "delete",
        original: originalGallery.find(
          (g) => g.category === deleteTarget.category
        ),
      },
    ]);
    setShowDeleteModal(false);
    toast.success(
      `The ${deleteTarget.category} deleted successfully! Click "Request" to confirm.`
    );
  };

  const handleCancelEdit = () => {
    setGallery(originalGallery); // restore snapshot
    setNewGalleries([]);
    setEditMode(false);
    toast.info("Changes discarded");
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

          {/* Edit / Cancel buttons */}
          <div className="flex justify-end p-4 gap-2">
            {!editMode && (
              <button
                className="px-4 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded flex items-center gap-2"
                onClick={() => setEditMode(true)}
              >
                <Pencil /> Edit
              </button>
            )}
          </div>

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
                    <h2 className="admingallery-title-text">
                      {img?.category}
                    </h2>
                    {!editMode && (
                      <button
                        className="read-more-button bg-secd dark:bg-drks"
                        onClick={() =>
                          navigate(`/gallery_details`, {
                            state: {
                              imagespath: img?.image_path,
                              title: img?.category,
                            },
                          })
                        }
                      >
                        Read More
                      </button>
                    )}

                    {/* Delete Icon in edit mode */}
                    {editMode && (
                      <button
                        onClick={() => {
                          setDeleteTarget(img);
                          setShowDeleteModal(true);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-800"
                      >
                        <Trash2 size={18} color="white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Card */}
              {editMode && (
                <div
                  onClick={() => setShowAddModal(true)}
                  className="admingallery-card flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-yellow-500"
                >
                  <Plus size={40} color="gray" />
                </div>
              )}
            </div>

            {/* Save + cancel button */}
            {editMode && (
              <div className="flex justify-end gap-2 w-full p-6">
                <button className="px-4 py-2 bg-gray-400 text-white rounded px-4 py-2" onClick={() => setEditMode(false)}>cancel</button>
                {newGallery.length > 0 && (
                  <button className="bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt px-4 py-2" onClick={() => {setShowrequest(true); setEditMode(false)}}>Save</button>
                )}
              </div>
            )}

            {/* Request Button */}
            {!editMode &&  showRequest && (
              <div className="p-6 flex justify-end gap-2">
                <button
                  className="p-[12px] bg-gray-400 dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                  onClick={() => {
                    setGallery(originalGallery); // restore original gallery
                    setNewGalleries([]);         // clear pending changes
                    setShowrequest(false);
                  }}
                >
                  Discard Changes
                </button>
                <button
                  className="p-[12px] bg-secd dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                  onClick={() => setConfirmPopup(true)}
                >
                  <Send />
                  Request
                </button>
              </div>
            )}
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
            <h2 className="text-xl font-bold mb-2 dark:text-drkt text-text">
              Add New Gallery
            </h2>
            <p className="text-sm text-red-500 mb-4">
              *Provide a clear and appropriate title for the event. <br />
              *Upload event images carefully —{" "}
              <span className="font-semibold">the first image</span> you upload
              will be used as the thumbnail. <br />
              *Once submitted, images cannot be modified.
            </p>
            <input
              type="text"
              placeholder="Category Title"
              className="border p-2 mb-3 w-full rounded bg-transparent text-text dark:text-drkt"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="file"
              multiple
              className="mb-3"
              accept="image/*"
              onChange={(e) => setNewPhotos([...e.target.files])}
            />
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

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          onClick={() => {
            setDeleteTarget(null);
            setShowDeleteModal(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-xl w-[350px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 text-black">
              Confirm Delete
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Are you sure you want to delete category "
              {deleteTarget?.category}" with all photos ?
            </p>
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

      {/* Confirm request modal */}
      {confirmpopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the 
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              {newGallery.length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt">
                  <thead>
                    <tr>
                      <th className="py-1">Action</th>
                      <th className="py-1">Section</th>
                      <th className="py-1">Changes</th>
                      <th className="py-1">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newGallery.map((g, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          {g.action === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {g.action === "update" && (
                            <span className="text-blue-600">✎ Edited</span>
                          )}
                          {g.action === "delete" && (
                            <span className="text-red-600">– Deleted</span>
                          )}
                        </td>
                        <td className="py-1">{g.category}</td>
                        <td className="py-1">
                          {g.files.length} images
                          {g.links.length > 0
                            ? `, ${g.links.length} links`
                            : ""}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              // Remove this change from newGallery
                              setNewGalleries(prev => prev.filter((_, idx) => idx !== i));

                              // If it was an "insert", remove the gallery from the displayed gallery
                              if (g.action === "insert") {
                                setGallery(prev => prev.filter(item => item.category !== g.category));
                              }

                              // If it was a "delete", restore the original item
                              if (g.action === "delete" && g.original) {
                                setGallery(prev => [...prev, g.original]);
                              }

                              // If it was an "update", restore the original images
                              if (g.action === "update" && g.original) {
                                setGallery(prev =>
                                  prev.map(item =>
                                    item.category === g.category ? g.original : item
                                  )
                                );
                              }
                            }}
                          >
                            <X />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No gallery changes found.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${loading ? "cursor-progress" : "hover:bg-[#800000]"}`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admingallery;