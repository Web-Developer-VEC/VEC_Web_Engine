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
import { useAdminRequest } from "../../../hooks/useAdminRequest";


const Naac = ({ data }) => {
  const [openSection, setOpenSection] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const lastSavedStateRef = useRef([]); // keep track of last saved state
  const { sendRequest, loading: loadings, error } = useAdminRequest();
  // Workflow states
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedChanges, setSavedChanges] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Change log: each entry { id, action: "Added"|"Edited"|"Deleted", sectionIndex?, itemIndex?, sectionName?, data: {...}, prevData?: {...}, tempId? }
  const [changeLog, setChangeLog] = useState([]);
  useEffect(() => {
    console.log("Current changeLog:", changeLog);
  }, [changeLog]);
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
    // If new uploaded file (before request)
    if (pdf?.file instanceof File) {
      const blobUrl = URL.createObjectURL(pdf.file);
      window.open(`${blobUrl}#toolbar=0`, "_blank");
      return;
    }

    // Existing file from server
    if (pdf?.pdf_path) {
      const url = `${UrlParser(pdf.pdf_path)}#toolbar=0`;
      window.open(url, "_blank");
      return;
    }
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
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      // revert only recent changes
      setEditableData(JSON.parse(JSON.stringify(lastSavedStateRef.current)));
      setHasChanges(false);
      setChangeLog([]); // drop pending change log when canceling edit session
    } else {
    }
    setEditMode(false);
  };
  const getOriginalItem = (sectionIndex, itemIndex) => {
    return (
      lastSavedStateRef.current?.[sectionIndex]?.content?.[itemIndex] || {}
    );
  };

  const handleSaveClick = () => {
    const copy = JSON.parse(JSON.stringify(editableData));
    setSavedChanges(copy);
    lastSavedStateRef.current = copy; // ✅ update saved state
    setEditMode(false);
    setHasChanges(false);
  };

  const handleRetrieveClick = () => {
    // Discard all changes completely
    setEditableData(JSON.parse(JSON.stringify(data)));
    setSavedChanges([]);
    setEditMode(false);
    setHasChanges(false);
    setChangeLog([]);
  };

  const handleRequestConfirm = async () => {
    const changes = getChanges();

    console.log("Changes:", changes);
    console.log("ChangeLog:", changeLog);

    if (changes.length === 0) {
      console.log("No changes found");
      return;
    }
    // 1️⃣ Build payload
    const payload = changes.map(buildNaacPayload).filter(Boolean);

    // 2️⃣ Collect PDF files
    const files = collectNaacFiles();

    console.log("📦 NAAC PAYLOAD:", payload);
    console.log("📄 NAAC FILES:", files);

    // 3️⃣ Send payload + files
    const result = await sendRequest(payload, files);

    if (result) {
      setShowRequestModal(false);
      setSavedChanges([]);
      setChangeLog([]);
      setEditMode(false);
      setHasChanges(false);
    }
  };

  const collectNaacFiles = () => {
    const files = [];

    editableData.forEach((section) => {
      if (!Array.isArray(section.content)) return;

      section.content.forEach((item) => {
        if (item?.file instanceof File) {
          files.push(item.file);
        }
      });
    });

    return files;
  };

  // ---- Change Log Handlers ----
  const pushChangeLog = (entry) => {
    setChangeLog((prev) => [...prev, { id: uid("chg_"), ...entry }]);
  };
  // --- Payload -----
  const buildNaacPayload = (change) => {
    const { action, sectionIndex, itemIndex, sectionName } = change;

    const getPdfPath = (item) =>
      item?.file?.name
        ? `/static/pdfs/naac/${item.file.name}`
        : item?.pdf_path || "";

    /* ==============================
        INSERT
  ============================== */
    if (action === "Added") {
      const item = change.data;

      return {
        collectionName: "accreditations_and_ranking",
        collection_type: "naac",
        action: "insert",
        title: "insert in naac",
        category: sectionName,
        meta_data: {
          name: item?.name || "",
          pdf_path: getPdfPath(item),
        },
      };
    }
    if (action === "Edited") {
      const editedItem = editableData?.[sectionIndex]?.content?.[itemIndex];

      if (!editedItem) return null;

      const oldName = change.prevData?.name || "";
      const oldPdf = change.prevData?.pdf_path || "";

      const newName = editedItem?.name || "";
      const newPdf = editedItem?.file
        ? `/static/pdfs/naac/${editedItem.file.name}`
        : editedItem?.pdf_path || "";

      if (oldName === newName && oldPdf === newPdf) {
        return null;
      }

      return {
        collectionName: "accreditations_and_ranking",
        collection_type: "naac",
        action: "update",
        title: "update in naac",
        category: sectionName,

        original_data: {
          name: oldName,
          pdf_path: oldPdf,
        },

        meta_data: {
          name: newName,
          pdf_path: newPdf,
        },
      };
    }

    /* ==============================
        DELETE
        meta_data = DELETED DATA
  ============================== */
    if (action === "Deleted") {
      const deletedItem = change.data;

      return {
        collectionName: "accreditations_and_ranking",
        collection_type: "naac",
        action: "delete",
        title: "delete in naac",
        category: sectionName,

        meta_data: {
          name: deletedItem?.name || "",
          pdf_path: deletedItem?.pdf_path || "",
        },
      };
    }

    return null;
  };

  const handleRevertChange = (change) => {
    // Revert the change in the editableData depending on type
    const updated = JSON.parse(JSON.stringify(editableData));

    if (change.action === "Added") {
      // If Added was an item: remove the newly added item by tempId or by matching name and empty pdf_path
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
      } else if (
        typeof change.sectionIndex === "number" &&
        typeof change.itemIndex === "number"
      ) {
        const { sectionIndex, itemIndex } = change;
        if (
          updated[sectionIndex] &&
          updated[sectionIndex].content?.[itemIndex]
        ) {
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
        const pos = Math.min(
          change.itemIndex ?? updated[change.sectionIndex].content.length,
          change.itemIndex ?? 0,
        );
        // ensure content array exists
        if (!Array.isArray(updated[change.sectionIndex].content)) {
          updated[change.sectionIndex].content = [];
        }
        updated[change.sectionIndex].content.splice(
          change.itemIndex ?? updated[change.sectionIndex].content.length,
          0,
          change.data,
        );
      }
    } else if (change.action === "Edited") {
      // restore previous data stored in prevData
      if (change.type === "sectionName") {
        if (
          typeof change.sectionIndex === "number" &&
          updated[change.sectionIndex]
        ) {
          updated[change.sectionIndex].category =
            change.prevData?.category ?? updated[change.sectionIndex].category;
        } else {
          // fallback: try find by sectionName
          const idx = updated.findIndex(
            (s) => s.category === change.sectionName,
          );
          if (idx !== -1 && change.prevData?.category)
            updated[idx].category = change.prevData.category;
        }
      } else if (change.type === "itemName") {
        if (
          typeof change.sectionIndex === "number" &&
          typeof change.itemIndex === "number"
        ) {
          if (
            updated[change.sectionIndex] &&
            updated[change.sectionIndex].content?.[change.itemIndex]
          ) {
            updated[change.sectionIndex].content[change.itemIndex].name =
              change.prevData?.name ??
              updated[change.sectionIndex].content[change.itemIndex].name;
          }
        } else {
          // fallback search by current name
          for (let s = 0; s < updated.length; s++) {
            const idx = (updated[s].content || []).findIndex(
              (it) => it.name === change.data?.name,
            );
            if (idx !== -1) {
              updated[s].content[idx].name =
                change.prevData?.name ?? updated[s].content[idx].name;
              break;
            }
          }
        }
      } else if (change.type === "fileReplace") {
        if (
          typeof change.sectionIndex === "number" &&
          typeof change.itemIndex === "number"
        ) {
          if (
            updated[change.sectionIndex] &&
            updated[change.sectionIndex].content?.[change.itemIndex]
          ) {
            updated[change.sectionIndex].content[change.itemIndex].pdf_path =
              change.prevData?.pdf_path ??
              updated[change.sectionIndex].content[change.itemIndex].pdf_path;
            if (change.prevData?.file)
              updated[change.sectionIndex].content[change.itemIndex].file =
                change.prevData.file;
            else
              delete updated[change.sectionIndex].content[change.itemIndex]
                .file;
          }
        }
      }
    }

    setEditableData(updated);
    // remove entry from changeLog
    setChangeLog((prev) => prev.filter((c) => c.id !== change.id));
    setHasChanges(true);
  };

  const getChanges = () => {
    const map = new Map();

    changeLog.forEach((c) => {
      const key = `${c.sectionIndex}-${c.itemIndex}-${c.tempId || ""}`;

      if (c.action === "Added") {
        map.set(key, c);
      }

      if (c.action === "Deleted") {
        if (map.has(key) && map.get(key).action === "Added") {
          // 🔥 Added + Deleted → cancel out
          map.delete(key);
        } else {
          map.set(key, c);
        }
      }

      if (c.action === "Edited") {
        if (!map.has(key)) {
          map.set(key, c);
        }
      }
    });

    return Array.from(map.values());
  };

  // Helper to produce human readable change description
  const describeChange = (change) => {
    const sectionName = change.sectionName || "";
    const fileName = change.data?.name || "";

    // FULL SECTION DELETE
    if (change.sectionDeleted) {
      return `${sectionName}`;
    }

    // SECTION ADDED
    if (change.sectionAdded) {
      return `${sectionName}`;
    }

    // FILE LEVEL ACTIONS
    if (["Added", "Edited", "Deleted"].includes(change.action)) {
      if (fileName) {
        return `${sectionName} - ${fileName}`;
      }
      return `${sectionName}`;
    }

    return sectionName;
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
        const addedIdx = clone.findIndex(
          (c) => c.tempId === tempId && c.action === "Added",
        );
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
        (c) =>
          c.action === "Edited" &&
          c.type === "sectionName" &&
          c.sectionIndex === index,
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
      clone.push({
        id: uid("chg_"),
        action: "Edited",
        type: "sectionName",
        sectionIndex: index,
        sectionName: value,
        prevData: { category: prevCategory },
        data: { name: value },
      });
      return clone;
    });
  };

  const handleFileChange = (sectionIndex, itemIndex, file) => {
    console.log("handleFileChange called", sectionIndex, itemIndex, file);
    if (!file) return;

    const updated = [...editableData];
    const item = updated[sectionIndex]?.content?.[itemIndex];
    if (!item) return;

    const isNewItem = !!item._tempId;

    const newPdfPath = `/static/pdfs/naac/${file.name}`;

    item.file = file;
    item.pdf_path = newPdfPath;

    setEditableData(updated);
    setHasChanges(true);

    // ✅ If newly added → update ONLY Added log
    if (isNewItem) {
      setChangeLog((prev) =>
        prev.map((c) =>
          c.tempId === item._tempId && c.action === "Added"
            ? {
              ...c,
              sectionName: updated[sectionIndex]?.category,
              data: {
                name: item.name,
                pdf_path: newPdfPath,
              },
            }
            : c,
        ),
      );
      return; // 🚨 STOP HERE
    }

    const original =
      lastSavedStateRef.current?.[sectionIndex]?.content?.[itemIndex];

    const originalName = original?.name || "";
    const originalPdf = original?.pdf_path || "";

    setChangeLog((prev) => {
      const clone = [...prev];

      const existingIndex = clone.findIndex(
        (c) =>
          c.action === "Edited" &&
          c.sectionIndex === sectionIndex &&
          c.itemIndex === itemIndex,
      );

      if (item.name === originalName && newPdfPath === originalPdf) {
        return clone.filter((_, i) => i !== existingIndex);
      }

      if (existingIndex !== -1) {
        clone[existingIndex] = {
          ...clone[existingIndex],
          sectionName: updated[sectionIndex]?.category,
          data: {
            name: item.name,
            pdf_path: newPdfPath,
          },
        };
        return clone;
      }

      clone.push({
        id: uid("chg_"),
        action: "Edited",
        sectionIndex,
        itemIndex,
        sectionName: updated[sectionIndex]?.category,
        prevData: {
          name: originalName,
          pdf_path: originalPdf,
        },
        data: {
          name: item.name,
          pdf_path: newPdfPath,
        },
      });
      console.log("ChangeLog after push:", clone);
      return clone;
    });
  };

  const handleItemNameChange = (sectionIndex, itemIndex, value) => {
    const updated = [...editableData];
    const item = updated[sectionIndex]?.content?.[itemIndex];
    if (!item) return;

    const isNewItem = !!item._tempId;

    item.name = value;

    setEditableData(updated);
    setHasChanges(true);

    // ✅ If newly added → update ONLY Added log
    if (isNewItem) {
      setChangeLog((prev) =>
        prev.map((c) =>
          c.tempId === item._tempId && c.action === "Added"
            ? {
              ...c,
              sectionName: updated[sectionIndex]?.category,
              data: {
                name: value,
                pdf_path: item.pdf_path || "",
              },
            }
            : c,
        ),
      );
      return; // 🚨 STOP HERE
    }

    // Existing item logic
    const original =
      lastSavedStateRef.current?.[sectionIndex]?.content?.[itemIndex];

    const originalName = original?.name || "";
    const originalPdf = original?.pdf_path || "";

    setChangeLog((prev) => {
      const clone = [...prev];

      const existingIndex = clone.findIndex(
        (c) =>
          c.action === "Edited" &&
          c.sectionIndex === sectionIndex &&
          c.itemIndex === itemIndex,
      );

      const newPdfPath = item.file
        ? `/static/pdfs/naac/${item.file.name}`
        : item.pdf_path || "";

      if (value === originalName && newPdfPath === originalPdf) {
        return clone.filter((_, i) => i !== existingIndex);
      }

      if (existingIndex !== -1) {
        clone[existingIndex] = {
          ...clone[existingIndex],
          sectionName: updated[sectionIndex]?.category,
          data: {
            name: value,
            pdf_path: newPdfPath,
          },
        };
        return clone;
      }

      clone.push({
        id: uid("chg_"),
        action: "Edited",
        sectionIndex,
        itemIndex,
        sectionName: updated[sectionIndex]?.category,
        prevData: {
          name: originalName,
          pdf_path: originalPdf,
        },
        data: {
          name: value,
          pdf_path: newPdfPath,
        },
      });

      return clone;
    });
  };

  const handleAddItem = (sectionIndex) => {
    const updated = [...editableData];
    const newItem = { name: "", pdf_path: "", _tempId: uid("tmp_") };
    if (!Array.isArray(updated[sectionIndex].content))
      updated[sectionIndex].content = [];
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
    if (!deleteConfirm) return;

    const { sectionIndex, itemIndex } = deleteConfirm;
    const updated = JSON.parse(JSON.stringify(editableData));
    const deletedItem = updated[sectionIndex].content[itemIndex];

    const isNewItem = !!deletedItem._tempId;

    // Remove from UI
    updated[sectionIndex].content.splice(itemIndex, 1);
    setEditableData(updated);
    setHasChanges(true);

    if (isNewItem) {
      // 🔥 Remove corresponding Added log
      setChangeLog((prev) =>
        prev.filter(
          (c) => !(c.tempId === deletedItem._tempId && c.action === "Added"),
        ),
      );
    } else {
      // Existing DB item → real delete
      setChangeLog((prev) => {
        // Remove any Edited entry for same item
        const cleaned = prev.filter(
          (c) =>
            !(
              c.sectionIndex === sectionIndex &&
              c.itemIndex === itemIndex &&
              c.action === "Edited"
            ),
        );

        return [
          ...cleaned,
          {
            id: uid("chg_"),
            action: "Deleted",
            sectionIndex,
            itemIndex,
            sectionName: updated[sectionIndex]?.category,
            data: deletedItem,
          },
        ];
      });
    }

    setDeleteConfirm(null);
  };

  // ---- Section Multi Select ----
  const toggleSelectSection = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
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
            <div className="flex justify-end px-6 py-4 mr-4">
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
                  {/* {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(index)}
                      onChange={() => toggleSelectSection(index)}
                      className="absolute top-3 right-3 w-4 h-4 cursor-pointer"
                    />
                  )} */}

                  <button
                    onClick={() => toggleSection(index)}
                    className={`w-full flex justify-between items-center px-6 py-4 text-xl font-semibold
                    transition-all rounded-2xl mb-4
                    ${openSection === index
                        ? "bg-secd text-text dark:bg-brwn "
                        : "bg-accn dark:bg-drks text-white "
                      }`}
                  >
                    {/* {editMode ? (
                      <input
                        type="text"
                        value={section?.category || ""}
                        onChange={(e) =>
                          handleSectionNameChange(index, e.target.value)
                        }
                        className="bg-transparent border-b border-gray-300 focus:outline-none"
                      />
                    ) : (
                    )} */}
                    {section?.category}
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
                                        e.target.value,
                                      )
                                    }
                                    className="border p-1 rounded text-sm flex-1"
                                  />

                                  {/* Upload / Replace Button */}
                                  <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer">
                                    {item?.pdf_path ? "Replace" : "Upload"}
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleFileChange(
                                          index,
                                          i,
                                          e.target.files[0],
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
                                    onClick={() => handleDeleteItem(index, i)}
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

            {/* Add Section Button
            {editMode && (
              <button
                onClick={handleAddSection}
                className="w-full py-4 border-2 border-dashed border-red-400 text-red-500 rounded-lg flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Section
              </button>
            )} */}
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
                            className={`py-2 font-semibold ${change.action === "Added"
                              ? "text-green-600"
                              : change.action === "Deleted"
                                ? "text-red-600"
                                : "text-blue-600"
                              }`}
                          >
                            {change.action === "Added" && "Added"}
                            {change.action === "Edited" && "Edited"}
                            {change.action === "Deleted" && "Deleted"}
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
                          <td
                            colSpan={4}
                            className="py-6 text-sm text-gray-500"
                          >
                            No pending changes
                          </td>
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
                    disabled={loadings}
                    className="px-4 py-2 rounded-lg bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
                  >
                    {loadings ? "Submitting..." : "Final Request"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation popup (single file) */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
                <h2 className="text-lg font-bold mb-4 text-center">
                  Confirm Delete
                </h2>
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
            <h2 className="text-lg font-bold mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected{" "}
              {selectedItems.length} section
              {selectedItems.length > 1 ? "s" : ""}?
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
