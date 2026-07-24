import React, { useEffect, useState, useRef } from "react";
import "./admin_NBA_F.css";
import LoadComp from "../../LoadComp";
import { FaTrash, FaPlus, FaEye } from "react-icons/fa";
import { Pencil, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const NBA_F = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { sendRequest, loading: loadings, error } = useAdminRequest();
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedChanges, setSavedChanges] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);
  const originalDataRef = useRef([]);
  const lastSavedStateRef = useRef([]); // Track last saved state

  // CHANGE LOG: track Added / Edited / Deleted entries
  // minimal entry shape: { id, action, type?, rowIndex?, pdfIndex?, tempId?, rowAdded?, rowDeleted?, rowIndexDeleted?, data, prevData }
  const [changeLog, setChangeLog] = useState([]);

  // uid helper
  const uid = (() => {
    let i = Date.now();
    return (prefix = "") => {
      i += 1;
      return `${prefix}${i}`;
    };
  })();

  // helpers for changeLog
  const pushChangeLog = (entry) => {
    setChangeLog((prev) => [...prev, { id: uid("chg_"), ...entry }]);
  };

  // upsertEdited: coalesce multiple quick edits into single Edited entry for same identifiers
  const upsertEditedLog = (matchPredicate, newEntry) => {
    setChangeLog((prev) => {
      const clone = [...prev];
      const idx = clone.findIndex(
        (c) => c.action === "Edited" && matchPredicate(c),
      );
      if (idx !== -1) {
        // preserve original prevData if it exists, otherwise set from newEntry.prevData
        const existing = clone[idx];
        clone[idx] = {
          ...existing,
          // keep existing.prevData if present, else newEntry.prevData
          prevData: existing.prevData || newEntry.prevData,
          // update data and other fields
          ...newEntry,
          id: existing.id, // keep id stable
        };
        return clone;
      } else {
        return [...clone, { id: uid("chg_"), ...newEntry }];
      }
    });
  };

  const getChanges = () =>
    changeLog.filter((c) => ["Added", "Edited", "Deleted"].includes(c.action));

  // Revert a logged change and update editableData and changeLog
  const handleRevertChange = (change) => {
    const updated = JSON.parse(JSON.stringify(editableData));

    if (change.action === "Added") {
      // If a row was added (tempId)
      if (change.rowAdded && change.tempId) {
        const ri = updated.findIndex((r) => r._tempId === change.tempId);
        if (ri !== -1) updated.splice(ri, 1);
      }
      // If a pdf was added to a row
      else if (change.tempId && typeof change.rowIndex === "number") {
        const row = updated[change.rowIndex];
        if (row && Array.isArray(row.pdfs)) {
          const pi = row.pdfs.findIndex((p) => p._tempId === change.tempId);
          if (pi !== -1) row.pdfs.splice(pi, 1);
        }
      }
    } else if (change.action === "Deleted") {
      // If whole row deleted — reinsert at recorded index
      if (change.rowDeleted && typeof change.rowIndexDeleted === "number") {
        const pos = Math.min(change.rowIndexDeleted, updated.length);
        updated.splice(pos, 0, change.data);
      }
      // If a pdf was deleted from a row — reinsert into row.pdfs
      else if (typeof change.rowIndex === "number") {
        if (!Array.isArray(updated[change.rowIndex].pdfs))
          updated[change.rowIndex].pdfs = [];
        const pos = Math.min(
          change.pdfIndex ?? updated[change.rowIndex].pdfs.length,
          updated[change.rowIndex].pdfs.length,
        );
        updated[change.rowIndex].pdfs.splice(pos, 0, change.data);
      }
    } else if (change.action === "Edited") {
      // revert edits using prevData
      if (change.type === "dept") {
        if (typeof change.rowIndex === "number" && updated[change.rowIndex]) {
          updated[change.rowIndex].department =
            change.prevData?.department ?? updated[change.rowIndex].department;
        }
      } else if (change.type === "pdfName") {
        if (
          typeof change.rowIndex === "number" &&
          typeof change.pdfIndex === "number"
        ) {
          if (
            updated[change.rowIndex] &&
            updated[change.rowIndex].pdfs?.[change.pdfIndex]
          ) {
            updated[change.rowIndex].pdfs[change.pdfIndex].name =
              change.prevData?.name ??
              updated[change.rowIndex].pdfs[change.pdfIndex].name;
          }
        }
      } else if (change.type === "fileReplace") {
        if (
          typeof change.rowIndex === "number" &&
          typeof change.pdfIndex === "number"
        ) {
          if (
            updated[change.rowIndex] &&
            updated[change.rowIndex].pdfs?.[change.pdfIndex]
          ) {
            updated[change.rowIndex].pdfs[change.pdfIndex].pdf_path =
              change.prevData?.pdf_path ??
              updated[change.rowIndex].pdfs[change.pdfIndex].pdf_path;
            if (change.prevData?.file)
              updated[change.rowIndex].pdfs[change.pdfIndex].file =
                change.prevData.file;
            else delete updated[change.rowIndex].pdfs[change.pdfIndex].file;
          }
        }
      }
    }

    setEditableData(updated);
    // remove change from log
    setChangeLog((prev) => prev.filter((c) => c.id !== change.id));
    setHasChanges(true);
    // toast.info(`Reverted ${change.action} ${change.data?.name ?? ""}`);
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
      setEditableData(JSON.parse(JSON.stringify(data)));
      originalDataRef.current = JSON.parse(JSON.stringify(data));
      lastSavedStateRef.current = JSON.parse(JSON.stringify(data));
    }
  }, [data]);

  const handlePdfClick = (pdf) => {
    // 🔥 If newly uploaded file (before request)
    if (pdf?.file instanceof File) {
      const blobUrl = URL.createObjectURL(pdf.file);
      window.open(`${blobUrl}#toolbar=0`, "_blank");
      return;
    }

    // Existing file from server
    if (pdf?.pdf_path) {
      window.open(`${UrlParser(pdf.pdf_path)}#toolbar=0`, "_blank");
      return;
    }
  };

  const handleEditToggle = () => {
    setEditMode(true);
    setRequestSent(false);
    setChangesSaved(false);
    // Save current state when entering edit mode
    lastSavedStateRef.current = JSON.parse(JSON.stringify(editableData));

  };

  const handleCancel = () => {
    if (hasChanges) {
      // If unsaved changes exist, revert them
      setEditableData(JSON.parse(JSON.stringify(lastSavedStateRef.current)));
      setHasChanges(false);

    } else {
    }

    setEditMode(false);
    setSelectedItems([]);
    setRequestSent(false);

    // keep changesSaved if saved earlier
    setChangesSaved(savedChanges !== null);
  };

  const handleSave = () => {
    // Update both saved state and last saved state
    const currentState = JSON.parse(JSON.stringify(editableData));
    setSavedChanges(currentState);
    lastSavedStateRef.current = currentState;
    setEditMode(false);
    setHasChanges(false);
    setChangesSaved(true);
  };

  const handleSendRequest = () => {
    setShowRequestModal(true);
  };

  const handleDiscardChanges = () => {
    // Revert to original data (all changes)
    setEditableData(JSON.parse(JSON.stringify(originalDataRef.current)));
    lastSavedStateRef.current = JSON.parse(
      JSON.stringify(originalDataRef.current),
    );
    setRequestSent(false);
    setChangesSaved(false);
    setHasChanges(false);
    setChangeLog([]); // clear any logged changes
  };

  const handleAddRow = () => {
    const updated = JSON.parse(JSON.stringify(editableData));
    const newRow = {
      id: updated.length + 1,
      department: "",
      pdfs: [],
      _tempId: uid("tmp_row_"),
    };
    updated.push(newRow);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Added",
      rowAdded: true,
      rowIndex: updated.length - 1,
      tempId: newRow._tempId,
      data: newRow,
    });
  };

  const handleDeleteRow = (rowIndex) => {
    const updated = structuredClone(editableData);
    const deletedRow = updated[rowIndex];
    updated.splice(rowIndex, 1);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Deleted",
      rowDeleted: true,
      rowIndexDeleted: rowIndex,
      data: deletedRow,
    });
  };

  const handleDeleteSelected = () => {
    const toDelete = selectedItems.slice().sort((a, b) => a - b);
    const updated = JSON.parse(JSON.stringify(editableData));

    for (let i = toDelete.length - 1; i >= 0; i--) {
      const idx = toDelete[i];
      const rowCopy = updated[idx];
      pushChangeLog({
        action: "Deleted",
        rowDeleted: true,
        rowIndexDeleted: idx,
        data: rowCopy,
      });
      updated.splice(idx, 1);
    }

    setEditableData(updated);
    setSelectedItems([]);
    setDeleteConfirm(null);
    setHasChanges(true);
  };

  // ---- UPDATED: coalescing Dept edits ----
  const handleDeptChange = (rowIndex, value) => {
    const updated = [...editableData];
    const row = updated[rowIndex];

    if (!row) return;

    const isNewRow = !!row._tempId;

    const prev = row.department;
    row.department = value;

    setEditableData(updated);
    setHasChanges(true);

    // ✅ If new row → update existing Added log only
    if (isNewRow) {
      setChangeLog((prevLogs) =>
        prevLogs.map((c) =>
          c.tempId === row._tempId && c.action === "Added"
            ? {
              ...c,
              data: { ...c.data, department: value },
            }
            : c,
        ),
      );
      return; // 🚀 STOP (no Edited)
    }

    // 🔵 Existing row → log Edited
    upsertEditedLog((c) => c.type === "dept" && c.rowIndex === rowIndex, {
      action: "Edited",
      type: "dept",
      rowIndex,
      prevData: { department: prev },
      data: { department: value },
    });
  };

  const handleAddPdf = (rowIndex) => {
    const updated = structuredClone(editableData);
    const row = updated[rowIndex];

    if (!Array.isArray(row.pdfs)) row.pdfs = [];

    const newPdf = {
      name: "",
      pdf_path: "",
      _tempId: uid("tmp_pdf_"),
    };

    row.pdfs.push(newPdf);

    setEditableData(updated);
    setHasChanges(true);

    // ✅ If this row itself is newly added → DO NOT push file-level log
    if (row._tempId) {
      return;
    }

    // 🔵 Only push Added for existing rows
    pushChangeLog({
      action: "Added",
      rowIndex,
      tempId: newPdf._tempId,
      data: { name: newPdf.name },
    });
  };

  const handleFileUpload = (rowIndex, pdfIndex, file) => {
    const updated = structuredClone(editableData);
    const row = updated[rowIndex];
    const item = row?.pdfs?.[pdfIndex];

    if (!item) return;

    const isNewRow = !!row._tempId;
    const isNewPdf = !!item._tempId;

    const prevData = { pdf_path: item.pdf_path, file: item.file };

    const blobUrl = URL.createObjectURL(file);

    // ✅ Always update state first
    item.pdf_path = blobUrl;
    item.file = file;

    setEditableData(updated);
    setHasChanges(true);

    // 🚫 If row is newly added → no logging
    if (isNewRow) return;

    // 🚫 If pdf is newly added → update Added log only
    if (isNewPdf) {
      setChangeLog((prev) =>
        prev.map((c) =>
          c.tempId === item._tempId && c.action === "Added"
            ? { ...c, data: { ...c.data, name: item.name } }
            : c
        )
      );
      return;
    }

    // 🔵 Existing pdf → log Edited
    upsertEditedLog(
      (c) =>
        c.type === "fileReplace" &&
        c.rowIndex === rowIndex &&
        c.pdfIndex === pdfIndex,
      {
        action: "Edited",
        type: "fileReplace",
        rowIndex,
        pdfIndex,
        prevData,
        data: { name: item.name },
      }
    );
  };


  const handlePdfNameChange = (rowIndex, pdfIndex, value) => {
    const updated = structuredClone(editableData);
    const row = updated[rowIndex];
    const item = row?.pdfs?.[pdfIndex];

    if (!item) return;

    const isNewRow = !!row._tempId;
    const isNewPdf = !!item._tempId;

    const prevName = item.name;

    // ✅ Always update state first
    item.name = value;

    setEditableData(updated);
    setHasChanges(true);

    // 🚫 If row is newly added → do NOT log anything
    if (isNewRow) return;

    // 🚫 If pdf is newly added in existing row → update Added log only
    if (isNewPdf) {
      setChangeLog((prev) =>
        prev.map((c) =>
          c.tempId === item._tempId && c.action === "Added"
            ? { ...c, data: { ...c.data, name: value } }
            : c
        )
      );
      return;
    }

    // 🔵 Existing PDF → log Edited
    upsertEditedLog(
      (c) =>
        c.type === "pdfName" &&
        c.rowIndex === rowIndex &&
        c.pdfIndex === pdfIndex,
      {
        action: "Edited",
        type: "pdfName",
        rowIndex,
        pdfIndex,
        prevData: { name: prevName },
        data: { name: value },
      }
    );
  };


  const handleDeletePdf = (rowIndex, pdfIndex) => {
    const updated = JSON.parse(JSON.stringify(editableData));
    const deletedPdf = updated[rowIndex].pdfs[pdfIndex];
    updated[rowIndex].pdfs.splice(pdfIndex, 1);
    setEditableData(updated);
    setHasChanges(true);

    pushChangeLog({
      action: "Deleted",
      rowIndex,
      pdfIndex,
      data: deletedPdf,
    });

    setDeleteConfirm(null);

  };
  const collectNbaFiles = () => {
    const files = [];

    editableData.forEach((row) => {
      if (!Array.isArray(row.pdfs)) return;

      row.pdfs.forEach((pdf) => {
        if (pdf?.file instanceof File) {
          files.push(pdf.file);
        }
      });
    });

    return files;
  };

  const handleRequestConfirm = async () => {
    const changes = getChanges();

    if (changes.length === 0) {

      return;
    }

    // 1️⃣ Build payload
    const payload = changes.map(buildNbaPayload).filter(Boolean);

    // 2️⃣ Collect PDF files
    const files = collectNbaFiles();

    console.log("📦 NBA PAYLOAD:", payload);
    console.log("📄 NBA FILES:", files);

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

  const toggleRowSelect = (rowIndex) => {
    setSelectedItems((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex],
    );
  };
  const getNbaPdfPath = (pdf) => {
    if (pdf?.file?.name) {
      return `/static/pdfs/nba/${pdf.file.name}`;
    }
    return pdf?.pdf_path || "";
  };

  const getOriginalRow = (rowIndex) => {
    return originalDataRef.current?.[rowIndex] || null;
  };
  const buildNbaPayload = (change) => {
    const { action, rowIndex, data } = change;

    // 🟢 INSERT (New Program)
    if (action === "Added" && change.rowAdded) {
      const row = data;

      return {
        collectionName: "accreditations_and_ranking",
        collection_type: "nba",
        action: "insert",
        title: "insert in nba",
        meta_data: {
          id: row?.id,
          department: row?.department || "",
          pdfs: (row?.pdfs || []).map((pdf) => ({
            name: pdf?.name || "",
            pdf_path: getNbaPdfPath(pdf),
          })),
        },
      };
    }

    // 🔵 UPDATE (Edit Program / PDF)
    if (action === "Edited") {
      const originalRow = getOriginalRow(rowIndex);
      const editedRow = editableData?.[rowIndex];

      if (!originalRow || !editedRow) return null;

      return {
        collectionName: "accreditations_and_ranking",
        collection_type: "nba",
        action: "update",
        title: "update in nba",
        original_data: {
          id: originalRow?.id,
          department: originalRow?.department || "",
          pdfs: (originalRow?.pdfs || []).map((pdf) => ({
            name: pdf?.name || "",
            pdf_path: pdf?.pdf_path || "",
          })),
        },
        meta_data: {
          id: editedRow?.id,
          department: editedRow?.department || "",
          pdfs: (editedRow?.pdfs || []).map((pdf) => ({
            name: pdf?.name || "",
            pdf_path: getNbaPdfPath(pdf),
          })),
        },
      };
    }

    // 🔴 DELETE (Delete Program)
    if (action === "Deleted" && change.rowDeleted) {
      const row = data;

      return {
        collectionName: "accreditations_and_ranking",
        collection_type: "nba",
        action: "delete",
        title: "delete in nba",
        meta_data: {
          id: row?.id,
          department: row?.department || "",
          pdfs: (row?.pdfs || []).map((pdf) => ({
            name: pdf?.name || "",
            pdf_path: pdf?.pdf_path || "",
          })),
        },
      };
    }

    return null;
  };

  // --- Human-readable change descriptions ---
  const describeChange = (change) => {
    // 🔥 NEW ROW
    if (change.rowAdded) {
      return change.data?.department || "New Program";
    }

    // 🔥 ROW DELETED
    if (change.rowDeleted) {
      return change.data?.department || "Program deleted";
    }

    // 🔵 FILE ADDED
    if (
      change.action === "Added" &&
      change.rowIndex != null &&
      !change.rowAdded
    ) {
      const rowName =
        editableData[change.rowIndex]?.department ||
        change.data?.department ||
        "Program";

      const fileName = change.data?.name || "";

      return fileName ? `${rowName} - ${fileName}` : rowName;
    }

    // 🔴 FILE DELETED
    if (change.action === "Deleted" && change.data?.name) {
      const rowName =
        editableData[change.rowIndex]?.department ||
        change.data?.department ||
        "Program";

      return `${rowName} - ${change.data.name}`;
    }

    // 🔵 EDITED
    if (change.action === "Edited") {
      if (change.type === "dept") {
        return change.data?.department || "Program edited";
      }

      if (change.type === "pdfName" || change.type === "fileReplace") {
        const rowName = editableData[change.rowIndex]?.department || "Program";

        return `${rowName} - ${change.data?.name || ""}`;
      }
    }

    return "";
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <div className="nba-page relative">
        {/* Edit Button (always top-right when not in edit mode) */}
        {!editMode && (
          <div className="flex justify-end px-6 py-4 mr-4">
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        )}

        <div className="nba-tiles">
          <div className="nba-tile-container">
            <div className="nba-tile border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
              <h3 className="nba-tile-header text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">
                ABOUT NBA
              </h3>
              <p className="nba-tile-text text-text dark:text-drkt">
                The National Board of Accreditation (NBA) is an autonomous body
                established by the All India Council for Technical Education
                (AICTE) under the Ministry of Education, Government of India.
              </p>
            </div>
            <div className="nba-tile border-l-4 border-secd dark:border-drks rounded-lg dark:bg-drkb">
              <h3 className="nba-tile-header text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">
                Purpose of NBA Accreditation
              </h3>
              <p className="nba-tile-text text-text dark:text-drkt">
                The primary goal of NBA accreditation is to assess and ensure
                that academic programs meet predefined quality standards.
              </p>
            </div>
          </div>
        </div>

        {/* Editable Table */}
        <div className="table-data px-4 md:px-12 lg:px-24">
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="w-[1000px] department-table">
              <thead className="bg-gry">
                <tr>
                  <th className="text-left px-4 py-2 text-text">S.No</th>
                  <th className="text-left px-4 py-2 text-text">Programs</th>
                  <th className="text-left px-4 py-2 text-text">
                    validity Years
                  </th>
                  {editMode && (
                    <th className="text-left px-4 py-2 text-text">Select</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(editableData) &&
                  editableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      <td className="px-4 py-2">{rowIndex + 1}</td>
                      <td className="px-4 py-2">
                        {editMode ? (
                          <input
                            type="text"
                            value={row.department}
                            onChange={(e) =>
                              handleDeptChange(rowIndex, e.target.value)
                            }
                            className="border p-1 rounded"
                          />
                        ) : (
                          row.department
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <ul className="list-disc list-inside space-y-1">
                          {Array.isArray(row.pdfs) &&
                            row.pdfs.map((pdf, pdfIndex) => (
                              <li
                                key={pdfIndex}
                                className="flex items-center gap-2"
                              >
                                {editMode ? (
                                  <>
                                    <input
                                      type="text"
                                      value={pdf.name}
                                      onChange={(e) =>
                                        handlePdfNameChange(
                                          rowIndex,
                                          pdfIndex,
                                          e.target.value,
                                        )
                                      }
                                      className="border p-1 rounded text-sm"
                                    />
                                    <label className="bg-yellow-400 text-white px-3 py-1 rounded cursor-pointer">
                                      {pdf?.pdf_path ? "Replace" : "Upload"}
                                      <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) =>
                                          handleFileUpload(
                                            rowIndex,
                                            pdfIndex,
                                            e.target.files[0],
                                          )
                                        }
                                      />
                                    </label>
                                    <button
                                      onClick={() => handlePdfClick(pdf)}
                                      className="text-blue-500"
                                    >
                                      <FaEye />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteConfirm({
                                          type: "pdf",
                                          rowIndex,
                                          pdfIndex,
                                        })
                                      }
                                      className="text-red-500"
                                    >
                                      <Trash2 />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handlePdfClick(pdf)}
                                    className="text-brwn dark:text-drka hover:underline"
                                  >
                                    {pdf.name}
                                  </button>
                                )}
                              </li>
                            ))}
                        </ul>
                        {editMode && (
                          <button
                            onClick={() => handleAddPdf(rowIndex)}
                            className="flex items-center text-green-500 mt-2"
                          >
                            <FaPlus className="mr-2" /> Add File
                          </button>
                        )}
                      </td>
                      {editMode && (
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(rowIndex)}
                            onChange={() => toggleRowSelect(rowIndex)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>

            {editMode && (
              <div className="w-full flex justify-center py-4">
                <button
                  onClick={handleAddRow}
                  className="px-6 py-2 border-2 border-[#fdcc06] text-white bg-[#fdcc03] rounded-lg hover:bg-[#fdcc03] hover:text-white transition"
                >
                  + Add New Row
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Delete Button */}
        {editMode && selectedItems.length > 0 && (
          <div className="w-full flex justify-center mt-6 mb-4">
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

        {/* Cancel and Save */}
        {editMode && (
          <div className="flex gap-2 mt-4 justify-end mb-2 mr-8">
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

        {/* Request + Discard */}
        {changesSaved && !requestSent && (
          <div className="flex gap-2 justify-end mt-4 mb-2 mr-8">
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Discard All Changes
            </button>
            <button
              onClick={handleSendRequest}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} />
              Request
            </button>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[400px] text-center">
              <h2 className="text-lg font-bold text-text dark:text-drkt mb-4">
                Confirm Delete
              </h2>
              <p className="text-sm text-text dark:text-drkt mb-6">
                {deleteConfirm.type === "multiple"
                  ? `Are you sure you want to delete ${deleteConfirm.items.length} row(s)?`
                  : "Are you sure you want to delete this PDF?"}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded bg-gray-400 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    deleteConfirm.type === "multiple"
                      ? handleDeleteSelected()
                      : handleDeletePdf(
                        deleteConfirm.rowIndex,
                        deleteConfirm.pdfIndex,
                      )
                  }
                  className="px-4 py-2 rounded bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[680px] max-w-[95vw]">
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
                    {getChanges().map((change) => (
                      <tr key={change.id} className="border-t">
                        {/* Action */}
                        <td
                          className={`py-2 ${change.action === "Added"
                            ? "text-green-600"
                            : change.action === "Deleted"
                              ? "text-red-600"
                              : "text-blue-600"
                            }`}
                        >
                          {change.action}
                        </td>

                        {/* Section (static "NBA" as requested) */}
                        <td className="py-2">NBA</td>

                        {/* Changes description */}
                        <td className="py-2 text-[13px]">
                          <div className="flex items-center justify-center gap-2">
                            <span>{describeChange(change)}</span>
                          </div>
                        </td>

                        {/* Undo button */}
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
                  disabled={loadings}
                  className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
                >
                  {loadings ? "Submitting..." : "Final Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default NBA_F;
