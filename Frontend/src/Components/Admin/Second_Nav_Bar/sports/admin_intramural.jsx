import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import "./admin_SportsInfra.css";
import { Pencil, Trash2, Plus, Send, Save } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";

const Intramural = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);


  const [achievements, setAchievements] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState([]);
  const [tempAchievements, setTempAchievements] = useState([]);
  const { sendRequest,loading } = useAdminRequest();
  const [editintra, setEditintra] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [changes, setChanges] = useState([]);
  const hasChanges = changes.length > 0;

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // ─── UrlParser ──────────────────────────────────────────────────────────────
  const UrlParser = (path) => {
    if (!path) return "";
    if (path.startsWith("/static")) return path;
    const staticIndex = path.indexOf("/static");
    if (staticIndex !== -1) return path.substring(staticIndex);
    return path;
  };

  // ─── makePreview ────────────────────────────────────────────────────────────
  // Builds the <img src> string from a DB-relative path
  const makePreview = (serverPath) =>
    serverPath ? `${BASE_URL}${serverPath}` : "";

  // ─── Format data on load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) {
      setAchievements([]);
      setTempAchievements([]);
      setInitialSnapshot([]);
      return;
    }

    const formattedData = data.map((image, index) => {
      const serverPath = UrlParser(image?.image_path);
      return {
        // Use a stable numeric id so revert math never breaks
        id: index + 1,
        _mongoId: image._id,          // keep original DB id for payloads if needed
        text: image?.title || "No Title",
        image: serverPath,            // DB-relative path  ← NEVER overwrite this on upload
        original_image: serverPath,   // permanent DB snapshot of image path
        original_text: image?.title || "No Title", // permanent DB snapshot of text
        preview: makePreview(serverPath), // <img src> for display
        newFile: null,
        isNew: false,
      };
    });

    const deepCopy = JSON.parse(JSON.stringify(formattedData));

    setAchievements(formattedData);
    setTempAchievements(deepCopy);
    setInitialSnapshot(deepCopy);
  }, [data]);

  // ─── Carousel auto-play ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isHovered || achievements.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % achievements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () => {
    if (achievements.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + achievements.length) % achievements.length);
  };

  const handleNext = () => {
    if (achievements.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % achievements.length);
  };

  // ─── handleInputChange ──────────────────────────────────────────────────────
  const handleInputChange = (id, field, value) => {
    if (selected.includes(id)) {
      return;
    }

    setIsDirty(true);

    setTempAchievements((prev) =>
      prev.map((item) =>
        item.id !== id ? item : { ...item, [field]: value }
      )
    );

    // Skip change tracking for newly added rows (not in initialSnapshot)
    const isAdded = changes.find((c) => c.id === id && c.action === "Added");
    if (isAdded) return;

    const snapshotRow = initialSnapshot.find((o) => o.id === id);
    if (!snapshotRow) return;

    setChanges((prev) => {
      const alreadyEdited = prev.find(
        (c) => c.id === id && c.action === "Edited"
      );

      // Already tracking an edit for this row → nothing more to add
      if (alreadyEdited) return prev;

      // First edit on this row → record the full snapshot as oldValue
      return [
        ...prev,
        { id, action: "Edited", oldValue: { ...snapshotRow } },
      ];
    });
  };

  // ─── handleImageUpload ──────────────────────────────────────────────────────
  const handleImageUpload = (id, file) => {
    if (!file) return;
    if (selected.includes(id)) {
      return;
    }

    setIsDirty(true);

    const previewUrl = URL.createObjectURL(file);
    const serverPath = `/static/images/sports/intramural/${file.name}`;

    setTempAchievements((prev) =>
      prev.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              image: serverPath,    // new DB path (used in payload)
              preview: previewUrl,  // blob URL for <img> preview
              newFile: file,
            }
      )
    );

    // Skip change tracking for newly added rows
    const isAdded = changes.find((c) => c.id === id && c.action === "Added");
    if (isAdded) return;

    const snapshotRow = initialSnapshot.find((o) => o.id === id);
    if (!snapshotRow) return;

    setChanges((prev) => {
      const alreadyEdited = prev.find(
        (c) => c.id === id && c.action === "Edited"
      );
      if (alreadyEdited) return prev;

      return [
        ...prev,
        { id, action: "Edited", oldValue: { ...snapshotRow } },
      ];
    });
  };

  // ─── handleAddRow ───────────────────────────────────────────────────────────
  const handleAddRow = () => {
    const newId = tempAchievements.length
      ? Math.max(...tempAchievements.map((a) => a.id)) + 1
      : 1;

    const newRow = {
      id: newId,
      text: "",
      image: "",
      original_image: "",
      original_text: "",
      preview: "",
      newFile: null,
      isNew: true,
    };

    setIsDirty(true);
    setTempAchievements((prev) => [...prev, newRow]);
    setChanges((prev) => [
      ...prev,
      { id: newId, action: "Added", oldValue: null },
    ]);
  };

  // ─── handleDeleteSelected ───────────────────────────────────────────────────
  const handleDeleteSelected = () => {
    if (selected.length === 0) return;

    setIsDirty(true);

    setTempAchievements((prev) =>
      prev.filter((item) => !selected.includes(item.id))
    );

    setChanges((prev) => {
      let updated = [...prev];

      selected.forEach((id) => {
        // If row was newly added → just remove its "Added" entry, no Delete needed
        const addedEntry = updated.find(
          (c) => c.id === id && c.action === "Added"
        );
        if (addedEntry) {
          updated = updated.filter((c) => c.id !== id);
          return;
        }

        // Remove any existing Edited entry for this row
        updated = updated.filter((c) => c.id !== id);

        // Find snapshot for this row (the true DB state)
        const snapshotRow = initialSnapshot.find((o) => o.id === id);
        if (!snapshotRow) return;

        // Push a Deleted entry with the full snapshot as oldValue
        updated.push({
          id,
          action: "Deleted",
          oldValue: { ...snapshotRow },
        });
      });

      return updated;
    });

    setSelected([]);
    setShowDeleteModal(false);
  };

 
  const handleRevertChanges = (changeIndex) => {
    const change = changes[changeIndex];
    if (!change) return;

    setTempAchievements((prev) => {
      if (change.action === "Added") {
        // Remove the newly added row
        return prev.filter((item) => item.id !== change.id);
      }

      if (change.action === "Edited") {
        const snap = change.oldValue; // full snapshot row

        return prev.map((item) => {
          if (item.id !== change.id) return item;

          // Revoke blob URL if a new file was previewed
          if (item.newFile && item.preview?.startsWith("blob:")) {
            URL.revokeObjectURL(item.preview);
          }

          // Restore all fields from the snapshot
          return {
            ...item,
            text: snap.text,
            image: snap.original_image,       // DB path
            original_image: snap.original_image,
            original_text: snap.original_text,
            preview: makePreview(snap.original_image), // rebuild <img src>
            newFile: null,
            isNew: false,
          };
        });
      }

      if (change.action === "Deleted") {
        const snap = change.oldValue;

        // Find the original position from initialSnapshot
        const originalIndex = initialSnapshot.findIndex(
          (o) => o.id === change.id
        );

        // Re-insert at original position (or end if not found)
        const restored = {
          ...snap,
          preview: makePreview(snap.original_image),
          newFile: null,
          isNew: false,
        };

        if (originalIndex === -1) return [...prev, restored];

        const copy = [...prev];
        copy.splice(originalIndex, 0, restored);
        return copy;
      }

      return prev;
    });

    // Remove this entry from changes[]
    setChanges((prev) => prev.filter((_, i) => i !== changeIndex));
  };

  // ─── handleSave ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!isDirty) {
      return;
    }

    const invalid = tempAchievements.some(
      (item) => !item.text.trim() || !item.image
    );
    if (invalid) {
      return;
    }

    setEditintra(false);
    setShowRequestButtons(true);
    setIsDirty(false);
  };

  // ─── handleCancel ───────────────────────────────────────────────────────────
  // Full cancel: revert everything back to initialSnapshot
  const handleCancel = () => {
    const deepCopy = JSON.parse(JSON.stringify(initialSnapshot));

    // Rebuild previews (can't JSON.stringify blob URLs anyway)
    const restored = deepCopy.map((item) => ({
      ...item,
      preview: makePreview(item.original_image),
      newFile: null,
    }));

    setTempAchievements(restored);
    setChanges([]);
    setSelected([]);
    setIsDirty(false);
    setEditintra(false);
    setShowRequestButtons(false);
  };

  // ─── confirmDiscard ─────────────────────────────────────────────────────────
  const confirmDiscard = () => {
    const deepCopy = JSON.parse(JSON.stringify(initialSnapshot));
    const restored = deepCopy.map((item) => ({
      ...item,
      preview: makePreview(item.original_image),
      newFile: null,
    }));

    setAchievements(restored);
    setTempAchievements(restored);
    setSelected([]);
    setCurrentPage(1);
    setShowRequestButtons(false);
    setEditintra(false);
    setChanges([]);
    setIsDirty(false);
    setShowDiscardModal(false);
  };

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempAchievements.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempAchievements.length / rowsPerPage);

  // ─── Payload builder ────────────────────────────────────────────────────────
  const buildPayload = ({ action, newData = {}, oldData = {} }) => {
    const base = {
      collectionName: "sports",
      collection_type: "intramural",
    };

    if (action === "Added") {
      return {
        ...base,
        action: "insert",
        title: "Insertion of Intramural Achievement",
        meta_data: { title: newData.title, image_path: newData.image_path },
        original_data: null,
      };
    }

    if (action === "Edited") {
      return {
        ...base,
        action: "update",
        title: "Updation of Intramural Achievement",
        meta_data: { title: newData.title, image_path: newData.image_path },
        original_data: { title: oldData.title, image_path: oldData.image_path },
      };
    }

    if (action === "Deleted") {
      return {
        ...base,
        action: "delete",
        title: "Deletion of Intramural Achievement",
        meta_data: { title: oldData.title, image_path: oldData.image_path },
        original_data: null,
      };
    }

    return null;
  };

  // ─── handleFinalRequest ─────────────────────────────────────────────────────
  const handleFinalRequest = async () => {
    if (!changes.length) {
      return;
    }

    const payloads = [];
    const files = [];

    changes.forEach((change) => {
      const currentItem = tempAchievements.find((i) => i.id === change.id);

      // ── ADD ──────────────────────────────────────────────────────────────
      if (change.action === "Added") {
        if (!currentItem) return;

        const imagePath = currentItem.newFile
          ? `/static/images/sports/intramural/${currentItem.newFile.name}`
          : currentItem.image;

        payloads.push(
          buildPayload({
            action: "Added",
            newData: { title: currentItem.text, image_path: imagePath },
          })
        );
        if (currentItem.newFile) files.push(currentItem.newFile);
      }

      // ── EDIT ─────────────────────────────────────────────────────────────
      if (change.action === "Edited") {
        if (!currentItem) return;

        const newImagePath = currentItem.newFile
          ? `/static/images/sports/intramural/${currentItem.newFile.name}`
          : currentItem.image;

        // oldData comes from change.oldValue (the snapshot captured at first edit)
        payloads.push(
          buildPayload({
            action: "Edited",
            newData: { title: currentItem.text, image_path: newImagePath },
            oldData: {
              title: change.oldValue.original_text,
              image_path: change.oldValue.original_image,
            },
          })
        );
        if (currentItem.newFile) files.push(currentItem.newFile);
      }

      // ── DELETE ───────────────────────────────────────────────────────────
      if (change.action === "Deleted") {
        payloads.push(
          buildPayload({
            action: "Deleted",
            oldData: {
              title: change.oldValue.original_text,
              image_path: change.oldValue.original_image,
            },
          })
        );
      }
    });

    console.log("📦 PAYLOADS:", payloads);
    console.log("🖼 FILES:", files);

    if (!payloads.length) {
      return;
    }

    try {
      await sendRequest(payloads, files);
     

      // New baseline = current temp state
      const deepCopy = JSON.parse(JSON.stringify(tempAchievements));
      const restored = deepCopy.map((item) => ({
        ...item,
        preview: makePreview(item.image),
        original_image: item.image,
        original_text: item.text,
        newFile: null,
        isNew: false,
      }));

      setInitialSnapshot(restored);
      setAchievements(restored);
      setTempAchievements(restored);

      setShowRequestModal(false);
      setShowRequestButtons(false);
      setChanges([]);
      setSelected([]);
      setIsDirty(false);
    } catch (err) {
      console.error("Error submitting request:", err);
   
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-5 p-4">
        {!editintra && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {
              setEditintra(true);
              setShowRequestButtons(true);
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />

      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-accn dark:text-drkt text-3xl font-bold mb-4">
            Intramural Achievements {data?.year}
          </h2>

          {/* ── Carousel (uses `achievements` — never changed during edit) ── */}
          {!editintra &&
            (achievements.length > 0 ? (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {achievements.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                        style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                      >
                        <img
                          src={item.preview || makePreview(item.image)}
                          alt="achievement"
                          className="w-full h-80 object-contain rounded-t-lg"
                        />
                        <div className="p-4 text-center rounded-b-lg">
                          <p className="text-lg font-semibold text-text dark:text-drkt">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePrev}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  >
                    &#10094;
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  >
                    &#10095;
                  </button>
                </div>

                <div className="flex justify-center space-x-2 mt-4">
                  {achievements.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                      } transition-all`}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No achievements available
              </p>
            ))}

          {/* ── Edit Mode Table (uses `tempAchievements`) ── */}
          {editintra && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2">Description</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) =>
                            handleInputChange(item.id, "text", e.target.value)
                          }
                          className="border p-1 w-full rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        {item.preview || item.image ? (
                          <img
                            src={item.preview || makePreview(item.image)}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                        <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
                          <span>{item.image ? "Replace" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(item.id, e.target.files[0])
                            }
                          />
                        </label>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((s) => s !== item.id)
                                : [...prev, item.id]
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              {/* Row Actions */}
              <div className="flex justify-center items-center mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    <Plus size={16} /> Add New
                  </button>
                  {selected.length > 0 && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-end mr-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                {isDirty && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow-md hover:bg-yellow-500 transition"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/40 z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[350px]">
                <h2 className="font-semibold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete the selected items?</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={handleDeleteSelected}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discard Modal */}
          {showDiscardModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/40 z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[350px]">
                <h2 className="font-semibold mb-4">Discard Changes?</h2>
                <p>All your unsaved changes will be lost.</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setShowDiscardModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={confirmDiscard}
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Request Buttons */}
          {showRequestButtons && !editintra && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowDiscardModal(true)}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={16} /> Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* ── Request Modal ── */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request Changes
            </h2>
            <p className="text-sm text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>

            <table className="w-full text-sm text-text dark:text-drkt border">
              <thead className="bg-gray-100 dark:bg-gray-800 text-center">
                <tr>
                  <th className="py-2 border">Action</th>
                  <th className="py-2 border">Section</th>
                  <th className="py-2 border">Item</th>
                  <th className="py-2 border">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.length > 0 ? (
                  changes.map((change, index) => {
                    const currentItem = tempAchievements.find(
                      (i) => i.id === change.id
                    );

                    // Build a readable label for the "Item" column
                    let label = "";
                    if (change.action === "Added") {
                      label = currentItem?.text || `New Row (id ${change.id})`;
                    } else if (change.action === "Edited") {
                      label =
                        change.oldValue?.original_text ||
                        `Row (id ${change.id})`;
                    } else if (change.action === "Deleted") {
                      label =
                        change.oldValue?.original_text ||
                        `Row (id ${change.id})`;
                    }

                    return (
                      <tr key={index} className="border text-center">
                        <td
                          className={`py-2 border font-semibold ${
                            change.action === "Added"
                              ? "text-green-600"
                              : change.action === "Edited"
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {change.action}
                        </td>
                        <td className="border py-2">
                          Intramural Achievements
                        </td>
                        <td className="border py-2">
                          <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                            {label}
                          </span>
                        </td>
                        <td className="py-2 border">
                          <button
                            onClick={() => handleRevertChanges(index)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-gray-500 text-center">
                      No changes detected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black font-medium"
                disabled={loading || changes.length === 0}
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

export default Intramural;