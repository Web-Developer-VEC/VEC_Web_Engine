import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Plus, Trash2, Send, Save, Pencil, X } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";

// Simple reusable Modal component
const Modal = ({ title, children, onClose, actions, width = "500px" }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6`} style={{ width }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">{title}</h2>
        <button onClick={onClose} className="text-red-500 font-bold text-lg">×</button>
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
  const [tempAchievements, setTempAchievements] = useState([]);
  const [editAchievements, setEditAchievements] = useState(false);
  const [selected, setSelected] = useState([]);
  const [changes, setChanges] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const { sendRequest, loading, error } = useAdminRequest();


  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempAchievements.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempAchievements.length / rowsPerPage);

  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    if (!path) return "";

    // already relative
    if (path.startsWith("/static")) return path;

    // full URL → extract /static
    const idx = path.indexOf("/static");
    if (idx !== -1) return path.substring(idx);

    return path;
  };


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
        id: item._id || index + 1,
        text: item?.title || "",
        image: serverPath,                      // server path
        preview: `${BASE_URL}${serverPath}`,    // UI preview
        newFile: null,
      };
    });

    const deepCopy = JSON.parse(JSON.stringify(formattedData));

    setAchievements(deepCopy);
    setTempAchievements(deepCopy);
    setInitialSnapshot(deepCopy);
  }, [data]);


  useEffect(() => {
    if (isHovered || achievements.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () => setActiveIndex((prevIndex) => (prevIndex - 1 + achievements.length) % achievements.length);
  const handleNext = () => setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);

  const handleInputChange = (id, field, value) => {
    setIsDirty(true);
    setTempAchievements(prev => {
      const next = prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );
      setChanges(computeChanges(initialSnapshot, next));
      return next;
    });

    const originalItem = achievements.find(a => a.id === id);
    if (originalItem && originalItem[field] !== value) {
      setChanges(prev => {
        const existing = prev.find(c => c.id === id && c.field === field);

        if (existing) {
          return prev.map(c =>
            c.id === id && c.field === field
              ? { ...c, newValue: value }
              : c
          );
        }

        return [
          ...prev,
          {
            id,
            action: "Edited",      // 🔥 THIS was missing
            field,
            oldValue: originalItem[field],
            newValue: value,
          }
        ];
      });

    } else {
      setChanges((prev) => prev.filter(c => !(c.id === id && c.field === field)));
    }
  };
  const handleImageUpload = (id, file) => {
    setIsDirty(true);

    const previewUrl = URL.createObjectURL(file);
    const serverPath = `/static/images/sports/interzonal/${file.name}`;

    setTempAchievements(prev =>
      prev.map(item =>
        item.id === id
          ? {
            ...item,
            image: serverPath,
            preview: previewUrl,
            newFile: file,
          }
          : item
      )
    );

    const originalItem = achievements.find(a => a.id === id);

    if (originalItem && originalItem.image !== serverPath) {
      setChanges(prev => {
        const existing = prev.find(
          c => c.id === id && c.field === "image"
        );

        if (existing) {
          return prev.map(c =>
            c.id === id && c.field === "image"
              ? { ...c, newValue: serverPath }
              : c
          );
        }

        return [
          ...prev,
          {
            id,
            action: "Edited",
            field: "image",
            oldValue: originalItem.image,
            newValue: serverPath,
          },
        ];
      });
    }
  };


  const handleAddRow = () => {
    const newId = tempAchievements.length ? Math.max(...tempAchievements.map(a => a.id)) + 1 : 1;
    const newRow = { id: newId, text: "", image: "", newFile: null };
    setTempAchievements(prev => {
      const next = [...prev, newRow];
      setChanges(computeChanges(initialSnapshot, next));
      return next;
    });


    setChanges((prev) => [...prev, { id: newId, action: "Added", field: `Image - ${newId}`, oldValue: null, newValue: newRow }]);
  };

  const toggleSelect = id => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleDeleteSelected = () => {
    setIsDirty(true);
    setTempAchievements(prev => {
      const next = prev.filter(item => !selected.includes(item.id));
      setChanges(computeChanges(initialSnapshot, next));
      return next;
    });

    selected.forEach(id => {
      setChanges(prev => [...prev, { id, action: "Deleted", field: `Image - ${id}`, oldValue: achievements.find(a => a.id === id), newValue: null }]);
    });
    setSelected([]);
    setShowDeleteModal(false);
  };

  const handleSave = () => {
    const invalid = tempAchievements.some(item => !item.text.trim() || !item.image);
    if (invalid) { alert("All fields (Description and Image) are mandatory!"); return; }
    setAchievements(tempAchievements);
    setEditAchievements(false);
    setShowRequestButtons(true);
  };

  const handleCancel = () => {
    setTempAchievements(achievements);
    setEditAchievements(false);
  };

  const confirmDiscard = () => {
    // 🔒 restore original snapshot
    const deepCopy = JSON.parse(JSON.stringify(initialSnapshot));

    // reset ALL data states
    setAchievements(deepCopy);
    setTempAchievements(deepCopy);

    // reset UI states
    setEditAchievements(false);
    setShowRequestButtons(false);
    setShowRequestModal(false);
    setShowDiscardModal(false);

    // reset helpers
    setSelected([]);
    setCurrentPage(1);
    setIsDirty(false);
    setChanges([]);

    // reset carousel index
    setActiveIndex(0);
  };


  const handleFinalRequest = async () => {
    // if (!isDirty) {
    //   toast.warn("No changes to submit");
    //   return;
    // }

    const payloads = [];
    const files = [];

    const snapshotMap = new Map(initialSnapshot.map(i => [i.id, i]));
    const tempMap = new Map(tempAchievements.map(i => [i.id, i]));

    /* ---------- INSERT ---------- */
    tempAchievements.forEach(item => {
      if (!snapshotMap.has(item.id)) {
        payloads.push(
          buildInterZonePayload({
            action: "insert",
            newData: {
              title: item.text,
              image_path: item.image,
            },
          })
        );

        if (item.newFile) files.push(item.newFile);
      }
    });

    /* ---------- UPDATE ---------- */
    tempAchievements.forEach(item => {
      const original = snapshotMap.get(item.id);
      if (
        original &&
        (original.text !== item.text || original.image !== item.image)
      ) {
        payloads.push(
          buildInterZonePayload({
            action: "update",
            newData: {
              title: item.text,
              image_path: item.image,
            },
            oldData: {
              title: original.text,
              image_path: original.image,
            },
          })
        );

        if (item.newFile) files.push(item.newFile);
      }
    });

    /* ---------- DELETE ---------- */
    initialSnapshot.forEach(item => {
      if (!tempMap.has(item.id)) {
        payloads.push(
          buildInterZonePayload({
            action: "delete",
            oldData: {
              title: item.text,
              image_path: item.image,
            },
          })
        );
      }
    });

    if (!payloads.length) {
      toast.warn("No changes to submit");
      return;
    }

    try {
      // 🔥 THIS IS WHERE IT GOES
      await sendRequest(payloads, files);

      toast.success("Request submitted!");

      // reset baseline
      const deepCopy = JSON.parse(JSON.stringify(tempAchievements));
      setInitialSnapshot(deepCopy);
      setAchievements(deepCopy);
      setTempAchievements(deepCopy);

      // 🔥 RESET UI + STATE
      setChanges([]);                 // ← THIS was missing
      setShowRequestModal(false);
      setShowRequestButtons(false);
      setIsDirty(false);
      setSelected([]);

    } catch (err) {
      console.error("Request failed:", err);
      toast.error("Failed to submit request");
    }
  };

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
        meta_data: {
          title: newData.title,
          image_path: newData.image_path,
        },
        original_data: null,
      };
    }

    if (action === "update") {
      return {
        ...base,
        action: "update",
        title: "update of Achievements",
        meta_data: {
          title: newData.title,
          image_path: newData.image_path,
        },
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
        title: "deletion of Achievements",
        meta_data: {
          title: oldData.title,
          image_path: oldData.image_path,
        },
        original_data: null,
      };
    }

    return null;
  };
  const handleRevertChange = (changeIndex) => {
    const change = changes[changeIndex];

    if (!change) return;

    const { action, id, field, oldValue } = change;

    setTempAchievements((prev) => {
      let updated = [...prev];

      if (action === "Edited") {
        // revert field to old value
        updated = updated.map((item) =>
          item.id === id
            ? { ...item, [field]: oldValue }
            : item
        );
      }

      if (action === "Added") {
        // remove the newly added row
        updated = updated.filter((item) => item.id !== id);
      }

      if (action === "Deleted") {
        // restore deleted item from initialSnapshot
        const original = initialSnapshot.find((i) => i.id === id);
        if (original) {
          updated = [...updated, JSON.parse(JSON.stringify(original))];
        }
      }

      return updated;
    });

    // remove this change from changes list
    setChanges((prev) => prev.filter((_, i) => i !== changeIndex));
  };
  const computeChanges = (snapshot, current) => {
    const changes = [];

    const snapMap = new Map(snapshot.map(i => [i.id, i]));
    const currMap = new Map(current.map(i => [i.id, i]));

    // Added
    current.forEach(item => {
      if (!snapMap.has(item.id)) {
        changes.push({
          id: item.id,
          action: "Added",
          field: "New Card",
        });
      }
    });

    // Deleted
    snapshot.forEach(item => {
      if (!currMap.has(item.id)) {
        changes.push({
          id: item.id,
          action: "Deleted",
          field: item.text || "Card",
        });
      }
    });

    // Edited
    current.forEach(item => {
      const original = snapMap.get(item.id);
      if (!original) return;

      if (original.text !== item.text) {
        changes.push({
          id: item.id,
          action: "Edited",
          field: "Text",
        });
      }

      if (original.image !== item.image) {
        changes.push({
          id: item.id,
          action: "Edited",
          field: "Image",
        });
      }
    });

    return changes;
  };
  const isRowEdited = (id) => {
    const original = initialSnapshot.find(i => i.id === id);
    const current = tempAchievements.find(i => i.id === id);
    if (!original || !current) return false;

    return original.text !== current.text || original.image !== current.image || current.newFile;
  };





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
            Achievements
          </h2>

          {/* Carousel View */}
          {!editAchievements && achievements.length > 0 && (
            <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
                        src={item.preview || `${BASE_URL}${item.image}`}
                        alt="Achievement"
                        className="w-full h-80 object-contain"
                      />

                      <div className="p-4 text-center rounded-b-lg">
                        <p className="text-lg font-semibold text-black dark:text-white">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prev / Next Buttons */}
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

              {/* Dots */}
              <div className="flex justify-center space-x-2 mt-4">
                {achievements.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? "bg-blue-500" : "bg-gray-300"} transition-all`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Edit Mode */}
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
                          onChange={(e) => handleInputChange(item.id, "text", e.target.value)}
                          className="border p-1 w-full rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        {item.preview || item.image ? (
                          <img
                            src={item.preview || `${BASE_URL}${item.image}`}
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
                            onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
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
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Actions */}
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
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Request Buttons */}
          {showRequestButtons && !editAchievements && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => { confirmDiscard(); }}
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          width="400px"
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClose={() => setShowDeleteModal(false)}
          actions={
            <>
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-400 text-white">Cancel</button>
              <button onClick={handleDeleteSelected} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete the selected items?
          </p>
        </Modal>
      )}
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
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black font-medium"
              >
                Final Request
              </button>
            </>
          }
        >
          <p className="text-sm text-red-600 mb-4">
            Note: Your changes will stay pending until approved by the superior admin.
            Once approved, they will be applied automatically to the live site.
          </p>

          <table className="w-full text-sm text-black dark:text-white border">
            <thead className="bg-gray-100 dark:bg-gray-800 text-center">
              <tr>
                <th className="py-2 border">Action</th>
                <th className="py-2 border">Section</th>
                <th className="py-2 border">Changes</th>
                <th className="py-2 border">undo</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, index) => (
                <tr key={index} className="border text-center">
                  <td
                    className={`py-2 border font-semibold
                      ${change.action === "Added" ? "text-green-600" : ""}
                      ${change.action === "Edited" ? "text-blue-600" : ""}
                      ${change.action === "Deleted" ? "text-red-600" : ""}`}
                  >
                    {change.action}
                  </td>
                  <td className="py-2 border">Other Achievements</td>
                  <td className="py-2 border">
                    <span className="px-2 py-1 bg- text-black rounded-md">
                      {change.field}
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
              ))}
            </tbody>
          </table>
        </Modal>
      )}

    </>
  );
};

export default InterZone;
