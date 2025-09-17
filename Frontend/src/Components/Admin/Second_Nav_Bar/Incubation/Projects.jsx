import React, { useEffect, useRef, useState } from "react";
import LoadComp from "../../LoadComp";
import { FaUserEdit } from "react-icons/fa";
import { Plus, Send, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/* --- count-up hook (unchanged) --- */
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

/* --- StatCard (unchanged) --- */
export function StatCard({
  number,
  label,
  color,
  isEditing,
  onDelete,
  onChange,
}) {
  const count = useCountUp(number);

  return (
    <>
      {isEditing ? (
        <div
          className={`${color} text-white  relative rounded shadow-lg w-52 h-32 flex flex-col justify-center items-center gap-2`}
        >
          <input
            type="number"
            value={number}
            placeholder="Enter the stat"
            onChange={(e) =>
              onChange("number", parseInt(e.target.value) || 0)
            }
            className="w-40 text-center text-text "
          />
          <input
            type="text"
            value={label}
            onChange={(e) => onChange("label", e.target.value)}
            className="w-40 text-center text-text "
          />
          <button
            className="p-1 text-12 absolute top-0 right-0 text-prim bg-red-500 rounded-full"
            onClick={onDelete}
          >
            <Trash2 />
          </button>
        </div>
      ) : (
        <div
          className={`${color} text-white rounded relative shadow-lg w-52 h-32 flex flex-col justify-center items-center`}
        >
          <div className="text-4xl font-bold">{count}</div>
          <div className="text-sm">{label}</div>
        </div>
      )}
    </>
  );
}

const colors = ["bg-blue-700", "bg-green-600", "bg-green-700", "bg-purple-600"];

/* --- Main component --- */
export default function Projects({ data }) {
  // projects will include an internal stable key: __key
  const [projects, setProjects] = useState([]);
  const [deletedProjects, setDeletedProjects] = useState([]);
  const [mode, setMode] = useState("view"); // "view" | "editing" | "postSave"
  const originalRef = useRef([]); // initial snapshot (with __key)
  const savedRef = useRef([]); // last-saved snapshot (with __key)
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [finalPopupOpen, setFinalPopupOpen] = useState(false);

  // helper: deep clone
  const deepClone = (v) => JSON.parse(JSON.stringify(v));

  // add stable internal __key to every project (preserve if already present)
  const attachKeys = (list = []) =>
    list.map((p) => ({
      ...p,
      __key: p.__key || p.id || uuidv4(),
      isNew: p.isNew || false,
        s: Array.isArray(p.content) ? p.content : [],
    }));

  // on initial load / data change: attach keys and store snapshots
  useEffect(() => {
    const withKeys = attachKeys(data || []);
    setProjects(deepClone(withKeys));
    originalRef.current = deepClone(withKeys);
    savedRef.current = deepClone(withKeys);
    setDeletedProjects([]);
    setSelectedRows(new Set());
    setMode("view");
  }, [data]);

  // update unsavedChanges indicator
  useEffect(() => {
    // compare real content ignoring internal keys: build serializable stripped versions
    const stripMeta = (arr) =>
      (arr || []).map((p) => ({
        category: p.category,
        content: (p.content || []).map((s) => ({ label: s.label, number: s.number })),
      }));

    const savedStr = JSON.stringify(stripMeta(savedRef.current));
    const curStr = JSON.stringify(stripMeta(projects));
    setUnsavedChanges(savedStr !== curStr || deletedProjects.length > 0);
  }, [projects, deletedProjects]);

  /* ------------------- CRUD handlers ------------------- */

  const handleEdit = () => setMode("editing");

  const handleCancel = () => {
    setProjects(deepClone(savedRef.current));
    setDeletedProjects([]);
    setUnsavedChanges(false);
    const hasSavedChanges =
      JSON.stringify(savedRef.current) !== JSON.stringify(originalRef.current);
    setMode(hasSavedChanges ? "postSave" : "view");
  };

  const handleSave = () => {
    // preserve __key; reorder if needed (keep new first)
    const reordered = [...projects];
    const newProjects = reordered.filter((p) => p.isNew);
    const existingProjects = reordered.filter((p) => !p.isNew);
    const combined = [...newProjects, ...existingProjects];
    setProjects(combined);
    setUnsavedChanges(false);
    setMode("postSave");
  };

  const handleRequest = () => setFinalPopupOpen(true);

  const handleDiscardAll = () => {
    setProjects(deepClone(originalRef.current));
    savedRef.current = deepClone(originalRef.current);
    setDeletedProjects([]);
    setUnsavedChanges(false);
    setMode("view");
  };

  const handleCheckboxToggle = (i) => {
    const newSet = new Set(selectedRows);
    newSet.has(i) ? newSet.delete(i) : newSet.add(i);
    setSelectedRows(newSet);
  };

  const handleStatChange = (sectionIndex, statIndex, field, value) => {
    const updated = deepClone(projects);
    updated[sectionIndex].content[statIndex][field] = value;
    setProjects(updated);
    setUnsavedChanges(true);
  };

  const handleStatDelete = (sectionIndex, statIndex) => {
    const updated = deepClone(projects);
    updated[sectionIndex].content.splice(statIndex, 1);
    setProjects(updated);
    setUnsavedChanges(true);
  };

  const handleAddNew = () => {
    const newProject = {
      __key: uuidv4(),
      category: "",
      isNew: true,
      content: [
        { number: null , label: "Recieved Ideas " },
        { number: null, label: "Forwarded Ideas " },
        { number: null, label: "Approved Ideas " },
      ],
    };
    setProjects([...projects, newProject]);
    setUnsavedChanges(true);
  };

  const handleDeleteSelected = () => {
    const toDelete = projects.filter((_, idx) => selectedRows.has(idx));
    // mark deletedProjects (keep their __key & data)
    setDeletedProjects([...deletedProjects, ...toDelete]);
    const updated = projects.filter((_, idx) => !selectedRows.has(idx));
    setProjects(updated);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    setUnsavedChanges(true);
  };

  const handleFinalSubmit = () => {
    // finalize: clear isNew flags and update savedRef + originalRef
    const finalized = projects.map((p) => ({ ...p, isNew: false }));
    savedRef.current = deepClone(finalized);
    originalRef.current = deepClone(finalized);
    setProjects(finalized);
    setDeletedProjects([]);
    setFinalPopupOpen(false);
    setMode("view");
    setUnsavedChanges(false);
    setSelectedRows(new Set());
  };

  /* --------------- Change detection (robust) --------------- */

  // returns "Added" | "Edited" | null
  const getChangeAction = (proj) => {
    if (proj.isNew) return "Added";

    const savedProj = savedRef.current.find((p) => p.__key === proj.__key);
    if (!savedProj) {
      // if saved snapshot doesn't have it, treat as Added (safe fallback)
      return "Added";
    }

    if (proj.category !== savedProj.category) return "Edited";

    // compare content length and values (index-wise)
    const maxLen = Math.max((proj.content || []).length, (savedProj.content || []).length);
    for (let j = 0; j < maxLen; j++) {
      const s = proj.content?.[j] || {};
      const ss = savedProj.content?.[j] || {};
      if (s.label !== ss.label || Number(s.number) !== Number(ss.number)) {
        return "Edited";
      }
    }
    return null;
  };

  const getChangeDetails = (proj) => {
    const details = [];
    const savedProj = savedRef.current.find((p) => p.__key === proj.__key) || {};

    if (proj.category !== savedProj.category) {
      details.push(`Title: ${proj.category}`);
    }

    const maxLen = Math.max((proj.content || []).length, (savedProj.content || []).length);
    for (let j = 0; j < maxLen; j++) {
      const s = proj.content?.[j];
      const ss = savedProj.content?.[j];
      if (!ss && s) {
        details.push(`Stat ${j + 1}: added "${s.label}", ${s.number}`);
      } else if (ss && !s) {
        details.push(`Stat ${j + 1}: "${ss.label}", ${ss.number} → deleted`);
      } else if (s && ss && (s.label !== ss.label || Number(s.number) !== Number(ss.number))) {
        details.push(
          `Stat ${j + 1}: "${ss.label || ""}" → "${s.label}", ${ss.number || 0} → ${s.number}`
        );
      }
    }
    return details;
  };

  const getChangedProjects = () => {
    const changes = [];

    // 1) Added / Edited (skip projects that were explicitly deleted in this edit session)
    projects.forEach((proj) => {
      if (deletedProjects.some((d) => d.__key === proj.__key)) return; // skip if user deleted this from projects -> moved to deletedProjects

      const action = getChangeAction(proj);
      if (action) {
        if (action === "Added") {
          changes.push({
            ...proj,
            action,
            changes: ["New project added"],
          });
        } else if (action === "Edited") {
          const details = getChangeDetails(proj);
          if (details.length > 0) {
            changes.push({
              ...proj,
              action,
              changes: details,
            });
          }
        }
      }
    });

    // 2) Deleted -> only projects in deletedProjects (these are items user removed during this edit session)
    //    But only include deletions that existed in savedRef (i.e., actually deleted saved content).
    deletedProjects.forEach((proj) => {
      const existedInSaved = savedRef.current.some((s) => s.__key === proj.__key);
      // If it existed in saved state, show Deleted. If it was a brand new (never saved) project, you may skip or show "Removed (unsaved)".
      if (existedInSaved) {
        changes.push({
          ...proj,
          action: "Deleted",
          changes: ["Project deleted"],
        });
      } else {
        // optional: include removal of unsaved new project (so admin knows it was added then removed)
        changes.push({
          ...proj,
          action: "Removed",
          changes: ["New project removed (not saved)"],
        });
      }
    });

    return changes;
  };

  /* --------------------- Render UI --------------------- */
  

  return (
    
    <>
      {projects ? (
        <div className="h-auto bg-prim dark:bg-drkp p-6 font-[Poppins,sans-serif]">
          {/* Edit Button */}
          <div className="flex justify-end pr-8">
            {(mode === "view" || mode === "postSave") && (
              <button
                className="flex items-center bg-secd px-3 py-2 rounded text-text"
                onClick={handleEdit}
              >
                <FaUserEdit className="mr-2" /> Edit
              </button>
            )}
          </div>

          {/* Header */}
          <div>
            <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">
              Projects
            </p>
          </div>

          {/* Project Cards */}
          <div className="max-w-6xl mx-auto space-y-10">
            {projects.map((section, i) => (
              <div key={section.__key || i} className="space-y-4">
                <div className="border border-gray-600 p-2 rounded relative">
                  {mode === "editing" ? (
                    <>
                    <input
                      type="text"
                      value={section.category}
                      placeholder="Enter the project title"
                      onChange={(e) => {
                        const updated = deepClone(projects);
                        updated[i].category = e.target.value;
                        setProjects(updated);
                      }}
                      style={{
                        border: '2px solid red',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        outline: 'none',
                        animation: 'blink 1s infinite'
                      }}
                      className="flex m-auto my-4 w-[400px] px-1 text-center border-solid border-2 border-text text-lg font-bold"
                      
                      />
                      <style>
                      {`
                        @keyframes blink {
                          0%, 100% { border-color: black; }
                          50% { border-color: transparent; }
                        }
                      `}
                    </style>
                      </>
                  ) : (
                    <h2 className="text-center text-lg font-bold">
                      {section.category}
                    </h2>
                  )}

                  <div className="flex flex-wrap justify-center gap-5">
                    {mode !== "view" && (
                      <input
                        type="checkbox"
                        checked={selectedRows.has(i)}
                        
                        onChange={() => handleCheckboxToggle(i)}
                        className="absolute top-2 right-2 w-6 h-6 cursor-pointer"
                      />
                    )}

                    {section.content?.map((item, j) => {
                      const color = colors[j % colors.length];
                      return (
                        <StatCard
                          key={j}
                          number={item.number}
                          label={item.label}
                          color={color}
                          isEditing={mode === "editing"}
                          onDelete={() => handleStatDelete(i, j)}
                          onChange={(field, value) =>
                            handleStatChange(i, j, field, value)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {mode === "editing" && (
              <button
                className="w-full h-48 flex justify-center items-center border-dashed border-gray-600 border-2"
                onClick={handleAddNew}
              >
                <Plus className="mr-2" /> Add New
              </button>
            )}

            {mode !== "view" && selectedRows.size > 0 && (
              <button
                className="bg-red-500 text-prim p-2 flex m-auto flex-row mt-4 rounded"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 /> Delete Selected
              </button>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="py-4 mt-4 flex justify-end gap-4 mr-8">
            {mode === "editing" && (
              <>
                <button
                  className="bg-gray-500 px-3 py-2 rounded text-white"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                {unsavedChanges && (
                  <button
                    className="border-4 border-yellow-400 px-3 py-2 rounded-lg"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {mode === "postSave" && (
              <>
                <button
                  className="bg-red-500 px-3 py-2 rounded text-prim"
                  onClick={handleDiscardAll}
                >
                  Discard All
                </button>
                <button
                  className="bg-secd text-text px-3 py-2 flex flex-row rounded  hover:bg-brwn hover:text-prim "
                  onClick={handleRequest}
                >
                  <Send className="mr-2" /> Request
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%]">
          <LoadComp />
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[1100]">
          <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm mb-4">
              {selectedRows.size > 1
                ? "Are you sure you want to delete selected projects?"
                : "Are you sure you want to delete this project?"}
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-400 px-4 py-2 rounded text-white"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 px-4 py-2 rounded text-white"
                onClick={handleDeleteSelected}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Popup */}
      {finalPopupOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
          <div className="bg-white p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request</h2>
              <p className="text-sm text-red-500 mb-4">
        Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
      </p>


            {getChangedProjects().length > 0 ? (
              <table className="w-full text-left text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {getChangedProjects().map((proj, i) => (
                    <tr key={i} className="align-top">
                      <td className={`border p-2 font-medium ${proj.action === "Deleted" ? "text-red-600" : proj.action === "Added" ? "text-green-600" : "text-yellow-700"}`}>
                        {proj.action}
                      </td>
                      <td className="border p-2">{proj.category}</td>
                      <td className="border p-2">
                        {proj.changes.map((c, idx) => (
                          <div key={idx} className="mb-1">
                            <span>{c}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-400 text-white"
                onClick={() => setFinalPopupOpen(false)}
              >
                Cancel
              </button>
              {getChangedProjects().length > 0 && (
                <button
                  className="px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#e0a800]"
                  onClick={handleFinalSubmit}
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
