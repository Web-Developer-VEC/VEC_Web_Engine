import { useEffect, useRef, useState } from "react";
import "./Academicresearch.css";
import "./Funded.css";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaUserEdit } from "react-icons/fa";
import { Eye, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function AdminFunded({ theme, toggle }) {
  const [funded, setFunded] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    if (!path) return "";

    if (path instanceof File) {
      return URL.createObjectURL(path);
    }

    if (typeof path === "string") {
      return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    }

    return "";
  };

  // Admin / editing state (mimic AdminJournal workflow)
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newPdf, setNewPdf] = useState(null); // File or string
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
  const { sendRequest, loading: loadings, error } = useAdminRequest();

  // -------------------- Fetch --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/research", {
          type: "Funded Projects",
        });
        const data = response.data?.data || [];
        setFunded(data);
        originalRef.current = structuredClone(data);
        savedDataRef.current = structuredClone(data);
      } catch (error) {
        console.error("Error fetching Funded data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
      }
    };
    fetchData();
  }, [navigate]);

  // -------------------- Helpers --------------------
  const handleAddNewButton = () => {
    setEditIndex(null);
    setNewYear("");
    setNewPdf(null);
    setShowPopup(true);
  };

  const handleEditButton = (index) => {
    const entry = funded[index];
    setEditIndex(index);
    setNewYear(entry?.year ?? "");
    setNewPdf(entry?.pdf_path ?? null);
    setShowPopup(true);
  };

  const pushSessionChange = (changeObj) => {
    setSessionChanges((prev) => {
      const existingIndex = prev.findIndex(
        (c) =>
          c.action === "edit" &&
          c.section === changeObj.section &&
          c.key === changeObj.key
      );

      if (existingIndex !== -1) {
        const updated = [...prev];

        updated[existingIndex] = {
          ...updated[existingIndex],
          changes: {
            ...updated[existingIndex].changes,
            ...changeObj.changes
          }
        };

        return updated;
      }

      return [...prev, changeObj];
    });
  };

  const handleSavePopup = () => {
    if (!newYear || !newPdf) {
      toast.error("Year and PDF required");
      return;
    }
    const pdfValue = newPdf;

    if (editIndex !== null) {
      const oldEntry = funded[editIndex];
      setFunded((prev) =>
        prev.map((it, i) => (i === editIndex ? { year: newYear, pdf_path: pdfValue } : it))
      );

      pushSessionChange({
        action: "edit",
        section: "Funded Projects",
        key: oldEntry?.year ?? newYear,
        changes: {
          year: { old: oldEntry?.year ?? null, new: newYear },
          pdf_path: { old: oldEntry?.pdf_path ?? null, new: pdfValue },
        },
      });

      toast.success("Entry updated (session)");
    } else {
      const newEntry = { year: newYear, pdf_path: pdfValue };
      setFunded((prev) => [...(prev || []), newEntry]);

      pushSessionChange({
        action: "add",
        section: "Funded Projects",
        key: newYear,
        changes: {
          year: { old: null, new: newYear },
          pdf_path: { old: null, new: pdfValue },
        },
      });

      //toast.success("Entry added (session)");
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
    let newFunded = [...funded];
    let newSession = [...sessionChanges];

    const processDelete = (idx) => {
      const item = newFunded[idx];

      const addIndex = newSession.findIndex(
        (c) => c.action === "add" && c.key === item?.year
      );

      if (addIndex !== -1) {
        newSession.splice(addIndex, 1);
      } else {
        newSession.push({
          action: "delete",
          section: "Funded Projects",
          key: item?.year,
          changes: { deleted: item },
        });
      }

      newFunded.splice(idx, 1);
    };

    if (deleteMode === "single") {
      processDelete(deleteTargetIndex);
    }

    if (deleteMode === "multiple") {
      const toDelete = Array.from(selectedToDelete).sort((a, b) => b - a);
      for (const idx of toDelete) {
        processDelete(idx);
      }
    }

    setFunded(newFunded);
    setSessionChanges(newSession);
    setSelectedToDelete(new Set());
    setDeleteConfirmOpen(false);
    setDeleteMode(null);
    setDeleteTargetIndex(null);
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

    setAllChanges((prev) => {
      let updated = [...prev];

      for (const change of sessionChanges) {
        const existingIndex = updated.findIndex(
          (c) => c.key === change.key && c.section === change.section
        );

        if (
          existingIndex !== -1 &&
          updated[existingIndex].action === "add" &&
          change.action === "delete"
        ) {
          updated.splice(existingIndex, 1);
          continue;
        }

        if (
          existingIndex !== -1 &&
          updated[existingIndex].action === "delete" &&
          change.action === "add"
        ) {
          updated[existingIndex] = {
            action: "edit",
            section: change.section,
            key: change.key,
            changes: change.changes
          };
          continue;
        }

        if (
          existingIndex !== -1 &&
          updated[existingIndex].action === "edit" &&
          change.action === "edit"
        ) {
          updated[existingIndex].changes = {
            ...updated[existingIndex].changes,
            ...change.changes
          };
          continue;
        }

        updated.push(change);
      }

      return updated;
    });

    savedDataRef.current = structuredClone(funded);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
  };

  const handleCancelSession = () => {
    setFunded(structuredClone(savedDataRef.current));
    setSessionChanges([]);
    setIsEditing(false);
    setSelectedToDelete(new Set());
  };

  const handleDiscardAll = () => {
    setFunded(structuredClone(originalRef.current));
    savedDataRef.current = structuredClone(originalRef.current);

    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
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

        const fileName =
          pdf_path.new instanceof File ? pdf_path.new.name : pdf_path.new;

        const finalPath = `/static/pdfs/overall_research/${year.new}/${fileName}`;

        payload.push({
          action: "insert",
          collectionName: "research",
          title: "Funded Projects",
          collection_type: "Funded Projects",
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

        const fileName =
          pdf_path.new instanceof File ? pdf_path.new.name : pdf_path.new;

        const finalPath = `/static/pdfs/overall_research/${year.new}/${fileName}`;

        payload.push({
          action: "update",
          collectionName: "research",
          title: "Funded Projects",
          collection_type: "Funded Projects",
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
          title: "Funded Projects",
          collection_type: "Funded Projects",
          meta_data: {
            year: change.key
          }
        });
      }
    }

    try {
      const result = await sendRequest(payload, filesToUpload);

      if (result) {
        console.log("FINAL REQUEST SUBMITTED", { payload, funded });

        //toast.success("Final request submitted");

        setShowRequestModal(false);
        setAllChanges([]);
        setSessionChanges([]);
        setIsEditing(false);
        setIsSavedOnce(false);

        originalRef.current = structuredClone(funded);
        savedDataRef.current = structuredClone(funded);
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
        setFunded((data) => {
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
    window.open(UrlParser(course.pdf_path), "_blank", "noopener,noreferrer");
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
        {!isEditing && (
          <button
            className="flex items-center bg-secd px-3 py-2 z-40 rounded text-text ml-auto mr-20 my-4"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        )}

        <h1 className="research-academicresearch-title text-brwn dark:text-drkt dark:border-drks">
          Funded Projects
        </h1>

        {/* VIEW MODE */}
        {!isEditing && (
          <div className="course-selection-container p-12">
            {funded.map((course, i) => (
              <div
                key={i}
                className="px-4 py-3 font-semibold text-center rounded-xl bg-secd hover:bg-accn hover:text-prim dark:hover:bg-brwn cursor-pointer"
                onClick={() => handlePdfClick(course)}
              >
                {course.year}
              </div>
            ))}
          </div>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <div className="course-selection-container p-12">
            {funded.map((course, index) => (
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

              </div>
            ))}

            <button
              className="px-4 h-14 mt-2 py-2 bg-secd hover:bg-brwn text-text hover:text-prim rounded-xl flex flex-row items-center"
              onClick={handleAddNewButton}
            >
              <Plus /> Add new
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

          {!isEditing && isSavedOnce && (
            <>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-prim px-2 py-2 rounded"
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
            </>
          )}
        </div>

        {/* Add/Edit Popup */}
        {showPopup && selectedToDelete.size === 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {editIndex !== null ? "Edit Funded Project" : "Add New Funded Project"}
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
                    id="funded-pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setNewPdf(file);
                    }}
                  />
                  <label
                    htmlFor="funded-pdf-upload"
                    className="cursor-pointer bg-secd hover:bg-brwn px-2 py-2 text-text hover:text-prim rounded inline-block"
                  >
                    {newPdf ? "Replace File" : "Upload File"}
                  </label>
                </div>

                {/* Also allow manual path input when not uploading file
                <input
                  type="text"
                  placeholder="Or enter PDF path"
                  value={typeof newPdf === "string" ? newPdf : ""}
                  onChange={(e) => setNewPdf(e.target.value)}
                  className="w-1/2 mb-3 p-2 border rounded"
                /> */}

                {newPdf && (
                  <p className="text-xs text-center mt-1">
                    <Eye
                      size={28}
                      className="cursor-pointer text-gray-500"
                      onClick={handleViewNewPdf}
                    />
                  </p>
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
                            <div>

                              {/* DELETE */}
                              {change.action === "delete" && (
                                <span>
                                  {change.changes?.deleted?.year}
                                </span>
                              )}

                              {/* EDIT */}
                              {change.action === "edit" && (() => {
                                const changes = change.changes || {};
                                const yearChanged = changes.year?.old !== changes.year?.new;
                                const pdfChanged = changes.pdf_path?.old !== changes.pdf_path?.new;

                                if (pdfChanged && !yearChanged) {
                                  return <div>{changes.year.old} - PDF updated</div>;
                                }

                                if (yearChanged && !pdfChanged) {
                                  return <div>{changes.year.old} → {changes.year.new}</div>;
                                }

                                if (yearChanged && pdfChanged) {
                                  return (
                                    <>
                                      <div>{changes.year.old} → {changes.year.new}</div>
                                      <div>PDF updated</div>
                                    </>
                                  );
                                }

                                return null;
                              })()}

                              {/* ADD */}
                              {change.action === "add" && (
                                <span>
                                  {change.changes?.year?.new}
                                  {change.changes?.pdf_path?.new && (
                                    ` (${change.changes.pdf_path.new instanceof File
                                      ? change.changes.pdf_path.new.name
                                      : change.changes.pdf_path.new
                                    })`
                                  )}
                                </span>
                              )}

                            </div>
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
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    btn.innerText = "Loading...";

                    handleFinalRequestConfirm();
                  }}
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
