import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Plus, Trash2, Send, Pencil, X } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";

const Modal = ({ title, children, onClose, actions, width = "500px" }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 max-h-[80vh] overflow-y-auto"
      style={{ width }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">{title}</h2>
      </div>
      <div className="mb-4">{children}</div>
      <div className="flex justify-end gap-2">{actions}</div>
    </div>
  </div>
);

const InterZone = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState([]);
  const [tempAchievements, setTempAchievements] = useState([]);
  const { sendRequest, loading, err } = useAdminRequest();
  const [editAchievements, setEditAchievements] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const [changes, setChanges] = useState([]);
  const hasChanges = changes.length > 0;

  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempAchievements.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempAchievements.length / rowsPerPage);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // ─── UrlParser ─────────────────────────────────────────────────────────────
  const UrlParser = (path) => {
    if (!path) return "";
    if (path.startsWith("/static")) return path;
    const idx = path.indexOf("/static");
    if (idx !== -1) return path.substring(idx);
    return path;
  };
  const makePreview = (serverPath) =>
    serverPath ? `${BASE_URL}${serverPath}` : "";
  useEffect(() => {
    if (!data) {
      setAchievements([]);
      setTempAchievements([]);
      setInitialSnapshot([]);
      return;
    }

    const formattedData = data.map((item, index) => {
      const serverPath = UrlParser(item?.image_path);
      return {
        id: index + 1,
        _mongoId: item._id, // keep for payload reference
        text: item?.title || "",
        image: serverPath, // DB-relative path (never overwritten)
        original_image: serverPath, // permanent DB snapshot
        original_text: item?.title || "",
        preview: makePreview(serverPath),
        newFile: null,
      };
    });

    const deepCopy = JSON.parse(JSON.stringify(formattedData));

    setAchievements(deepCopy);
    setTempAchievements(deepCopy);
    setInitialSnapshot(deepCopy);
  }, [data]);

  // ─── Carousel auto-play ────────────────────────────────────────────────────
  useEffect(() => {
    if (isHovered || achievements.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % achievements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () =>
    setActiveIndex(
      (prev) => (prev - 1 + achievements.length) % achievements.length,
    );
  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % achievements.length);

  // ─── handleInputChange ─────────────────────────────────────────────────────
  const handleInputChange = (id, field, value) => {
    setIsDirty(true);

    // 1. Always update the editable table
    setTempAchievements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );

    // 2. Newly added rows → no change tracking needed
    const isAdded = changes.find((c) => c.id === id && c.action === "Added");
    if (isAdded) return;

    // 3. Find the snapshot row
    const snapshotRow = initialSnapshot.find((o) => o.id === id);
    if (!snapshotRow) return;

    setChanges((prev) => {
      const alreadyEdited = prev.find(
        (c) => c.id === id && c.action === "Edited",
      );

      if (alreadyEdited) return prev;

      return [...prev, { id, action: "Edited", oldValue: { ...snapshotRow } }];
    });
  };
  // ─── handleImageUpload ─────────────────────────────────────────────────────
  const handleImageUpload = (id, file) => {
    if (!file) return;

    setIsDirty(true);

    const previewUrl = URL.createObjectURL(file);
    const serverPath = `/static/images/sports/interzonal/${file.name}`;

    setTempAchievements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              image: serverPath,
              preview: previewUrl, // ✅ blob URL for immediate display
              newFile: file,
            }
          : item,
      ),
    );

    // Newly added rows → no change tracking needed (already has "Added" entry)
    const isAdded = changes.find((c) => c.id === id && c.action === "Added");
    if (isAdded) return;

    const snapshotRow = initialSnapshot.find((o) => o.id === id);
    if (!snapshotRow) return;

    setChanges((prev) => {
      const alreadyEdited = prev.find(
        (c) => c.id === id && c.action === "Edited",
      );
      if (alreadyEdited) return prev;
      return [...prev, { id, action: "Edited", oldValue: { ...snapshotRow } }];
    });
  };

  const handleAddRow = () => {
    const newId = Date.now(); // unique ID to avoid collisions after deletions

    const newRow = {
      id: newId,
      text: "",
      image: "",
      original_image: "",
      original_text: "",
      preview: "",
      newFile: null,
      isNew: true, // flag for new rows
    };

    setIsDirty(true);
    setTempAchievements((prev) => [...prev, newRow]);
    setChanges((prev) => [
      ...prev,
      { id: newId, action: "Added", oldValue: null },
    ]);
  };
  // ─── toggleSelect ──────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  // ─── handleDeleteSelected ──────────────────────────────────────────────────
  const handleDeleteSelected = () => {
    if (selected.length === 0) return;

    setIsDirty(true);

    // Remove from table
    setTempAchievements((prev) =>
      prev.filter((item) => !selected.includes(item.id)),
    );

    setChanges((prev) => {
      let updated = [...prev];

      selected.forEach((id) => {
        // Newly added row → just drop its "Added" entry, no Delete needed
        const addedEntry = updated.find(
          (c) => c.id === id && c.action === "Added",
        );
        if (addedEntry) {
          updated = updated.filter((c) => c.id !== id);
          return;
        }

        // Remove any prior Edited entry for this row
        updated = updated.filter((c) => c.id !== id);

        // Fetch snapshot (true DB state) for this row
        const snapshotRow = initialSnapshot.find((o) => o.id === id);
        if (!snapshotRow) return;

        // Push a Deleted entry with full snapshot as oldValue
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

  // ─── handleRevertChange ────────────────────────────────────────────────────
  const handleRevertChange = (changeIndex) => {
    const change = changes[changeIndex];
    if (!change) return;

    setTempAchievements((prev) => {
      if (change.action === "Added") {
        // Revoke blob URL to free memory
        const item = prev.find((i) => i.id === change.id);
        if (item?.preview?.startsWith("blob:"))
          URL.revokeObjectURL(item.preview);
        return prev.filter((item) => item.id !== change.id);
      }

      if (change.action === "Edited") {
        const snap = change.oldValue;
        return prev.map((item) => {
          if (item.id !== change.id) return item;
          if (item.newFile && item.preview?.startsWith("blob:")) {
            URL.revokeObjectURL(item.preview);
          }
          return {
            ...item,
            text: snap.original_text,
            image: snap.original_image,
            original_image: snap.original_image,
            original_text: snap.original_text,
            preview: makePreview(snap.original_image),
            newFile: null,
          };
        });
      }

      if (change.action === "Deleted") {
        const snap = change.oldValue;
        const restored = {
          ...snap,
          preview: makePreview(snap.original_image),
          newFile: null,
        };
        const originalIndex = initialSnapshot.findIndex(
          (o) => o.id === change.id,
        );
        const copy = [...prev];
        originalIndex === -1
          ? copy.push(restored)
          : copy.splice(originalIndex, 0, restored);
        return copy;
      }

      return prev;
    });

    // ✅ Also revert achievements (carousel) for the same item
    setAchievements((prev) => {
      if (change.action === "Added") {
        return prev.filter((item) => item.id !== change.id);
      }
      if (change.action === "Edited") {
        const snap = change.oldValue;
        return prev.map((item) =>
          item.id !== change.id
            ? item
            : {
                ...item,
                text: snap.original_text,
                image: snap.original_image,
                preview: makePreview(snap.original_image),
                newFile: null,
              },
        );
      }
      if (change.action === "Deleted") {
        const snap = change.oldValue;
        const restored = {
          ...snap,
          preview: makePreview(snap.original_image),
          newFile: null,
        };
        const originalIndex = initialSnapshot.findIndex(
          (o) => o.id === change.id,
        );
        const copy = [...prev];
        originalIndex === -1
          ? copy.push(restored)
          : copy.splice(originalIndex, 0, restored);
        return copy;
      }
      return prev;
    });

    setChanges((prev) => prev.filter((_, i) => i !== changeIndex));
  };

  // ─── handleSave ────────────────────────────────────────────────────────────
  const handleSave = () => {
    const invalid = tempAchievements.some(
      (item) => !item.text.trim() || (!item.image && !item.preview),
    );
    if (invalid) {
  
      return;
    }

    // ✅ Update achievements (carousel source) with current tempAchievements
    // so newly added/edited rows show up in the carousel after save
    setAchievements(
      tempAchievements.map((item) => ({
        ...item,
        // Keep blob URL for new files so carousel shows them locally
        preview: item.newFile ? item.preview : makePreview(item.image),
      })),
    );

    setEditAchievements(false);
    setShowRequestButtons(true);
    setIsDirty(false);
  };

  // ─── handleCancel ──────────────────────────────────────────────────────────
  // Full cancel: revert everything back to initialSnapshot
  const handleCancel = () => {
    const deepCopy = JSON.parse(JSON.stringify(initialSnapshot));
    const restored = deepCopy.map((item) => ({
      ...item,
      preview: makePreview(item.original_image),
      newFile: null,
    }));

    setTempAchievements(restored);
    setChanges([]);
    setSelected([]);
    setIsDirty(false);
    setEditAchievements(false);
    setShowRequestButtons(false);
  };

  // ─── confirmDiscard ────────────────────────────────────────────────────────
  const confirmDiscard = () => {
    const deepCopy = JSON.parse(JSON.stringify(initialSnapshot));
    const restored = deepCopy.map((item) => ({
      ...item,
      preview: makePreview(item.original_image),
      newFile: null,
    }));

    setAchievements(restored);
    setTempAchievements(restored);
    setChanges([]);
    setSelected([]);
    setCurrentPage(1);
    setActiveIndex(0);
    setIsDirty(false);
    setEditAchievements(false);
    setShowRequestButtons(false);
    setShowDiscardModal(false);
  };

  // ─── isRowEdited (helper for disabling checkbox) ───────────────────────────
  const isRowEdited = (id) =>
    changes.some((c) => c.id === id && c.action === "Edited");

  // ─── Payload builder ───────────────────────────────────────────────────────
  const buildInterZonePayload = ({ action, newData = {}, oldData = {} }) => {
    const base = {
      collectionName: "sports",
      collection_type: "achivements",
      category: "interzonal_achievements",
    };

    if (action === "insert") {
      return {
        ...base,
        action: "insert",
        title: "Insertion of Achievements",
        meta_data: { title: newData.title, image_path: newData.image_path },
        original_data: null,
      };
    }

    if (action === "update") {
      return {
        ...base,
        action: "update",
        title: "Updation of Achievements",
        meta_data: { title: newData.title, image_path: newData.image_path },
        original_data: {
          title: oldData.title,
          image_path: oldData.image_path,
        },
      };
    }

    if (action === "delete") {
      return {
        ...base,
        action: "delete",
        title: "Deletion of Achievements",
        meta_data: { title: oldData.title, image_path: oldData.image_path },
        original_data: null,
      };
    }

    return null;
  };

  // ─── handleFinalRequest ────────────────────────────────────────────────────
  const handleFinalRequest = async () => {
    if (!changes.length) {
   
      return;
    }

    const payloads = [];
    const files = [];

    changes.forEach((change) => {
      const currentItem = tempAchievements.find((i) => i.id === change.id);

      // ── ADD ────────────────────────────────────────────────────────────
      if (change.action === "Added") {
        if (!currentItem) return;

        const imagePath = currentItem.newFile
          ? `/static/images/sports/interzonal/${currentItem.newFile.name}`
          : currentItem.image;

        payloads.push(
          buildInterZonePayload({
            action: "insert",
            newData: { title: currentItem.text, image_path: imagePath },
          }),
        );
        if (currentItem.newFile) files.push(currentItem.newFile);
      }

      // ── EDIT ───────────────────────────────────────────────────────────
      if (change.action === "Edited") {
        if (!currentItem) return;

        const newImagePath = currentItem.newFile
          ? `/static/images/sports/interzonal/${currentItem.newFile.name}`
          : currentItem.image;

        // oldData from change.oldValue (snapshot captured at first edit)
        payloads.push(
          buildInterZonePayload({
            action: "update",
            newData: { title: currentItem.text, image_path: newImagePath },
            oldData: {
              title: change.oldValue.original_text,
              image_path: change.oldValue.original_image,
            },
          }),
        );
        if (currentItem.newFile) files.push(currentItem.newFile);
      }

      // ── DELETE ─────────────────────────────────────────────────────────
      if (change.action === "Deleted") {
        payloads.push(
          buildInterZonePayload({
            action: "delete",
            oldData: {
              title: change.oldValue.original_text,
              image_path: change.oldValue.original_image,
            },
          }),
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
      }));

      setInitialSnapshot(restored);
      setAchievements(restored);
      setTempAchievements(restored);

      setChanges([]);
      setShowRequestModal(false);
      setShowRequestButtons(false);
      setIsDirty(false);
      setSelected([]);
    } catch (err) {
      console.error("Request failed:", err);
   
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Edit Button */}
      <div className="flex justify-end mb-2">
        {!editAchievements && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {
              setEditAchievements(true);
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
          <h2 className="text-center text-3xl font-bold mb-4 text-black dark:text-white">
            InterZone Achievements
          </h2>

          {/* ── Carousel (uses `achievements` — never changed during edit) ── */}
          {!editAchievements && achievements.length > 0 && (
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
                        alt="Achievement"
                        className="w-full h-80 object-contain"
                      />
                      <div className="p-4 text-center rounded-b-lg">
                        <p className="text-lg font-semibold text-black dark:text-white">
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
          )}

          {!editAchievements && achievements.length === 0 && (
            <p className="text-center text-gray-500">
              No achievements available
            </p>
          )}

          {/* ── Edit Mode Table (uses `tempAchievements`) ── */}
          {editAchievements && (
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
                          disabled={selected.includes(item.id)}
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
                            className="w-20 h-20 object-cover rounded"
                            alt="preview"
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
                            disabled={selected.includes(item.id)}
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
                          disabled={isRowEdited(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {tempAchievements.length > rowsPerPage && (
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
              )}

              {/* Row Actions */}
              <div className="flex justify-center items-center mt-4 gap-2">
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

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Request Buttons */}
          {showRequestButtons && !editAchievements && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowDiscardModal(true)}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded flex items-center gap-2"
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

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          width="400px"
          onClose={() => setShowDeleteModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete the selected items?
          </p>
        </Modal>
      )}

      {/* ── Discard Modal ── */}
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

      {/* ── Request Modal ── */}
      {showRequestModal && (
        <Modal
          title="Request"
          width="750px"
          onClose={() => setShowRequestModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleFinalRequest}
                className={`px-4 py-2 rounded bg-secd text-text font-medium ${
                  loading
                    ? "cursor-progress opacity-70"
                    : "hover:bg-brwn hover:text-prim"
                }`}
              >
                {loading ? "Processing..." : "Final Request"}
              </button>
            </>
          }
        >
          <p className="text-sm text-red-600 mb-4">
            Note: Your changes will stay pending until approved by the superior
            admin. Once approved, they will be applied automatically to the live
            site.
          </p>

          <table className="w-full text-sm text-black dark:text-white border">
            <thead className="bg-gray-100 dark:bg-gray-800 text-center">
              <tr>
                <th className="py-2 border">Action</th>
                <th className="py-2 border">Section</th>
                <th className="py-2 border">Changes</th>
                <th className="py-2 border">Undo</th>
              </tr>
            </thead>
            <tbody>
              {changes.length > 0 ? (
                changes.map((change, index) => {
                  const currentItem = tempAchievements.find(
                    (i) => i.id === change.id,
                  );

                  // Human-readable label for the Changes column
                  let label = "";
                  if (change.action === "Added") {
                    label = currentItem?.text || `New Row (id ${change.id})`;
                  } else if (change.action === "Edited") {
                    label =
                      change.oldValue?.original_text || `Row (id ${change.id})`;
                  } else if (change.action === "Deleted") {
                    label =
                      change.oldValue?.original_text || `Row (id ${change.id})`;
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
                      <td className="py-2 border">InterZone Achievements</td>
                      <td className="py-2 border">
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                          {label}
                        </span>
                      </td>
                      <td className="py-2 border">
                        <button
                          onClick={() => handleRevertChange(index)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Revert this change"
                        >
                          <X size={16} className="text-red-500" />
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
        </Modal>
      )}
    </>
  );
};

export default InterZone;
