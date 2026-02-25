import React, { useEffect, useRef, useState } from "react";
import LoadComp from "../../LoadComp";
import { Pencil, Plus, Send, Trash2, X, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAdminRequest } from "../../../hooks/useAdminRequest"; // <-- adjust path if needed

/* --- count-up hook --- */
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * (target || 0)));
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
        <div
          className={`${color} text-white relative rounded shadow-lg w-52 h-32 flex flex-col justify-center items-center gap-2`}
        >
          <input
            type="number"
            value={number ?? ""}
            placeholder="Enter the stat"
            onChange={(e) => onChange("number", parseInt(e.target.value || "0", 10) || 0)}
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
            title="Delete card"
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
const colors = ["bg-blue-700", "bg-green-600", "bg-green-700"];

/* --- Main Component --- */
export default function Projects({ data }) {
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const [projects, setProjects] = useState([]);
  const [deletedProjects, setDeletedProjects] = useState([]); // stores deleted sections (with cards)
  const [mode, setMode] = useState("view"); // "view" | "editing" | "postSave"
  const originalRef = useRef([]); // ORIGINAL snapshot (used as baseline for diffs / payloads)
  const savedRef = useRef([]); // local saved snapshot (not used for payloads now)
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [finalPopupOpen, setFinalPopupOpen] = useState(false);

  // refs for scrolling/focusing
  const containerRef = useRef(null);
  const lastAddedKeyRef = useRef(null);
  const projectRefs = useRef({});

  const deepClone = (v) => JSON.parse(JSON.stringify(v));

  // Ensure each section has __key and each card has __cid
  const attachKeys = (list = []) =>
    (list || []).map((p) => ({
      ...p,
      __key: p.__key || p.id || uuidv4(),
      isNew: p.isNew || false,
      content: (p.content || []).map((c) => ({
        __cid: c.__cid || uuidv4(),
        number: c.number ?? null,
        label: c.label ?? "",
      })),
    }));

  useEffect(() => {
    const withKeys = attachKeys(data || []);
    setProjects(deepClone(withKeys));
    originalRef.current = deepClone(withKeys); // keep as baseline for diffs
    savedRef.current = deepClone(withKeys);
    setDeletedProjects([]);
    setSelectedRows(new Set());
    setMode("view");
    setUnsavedChanges(false);
  }, [data]);

  // track unsaved changes: compare savedRef.current vs projects by stripping transient meta
  useEffect(() => {
    const stripMeta = (arr) =>
      (arr || []).map((p) => ({
        __key: p.__key,
        category: p.category ?? "",
        content: (p.content || []).map((s) => ({ __cid: s.__cid, label: s.label ?? "", number: s.number ?? null })),
      }));
    const savedStr = JSON.stringify(stripMeta(savedRef.current || []));
    const curStr = JSON.stringify(stripMeta(projects || []));
    setUnsavedChanges(savedStr !== curStr || deletedProjects.length > 0);
  }, [projects, deletedProjects]);

  // helpers to add card with __cid
  const handleAddCard = (sectionIndex) => {
    setProjects((prev) => {
      const copy = deepClone(prev);
      const content = copy[sectionIndex].content || [];
      if (content.length < 3) {
        content.push({ __cid: uuidv4(), number: null, label: "" });
        copy[sectionIndex].content = content;
      }
      return copy;
    });
  };

  const handleStatChange = (sectionIndex, statIndex, field, value) => {
    setProjects((prev) => {
      const copy = deepClone(prev);
      copy[sectionIndex].content[statIndex][field] = value;
      return copy;
    });
  };

  const handleStatDelete = (sectionIndex, statIndex) => {
    setProjects((prev) => {
      const copy = deepClone(prev);
      // capture deleted card if needed in deletedProjects? we rely on originalRef for diffs
      copy[sectionIndex].content.splice(statIndex, 1);
      return copy;
    });
  };

  const handleAddNew = () => {
    const key = uuidv4();
    const newProject = { __key: key, category: "", isNew: true, content: [] };
    setProjects((prev) => [...prev, newProject]);
    lastAddedKeyRef.current = key;
  };

  const handleDeleteSelected = () => {
    const toDelete = projects.filter((_, idx) => selectedRows.has(idx));
    if (toDelete.length === 0) return;
    setDeletedProjects((prev) => [...prev, ...toDelete]); // track removed sections for payloads
    setProjects((prev) => prev.filter((_, idx) => !selectedRows.has(idx)));
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
  };

  const handleCheckboxToggle = (i) => {
    const newSet = new Set(selectedRows);
    newSet.has(i) ? newSet.delete(i) : newSet.add(i);
    setSelectedRows(newSet);
  };

  // Undo for changes shown in popup (we will produce diffs that include the project and type)
  const handleUndoChange = (change) => {
    if (change.type === "Added") {
      // remove added project
      setProjects((prev) => prev.filter((p) => p.__key !== change.project.__key));
    } else if (change.type === "Deleted") {
      // restore deleted project
      setDeletedProjects((prev) => prev.filter((p) => p.__key !== change.project.__key));
      setProjects((prev) => [...prev, change.project]);
    } else if (change.type === "Edited") {
      // revert the edited project to the saved version (savedRef.current)
      const saved = savedRef.current.find((p) => p.__key === change.project.__key);
      if (saved) {
        setProjects((prev) => prev.map((p) => (p.__key === saved.__key ? deepClone(saved) : p)));
      }
    }
  };

  // Scrolling/focus after adding
  useEffect(() => {
    const lastKey = lastAddedKeyRef.current;
    if (!lastKey) return;
    const exists = projects.some((p) => p.__key === lastKey);
    if (!exists) return;

    requestAnimationFrame(() => {
      if (containerRef.current && typeof containerRef.current.scrollTo === "function") {
        try {
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
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

  // normalize for payload
  const normalizeStat = (stat) => ({
    number: stat?.number ?? "",
    label: stat?.label ?? "",
  });

  // Compute diffs between baseline (originalRef) and current projects using UIDs
  const computeProjectsDiffs = (savedArr = [], currArr = []) => {
    const diffs = [];
    const savedByKey = new Map((savedArr || []).map((s) => [s.__key, s]));
    const currByKey = new Map((currArr || []).map((s) => [s.__key, s]));

    // Deleted sections (present in saved, not in curr)
    for (const [key, savedSection] of savedByKey.entries()) {
      if (!currByKey.has(key)) {
        // every card in this section is considered deleted
        (savedSection.content || []).forEach((card) =>
          diffs.push({
            action: "card-delete",
            project: savedSection,
            card,
            original_data: normalizeStat(card),
            category: savedSection.category ?? "",
            __cid: card.__cid,
          })
        );
        // also mark a project-level deleted for the popup (shows whole section deleted)
        diffs.push({
          action: "section-removed",
          project: savedSection,
        });
      }
    }

    // Added sections (present in curr, not in saved)
    for (const [key, currSection] of currByKey.entries()) {
      if (!savedByKey.has(key)) {
        // each card inserted (if any)
        (currSection.content || []).forEach((card) =>
          diffs.push({
            action: "card-add",
            project: currSection,
            card,
            meta_data: normalizeStat(card),
            category: currSection.category ?? "",
            __cid: card.__cid,
          })
        );
        diffs.push({
          action: "section-added",
          project: currSection,
        });
      }
    }

    // Sections present in both -> compare by __cid
    for (const [key, currSection] of currByKey.entries()) {
      if (!savedByKey.has(key)) continue;
      const savedSection = savedByKey.get(key);

      const categoryChanged = (savedSection.category ?? "") !== (currSection.category ?? "");

      // map cards
      const savedCardsByCid = new Map((savedSection.content || []).map((c) => [c.__cid, c]));
      const currCardsByCid = new Map((currSection.content || []).map((c) => [c.__cid, c]));

      // deleted cards
      for (const [cid, sCard] of savedCardsByCid.entries()) {
        if (!currCardsByCid.has(cid)) {
          diffs.push({
            action: "card-delete",
            project: savedSection,
            card: sCard,
            original_data: normalizeStat(sCard),
            category: savedSection.category ?? "",
            __cid: cid,
          });
        }
      }

      // added cards
      for (const [cid, cCard] of currCardsByCid.entries()) {
        if (!savedCardsByCid.has(cid)) {
          diffs.push({
            action: "card-add",
            project: currSection,
            card: cCard,
            meta_data: normalizeStat(cCard),
            category: currSection.category ?? "",
            __cid: cid,
          });
        }
      }

      // edited cards (present in both with changed fields) OR category changed
      for (const [cid, cCard] of currCardsByCid.entries()) {
        if (!savedCardsByCid.has(cid)) continue;
        const sCard = savedCardsByCid.get(cid);
        const cardChanged =
          (sCard.label ?? "") !== (cCard.label ?? "") || (sCard.number ?? null) !== (cCard.number ?? null);

        if (cardChanged) {
          diffs.push({
            action: "card-edit",
            project: currSection,
            card: cCard,
            original_card: sCard,
            original_data: normalizeStat(sCard),
            meta_data: normalizeStat(cCard),
            category: currSection.category ?? "",
            __cid: cid,
          });
        } else if (categoryChanged) {
          // category changed but card content same -> emit an update so server knows category changed
          diffs.push({
            action: "card-edit-category-only",
            project: currSection,
            card: cCard,
            original_card: sCard,
            original_data: normalizeStat(sCard),
            meta_data: normalizeStat(cCard),
            original_category: savedSection.category ?? "",
            category: currSection.category ?? "",
            __cid: cid,
          });
        }
      }
    }

    // Normalize order
    const order = {
      "section-removed": 0,
      "card-delete": 1,
      "card-edit": 2,
      "card-edit-category-only": 2,
      "card-add": 3,
      "section-added": 4,
    };
    diffs.sort((a, b) => (order[a.action] ?? 99) - (order[b.action] ?? 99));

    return diffs;
  };

  // Build payloads from diffs (map to your server format), use originalRef as baseline
  const buildProjectsPayloads = () => {
    const diffs = computeProjectsDiffs(originalRef.current || [], projects || []);
    const payloads = [];

    diffs.forEach((d) => {
      switch (d.action) {
        case "card-add":
          payloads.push({
            collectionName: "incubation",
            collection_type: "projects",
            action: "insert",
            title: "insert in projects",
            category: d.category || "",
            meta_data: normalizeStat(d.card),
          });
          break;
        case "card-delete":
          payloads.push({
            collectionName: "incubation",
            collection_type: "projects",
            action: "delete",
            title: "delete in projects",
            category: d.category || "",
            meta_data: normalizeStat(d.card),
          });
          break;
        case "card-edit":
        case "card-edit-category-only":
          payloads.push({
            collectionName: "incubation",
            collection_type: "projects",
            action: "update",
            title: "update in projects",
            category: d.category || "",
            original_data: normalizeStat(d.original_card ?? d.card),
            meta_data: normalizeStat(d.card),
          });
          break;
        default:
          break;
      }
    });

    // Also include deletes from deletedProjects (sections removed via deleteSelected)
    (deletedProjects || []).forEach((proj) => {
      (proj.content || []).forEach((card) => {
        payloads.push({
          collectionName: "incubation",
          collection_type: "projects",
          action: "delete",
          title: "delete in projects",
          category: proj.category || "",
          meta_data: normalizeStat(card),
        });
      });
    });

    return payloads;
  };

  // For the popup, produce user-friendly changes list using originalRef baseline
  const getChangedProjectsForPopup = () => {
    const diffs = computeProjectsDiffs(originalRef.current || [], projects || []);
    const changes = [];
    const addedSections = new Set();
    const removedSections = new Set();

    diffs.forEach((d) => {
      if (d.action === "section-added" && !addedSections.has(d.project.__key)) {
        changes.push({ type: "Added", project: d.project });
        addedSections.add(d.project.__key);
      } else if (d.action === "section-removed" && !removedSections.has(d.project.__key)) {
        changes.push({ type: "Deleted", project: d.project });
        removedSections.add(d.project.__key);
      } else if (d.action === "card-add") {
        if (addedSections.has(d.project.__key)) return;
        changes.push({ type: "Added", project: d.project, card: d.card });
      } else if (d.action === "card-delete") {
        if (removedSections.has(d.project.__key)) return;
        changes.push({ type: "Deleted", project: d.project, card: d.card });
      } else if (d.action === "card-edit" || d.action === "card-edit-category-only") {
        changes.push({
          type: "Edited",
          project: d.project,
          fields: [
            `${d.original_data?.label ?? "-"} → ${d.meta_data?.label ?? "-"}`,
            `# ${d.original_data?.number ?? "-"} → ${d.meta_data?.number ?? "-"}`,
          ],
        });
      }
    });

    // also include any manually deletedProjects (if not already included)
    deletedProjects.forEach((proj) => {
      if (!removedSections.has(proj.__key)) changes.push({ type: "Deleted", project: proj });
    });

    return changes;
  };

  // final submit -> build payloads and send (use originalRef baseline)
  const handleFinalSubmit = async () => {
    const payloads = buildProjectsPayloads();

    if (!payloads.length) {
      setFinalPopupOpen(false);
      return;
    }

    const res = await sendRequest(payloads);
    if (!res) return;

    // After successful submit, set baseline to current projects (so future diffs are relative to this)
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

  // UI actions
  const handleEdit = () => setMode("editing");
  const handleCancel = () => {
    setProjects(deepClone(savedRef.current));
    setDeletedProjects([]);
    setUnsavedChanges(false);
    const hasSavedChanges = JSON.stringify(savedRef.current) !== JSON.stringify(originalRef.current);
    setMode(hasSavedChanges ? "postSave" : "view");
  };
  const handleSave = () => {
    // Save locally (mark that changes are saved for this user)
    savedRef.current = deepClone(projects);
    setUnsavedChanges(false);
    setMode("postSave");
  };
  const handleRequest = () => {
    setFinalPopupOpen(true);
  };
  const handleDiscardAll = () => {
    setProjects(deepClone(originalRef.current));
    savedRef.current = deepClone(originalRef.current);
    setDeletedProjects([]);
    setUnsavedChanges(false);
    setMode("view");
  };

  // Render
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
                      value={section.category ?? ""}
                      placeholder="Enter the project title"
                      onChange={(e) => {
                        setProjects((prev) => {
                          const copy = deepClone(prev);
                          copy[i].category = e.target.value;
                          return copy;
                        });
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
                        key={item.__cid}
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
              <button
                className="bg-red-500 text-prim p-2 flex m-auto flex-row mt-4 rounded"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash /> Delete Selected
              </button>
            )}
          </div>

          <div className="py-4 mt-4 flex justify-end gap-4 mr-8">
            {mode === "editing" && (
              <>
                <button className="bg-gray-500 px-3 py-2 rounded text-white" onClick={handleCancel}>
                  Cancel
                </button>
                {unsavedChanges && (
                  <button className="bg-secd px-3 py-2 rounded-lg text-text" onClick={handleSave}>
                    Save
                  </button>
                )}
              </>
            )}
            {mode === "postSave" && (
              <>
                <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>
                  Discard All
                </button>
                <button
                  className="bg-secd text-text px-3 py-2 flex flex-row rounded"
                  onClick={handleRequest}
                  disabled={requestLoading}
                >
                  <Send className="mr-2" /> Request
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* delete confirm */}
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
              <button className="bg-gray-400 px-4 py-2 rounded text-white" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </button>
              <button className="bg-red-600 px-4 py-2 rounded text-white" onClick={handleDeleteSelected}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* final request popup */}
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
                {getChangedProjectsForPopup().length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No changes detected</td>
                  </tr>
                ) : (
                  getChangedProjectsForPopup().map((c, idx) => (
                    <tr key={idx} className="even:bg-white odd:bg-gray-50">
                      <td className="py-2 px-3 border text-blue-600">{c.type}</td>
                      <td className="py-2 px-3 border">{c.project.category || "-"}</td>
                      <td className="py-2 px-3 border">
                        {c.type === "Edited"
                          ? (c.fields?.length ? c.fields.join(", ") : "Project updated")
                          : c.type === "Added"
                            ? (c.card ? `New card: ${c.card.label || "-"} / ${c.card.number ?? "-"}` : "New project added")
                            : "Project deleted"}
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
              <button
                className="px-4 py-2 rounded bg-gray-400 text-prim"
                onClick={() => setFinalPopupOpen(false)}
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-secd text-text"
                onClick={handleFinalSubmit}
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}