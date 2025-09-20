import React, { useEffect, useRef, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import LoadComp from "../../LoadComp";
import { Send, Save, Plus, Trash2, ArrowDown, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Startup({ data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false); // at least one save happened
  const [editableData, setEditableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set()); // multi-delete
  const [sessionChanges, setSessionChanges] = useState([]); // changes of current edit session
  const [allChanges, setAllChanges] = useState([]); // accumulated saved changes
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null); // number | "multiple"

  const originalRef = useRef([]); // full untouched original data
  const savedDataRef = useRef([]); // last committed (saved) data snapshot



// 🔹 Convert dd.mm.yyyy -> yyyy-mm-dd
  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split(".");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // 🔹 Convert yyyy-mm-dd -> dd.mm.yyyy
  const formatFromInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  };

  // init
  useEffect(() => {
    if (Array.isArray(data)) {
      const clone = JSON.parse(JSON.stringify(data));
      originalRef.current = clone;
      savedDataRef.current = clone;
      setEditableData(clone);
    }
  }, [data]);

  // Toggle row selection
  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

  

  // Add a new row
  const handleAddRow = () => {
    const newRow = {
      s_no: editableData.length + 1,
      start_up_name: "",
      directors: [],
      type: "",
      date_of_registration: "",
      corporate_identity_number: "",
      udyam_number: "",
    };
    setEditableData((p) => [...p, newRow]);
    setSessionChanges((p) => [
      ...p,
      { index: editableData.length, action: "add", changes: {} },
    ]);
  };

  // Field change
  const handleFieldChange = (index, field, value) => {
    const newData = [...editableData];
    const oldVal = newData[index]?.[field];

    if (field === "directors" && typeof value === "string") {
      value = value
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    }

    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);

    // Track changes in current session
    setSessionChanges((prev) => {
      const cp = [...prev];
      const existingIndex = cp.findIndex((c) => c.index === index && c.action !== "delete");
      if (existingIndex >= 0) {
        cp[existingIndex] = {
          ...cp[existingIndex],
          action: cp[existingIndex].action === "add" ? "add" : "edit",
          changes: {
            ...cp[existingIndex].changes,
            [field]: { old: oldVal, new: value },
          },
        };
      } else {
        cp.push({
          index,
          action: savedDataRef.current[index] ? "edit" : "add",
          changes: { [field]: { old: oldVal, new: value } },
        });
      }
      return cp;
    });
  };

  

  // Save current session
  const handleSave = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    savedDataRef.current = JSON.parse(JSON.stringify(editableData));
    setAllChanges((p) => [...p, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
    toast.success("Changes saved. Now you can Request or Edit again.");
  };

  // Cancel current session only
  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    toast.info("Session changes discarded. Previous saves preserved.");
  };

  // Discard all changes (full reset)
  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    toast.info("All changes discarded and data reset.");
  };

  const handleUndoChange = (change) => {
  if (change.action === "add") {
    // Remove the newly added row from editableData
    setEditableData((prev) => prev.filter((_, idx) => idx !== change.index));
  } 
  else if (change.action === "delete") {
    // Restore the deleted row back at the same index
    setEditableData((prev) => {
      const newList = [...prev];
      newList.splice(change.index, 0, change.deletedItem);
      return newList.map((r, i) => ({ ...r, s_no: i + 1 })); // re-number
    });
  } 
  else if (change.action === "edit") {
    // Revert edited fields back to old values
    setEditableData((prev) =>
      prev.map((item, idx) =>
        idx === change.index
          ? {
              ...item,
              ...Object.fromEntries(
                Object.entries(change.changes).map(([field, values]) => [
                  field,
                  values.old,
                ])
              ),
            }
          : item
      )
    );
  }

  // Remove this change from the final popup list
  setAllChanges((prev) =>
    prev.filter((c, i) => !(c.index === change.index && c.action === change.action))
  );
};


  // Request confirm
  const handleRequest = () => {
    if (allChanges.length === 0) {
      toast.info("No changes to request.");
      return;
    }
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    console.log("FINAL REQUEST SUBMITTED:", { allChanges, editableData });
    toast.success("Final request submitted");
    setShowRequestModal(false);
    setAllChanges([]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    originalRef.current = JSON.parse(JSON.stringify(editableData));
    savedDataRef.current = JSON.parse(JSON.stringify(editableData));
  };

  // Delete flow
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
        newChanges.push({ index: idx, action: "delete", deletedItem: newData[idx] });
        newData.splice(idx, 1);
      }
    } else if (typeof indexToDelete === "number") {
      const idx = indexToDelete;
      newChanges.push({ index: idx, action: "delete", deletedItem: newData[idx] });
      newData.splice(idx, 1);
    }

    newData.forEach((r, i) => (r.s_no = i + 1));
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
      {/* Top-level Edit button */}
    {/* Top-level Edit button */}
            {!isEditing && (
              <div className="flex justify-end pr-8 mt-10">
                {!isSavedOnce ? (
                  <button
                    className="flex items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim "
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="mr-2" /> Edit
                  </button>
                ) : (
                  <button
                    className="flex items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim "
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="mr-2" /> Edit
                  </button>
                )}
              </div>
            )}


      <div className="ic-table-container m-4">
        <div>
          <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Start Up</p>
        </div>

        <table className="ic-data-table">
          <thead>
            <tr>
              <th className="ic-table-head">SL No</th>
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
              <tr key={i}>
                <td className="ic-table-data">{startup.s_no ?? i + 1}</td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1 w-full"
                      value={startup.start_up_name ?? ""}
                      onChange={(e) => handleFieldChange(i, "start_up_name", e.target.value)}
                    />
                  ) : (
                    startup.start_up_name || "-"
                  )}
                </td>

                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-0 py-1 w-full"
                      value={Array.isArray(startup.directors) ? startup.directors.join(", ") : ""}
                      onChange={(e) => handleFieldChange(i, "directors", e.target.value)}
                      placeholder="Comma separated"
                    />
                  ) : Array.isArray(startup.directors) && startup.directors.length > 0 ? (
                    <ul>{startup.directors.map((d, di) => <li key={di}>{d}</li>)}</ul>
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
                     value={ formatToInputDate(startup.date_of_registration)}
                      onChange={(e) => handleFieldChange(i, "date_of_registration", formatFromInputDate(e.target.value))}
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
                      onChange={(e) => handleFieldChange(i, "corporate_identity_number", e.target.value)}
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
                      onChange={(e) => handleFieldChange(i, "udyam_number", e.target.value)}
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

              {/* Show Delete Selected only if some row is checked */}
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

      {/* Bottom action buttons */}
      <div className="py-4 mt-4 flex justify-end gap-4">
        {isEditing && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-gray-500 px-3 py-2 rounded text-white" onClick={handleCancelSession}>
              Cancel
            </button>
            {sessionChanges.length > 0 && (
              <button className="bg-secd hoverbg-brwn text-text hover:text-prim  px-3 py-2 rounded-lg" onClick={handleSave}>
                Save
              </button>
            )}
          </div>
        )}

      {!isEditing && isSavedOnce && (
  <div className="flex flex-row gap-2 mr-8">
    {/* Removed Edit Again button here */}
    <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>
      Discard All
    </button>
    <button className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 flex flex-row rounded " onClick={handleRequest}>
      <Send className="mr-2" /> Request
    </button>
  </div>
)}
      </div>

      {/* Final Request Modal */}
 {/* Final Request Modal */}
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
            {allChanges.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No changes to submit
                </td>
              </tr>
            ) : (
              allChanges.map((change, idx) => (
                <tr key={idx} className="even:bg-white odd:bg-gray-50">
                  <td className="py-2 px-3 border align-top">
                    {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
                    {change.action === "add" && <span className="text-green-600">+ Added</span>}
                    {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
                  </td>
                  <td className="py-2 px-3 border align-top">Startup</td>
                  <td className="py-2 px-3 border text-[13px]">
                    {change.action === "delete" ? (
                      <div>Row {change.index + 1} deleted</div>
                    ) : Object.keys(change.changes || {}).length === 0 ? (
                      <div>Added/changed entire row</div>
                    ) : (
                      Object.entries(change.changes).map(([field, values]) => (
                        <div key={field} className="mb-1">
                          <p className="capitalize">{field}</p>{" "}
                         
                         
                        </div>
                      ))
                    )}
                  </td>
                  <td className="py-2 px-3 border text-center">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleUndoChange(change)}
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
        >
          Cancel
        </button>
        <button
          onClick={handleFinalRequestConfirm}
          className="px-4 py-2 rounded bg-yellow-400 text-black"
        >
          Final Request
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
