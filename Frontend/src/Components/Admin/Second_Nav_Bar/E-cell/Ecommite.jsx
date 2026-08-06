import React, { useEffect, useRef, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import { Trash2, Send, Plus, ArrowDown, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import "./Ecommite.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function ECellCommittee({ committee }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);
  const { sendRequest, loading, error } = useAdminRequest();

  const originalRef = useRef([]);
  const savedDataRef = useRef([]);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(committee)) {
      const clone = JSON.parse(JSON.stringify(committee));
      originalRef.current = clone;
      savedDataRef.current = clone;
      setEditableData(clone);
    }
  }, [committee]);

  // Toggle row selection for multi-delete
  const toggleSelectRow = (index) => {
    const nxt = new Set(selectedRows);
    nxt.has(index) ? nxt.delete(index) : nxt.add(index);
    setSelectedRows(nxt);
  };

  // Add new member
  const handleAddMember = () => {
    const newMember = {
      _tempId: Date.now(),   // 🔑 stable key
      name: "",
      affiliation: "",
    };

    setEditableData((prev) => [...prev, newMember]);

    setSessionChanges((prev) => [
      ...prev,
      {
        tempId: newMember._tempId,
        action: "add",
        data: newMember,     // ✅ store full row
      },
    ]);
  };


  // Handle field change
  const handleFieldChange = (index, field, value) => {
    const newData = [...editableData];
    const oldVal = newData[index]?.[field];
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);

    setSessionChanges((prev) => {
      const copy = [...prev];
      const row = newData[index];

      const existingIndex = copy.findIndex(
        (c) =>
          (c.tempId && c.tempId === row._tempId) ||
          (c.index === index && c.action !== "delete")
      );

      if (existingIndex >= 0) {
        copy[existingIndex] = {
          ...copy[existingIndex],
          action: copy[existingIndex].action === "add" ? "add" : "edit",
          data: row, // ✅ ALWAYS update row snapshot
          changes: {
            ...(copy[existingIndex].changes || {}),
            [field]: { old: oldVal, new: value },
          },
        };
      } else {
        copy.push({
          index,
          action: savedDataRef.current[index] ? "edit" : "add",
          data: row,
          changes: { [field]: { old: oldVal, new: value } },
        });
      }

      return copy;
    });
  };


  // Add this function inside ECellCommittee
  const handleUndoChange = (change) => {
    let newEditableData = [...editableData];
    let newAllChanges = [...allChanges];

    if (change.action === "add") {
      // Remove newly added member
      newEditableData = newEditableData.filter((_, idx) => idx !== change.index);
    } else if (change.action === "edit") {
      // Revert edited fields
      const idx = change.index;
      newEditableData[idx] = {
        ...newEditableData[idx],
        ...Object.fromEntries(
          Object.entries(change.changes).map(([field, vals]) => [field, vals.old])
        ),
      };
    } else if (change.action === "delete") {
      // Restore deleted member
      newEditableData.splice(change.index, 0, change.deletedItem);
    }

    // Remove the undone change from allChanges
    newAllChanges = newAllChanges.filter((c) => c !== change);

    setEditableData(newEditableData);
    setAllChanges(newAllChanges);
  };


  // Save changes
  const handleSave = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    // 🚫 Block save if any required field is empty
    const hasEmptyFields = editableData.some(
      (row) =>
        !row.name?.trim() ||
        !row.affiliation?.trim()
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

    // toast.success("Changes saved successfully.");
  };


  // Cancel session
  const handleCancelSession = () => {
    setEditableData(JSON.parse(JSON.stringify(savedDataRef.current)));
    setSessionChanges([]);
    setIsEditing(false);
    // toast.info("Session changes discarded. Previous saves preserved.");
  };

  // Discard all changes
  const handleDiscardAll = () => {
    setEditableData(JSON.parse(JSON.stringify(originalRef.current)));
    savedDataRef.current = JSON.parse(JSON.stringify(originalRef.current));
    setSessionChanges([]);
    setAllChanges([]);
    setIsEditing(false);
    setIsSavedOnce(false);
    // toast.info("All changes discarded and data reset.");
  };

  // Open request modal
  const handleRequest = () => {
    if (allChanges.length === 0) {
      toast.info("No changes to request.");
      return;
    }
    setShowRequestModal(true);
  };

  // Confirm final request
  const handleFinalRequestConfirm = async () => {
    if (allChanges.length === 0) {
      toast.info("No changes to submit");
      return;
    }

    const payload = allChanges
      .map((change) => {

        /* ========== INSERT ========== */
        if (change.action === "add") {
          const row = change.data; // ✅ FIX

          if (!row?.name?.trim() || !row?.affiliation?.trim()) {
            toast.warning("Empty fields found. Cannot submit request.");
            return null;
          }

          return {
            action: "insert",
            collectionName: "ecell",
            title: "committee",
            collection_type: "committee",
            meta_data: {
              name: row.name,
              affiliation: row.affiliation,
            },
          };
        }

        /* ========== UPDATE ========== */
        /* ========== UPDATE ========== */
        if (change.action === "edit") {
          const original = originalRef.current[change.index];
          if (!original) return null;

          // Check whether anything actually changed
          const hasChanges = Object.entries(change.changes || {}).some(
            ([_, v]) => v.old !== v.new
          );

          if (!hasChanges) return null;

          // Get the complete updated member
          const updated = editableData[change.index];

          if (!updated) return null;

          return {
            action: "update",
            collectionName: "ecell",
            title: "committee",
            collection_type: "committee",

            original_data: {
              name: original.name,
              affiliation: original.affiliation,
            },

            meta_data: {
              name: updated.name,
              affiliation: updated.affiliation,
            },
          };
        }

        /* ========== DELETE ========== */
        if (change.action === "delete") {
          const member = change.deletedItem;
          if (!member) return null;

          return {
            action: "delete",
            collectionName: "ecell",
            title: "coolie",
            collection_type: "committee",
            meta_data: {
              name: member.name,
              affiliation: member.affiliation,
            },
          };
        }

        return null;
      })
      .filter(Boolean);

    if (payload.length === 0) {
      toast.info("No valid changes to submit");
      return;
    }

    console.log("FINAL PAYLOAD:", payload);

    try {
      await sendRequest(payload);

      // toast.success("Request sent for admin approval");

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






  // Open delete multiple modal
  const openDeleteMultiple = () => {
    if (selectedRows.size === 0) {
      toast.info("No members selected for delete");
      return;
    }
    setIndexToDelete("multiple");
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    let newData = [...editableData];
    let newChanges = [...sessionChanges];

    const handleDelete = (idx) => {
      // ❌ Remove ANY previous changes (add/edit) for this index
      newChanges = newChanges.filter((c) => c.index !== idx);

      // ✅ If original data exists, record delete
      if (savedDataRef.current[idx]) {
        newChanges.push({
          index: idx,
          action: "delete",
          deletedItem: newData[idx],
        });
      }

      // Remove row from UI
      newData.splice(idx, 1);
    };

    if (indexToDelete === "multiple") {
      [...selectedRows].sort((a, b) => b - a).forEach(handleDelete);
    }

    setEditableData(newData);
    setSessionChanges(newChanges);
    setSelectedRows(new Set());
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);

    toast.success("Member deleted.");
  };



  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIndexToDelete(null);
  };

  if (!Array.isArray(committee))
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%]">
        <LoadComp />
      </div>
    );

  return (
    <>
      <div className="p-8">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="title-h3">COMMITTEE MEMBERS</h1>
          {!isEditing && (
            <button
              className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black hover:bg-[#800000] hover:!text-white transition duration-200"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="mr-2" /> Edit
            </button>
          )}
        </div>

        {/* Member cards */}
        <div className="ecell-members-grid">
          {editableData.map((member, i) => (
            <div
              key={member.id || i}
              className="faculty-card dark:bg-text relative p-4"
            >
              {isEditing && (
                <input
                  type="checkbox"
                  className="absolute top-2 right-2 w-4 h-4"
                  checked={selectedRows.has(i)}
                  onChange={() => toggleSelectRow(i)}
                />
              )}
              {isEditing ? (
                <>
                  <input
                    value={member.name}
                    placeholder="Enter name"
                    className="w-full mb-2 border rounded p-1"
                    onChange={(e) =>
                      handleFieldChange(i, "name", e.target.value)
                    }
                  />
                  <textarea
                    value={member.affiliation}
                    placeholder="Enter affiliation"
                    className="w-full border rounded p-1"
                    onChange={(e) =>
                      handleFieldChange(i, "affiliation", e.target.value)
                    }
                  />
                </>
              ) : (
                <div className="ncc-n-stu-detail text-[16px] text-left">
                  <h5 className="text-center">{member.name}</h5>
                  <p className="pl-4 text-brwn dark:text-drka text-sm">
                    {member.affiliation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Add new member card */}
          {isEditing && (
            <button
              className="bg-gray-200 text-text px-3 py-2 rounded h-48 w-64 border-dashed border-2 border-gray-500 flex items-center justify-center"
              onClick={handleAddMember}
            >
              <Plus /> Add Member
            </button>
          )}
        </div>

        {/* Delete button row */}
        {isEditing && (
          <div className="mt-4 flex gap-2">
            {selectedRows.size > 0 && (
              <button
                className="bg-red-600 text-white px-3 py-2 rounded flex m-auto items-center gap-2"
                onClick={openDeleteMultiple}
              >
                <Trash2 /> Delete Selected
              </button>
            )}
          </div>
        )}

        {/* Save / Cancel / Request / Discard buttons */}
        <div className="py-4 mt-4 flex justify-end gap-4">
          {isEditing && (
            <>
              <button
                className="bg-gray-400 hover:bg-gray-600 px-3 py-2 rounded text-white transition duration-200"
                onClick={handleCancelSession}
              >
                Cancel
              </button>
              {sessionChanges.length > 0 && (
                <button
                  className="bg-[#fdcc03] hover:bg-[#800000] text-black hover:!text-white px-3 py-2 rounded-lg transition duration-200"
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
                className="bg-gray-400 hover:bg-gray-600 px-3 py-2 rounded text-white transition duration-200"
                onClick={handleDiscardAll}
              >
                Discard All
              </button>
              <button
                className="bg-[#fdcc03] text-black px-3 py-2 flex flex-row rounded hover:bg-[#800000] hover:!text-white transition duration-200"
                onClick={handleRequest}
              >
                <Send /> Request
              </button>
            </>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-drkt text-center">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>


            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border">Action</th>
                  <th className="py-2 px-3 border">Section</th>
                  <th className="py-2 px-3 border">Changed Field</th>
                  <th className="py-2 px-3 border">Undo</th>
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
                      <td className="py-2 px-3 border text-center">
                        {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
                        {change.action === "add" && <span className="text-green-600">+ Added</span>}
                        {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
                      </td>
                      <td className="py-2 px-3 border text-center">Committee</td>
                      <td className="py-2 px-3 border text-[13px]">
                        {change.action === "delete"
                          ? "Member deleted"
                          : Object.keys(change.changes || {}).length === 0
                            ? "Added entire member"
                            : Object.entries(change.changes)
                              .filter(([_, vals]) => vals.old !== vals.new)
                              .map(([field]) => field)
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

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-600 text-white transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequestConfirm}
                className="px-4 py-2 rounded bg-[#fdcc03] text-black hover:bg-[#800000] hover:!text-white transition duration-200"
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
            <p className="text-sm mb-4">
              Are you sure you want to delete?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-600 text-white transition duration-200"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={confirmDelete}
              >
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
