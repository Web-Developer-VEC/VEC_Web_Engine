import React, { useEffect, useState } from "react";
import "./admin_nirf.css";
import LoadComp from "../../LoadComp";
import { Pencil, Eye, Plus, Trash2, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

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
  const { sendRequest, loading: loadings, error } = useAdminRequest();
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
    document.body.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
  const getNirfPdfPath = (doc) => {
    if (doc?.file instanceof File) {
      return `/static/pdfs/nirf/${doc.file.name}`;
    }

    // 🔵 Existing saved file
    if (doc?.pdf_path && !doc.pdf_path.startsWith("blob:")) {
      return doc.pdf_path;
    }

    return null; // ❗ return null instead of ""
  };

  const getOriginalYear = (yearId) => {
    return originalData.find((y) => y.__id === yearId) || null;
  };
  const buildNirfPayload = (change) => {
    const { action, yearId } = change;

    const originalYear = originalData.find((y) => y.__id === yearId);
    const editedYear = editableData.find((y) => y.__id === yearId);

    const yearData = editedYear || originalYear || change.data;

    if (!yearData) return null;

    const base = {
      collectionName: "accreditations_and_ranking",
      collection_type: "nirf",
      category: `NIRF ${yearData.year || ""}`,
    };

    // 🟢 INSERT
    if (action === "Added") {
      return {
        ...base,
        action: "insert",
        title: "insert in nirf",
        meta_data: {
          year: yearData.year || "",
          content: (yearData.content || []).map((doc) => ({
            name: doc?.name || "",
            pdf_path: getNirfPdfPath(doc),
          })),
        },
      };
    }

    // 🔵 UPDATE
    if (action === "Edited" && originalYear && editedYear) {
      return {
        ...base,
        action: "update",
        title: "update in nirf",

        original_data: {
          year: originalYear.year || "",
          content: (originalYear.content || []).map((doc) => ({
            name: doc?.name || "",
            pdf_path: doc?.pdf_path || "",
          })),
        },

        meta_data: {
          year: editedYear.year || "",
          content: (editedYear.content || []).map((doc, index) => {
            const originalDoc = originalYear?.content?.[index];

            return {
              name: doc?.name || "",
              pdf_path:
                doc?.file instanceof File
                  ? `/static/pdfs/nirf/${doc.file.name}` // replaced file
                  : doc?.pdf_path || originalDoc?.pdf_path || "",
            };
          }),
        },
      };
    }

    // 🔴 DELETE
    if (action === "Deleted") {
      return {
        ...base,
        action: "delete",
        title: "delete in nirf",
        meta_data: {
          year: yearData.year || "",
          content: (yearData.content || []).map((doc) => ({
            name: doc?.name || "",
            pdf_path: doc?.pdf_path || "",
          })),
        },
      };
    }

    return null;
  };

  const upsertEditedLog = (matchPredicate, newEntry) => {
    setChangeLog((prev) => {
      const clone = [...prev];

      // 1) If there is an Added entry that corresponds to this item (tempId OR yearId+rowAdded), update that.
      const addedIdx = clone.findIndex((c) => {
        if (c.action !== "Added") return false;
        if (newEntry.tempId && c.tempId && c.tempId === newEntry.tempId)
          return true;
        if (newEntry.yearId && c.rowAdded && c.yearId === newEntry.yearId)
          return true;
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

      const editedIdx = clone.findIndex(
        (c) =>
          c.action === "Edited" &&
          c.yearId === newEntry.yearId &&
          c.docIndex === newEntry.docIndex &&
          c.tempId === newEntry.tempId &&
          c.type === newEntry.type,
      );
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
  const getChanges = () => {
    return changeLog.filter((c) =>
      ["Added", "Edited", "Deleted"].includes(c.action),
    );
  };
  console.log("CHANGE LOG:", changeLog);
  const handlePdfClick = (cat) => {
    if (!cat?.pdf_path) return;

    // If blob URL → open directly
    if (cat.pdf_path.startsWith("blob:")) {
      window.open(cat.pdf_path, "_blank");
      return;
    }

    // If normal path
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

      upsertEditedLog((c) => c.type === "year" && c.yearId === year.__id, {
        action: "Edited",
        type: "year",
        yearId: year.__id,
        prevData: { year: prev },
        data: { year: value },
      });
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
        },
      );
    }
  };

  const handleFileUpload = (yearIndex, docIndex, file) => {
    const updated = JSON.parse(JSON.stringify(editableData));
    if (!updated[yearIndex]) return;
    if (!Array.isArray(updated[yearIndex].content))
      updated[yearIndex].content = [];
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
        (c.docIndex === docIndex ||
          c.tempId === updated[yearIndex].content[docIndex]?._tempId),
      {
        action: "Edited",
        type: "fileReplace",
        yearId: updated[yearIndex].__id,
        docIndex,
        tempId: updated[yearIndex].content[docIndex]?._tempId,
        prevData,
        data: { name: updated[yearIndex].content[docIndex]?.name },
      },
    );
  };

  const handleAddDocument = (yearIndex) => {
    const updated = JSON.parse(JSON.stringify(editableData));
    if (!Array.isArray(updated[yearIndex].content))
      updated[yearIndex].content = [];
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

      setChangeLog((prev) => {
        let updated = [...prev];

        // 1️⃣ Remove any previous Edited entries for same item
// Keep previous DELETE logs so multiple deletions appear in the popup.
updated = updated.filter(
  (c) =>
    !(
      c.action === "Edited" &&
      c.yearId === year.__id &&
      (c.docIndex === docIndex || c.tempId === deletedDoc?._tempId)
    )
);

        // 2️⃣ If this was newly Added and now deleted → remove completely
        const wasAdded = prev.find(
          (c) =>
            c.action === "Added" &&
            c.yearId === year.__id &&
            c.tempId === deletedDoc?._tempId,
        );

        if (wasAdded) {
          return updated.filter((c) => c.id !== wasAdded.id);
        }

        // 3️⃣ Otherwise push only Deleted
        return [
          ...updated,
          {
            id: uid("chg_"),
            action: "Deleted",
            yearId: year.__id,
            docIndex,
            data: deletedDoc,
          },
        ];
      });
    } else if (deleteConfirm.type === "multiple") {
      setDeleteConfirm(null);
    } else if (deleteConfirm.type === "year") {
      const { yearIndex } = deleteConfirm;
      const deletedYear = updated.splice(yearIndex, 1)[0];
      setEditableData(updated);
      setHasChanges(true);
      setDeleteConfirm(null);

      setChangeLog((prev) => {
        let updated = [...prev];

        // 1️⃣ Remove ALL previous logs for this year
        updated = updated.filter((c) => c.yearId !== deletedYear.__id);

        // 2️⃣ If this year was newly added and now deleted → remove completely
        const wasAdded = prev.find(
          (c) => c.action === "Added" && c.yearId === deletedYear.__id,
        );

        if (wasAdded) {
          return updated.filter((c) => c.id !== wasAdded.id);
        }

        // 3️⃣ Otherwise push ONLY Deleted
        return [
          ...updated,
          {
            id: uid("chg_"),
            action: "Deleted",
            rowDeleted: true,
            yearId: deletedYear.__id,
            data: deletedYear,
          },
        ];
      });

    }
  };
  const getYearLevelChanges = () => {
    const rawChanges = getChanges();
    const grouped = {};

    rawChanges.forEach((change) => {
      const yearId = change.yearId || change.data?.__id;
      if (!yearId) return;

      const yearObj =
        editableData.find((y) => y.__id === yearId) ||
        originalData.find((y) => y.__id === yearId) ||
        change.data;

      if (!grouped[yearId]) {
        grouped[yearId] = {
          id: yearId,
          yearObj,
          rawChanges: [],
          action: "Edited",
        };
      }

      grouped[yearId].rawChanges.push(change);
    });

    Object.values(grouped).forEach((item) => {
      // 🔴 Highest priority → Whole year deleted
      if (item.rawChanges.some((c) => c.rowDeleted)) {
        item.action = "Deleted";
      }
      // 🟢 Next → Whole year added
      else if (item.rawChanges.some((c) => c.rowAdded)) {
        item.action = "Added";
      }
      // 🔵 Otherwise → Edited
      else {
        item.action = "Edited";
      }
    });

    return Object.values(grouped);
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
            const pi = updated[yIdx].content.findIndex(
              (p) => p._tempId === change.tempId,
            );
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
            if (!Array.isArray(updated[yIdx].content))
              updated[yIdx].content = [];
            const pos = Math.min(
              change.docIndex ?? updated[yIdx].content.length,
              updated[yIdx].content.length,
            );
            updated[yIdx].content.splice(pos, 0, change.data);
          } else {
            updated.push({
              year: change.data.year ?? "",
              content: [change.data],
              __id: change.yearId || uid("rest_"),
            });
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
              updated[yIdx].content[pIdx].name =
                change.prevData?.name ?? updated[yIdx].content[pIdx].name;
            } else if (change.tempId) {
              const pi = updated[yIdx].content.findIndex(
                (p) => p._tempId === change.tempId,
              );
              if (pi !== -1)
                updated[yIdx].content[pi].name =
                  change.prevData?.name ?? updated[yIdx].content[pi].name;
            }
          }
        } else if (change.type === "fileReplace") {
          const yIdx = updated.findIndex((y) => y.__id === change.yearId);
          if (yIdx !== -1 && Array.isArray(updated[yIdx].content)) {
            const pIdx = change.docIndex;
            if (typeof pIdx === "number" && updated[yIdx].content[pIdx]) {
              updated[yIdx].content[pIdx].pdf_path =
                change.prevData?.pdf_path ??
                updated[yIdx].content[pIdx].pdf_path;
              if (change.prevData?.file)
                updated[yIdx].content[pIdx].file = change.prevData.file;
              else delete updated[yIdx].content[pIdx].file;
            } else if (change.tempId) {
              const pi = updated[yIdx].content.findIndex(
                (p) => p._tempId === change.tempId,
              );
              if (pi !== -1) {
                updated[yIdx].content[pi].pdf_path =
                  change.prevData?.pdf_path ??
                  updated[yIdx].content[pi].pdf_path;
                if (change.prevData?.file)
                  updated[yIdx].content[pi].file = change.prevData.file;
                else delete updated[yIdx].content[pi].file;
              }
            }
          }
        }
      }

      setEditableData(updated);
      setChangeLog((prev) => prev.filter((c) => c.id !== change.id));
      setHasChanges(true);

    } catch (err) {
      console.error("Revert failed", err);

    }
  };
  const handleRevertAllForYear = (item) => {
    // revert all rawChanges for this year (in original order)
    // clone to avoid mutation issues
    const toRevert = (item.rawChanges || []).slice();
    // revert in reverse order (so deletes/adds restore correctly)
    for (let i = toRevert.length - 1; i >= 0; i--) {
      handleRevertChange(toRevert[i]);
    }
  };
  const getDisplayChangesForItem = (item) => {
    const lines = [];
    const docMap = new Map();

    item.rawChanges.forEach((c) => {
      const key = c.docIndex ?? c.tempId ?? c.id;

      // 🔵 Merge rename + file replace for same document
      if (c.type === "docName" || c.type === "fileReplace") {
        if (!docMap.has(key)) {
          docMap.set(key, {
            name: c.data?.name || "",
            renamed: false,
            replaced: false,
            deleted: false,
          });
        }

        const entry = docMap.get(key);

        if (c.type === "docName") {
          entry.renamed = true;
          entry.oldName = c.prevData?.name;
          entry.newName = c.data?.name;
        }

        if (c.type === "fileReplace") {
          entry.replaced = true;
          entry.name = c.data?.name;
        }
      }

      // 🔴 Deleted document
      if (c.action === "Deleted" && c.data?.name) {
        lines.push(`Deleted: ${c.data.name}`);
      }

      // 🟢 Added document
      if (c.action === "Added" && c.data?.name) {
        lines.push(` ${c.data.name}`);
      }
    });

    // Build merged rename/replace lines
    docMap.forEach((doc) => {
      if (doc.renamed && doc.replaced) {
        lines.push(` ${doc.newName}`);
      } else if (doc.renamed) {
        lines.push(`${doc.newName}`);
      } else if (doc.replaced) {
        lines.push(`${doc.name}`);
      }
    });

    return lines;
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

  };
  const collectNirfFiles = () => {
    const files = [];

    editableData.forEach((year) => {
      if (!Array.isArray(year.content)) return;

      year.content.forEach((doc) => {
        if (doc?.file instanceof File) {
          files.push(doc.file);
        }
      });
    });

    return files;
  };
  const hasYearEdits = (yearId) => {
    return changeLog.some((c) => c.yearId === yearId && c.action === "Edited");
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

  };

  const handleSendRequest = () => {
    setShowRequestModal(true);
  };
  const handleRequestConfirm = async () => {
    const yearLevelChanges = getYearLevelChanges();

    const payload = yearLevelChanges
      .map((item) =>
        buildNirfPayload({
          action: item.action,
          yearId: item.id,
          data: item.yearObj,
        }),
      )
      .filter(Boolean);

    const files = collectNirfFiles();

    console.log("📦 NIRF PAYLOAD:", payload);
    console.log("📄 NIRF FILES:", files);

    // 3️⃣ Send payload + files
    const result = await sendRequest(payload, files);

    if (result) {
      setShowRequestModal(false);
      setSavedChanges(null);
      setChangeLog([]);
      setEditMode(false);
      setHasChanges(false);

    }
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
      <div>
        {!editMode && (
          <div className="flex justify-end px-6 py-4  mr-4">
            <button
              onClick={handleEditToggle}
              className="group bg-[#FDCC03] px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:bg-[#800000]"
            >
              <Pencil className="text-black group-hover:!text-white transition-colors duration-300" size={16} />
              <span className="text-black group-hover:!text-white transition-colors duration-300">
                Edit
              </span>
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* EDIT button: always top-right when not in edit mode (fixes left-bottom issue) */}


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
      {editMode && (
        <div className="nirf-add-year-container">
          <button
            onClick={handleAddYear}
            className="nirf-add-year-btn"
            title="Add Year"
          >
            <Plus size={24} />
            <span>Add Year</span>
          </button>
        </div>
      )}
      <div className="nirf-grid-2">


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
              (x) => x.__id && item.__id && x.__id === item.__id,
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
                      disabled={hasYearEdits(item.__id)}
                      className={`h-5 w-5 ${hasYearEdits(item.__id)
                        ? "cursor-not-allowed opacity-50"
                        : ""
                        }`}
                    />
                  </div>
                )}

                {editMode ? (
                  <div className="flex flex-col md:flex-row gap-2">

                    <input
                      type="text"
                      value={item?.year}
                      onChange={(e) =>
                        handleFieldChange(
                          yearIndex,
                          null,
                          "year",
                          e.target.value,
                        )
                      }
                      className="border p-1 rounded text-sm w-full"
                      placeholder="Enter year"
                    />
                  </div>
                ) : (
                  <h3 className="text-text dark:text-drkt">
                    NIRF {item?.year}
                  </h3>
                )}

                {item?.content?.map((cat, docIndex) =>
                  editMode ? (
                    <div
                      key={`${item.__id}-doc-${docIndex}`}
                      className="flex items-center gap-2 mb-2 text-sm w-full"
                    >

                      <input
                        type="text"
                        value={cat?.name}
                        onChange={(e) =>
                          handleFieldChange(
                            yearIndex,
                            docIndex,
                            "name",
                            e.target.value,
                          )
                        }
                        className="border p-1 rounded flex-1 min-w-0"
                      />
                      <label className="px-2 py-1 text-sm md:px-3 md:py-1 md:text-base bg-[#fdcc03] text-white rounded cursor-pointer hover:bg-[#800000] whitespace-nowrap">
                        {cat?.pdf_path ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              yearIndex,
                              docIndex,
                              e.target.files[0],
                            )
                          }
                        />
                      </label>
                      <div className="flex items-center gap-2">
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
                          className="text-red-500 p-0"
                        >
                          <Trash2 size={16} strokeWidth={1.8} />
                        </button>
                      </div>
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
                  ),
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

      {editMode && (
        <div className="relative w-full h-14 mt-10 mb-6">

          {/* Delete Button - Center */}
          {selectedItems.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2">
              <button
                onClick={() =>
                  setDeleteConfirm({
                    type: "multiple",
                    items: selectedItems,
                  })
                }
                className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2 hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete({selectedItems.length})
              </button>
            </div>
          )}

          {/* Right Side Buttons */}
          <div className="absolute right-0 top-8 flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>

            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-white"
              >
                Save
              </button>
            )}
          </div>

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
            <Send size={18} /> Request
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
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved will go live.
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
                  {getYearLevelChanges().map((item) => {
                    const lines = getDisplayChangesForItem(item);

                    return (
                      <tr key={item.id} className="border-t align-top">
                        <td
                          className={`py-2 ${item.action === "Added"
                            ? "text-green-600"
                            : item.action === "Deleted"
                              ? "text-red-600"
                              : "text-blue-600"
                            }`}
                        >
                          {item.action}
                        </td>

                        <td className="py-2 border">NIRF</td>

                        <td className="py-2 text-[13px] border text-left px-3">
                          <div className="font-semibold">
                            NIRF {item.yearObj?.year || ""}
                          </div>

                          {lines.length === 0 ? (
                            <div className="ml-4 text-gray-600">
                              No visible change
                            </div>
                          ) : (
                            lines.map((line, idx) => (
                              <div
                                key={idx}
                                className={`ml-4 ${line.startsWith("Deleted") ? "text-red-600" : "text-gray-600"}`}
                              >
                                • {line}
                              </div>
                            ))
                          )}
                        </td>

                        <td className="py-2 border text-center">
                          {/* single undo for the whole year */}
                          <button
                            onClick={() => handleRevertAllForYear(item)}
                            className="text-red-500 hover:text-red-700"
                            title="Undo all changes for this year"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

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

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-6 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                disabled={loadings}
                className="px-6 py-2 rounded bg-[#fdcc03] text-black hover:bg-[#800000] hover:!text-white transition-all duration-300"
              >
                {loadings ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NIRF;
