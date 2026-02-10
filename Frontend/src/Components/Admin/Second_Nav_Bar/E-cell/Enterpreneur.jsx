import { useState, useEffect, useRef } from "react";
import "./Enterpreneur.css";
import LoadComp from "../../LoadComp";
import { FaUserEdit } from "react-icons/fa";
import { Edit, Save, Send, Plus, Trash2, ArrowDown, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function EnterpreN({ enterpreneur }) {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false); // at least one save
  const [editableData, setEditableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);

  const originalRef = useRef([]);
  const savedDataRef = useRef([]);

  const totalItems = enterpreneur?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const { sendRequest, loading, error } = useAdminRequest();
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  // init
  useEffect(() => {
    if (Array.isArray(enterpreneur)) {
      const clone = JSON.parse(JSON.stringify(enterpreneur));
      originalRef.current = clone;
      savedDataRef.current = clone;
      setEditableData(clone);
    }
  }, [enterpreneur]);

  // Toggle select
  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    if (nxt.has(index)) nxt.delete(index);
    else nxt.add(index);
    setSelectedRows(nxt);
  };

  const handleUndoChange = (change) => {
  let newEditableData = [...editableData];
  let newAllChanges = [...allChanges];

  if (change.action === "add") {
    // Remove newly added row
    newEditableData = newEditableData.filter((_, idx) => idx !== change.index);
  } else if (change.action === "delete") {
    // Restore deleted row
    newEditableData.splice(change.index, 0, change.deletedItem);
  } else if (change.action === "edit") {
    // Revert edited fields
    const oldRow = { ...newEditableData[change.index] };
    for (const field in change.changes) {
      oldRow[field] = change.changes[field].old;
    }
    newEditableData[change.index] = oldRow;
  }

  // Remove undone change from allChanges
  newAllChanges = newAllChanges.filter((c) => c !== change);

  setEditableData(newEditableData);
  setAllChanges(newAllChanges);
};


  // Add row
const handleAddRow = () => {
  const newRow = {
    _tempId: Date.now(),   // 🔑 unique id
    name: "",
    year: "",
    business_name: "",
  };

  setEditableData((p) => [...p, newRow]);

  setSessionChanges((p) => [
    ...p,
    {
      tempId: newRow._tempId,
      action: "add",
      data: newRow,       // ✅ STORE FULL DATA
      changes: {},
    },
  ]);

  setIsEditing(true);
};


  // Field change
  const handleFieldChange = (index, field, value) => {
    const newData = [...editableData];
    const oldVal = newData[index]?.[field];
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);

setSessionChanges((prev) => {
  const cp = [...prev];
  const row = newData[index];

  const existingIndex = cp.findIndex(
    (c) =>
      (c.tempId && c.tempId === row._tempId) ||
      (c.index === index && c.action !== "delete")
  );

  if (existingIndex >= 0) {
    cp[existingIndex] = {
      ...cp[existingIndex],
      action: cp[existingIndex].action === "add" ? "add" : "edit",
      data: row, // ✅ keep updated snapshot
      changes: {
        ...(cp[existingIndex].changes || {}),
        [field]: { old: oldVal, new: value },
      },
    };
  } else {
    cp.push({
      index,
      action: savedDataRef.current[index] ? "edit" : "add",
      data: row,
      changes: { [field]: { old: oldVal, new: value } },
    });
  }

  return cp;
});

  };

  // Save session
const handleSave = () => {
  if (sessionChanges.length === 0) {
    toast.info("No changes to save.");
    return;
  }

  // 🚫 Block save if any required field is empty
  const hasEmptyFields = editableData.some(
    (row) =>
      !row.name?.trim() ||
      !row.year?.trim() ||
      !row.business_name?.trim()
  );

  if (hasEmptyFields) {
    toast.warning("Please fill all fields before saving.");
    return; // ⛔ STOP SAVE
  }

  // ✅ Save allowed
  savedDataRef.current = JSON.parse(JSON.stringify(editableData));
  setAllChanges((prev) => [...prev, ...sessionChanges]);
  setSessionChanges([]);
  setIsEditing(false);
  setIsSavedOnce(true);

  toast.success("Changes saved successfully.");
};


  // Cancel session
  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    toast.info("Session changes discarded. Previous saves preserved.");
  };

  // Discard all
  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    toast.info("All changes discarded and data reset.");
  };

  // Request
  const handleRequest = () => {
    if (allChanges.length === 0) {
      toast.info("No changes to request.");
      return;
    }
    setShowRequestModal(true);
  };

