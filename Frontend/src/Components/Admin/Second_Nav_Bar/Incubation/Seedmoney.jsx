import React, { useEffect, useRef, useState } from "react";
import LoadComp from "../../LoadComp";
import { Send, Plus, Trash2, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function Seedmoney({ data }) {
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sessionChanges, setSessionChanges] = useState([]); // changes for current session
  const [allChanges, setAllChanges] = useState([]); // saved changes across sessions
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);

  const originalRef = useRef([]); // original loaded data
  const sessionBaseRef = useRef([]); // snapshot at start of edit session

  // --- Initialize and normalize incoming data, add stable __id and slNo ---
  useEffect(() => {
    if (Array.isArray(data)) {
      const safeData = data.map((d, idx) => ({
        ...d,
        __id: d.__id ?? `${Date.now()}-${Math.random()}-${idx}`,
        slNo: d.slNo ?? idx + 1,
        name: d.name ?? "",
        funds: Array.isArray(d.funds)
          ? d.funds.map((f) => ({
              amount_in_rupees: f.amount_in_rupees ?? "",
              organization: f.organization ?? "",
              year: f.year ?? "",
            }))
          : [
              {
                amount_in_rupees: "",
                organization: "",
                year: "",
              },
            ],
      }));

      originalRef.current = JSON.parse(JSON.stringify(safeData));
      sessionBaseRef.current = JSON.parse(JSON.stringify(safeData));
      setEditableData(JSON.parse(JSON.stringify(safeData)));

      setSelectedRows(new Set());
      setSessionChanges([]);
      setAllChanges([]);
      setIsEditing(false);
      setIsSavedOnce(false);
    }
  }, [data]);

  const startEditSession = () => {
    sessionBaseRef.current = JSON.parse(JSON.stringify(editableData));
    setSessionChanges([]);
    setSelectedRows(new Set());
    setIsEditing(true);
  };

  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

  // --- Add row: create new row with stable __id and record a session change (add) with id ---
  const handleAddRow = () => {
    const newRow = {
      __id: `${Date.now()}-${Math.random()}`,
      slNo: editableData.length + 1,
      name: "",
      funds: [
        {
          amount_in_rupees: "",
          organization: "",
          year: "",
        },
      ],
    };

    setEditableData((p) => {
      const next = [...p, newRow];
      return next;
    });

    setSessionChanges((p) => [
      ...p,
      {
        id: newRow.__id,
        index: editableData.length,
        action: "add",
        changes: {},
        // no original data for add
      },
    ]);
  };

  // --- Field change (either row-level or fund-level) ---
  // We base merging/lookup on row.__id so index shifts won't break mapping
  const handleFieldChange = (rowIndex, field, value, fundIndex = null) => {
    const newData = [...editableData];
    const row = newData[rowIndex];
    if (!row) return;

    const rowId = row.__id;
    let oldVal;

    if (fundIndex !== null) {
      oldVal = row.funds[fundIndex]?.[field];
      // ensure funds array exists
      if (!Array.isArray(row.funds)) row.funds = [];
      row.funds[fundIndex] = { ...(row.funds[fundIndex] || {}), [field]: value };
    } else {
      oldVal = row[field];
      row[field] = value;
    }

    setEditableData(newData);

    setSessionChanges((prev) => {
      const cp = [...prev];
      // find existing change for this row by id (and not a delete)
      const existingIndex = cp.findIndex((c) => c.id === rowId && c.action !== "delete");

      const key = fundIndex !== null ? `${field}_${fundIndex}` : field;

      if (existingIndex >= 0) {
        cp[existingIndex] = {
          ...cp[existingIndex],
          action: cp[existingIndex].action === "add" ? "add" : "edit",
          changes: {
            ...cp[existingIndex].changes,
            [key]: { old: oldVal, new: value },
          },
        };
      } else {
        // determine if row existed at session start
        const existedAtSessionStart =
          Boolean(sessionBaseRef.current?.find((r) => r.__id === rowId));
        cp.push({
          id: rowId,
          index: rowIndex,
          action: existedAtSessionStart ? "edit" : "add",
          changes: { [key]: { old: oldVal, new: value } },
        });
      }
      return cp;
    });
  };

  // --- Save current session changes into allChanges and mark not editing ---
  const handleSave = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    setAllChanges((p) => [...p, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
    toast.success("Changes saved. Now you can Request or Edit again.");
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

  const getChangesForRequest = () => [...allChanges, ...sessionChanges];

  const handleRequest = () => {
    if (getChangesForRequest().length === 0) {
      toast.info("No changes to request.");
      return;
    }
    setShowRequestModal(true);
  };

  // --- Undo change: use id to find affected row(s) ---
  const handleUndoChange = (change) => {
    const newEditable = [...editableData];

    if (change.action === "add") {
      // remove row with matching id
      const idx = newEditable.findIndex((r) => r.__id === change.id);
      if (idx >= 0) newEditable.splice(idx, 1);
    } else if (change.action === "edit") {
      // revert to sessionBaseRef snapshot for that id (if exists)
      const original = sessionBaseRef.current.find((r) => r.__id === change.id);
      const idx = newEditable.findIndex((r) => r.__id === change.id);
      if (original && idx >= 0) {
        newEditable[idx] = JSON.parse(JSON.stringify(original));
      }
    } else if (change.action === "delete") {
      // re-insert deletedItem at original index (if provided) otherwise push end
      const insertAt = typeof change.index === "number" ? change.index : newEditable.length;
      if (change.deletedItem) {
        // avoid duplicate if already present
        const exists = newEditable.find((r) => r.__id === change.deletedItem.__id);
        if (!exists) {
          newEditable.splice(Math.min(Math.max(insertAt, 0), newEditable.length), 0, change.deletedItem);
        }
      }
    }

    // fix slNo
    newEditable.forEach((r, i) => (r.slNo = i + 1));

    setEditableData(newEditable);

    // remove this change from tracked lists
    setAllChanges((prev) => prev.filter((c) => !(c.id === change.id && c.action === change.action && c.index === change.index)));
    setSessionChanges((prev) => prev.filter((c) => !(c.id === change.id && c.action === change.action && c.index === change.index)));

    toast.info("Change undone.");
  };

  const normalizeSeedRow = (row) => ({
    name: row?.name ?? "",
    funds: Array.isArray(row?.funds)
      ? row.funds.map((f) => ({
          amount_in_rupees: f?.amount_in_rupees === "" ? "" : Number(f?.amount_in_rupees),
          organization: f?.organization ?? "",
          year: f?.year ?? "",
        }))
      : [],
  });

  // --- Build payloads using stable ids, not numeric indices ---
  const buildSeedMoneyPayloads = () => {
    const changes = getChangesForRequest();
    const payloads = [];

    // For each change, find the current row by id (if needed)
    for (const ch of changes) {
      if (ch.action === "delete") {
        // deletedItem should be present
        payloads.push({
          collectionName: "incubation",
          collection_type: "seed_money",
          action: "delete",
          title: "delete in seed_money",
          meta_data: normalizeSeedRow(ch.deletedItem),
        });
        continue;
      }

      // For add and edit, find current row by id (safer than index)
      const currentRow = editableData.find((r) => r.__id === ch.id);
      // note: for add it should exist (we added it to editableData), for edit it should also exist
      if (ch.action === "add") {
        if (!currentRow) {
          // fallback: if not found by id, try by index
          // (defensive; typically shouldn't happen)
          const fallback = editableData[ch.index];
          if (!fallback) continue;
          payloads.push({
            collectionName: "incubation",
            collection_type: "seed_money",
            action: "insert",
            title: "insert in seed_money",
            meta_data: normalizeSeedRow(fallback),
          });
        } else {
          payloads.push({
            collectionName: "incubation",
            collection_type: "seed_money",
            action: "insert",
            title: "insert in seed_money",
            meta_data: normalizeSeedRow(currentRow),
          });
        }
        continue;
      }

      if (ch.action === "edit") {
        const originalRow = sessionBaseRef.current?.find((r) => r.__id === ch.id);
        // defensive: if we couldn't find original in sessionBase (e.g., session started earlier),
        // attempt to find in originalRef
        const originalToUse = originalRow ?? originalRef.current?.find((r) => r.__id === ch.id);
        if (!currentRow) continue; // nothing to send

        payloads.push({
          collectionName: "incubation",
          collection_type: "seed_money",
          action: "update",
          title: "update in seed_money",
          original_data: normalizeSeedRow(originalToUse || currentRow),
          meta_data: normalizeSeedRow(currentRow),
        });
      }
    }

    return payloads;
  };

  const handleFinalRequestConfirm = async () => {
    const payloads = buildSeedMoneyPayloads();

    if (payloads.length === 0) {
      toast.info("No changes to submit.");
      return;
    }

    const res = await sendRequest(payloads);
    if (!res) return;

    toast.success(res.message || "Final request submitted");
    setShowRequestModal(false);

    // reset trackers
    setAllChanges([]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);

    // update snapshots to current state (deep copy)
    originalRef.current = JSON.parse(JSON.stringify(editableData));
    sessionBaseRef.current = JSON.parse(JSON.stringify(editableData));
  };

  // --- Delete multi / single flow (record deletedItem with id & original index) ---
  const openDeleteMultiple = () => {
    if (selectedRows.size === 0) {
      toast.info("No rows selected for delete");
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
        newChanges.push({
          id: deletedItem.__id,
          index: idx,
          action: "delete",
          deletedItem: JSON.parse(JSON.stringify(deletedItem)),
        });
        newData.splice(idx, 1);
      }
    } else if (typeof indexToDelete === "number") {
      const idx = indexToDelete;
      const deletedItem = newData[idx];
      newChanges.push({
        id: deletedItem.__id,
        index: idx,
        action: "delete",
        deletedItem: JSON.parse(JSON.stringify(deletedItem)),
      });
      newData.splice(idx, 1);
    }

    newData.forEach((r, i) => (r.slNo = i + 1));
    setEditableData(newData);
    setSessionChanges(newChanges);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
    toast.success("Rows deleted in this session.");
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      {!isEditing && (
        <div className="flex justify-end pr-8 mt-10">
          <button
            className="flex items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim"
            onClick={startEditSession}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        </div>
      )}

      <div className="ic-table-container m-4">
        <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Seed Money</p>

        <table className="ic-data-table">
          <thead>
            <tr>
              <th className="ic-table-head">SL No</th>
              <th className="ic-table-head">Name</th>
              <th className="ic-table-head">Amount (₹)</th>
              <th className="ic-table-head">Organization</th>
              <th className="ic-table-head">Year</th>
              {isEditing && <th className="ic-table-head text-secd">Select</th>}
            </tr>
          </thead>

          <tbody>
            {editableData.map((row, i) =>
              (row.funds || []).map((fund, j) => (
                <tr key={`${row.__id}-${j}`}>
                  {j === 0 && (
                    <>
                      <td rowSpan={row.funds.length} className="ic-table-data">
                        {row.slNo ?? i + 1}
                      </td>
                      <td rowSpan={row.funds.length} className="ic-table-data">
                        {isEditing ? (
                          <input
                            className="border px-0 py-1 w-full"
                            value={row.name ?? ""}
                            onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                          />
                        ) : (
                          row.name || "-"
                        )}
                      </td>
                    </>
                  )}

                  <td className="ic-table-data">
                    {isEditing ? (
                      <input
                        className="border px-0 py-1 w-full"
                        value={fund.amount_in_rupees ?? ""}
                        onChange={(e) => handleFieldChange(i, "amount_in_rupees", e.target.value, j)}
                      />
                    ) : (
                      fund.amount_in_rupees || "-"
                    )}
                  </td>

                  <td className="ic-table-data">
                    {isEditing ? (
                      <input
                        className="border px-0 py-1 w-full"
                        value={fund.organization ?? ""}
                        onChange={(e) => handleFieldChange(i, "organization", e.target.value, j)}
                      />
                    ) : (
                      fund.organization || "-"
                    )}
                  </td>

                  <td className="ic-table-data">
                    {isEditing ? (
                      <input
                        className="border px-0 py-1 w-full"
                        value={fund.year ?? ""}
                        onChange={(e) => handleFieldChange(i, "year", e.target.value, j)}
                      />
                    ) : (
                      fund.year || "-"
                    )}
                  </td>

                  {isEditing && j === 0 && (
                    <td rowSpan={row.funds.length} className="ic-table-data text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(i)}
                        onChange={() => toggleSelectRow(i)}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {isEditing && (
          <div className="flex justify-center gap-4 py-3">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2 bg-secd rounded text-text"
            >
              <Plus /> Add New Row
            </button>

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
      </div>

      <div className="py-4 mt-4 flex justify-end gap-4">
        {isEditing && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-gray-500 px-3 py-2 rounded text-prim" onClick={handleCancelSession}>
              Cancel
            </button>
            {sessionChanges.length > 0 && (
              <button
                className="bg-secd hoverbg-brwn text-text hover:text-prim  px-3 py-2 rounded-lg"
                onClick={handleSave}
              >
                Save
              </button>
            )}
          </div>
        )}

        {!isEditing && isSavedOnce && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>
              Discard All
            </button>
            <button
              className="bg-secd text-text px-3 py-2 flex flex-row rounded hover:bg-brwn hover:text-prim"
              onClick={handleRequest}
              disabled={requestLoading}
            >
              <Send className="mr-2" /> Request
            </button>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
          <div className="bg-white p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Request</h2>
            <p className="text-sm text-red-500 mb-4 text-center">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border">Action</th>
                  <th className="py-2 px-3 border">Row</th>
                  <th className="py-2 px-3 border">Changed Field</th>
                  <th className="py-2 px-3 border">Undo</th>
                </tr>
              </thead>

              <tbody>
                {getChangesForRequest().map((c, idx) => {
                  // derive row display info: prefer deletedItem for delete, otherwise current editableData by id
                  const rowData =
                    c.action === "delete"
                      ? c.deletedItem
                      : editableData.find((r) => r.__id === c.id) || editableData[c.index];

                  return (
                    <tr key={idx} className="even:bg-white odd:bg-gray-50">
                      <td className="py-2 px-3 border text-blue-600">
                        {c.action === "edit" ? "Edited" : c.action === "add" ? "Added" : "Deleted"}
                      </td>

                      {/* Show row name (kept simple as requested) */}
                      <td className="py-2 px-3 border">{rowData?.name || "-"}</td>

                      <td className="py-2 px-3 border text-[13px]">
                        {c.action === "edit"
                          ? "Row updated"
                          : c.action === "add"
                          ? "New row added"
                          : "Row deleted"}
                      </td>

                      <td className="py-2 px-3 border text-center">
                        <button className="text-red-500" onClick={() => handleUndoChange(c)}>
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-400 text-white"
                onClick={() => setShowRequestModal(false)}
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-secd text-text"
                onClick={handleFinalRequestConfirm}
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