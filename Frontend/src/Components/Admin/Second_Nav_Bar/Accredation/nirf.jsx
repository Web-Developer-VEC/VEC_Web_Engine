import React, { useEffect, useState } from "react";
import "./admin_nirf.css";
import LoadComp from "../../LoadComp";
import { Pencil, Eye, Plus, Trash2, Send } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NIRF = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedChanges, setSavedChanges] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [requestSent, setRequestSent] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(null); // Track last saved state

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

  useEffect(() => {
    if (Array.isArray(data)) {
      const copy = data.map((it, i) => ({
        ...it,
        __id:
          it.__id ||
          `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      }));
      setEditableData(copy);
      setOriginalData(JSON.parse(JSON.stringify(copy))); // Deep copy
      setLastSavedState(JSON.parse(JSON.stringify(copy))); // Set initial saved state
    }
  }, [data]);

  const handlePdfClick = (cat) => {
    if (!cat?.pdf_path) return;
    const url = `${UrlParser(cat.pdf_path)}#toolbar=0`;
    window.open(url, "_blank");
  };

  const handleEditToggle = () => {
    setEditMode(true);
    setHasChanges(false);
    setSelectedItems([]);
    setRequestSent(false);
    // Save current state when entering edit mode
    setLastSavedState(JSON.parse(JSON.stringify(editableData)));
  };

  const handleCancel = () => {
    // Revert to last saved state (recent changes only)
    if (hasChanges) {
      setEditableData(JSON.parse(JSON.stringify(lastSavedState)));
      setHasChanges(false);
    }
    setEditMode(false);
    setSelectedItems([]);
  };

  const handleFieldChange = (yearIndex, docIndex, key, value) => {
    const updated = [...editableData];
    if (docIndex === null) {
      updated[yearIndex][key] = value;
    } else {
      updated[yearIndex].content[docIndex][key] = value;
    }
    setEditableData(updated);
    setHasChanges(true);
  };

  const handleFileUpload = (yearIndex, docIndex, file) => {
    const updated = [...editableData];
    const fileURL = URL.createObjectURL(file);
    if (!updated[yearIndex].content) updated[yearIndex].content = [];
    updated[yearIndex].content[docIndex].pdf_path = fileURL;
    updated[yearIndex].content[docIndex].file = file;
    setEditableData(updated);
    setHasChanges(true);
  };

  const handleAddDocument = (yearIndex) => {
    const updated = [...editableData];
    if (!updated[yearIndex].content) updated[yearIndex].content = [];
    updated[yearIndex].content.push({
      name: "",
      pdf_path: "",
    });
    setEditableData(updated);
    setHasChanges(true);
  };

  const handleDeleteDocument = (yearIndex, docIndex) => {
    setDeleteConfirm({ yearIndex, docIndex });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { yearIndex, docIndex } = deleteConfirm;
    const updated = [...editableData];
    if (updated[yearIndex] && Array.isArray(updated[yearIndex].content)) {
      updated[yearIndex].content.splice(docIndex, 1);
    }
    setEditableData(updated);
    setHasChanges(true);
    setDeleteConfirm(null);
    toast.success("Document deleted successfully");
  };

  const handleSave = () => {
    const currentState = JSON.parse(JSON.stringify(editableData));
    setSavedChanges(currentState); // Save current state
    setLastSavedState(currentState); // Update last saved state
    setEditMode(false);
    setHasChanges(false);
    setSelectedItems([]);
    setRequestSent(false);
    toast.success("Changes saved successfully!");
  };

  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalData)));
    setLastSavedState(JSON.parse(JSON.stringify(originalData))); // Reset to original
    setSavedChanges(null);
    setEditMode(false);
    setHasChanges(false);
    setSelectedItems([]);
    setRequestSent(false);
    toast.info("All changes discarded");
  };

  const handleRequestConfirm = () => {
    setShowRequestModal(false);
    setRequestSent(true);
    toast.success("Final request submitted!");
  };

  const toggleItemSelection = (yearIndex) => {
    const index = selectedItems.indexOf(yearIndex);
    if (index > -1) {
      setSelectedItems(selectedItems.filter((item) => item !== yearIndex));
    } else {
      setSelectedItems([...selectedItems, yearIndex]);
    }
  };

  const handleAddYear = () => {
    const updated = [...editableData];
    updated.unshift({
      year: "",
      content: [],
      isNew: true,
      __id: `${Date.now()}-new-${Math.random().toString(36).slice(2, 9)}`,
    });
    setEditableData(updated);
    setHasChanges(true);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    const updated = editableData.filter(
      (_, index) => !selectedItems.includes(index)
    );
    setEditableData(updated);
    setHasChanges(true);
    setSelectedItems([]);
    setDeleteConfirm(null);
    toast.success("Selected items deleted successfully");
  };

  // ---------- NEW helpers for the requested modal ----------
  const getChanges = () => {
    // Returns an array of change objects { action: 'Added'|'Deleted'|'Updated', section: string, data: yearObject }
    if (!savedChanges) return [];

    const origMap = new Map((originalData || []).map((i) => [i.__id, i]));
    const savedMap = new Map((savedChanges || []).map((i) => [i.__id, i]));
    const changes = [];

    // Check saved items for Added / Updated
    for (const s of savedChanges) {
      const o = origMap.get(s.__id);
      if (!o) {
        changes.push({
          action: "Added",
          section: `NIRF ${s.year || "-"}`,
          data: s,
        });
      } else {
        // Determine if there's any difference between original and saved for this year
        const origDocs = o.content || [];
        const savedDocs = s.content || [];
        const docsDifferent =
          origDocs.length !== savedDocs.length ||
          origDocs.some((od, idx) => {
            const sd = savedDocs[idx];
            // If either missing or name/pdf changed -> treat as different
            if (!sd) return true;
            if ((od.name || "") !== (sd.name || "")) return true;
            if ((od.pdf_path || "") !== (sd.pdf_path || "")) return true;
            return false;
          });

        if (String(o.year) !== String(s.year) || docsDifferent) {
          changes.push({
            action: "Updated",
            section: `NIRF ${s.year || "-"}`,
            data: s,
          });
        }
      }
    }

    // Check original items for Deleted (present in original but not in saved)
    for (const o of originalData) {
      if (!savedMap.has(o.__id)) {
        changes.push({
          action: "Deleted",
          section: `NIRF ${o.year || "-"}`,
          data: o,
        });
      }
    }

    return changes;
  };

  const handleRevertChange = (change) => {
    if (!savedChanges) return;
    let updated = JSON.parse(JSON.stringify(savedChanges));

    try {
      if (change.action === "Added") {
        // Remove added year from savedChanges
        updated = updated.filter((y) => y.__id !== change.data.__id);
      } else if (change.action === "Deleted") {
        // Re-add the deleted year from originalData (if found)
        const orig = originalData.find((o) => o.__id === change.data.__id);
        if (orig) {
          // If it's not present, add it back
          if (!updated.some((u) => u.__id === orig.__id)) {
            updated.push(JSON.parse(JSON.stringify(orig)));
          }
        } else {
          toast.error("Original item not found to revert");
          return;
        }
      } else if (change.action === "Updated") {
        // Revert this year's data to originalData copy
        const orig = originalData.find((o) => o.__id === change.data.__id);
        if (orig) {
          updated = updated.map((y) =>
            y.__id === orig.__id ? JSON.parse(JSON.stringify(orig)) : y
          );
        } else {
          // If original not found, remove it (safe fallback)
          updated = updated.filter((y) => y.__id !== change.data.__id);
        }
      } else {
        // unknown action - no op
        toast.error("Unknown change action");
        return;
      }

      // Update savedChanges and the editableData to reflect the revert in the UI
      setSavedChanges(updated);
      setEditableData(JSON.parse(JSON.stringify(updated)));
      setHasChanges(true); // there's been a change from previous savedChanges
      toast.info("Change reverted");
    } catch (err) {
      console.error("Revert failed", err);
      toast.error("Failed to revert change");
    }
  };
  // ---------- end new helpers ----------

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="nirf-page relative">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {!editMode && !requestSent && (
        <div className="flex justify-end px-6 py-4">
          <button
            onClick={handleEditToggle}
            className="flex items-center px-4 py-2 rounded-lg bg-[#fdcc06] text-black hover:bg-[#800000] transition-colors"
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      )}

      <div className="nirf-intro dark:bg-drkb border-l-4 border-secd dark:border-drks">
        <h1 className="nirf-header text-brwn dark:text-drkt">
          NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)
        </h1>
        <p className="text-justify">
          The NIRF is a comprehensive ranking system launched by the Ministry of
          Education, Government of India, in 2015. It provides a structured
          methodology to rank higher education institutions across India.
        </p>
      </div>

      <h2 className="nirf-title text-brwn dark:text-drkt">
        NATIONAL INSTITUTIONAL RANKING FRAMEWORK
      </h2>

      <div className="nirf-grid-2">
        {editMode && (
          <div
            onClick={handleAddYear}
            className="adminnirf-year flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 text-gray-500 hover:bg-gray-100"
          >
            <Plus size={28} />
          </div>
        )}

        {(() => {
          const sorted = [...editableData].slice().sort((a, b) => {
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;
            const na = Number(a?.year);
            const nb = Number(b?.year);
            if (!isNaN(na) && !isNaN(nb)) return nb - na;
            if (!isNaN(na) && isNaN(nb)) return -1;
            if (isNaN(na) && !isNaN(nb)) return 1;
            return String(b?.year).localeCompare(String(a?.year));
          });

          return sorted.map((item, sortedIndex) => {
            const actualIndex = editableData.findIndex(
              (x) => x.__id && item.__id && x.__id === item.__id
            );
            const yearIndex = actualIndex === -1 ? sortedIndex : actualIndex;

            return (
              <div
                key={item.__id || `yr-${sortedIndex}`}
                className="nirf-year relative"
              >
                {editMode && (
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(yearIndex)}
                      onChange={() => toggleItemSelection(yearIndex)}
                      className="h-5 w-5"
                    />
                  </div>
                )}

                {editMode ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={item?.year}
                      onChange={(e) =>
                        handleFieldChange(
                          yearIndex,
                          null,
                          "year",
                          e.target.value
                        )
                      }
                      className="border p-1 rounded text-sm"
                      placeholder="Enter year"
                    />
                  </div>
                ) : (
                  <h3 className="text-text dark:text-drkt">NIRF {item?.year}</h3>
                )}

                {item?.content?.map((cat, docIndex) =>
                  editMode ? (
                    <div
                      key={`${item.__id}-doc-${docIndex}`}
                      className="flex items-center gap-2 mb-2 text-sm"
                    >
                      <input
                        type="text"
                        value={cat?.name}
                        onChange={(e) =>
                          handleFieldChange(
                            yearIndex,
                            docIndex,
                            "name",
                            e.target.value
                          )
                        }
                        className="border p-1 rounded flex-1"
                      />
                      <label className="px-3 py-1 bg-[#fdcc03] text-white rounded cursor-pointer hover:bg-[#800000]">
                        {cat?.pdf_path ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              yearIndex,
                              docIndex,
                              e.target.files[0]
                            )
                          }
                        />
                      </label>
                      {cat?.pdf_path && (
                        <button
                          type="button"
                          onClick={() => handlePdfClick(cat)}
                          className="text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(yearIndex, docIndex)}
                        className="text-red-500"
                      >
                        🗑
                      </button>
                    </div>
                  ) : (
                    <div
                      key={`${item.__id}-docview-${docIndex}`}
                      className="flex items-center gap-2 mb-2 text-sm"
                    >
                      <button
                        onClick={() => handlePdfClick(cat)}
                        className="nirf-link text-blue-600 dark:text-drka cursor-pointer bg-transparent border-none p-0"
                        type="button"
                      >
                        {cat?.name}
                      </button>
                    </div>
                  )
                )}

                {editMode && (
                  <button
                    onClick={() => handleAddDocument(yearIndex)}
                    className="text-green-600 text-sm mt-2"
                  >
                    + Add Document
                  </button>
                )}
              </div>
            );
          });
        })()}
      </div>

      <p className="nirf-footer mt-[25px]">
        Comments and suggestions are invited from the public to provide feedback
        through{" "}
        <a
          href="mailto:feedback.nirf@velammal.edu.in"
          className="nirf-email dark:text-drka"
        >
          feedback.nirf@velammal.edu.in
        </a>
      </p>

      {editMode && selectedItems.length > 0 && (
        <div className="absolute bottom-4 left-1/2 mb-2 transform -translate-x-1/2 justify-center">
          <button
            onClick={() =>
              setDeleteConfirm({ type: "multiple", items: selectedItems })
            }
            className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete({selectedItems.length})
          </button>
        </div>
      )}

      {editMode && (
        <div className="absolute bottom-4 right-6 flex gap-2 mb-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              Save
            </button>
          )}
        </div>
      )}

      {savedChanges && !editMode && !requestSent && (
        <div className="absolute bottom-4 right-8 flex gap-2 mb-2">
          <button
            onClick={handleDiscardAll}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Discard All Changes
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Send size={18}/> Request
          </button>
        </div>
      )}

      {!editMode && requestSent && (
        <button
          onClick={handleEditToggle}
          className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
        >
          <Pencil size={16} /> Edit
        </button>
      )}

      {deleteConfirm && deleteConfirm.type !== "multiple" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete this document?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && deleteConfirm.type === "multiple" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected{" "}
              {deleteConfirm.items.length} items?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- REPLACED: Final Request Modal (your provided markup) ---------- */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved will go live.
            </p>

            <div className="max-h-[250px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change, idx) => (
                    <tr key={idx} className="border-t">
                      {/* Action */}
                      <td
                        className={`py-1 ${
                          change.action === "Added"
                            ? "text-green-600"
                            : change.action === "Deleted"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {change.action}
                      </td>

                      {/* Section */}
                      <td className="py-1">
                        {change.section || "Library Faculty"}
                      </td>

                      {/* Faculty Name + X button (adapted to show year/doc) */}
                      <td className="py-1 text-[12px]">
                        <div className="flex items-center justify-center gap-2">
                          {/* show a friendly label: if year-level change show year, else list document names */}
                          {change.data?.content && change.data.content.length > 0 ? (
                            <span className="truncate">
                              {change.data.content.map((d, i) => d?.name || "Untitled").join(", ")}
                            </span>
                          ) : (
                            <span>{change.data?.year || "Unnamed"}</span>
                          )}
                          <button
                            onClick={() => handleRevertChange(change)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getChanges().length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 text-sm text-gray-500">
                        No changes to send.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NIRF;
