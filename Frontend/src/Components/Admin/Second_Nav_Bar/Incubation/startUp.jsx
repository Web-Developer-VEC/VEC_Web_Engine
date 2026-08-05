import React, { useEffect, useRef, useState } from "react";
import LoadComp from "../../LoadComp";
import { Send, Plus, Trash2, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function Startup({ data }) {
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);

  const originalRef = useRef([]);
  const sessionBaseRef = useRef([]);

  const generateUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = String(dateStr).split(".");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const formatFromInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = String(dateStr).split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  };

const normalizeStartupRow = (row) => {
  const directors =
    Array.isArray(row?.directors)
      ? row.directors.map((d) => String(d).trim()).filter(Boolean)
      : typeof row?.directors === "string"
      ? row.directors
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : [];

  return {
    s_no: Number(row?.s_no) || 0,
    start_up_name: row?.start_up_name ?? "",
    directors,
    type: row?.type ?? "",
    date_of_registration: row?.date_of_registration ?? "",
    corporate_identity_number: row?.corporate_identity_number ?? "",
    udyam_number: row?.udyam_number ?? "",
  };
};

  useEffect(() => {
    if (Array.isArray(data)) {
      const clone = JSON.parse(JSON.stringify(data));
      const withUids = clone.map((r, i) => {
        if (!r.__uid) r.__uid = generateUid();
        return r;
      });
      originalRef.current = JSON.parse(JSON.stringify(withUids));
      sessionBaseRef.current = JSON.parse(JSON.stringify(withUids));
      
      setEditableData(withUids);
      setSelectedRows(new Set());
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
    setSelectedRows(new Set());
    setIsEditing(true);
  };

  const handleAddRow = () => {
    const newRow = {
      __uid: generateUid(),
      s_no: editableData.length + 1,
      start_up_name: "",
      directors: [],
      type: "",
      date_of_registration: "",
      corporate_identity_number: "",
      udyam_number: "",
    };
    setEditableData((p) => [...p, newRow]);
  };

  const handleFieldChange = (index, field, value) => {
    const newData = [...editableData];
    if (field === "directors" && typeof value === "string") {
      value = value
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    }
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);
  };

  const handleSave = () => {
    setIsEditing(false);
    setIsSavedOnce(true);
    sessionBaseRef.current = JSON.parse(JSON.stringify(editableData));
  };

  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(sessionBaseRef.current)));
    setIsEditing(false);
    toast.info("Session changes discarded.");
  };

  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    sessionBaseRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setIsEditing(false);
    setIsSavedOnce(false);
    setSelectedRows(new Set());
    toast.info("All changes discarded and data reset.");
  };

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
    if (indexToDelete === "multiple") {
      const toDelete = Array.from(selectedRows).sort((a, b) => b - a);
      for (const idx of toDelete) {
        newData.splice(idx, 1);
      }
    } else if (typeof indexToDelete === "number") {
      newData.splice(indexToDelete, 1);
    }
    newData.forEach((r, i) => (r.s_no = i + 1));
    setEditableData(newData);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
    toast.success("Rows deleted in this session.");
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
  };

  const computeDiffs = (originalArr, currentArr) => {
    const diffs = [];
    const origByUid = new Map();
    originalArr.forEach((r, i) => origByUid.set(r.__uid, { row: r, index: i }));
    const currByUid = new Map();
    currentArr.forEach((r, i) => currByUid.set(r.__uid, { row: r, index: i }));

    for (const [uid, { row: oRow, index: oIdx }] of origByUid.entries()) {
      if (!currByUid.has(uid)) {
        diffs.push({
          action: "delete",
          uid,
          originalIndex: oIdx,
          original_data: normalizeStartupRow(oRow, oIdx + 1),
          deletedItem: oRow,
        });
      }
    }

    for (const [uid, { row: cRow, index: cIdx }] of currByUid.entries()) {
      if (!origByUid.has(uid)) {
        diffs.push({
          action: "add",
          uid,
          currentIndex: cIdx,
          meta_data: normalizeStartupRow(cRow, cIdx + 1),
          currentRow: cRow,
        });
      } else {
        const oRow = origByUid.get(uid).row;
        const normalizedOriginal = normalizeStartupRow(oRow, origByUid.get(uid).index + 1);
        const normalizedCurrent = normalizeStartupRow(cRow, cIdx + 1);
        const isEqual = deepEqualForRows(normalizedOriginal, normalizedCurrent);
        if (!isEqual) {
          diffs.push({
            action: "edit",
            uid,
            originalIndex: origByUid.get(uid).index,
            currentIndex: cIdx,
            original_data: normalizedOriginal,
            meta_data: normalizedCurrent,
          });
        }
      }
    }

    diffs.sort((a, b) => {
      const order = { delete: 0, edit: 1, add: 2 };
      return order[a.action] - order[b.action] || (a.currentIndex ?? a.originalIndex) - (b.currentIndex ?? b.originalIndex);
    });

    return diffs;
  };

  const deepEqualForRows = (a, b) => {
  const ignoreFields = ["s_no"];

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const k of keys) {
    if (ignoreFields.includes(k)) continue;

    const va = a[k];
    const vb = b[k];

    if (Array.isArray(va) && Array.isArray(vb)) {
      if (va.length !== vb.length) return false;
      for (let i = 0; i < va.length; i++) {
        if (String(va[i]) !== String(vb[i])) return false;
      }
    } else {
      if (String(va ?? "") !== String(vb ?? "")) return false;
    }
  }

  return true;
};

  const getChangesForRequest = () => {
    return computeDiffs(originalRef.current || [], editableData || []);
  };

  const buildIncubationStartupPayloads = () => {
    const changes = getChangesForRequest();
    const payloads = [];
    for (const change of changes) {
      if (change.action === "delete") {
        payloads.push({
          collectionName: "incubation",
          collection_type: "start_up",
          action: "delete",
          title: "delete in start_up",
          meta_data: change.original_data,
        });
        continue;
      }
      if (change.action === "add") {
        payloads.push({
          collectionName: "incubation",
          collection_type: "start_up",
          action: "insert",
          title: "insert in start_up",
          meta_data: change.meta_data,
        });
        continue;
      }
      if (change.action === "edit") {
        payloads.push({
          collectionName: "incubation",
          collection_type: "start_up",
          action: "update",
          title: "update in start_up",
          original_data: change.original_data,
          meta_data: change.meta_data,
        });
      }
    }
    return payloads;
  };

  const handleRequest = () => {
    const changes = getChangesForRequest();
    if (changes.length === 0) {
      toast.info("No changes to request.");
      return;
    }
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = async () => {
    const payloads = buildIncubationStartupPayloads();
    if (payloads.length === 0) {
      toast.info("No changes to submit.");
      return;
    }
    const res = await sendRequest(payloads);
    if (!res) return;
    setShowRequestModal(false);
    originalRef.current = JSON.parse(JSON.stringify(editableData));
    sessionBaseRef.current = JSON.parse(JSON.stringify(editableData));
    setIsEditing(false);
    setIsSavedOnce(false);
  };

  const handleUndoChange = (change) => {
    if (!change) return;
    if (change.action === "add") {
      setEditableData((prev) => prev.filter((r) => r.__uid !== change.uid).map((r, i) => ({ ...r, s_no: i + 1 })));
    } else if (change.action === "delete") {
      setEditableData((prev) => {
        const copy = [...prev];
        const insertAt = Math.min(Math.max(change.originalIndex, 0), copy.length);
        copy.splice(insertAt, 0, change.deletedItem);
        return copy.map((r, i) => ({ ...r, s_no: i + 1 }));
      });
    } else if (change.action === "edit") {
      setEditableData((prev) =>
        prev.map((item) =>
          item.__uid === change.uid
            ? { ...item, ...change.original_data }
            : item
        ).map((r, i) => ({ ...r, s_no: i + 1 }))
      );
    }
    toast.info("Change undone.");
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
        <div>
          <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">
            Start Up
          </p>
        </div>

        <table className={`ic-data-table ${isEditing ? "ic-data-table-edit" : ""}`}>
          <thead>
            <tr>
              <th className="ic-table-head">s no</th>
              <th className="ic-table-head">Startup Name</th>
              <th className="ic-table-head">Directors</th>
              <th className="ic-table-head">Type</th>
              <th className="ic-table-head">Date of Registration</th>
              <th className="ic-table-head">CIN</th>
              <th className="ic-table-head">Udyam Number</th>
              {isEditing && <th className="ic-table-head text-secd">Select</th>}
            </tr>
          </thead>

          <tbody>
            {editableData.map((startup, i) => (
              <tr key={startup.__uid || i}>
                <td className="ic-table-data">{i + 1}</td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1 w-full"
                      value={startup.start_up_name ?? ""}
                      onChange={(e) =>
                        handleFieldChange(i, "start_up_name", e.target.value)
                      }
                    />
                  ) : (
                    startup.start_up_name || "-"
                  )}
                </td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1 w-full"
                      value={
                        Array.isArray(startup.directors)
                          ? startup.directors.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        handleFieldChange(i, "directors", e.target.value)
                      }
                      placeholder="Comma separated"
                    />
                  ) : Array.isArray(startup.directors) &&
                    startup.directors.length > 0 ? (
                    <ul>
                      {startup.directors.map((d, di) => (
                        <li key={di}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1"
                      value={startup.type ?? ""}
                      onChange={(e) => handleFieldChange(i, "type", e.target.value)}
                    />
                  ) : (
                    startup.type || "-"
                  )}
                </td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      type="date"
                      className="border px-0 py-1"
                      value={formatToInputDate(startup.date_of_registration)}
                      onChange={(e) =>
                        handleFieldChange(
                          i,
                          "date_of_registration",
                          formatFromInputDate(e.target.value)
                        )
                      }
                    />
                  ) : (
                    startup.date_of_registration || "-"
                  )}
                </td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1"
                      value={startup.corporate_identity_number ?? ""}
                      onChange={(e) =>
                        handleFieldChange(
                          i,
                          "corporate_identity_number",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    startup.corporate_identity_number || "-"
                  )}
                </td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1"
                      value={startup.udyam_number ?? ""}
                      onChange={(e) =>
                        handleFieldChange(i, "udyam_number", e.target.value)
                      }
                    />
                  ) : (
                    startup.udyam_number || "-"
                  )}
                </td>

                {isEditing && (
                  <td className="ic-table-data text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(i)}
                      onChange={() => toggleSelectRow(i)}
                    />
                  </td>
                )}
              </tr>
            ))}
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
            <button
              className="bg-gray-500 px-3 py-2 rounded text-white"
              onClick={handleCancelSession}
            >
              Cancel
            </button>
            <button
              className="bg-secd hoverbg-brwn text-text hover:text-prim px-3 py-2 rounded-lg"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        )}

        {!isEditing && isSavedOnce && (
          <div className="flex flex-row gap-2 mr-8">
            <button
              className="bg-red-500 px-3 py-2 rounded text-prim"
              onClick={handleDiscardAll}
            >
              Discard All
            </button>
            <button
              className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 flex flex-row rounded"
              onClick={handleRequest}
              disabled={requestLoading}
            >
              <Send className="mr-2" /> Request
            </button>
          </div>
        )}
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

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
                      <td colSpan={4} className="text-center py-4">
                        No changes to submit
                      </td>
                    </tr>
                  ) : (
                    getChangesForRequest().map((change, idx) => (
                      <tr key={change.uid + "-" + idx} className="even:bg-white odd:bg-gray-50">
                        <td className="py-2 px-3 border align-top">
                          {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
                          {change.action === "add" && <span className="text-green-600">+ Added</span>}
                          {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
                        </td>

                        <td className="py-2 px-3 border align-top">Startup</td>

                        <td className="py-2 px-3 border text-[13px] align-top">
                          {change.action === "delete" ? (
                            <div>Row {change.originalIndex + 1} deleted</div>
                          ) : change.action === "add" ? (
                            <div>Row {change.currentIndex + 1} added</div>
                          ) : Object.keys(change.original_data || {}).length === 0 ? (
                            <div>Row {change.currentIndex + 1} updated</div>
                          ) : (
                            <ul className="list-disc pl-5">
                              {Object.entries(change.original_data || {})
                                .filter(() => true) 
                                .map(([field, oldVal]) => {
                                const newVal = (change.meta_data || {})[field];
                                if (String(oldVal ?? "") === String(newVal ?? "")) return null;
                                return (
                                  <li key={field}>
                                    <span className="font-semibold">{field}:</span>{" "}
                                    <span className="text-gray-600">
                                      {Array.isArray(oldVal) ? oldVal.join(", ") : String(oldVal ?? "")}
                                    </span>{" "}
                                    →{" "}
                                    <span className="text-black">
                                      {Array.isArray(newVal) ? newVal.join(", ") : String(newVal ?? "")}
                                    </span>
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
                className="px-4 py-2 rounded bg-gray-400 text-white"
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequestConfirm}
                className="px-4 py-2 rounded bg-yellow-400 text-black"
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}

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