const handleFinalRequestConfirm = async () => {
  if (allChanges.length === 0) {
    toast.info("No changes to submit");
    return;
  }

  const payload = allChanges
    .map((change) => {

      /* ========== INSERT ========== */
      if (change.action === "add") {
        const row = change.data;
        if (!row) return null;

        if (!row.name || !row.year || !row.business_name) {
          toast.warning("Empty fields found. Cannot submit.");
          return null;
        }

        return {
          action: "insert",
          collectionName: "ecell",
          title: "Entrepreneur Insert",
          collection_type: "enterpreneur",
          meta_data: {
            name: row.name,
            business_name: row.business_name,
            year: row.year,
          },
        };
      }

      /* ========== UPDATE ========== */
      if (change.action === "edit") {
        const original = originalRef.current[change.index];
        if (!original) return null;

        const updatedFields = {};
        Object.entries(change.changes || {}).forEach(([k, v]) => {
          if (v.old !== v.new) updatedFields[k] = v.new;
        });

        if (!Object.keys(updatedFields).length) return null;

        return {
          action: "update",
          collectionName: "ecell",
          title: "Entrepreneur Update",
          collection_type: "enterpreneur",
          original_data: {
            name: original.name,
            business_name: original.business_name,
            year: original.year,
          },
          meta_data: updatedFields,
        };
      }

      /* ========== DELETE ========== */
      if (change.action === "delete") {
        const member = change.deletedItem;
        if (!member) return null;

        return {
          action: "delete",
          collectionName: "ecell",
          title: "Entrepreneur Delete",
          collection_type: "enterpreneur",
          meta_data: {
            name: member.name,
            business_name: member.business_name,
            year: member.year,
          },
        };
      }

      return null;
    })
    .filter(Boolean);

  if (!payload.length) {
    toast.info("No valid changes to submit");
    return;
  }

  try {
    await sendRequest(payload);
    toast.success("Request sent for admin approval");

    setShowRequestModal(false);
    setAllChanges([]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);

    originalRef.current = structuredClone(editableData);
    savedDataRef.current = structuredClone(editableData);
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit request");
  }
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

  const deleteRow = (idx) => {
    // ❌ Remove ALL previous changes for this row (add/edit)
    newChanges = newChanges.filter((c) => c.index !== idx);

    // ✅ If row existed originally, track delete
    if (savedDataRef.current[idx]) {
      newChanges.push({
        index: idx,
        action: "delete",
        deletedItem: newData[idx],
      });
    }

    // Remove from UI
    newData.splice(idx, 1);
  };

  if (indexToDelete === "multiple") {
    [...selectedRows].sort((a, b) => b - a).forEach(deleteRow);
  } else if (typeof indexToDelete === "number") {
    deleteRow(indexToDelete);
  }

  setEditableData(newData);
  setSessionChanges(newChanges);
  setSelectedRows(new Set());
  setDeleteConfirmOpen(false);
  setIndexToDelete(null);

  toast.success("Row deleted.");
};



  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
  };

  if (!Array.isArray(enterpreneur)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      {/* Top-level Edit */}
      {!isEditing && (
        <div className="flex justify-end pr-8 mt-10">
          <button
            className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black hover:bg-yellow-400"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        </div>
      )}

      <div className="overflow-x-auto m-4">
        <table className="styled-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name of the Student</th>
              <th className="w-[300px]">Batch</th>
              <th>Name of the Company</th>
              {isEditing && <th>Select</th>}
            </tr>
          </thead>
          <tbody>
            {editableData?.slice(startIndex, endIndex).map((data, idx) => (
              <tr key={startIndex + idx}>
                <td>{startIndex + idx + 1}</td>
                <td>
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={data?.name || ""}
                      onChange={(e) =>
                        handleFieldChange(startIndex + idx, "name", e.target.value)
                      }
                    />
                  ) : (
                    data?.name || "-"
                  )}
                </td>
                <td className="text-center">
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={data?.year || ""}
                      onChange={(e) =>
                        handleFieldChange(startIndex + idx, "year", e.target.value)
                      }
                    />
                  ) : (
                    data?.year || "-"
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={data?.business_name || ""}
                      onChange={(e) =>
                        handleFieldChange(startIndex + idx, "business_name", e.target.value)
                      }
                    />
                  ) : (
                    data?.business_name || "-"
                  )}
                </td>
                {isEditing && (
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(startIndex + idx)}
                      onChange={() => toggleSelectRow(startIndex + idx)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Delete */}
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 my-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded ${
            currentPage === 0 ? "bg-gray-300 cursor-not-allowed" : "px-4 py-2 rounded bg-secd hover:bg-brwn text-text hover:text-prim"
          }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "px-4 py-2 rounded bg-secd hover:bg-brwn text-text hover:text-prim"
          }`}
        >
          Next
        </button>
      </div>

      {/* Bottom action buttons */}
      <div className="py-4 mt-4 flex justify-end gap-4">
          <div className="flex flex-row gap-2 mr-8">
            {isEditing && ( 
              <button
              className="flex items-center bg-gray-500 px-3 py-2 rounded text-white"
              onClick={handleCancelSession}
              >
              Cancel
            </button>
              )}
              {isEditing && sessionChanges.length > 0 && (
            <button
              className="bg-secd hoverbg-brwn text-text hover:text-prim px-3 py-2 rounded-lg"
              onClick={handleSave}
            >
              Save
            </button>
        )}
          </div>

        {!isEditing && isSavedOnce && (
          <div className="flex flex-row gap-2 mr-8">
            <button
              className="bg-red-500 px-3 py-2 rounded text-white"
              onClick={handleDiscardAll}
            >
              Discard All
            </button>
            <button
              className="bg-secd text-text px-3 py-2 flex flex-row rounded hover:bg-brwn hover:text-prim "
              onClick={handleRequest}
            >
              <Send className="mr-2" /> Request
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
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
                  <th className="py-2 px-3 border">Undo</th> {/* new column */}
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
        <td className="py-2 px-3 border align-top text-center">
          {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
          {change.action === "add" && <span className="text-green-600">+ Added</span>}
          {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
        </td>
        <td className="py-2 px-3 border align-top text-center">Entrepreneur</td>
        <td className="py-2 px-3 border text-[13px]">
          {change.action === "delete"
            ? `Row ${change.index + 1} deleted`
            : Object.keys(change.changes || {}).length === 0
            ? "Added/changed entire row"
            : Object.entries(change.changes)
                .filter(([_, val]) => val.old !== val.new)
                .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1))
                .join(", ")}
        </td>
        <td className="py-2 px-3 border text-center">
          <button
            className="text-red-500 font-bold"
            onClick={() => handleUndoChange(change)}
          >
            X
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
                className="px-4 py-2 rounded bg-secd hoverbg-brwn text-text hover:text-prim  "
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]">
          <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm mb-4">
              {indexToDelete === "multiple"
                ? "Are you sure you want to delete selected rows?"
                : "Are you sure you want to delete this row?"}
            </p>
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
