import React, { useEffect, useState } from "react";
import "./admin_nirf.css";
import LoadComp from "../../LoadComp";
import { Pencil, Eye, Plus, Trash2, Send, X } from "lucide-react";
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

  // changeLog state
  const [changeLog, setChangeLog] = useState([]);

  // uid helper
  const uid = (() => {
    let i = Date.now();
    return (prefix = "") => {
      i += 1;
      return `${prefix}${i}`;
    };
  })();

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
      setSavedChanges(null);
      setChangeLog([]);
      setRequestSent(false);
    }
  }, [data]);

  // changeLog helpers
  const pushChangeLog = (entry) => {
    setChangeLog((prev) => [...prev, { id: uid("chg_"), ...entry }]);
  };

  // upsertEdited: first try to find a matching Added entry (tempId/yearId) and update it.
  // If no Added exists, coalesce into an Edited entry (update existing Edited if present).
  const upsertEditedLog = (matchPredicate, newEntry) => {
    setChangeLog((prev) => {
      const clone = [...prev];

      // 1) If there is an Added entry that corresponds to this item (tempId OR yearId+rowAdded), update that.
      const addedIdx = clone.findIndex((c) => {
        if (c.action !== "Added") return false;
        if (newEntry.tempId && c.tempId && c.tempId === newEntry.tempId) return true;
        if (newEntry.yearId && c.rowAdded && c.yearId === newEntry.yearId) return true;
        return false;
      });

      if (addedIdx !== -1) {
        const existing = clone[addedIdx];
        clone[addedIdx] = {
          ...existing,
          data: { ...(existing.data || {}), ...(newEntry.data || {}) },
        };
        return clone;
      }

      // 2) Else, try to find existing Edited entry matching predicate and update it
      const editedIdx = clone.findIndex((c) => c.action === "Edited" && matchPredicate(c));
      if (editedIdx !== -1) {
        const existing = clone[editedIdx];
        clone[editedIdx] = {
          ...existing,
          prevData: existing.prevData || newEntry.prevData,
          data: { ...(existing.data || {}), ...(newEntry.data || {}) },
          yearId: existing.yearId ?? newEntry.yearId,
          docIndex: existing.docIndex ?? newEntry.docIndex,
          tempId: existing.tempId ?? newEntry.tempId,
          type: existing.type ?? newEntry.type,
        };
        return clone;
      }

      // 3) Otherwise push a fresh Edited entry
      return [...clone, { id: uid("chg_"), action: "Edited", ...newEntry }];
    });
  };

  const getChanges = () => changeLog.filter((c) => ["Added", "Edited", "Deleted"].includes(c.action));

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

  // Field change (year or document name)
  const handleFieldChange = (yearIndex, docIndex, key, value) => {
    const updated = JSON.parse(JSON.stringify(editableData));
    const year = updated[yearIndex];
    if (!year) return;

    if (docIndex === null) {
      // editing year field
      const prev = year.year;
      year[key] = value;
      setEditableData(updated);
      setHasChanges(true);

      upsertEditedLog(
        (c) => c.type === "year" && c.yearId === year.__id,
        {
          action: "Edited",
          type: "year",
          yearId: year.__id,
          prevData: { year: prev },
          data: { year: value },
        }
      );
    } else {
      // editing document name
      if (!Array.isArray(year.content)) return;
      const doc = year.content[docIndex];
      if (!doc) return;
      const prev = doc[key];
      doc[key] = value;
      setEditableData(updated);
      setHasChanges(true);

      upsertEditedLog(
        (c) =>
          c.type === "docName" &&
          c.yearId === year.__id &&
          (c.docIndex === docIndex || c.tempId === doc._tempId),
        {
          action: "Edited",
          type: "docName",
          yearId: year.__id,
          docIndex,
          tempId: doc._tempId,
          prevData: { name: prev },
          data: { name: value },
        }
      );
    }
  };

  const handleFileUpload = (yearIndex, docIndex, file) => {
    const updated = JSON.parse(JSON.stringify(editableData));
    if (!updated[yearIndex]) return;
    if (!Array.isArray(updated[yearIndex].content)) updated[yearIndex].content = [];
    const fileURL = URL.createObjectURL(file);
    const prevItem = updated[yearIndex].content[docIndex] || {};
    const prevData = { pdf_path: prevItem.pdf_path, file: prevItem.file };

    // set new file
    updated[yearIndex].content[docIndex].pdf_path = fileURL;
    updated[yearIndex].content[docIndex].file = file;
    setEditableData(updated);
    setHasChanges(true);

    upsertEditedLog(
      (c) =>
        c.type === "fileReplace" &&
        c.yearId === updated[yearIndex].__id &&
        (c.docIndex === docIndex || c.tempId === updated[yearIndex].content[docIndex]?._tempId),
      {
        action: "Edited",
        type: "fileReplace",
        yearId: updated[yearIndex].__id,
        docIndex,
        tempId: updated[yearIndex].content[docIndex]?._tempId,
        prevData,
        data: { name: updated[yearIndex].content[docIndex]?.name },
      }
    );
  };

  const handleAddDocument = (yearIndex) => {
    const updated = JSON.parse(JSON.stringify(editableData));
    if (!Array.isArray(updated[yearIndex].content)) updated[yearIndex].content = [];
    const newDoc = { name: "", pdf_path: "", _tempId: uid("tmp_doc_") };
    updated[yearIndex].content.push(newDoc);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Added",
      yearId: updated[yearIndex].__id,
      tempId: newDoc._tempId,
      data: { name: newDoc.name },
    });
  };

  const handleAddYear = () => {
    const updated = JSON.parse(JSON.stringify(editableData));
    const newYear = {
      year: "",
      content: [],
      isNew: true,
      __id: `${Date.now()}-new-${Math.random().toString(36).slice(2, 9)}`,
    };
    updated.unshift(newYear);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Added",
      rowAdded: true,
      yearId: newYear.__id,
      data: newYear,
    });
  };

  // delete document flow
  const handleDeleteDocument = (yearIndex, docIndex) => {
    setDeleteConfirm({ yearIndex, docIndex, type: "doc" });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const updated = JSON.parse(JSON.stringify(editableData));

    if (deleteConfirm.type === "doc") {
      const { yearIndex, docIndex } = deleteConfirm;
      const year = updated[yearIndex];
      if (!year || !Array.isArray(year.content)) {
        setDeleteConfirm(null);
        return;
      }
      const deletedDoc = year.content.splice(docIndex, 1)[0];
      setEditableData(updated);
      setHasChanges(true);
      setDeleteConfirm(null);

      pushChangeLog({
        action: "Deleted",
        yearId: year.__id,
        docIndex,
        data: deletedDoc,
      });
      toast.success("Document deleted successfully");
    } else if (deleteConfirm.type === "multiple") {
      setDeleteConfirm(null);
    } else if (deleteConfirm.type === "year") {
      const { yearIndex } = deleteConfirm;
      const deletedYear = updated.splice(yearIndex, 1)[0];
      setEditableData(updated);
      setHasChanges(true);
      setDeleteConfirm(null);

      pushChangeLog({
        action: "Deleted",
        rowDeleted: true,
        yearId: deletedYear.__id,
        data: deletedYear,
      });
      toast.success("Year deleted");
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    const toDelete = [...selectedItems].sort((a, b) => a - b);
    let updated = JSON.parse(JSON.stringify(editableData));
    for (let i = toDelete.length - 1; i >= 0; i--) {
      const idx = toDelete[i];
      const rowCopy = updated[idx];
      pushChangeLog({
        action: "Deleted",
        rowDeleted: true,
        yearId: rowCopy.__id,
        data: rowCopy,
      });
      updated.splice(idx, 1);
    }
    setEditableData(updated);
    setSelectedItems([]);
    setHasChanges(true);
    setDeleteConfirm(null);
    toast.success("Selected items deleted successfully");
  };

  // Revert single change (Undo)
  const handleRevertChange = (change) => {
    const updated = JSON.parse(JSON.stringify(editableData));

    try {
      if (change.action === "Added") {
        if (change.rowAdded || change.yearId) {
          const yi = updated.findIndex((y) => y.__id === change.yearId);
          if (yi !== -1) updated.splice(yi, 1);
        } else if (change.tempId && change.yearId) {
          const yIdx = updated.findIndex((y) => y.__id === change.yearId);
          if (yIdx !== -1 && Array.isArray(updated[yIdx].content)) {
            const pi = updated[yIdx].content.findIndex((p) => p._tempId === change.tempId);
            if (pi !== -1) updated[yIdx].content.splice(pi, 1);
          }
        }
      } else if (change.action === "Deleted") {
        if (change.rowDeleted) {
          const exists = updated.some((y) => y.__id === change.data.__id);
          if (!exists) updated.push(change.data);
        } else if (typeof change.yearId !== "undefined") {
          const yIdx = updated.findIndex((y) => y.__id === change.yearId);
          if (yIdx !== -1) {
            if (!Array.isArray(updated[yIdx].content)) updated[yIdx].content = [];
            const pos = Math.min(change.docIndex ?? updated[yIdx].content.length, updated[yIdx].content.length);
            updated[yIdx].content.splice(pos, 0, change.data);
          } else {
            updated.push({ year: change.data.year ?? "", content: [change.data], __id: change.yearId || uid("rest_") });
          }
        }
      } else if (change.action === "Edited") {
        if (change.type === "year") {
          const yIdx = updated.findIndex((y) => y.__id === change.yearId);
          if (yIdx !== -1) {
            updated[yIdx].year = change.prevData?.year ?? updated[yIdx].year;
          }
        } else if (change.type === "docName") {
          const yIdx = updated.findIndex((y) => y.__id === change.yearId);
          if (yIdx !== -1 && Array.isArray(updated[yIdx].content)) {
            const pIdx = change.docIndex;
            if (typeof pIdx === "number" && updated[yIdx].content[pIdx]) {
              updated[yIdx].content[pIdx].name = change.prevData?.name ?? updated[yIdx].content[pIdx].name;
            } else if (change.tempId) {
              const pi = updated[yIdx].content.findIndex((p) => p._tempId === change.tempId);
              if (pi !== -1) updated[yIdx].content[pi].name = change.prevData?.name ?? updated[yIdx].content[pi].name;
            }
          }
        } else if (change.type === "fileReplace") {
          const yIdx = updated.findIndex((y) => y.__id === change.yearId);
          if (yIdx !== -1 && Array.isArray(updated[yIdx].content)) {
            const pIdx = change.docIndex;
            if (typeof pIdx === "number" && updated[yIdx].content[pIdx]) {
              updated[yIdx].content[pIdx].pdf_path = change.prevData?.pdf_path ?? updated[yIdx].content[pIdx].pdf_path;
              if (change.prevData?.file) updated[yIdx].content[pIdx].file = change.prevData.file;
              else delete updated[yIdx].content[pIdx].file;
            } else if (change.tempId) {
              const pi = updated[yIdx].content.findIndex((p) => p._tempId === change.tempId);
              if (pi !== -1) {
                updated[yIdx].content[pi].pdf_path = change.prevData?.pdf_path ?? updated[yIdx].content[pi].pdf_path;
                if (change.prevData?.file) updated[yIdx].content[pi].file = change.prevData.file;
                else delete updated[yIdx].content[pi].file;
              }
            }
          }
        }
      }

      setEditableData(updated);
      setChangeLog((prev) => prev.filter((c) => c.id !== change.id));
      setHasChanges(true);
      toast.info("Reverted change");
    } catch (err) {
      console.error("Revert failed", err);
      toast.error("Failed to revert change");
    }
  };

  // Save: persist current editableData as savedChanges (but keep changeLog for request)
  const handleSave = () => {
    const currentState = JSON.parse(JSON.stringify(editableData));
    setSavedChanges(currentState);
    setLastSavedState(currentState);
    setEditMode(false);
    setHasChanges(false);
    setSelectedItems([]);
    setRequestSent(false);
    toast.success("Changes saved successfully!");
  };

  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalData)));
    setLastSavedState(JSON.parse(JSON.stringify(originalData)));
    setSavedChanges(null);
    setEditMode(false);
    setHasChanges(false);
    setSelectedItems([]);
    setRequestSent(false);
    setChangeLog([]);
    toast.info("All changes discarded");
  };

  const handleSendRequest = () => {
    setShowRequestModal(true);
  };

  const handleRequestConfirm = () => {
    const payload = {
      section: "NIRF",
      timestamp: new Date().toISOString(),
      changes: getChanges().map((c) => ({
        id: c.id,
        action: c.action,
        raw: c,
        description: describeChange(c),
      })),
    };

    console.log("Submitting request payload:", payload);
    setShowRequestModal(false);
    setRequestSent(true);
    setChangeLog([]);
    setSavedChanges(null);
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

  // human readable descriptions
  const describeChange = (change) => {
    if (change.rowAdded) {
      return `Year added: ${change.data?.year || "(new year)"}`;
    }
    if (change.rowDeleted) {
      return `Year deleted: ${change.data?.year || "(deleted year)"}`;
    }
    if (change.action === "Added" && change.tempId && change.yearId) {
      return `Document added: ${change.data?.name || "(untitled)"} (Year id: ${change.yearId})`;
    }
    if (change.action === "Deleted" && change.yearId && change.data?.name) {
      return `Document deleted: ${change.data.name} (Year id: ${change.yearId})`;
    }
    if (change.action === "Edited") {
      if (change.type === "year") {
        return `Year changed to: ${change.data?.year || "(blank)"}`;
      }
      if (change.type === "docName") {
        return `Document renamed to: ${change.data?.name || "(blank)"}`;
      }
      if (change.type === "fileReplace") {
        return `File replaced for: ${change.data?.name || "(doc)"} `;
      }
    }
    return JSON.stringify(change.data || {});
  };

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

      {/* EDIT button: always top-right when not in edit mode (fixes left-bottom issue) */}
      {!editMode && (
        <div className="absolute top-4 right-6 z-50">
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
            title="Add Year"
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
                        onClick={() =>
                          setDeleteConfirm({
                            type: "doc",
                            yearIndex,
                            docIndex,
                          })
                        }
                        className="text-red-500"
                      >
                        <Trash2/>
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
                onClick={() => {
                  handleDeleteSelected();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[650px] max-w-[95vw]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved will go live.
            </p>

            <div className="max-h-[320px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-2">Action</th>
                    <th className="py-2">Section</th>
                    <th className="py-2 text-center">Changes</th>
                    <th className="py-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change) => (
                    <tr key={change.id} className="border-t">
                      <td
                        className={`py-2 ${
                          change.action === "Added"
                            ? "text-green-600"
                            : change.action === "Deleted"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {change.action}
                      </td>

                      <td className="py-2">NIRF</td>

                      <td className="py-2 text-[13px]">
                        <div className="flex items-center justify-center gap-2">
                          <span>{describeChange(change)}</span>
                        </div>
                      </td>

                      <td className="py-2">
                        <button
                          onClick={() => handleRevertChange(change)}
                          className="text-red-500 hover:text-red-700 font-bold"
                          title="Revert this change"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getChanges().length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-sm text-gray-500">
                        No pending changes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
