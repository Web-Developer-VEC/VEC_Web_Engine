import React, { useEffect, useRef, useState } from "react";
import LoadComp from "../../LoadComp";
import { Pencil, Plus, Send, Trash2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/* --- count-up hook --- */
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

/* --- StatCard --- */
export function StatCard({ number, label, color, isEditing, onDelete, onChange }) {
  const count = useCountUp(number ?? 0);
  return (
    <>
      {isEditing ? (
        <div className={`${color} text-white relative rounded shadow-lg w-52 h-32 flex flex-col justify-center items-center gap-2`}>
          <input
            type="number"
            value={number ?? ""}
            placeholder="Enter the stat"
            onChange={(e) => onChange("number", parseInt(e.target.value) || 0)}
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
        <div className={`${color} text-white rounded relative shadow-lg w-52 h-32 flex flex-col justify-center items-center`}>
          <div className="text-4xl font-bold">{count}</div>
          <div className="text-sm">{label}</div>
        </div>
      )}
    </>
  );
}
const colors = ["bg-blue-700", "bg-green-600", "bg-green-700"];

/* --- Main Component --- */
export default function Projects({ data }) {
  const [projects, setProjects] = useState([]);
  const [deletedProjects, setDeletedProjects] = useState([]);
  const [mode, setMode] = useState("view");
  const originalRef = useRef([]);
  const savedRef = useRef([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [finalPopupOpen, setFinalPopupOpen] = useState(false);

  // NEW: refs for scrolling/focusing
  const containerRef = useRef(null);
  const lastAddedKeyRef = useRef(null);
  const projectRefs = useRef({});

  const deepClone = (v) => JSON.parse(JSON.stringify(v));
  const attachKeys = (list = []) =>
    list.map((p) => ({
      ...p,
      __key: p.__key || p.id || uuidv4(),
      isNew: p.isNew || false,
      content: Array.isArray(p.content) ? p.content : [],
    }));

  useEffect(() => {
    const withKeys = attachKeys(data || []);
    setProjects(deepClone(withKeys));
    originalRef.current = deepClone(withKeys);
    savedRef.current = deepClone(withKeys);
    setDeletedProjects([]);
    setSelectedRows(new Set());
    setMode("view");
  }, [data]);

  const handleUndoChange = (change) => {
    if (change.type === "Added") {
      setProjects((prev) => prev.filter((p) => p.__key !== change.project.__key));
    } else if (change.type === "Deleted") {
      setProjects((prev) => [...prev, change.project]);
      setDeletedProjects((prev) => prev.filter((p) => p.__key !== change.project.__key));
    } else if (change.type === "Edited") {
      const saved = savedRef.current.find((p) => p.__key === change.project.__key);
      if (saved) {
        setProjects((prev) =>
          prev.map((p) => (p.__key === saved.__key ? deepClone(saved) : p))
        );
      }
    }
    setUnsavedChanges(true);
  };

  useEffect(() => {
    const stripMeta = (arr) =>
      (arr || []).map((p) => ({
        category: p.category,
        content: (p.content || []).map((s) => ({
          label: s.label,
          number: s.number,
        })),
      }));
    const savedStr = JSON.stringify(stripMeta(savedRef.current));
    const curStr = JSON.stringify(stripMeta(projects));
    setUnsavedChanges(savedStr !== curStr || deletedProjects.length > 0);
  }, [projects, deletedProjects]);

  /* --- CRUD Handlers --- */
  const handleEdit = () => setMode("editing");
  const handleCancel = () => {
    setProjects(deepClone(savedRef.current));
    setDeletedProjects([]);
    setUnsavedChanges(false);
    const hasSavedChanges = JSON.stringify(savedRef.current) !== JSON.stringify(originalRef.current);
    setMode(hasSavedChanges ? "postSave" : "view");
  };
  const handleSave = () => {
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
  const handleAddCard = (sectionIndex) => {
    const updated = deepClone(projects);
    const content = updated[sectionIndex].content || [];
    if (content.length < 3) {
      updated[sectionIndex].content.push({ number: null, label: "" });
      setProjects(updated);
      setUnsavedChanges(true);
    }
  };

  const handleAddNew = () => {
    const key = uuidv4();
    const newProject = { __key: key, category: "", isNew: true, content: [] };
    setProjects((prev) => [...prev, newProject]);
    lastAddedKeyRef.current = key;
    setUnsavedChanges(true);
  };

  const handleDeleteSelected = () => {
    const toDelete = projects.filter((_, idx) => selectedRows.has(idx));
    setDeletedProjects([...deletedProjects, ...toDelete]);
    const updated = projects.filter((_, idx) => !selectedRows.has(idx));
    setProjects(updated);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    setUnsavedChanges(true);
  };

  const handleFinalSubmit = () => {
    const newKeys = projects.filter((p) => p.isNew).map((p) => p.__key);
    const finalized = projects.map((p) => ({ ...p, isNew: false }));
    const reordered = [
      ...finalized.filter((p) => newKeys.includes(p.__key)),
      ...finalized.filter((p) => !newKeys.includes(p.__key)),
    ];

    savedRef.current = deepClone(reordered);
    originalRef.current = deepClone(reordered);
    setProjects(reordered);
    setDeletedProjects([]);
    setFinalPopupOpen(false);
    setMode("view");
    setUnsavedChanges(false);
    setSelectedRows(new Set());
    lastAddedKeyRef.current = null;
  };

  useEffect(() => {
    const lastKey = lastAddedKeyRef.current;
    if (!lastKey) return;
    const exists = projects.some((p) => p.__key === lastKey);
    if (!exists) return;

    requestAnimationFrame(() => {
      if (containerRef.current && typeof containerRef.current.scrollTo === "function") {
        try {
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
          containerRef.current.scrollTop = 0;
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      const el = projectRefs.current[lastKey];
      if (el) {
        const input = el.querySelector('input[type="text"], input[type="number"], textarea');
        if (input) input.focus();
      }

      lastAddedKeyRef.current = null;
    });
  }, [projects]);

  const getChangedProjects = () => {
    const changes = [];
    const saved = deepClone(savedRef.current);

    projects.forEach((proj) => {
      const orig = saved.find((p) => p.__key === proj.__key);
      if (!orig) {
        changes.push({ type: "Added", project: proj });
      } else {
        const editedFields = [];
        proj.content.forEach((row, idx) => {
          const origRow = orig.content[idx];
          if (!origRow || row.label !== origRow.label || row.number !== origRow.number) {
            editedFields.push(`Label: ${row.label || "-"} | Number: ${row.number ?? "-"}`);
          }
        });
        if (proj.category !== orig.category || editedFields.length > 0) {
          changes.push({ type: "Edited", project: proj, fields: editedFields });
        }
      }
    });

    deletedProjects.forEach((proj) => {
      changes.push({ type: "Deleted", project: proj });
    });

    return changes;
  };

  return (
    <>
      {projects.length === 0 ? (
        <div className="h-screen flex items-center justify-center md:mt-[15%]">
          <LoadComp />
        </div>
      ) : (
        <div ref={containerRef} className="h-auto bg-prim dark:bg-drkp p-6 font-[Poppins,sans-serif]">
          <div className="flex justify-end pr-8">
            {(mode === "view" || mode === "postSave") && (
              <button className="flex items-center bg-secd px-3 py-2 rounded text-text" onClick={handleEdit}>
                <Pencil className="mr-2" /> Edit
              </button>
            )}
          </div>

          <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Projects</p>

          <div className="max-w-6xl mx-auto space-y-10">
            {projects.map((section, i) => (
              <div key={section.__key || i} className="space-y-4">
                <div
                  ref={(el) => {
                    if (el) projectRefs.current[section.__key] = el;
                    else delete projectRefs.current[section.__key];
                  }}
                  className="border border-gray-600 p-2 rounded relative"
                >
                  {mode === "editing" ? (
                    <input
                      type="text"
                      value={section.category}
                      placeholder="Enter the project title"
                      onChange={(e) => {
                        const updated = deepClone(projects);
                        updated[i].category = e.target.value;
                        setProjects(updated);
                      }}
                      className="flex m-auto my-4 w-[400px] px-1 text-center border-2 border-text text-lg font-bold"
                    />
                  ) : (
                    <h2 className="text-center text-lg font-bold">{section.category}</h2>
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

                    {section.content.map((item, j) => (
                      <StatCard
                        key={j}
                        number={item.number}
                        label={item.label}
                        color={colors[j % colors.length]}
                        isEditing={mode === "editing"}
                        onDelete={() => handleStatDelete(i, j)}
                        onChange={(field, value) => handleStatChange(i, j, field, value)}
                      />
                    ))}

                    {mode === "editing" && section.content.length < 3 && (
                      <button
                        className="w-52 h-32 border-dashed border-2 border-gray-400 flex flex-col justify-center items-center text-gray-600 hover:bg-gray-100 rounded"
                        onClick={() => handleAddCard(i)}
                      >
                        <Plus className="mb-1" /> Add Card
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {mode === "editing" && (
              <button
                className="w-full h-48 flex justify-center items-center border-dashed border-gray-600 border-2"
                onClick={handleAddNew}
              >
                <Plus className="mr-2" /> Add New Year
              </button>
            )}

            {mode !== "view" && selectedRows.size > 0 && (
              <button className="bg-red-500 text-prim p-2 flex m-auto flex-row mt-4 rounded" onClick={() => setDeleteConfirmOpen(true)}>
                <Trash2 /> Delete Selected
              </button>
            )}
          </div>

          <div className="py-4 mt-4 flex justify-end gap-4 mr-8">
            {mode === "editing" && (
              <>
                <button className="bg-gray-500 px-3 py-2 rounded text-white" onClick={handleCancel}>Cancel</button>
                {unsavedChanges && <button className="bg-secd px-3 py-2 rounded-lg text-text" onClick={handleSave}>Save</button>}
              </>
            )}
            {mode === "postSave" && (
              <>
                <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>Discard All</button>
                <button className="bg-secd text-text px-3 py-2 flex flex-row rounded" onClick={handleRequest}><Send className="mr-2" /> Request</button>
              </>
            )}
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[1100]">
          <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm mb-4">
              {selectedRows.size > 1 ? "Are you sure you want to delete selected projects?" : "Are you sure you want to delete this project?"}
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-gray-400 px-4 py-2 rounded text-white" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
              <button className="bg-red-600 px-4 py-2 rounded text-white" onClick={handleDeleteSelected}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {finalPopupOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
          <div className="bg-white p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
            </p>

            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border">Action</th>
                  <th className="py-2 px-3 border">Section</th>
                  <th className="py-2 px-3 border">Changed Field</th>
                  <th className="py-2 px-3 border">Undo</th>
                </tr>
              </thead>
              <tbody>
                {getChangedProjects().length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No changes detected</td>
                  </tr>
                ) : (
                  getChangedProjects().map((c, idx) => (
                    <tr key={idx} className="even:bg-white odd:bg-gray-50">
                      <td className="py-2 px-3 border text-blue-600">{c.type}</td>
                      <td className="py-2 px-3 border">{c.project.category || "-"}</td>
                      <td className="py-2 px-3 border">
                        {c.type === "Edited" ? c.fields.join(", ") : c.type === "Added" ? "New project added" : "Project deleted"}
                      </td>
                      <td className="py-2 px-3 border text-center">
                        <button className="text-red-500" onClick={() => handleUndoChange(c)}>
                          <X />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-400 text-prim" onClick={() => setFinalPopupOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-secd text-text" onClick={handleFinalSubmit}>Final Request</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
