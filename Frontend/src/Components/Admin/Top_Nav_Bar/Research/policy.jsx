import { useEffect, useRef, useState } from "react";
import "./Academicresearch.css";
import "./Journal_publica.css"; // keeps the same styles as your journal page
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { Eye, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function AdminPolicies({ theme, toggle }) {
  const [policies, setPolicies] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  // Editing & change tracking (mirrors AdminJournal)
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [newName, setNewName] = useState("");
  // newPdf can be: null | File (picked) | string (existing pdf path)
  const [newPdf, setNewPdf] = useState(null);
  const [editIndex, setEditIndex] = useState(null); // null = add, number = edit

  const [selectedToDelete, setSelectedToDelete] = useState(new Set());

  const [sessionChanges, setSessionChanges] = useState([]); // current session changes
  const [allChanges, setAllChanges] = useState([]); // accumulated saved changes
  const [showRequestModal, setShowRequestModal] = useState(false);

  // delete confirm modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null); // 'single' | 'multiple'
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);

  // refs to keep original/saved data
  const originalRef = useRef([]);
  const savedDataRef = useRef([]);
  const { sendRequest, loading: loadings , error } = useAdminRequest();
  

  // -------------------- Fetch --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post("/api/main-backend/research", { type: "Policy" });
        const data = res.data?.data || [];
        setPolicies(data);
        originalRef.current = JSON.parse(JSON.stringify(data));
        savedDataRef.current = JSON.parse(JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching Policy data", err);
        if (err.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: err.response.data.message } });
        }
      }
    };
    fetchData();
  }, [navigate]);

  // -------------------- Helpers --------------------
  const handleAddNewButton = () => {
    setEditIndex(null);
    setNewName("");
    setNewPdf(null);
    setShowPopup(true);
  };

  const handleEditButton = (index) => {
    
    const entry = policies[index];
    setEditIndex(index);
    setNewName(entry?.name ?? "");
    // store existing path (string) so popup shows Replace/File and Eye
    setNewPdf(entry?.pdf_path ?? null);
    setShowPopup(true);
  };

  const pushSessionChange = (changeObj) => {
    setSessionChanges((prev) => [...prev, changeObj]);
  }

  // Save from popup (add or edit)
  // IMPORTANT: for edits we allow keeping existing pdf if user doesn't replace it
  const handleSavePopup = () => {
    // Require name always. For add require pdf. For edit allow keeping existing pdf.
    if (!newName) {
      toast.error("Policy name is required");
      return;
    }
    if (editIndex === null && !newPdf) {
      toast.error("PDF is required when adding");
      return;
    }

    // Determine pdf value to store:
    // - If user picked a File => use file.name
    // - Else if newPdf is string (existing path) => use it
    // - Else if editing and newPdf is null, fallback to existing journal entry pdf_path
    let pdfValue = null;
    if (newPdf instanceof File) pdfValue = newPdf.name;
    else if (typeof newPdf === "string" && newPdf !== "") pdfValue = newPdf;
    else if (editIndex !== null) pdfValue = policies[editIndex]?.pdf_path ?? "";

    if (editIndex !== null) {
      // Editing existing
      const oldEntry = policies[editIndex];
      setPolicies((prev) => prev.map((it, i) => (i === editIndex ? { ...it, name: newName, pdf_path: pdfValue } : it)));

      pushSessionChange({
        action: "edit",
        section: "Policy",
        key: oldEntry?.name ?? newName,
        changes: {
          name: { old: oldEntry?.name ?? null, new: newName },
          pdf_path: { old: oldEntry?.pdf_path ?? null, new: pdfValue },
        },
      });

      toast.success("Policy edited (session)");
    } else {
      // Adding new
      const newEntry = { name: newName, pdf_path: pdfValue };
      setPolicies((prev) => [...(prev || []), newEntry]);

      pushSessionChange({
        action: "add",
        section: "Policy",
        key: newName,
        changes: { name: { old: null, new: newName }, pdf_path: { old: null, new: pdfValue } },
      });

      toast.success("Policy added (session)");
    }

    // reset popup
    setNewName("");
    setNewPdf(null);
    setEditIndex(null);
    setShowPopup(false);
  };

  const handleCancelPopup = () => {
    setNewName("");
    setNewPdf(null);
    setEditIndex(null);
    setShowPopup(false);
  };

  const toggleSelectToDelete = (index) => {
   
    setSelectedToDelete((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(index)) nxt.delete(index);
      else nxt.add(index);
      return nxt;
    });
  };


  const openDeleteConfirmMultiple = () => {
    if (selectedToDelete.size === 0) {
      toast.info("No items selected");
      return;
    }

    setDeleteMode("multiple");
    setDeleteConfirmOpen(true);
    setShowPopup(false)
  };

  const confirmDelete = () => {
    let newPolicies = [...policies];
    let newSession = [...sessionChanges];

    if (deleteMode === "single") {
      const idx = deleteTargetIndex;
      if (idx == null) return;
      newSession.push({

        action: "delete",
        section: "Policy",
        key: newPolicies[idx]?.name,
        changes: { deleted: newPolicies[idx] },
      });
      newPolicies.splice(idx, 1);
    }

    if (deleteMode === "multiple") {
      const toDelete = Array.from(selectedToDelete).sort((a, b) => b - a);
      for (const idx of toDelete) {
        newSession.push({
          action: "delete",
          section: "Policy",
          key: newPolicies[idx]?.name,
          changes: { deleted: newPolicies[idx] },
        });
        newPolicies.splice(idx, 1);
      }
    }

    setPolicies(newPolicies);
    setSessionChanges(newSession);
    setSelectedToDelete(new Set());
    setDeleteConfirmOpen(false);
    setDeleteMode(null);
    setDeleteTargetIndex(null);

    toast.success("Deleted in session");
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteMode(null);
    setDeleteTargetIndex(null);
  };

  // Save session changes to allChanges (persisted for request)
  const handleSaveSession = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    savedDataRef.current = JSON.parse(JSON.stringify(policies));
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
    toast.success("Session saved. You can Request now.");
  };

  const handleCancelSession = () => {
    setPolicies(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    toast.info("Session changes discarded.");
  };

  const handleDiscardAll = () => {
    setPolicies(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    toast.success("All changes discarded and reset.");
  };

  const handleRequest = () => {
    if (allChanges.length === 0) {
      toast.info("No changes to request.");
      return;
    }
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = async () => {
  if (!allChanges.length) {
    toast.info("No changes to submit.");
    return;
  }

  const payload = [];
  const filesToUpload = [];

  for (const change of allChanges) {

    // ---------- INSERT ----------
    if (change.action === "add") {
      const { name, pdf_path } = change.changes;

      const finalPath = `/static/pdfs/overall_research/${name.new}/${pdf_path.new}`;

      payload.push({
        action: "insert",
        collectionName: "research",
        title: "Policy",
        collection_type: "Policy",
        meta_data: {
          name: name.new,
          pdf_path: finalPath
        }
      });

      if (pdf_path.new instanceof File) {
        filesToUpload.push(pdf_path.new);
      }
    }

    // ---------- UPDATE ----------
    if (change.action === "edit") {
      const { name, pdf_path } = change.changes;

      const finalPath = `/static/pdfs/overall_research/${name.new}/${pdf_path.new}`;

      payload.push({
        action: "update",
        collectionName: "research",
        title: "Policy",
        collection_type: "Policy",
        original_data: {
          name: name.old,
          pdf_path: pdf_path.old
        },
        meta_data: {
          name: name.new,
          pdf_path: finalPath
        }
      });

      if (pdf_path.new instanceof File) {
        filesToUpload.push(pdf_path.new);
      }
    }

    // ---------- DELETE ----------
    if (change.action === "delete") {
      payload.push({
        action: "delete",
        collectionName: "research",
        title: "Policy",
        collection_type: "Policy",
        meta_data: {
          name: change.key
        }
      });
    }
  }

  try {
    const result = await sendRequest(payload, filesToUpload);

    if (result) {
  console.log("FINAL REQUEST SUBMITTED", { payload });

  toast.success("Final request submitted");

  setShowRequestModal(false);
  setAllChanges([]);
  setSessionChanges([]);
  setIsEditing(false);
  setIsSavedOnce(false);

  // update saved references with current policies
  originalRef.current = JSON.parse(JSON.stringify(policies));
  savedDataRef.current = JSON.parse(JSON.stringify(policies));
}

  } catch (err) {
    console.error("Final request failed:", err);
    toast.error("Request submission failed");
  }
};



const handleUndoChange = (idx) => {
  setAllChanges((prev) => {
    const change = prev[idx];

    if (change) {
      setPolicies((data) => {
        let newData = [...data];

        if (change.action === "edit") {
          const targetIndex = newData.findIndex((d) => d.year === change.changes.year.new);
          if (targetIndex !== -1) {
            newData[targetIndex] = {
              ...newData[targetIndex],
              year: change.changes.year.old,
              pdf_path: change.changes.pdf_path.old,
            };
          }
        }

        if (change.action === "add") {
          // Remove the newly added item
          newData = newData.filter((d) => d.year !== change.key);
        }

        if (change.action === "delete") {
          // Re-insert the deleted item
          newData = [...newData, change.changes.deleted];
        }

        return newData;
      });
    }

    return prev.filter((_, i) => i !== idx); // remove from log
  });

  toast.info("Change reverted");
};


  // Preview the selected (newPdf) file or existing path in popup
  const handleViewNewPdf = () => {
    if (!newPdf) return;
    if (newPdf instanceof File) {
      const url = URL.createObjectURL(newPdf);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } else {
      window.open(UrlParser(newPdf), "_blank", "noopener,noreferrer");
    }
  };

  const handlePdfClick = (policy) => {
    if (!policy?.pdf_path) return;
    window.open(UrlParser(policy.pdf_path), "_blank", "noopener,noreferrer");
  };


  const isAnySelected = selectedToDelete.size > 0;

  // -------------------- Render --------------------
  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/researchbanner.webp"
        headerText="Academic Research"
        subHeaderText="Enrich Your Knowledge"
      />

      <div className="mt-10">
        {!isEditing && (
          <button
            className="flex items-center bg-secd px-3 py-2 z-40 rounded text-text ml-auto mr-20 my-4"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        )}

        <h1 className="research-academicresearch-title text-4xl text-brwn dark:text-drkt dark:border-drks">
          Policies
        </h1>

        {/* VIEW MODE */}
        {!isEditing && (
          <div className="course-selection-container p-12">
            {policies.map((policy, i) => (
              <div
                key={i}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(policy)}
               
              >
                {policy.name}
              </div>
            ))}
          </div>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <div className="course-selection-container p-12">
            {policies.map((policy, index) => (
              <div className="flex items-center gap-2 px-2 py-2" key={index}>
                <div
                  className="relative px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                  onClick={() => handleEditButton(index)}   
                >
                  
                  {policy.name}
                  <input
                    type="checkbox"
                    checked={selectedToDelete.has(index)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelectToDelete(index)}
                    className="absolute top-2 right-2"
                    
                  />
                </div>
              </div>
            ))}

            <button className="px-4 h-14 mt-2 py-2 bg-secd hover:bg-brwn text-text hover:text-prim rounded-xl flex flex-row items-center" onClick={handleAddNewButton}>
             <Plus/> Add new
            </button>

          </div>
        )}
        {selectedToDelete.size > 0 && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded flex items-center"
              onClick={openDeleteConfirmMultiple}
            >
              <Trash2 className="mr-2" size={16} /> Delete Selected
            </button>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex flex-row justify-end gap-4 mr-12 mb-8">
          {isEditing && (
            <>
              <button className="bg-gray-500 px-3 py-2 rounded text-prim" onClick={handleCancelSession}>
                Cancel
              </button>
              {sessionChanges.length > 0 && (
                <button className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded-lg" onClick={handleSaveSession}>
                  Save
                </button>
              )}
            </>
          )}

          {!isEditing && isSavedOnce && (
            <>
              <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>
                Discard All
              </button>
              <button className="bg-secd text-text px-3 py-2 flex flex-row rounded hover:bg-brwn hover:text-prim" onClick={handleRequest}>
                <Send className="mr-2" /> Request
              </button>
            </>
          )}
        </div>

        {/* Add/Edit Popup */}
        {showPopup  && selectedToDelete.size === 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {editIndex !== null ? "Edit Policy" : "Add New Policy"}
              </h2>

              <input
                type="text"
                placeholder="Enter Policy Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />

              <div className="flex flex-row gap-4 items-center justify-evenly">
                <div className="my-2 flex flex-row justify-center">
                  <input
                    id="policy-pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setNewPdf(file);
                    }}
                  />
                  <label
                    htmlFor="policy-pdf-upload"
                    className="cursor-pointer bg-secd hover:bg-brwn px-2 py-2 text-text hover:text-prim rounded inline-block"
                  >
                    {newPdf ? "Replace File" : "Upload File"}
                  </label>
                </div>

                {/* Show eye for both existing path string or picked file */}
                {newPdf && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    <Eye size={28} className="cursor-pointer text-gray-500" onClick={handleViewNewPdf} />
                  </p>
                )}
              </div>

              <div className="flex flex-row gap-2 justify-end ml-auto mt-4">
                <button className="bg-gray-400 hover:bg-gray-500 text-prim px-2 py-2 rounded" onClick={handleCancelPopup}>
                  Cancel
                </button>
                <button className="bg-secd hover:bg-brwn text-text hover:text-prim px-2 py-2 rounded" onClick={handleSavePopup}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]">
            <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-sm mb-4">Are you sure you want to delete?</p>
              <div className="flex justify-center gap-4">
                <button className="px-4 py-2 rounded bg-gray-400 text-white" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REQUEST MODAL */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
            <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>
              <p className="text-sm text-red-500 mb-4 text-center">
                Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
              </p>

              <div className="max-h-[320px] overflow-y-auto mb-4">
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border">Action</th>
                      <th className="py-2 px-3 border">Section</th>
                      <th className="py-2 px-3 border">Changes</th>
                      <th className="py-2 px-3 border">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allChanges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          No changes to submit
                        </td>
                      </tr>
                    ) : (
                      allChanges.map((change, idx) => (
                        <tr key={idx} className="even:bg-white odd:bg-gray-50">
                          <td className="py-2 px-3 border text-center">
                            {change.action === "edit" ? <span className="text-blue-600">✎ Edited</span> : change.action === "add" ? <span className="text-green-600">+ Added</span> : <span className="text-red-600">🗑 Deleted</span>}
                          </td>
                          <td className="py-2 px-3 border text-center">{change.section}</td>
                          <td className="py-2 px-3 border text-[13px] text-center">
                            {change.action === "delete" ? (
                              <div>Item deleted</div>
                            ) : (
                              <div>{Object.keys(change.changes || {}).filter((f) => change.changes[f].old !== change.changes[f].new).map((field) => field).join(", ")}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 border text-center">
                            <button className="text-red-500" onClick={() => handleUndoChange(idx)}>
                              <X />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
                  Cancel
                </button>
                <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-secd text-black hover:bg-brwn hover:text-prim">
                  Final Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={1000} />
    </>
  );
}
