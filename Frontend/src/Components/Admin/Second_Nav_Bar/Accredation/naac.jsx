import React, { useEffect, useState, useRef } from "react";
import "./admin_naac.css";
import Banner from "../../Banner";
import {
  FaChevronUp,
  FaChevronDown,
  FaTrash,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import { Pencil, Trash2, Send, X } from "lucide-react";
import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Naac = ({ data }) => {
  const [openSection, setOpenSection] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const lastSavedStateRef = useRef([]); // keep track of last saved state

  // Workflow states
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedChanges, setSavedChanges] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Change log: each entry { id, action: "Added"|"Edited"|"Deleted", sectionIndex?, itemIndex?, sectionName?, data: {...}, prevData?: {...}, tempId? }
  const [changeLog, setChangeLog] = useState([]);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);

  // Multi section delete
  const [selectedItems, setSelectedItems] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

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
      const copy = JSON.parse(JSON.stringify(data));
      setEditableData(copy);
      lastSavedStateRef.current = copy; // initialize last saved state
    }
  }, [data]);

  const handlePdfClick = (pdf) => {
    if (!pdf?.pdfs_path || pdf.pdfs_path.trim() === "") {
      toast.warn("No PDF available for this file!");
      return;
    }
    const url = `${UrlParser(pdf.pdfs_path)}#toolbar=0`;
    window.open(url, "_blank"); // always new tab
  };

  // Utility: generate unique id for change log and temp items
  const uid = (() => {
    let i = Date.now();
    return (prefix = "") => {
      i += 1;
      return `${prefix}${i}`;
    };
  })();

  // ---- Workflow Handlers ----
  const handleEditClick = () => {
    setEditMode(true);
    setHasChanges(false);
    toast.info("You are now in edit mode.");
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      // revert only recent changes
      setEditableData(JSON.parse(JSON.stringify(lastSavedStateRef.current)));
      setHasChanges(false);
      setChangeLog([]); // drop pending change log when canceling edit session
      toast.info("Recent changes reverted.");
    } else {
      toast.info("Exited edit mode.");
    }
    setEditMode(false);
  };

  const handleSaveClick = () => {
    const copy = JSON.parse(JSON.stringify(editableData));
    setSavedChanges(copy);
    lastSavedStateRef.current = copy; // ✅ update saved state
    setEditMode(false);
    setHasChanges(false);
    toast.success("Changes saved successfully!");
  };

  const handleRetrieveClick = () => {
    // Discard all changes completely
    setEditableData(JSON.parse(JSON.stringify(data)));
    setSavedChanges([]);
    setEditMode(false);
    setHasChanges(false);
    setChangeLog([]);
    toast.info("All changes discarded.");
  };

  const handleRequestConfirm = () => {
    // Build payload with section "NAAC" and list of change descriptions
    const payload = {
      section: "NAAC",
      timestamp: new Date().toISOString(),
      changes: getChanges().map((c) => {
        // create human readable description for each change
        const desc = describeChange(c);
        return {
          id: c.id,
          action: c.action,
          raw: c,
          description: desc,
        };
      }),
    };

    // Replace with your API call to send `payload`
    console.log("Submitting request payload:", payload);

    setShowRequestModal(false);
    setSavedChanges([]); // clear saved changes
    setChangeLog([]); // clear log after sending
    setEditMode(false); // exit edit mode
    setHasChanges(false);
    toast.success("Request submitted successfully!");
  };

  // ---- Change Log Handlers ----
  const pushChangeLog = (entry) => {
    setChangeLog((prev) => [...prev, { id: uid("chg_"), ...entry }]);
  };

  const handleRevertChange = (change) => {
    // Revert the change in the editableData depending on type
    const updated = JSON.parse(JSON.stringify(editableData));

    if (change.action === "Added") {
      // If Added was an item: remove the newly added item by tempId or by matching name and empty pdfs_path
      if (change.tempId) {
        // search for item with _tempId
        for (let s = 0; s < updated.length; s++) {
          const content = updated[s].content || [];
          const idx = content.findIndex((it) => it._tempId === change.tempId);
          if (idx !== -1) {
            content.splice(idx, 1);
            break;
          }
        }
      } else if (typeof change.sectionIndex === "number" && typeof change.itemIndex === "number") {
        const { sectionIndex, itemIndex } = change;
        if (updated[sectionIndex] && updated[sectionIndex].content?.[itemIndex]) {
          updated[sectionIndex].content.splice(itemIndex, 1);
        }
      } else if (change.sectionAdded && change.sectionIndex != null) {
        // remove whole section that was added
        updated.splice(change.sectionIndex, 1);
      }
    } else if (change.action === "Deleted") {
      // Re-insert deleted data back at recorded location
      if (change.sectionDeleted) {
        // reinsert section
        const pos = Math.min(change.sectionIndex, updated.length);
        updated.splice(pos, 0, change.data); // data is full section object
      } else if (typeof change.sectionIndex === "number") {
        const pos = Math.min(change.itemIndex ?? updated[change.sectionIndex].content.length, (change.itemIndex ?? 0));
        // ensure content array exists
        if (!Array.isArray(updated[change.sectionIndex].content)) {
          updated[change.sectionIndex].content = [];
        }
        updated[change.sectionIndex].content.splice(change.itemIndex ?? updated[change.sectionIndex].content.length, 0, change.data);
      }
    } else if (change.action === "Edited") {
      // restore previous data stored in prevData
      if (change.type === "sectionName") {
        if (typeof change.sectionIndex === "number" && updated[change.sectionIndex]) {
          updated[change.sectionIndex].category = change.prevData?.category ?? updated[change.sectionIndex].category;
        } else {
          // fallback: try find by sectionName
          const idx = updated.findIndex((s) => s.category === change.sectionName);
          if (idx !== -1 && change.prevData?.category) updated[idx].category = change.prevData.category;
        }
      } else if (change.type === "itemName") {
        if (typeof change.sectionIndex === "number" && typeof change.itemIndex === "number") {
          if (updated[change.sectionIndex] && updated[change.sectionIndex].content?.[change.itemIndex]) {
            updated[change.sectionIndex].content[change.itemIndex].name = change.prevData?.name ?? updated[change.sectionIndex].content[change.itemIndex].name;
          }
        } else {
          // fallback search by current name
          for (let s = 0; s < updated.length; s++) {
            const idx = (updated[s].content || []).findIndex((it) => it.name === change.data?.name);
            if (idx !== -1) {
              updated[s].content[idx].name = change.prevData?.name ?? updated[s].content[idx].name;
              break;
            }
          }
        }
      } else if (change.type === "fileReplace") {
        if (typeof change.sectionIndex === "number" && typeof change.itemIndex === "number") {
          if (updated[change.sectionIndex] && updated[change.sectionIndex].content?.[change.itemIndex]) {
            updated[change.sectionIndex].content[change.itemIndex].pdfs_path = change.prevData?.pdfs_path ?? updated[change.sectionIndex].content[change.itemIndex].pdfs_path;
            if (change.prevData?.file) updated[change.sectionIndex].content[change.itemIndex].file = change.prevData.file;
            else delete updated[change.sectionIndex].content[change.itemIndex].file;
          }
        }
      }
    }

    setEditableData(updated);
    // remove entry from changeLog
    setChangeLog((prev) => prev.filter((c) => c.id !== change.id));
    setHasChanges(true);
    toast.info(`Reverted ${change.action} - ${change.data?.name || change.sectionName || ""}`);
  };

  const getChanges = () => {
    return changeLog.filter((c) => ["Added", "Edited", "Deleted"].includes(c.action));
  };

  // Helper to produce human readable change description
  const describeChange = (change) => {
    // Default: show data.name or sectionName
    const sectionName = change.sectionName ?? change.data?.sectionName ?? "";
    const fileName = change.data?.name ?? "";
    if (change.sectionAdded) {
      return `Section added: ${sectionName || "(unnamed section)"}`;
    }
    if (change.sectionDeleted) {
      return `Section deleted: ${sectionName || "(unnamed section)"}`;
    }
    if (change.action === "Added") {
      // Could be added file or added item
      if (change.tempId || typeof change.itemIndex === "number") {
        return `File added: ${fileName || "(untitled file)"} (in section: ${sectionName || "(unknown)"})`;
      }
      return fileName ? `Added: ${fileName}` : `Added: ${JSON.stringify(change.data)}`;
    }
    if (change.action === "Deleted") {
      if (change.sectionDeleted) return `Section deleted: ${sectionName || "(unnamed section)"}`;
      return `File deleted: ${fileName || "(untitled file)"} (from section: ${sectionName || "(unknown)"})`;
    }
    if (change.action === "Edited") {
      if (change.type === "sectionName") {
        return `Section renamed to: ${change.data?.name || "(unnamed)"}`;
      }
      if (change.type === "itemName") {
        return `File renamed to: ${change.data?.name || "(unnamed)"} (in section: ${sectionName || "(unknown)"})`;
      }
      if (change.type === "fileReplace") {
        return `File replaced: ${change.data?.name || "(untitled)"} (in section: ${sectionName || "(unknown)"})`;
      }
      return `Edited: ${fileName || sectionName || "(change)"}`;
    }
    return `${change.action}: ${fileName || sectionName || JSON.stringify(change.data || {})}`;
  };

  // ---- Data Editing Handlers ----
  const handleSectionNameChange = (index, value) => {
    const updated = [...editableData];
    const prevCategory = updated[index]?.category;
    updated[index].category = value;
    setEditableData(updated);
    setHasChanges(true);

    // If this section was newly added and has a tempId, update the existing Added entry instead
    setChangeLog((prev) => {
      const clone = [...prev];

      const tempId = updated[index]?._tempId;
      if (tempId) {
        const addedIdx = clone.findIndex((c) => c.tempId === tempId && c.action === "Added");
        if (addedIdx !== -1) {
          clone[addedIdx] = {
            ...clone[addedIdx],
            sectionName: value,
            data: { ...(clone[addedIdx].data || {}), name: value },
          };
          return clone;
        }
      }

      // Otherwise, try to coalesce multiple quick edits to a single Edited entry for this section
      const editIdx = clone.findIndex(
        (c) => c.action === "Edited" && c.type === "sectionName" && c.sectionIndex === index
      );
      if (editIdx !== -1) {
        // keep original prevData, only update data/sectionName
        clone[editIdx] = {
          ...clone[editIdx],
          sectionName: value,
          data: { ...(clone[editIdx].data || {}), name: value },
        };
        return clone;
      }

      // push a new Edited entry
      clone.push({ id: uid("chg_"), action: "Edited", type: "sectionName", sectionIndex: index, sectionName: value, prevData: { category: prevCategory }, data: { name: value } });
      return clone;
    });
  };

  const handleFileChange = (sectionIndex, itemIndex, file) => {
    const updated = [...editableData];
    const fileURL = URL.createObjectURL(file);

    // capture prev
    const prevItem = updated[sectionIndex]?.content?.[itemIndex] || {};
    const prevData = { pdfs_path: prevItem.pdfs_path, file: prevItem.file };

    updated[sectionIndex].content[itemIndex].pdfs_path = fileURL;
    updated[sectionIndex].content[itemIndex].file = file;
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Edited",
      type: "fileReplace",
      sectionIndex,
      itemIndex,
      sectionName: updated[sectionIndex]?.category,
      prevData,
      data: { name: updated[sectionIndex].content[itemIndex].name },
    });
  };

  const handleItemNameChange = (sectionIndex, itemIndex, value) => {
    const updated = [...editableData];
    const prevName = updated[sectionIndex]?.content?.[itemIndex]?.name;
    updated[sectionIndex].content[itemIndex].name = value;
    setEditableData(updated);
    setHasChanges(true);

    // Try to update existing Added entry if this item was freshly added
    setChangeLog((prev) => {
      const clone = [...prev];

      const tempId = updated[sectionIndex]?.content?.[itemIndex]?._tempId;
      if (tempId) {
        const addedIdx = clone.findIndex((c) => c.tempId === tempId && c.action === "Added");
        if (addedIdx !== -1) {
          clone[addedIdx] = { ...clone[addedIdx], sectionName: updated[sectionIndex]?.category, data: { ...(clone[addedIdx].data || {}), name: value } };
          return clone;
        }
      }

      // coalesce quick edits for the same item
      const editIdx = clone.findIndex(
        (c) => c.action === "Edited" && c.type === "itemName" && c.sectionIndex === sectionIndex && c.itemIndex === itemIndex
      );
      if (editIdx !== -1) {
        clone[editIdx] = { ...clone[editIdx], sectionName: updated[sectionIndex]?.category, data: { ...(clone[editIdx].data || {}), name: value } };
        return clone;
      }

      clone.push({ id: uid("chg_"), action: "Edited", type: "itemName", sectionIndex, itemIndex, sectionName: updated[sectionIndex]?.category, prevData: { name: prevName }, data: { name: value } });
      return clone;
    });
  };

  const handleAddItem = (sectionIndex) => {
    const updated = [...editableData];
    const newItem = { name: "", pdfs_path: "", _tempId: uid("tmp_") };
    if (!Array.isArray(updated[sectionIndex].content)) updated[sectionIndex].content = [];
    updated[sectionIndex].content.push(newItem);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Added",
      sectionIndex,
      itemIndex: updated[sectionIndex].content.length - 1,
      sectionName: updated[sectionIndex]?.category,
      data: { name: newItem.name },
      tempId: newItem._tempId,
    });
  };

  const handleAddSection = () => {
    const updated = [...editableData];
    const newSection = { category: "", content: [], _tempId: uid("tmpsec_") };
    updated.push(newSection);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Added",
      sectionAdded: true,
      sectionIndex: updated.length - 1,
      sectionName: newSection.category,
      data: { name: newSection.category, content: [] },
      tempId: newSection._tempId,
    });
  };

  // Prepare delete confirmation
  const handleDeleteItem = (sectionIndex, itemIndex) => {
    setDeleteConfirm({ sectionIndex, itemIndex });
  };

  // Confirm actual delete (single file)
  const confirmDelete = () => {
    if (deleteConfirm) {
      const { sectionIndex, itemIndex } = deleteConfirm;
      const updated = JSON.parse(JSON.stringify(editableData));
      const deletedItem = updated[sectionIndex].content[itemIndex];

      // remove item
      updated[sectionIndex].content.splice(itemIndex, 1);
      setEditableData(updated);
      setHasChanges(true);

      pushChangeLog({
        action: "Deleted",
        sectionIndex,
        itemIndex,
        sectionName: updated[sectionIndex]?.category,
        data: deletedItem, // full deleted item
      });

      setDeleteConfirm(null);
      toast.success("File deleted successfully!");
    }
  };

  // ---- Section Multi Select ----
  const toggleSelectSection = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const confirmMultiDelete = () => {
    // log each section being deleted (store full section)
    const toDelete = selectedItems.slice().sort((a, b) => a - b); // ascending
    const updated = JSON.parse(JSON.stringify(editableData));

    // We'll remove from end to start to preserve indices while splicing
    for (let i = toDelete.length - 1; i >= 0; i--) {
      const idx = toDelete[i];
      const sectionCopy = updated[idx];
      // log deleted section
      pushChangeLog({
        action: "Deleted",
        sectionDeleted: true,
        sectionIndex: idx,
        sectionName: sectionCopy?.category,
        data: sectionCopy,
      });
      updated.splice(idx, 1);
    }

    setEditableData(updated);
    setHasChanges(true);
    setSelectedItems([]);
    // close the confirmation popup after deletion
    setShowMultiDeleteConfirm(false);
    toast.success("Selected sections deleted successfully!");
  };


  // ---- Render ----
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      {!Array.isArray(data) ? (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      ) : (
        <div className="relative min-h-screen">
          {/* Edit Button (top-right) */}
          {!editMode && (
            <div className="absolute top-4 right-6">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
              >
                <Pencil size={16} /> Edit
              </button>
            </div>
          )}

          {/* ABOUT SECTION */}
          <div className="nnaac-page">
            <div className="nabout-section">
              <div className="naac-info-panel border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
                <h2 className="text-brwn dark:text-drkt">ABOUT NAAC</h2>
                <p className="text-sm md:text-base text-justify">
                  The NAAC conducts assessment and accreditation of Higher
                  Educational Institutions (HEI) such as colleges, universities
                  or other recognised institutions...
                </p>
              </div>
            </div>
          </div>

          {/* Dropdown Sections */}
          <div className="max-w-4xl mx-auto space-y-6 mb-24 px-4 font-poppi">
            {Array.isArray(editableData) &&
              editableData.map((section, index) => (
                <div
                  key={index}
                  className="dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-2xl shadow-lg relative"
                >
                  {/* Checkbox for section multi-delete (only edit mode) */}
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(index)}
                      onChange={() => toggleSelectSection(index)}
                      className="absolute top-3 right-3 w-4 h-4 cursor-pointer"
                    />
                  )}

                  <button
                    onClick={() => toggleSection(index)}
                    className={`w-full flex justify-between items-center px-6 py-4 text-xl font-semibold
                    transition-all rounded-2xl mb-4
                    ${
                      openSection === index
                        ? "bg-secd text-text dark:bg-brwn "
                        : "bg-accn dark:bg-drks text-white "
                    }`}
                  >
                    {editMode ? (
                      <input
                        type="text"
                        value={section?.category || ""}
                        onChange={(e) =>
                          handleSectionNameChange(index, e.target.value)
                        }
                        className="bg-transparent border-b border-gray-300 focus:outline-none"
                      />
                    ) : (
                      section?.category
                    )}
                    {openSection === index ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>

                  {openSection === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 py-4"
                    >
                      <ul className="list-disc pl-5 space-y-2">
                        {Array.isArray(section?.content) &&
                          section.content.map((item, i) => (
                            <li
                              key={i}
                              className="flex justify-between items-center gap-2"
                            >
                              {editMode ? (
                                <div className="flex items-center gap-2 w-full">
                                  {/* File name input */}
                                  <input
                                    type="text"
                                    value={item?.name || ""}
                                    onChange={(e) =>
                                      handleItemNameChange(
                                        index,
                                        i,
                                        e.target.value
                                      )
                                    }
                                    className="border p-1 rounded text-sm flex-1"
                                  />

                                  {/* Upload / Replace Button */}
                                  <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer">
                                    {item?.pdfs_path ? "Replace" : "Upload"}
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleFileChange(
                                          index,
                                          i,
                                          e.target.files[0]
                                        )
                                      }
                                    />
                                  </label>
                                  {/* View */}
                                  <button
                                    onClick={() => handlePdfClick(item)}
                                    className="text-blue-500"
                                    title="View PDF"
                                  >
                                    <FaEye />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() =>
                                      handleDeleteItem(index, i)
                                    }
                                    className="text-red-500"
                                    title="Delete"
                                  >
                                    <Trash2 />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handlePdfClick(item)}
                                  className="text-blue-600 dark:text-drka hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-sm md:text-base"
                                >
                                  {item?.name}
                                </button>
                              )}
                            </li>
                          ))}
                      </ul>
                      {editMode && (
                        <button
                          onClick={() => handleAddItem(index)}
                          className="flex items-center text-green-500 mt-2"
                        >
                          <FaPlus className="mr-2" /> Add File
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}

            {/* Add Section Button */}
            {editMode && (
              <button
                onClick={handleAddSection}
                className="w-full py-4 border-2 border-dashed border-red-400 text-red-500 rounded-lg flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Section
              </button>
            )}
          </div>

          {/* Bottom Buttons */}
          <div className="absolute bottom-0 right-6 flex gap-3 mb-[5px]">
            {editMode && (
              <>
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
                {hasChanges && (
                  <button
                    onClick={handleSaveClick}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {!editMode && savedChanges.length > 0 && (
              <>
                <button
                  onClick={handleRetrieveClick}
                  className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  <Send size={18} /> Request
                </button>
              </>
            )}
          </div>

          {/* Multi Delete Button (Bottom Center) */}
          {editMode && selectedItems.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => setShowMultiDeleteConfirm(true)}
                className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete ({selectedItems.length})
              </button>
            </div>
          )}

          {/* Request Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[600px] shadow-lg">
                <h2 className="text-xl font-bold mb-4">Final Request</h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the
                  superior admin. Once approved, they will go live.
                </p>

                <div className="max-h-[250px] overflow-y-auto mb-4 border rounded-lg">
                  <table className="w-full text-center text-text dark:text-drkt">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-drka text-sm">
                        <th className="py-2">Action</th>
                        <th className="py-2">Section</th>
                        <th className="py-2">Changes</th>
                        <th className="py-2">Undo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getChanges().map((change) => (
                        <tr key={change.id} className="border-t text-sm">
                          <td
                            className={`py-2 font-semibold ${
                              change.action === "Added"
                                ? "text-green-600"
                                : change.action === "Deleted"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {change.action}
                          </td>

                          {/* Section column is set to NAAC as requested */}
                          <td className="py-2">NAAC</td>

                          <td className="py-2 text-[12px]">
                            <div className="flex items-center justify-center gap-2">
                              <span>{describeChange(change)}</span>
                            </div>
                          </td>
                          <td>
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
                          <td colSpan={4} className="py-6 text-sm text-gray-500">No pending changes</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestConfirm}
                    className="px-4 py-2 rounded-lg bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
                  >
                    Final Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation popup (single file) */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
                <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
                <p className="text-sm mb-4 text-center">
                  Are you sure you want to delete?
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
        </div>
      )}
      {/* Multi-delete confirmation popup */}
      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[420px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected {selectedItems.length} section{selectedItems.length > 1 ? 's' : ''}?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowMultiDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmMultiDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default Naac;
