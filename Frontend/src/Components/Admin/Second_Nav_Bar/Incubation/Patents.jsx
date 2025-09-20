import React, { useEffect, useRef, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import LoadComp from "../../LoadComp";
import { Send, Save, Plus, Trash2, ArrowDown, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Patents({ data }) {
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
  const savedDataRef = useRef([]);


  // Convert dd.mm.yyyy -> yyyy-mm-dd (for input)
// 🔹 Convert various formats -> yyyy-mm-dd (for <input type="date">)
const formatToInputDate = (dateStr) => {
  if (!dateStr) return "";
  const s = String(dateStr).trim();

  // Already in yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // dd.mm.yyyy -> yyyy-mm-dd
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
    const [day, month, year] = s.split(".");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Try Date parse (handles ISO with time etc.)
  const parsed = new Date(s);
  if (!isNaN(parsed)) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
};

// 🔹 Convert yyyy-mm-dd -> dd.mm.yyyy (used when user edits)
const formatFromInputDate = (dateStr) => {
  if (!dateStr) return "";
  const s = String(dateStr).trim();
  // handle yyyy-mm-dd (or yyyy-mm-ddTHH:MM:SS)
  const datePart = s.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
  }
  // fallback: try parse
  const parsed = new Date(s);
  if (!isNaN(parsed)) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${d}.${m}.${y}`;
  }
  return "";
};


useEffect(() => {
  if (Array.isArray(data)) {
    const clone = data.map((row) => ({ ...row, id: Date.now() + Math.random() }));
    originalRef.current = clone;
    savedDataRef.current = clone;
    setEditableData(clone);
  }
}, [data]);

  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

const handleAddRow = () => {
  const newRow = {
    id: Date.now(), // unique id
    Sl_No: editableData.length + 1,
    Patent_Application_No: "",
    Status_of_Patent: "",
    Inventor_Name: [],
    Title_of_the_Patent: "",
    Applicant_Name: "",
    Patent_Filed_Date: "",
  };
  setEditableData((p) => [...p, newRow]);
  setSessionChanges((p) => [
    ...p,
    { id: newRow.id, index: editableData.length, action: "add", changes: {} },
  ]);
};

  // Get all changes for the request modal
const getChangedPatents = () => {
  const changes = [];

  editableData.forEach((row, idx) => {
    const saved = savedDataRef.current[idx];

    if (!saved) {
      // New row added
      changes.push({ type: "Added", index: idx, row, fields: [] });
    } else {
      const editedFields = [];
      Object.keys(row).forEach((field) => {
        if (JSON.stringify(row[field]) !== JSON.stringify(saved[field])) {
          editedFields.push(field);
        }
      });
      if (editedFields.length > 0) {
        changes.push({ type: "Edited", index: idx, row, fields: editedFields });
      }
    }
  });

  // Include deleted rows
  sessionChanges
    .filter((c) => c.action === "delete")
    .forEach((c) => changes.push({ type: "Deleted", index: c.index, row: c.deletedItem, fields: [] }));

  return changes;
};


const handleFieldChange = (index, field, value) => {
  const newData = [...editableData];
  const oldVal = newData[index]?.[field];

  if (field === "Inventor_Name" && typeof value === "string") {
    value = value.split(",").map((d) => d.trim()).filter(Boolean);
  }

  newData[index] = { ...newData[index], [field]: value };
  setEditableData(newData);

  setSessionChanges((prev) => {
    const cp = [...prev];
    const rowId = newData[index].id;
    const existingIndex = cp.findIndex((c) => c.id === rowId && c.action !== "delete");

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
        id: rowId,
        index,
        action: savedDataRef.current[index] ? "edit" : "add",
        changes: { [field]: { old: oldVal, new: value } },
      });
    }
    return cp;
  });
};


// Inside handleUndoChange
const handleUndoChange = (change) => {
  const newEditable = [...editableData];
  const newSessionChanges = [...sessionChanges];

  if (change.type === "Added") {
    const rowIndex = newEditable.findIndex((r) => r.id === change.id);
    if (rowIndex >= 0) newEditable.splice(rowIndex, 1);
  } else if (change.type === "Edited") {
    const savedRow = savedDataRef.current.find((r) => r.id === change.id);
    const rowIndex = newEditable.findIndex((r) => r.id === change.id);
    if (savedRow && rowIndex >= 0) {
      newEditable[rowIndex] = JSON.parse(JSON.stringify(savedRow));
    }
  } else if (change.type === "Deleted") {
    // Restore deleted row at the original index
    if (typeof change.index === "number" && change.row) {
      newEditable.splice(change.index, 0, change.row);
    }
  }

  setEditableData(newEditable);

  // Remove from sessionChanges and allChanges
  setSessionChanges(newSessionChanges.filter((c) => c.id !== change.id));
  setAllChanges(allChanges.filter((c) => c.id !== change.id));
};



const handleSave = () => {
  if (sessionChanges.length === 0) {
    toast.info("No changes to save.");
    return;
  }

  // Ensure all changes have id
  const changesWithId = sessionChanges.map((c) => ({
    ...c,
    id: c.id || (editableData[c.index]?.id ?? Date.now() + Math.random()),
  }));

  savedDataRef.current = JSON.parse(JSON.stringify(editableData));
  setAllChanges((p) => [...p, ...changesWithId]);
  setSessionChanges([]);
  setIsEditing(false);
  setIsSavedOnce(true);
  toast.success("Changes saved. Now you can Request or Edit again.");
};


  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    toast.info("Session changes discarded. Previous saves preserved.");
  };

  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    toast.info("All changes discarded and data reset.");
  };

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
    }

    newData.forEach((r, i) => (r.Sl_No = i + 1));
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
      {/* Top toolbar */}
      {!isEditing && (
        <div className="flex justify-end pr-8 mt-10">
          <button
            className="flex items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        </div>
      )}

      <div className="ic-table-container m-4">
        <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Patents</p>

        <table className="ic-data-table">
          <thead>
            <tr>
              <th className="ic-table-head">SL No</th>
              <th className="ic-table-head">Patent Application No</th>
              <th className="ic-table-head">Status of Patent</th>
              <th className="ic-table-head">Inventor's Name</th>
              <th className="ic-table-head">Title</th>
              <th className="ic-table-head">Applicant Name</th>
              <th className="ic-table-head">Published Date</th>
              {isEditing && <th className="ic-table-head">Select</th>}
            </tr>
          </thead>
          <tbody>
            {editableData.map((row, i) => (
              <tr key={i}>
                <td className="ic-table-data">{row.Sl_No ?? i + 1}</td>
                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={row.Patent_Application_No ?? ""}
                      onChange={(e) => handleFieldChange(i, "Patent_Application_No", e.target.value)}
                    />
                  ) : row.Patent_Application_No || "-"}
                </td>
                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={row.Status_of_Patent ?? ""}
                      onChange={(e) => handleFieldChange(i, "Status_of_Patent", e.target.value)}
                    />
                  ) : row.Status_of_Patent || "-"}
                </td>
                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={Array.isArray(row.Inventor_Name) ? row.Inventor_Name.join(", ") : ""}
                      onChange={(e) => handleFieldChange(i, "Inventor_Name", e.target.value)}
                    />
                  ) : Array.isArray(row.Inventor_Name) && row.Inventor_Name.length ? (
                    <ul>{row.Inventor_Name.map((name, idx) => <li key={idx}>{name}</li>)}</ul>
                  ) : "-"}
                </td>
                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={row.Title_of_the_Patent ?? ""}
                      onChange={(e) => handleFieldChange(i, "Title_of_the_Patent", e.target.value)}
                    />
                  ) : row.Title_of_the_Patent || "-"}
                </td>
                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={row.Applicant_Name ?? ""}
                      onChange={(e) => handleFieldChange(i, "Applicant_Name", e.target.value)}
                    />
                  ) : row.Applicant_Name || "-"}
                </td>
                <td className="ic-table-data">
                  {isEditing ? (
                    <input
                      type="date"
                      className="border px-2 py-1 w-full"
                      value={formatToInputDate(row.Patent_Filed_Date) }
                      onChange={(e) => handleFieldChange(i, "Patent_Filed_Date", formatFromInputDate(e.target.value))}
                    />
                  ) : row.Patent_Filed_Date || "-"}
                </td>
                {isEditing && (
                  <td className="ic-table-data text-center ">
                    <input type="checkbox" checked={selectedRows.has(i)} onChange={() => toggleSelectRow(i)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isEditing && (
          <div className="flex justify-center gap-4 py-3">
            <button onClick={handleAddRow} className="flex items-center gap-2 px-4 py-2 bg-secd rounded text-text">
              <Plus /> Add New Row
            </button>
            {selectedRows.size > 0 && (
              <button onClick={openDeleteMultiple} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded">
                <Trash2 /> Delete Selected
              </button>
            )}
          </div>
        )}
      </div>

      <div className="py-4 mt-4 flex justify-end gap-4">
        {isEditing && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-gray-500 px-3 py-2 rounded text-white" onClick={handleCancelSession}>
              Cancel
            </button>
            {sessionChanges.length > 0 && (
              <button className="bg-secd hoverbg-brwn text-text hover:text-prim px-3 py-2 rounded-lg" onClick={handleSave}>
                Save
              </button>
            )}
          </div>
        )}

        {!isEditing && isSavedOnce && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-red-500 px-3 py-2 rounded text-white" onClick={handleDiscardAll}>
              Discard All
            </button>
            <button className="bg-secd text-text px-3 py-2 flex flex-row rounded  hover:bg-brwn hover:text-prim " onClick={handleRequest}>
              <Send className="mr-2" /> Request
            </button>
          </div>
        )}
      </div>

      {/* Final Request Modal */}
 {/* Final Request Modal */}
{showRequestModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
    <div className="bg-white p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Request</h2>
      <p className="text-sm text-red-500 mb-4 text-center">
        Note: Your changes will stay pending until approved by the superior admin.
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
          {allChanges.map((c, idx) => (
  <tr key={c.id || idx} className="even:bg-white odd:bg-gray-50">
    <td className="py-2 px-3 border text-blue-600">
      {c.action === "edit" ? "Edited" : c.action === "add" ? "Added" : "Deleted"}
    </td>
    <td className="py-2 px-3 border">{c.index + 1}</td>
    <td className="py-2 px-3 border text-[13px]">
      {c.action === "edit"
        ? Object.keys(c.changes).join(", ")
        : c.action === "add"
        ? "New row added"
        : "Row deleted"}
    </td>
    <td className="py-2 px-3 border text-center">
     <button
  className="text-red-500"
  onClick={() => handleUndoChange({
    type: c.action === "edit" ? "Edited" : c.action === "add" ? "Added" : "Deleted",
    id: c.id || c.row?.id,
    index: c.index,
    row: c.row
  })}
>
  X
</button>

    </td>
  </tr>
))}

        </tbody>
      </table>

      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-400 text-white"
          onClick={() => setShowRequestModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded bg-secd text-text"
          onClick={handleFinalRequestConfirm}
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
