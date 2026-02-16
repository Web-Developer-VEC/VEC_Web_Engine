import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Regulation.css";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Plus, Send, Pencil, Eye, X, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminREGULATION = ({ theme, toggle }) => {
  const { sendRequest, loading: requestLoading, error: requestError } = useAdminRequest();

  const [regulationData, setRegulationData] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const initialMapRef = useRef(new Map());

  const [hasChanges, setHasChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setLoading] = useState(true);

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newLinks, setNewLinks] = useState([
    { name: "UG - B.E / B.Tech", pdf_path: "" },
    { name: "PG - ME", pdf_path: "" },
    { name: "PG - MBA", pdf_path: "" },
  ]);
  const [popupFiles, setPopupFiles] = useState([null, null, null]); // File | null per link index

  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Checkbox delete states
  const [selectedRegs, setSelectedRegs] = useState([]); // indexes
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Request modal states
  const [showRequestModal, setShowRequestModal] = useState(false);

  // ✅ NEW: Discard confirmation for "Discard Changes" (after Save)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${BASE_URL}${path}`;
  };

  // -----------------------------
  // Stable key logic (for diff)
  // -----------------------------
  const makeKey = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const normalizeReg = (reg) => ({
    __key: reg?.__key || reg?._id || makeKey(),
    category: reg?.category ?? "",
    links: Array.isArray(reg?.links)
      ? reg.links.map((l) => ({
          name: l?.name ?? "",
          pdf_path: l?.pdf_path ?? "",
        }))
      : [],
  });

  const buildMapByKey = (arr) => {
    const map = new Map();
    (arr || []).forEach((r) => {
      const norm = normalizeReg(r);
      map.set(norm.__key, norm);
    });
    return map;
  };

  const deepCloneRegs = (arr) =>
    (arr || []).map((r) => ({
      __key: r.__key,
      category: r.category,
      links: (r.links || []).map((l) => ({ ...l })),
    }));

  // Online/offline
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

  // Fetch regulation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "regulation",
        });
        const data = response.data.data || [];

        const keyed = data.map((r) => normalizeReg(r));

        setRegulationData(keyed);
        setInitialData(deepCloneRegs(keyed));
        initialMapRef.current = buildMapByKey(keyed);

        setLoading(false);
      } catch (error) {
        console.error("Error Fetching Regulation data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
        setLoading(true);
      }
    };
    fetchData();
  }, [navigate]);

  // Detect changes vs baseline (by __key)
  useEffect(() => {
    const baseMap = initialMapRef.current;
    const curMap = buildMapByKey(regulationData);

    let changed = false;

    for (const [key, cur] of curMap.entries()) {
      const base = baseMap.get(key);
      if (!base || JSON.stringify(base) !== JSON.stringify(cur)) {
        changed = true;
        break;
      }
    }

    if (!changed) {
      for (const [key] of baseMap.entries()) {
        if (!curMap.has(key)) {
          changed = true;
          break;
        }
      }
    }

    setHasChanges(changed);

    // ✅ NEW: if request modal is open and changes become empty, auto close and restore original page state
    // This happens when user clicks Undo for everything, leaving no diffs.
    if (!changed && showRequestModal) {
      setShowRequestModal(false);
      setIsDone(false);
      setIsEditing(false);
      setSelectedRegs([]);
      toast.info("No pending changes. Returning to original page.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regulationData]);

  // Checkbox selection
  const handleCheckboxChange = (index) => {
    setSelectedRegs((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  // Add or update regulation (UI only)
  const handleAddOrUpdateRegulation = (newReg, index = null) => {
    if (index !== null) {
      setRegulationData((prev) => {
        const updated = [...prev];
        const existingKey = updated[index]?.__key;
        updated[index] = normalizeReg({ ...newReg, __key: existingKey });
        return updated;
      });
    } else {
      const withKey = normalizeReg({ ...newReg, __key: makeKey() });
      setRegulationData((prev) => [withKey, ...prev]);
    }
  };

  // Start editing
  const handleStartEditing = () => {
    setIsEditing(true);
    setSelectedRegs([]);
  };

  // Cancel editing => revert all changes
  const handleCancel = () => {
    const baseline = deepCloneRegs(initialData);
    setRegulationData(baseline);

    setIsEditing(false);
    setIsDone(false);
    setSelectedRegs([]);

    setShowPopup(false);
    setIsEditingItem(false);
    setEditIndex(null);
    setNewYear("");
    setNewLinks([
      { name: "UG - B.E / B.Tech", pdf_path: "" },
      { name: "PG - ME", pdf_path: "" },
      { name: "PG - MBA", pdf_path: "" },
    ]);
    setPopupFiles([null, null, null]);

    toast.info("Changes reverted.");
  };

  // Save changes (stage for request)
  const handleSave = () => {
    if (!hasChanges) {
      toast.info("No changes to save.");
      return;
    }
    setIsEditing(false);
    setIsDone(true);
    toast.success("Saved. Now click Request to send for approval.");
  };

  // ✅ Confirmation flow for "Discard Changes" (after Save)
  const requestDiscardChanges = () => setShowDiscardConfirm(true);

  const confirmDiscardChanges = () => {
    const clonedData = deepCloneRegs(initialData);

    setRegulationData(clonedData);
    setIsEditing(false);
    setIsDone(false);

    setShowPopup(false);
    setIsEditingItem(false);
    setEditIndex(null);

    setNewYear("");
    setNewLinks([
      { name: "UG - B.E / B.Tech", pdf_path: "" },
      { name: "PG - ME", pdf_path: "" },
      { name: "PG - MBA", pdf_path: "" },
    ]);
    setPopupFiles([null, null, null]);

    setSelectedRegs([]);
    setShowDeleteConfirm(false);
    setShowDiscardConfirm(false);
    setShowRequestModal(false);

    toast.info("Discarded all changes.");
  };

  // Add popup
  const handleAddNew = () => {
    setIsEditingItem(false);
    setEditIndex(null);
    setNewYear("");
    setNewLinks([
      { name: "UG - B.E / B.Tech", pdf_path: "" },
      { name: "PG - ME", pdf_path: "" },
      { name: "PG - MBA", pdf_path: "" },
    ]);
    setPopupFiles([null, null, null]);
    setShowPopup(true);
  };

  // Edit popup
  const handleEditRegulation = (index) => {
    const item = regulationData[index];
    setIsEditingItem(true);
    setEditIndex(index);
    setNewYear(item.category);
    setNewLinks(item.links.map((l) => ({ ...l })));
    setPopupFiles([null, null, null]);
    setShowPopup(true);
  };

  // Confirm delete selection (delete a year card)
  const confirmDeleteSelected = () => {
    if (selectedRegs.length === 0) return;
    const selectedSet = new Set(selectedRegs);
    setRegulationData((prev) => prev.filter((_, idx) => !selectedSet.has(idx)));
    setSelectedRegs([]);
    setShowDeleteConfirm(false);
    toast.success("Selected items removed (pending request).");
  };

  // -----------------------------
  // Diff for request modal (Inserted/Updated/Deleted)
  // -----------------------------
  const requestChanges = useMemo(() => {
    const baseMap = initialMapRef.current;
    const curMap = buildMapByKey(regulationData);

    const changes = [];

    for (const [key, cur] of curMap.entries()) {
      const base = baseMap.get(key);
      if (!base) {
        changes.push({ type: "Inserted", key, section: cur.category, current: cur, original: null });
      } else if (JSON.stringify(base) !== JSON.stringify(cur)) {
        changes.push({ type: "Updated", key, section: cur.category, current: cur, original: base });
      }
    }

    for (const [key, base] of baseMap.entries()) {
      if (!curMap.has(key)) {
        changes.push({ type: "Deleted", key, section: base.category, current: null, original: base });
      }
    }

    return changes;
  }, [regulationData]);

  const undoRequestChange = (change) => {
    const baseMap = initialMapRef.current;

    if (change.type === "Inserted") {
      setRegulationData((prev) => prev.filter((r) => r.__key !== change.key));
      return;
    }

    if (change.type === "Updated") {
      const baseline = baseMap.get(change.key);
      if (!baseline) return;
      setRegulationData((prev) => prev.map((r) => (r.__key === change.key ? baseline : r)));
      return;
    }

    if (change.type === "Deleted") {
      const baseline = baseMap.get(change.key);
      if (!baseline) return;
      setRegulationData((prev) => [baseline, ...prev]);
    }
  };

  // Payload generation (strip __key)
  const stripKey = (reg) => ({
    category: reg?.category ?? "",
    links: Array.isArray(reg?.links)
      ? reg.links.map((l) => ({ name: l?.name ?? "", pdf_path: l?.pdf_path ?? "" }))
      : [],
  });

  const buildPayloads = () => {
    return requestChanges.map((c) => {
      if (c.type === "Inserted") {
        return {
          collectionName: "exams",
          collection_type: "regulation",
          action: "insert",
          title: "insert in regulation",
          meta_data: stripKey(c.current),
        };
      }
      if (c.type === "Updated") {
        return {
          collectionName: "exams",
          collection_type: "regulation",
          action: "update",
          title: "update in regulation",
          original_data: stripKey(c.original),
          meta_data: stripKey(c.current),
        };
      }
      return {
        collectionName: "exams",
        collection_type: "regulation",
        action: "delete",
        title: "delete in regulation",
        meta_data: stripKey(c.original),
      };
    });
  };

  const handleConfirmRequest = async () => {
    if (requestChanges.length === 0) {
      toast.info("No changes to request.");
      setShowRequestModal(false);
      setIsDone(false);
      return;
    }

    const payloads = buildPayloads();
    const filesToSend = popupFiles.filter(Boolean);

    const res = await sendRequest(payloads, filesToSend);

    if (!res) {
      toast.error(
        "Request failed. Check console Network tab: /api/admin-backend/temp. Also confirm token/cookies are valid."
      );
      return;
    }

    // After success: set new baseline to current
    const nextBaseline = deepCloneRegs(regulationData);
    setInitialData(nextBaseline);
    initialMapRef.current = buildMapByKey(nextBaseline);

    setIsDone(false);
    setShowRequestModal(false);
    setPopupFiles([null, null, null]);
    toast.success("Request submitted successfully.");
  };

  // -----------------------------
  // Popup helpers (Trash + file name)
  // -----------------------------
  const clearProgrammePdf = (idx) => {
    setNewLinks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], pdf_path: "" };
      return next;
    });

    setPopupFiles((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });

    toast.info("PDF removed (pending submit).");
  };

  const handleProgrammeUpload = (idx, file) => {
    if (!file) return;

    setPopupFiles((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });

    setNewLinks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], pdf_path: URL.createObjectURL(file) };
      return next;
    });
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Regulations"
        subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="regulation-container mt-10">
          {!isEditing && (
            <div className="flex justify-end pr-8 my-0 mr-10">
              <button
                className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-text gap-2 hover:bg-[#800000] hover:text-prim"
                onClick={handleStartEditing}
              >
                <Pencil size={16} /> Edit
              </button>
            </div>
          )}

          <h1 className="title text-brwn dark:text-drkt">Regulations</h1>

          <div className="regulation-grid">
            {regulationData?.map((reg, index) => (
              <div key={reg.__key} className="regulation-card relative">
                <div className="flex items-center justify-between">
                  <h2 className="regulation-year text-brwn dark:text-drkt text-md border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
                    {reg.category}
                  </h2>

                  {isEditing && (
                    <div className="flex gap-2 items-center ml-4">
                      <input
                        type="checkbox"
                        checked={selectedRegs.includes(index)}
                        onChange={() => handleCheckboxChange(index)}
                        className="w-4 h-4"
                      />
                      <button
                        className="text-text bg-secd px-2 py-2 rounded text-sm"
                        onClick={() => handleEditRegulation(index)}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <ul className="regulation-list mt-2">
                  {reg.links.map((link, idx) => (
                    <li key={idx}>
                      {link?.pdf_path ? (
                        <a
                          href={UrlParser(link.pdf_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-drkt font-[Poppins] hover:underline text-blue-600"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <span className="text-text dark:text-drkt font-[Poppins]">{link.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {isEditing && (
              <button
                className="bg-gray-100 my-auto ml-20 h-40 w-40 p-6 flex justify-center items-center border border-black rounded-md hover:bg-gray-200"
                onClick={handleAddNew}
              >
                <Plus className="mr-2" /> Add New
              </button>
            )}
          </div>

          <div className="flex gap-3 justify-end items-center pr-8 my-8 mr-10">
            {isEditing && (
              <>
                <button className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300" onClick={handleCancel}>
                  Cancel
                </button>

                {hasChanges && (
                  <button
                    className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {isDone && !isEditing && (
              <>
                <button
                  className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                  onClick={requestDiscardChanges}
                  disabled={requestLoading}
                >
                  Discard Changes
                </button>

                <button
                  className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
                  onClick={() => setShowRequestModal(true)}
                  disabled={requestLoading}
                >
                  <Send size={16} className="mr-1" /> Request
                </button>
              </>
            )}
          </div>

          {selectedRegs.length > 0 && (
            <div className="w-full flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete {selectedRegs.length} Item{selectedRegs.length !== 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[460px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEditingItem ? "Edit Regulation" : "Add New Regulation"}
            </h2>

            <input
              type="text"
              placeholder="Enter Regulation Year (e.g., 2024)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />

            {newLinks.map((link, idx) => {
              const file = popupFiles[idx];
              const hasPdf = Boolean(link?.pdf_path);

              return (
                <div key={idx} className="flex justify-between items-center mb-2">
                  <span className="font-medium">{link.name}</span>

                  <div className="flex items-center gap-2">
                    {file && (
                      <p className="text-[11px] text-green-600 dark:text-green-400 truncate max-w-[140px]">
                        ✓ {file.name}
                      </p>
                    )}

                    <button
                      className="px-2 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                      onClick={() => document.getElementById(`file-${idx}`).click()}
                      type="button"
                    >
                      {hasPdf ? "Replace" : "Upload"}
                    </button>

                    {hasPdf && (
                      <button
                        className="px-2 py-1 rounded"
                        onClick={() => window.open(UrlParser(link.pdf_path), "_blank")}
                        title="Preview PDF"
                        type="button"
                      >
                        <Eye size={16} color="blue" />
                      </button>
                    )}

                    {hasPdf && (
                      <button
                        className="px-2 py-1 rounded"
                        onClick={() => clearProgrammePdf(idx)}
                        title="Remove PDF"
                        type="button"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    )}

                    <input
                      type="file"
                      accept="application/pdf"
                      id={`file-${idx}`}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        handleProgrammeUpload(idx, f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                onClick={() => {
                  if (!newYear.trim()) {
                    toast.error("Please enter regulation year/category");
                    return;
                  }

                  const newReg = { category: newYear.trim(), links: newLinks };
                  handleAddOrUpdateRegulation(newReg, isEditingItem ? editIndex : null);

                  setShowPopup(false);
                  setNewYear("");
                  setNewLinks([
                    { name: "UG - B.E / B.Tech", pdf_path: "" },
                    { name: "PG - ME", pdf_path: "" },
                    { name: "PG - MBA", pdf_path: "" },
                  ]);
                  setPopupFiles([null, null, null]);
                  setIsEditingItem(false);
                  setEditIndex(null);
                }}
              >
                {isEditingItem ? "Update" : "Submit"}
              </button>

              <button
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-center">Confirm Deletion</h2>
            <p className="text-center mb-4">Are you sure you want to delete selected item(s)?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                onClick={confirmDeleteSelected}
              >
                Yes, Delete
              </button>

              <button
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Discard Confirmation */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[420px]">
            <h2 className="text-lg font-semibold mb-4 text-center">Discard all changes?</h2>
            <p className="text-center mb-5 text-sm text-gray-600 dark:text-gray-300">
              This will revert everything back to the last approved state.
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                onClick={confirmDiscardChanges}
                disabled={requestLoading}
              >
                Yes, Discard
              </button>

              <button
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={() => setShowDiscardConfirm(false)}
                disabled={requestLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            <table className="w-full border border-gray-300 text-sm text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {requestChanges.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border p-4">
                      No changes detected
                    </td>
                  </tr>
                ) : (
                  requestChanges.map((c) => (
                    <tr key={`${c.type}-${c.key}`}>
                      <td
                        className={`border p-2 ${
                          c.type === "Deleted"
                            ? "text-red-600"
                            : c.type === "Inserted"
                              ? "text-green-600"
                              : "text-blue-600"
                        }`}
                      >
                        {c.type}
                      </td>
                      <td className="border p-2">{c.section}</td>
                      <td className="border p-2">
                        {(c.current?.links || c.original?.links || []).map((l) => l.name).join(", ")}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => undoRequestChange(c)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Undo"
                          disabled={requestLoading}
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000] flex items-center gap-2"
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Confirm Request"}
              </button>
            </div>

            {requestError && (
              <p className="mt-3 text-sm text-red-600">Error: {String(requestError?.message || requestError)}</p>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} />
    </>
  );
};

export default AdminREGULATION;