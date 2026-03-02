import React, { useEffect, useRef, useState } from "react";
import LoadComp from "../../LoadComp";
import { Send, Plus, Trash2, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest"; 

export default function Committe({ data }) {
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);

  const originalRef = useRef([]);
  const sessionBaseRef = useRef([]);

  // stable uid generator
  const generateUid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  useEffect(() => {
    if (Array.isArray(data)) {
      // deep clone and ensure __uid exists for each row
      const clone = JSON.parse(JSON.stringify(data || []));
      const withUids = clone.map((r) => {
        if (!r.__uid) r.__uid = generateUid();
        return r;
      });

      originalRef.current = JSON.parse(JSON.stringify(withUids));
      sessionBaseRef.current = JSON.parse(JSON.stringify(withUids));
      setEditableData(withUids);
      setSelectedRows(new Set());
      setSessionChanges([]);
      setAllChanges([]);
      setIsEditing(false);
      setIsSavedOnce(false);
    }
  }, [data]);

  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

  const startEditSession = () => {
    sessionBaseRef.current = JSON.parse(JSON.stringify(editableData));
    setSessionChanges([]);
    setSelectedRows(new Set());
    setIsEditing(true);
  };

  const handleAddMember = () => {
    const newMember = {
      __uid: generateUid(),
      id: Date.now(),
      name: "",
      Designation: "",
      position: "",
    };

    setEditableData((prev) => [...prev, newMember]);
    // track session changes (optional for UI); we still compute final diffs using uids
    setSessionChanges((prev) => [
      ...prev,
      { index: editableData.length, uid: newMember.__uid, action: "add", changes: {} },
    ]);
  };

  const handleFieldChange = (index, field, value) => {
    const newData = [...editableData];
    const oldVal = newData[index]?.[field];

    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);

    setSessionChanges((prev) => {
      const copy = [...prev];
      // prefer matching by uid
      const uid = newData[index]?.__uid;
      const existingIndex = copy.findIndex((c) => c.uid === uid && c.action !== "delete");

      if (existingIndex >= 0) {
        copy[existingIndex] = {
          ...copy[existingIndex],
          action: copy[existingIndex].action === "add" ? "add" : "edit",
          changes: {
            ...copy[existingIndex].changes,
            [field]: { old: oldVal, new: value },
          },
        };
      } else {
        copy.push({
          index,
          uid,
          action: sessionBaseRef.current.find((r) => r.__uid === uid) ? "edit" : "add",
          changes: { [field]: { old: oldVal, new: value } },
        });
      }
      return copy;
    });
  };

  // compute UID-based diffs between originalRef.current and current editableData
  const normalizeMember = (m) => ({
    name: m?.name ?? "",
    image_path: m?.image_path ?? "",
    Designation: m?.Designation ?? "",
    position: m?.position ?? "",
  });

  const deepEqualForMembers = (a, b) => {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const k of keys) {
      const va = a?.[k] ?? "";
      const vb = b?.[k] ?? "";
      if (Array.isArray(va) && Array.isArray(vb)) {
        if (va.length !== vb.length) return false;
        for (let i = 0; i < va.length; i++) if (String(va[i]) !== String(vb[i])) return false;
      } else {
        if (String(va) !== String(vb)) return false;
      }
    }
    return true;
  };

  const computeDiffs = (originalArr, currentArr) => {
    const diffs = [];
    const origByUid = new Map();
    originalArr.forEach((r, i) => origByUid.set(r.__uid, { row: r, index: i }));
    const currByUid = new Map();
    currentArr.forEach((r, i) => currByUid.set(r.__uid, { row: r, index: i }));

    // deletes: present in original but not in current
    for (const [uid, { row: oRow, index: oIdx }] of origByUid.entries()) {
      if (!currByUid.has(uid)) {
        diffs.push({
          action: "delete",
          uid,
          originalIndex: oIdx,
          original_row: oRow,
          original_data: normalizeMember(oRow),
          deletedItem: oRow,
        });
      }
    }

    // adds and edits: present in current
    for (const [uid, { row: cRow, index: cIdx }] of currByUid.entries()) {
      if (!origByUid.has(uid)) {
        // new insert
        diffs.push({
          action: "add",
          uid,
          currentIndex: cIdx,
          current_row: cRow,
          meta_data: normalizeMember(cRow),
        });
      } else {
        // possible edit
        const oRow = origByUid.get(uid).row;
        const normalizedOriginal = normalizeMember(oRow);
        const normalizedCurrent = normalizeMember(cRow);
        const equal = deepEqualForMembers(normalizedOriginal, normalizedCurrent);
        if (!equal) {
          diffs.push({
            action: "edit",
            uid,
            originalIndex: origByUid.get(uid).index,
            currentIndex: cIdx,
            original_row: oRow,
            original_data: normalizedOriginal,
            current_row: cRow,
            meta_data: normalizedCurrent,
          });
        }
      }
    }

    // stable order: deletes first, then edits, then adds (useful for display)
    diffs.sort((a, b) => {
      const order = { delete: 0, edit: 1, add: 2 };
      return (order[a.action] - order[b.action]) ||
        ((a.currentIndex ?? a.originalIndex) - (b.currentIndex ?? b.originalIndex));
    });

    return diffs;
  };

  const getChangesForRequest = () => {
    return computeDiffs(originalRef.current || [], editableData || []);
  };

  const buildCommitteePayloads = () => {
    const changes = getChangesForRequest();
    const payloads = [];

    for (const change of changes) {
      if (change.action === "delete") {
        payloads.push({
          collectionName: "incubation",
          collection_type: "incubation_committee",
          action: "delete",
          title: "delete in incubation_committee",
          meta_data: normalizeMember(change.original_row),
        });
        continue;
      }

      if (change.action === "add") {
        payloads.push({
          collectionName: "incubation",
          collection_type: "incubation_committee",
          action: "insert",
          title: "insert in incubation_committee",
          meta_data: normalizeMember(change.current_row),
        });
        continue;
      }

      if (change.action === "edit") {
        payloads.push({
          collectionName: "incubation",
          collection_type: "incubation_committee",
          action: "update",
          title: "update in incubation_committee",
          original_data: change.original_data,
          meta_data: change.meta_data,
        });
      }
    }

    return payloads;
  };

  const handleFinalRequestConfirm = async () => {
    const payloads = buildCommitteePayloads();

    if (payloads.length === 0) {
      toast.info("No changes to submit.");
      return;
    }

    const res = await sendRequest(payloads);
    if (!res) return;

    toast.success(res.message || "Final request submitted");
    setShowRequestModal(false);

    // after successful submit, reset original snapshot
    originalRef.current = JSON.parse(JSON.stringify(editableData));
    sessionBaseRef.current = JSON.parse(JSON.stringify(editableData));
    setAllChanges([]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
  };

  // Undo using UID-aware diffs
  const handleUndoChange = (change) => {
    if (!change) return;

    if (change.action === "add") {
      // remove item with this uid
      setEditableData((prev) => prev.filter((r) => r.__uid !== change.uid));
    } else if (change.action === "delete") {
      // insert deleted item back at its originalIndex (or at end if out of range)
      setEditableData((prev) => {
        const copy = [...prev];
        const insertAt = Math.min(Math.max(change.originalIndex, 0), copy.length);
        // ensure we insert the full original_row (with its __uid)
        copy.splice(insertAt, 0, change.original_row);
        return copy;
      });
    } else if (change.action === "edit") {
      // restore original_row for this uid
      setEditableData((prev) =>
        prev.map((item) => (item.__uid === change.uid ? { ...change.original_row } : item))
      );
    }

    toast.info("Change undone locally.");
    // no need to manipulate allChanges/sessionChanges here because getChangesForRequest recomputes diffs
  };

  // existing session-change based handlers remain (they are used for UI save flow).
  // Confirm delete (used when user clicks Delete Selected)
  const openDeleteMultiple = () => {
    if (selectedRows.size === 0) {
      toast.info("No members selected for delete");
      return;
    }
    setIndexToDelete("multiple");
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    let newData = [...editableData];
    let newChanges = [...sessionChanges];

    if (indexToDelete === "multiple") {
      const toDelete = Array.from(selectedRows).sort((a, b) => b - a);
      for (const idx of toDelete) {
        const deletedItem = newData[idx];
        if (!deletedItem) continue;
        // record delete by uid (for UI sessionChanges)
        newChanges.push({ index: idx, uid: deletedItem.__uid, action: "delete", deletedItem });
        newData.splice(idx, 1);
      }
    }

    setEditableData(newData);
    setSessionChanges(newChanges);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
    toast.success("Members deleted in this session.");
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
  };

  const handleSave = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);

    toast.success("Changes saved. You can now Request or Edit again.");
  };

  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(sessionBaseRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    toast.info("Session changes discarded. Previous saves preserved.");
  };

  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    sessionBaseRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    toast.info("All changes discarded and data reset.");
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%]">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      {/* Top toolbar */}
      {!isEditing && (
        <div className="flex justify-end pr-8 mt-4">
          <button
            className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
            onClick={startEditSession}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-4 text-brwn dark:text-drkt text-center">
        COMMITTEE MEMBERS
      </h2>

      {/* cards */}
      <div className="flex flex-wrap justify-center gap-8 px-6 py-6">
        {editableData.map((member, i) => (
          <div
            key={member.__uid}
            className="relative w-[300px] min-h-[170px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center"
          >
            {isEditing && (
              <input
                type="checkbox"
                className="absolute top-3 right-3 w-4 h-4 cursor-pointer"
                checked={selectedRows.has(i)}
                onChange={() => toggleSelectRow(i)}
              />
            )}

            {isEditing ? (
              <div className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={member.name ?? ""}
                  onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Designation"
                  className="w-full border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={member.Designation ?? ""}
                  onChange={(e) => handleFieldChange(i, "Designation", e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Position"
                  className="w-full border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={member.position ?? ""}
                  onChange={(e) => handleFieldChange(i, "position", e.target.value)}
                />
              </div>
            ) : (
              <>
                <h4 className="text-lg font-semibold text-[#800000] mb-2">
                  {member.name}
                </h4>

                <p className="text-sm text-gray-600">
                  {member.Designation}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {member.position}
                </p>
              </>
            )}
          </div>
        ))}

        {isEditing && (
          <div
            onClick={handleAddMember}
            className="w-[300px] min-h-[170px] border-2 border-dashed border-gray-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
          >
            <Plus size={28} />
            <p className="mt-2 text-sm font-medium">Add Member</p>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-center mt-2 gap-2">
          {selectedRows.size > 0 && (
            <button
              onClick={openDeleteMultiple}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded"
            >
              <Trash2 /> Delete Selected
            </button>
          )}
        </div>
      )}

      <div className="py-4 mt-4 flex justify-end gap-4 mr-8">
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
                onClick={handleSave}
              >
                Save
              </button>
            )}
          </>
        )}

        {!isEditing && isSavedOnce && (
          <>
            <button
              className="bg-red-500 px-3 py-2 rounded text-prim"
              onClick={handleDiscardAll}
            >
              Discard All
            </button>
            <button
              className="bg-secd text-text px-3 py-2 flex flex-row rounded hover:bg-brwn hover:text-prim"
              onClick={() => {
                const diffs = getChangesForRequest();
                if (diffs.length === 0) {
                  toast.info("No changes to request.");
                  return;
                }
                setShowRequestModal(true);
              }}
              disabled={requestLoading}
            >
              <Send className="mr-2" /> Request
            </button>
          </>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[640px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            <div className="max-h-[420px] overflow-y-auto mb-4">
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
                      <td colSpan={4} className="text-center py-4">
                        No changes to submit
                      </td>
                    </tr>
                  ) : (
                    getChangesForRequest().map((change, idx) => (
                      <tr key={change.uid + "-" + idx} className="even:bg-white odd:bg-gray-50">
                        <td className="py-2 px-3 border text-center align-top">
                          {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
                          {change.action === "add" && <span className="text-green-600">+ Added</span>}
                          {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
                        </td>

                        <td className="py-2 px-3 border text-center align-top">Committee</td>

                        {/* show only what changed (no raw JSON) */}
                        <td className="py-2 px-3 border text-[13px] align-top">
                          {change.action === "delete" ? (
                            <div>Row {change.originalIndex + 1} deleted — {change.original_row?.name || ""}</div>
                          ) : change.action === "add" ? (
                            <div>Row {change.currentIndex + 1} added — {change.current_row?.name || ""}</div>
                          ) : (
                            <ul className="list-disc pl-5">
                              {Object.entries(change.original_data || {}).map(([field, oldVal]) => {
                                const newVal = (change.meta_data || {})[field];
                                if (String(oldVal ?? "") === String(newVal ?? "")) return null;
                                return (
                                  <li key={field}>
                                    <span className="font-semibold">{field}:</span>{" "}
                                    <span className="text-gray-600">{String(oldVal ?? "")}</span>{" "}
                                    →{" "}
                                    <span className="text-black">{String(newVal ?? "")}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </td>

                        <td className="py-2 px-3 border text-center align-top">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleUndoChange(change)}
                            title="Undo this change"
                          >
                            ✖
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
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequestConfirm}
                className="px-4 py-2 rounded bg-secd text-black hover:bg-brwn hover:text-prim"
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

      <ToastContainer position="bottom-right" autoClose={2500} />
    </>
  );
}