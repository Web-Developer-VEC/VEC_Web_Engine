// Components/Admin/Facilities.jsx
import React, { useEffect, useRef, useState } from "react";
import { Send, Trash2, Pencil } from "lucide-react";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

export default function Facilities({ data }) {
  const { sendRequest, loading: requestLoading } = useAdminRequest();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";

  // refs
  const originalRef = useRef([]); // snapshot used to compute final diffs (original)
  const savedDataRef = useRef([]); // saved copy after "Save"
  const baseBeforeEditRef = useRef([]); // snapshot at the start of an edit session

  // state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [sessionChanges, setSessionChanges] = useState([]); // UI-level session changes (optional)
  const [allChanges, setAllChanges] = useState([]); // saved sessionChanges after Save
  const [selectedRows, setSelectedRows] = useState(new Set());

  // modals / add form
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImageName, setNewImageName] = useState("");

  // stable uid generator
  const generateUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  useEffect(() => {
    if (!Array.isArray(data)) return;
    // normalize incoming data and ensure each item has __uid
    const normalized = data.map((item) => {
      const image = typeof item === "string" ? item : item.image_path ?? item.image ?? item.img ?? "";
      const name = typeof item === "string" ? "" : item.name ?? item.title ?? "";
      return {
        __uid: item && item.__uid ? item.__uid : generateUid(),
        image,
        name,
      };
    });

    setEditableData(normalized);
    originalRef.current = deepCopy(normalized);
    savedDataRef.current = deepCopy(normalized);
    baseBeforeEditRef.current = deepCopy(normalized);
    setSessionChanges([]);
    setAllChanges([]);
    setSelectedRows(new Set());
    setIsEditing(false);
    setIsSavedOnce(false);
  }, [data]);

  const UrlParser = (path) => {
    if (!path) return "";
    if (typeof path === "string") {
      return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    }
    if (path instanceof File) return URL.createObjectURL(path);
    return "";
  };

  // ---- Editing helpers ----
  const startEditSession = () => {
    baseBeforeEditRef.current = deepCopy(editableData);
    setSessionChanges([]);
    setSelectedRows(new Set());
    setIsEditing(true);
  };

  const handleFieldChange = (index, newName) => {
    const uid = editableData[index]?.__uid;
    const oldVal = editableData[index]?.name ?? "";
    setEditableData((prev) => {
      const copy = prev.map((it) => ({ ...it }));
      copy[index].name = newName;
      return copy;
    });

    setSessionChanges((prev) => {
      const cp = [...prev];
      const existing = cp.findIndex((c) => c.uid === uid && c.action !== "delete");
      if (existing >= 0) {
        cp[existing] = {
          ...cp[existing],
          action: cp[existing].action === "add" ? "add" : "edit",
          changes: { ...cp[existing].changes, name: { old: oldVal, new: newName } },
        };
      } else {
        cp.push({
          index,
          uid,
          action: baseBeforeEditRef.current.find((r) => r.__uid === uid) ? "edit" : "add",
          changes: { name: { old: oldVal, new: newName } },
        });
      }
      return cp;
    });
  };

  const handleImageChange = (index, file) => {
    const uid = editableData[index]?.__uid;
    const oldVal = editableData[index]?.image ?? "";
    setEditableData((prev) => {
      const copy = prev.map((it) => ({ ...it }));
      copy[index].image = file; // store File locally
      return copy;
    });

    setSessionChanges((prev) => {
      const cp = [...prev];
      const existing = cp.findIndex((c) => c.uid === uid && c.action !== "delete");
      if (existing >= 0) {
        cp[existing] = {
          ...cp[existing],
          action: cp[existing].action === "add" ? "add" : "edit",
          changes: { ...cp[existing].changes, image: { old: oldVal, new: file } },
        };
      } else {
        cp.push({
          index,
          uid,
          action: baseBeforeEditRef.current.find((r) => r.__uid === uid) ? "edit" : "add",
          changes: { image: { old: oldVal, new: file } },
        });
      }
      return cp;
    });
  };

  const handleNewFileSelect = (e) => {
    const f = e.target.files?.[0] ?? null;
    setNewImageFile(f);
  };

  const handleAddNew = () => {
    if (!newImageFile) {
      toast.info("Please select an image.");
      return;
    }
    const newItem = { __uid: generateUid(), image: newImageFile, name: newImageName ?? "" };
    setEditableData((prev) => {
      const idx = prev.length;
      const arr = [...prev, newItem];
      setSessionChanges((ch) => [...ch, { index: idx, uid: newItem.__uid, action: "add", item: newItem }]);
      return arr;
    });

    setNewImageFile(null);
    setNewImageName("");
    setShowAddForm(false);
  };

  // selection & delete
  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    nxt.has(index) ? nxt.delete(index) : nxt.add(index);
    setSelectedRows(nxt);
  };

  const openDeleteConfirm = () => {
    if (selectedRows.size === 0) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    const toDelete = Array.from(selectedRows).sort((a, b) => b - a); // delete from end to keep indices stable
    const ch = toDelete.map((idx) => {
      const deletedItem = editableData[idx];
      return { index: idx, uid: deletedItem?.__uid, action: "delete", deletedItem };
    });

    setEditableData((prev) => prev.filter((_, i) => !selectedRows.has(i)));
    setSessionChanges((prev) => [...prev, ...ch]);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    
  };

  // ---- Save / cancel / discard ----
  const hasUnsavedChanges = JSON.stringify(editableData) !== JSON.stringify(savedDataRef.current);

  const handleSave = () => {
    if (!hasUnsavedChanges) {
      toast.info("No changes to save.");
      return;
    }
    savedDataRef.current = deepCopy(editableData);
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
    
  };

  const handleCancelSession = () => {
    setEditableData(deepCopy(savedDataRef.current));
    setSessionChanges([]);
    setIsEditing(false);
    toast.info("Session cancelled.");
  };

  const handleDiscardAll = () => {
    setEditableData(deepCopy(originalRef.current));
    savedDataRef.current = deepCopy(originalRef.current);
    baseBeforeEditRef.current = deepCopy(originalRef.current);
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    toast.info("All changes discarded and data reset.");
  };

  // ---- UID-based diff computation ----
  const extractImagePathString = (imgVal) => {
    if (!imgVal) return "";
    if (typeof imgVal === "string") return imgVal;
    return ""; // File -> no server path yet
  };

  const normalizeFacilityMeta = (item) => ({
    name: item?.name ?? "",
    image_path: extractImagePathString(item?.image),
  });

  const deepEqualFacility = (a, b) => {
    const ka = normalizeFacilityMeta(a);
    const kb = normalizeFacilityMeta(b);
    return ka.name === kb.name && ka.image_path === kb.image_path;
  };

  const computeDiffs = (origArr, currArr) => {
    const diffs = [];
    const origByUid = new Map();
    origArr.forEach((r, i) => origByUid.set(r.__uid, { row: r, index: i }));
    const currByUid = new Map();
    currArr.forEach((r, i) => currByUid.set(r.__uid, { row: r, index: i }));

    // deletions
    for (const [uid, { row: oRow, index: oIdx }] of origByUid.entries()) {
      if (!currByUid.has(uid)) {
        diffs.push({
          action: "delete",
          uid,
          originalIndex: oIdx,
          original_row: oRow,
          deletedItem: oRow,
          original_data: normalizeFacilityMeta(oRow),
        });
      }
    }

    // additions and edits
    for (const [uid, { row: cRow, index: cIdx }] of currByUid.entries()) {
      if (!origByUid.has(uid)) {
        // add
        diffs.push({
          action: "add",
          uid,
          currentIndex: cIdx,
          current_row: cRow,
          meta_data: normalizeFacilityMeta(cRow),
        });
      } else {
        const oRow = origByUid.get(uid).row;
        if (!deepEqualFacility(oRow, cRow)) {
          diffs.push({
            action: "edit",
            uid,
            originalIndex: origByUid.get(uid).index,
            currentIndex: cIdx,
            original_row: oRow,
            current_row: cRow,
            original_data: normalizeFacilityMeta(oRow),
            meta_data: normalizeFacilityMeta(cRow),
          });
        }
      }
    }

    // sort for consistent display: delete, edit, add
    diffs.sort((a, b) => {
      const order = { delete: 0, edit: 1, add: 2 };
      return (order[a.action] - order[b.action]) || ((a.currentIndex ?? a.originalIndex) - (b.currentIndex ?? b.originalIndex));
    });

    return diffs;
  };

  const getChangesForRequest = () => computeDiffs(originalRef.current || [], editableData || []);

  // Build payloads *and* files array; include helpful mapping info for server
  const buildFacilitiesPayloadsAndFiles = () => {
    const changes = getChangesForRequest();
    const payloads = [];
    const files = []; // array of { uid, file }

    for (const change of changes) {
      if (change.action === "delete") {
        // delete must include original image_path (from original snapshot)
        payloads.push({
          collectionName: "incubation",
          collection_type: "facilities",
          action: "delete",
          title: "delete in facilities",
          meta_data: change.original_data,
        });      
        console.log(payloads);  
        continue;
      }

      if (change.action === "add") {
        // if image is File, add file mapping
        const meta = { ...normalizeFacilityMeta(change.current_row) };

        if (change.current_row?.image instanceof File) {
          // set image_path in payload to the file's original name so hook matches files by name
          meta.image_path = change.current_row.image.name;
          files.push({ uid: change.uid, file: change.current_row.image });
        } else if (typeof change.current_row?.image === "string") {
          meta.image_path = change.current_row.image;
        } else {
          meta.image_path = "";
        }

        payloads.push({
          collectionName: "incubation",
          collection_type: "facilities",
          action: "insert",
          title: `insert in facilities`,
          meta_data: meta,
        });
        continue;
      }

      if (change.action === "edit") {
        const original_data = { ...change.original_data };
        const meta_data = { name: change.current_row?.name ?? "" };

        // If new image is a File, set image_path to filename so hook finds the file by name.
        if (change.current_row?.image instanceof File) {
          meta_data.image_path = change.current_row.image.name;
          files.push({ uid: change.uid, file: change.current_row.image });
        } else if (typeof change.current_row?.image === "string") {
          meta_data.image_path = change.current_row.image;
        } else {
          meta_data.image_path = "";
        }

        payloads.push({
          collectionName: "incubation",
          collection_type: "facilities",
          action: "update",
          title: `update in facilities`,
          original_data,
          meta_data,
        });
      }
    }

    return { payloads, files };
  };

  const handleFinalRequestConfirm = async () => {
    const { payloads, files } = buildFacilitiesPayloadsAndFiles();

    if (payloads.length === 0) {
      toast.info("No changes to submit.");
      return;
    }

    // Convert files array of {uid,file} to array of File objects — this is what useAdminRequest expects
    const filesForHook = files.map((f) => f.file);

    try {
      const res = await sendRequest(payloads, filesForHook);
      if (!res) {
        // hook already toasts on failure; just return
        return;
      }


      // after successful request, update original snapshot to current editableData
      originalRef.current = deepCopy(editableData);
      savedDataRef.current = deepCopy(editableData);
      baseBeforeEditRef.current = deepCopy(editableData);
      setAllChanges([]);
      setSessionChanges([]);
      setIsSavedOnce(false);
      setShowRequestModal(false);

      // If backend returns fileMap (mapping uploaded filename -> saved path), update accordingly
      if (res.fileMap && typeof res.fileMap === "object") {
        setEditableData((prev) =>
          prev.map((r) => {
            // res.fileMap keys are expected to be file names or file_field; try both
            const fileKey = r.image instanceof File ? r.image.name : (typeof r.image === "string" ? r.image.split("/").pop() : "");
            if (fileKey && res.fileMap[fileKey]) {
              return { ...r, image: res.fileMap[fileKey] };
            }
            // also support map keyed by uid
            if (res.fileMap[r.__uid]) {
              return { ...r, image: res.fileMap[r.__uid] };
            }
            return r;
          })
        );
        originalRef.current = deepCopy(editableData);
        savedDataRef.current = deepCopy(editableData);
      }
    } catch (err) {
      // sendRequest already handles toasts; nothing more required
      console.error("handleFinalRequestConfirm error:", err);
    }
  };

  // Undo using UID-aware diffs
  const handleUndoChange = (change) => {
    if (!change) return;
    if (change.action === "add") {
      setEditableData((prev) => prev.filter((r) => r.__uid !== change.uid));
    } else if (change.action === "delete") {
      setEditableData((prev) => {
        const copy = [...prev];
        const insertAt = Math.min(Math.max(change.originalIndex, 0), copy.length);
        copy.splice(insertAt, 0, change.original_row);
        return copy;
      });
    } else if (change.action === "edit") {
      setEditableData((prev) => prev.map((r) => (r.__uid === change.uid ? { ...change.original_row } : r)));
    }
    toast.info("Change undone locally.");
  };

  if (!Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="bg-prim dark:bg-drkp min-h-screen font-[Poppins,sans-serif]">
      <div className="flex justify-end pr-8 pt-6">
        {!isEditing && (
          <button className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black" onClick={startEditSession}>
            <Pencil className="mr-2" /> Edit
          </button>
        )}
      </div>

      <section className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-brwn dark:text-drkt mb-6 text-center">Explore Facilities</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {editableData.map((f, idx) => (
            <div key={f.__uid} className="relative bg-prim dark:bg-black rounded-lg shadow hover:shadow-lg overflow-hidden transition-shadow">
              <img src={UrlParser(f.image)} alt={f.name || `Facility ${idx + 1}`} className="w-full h-48 object-cover" />

              {isEditing && (
                <input type="checkbox" className="absolute top-2 right-2 w-6 h-6 z-20" checked={selectedRows.has(idx)} onChange={() => toggleSelectRow(idx)} />
              )}

              <div className="p-4 flex flex-col items-center">
                {isEditing ? (
                  <>
                    <input type="text" value={f.name} onChange={(e) => handleFieldChange(idx, e.target.value)} placeholder="Enter facility name" className="w-full text-center border rounded px-2 py-1 text-black" />

                    {/* Change Image Button Bottom Center */}
                    <label className="mt-3 bg-secd hover:bg-brwn text-text hover:text-prim px-4 py-1 rounded cursor-pointer text-sm">
                      Change Image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageChange(idx, e.target.files[0])} />
                    </label>
                  </>
                ) : (
                  <h3 className="text-lg text-center font-semibold mb-2 text-text dark:text-drkt">{f.name || "-"}</h3>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* add form */}
        {isEditing && showAddForm && (
          <div className="mt-4 p-4 border rounded max-w-md">
            <label className="block mb-2 font-medium">Image</label>
            <input type="file" accept="image/*" onChange={handleNewFileSelect} />
            <label className="block mt-3 mb-2 font-medium">Name</label>
            <input type="text" value={newImageName} onChange={(e) => setNewImageName(e.target.value)} placeholder="Facility name" className="w-full border rounded px-2 py-1 text-black" />
            <div className="mt-3 flex gap-2">
              <button className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded" onClick={handleAddNew}>Add</button>
              <button className="bg-gray-300 px-3 py-2 rounded" onClick={() => { setShowAddForm(false); setNewImageFile(null); setNewImageName(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mt-4 flex gap-4 items-center">
            <button className="bg-gray-100 border-2 border-dashed border-secd w-[350px] h-80 text-text px-3 py-2 rounded" onClick={() => setShowAddForm((s) => !s)}>
              + Add New Facility
            </button>
            {selectedRows.size > 0 && (
              <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={openDeleteConfirm}>
                <Trash2 className="inline mr-2" /> Delete Selected
              </button>
            )}
          </div>
        )}

        <div className="py-6 flex justify-end gap-4 mr-8">
          {isEditing && (
            <>
              <button className="bg-gray-500 px-3 py-2 rounded text-white" onClick={handleCancelSession}>Cancel</button>
              {hasUnsavedChanges && <button className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded-lg" onClick={handleSave}>Save</button>}
            </>
          )}

          {!isEditing && isSavedOnce && (
            <>
              <button className="bg-gray-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>Discard All</button>
              <button className="bg-secd text-text px-3 py-2 flex flex-row rounded hover:bg-brwn hover:text-prim" onClick={() => { const diffs = getChangesForRequest(); if (diffs.length === 0) { toast.info("No changes to request."); return; } setShowRequestModal(true); }} disabled={requestLoading}>
                <Send className="mr-2" /> Request
              </button>
            </>
          )}
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>
              <p className="text-sm text-red-500 mb-4">Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.</p>

              <div className="max-h-[320px] overflow-y-auto mb-4">
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border">Action</th>
                      <th className="py-2 px-3 border">Section</th>
                      <th className="py-2 px-3 border">Changed Field</th>
                      <th className="py-2 px-3 border text-center">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getChangesForRequest().length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No changes to submit</td>
                      </tr>
                    ) : (
                      getChangesForRequest().map((change, idx) => (
                        <tr key={change.uid + "-" + idx} className="even:bg-white odd:bg-gray-50">
                          <td className="py-2 px-3 border align-top">{change.action === "edit" ? <span className="text-blue-600">✎ Edited</span> : change.action === "add" ? <span className="text-green-600">+ Added</span> : <span className="text-red-600">🗑 Deleted</span>}</td>
                          <td className="py-2 px-3 border align-top">Facilities</td>
                          <td className="py-2 px-3 border text-[13px]">
                            {change.action === "delete" ? (
                              <div>Deleted {change.deletedItem?.name || "Unnamed"} ({change.original_data?.image_path || "-"})</div>
                            ) : change.action === "add" ? (
                              <div>Added {change.current_row?.name || "Unnamed"} {change.current_row?.image instanceof File ? `(${change.current_row.image.name})` : `(${change.meta_data?.image_path || "-"})`}</div>
                            ) : (
                              <div>
                                <div className="mb-2"><strong>From:</strong> {change.original_data?.name || "-"} {change.original_data?.image_path ? `(${change.original_data.image_path})` : ""}</div>
                                <div className="mb-2"><strong>To:</strong> {change.meta_data?.name || "-"} {change.meta_data?.image_path ? `(${change.meta_data.image_path})` : (change.current_row?.image instanceof File ? `(${change.current_row.image.name})` : "")}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 border text-center">
                            <button className="text-red-500 hover:text-red-700" onClick={() => handleUndoChange(change)}>✖</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim" disabled={requestLoading}>Cancel</button>
                <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-secd hoverbg-brwn text-text hover:text-prim" disabled={requestLoading}>
                  {requestLoading ? "Submitting..." : "Final Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* delete confirm */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[1100]">
            <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-sm mb-4">{selectedRows.size > 1 ? "Are you sure you want to delete selected images?" : "Are you sure you want to delete this image?"}</p>
              <div className="flex justify-center gap-4">
                <button className="bg-gray-400 px-4 py-2 rounded text-white" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
                <button className="bg-red-600 px-4 py-2 rounded text-white" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={2500} />
      </section>
    </div>
  );
}