import { useEffect, useRef, useState } from "react";
import "./Academicresearch.css";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaUserEdit } from "react-icons/fa";
import { Send, Trash2, Eye, Pencil, X, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function AdminConsultancy({ theme, toggle }) {
  const [acadamicRes, setAcadamicRes] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  // ---- Editing and session state (adapted from BookChapter) ----
  const [isEditing, setIsEditing] = useState(false); // same as isEditing in reference
  const [isSavedOnce, setIsSavedOnce] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newPdf, setNewPdf] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const [selectedToDelete, setSelectedToDelete] = useState(new Set());

  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);

  const originalRef = useRef([]);
  const savedDataRef = useRef([]);
  const { sendRequest, loading: loadings , error } = useAdminRequest();

  // Admin quick toggles (kept for compatibility with existing behavior)
  const [isContentEditable, setIsContentEditable] = useState(true);
  const [isDoneClicked, setIsDoneClicked] = useState(false);

  // -------------------- Fetch --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Consultancy",
        });
        const data = response.data?.data || [];
        setAcadamicRes(data);
        originalRef.current = JSON.parse(JSON.stringify(data));
        savedDataRef.current = JSON.parse(JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching Consultancy data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
      }
    };

    fetchData();
  }, [navigate]);

  // -------------------- Helpers (same patterns as reference) --------------------
  const pushSessionChange = (changeObj) =>
    setSessionChanges((prev) => [...prev, changeObj]);

  const handleAddNewButton = () => {
    setEditIndex(null);
    setNewYear("");
    setNewPdf(null);
    setShowPopup(true);
  };

  const handleEditButton = (index) => {
    const entry = acadamicRes[index];
    setEditIndex(index);
    setNewYear(entry?.year ?? "");
    setNewPdf(entry?.pdf_path ?? null);
    setShowPopup(true);
  };

  const handleSavePopup = () => {
    if (!newYear || !newPdf) {
      toast.error("Year and PDF required");
      return;
    }
    const pdfValue = newPdf instanceof File ? newPdf.name : newPdf;

    if (editIndex !== null) {
      const oldEntry = acadamicRes[editIndex];
      setAcadamicRes((prev) =>
        prev.map((it, i) => (i === editIndex ? { year: newYear, pdf_path: pdfValue } : it))
      );

      pushSessionChange({
        action: "edit",
        section: "Consultancy",
        key: oldEntry?.year ?? newYear,
        changes: {
          year: { old: oldEntry?.year ?? null, new: newYear },
          pdf_path: { old: oldEntry?.pdf_path ?? null, new: pdfValue },
        },
      });

      toast.success("Entry updated (session)");
    } else {
      const newEntry = { year: newYear, pdf_path: pdfValue };
      setAcadamicRes((prev) => [...(prev || []), newEntry]);

      pushSessionChange({
        action: "add",
        section: "Consultancy",
        key: newYear,
        changes: {
          year: { old: null, new: newYear },
          pdf_path: { old: null, new: pdfValue },
        },
      });

      toast.success("Entry added (session)");
    }

    setNewYear("");
    setNewPdf(null);
    setEditIndex(null);
    setShowPopup(false);
  };

  const handleCancelPopup = () => {
    setNewYear("");
    setNewPdf(null);
    setEditIndex(null);
    setShowPopup(false);
  };

  const toggleSelectToDelete = (index) => {
    const nxt = new Set(selectedToDelete);
    nxt.has(index) ? nxt.delete(index) : nxt.add(index);
    setSelectedToDelete(nxt);
  };

  // const openDeleteConfirmSingle = (index) => {
  //   setDeleteMode("single");
  //   setDeleteTargetIndex(index);
  //   setDeleteConfirmOpen(true);
  // };

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
    let newData = [...acadamicRes];
    let newSession = [...sessionChanges];

    if (deleteMode === "single") {
      const idx = deleteTargetIndex;
      if (idx == null) return;
      newSession.push({
        action: "delete",
        section: "Consultancy",
        key: newData[idx]?.year,
        changes: { deleted: newData[idx] },
      });
      newData.splice(idx, 1);
    }

    if (deleteMode === "multiple") {
      const toDelete = Array.from(selectedToDelete).sort((a, b) => b - a);
      for (const idx of toDelete) {
        newSession.push({
          action: "delete",
          section: "Consultancy",
          key: newData[idx]?.year,
          changes: { deleted: newData[idx] },
        });
        newData.splice(idx, 1);
      }
    }

    setAcadamicRes(newData);
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

  const handleSaveSession = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    savedDataRef.current = JSON.parse(JSON.stringify(acadamicRes));
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
    setIsContentEditable(true);
    setIsDoneClicked(false);
    toast.success("Session saved. You can Request now.");
  };

  const handleCancelSession = () => {
    setAcadamicRes(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    setIsContentEditable(true);
    toast.info("Session changes discarded.");
  };

  const handleDiscardAll = () => {
    setAcadamicRes(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    setIsContentEditable(true);
    setIsDoneClicked(false);
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
      const { year, pdf_path } = change.changes;

      const finalPath = `/static/pdfs/overall_research/${year.new}/${pdf_path.new}`;

      payload.push({
        action: "insert",
        collectionName: "research",
        title: "consultancy",
        collection_type: "Consultancy",
        meta_data: {
          year: year.new,
          pdf_path: finalPath
        }
      });

      if (pdf_path.new instanceof File) {
        filesToUpload.push(pdf_path.new);
      }
    }

    // ---------- UPDATE ----------
    if (change.action === "edit") {
      const { year, pdf_path } = change.changes;

      const finalPath = `/static/pdfs/overall_research/${year.new}/${pdf_path.new}`;

      payload.push({
        action: "update",
        collectionName: "research",
        title: "consultancy",
        collection_type: "Consultancy",
        original_data: {
          year: year.old,
          pdf_path: pdf_path.old
        },
        meta_data: {
          year: year.new,
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
        title: "consultancy",
        collection_type: "Consultancy",
        meta_data: {
          year: change.key
        }
      });
    }
  }

  try {
    const result = await sendRequest(payload, filesToUpload);

    if (result) {
      console.log("FINAL REQUEST SUBMITTED", { payload, acadamicRes });

      toast.success("Final request submitted");

      setShowRequestModal(false);
      setAllChanges([]);
      setSessionChanges([]);
      setIsEditing(false);
      setIsSavedOnce(false);

      originalRef.current = JSON.parse(JSON.stringify(acadamicRes));
      savedDataRef.current = JSON.parse(JSON.stringify(acadamicRes));

      setIsContentEditable(true);
      setIsDoneClicked(false);
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
      setAcadamicRes((data) => {
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

  const handlePdfClick = (course) => {
    if (!course?.pdf_path) return;
    if (typeof course.pdf_path === "string" && course.pdf_path.trim() === "") return;
    window.open(UrlParser(course.pdf_path), "_blank", "noopener,noreferrer");
  };

  // quick admin handlers that existed in the original consultancy file — keep behavior but integrated
  const handleDone = () => {
    setIsDoneClicked(true);
    setIsContentEditable(true); // ensure content mode consistent
  };

  const handleBackToEdit = () => {
    setIsDoneClicked(false);
    setIsContentEditable(false);
  };

  const handleRequestSent = () => {
    // emulate sending request (we keep the same behavior as BookChapter finalization)
    setIsContentEditable(true);
    setIsDoneClicked(false);
    toast.success("Request sent (session)"); // small feedback
  };

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
        {/* Top Edit Button */}
        {!isEditing && isContentEditable && (
          <button
            className="flex items-center  bg-secd px-3 py-2 z-40 rounded text-text  ml-auto mr-20 my-4"
            onClick={() => {
              setIsEditing(true);
              setIsContentEditable(false);
              setIsDoneClicked(false);
            }}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        )}

        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Consultancy
        </h1>

        {/* VIEW MODE (not editing) */}
        {/* {!isEditing && (
          <div className="course-selection-container p-12">
            {acadamicRes?.map((course, index) => (
              <div
                key={index}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(course)}
              >
                {course.year}
              </div>
            ))}
          </div>
        )} */}

        {/* EDIT MODE */}
        {isEditing && (
          <div className="course-selection-container p-12">
            {acadamicRes?.map((course, index) => (
              <div className="flex items-center gap-2 px-2 py-2" key={index}>
                <div
                  className="relative px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                  onClick={() => handleEditButton(index)}
                >
                  {course.year}
                  <input
                    type="checkbox"
                    checked={selectedToDelete.has(index)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelectToDelete(index)}
                    className="absolute top-2 right-2"
                  />
                </div>
                {/* <Trash2
                  size={18}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirmSingle(index);
                  }}
                /> */}
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
              <button
                className="bg-gray-500 px-3 py-2 rounded text-prim"
                onClick={handleCancelSession}
              >
                Cancel
              </button>
              {sessionChanges.length > 0 && (
                <button
                  className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded-lg"
                  onClick={handleSaveSession}
                >
                  Save
                </button>
              )}
            </>
          )}

         
        </div>

        {/* Old quick-mode UI preserved for compatibility with earlier file behavior */}
        {!isEditing && !isDoneClicked && (
          <div className="course-selection-container p-12">
            {acadamicRes?.map((course, index) => (
              <div
                key={index}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(course)}
              >
                {course.year}
              </div>
            ))}
          </div>
        )}

        {/* Done / Back / Request quick actions when user used older pattern */}
        {/* {!isEditing && !isDoneClicked && (
          <button
            className="flex items-center ml-auto mr-20 mb-10 border-4 border-secd hover:bg-gray-300 hover:border-brwn text-text px-3 py-2 rounded-lg"
            onClick={() => handleDone()}
          >
            <FaUserEdit className="mr-2" /> Done
          </button>
        )} */}

        {!isEditing && isDoneClicked && (
          <div className="flex gap-4 justify-end pr-8 my-8 mr-10">
            <button
              className="flex items-center bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded "
              onClick={() => handleBackToEdit()}
            >
              <FaUserEdit className="mr-2" /> Back to edit
            </button>
            <button
              className="flex items-center bg-green-500 text-text hover:text-prim hover:bg-green-600 px-3 py-2 rounded"
              onClick={() => handleRequestSent()}
            >
              <Send className="mr-2" />
              Request
            </button>
          </div>
        )}

         {!isEditing && isSavedOnce && (
            <div className="flex flex-row justify-end mr-12 mb-4 gap-4">
              <button
                className="bg-red-500 px-3 py-2 rounded text-prim"
                onClick={handleDiscardAll}
              >
                Discard All
              </button>
              <button
                className="bg-secd text-text px-3 py-2 flex flex-row rounded hover:bg-brwn hover:text-prim"
                onClick={handleRequest}
              >
                <Send className="mr-2" /> Request
              </button>
            </div>
          )}

        {/* Add/Edit Popup (matches reference styling & behavior) */}
        {showPopup && selectedToDelete.size === 0 &&  (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {editIndex !== null ? "Edit Consultancy" : "Add New Consultancy"}
              </h2>

              <input
                type="text"
                maxLength={9}
                placeholder="Enter Year (e.g., 2024-2027)"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />

              <div className="flex flex-row gap-4 items-center justify-evenly">
                <div className="my-2 flex flex-row justify-center">
                  <input
                    id="consultancy-pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setNewPdf(file);
                    }}
                  />
                  <label
                    htmlFor="consultancy-pdf-upload"
                    className="cursor-pointer bg-secd hover:bg-brwn px-2 py-2 text-text hover:text-prim rounded inline-block"
                  >
                    {newPdf ? "Replace File" : "Upload File"} 
                  </label>
                </div>

                {/* <input
                  type="text"
                  placeholder="Or enter PDF path"
                  value={typeof newPdf === "string" ? newPdf : ""}
                  onChange={(e) => setNewPdf(e.target.value)}
                  className="w-1/2 mb-3 p-2 border rounded"
                /> */}

                {newPdf && (
                  <Eye
                    size={28}
                    className="cursor-pointer text-gray-500"
                    onClick={handleViewNewPdf}
                  />
                )}
              </div>

              <div className="flex flex-row gap-2 justify-end ml-auto mt-4">
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-prim px-2 py-2 rounded"
                  onClick={handleCancelPopup}
                >
                  Cancel
                </button>
                <button
                  className="bg-secd hover:bg-brwn text-text hover:text-prim px-2 py-2 rounded"
                  onClick={handleSavePopup}
                >
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
                <button
                  className="px-4 py-2 rounded bg-gray-400 text-white"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={confirmDelete}
                >
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
                        <td colSpan={4} className="text-center py-4">
                          No changes to submit
                        </td>
                      </tr>
                    ) : (
                      allChanges.map((change, idx) => (
                        <tr key={idx} className="even:bg-white odd:bg-gray-50">
                          <td className="py-2 px-3 border text-center">
                            {change.action === "edit" ? (
                              <span className="text-blue-600">✎ Edited</span>
                            ) : change.action === "add" ? (
                              <span className="text-green-600">+ Added</span>
                            ) : (
                              <span className="text-red-600">🗑 Deleted</span>
                            )}
                          </td>
                          <td className="py-2 px-3 border text-center">{change.section}</td>
                          <td className="py-2 px-3 border text-[13px] text-center">
                            {change.action === "delete" ? (
                              <div>Item deleted</div>
                            ) : (
                              <div>
                                {Object.keys(change.changes || {})
                                  .filter((f) => change.changes[f].old !== change.changes[f].new)
                                  .map((field) => field)
                                  .join(", ")}
                              </div>
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
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-prim"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalRequestConfirm}
                  className="px-4 py-2 rounded bg-secd text-black hover:bg-brwn hover:text-prim"
                >
                  Final Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2200} />
    </>
  );
}
