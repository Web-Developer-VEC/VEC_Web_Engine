import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Gallery.css";
import Banner from "../../Banner";
import axios from "axios";
import LoadComp from "../../LoadComp";
import { Pencil, Plus, Send, Trash2, X, Upload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const Admingallery = ({ toggle, theme }) => {
  const navigate = useNavigate();

  const [gallery, setGallery] = useState([]);
  const [originalGallery, setOriginalGallery] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  const [editMode, setEditMode] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmpopup, setConfirmPopup] = useState(false);

  const [showManageImagesModal, setShowManageImagesModal] = useState(false);
  const [manageImagesTarget, setManageImagesTarget] = useState(null);
  const [deleteImageTarget, setDeleteImageTarget] = useState(null);
  const [files, setManageImagesPreview] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [replaceImageTarget, setReplaceImageTarget] = useState(null);
  const [replaceImageFile, setReplaceImageFile] = useState(null);

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
        setOriginalGallery(data);
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

  useEffect(() => {
    if (location.state && location.state.editMode !== undefined) {
      setEditMode(location.state.editMode);
    }
  }, [location.state]);

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

  const handleAddGallery = () => {
    if (!newTitle.trim()) return;

    const newGalleryData = {
      category: newTitle,
      files: newPhotos,
      youtubeUrl: newLinks,
      previewUrls: newPhotos.length
        ? newPhotos.map((f) => URL.createObjectURL(f))
        : [],
    };

    const categoryExists = gallery.some(
      (g) => g.category.toLowerCase() === newGalleryData.category.toLowerCase(),
    );
    if (categoryExists) {
      setGallery((prev) =>
        prev.map((g) =>
          g.category.toLowerCase() === newGalleryData.category.toLowerCase()
            ? {
                ...g,
                image_path: [...g.image_path, ...newGalleryData.previewUrls],
              }
            : g,
        ),
      );
    } else {
      setGallery((prev) => [
        ...prev,
        {
          category: newGalleryData.category,
          image_path: newGalleryData.previewUrls,
        },
      ]);
    }

    setNewGalleries((prev) => [
      ...prev,
      {
        category: newGalleryData.category,
        files: newGalleryData.files,
        links: newGalleryData.youtubeUrl,
        image_path: [],
        action: "insert",
        deleteType: null,
        original: null,
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
      // Full category delete -> empty meta_data, null original_data
      if (galleryItem.deleteType === "category") {
        return {
          collectionName: "gallery",
          collection_type: "gallery",
          action: "delete",
          title: "deletion of category in gallery",
          category: galleryItem.category,
          meta_data: {},
          original_data: null,
        };
      }

      // Single/multiple image delete -> ONLY the deleted image path(s),
      // never the rest of the category's images.
      if (galleryItem.deleteType === "image") {
        return {
          collectionName: "gallery",
          collection_type: "gallery",
          action: "delete",
          title: "deletion of gallery image(s)",
          category: galleryItem.category,
          meta_data: {
            image_path: galleryItem.image_path,
          },
          original_data: null,
        };
      }

      // Insert (brand-new category) OR Update (images added on an
      // existing category). Both build the same way — the only thing that
      // changes is the `action`/`title` we actually send, which now tracks
      // the real action instead of always being "insert".
      const imagePaths = [];

      if (galleryItem.files?.length) {
        galleryItem.files.forEach((f) => {
          imagePaths.push(
            `/static/images/gallery/${galleryItem.category
              .toLowerCase()
              .replace(/\s+/g, "_")}/${f.name}`,
          );
        });
      }

      if (galleryItem.image_path?.length) {
        imagePaths.push(...galleryItem.image_path);
      }

      if (galleryItem.links?.length) {
        imagePaths.push(...galleryItem.links);
      }

      return {
        collectionName: "gallery",
        collection_type: "gallery",
        action: "insert",
        title: "insertion of gallery",
        category: galleryItem.category,
        meta_data: {
          image_path: imagePaths,
        },
        original_data:
          galleryItem.action === "update" ? galleryItem.original || null : null,
      };
    });

    const files = newGallery.flatMap((item) => item.files || []);

    const result = await sendRequest(payload, files);

    if (result) {
      setConfirmPopup(false);
      setNewGalleries([]);
      setEditMode(false);

      // Hide the Request button
      setShowrequest(false);

      // Update original gallery to current gallery
      setOriginalGallery(gallery);
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
        deleteType: "category", // -> "deletion of category in gallery"
        original: originalGallery.find(
          (g) => g.category === deleteTarget.category,
        ),
      },
    ]);
    setShowDeleteModal(false);
    toast.success(
      `The ${deleteTarget.category} deleted successfully! Click "Request" to confirm.`,
    );
  };

  // Remove a single image from an existing category.
  // This creates/updates a DEDICATED "delete" entry per category that holds
  // ONLY the image path(s) actually being deleted — never the rest of the
  // category's images, and never merged into an insert/update entry. That
  // keeps the request payload minimal: deleting 1 image sends 1 path, not
  // the whole remaining array relabeled as an "update".
  const confirmDeleteImage = () => {
    if (!deleteImageTarget) return;

    const { category, imagePaths } = deleteImageTarget;

    // Remove all selected images from gallery preview
    setGallery((prev) =>
      prev.map((g) =>
        g.category === category
          ? {
              ...g,
              image_path: g.image_path.filter((p) => !imagePaths.includes(p)),
            }
          : g,
      ),
    );

    // Store all deleted images
    setNewGalleries((prev) => {
      const existing = prev.find(
        (g) => g.category === category && g.deleteType === "image",
      );

      if (existing) {
        const merged = [...new Set([...existing.image_path, ...imagePaths])];

        return prev.map((g) =>
          g === existing
            ? {
                ...g,
                image_path: merged,
              }
            : g,
        );
      }

      return [
        ...prev,
        {
          category,
          files: [],
          links: [],
          action: "delete",
          deleteType: "image",
          image_path: imagePaths, // ✅ Store all selected images
          original: null,
        },
      ];
    });

    setDeleteImageTarget(null);
    setSelectedImages([]);

    toast.success(
      `${imagePaths.length} image${imagePaths.length > 1 ? "s" : ""} removed. Click Request to confirm.`,
    );
  };

  // Add more images to an existing category from inside the Manage Images modal
  const handleAddImagesToCategory = (files = files) => {
    if (!manageImagesTarget || files.length === 0) return;
    const category = manageImagesTarget.category;

    const newPreviewUrls = files.map((f) => URL.createObjectURL(f));

    setGallery((prev) =>
      prev.map((g) =>
        g.category === category
          ? { ...g, image_path: [...g.image_path, ...newPreviewUrls] }
          : g,
      ),
    );

    const existsOnServer = originalGallery.some((g) => g.category === category);

    setNewGalleries((prev) => {
      // Merge into an existing insert/update entry only — never into an
      // image-delete entry, so adds and deletes stay as separate requests.
      const existing = prev.find(
        (g) => g.category === category && g.deleteType !== "image",
      );

      if (existing) {
        return prev.map((g) =>
          g === existing ? { ...g, files: [...(g.files || []), ...files] } : g,
        );
      }

      if (existsOnServer) {
        const originalItem = originalGallery.find(
          (g) => g.category === category,
        );

        return [
          ...prev,
          {
            category,
            files: files,
            links: [],
            action: "insert", // ✅ Send as insert
            deleteType: null,
            image_path: originalItem?.image_path || [],
            original: originalItem,
          },
        ];
      }

      // Fallback: category not found anywhere yet, treat as a fresh insert
      return [
        ...prev,
        {
          category,
          files: files,
          links: [],
          action: "insert",
          deleteType: null,
          image_path: [],
          original: null,
        },
      ];
    });

    setManageImagesPreview([]);
    toast.success(`Images added to ${category}. Click "Request" to confirm.`);
  };

  const handleCancelEdit = () => {
    setGallery(originalGallery);
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
                    <h2 className="admingallery-title-text">{img?.category}</h2>
                    {!editMode && (
                      <button
                        className="read-more-button bg-secd dark:bg-drks"
                        onClick={() =>
                          navigate("/gallery_details", {
                            state: {
                              imagespath: img?.image_path,
                              title: img?.category,
                              link: img?.link,
                              editMode: editMode, // Pass edit mode
                              galleryItem: img, // Pass the whole gallery object
                            },
                          })
                        }
                      >
                        Read More
                      </button>
                    )}

                    {/* Edit Icon in edit mode — enters this category to manage its images */}
                    {editMode && (
                      <button
                        onClick={() => {
                          setManageImagesTarget(img);
                          setShowManageImagesModal(true);
                        }}
                        className="absolute top-2 left-2 p-2 bg-blue-600 rounded-full hover:bg-blue-800"
                      >
                        <Pencil size={18} color="white" />
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
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded px-4 py-2"
                  onClick={() => setEditMode(false)}
                >
                  cancel
                </button>
                {newGallery.length > 0 && (
                  <button
                    className="bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt px-4 py-2"
                    onClick={() => {
                      setShowrequest(true);
                      setEditMode(false);
                    }}
                  >
                    Save
                  </button>
                )}
              </div>
            )}

            {/* Request Button */}
            {!editMode && showRequest && newGallery.length > 0 && (
              <div className="p-6 flex justify-end gap-2">
                <button
                  className="p-[12px] bg-gray-400 dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                  onClick={() => {
                    setGallery(originalGallery);
                    setNewGalleries([]);
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
            <div className="flex justify-end gap-4 border-t p-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTitle("");
                  setNewPhotos([]);
                  setNewLinks([]);
                }}
                className="px-8 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGallery}
                className="px-8 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
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
              Are you sure you want to delete category "{deleteTarget?.category}
              " with all photos ?
            </p>
            <div className="flex justify-end gap-4 border-t p-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-8 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
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

      {/* Manage Images Modal — opened via the Edit icon on a category card */}
      {showManageImagesModal && manageImagesTarget && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          onClick={() => {
            setShowManageImagesModal(false);
            setManageImagesTarget(null);
            setManageImagesPreview([]);
          }}
        >
          <div
            className="bg-drkt dark:bg-drkp rounded-2xl w-[900px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-4 px-6 pt-6">
              <div>
                <h2 className="text-3xl font-bold text-text dark:text-drkt">
                  {manageImagesTarget.category}
                </h2>

                <p className="text-gray-500 text-sm">Manage gallery images</p>
              </div>

              <button
                onClick={() => {
                  setShowManageImagesModal(false);
                  setManageImagesTarget(null);
                  setManageImagesPreview([]);
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-5 px-6 pb-6">
              {/* Existing Images */}
              {gallery
                .find((g) => g.category === manageImagesTarget.category)
                ?.image_path.map((path, idx) => (
                  <div
                    key={`old-${idx}`}
                    className={`relative rounded-xl overflow-hidden shadow-md transition duration-300 hover:scale-105
        ${
          selectedImages.includes(path)
            ? "ring-4 ring-red-500"
            : "ring-1 ring-gray-300"
        }`}
                  >
                    <img
                      src={UrlParser(path)}
                      className="w-full h-40 object-cover"
                    />

                    <div className="absolute top-3 right-3">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(path)}
                        onChange={() => {
                          if (selectedImages.includes(path)) {
                            setSelectedImages(
                              selectedImages.filter((p) => p !== path),
                            );
                          } else {
                            setSelectedImages([...selectedImages, path]);
                          }
                        }}
                        className="w-6 h-6 accent-red-600"
                      />
                    </div>
                  </div>
                ))}

              {/* Newly Selected Images */}
              {files.map((file, idx) => (
                <div
                  key={`new-${idx}`}
                  className="relative rounded-xl overflow-hidden border-4 border-green-500"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-40 object-cover"
                  />

                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    New
                  </div>

                  <button
                    onClick={() =>
                      setManageImagesPreview((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>

            <hr className="my-4" />
            <div className="border-t px-6 py-5">
              <h3 className="text-2xl font-bold mb-4 text-center">
                Add New Images
              </h3>

              <div className="flex justify-center">
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg cursor-pointer transition">
                  <Upload size={18} />
                  Upload Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const selected = [...e.target.files];

                      setManageImagesPreview((prev) => [...prev, ...selected]);

                      // Allow selecting the same file again
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center border-t p-6">
              <div>
                {selectedImages.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedImages.length > 0) {
                        setDeleteImageTarget({
                          category: manageImagesTarget.category,
                          imagePaths: [...selectedImages], // ✅ Send all selected images
                        });
                      }
                    }}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Selected ({selectedImages.length})
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (files.length === 0) return;

                    handleAddImagesToCategory(files);

                    setManageImagesPreview([]);
                    setSelectedImages([]);
                    setShowManageImagesModal(false);
                    setManageImagesTarget(null);
                  }}
                  className="px-8 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Save ({files.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Image Delete Confirm */}
      {deleteImageTarget && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]"
          onClick={() => setDeleteImageTarget(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[350px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 text-black">
              Confirm Remove Image
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Are you sure you want to remove this image from "
              {deleteImageTarget.category}"?
            </p>
            <div className="flex justify-end gap-4 border-t p-6">
              <button
                onClick={() => setDeleteImageTarget(null)}
                className="px-8 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteImage}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-800 text-white"
              >
                Remove
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
                          {g.deleteType === "category" && (
                            <span className="text-red-600">– Deleted</span>
                          )}

                          {g.deleteType === "image" && (
                            <span className="text-red-600">– Delete</span>
                          )}

                          {!g.deleteType && (
                            <span className="text-green-600">+ Added</span>
                          )}
                        </td>
                        <td className="py-1">{g.category}</td>
                        <td className="py-1">
                          {g.deleteType === "category"
                            ? "Entire category"
                            : g.deleteType === "image"
                              ? `${g.image_path.length} image${
                                  g.image_path.length === 1 ? "" : "s"
                                } removed`
                              : `${g.files?.length || 0} image${
                                  g.files?.length === 1 ? "" : "s"
                                }${
                                  g.links?.length
                                    ? `, ${g.links.length} link${
                                        g.links.length === 1 ? "" : "s"
                                      }`
                                    : ""
                                }`}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              // Remove this change from newGallery
                              setNewGalleries((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              );

                              // Brand-new category -> remove it from the displayed gallery
                              if (!g.deleteType && g.action === "insert") {
                                setGallery((prev) =>
                                  prev.filter(
                                    (item) => item.category !== g.category,
                                  ),
                                );
                              }

                              // Full category delete -> restore the original item
                              if (g.deleteType === "category" && g.original) {
                                setGallery((prev) => [...prev, g.original]);
                              }

                              // Single/multiple image delete -> put those specific
                              // images back into the category, in their original order
                              if (g.deleteType === "image") {
                                const originalItem = originalGallery.find(
                                  (o) => o.category === g.category,
                                );
                                setGallery((prev) =>
                                  prev.map((item) => {
                                    if (item.category !== g.category)
                                      return item;
                                    if (originalItem) {
                                      const keepSet = new Set([
                                        ...item.image_path,
                                        ...g.image_path,
                                      ]);
                                      return {
                                        ...item,
                                        image_path:
                                          originalItem.image_path.filter((p) =>
                                            keepSet.has(p),
                                          ),
                                      };
                                    }
                                    return {
                                      ...item,
                                      image_path: [
                                        ...item.image_path,
                                        ...g.image_path,
                                      ],
                                    };
                                  }),
                                );
                              }

                              // Update to an existing category (images added) ->
                              // restore the original images for that category
                              if (
                                !g.deleteType &&
                                g.action === "update" &&
                                g.original
                              ) {
                                setGallery((prev) =>
                                  prev.map((item) =>
                                    item.category === g.category
                                      ? g.original
                                      : item,
                                  ),
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
            <div className="flex justify-end gap-4 border-t p-6">
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
