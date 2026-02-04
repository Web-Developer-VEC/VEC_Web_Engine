import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Regulation.css";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Plus, Send, Pencil, Eye, X } from "lucide-react";
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
  const [newFiles, setNewFiles] = useState([null, null, null]); // File | null per link index
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Checkbox delete states
  const [selectedRegs, setSelectedRegs] = useState([]); // indexes
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Request modal states
  const [showRequestModal, setShowRequestModal] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${BASE_URL}${path}`;
  };

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

  const normalizeReg = (reg) => ({
    category: reg?.category ?? "",
    links: Array.isArray(reg?.links)
      ? reg.links.map((l) => ({
          name: l?.name ?? "",
          pdf_path: l?.pdf_path ?? "",
        }))
      : [],
  });

  const buildMapByCategory = (arr) => {
    const map = new Map();
    (arr || []).forEach((r) => {
      map.set(r?.category ?? "", normalizeReg(r));
    });
    return map;
  };

  // Fetch regulation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "regulation",
        });
        const data = response.data.data || [];

        setRegulationData(data);
        setInitialData(data);

        initialMapRef.current = buildMapByCategory(data);

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

  // Detect changes vs baseline
  useEffect(() => {
    const baseMap = initialMapRef.current;
    const curMap = buildMapByCategory(regulationData);

    let changed = false;

    // insert/update
    for (const [cat, cur] of curMap.entries()) {
      const base = baseMap.get(cat);
      if (!base || JSON.stringify(base) !== JSON.stringify(cur)) {
        changed = true;
        break;
      }
    }

    // delete
    if (!changed) {
      for (const [cat] of baseMap.entries()) {
        if (!curMap.has(cat)) {
          changed = true;
          break;
        }
      }
    }

    setHasChanges(changed);
  }, [regulationData]);

  // Checkbox selection
  const handleCheckboxChange = (index) => {
    setSelectedRegs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Add or update regulation (UI only)
  const handleAddOrUpdateRegulation = (newReg, index = null) => {
    if (index !== null) {
      setRegulationData((prev) => {
        const updated = [...prev];
        updated[index] = newReg;
        return updated;
      });
    } else {
      setRegulationData((prev) => [newReg, ...prev]);
    }
  };

  // Start editing
  const handleStartEditing = () => setIsEditing(true);

  // Cancel editing (exit edit mode only)
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedRegs([]);
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

  // Discard changes (reset to baseline)
  const handleDiscardChanges = () => {
    const clonedData = initialData.map((reg) => ({
      category: reg.category,
      links: reg.links.map((link) => ({ ...link })),
    }));

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
    setNewFiles([null, null, null]);

    setSelectedRegs([]);
    setShowDeleteConfirm(false);

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
    setNewFiles([null, null, null]);
    setShowPopup(true);
  };

  // Edit popup
  const handleEditRegulation = (index) => {
    const item = regulationData[index];
    setIsEditingItem(true);
    setEditIndex(index);
    setNewYear(item.category);
    setNewLinks(item.links.map((l) => ({ ...l })));
    setNewFiles([null, null, null]); // only new uploads will be sent
    setShowPopup(true);
  };

  // Confirm delete selection
  const confirmDeleteSelected = () => {
    if (selectedRegs.length === 0) return;
    setRegulationData((prev) => prev.filter((_, idx) => !selectedRegs.includes(idx)));
    setSelectedRegs([]);
    setShowDeleteConfirm(false);
    toast.success("Selected items removed (pending request).");
  };

  // -----------------------------
  // Request changes (Inserted/Updated/Deleted) based on category key
  // -----------------------------
  const requestChanges = useMemo(() => {
    const baseMap = initialMapRef.current;
    const curMap = buildMapByCategory(regulationData);

    const changes = [];

    // insert/update
    for (const [cat, cur] of curMap.entries()) {
      const base = baseMap.get(cat);
      if (!base) {
        changes.push({ type: "Inserted", category: cat, current: cur, original: null });
      } else if (JSON.stringify(base) !== JSON.stringify(cur)) {
        changes.push({ type: "Updated", category: cat, current: cur, original: base });
      }
    }

    // delete
    for (const [cat, base] of baseMap.entries()) {
      if (!curMap.has(cat)) {
        changes.push({ type: "Deleted", category: cat, current: null, original: base });
      }
    }

    return changes;
  }, [regulationData]);

  const undoRequestChange = (change) => {
    const baseMap = initialMapRef.current;

    if (change.type === "Inserted") {
      setRegulationData((prev) => prev.filter((r) => r.category !== change.category));
      return;
    }

    if (change.type === "Updated") {
      const baseline = baseMap.get(change.category);
      if (!baseline) return;
      setRegulationData((prev) => prev.map((r) => (r.category === change.category ? baseline : r)));
      return;
    }

    if (change.type === "Deleted") {
      const baseline = baseMap.get(change.category);
      if (!baseline) return;
      setRegulationData((prev) => [baseline, ...prev]);
    }
  };

  // -----------------------------
  // Payload generation for /api/admin-backend/temp (useAdminRequest)
  // IMPORTANT: useAdminRequest sends {docs: JSON.stringify(payload)} as FormData
  // So payload must be an ARRAY of docs.
  // -----------------------------
  const buildPayloads = () => {
    return requestChanges.map((c) => {
      if (c.type === "Inserted") {
        return {
          collectionName: "exams",
          collection_type: "regulation",
          action: "insert",
          title: "insert in regulation",
          meta_data: c.current,
        };
      }
      if (c.type === "Updated") {
        return {
          collectionName: "exams",
          collection_type: "regulation",
          action: "update",
          title: "update in regulation",
          original_data: c.original,
          meta_data: c.current,
        };
      }
      // Deleted
      return {
        collectionName: "exams",
        collection_type: "regulation",
        action: "delete",
        title: "delete in regulation",
        meta_data: c.original,
      };
    });
  };

  const handleConfirmRequest = async () => {
    // Gate: must have changes
    if (requestChanges.length === 0) {
      toast.info("No changes to request.");
      return;
    }

    const payloads = buildPayloads();
    const filesToSend = newFiles.filter(Boolean);

    console.log("REGULATION PAYLOADS:", payloads);
    console.log("FILES:", filesToSend);

    const res = await sendRequest(payloads, filesToSend);

    if (!res) {
      // useAdminRequest already shows toast "Request failed". Add a helpful hint:
      toast.error(
        "Request failed. Check console Network tab: /api/admin-backend/temp. Also confirm token/cookies are valid."
      );
      return;
    }

    // After success: set new baseline to current
    setInitialData(JSON.parse(JSON.stringify(regulationData)));
    initialMapRef.current = buildMapByCategory(regulationData);

    setIsDone(false);
    setShowRequestModal(false);
    setNewFiles([null, null, null]);
    toast.success("Request submitted successfully.");
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
              <div key={reg.category || index} className="regulation-card relative">
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
                        <span className="text-text dark:text-drkt font-[Poppins]">
                          {link.name}
                        </span>
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
                <button
                  className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                  onClick={handleCancel}
                >
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
                  onClick={handleDiscardChanges}
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[420px]">
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

            {newLinks.map((link, idx) => (
              <div key={idx} className="flex justify-between items-center mb-2">
                <span className="font-medium">{link.name}</span>

                <div className="flex gap-2 items-center">
                  <button
                    className="px-2 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                    onClick={() => document.getElementById(`file-${idx}`).click()}
                  >
                    {link.pdf_path ? "Replace" : "Upload"}
                  </button>

                  {link.pdf_path && (
                    <button
                      className="px-2 py-1 rounded"
                      onClick={() => window.open(UrlParser(link.pdf_path), "_blank")}
                      title="Preview PDF"
                    >
                      <Eye size={16} color="blue" />
                    </button>
                  )}

                  <input
                    type="file"
                    accept="application/pdf"
                    id={`file-${idx}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // keep file for backend upload
                        setNewFiles((prev) => {
                          const nxt = [...prev];
                          nxt[idx] = file;
                          return nxt;
                        });

                        // UI preview
                        const updatedLinks = [...newLinks];
                        updatedLinks[idx].pdf_path = URL.createObjectURL(file);
                        setNewLinks(updatedLinks);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            ))}

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
                  setNewFiles([null, null, null]);
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
            <p className="text-center mb-4">
              Are you sure you want to delete selected item(s)?
            </p>
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
                    <td colSpan={4} className="border p-4">No changes detected</td>
                  </tr>
                ) : (
                  requestChanges.map((c) => (
                    <tr key={`${c.type}-${c.category}`}>
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
                      <td className="border p-2">{c.category}</td>
                      <td className="border p-2">
                        {(c.current?.links || c.original?.links || []).map((l) => l.name).join(", ")}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => undoRequestChange(c)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Undo"
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
              <p className="mt-3 text-sm text-red-600">
                Error: {String(requestError?.message || requestError)}
              </p>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} />
    </>
  );
};

export default AdminREGULATION;