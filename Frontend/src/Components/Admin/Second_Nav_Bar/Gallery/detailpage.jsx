import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadComp from "../../LoadComp";
import { Plus, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function Admingallerydetails() {
  const [modalImage, setModalImage] = useState(null);
  const [pagetitle, setPageTitle] = useState(null);
  const { sendRequest, loading, error } = useAdminRequest();

  const location = useLocation();
  const [imagePaths, setImagePaths] = useState([]);
  const [originalData, setOriginalData] = useState({});

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") || path?.startsWith('blob') ? path : `${BASE_URL}${path}`;
  };

  console.log(imagePaths);
  

  // Track pending changes
  const [pendingChanges, setPendingChanges] = useState([]);

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Add form states
  const [newFiles, setNewFiles] = useState([]);
  const [newLinks, setNewLinks] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (location.state && location.state.imagespath) {
      setImagePaths(location.state.imagespath);
      setPageTitle(location.state.title || "Gallery Details");
      setOriginalData({
        image_path: location.state.imagespath,
        category: location.state.title,
      });
    }
  }, [location.state]);

  // Separate videos and images
  const videos = imagePaths.filter(
    (path) => path.includes("youtube.com") || path.includes("youtu.be")
  );


  useEffect(() => {
    setImages(
      imagePaths.filter(
        (path) =>
          // /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(path) &&
          !path.includes("youtube.com") &&
          !path.includes("youtu.be")
      )
    );
  }, [imagePaths]);


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

  // Add new images/links
  const handleAddItems = () => {
    if (newFiles.length === 0 && newLinks.length === 0) return;

    setImagePaths((prev) => [
      ...prev,
      ...newFiles.map((f) => URL.createObjectURL(f)),
      ...newLinks,
    ]);

    setPendingChanges((prev) => [
      ...prev,
      {
        action: "insert",
        category: pagetitle,
        files: newFiles,
        links: newLinks,
      },
    ]);

    setNewFiles([]);
    setNewLinks([]);
    setLinkInput("");
    setShowAddModal(false);
    toast.success("Items added successfully");
  };

  // Toggle selection
  const toggleSelect = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  // Bulk delete confirm
  const confirmBulkDelete = () => {
    setImagePaths(imagePaths.filter((p) => !selectedItems.includes(p)));

    setPendingChanges((prev) => [
      ...prev,
      ...selectedItems.map((target) => ({
        action: "delete",
        category: pagetitle,
        target,
      })),
    ]);

    setShowDeleteModal(false);
    setSelectedItems([]);
    toast.success("Selected items marked for deletion.");
  };

  const handleDiscardChanges = () => {
    setImagePaths(originalData.image_path || []); // restore original images
    setPendingChanges([]);                        // clear pending changes
    setSelectedItems([]);                         // clear selections
    setNewFiles([]);                              // reset add form
    setNewLinks([]);
    setLinkInput("");
    toast.info("All changes discarded");
  };
  
  // Undo specific pending change
  const handleUndoChange = (index) => {
    const change = pendingChanges[index];

    if (change.action === "insert") {
      // Remove inserted files/links from preview
      const insertedPaths = [
        ...(change.files?.map((f) =>
          URL.createObjectURL(f)
        ) || []),
        ...(change.links || []),
      ];

      setImagePaths((prev) =>
        prev.filter((p) => !insertedPaths.includes(p))
      );
    }

    if (change.action === "delete") {
      // Restore deleted items
      if (change.target) {
        setImagePaths((prev) => [...prev, change.target]);
      }
    }
    // Remove this change from pendingChanges
    setPendingChanges((prev) => prev.filter((_, i) => i !== index));
  
    toast.info("Change undone");
  };
    
    // Handle final request
    const handleConfirmRequest = async () => {
    if (pendingChanges.length === 0) {
      toast.error("No changes to request");
      return;
    }

    // Group changes by action + category
    const grouped = {};
    pendingChanges.forEach((change) => {
      const key = `${change.action}_${change.category}`;
      if (!grouped[key]) {
        grouped[key] = { ...change, files: [], links: [], targets: [] };
      }
      if (change.files?.length) grouped[key].files.push(...change.files);
      if (change.links?.length) grouped[key].links.push(...change.links);
      if (change.target) grouped[key].targets.push(change.target);
    });



    // Build payload from grouped data
    const payload = Object.values(grouped).map((change) => {
      const imagePaths = [];

      if (change.files?.length) {
        change.files.forEach((f) => {
          imagePaths.push(
            `/static/images/gallery/${pagetitle
              .toLowerCase()
              .replace(/\s+/g, "_")}/${f.name}`
          );
        });
      }

      if (change.links?.length) {
        imagePaths.push(...change.links);
      }

      if (change.targets?.length) {
        imagePaths.push(...change.targets);
      }

      return {
        collectionName: "gallery",
        collection_type: "gallery",
        action: "update",
        title: `Updation in ${pagetitle} ${
          change.action == "insert"
            ? "(Inserted some image)"
            : "(Deletion of some image)"
        }`,
        category: pagetitle,
        meta_data: { category: pagetitle, image_path: imagePaths },
        original_data: originalData,
      };
    });

    const files = Object.values(grouped).flatMap((item) => item.files || []);

    const result = await sendRequest(payload, files);

    if (result) {
      setPendingChanges([]);
      setShowRequestModal(false);
    }
  };

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
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 w-5 h-5"
                  checked={selectedItems.includes(item)}
                  onChange={() => toggleSelect(item)}
                />
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
                  onClick={() => !selectedItems.length && setModalImage(UrlParser(item))}
                />
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 w-5 h-5 cursor-pointer"
                  checked={selectedItems.includes(item)}
                  onChange={() => toggleSelect(item)}
                />
              </div>
            ))}

            {/* Add New Card */}
            <div
              onClick={() => setShowAddModal(true)}
              className="admingallery-item flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-yellow-500"
            >
              <Plus size={40} color="gray" />
            </div>
          </div>

          <ToastContainer position="bottom-right" autoClose={3000} />

          {/* Bulk Delete Button */}
          {selectedItems.length > 0 && (
            <div className="p-6 flex justify-end">
              <button
                className="p-[12px] bg-red-600 text-white cursor-pointer border rounded-[12px] flex gap-[10px] justify-center hover:bg-red-800"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 /> Delete Selected ({selectedItems.length})
              </button>
            </div>
          )}

          {/* Request Button */}
          {pendingChanges.length > 0 && (
            <div className="p-6 flex justify-end gap-2">
              <button
                className="p-[12px] bg-gray-500 text-white cursor-pointer border rounded-[12px] flex gap-[10px] justify-center hover:bg-gray-700"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </button>

              <button
                className="p-[12px] bg-secd dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                onClick={() => setShowRequestModal(true)}
              >
                <Send />
                Request
              </button>
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

      {/* Bulk Delete Confirm Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 dark:text-drkt text-text">
              Confirm Delete
            </h2>
            <p className="dark:text-drkt text-text mb-4">
              Are you sure you want to delete {selectedItems.length} selected item(s)?
            </p>
            <div className="max-h-[150px] overflow-y-auto grid grid-cols-3 gap-2 mb-4">
              {selectedItems.map((item, idx) => (
                <img
                  key={idx}
                  src={UrlParser(item)}
                  alt="to-delete"
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-800 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          onClick={() => {
            setShowAddModal(false);
            setNewFiles([]);
            setNewLinks([]);
          }}
        >
          <div
            className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 dark:text-drkt text-text">
              Add New Items
            </h2>

            {/* File Input */}
            <input
              type="file"
              multiple
              className="mb-3"
              accept="image/*"
              onChange={(e) => setNewFiles([...e.target.files])}
            />

            {/* Preview Section */}
            {newFiles?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 max-h-[120px] overflow-y-auto">
                {newFiles.map((file, index) => (
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
                  setNewFiles([]);
                  setNewLinks([]);
                }}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItems}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]">
          <div
            className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              {pendingChanges.length > 0 ? (
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
                    {pendingChanges.map((g, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          {g.action === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {g.action === "delete" && (
                            <span className="text-red-600">– Deleted</span>
                          )}
                        </td>
                        <td className="py-1">{g.category}</td>
                        <td className="py-1">
                          {g.files?.length > 0 && `${g.files.length} images `}
                          {g.links?.length > 0 &&
                            `, ${g.links.length} links`}
                          {g.target && "1 item"}
                        </td>
                        <td>
                          <button
                            onClick={() => handleUndoChange(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No changes found.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
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
}