import React, { useEffect, useRef, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import LoadComp from "../../LoadComp";
import { Send, Plus, Trash2, ArrowDown, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Committe({ data }) {
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

  useEffect(() => {
    if (Array.isArray(data)) {
      const clone = JSON.parse(JSON.stringify(data));
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

  const handleAddMember = () => {
    const newMember = { id: Date.now(), name: "", Designation: "", position: "" };
    setEditableData((prev) => [...prev, newMember]);
    setSessionChanges((prev) => [...prev, { index: editableData.length, action: "add", changes: {} }]);
  };

  const handleFieldChange = (index, field, value) => {
    const newData = [...editableData];
    const oldVal = newData[index]?.[field];
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);

    setSessionChanges((prev) => {
      const copy = [...prev];
      const existingIndex = copy.findIndex((c) => c.index === index && c.action !== "delete");
      if (existingIndex >= 0) {
        copy[existingIndex] = {
          ...copy[existingIndex],
          action: copy[existingIndex].action === "add" ? "add" : "edit",
          changes: { ...copy[existingIndex].changes, [field]: { old: oldVal, new: value } },
        };
      } else {
        copy.push({ index, action: savedDataRef.current[index] ? "edit" : "add", changes: { [field]: { old: oldVal, new: value } } });
      }
      return copy;
    });
  };

  const handleUndoChange = (change) => {
  if (change.action === "add") {
    // remove the newly added member
    setEditableData((prev) => prev.filter((_, idx) => idx !== change.index));
  } 
  else if (change.action === "delete") {
    // restore the deleted member back
    setEditableData((prev) => {
      const newList = [...prev];
      newList.splice(change.index, 0, change.deletedItem);
      return newList;
    });
  } 
  else if (change.action === "edit") {
    // revert edited fields back to old values
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

  // remove this change from the final changes list
  setAllChanges((prev) =>
    prev.filter(
      (c, i) => !(c.index === change.index && c.action === change.action)
    )
  );
};


  const handleSave = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    savedDataRef.current = JSON.parse(JSON.stringify(editableData));
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsEditing(false);
    setIsSavedOnce(true);
    toast.success("Changes saved. You can now Request or Edit again.");
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
        newChanges.push({ index: idx, action: "delete", deletedItem: newData[idx] });
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

  if (!data) return <div className="h-screen flex items-center justify-center md:mt-[15%]"><LoadComp /></div>;

  return (
    <>
      {/* Top toolbar */}
      {!isEditing && (
        <div className="flex justify-end pr-8 mt-4">
          <button
            className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2" /> Edit
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-4 text-brwn dark:text-drkt text-center">COMMITTEE MEMBERS</h2>

      <div className="flex flex-wrap justify-center gap-4 m-4">
        {editableData.map((member, i) => (
          <div key={member.id} className="student-card dark:bg-text h-[120px] p-2 relative">
            {isEditing && (
              <input
                type="checkbox"
                className="absolute top-2 right-2 w-4 h-4 "
                checked={selectedRows.has(i)}
                onChange={() => toggleSelectRow(i)}
              />
            )}
            <div className="text-left">
              {isEditing ? (
                <div className="py-[18px]">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full mb-1 border rounded p-1 text-center"
                    value={member.name}
                    onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                  />
                  <input  
                    type="text"
                    placeholder="Designation"
                    className="w-full mb-1 border rounded p-1"
                    value={member.Designation}
                    onChange={(e) => handleFieldChange(i, "Designation", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    className="w-full mb-1 border rounded p-1"
                    value={member.position}
                    onChange={(e) => handleFieldChange(i, "position", e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <h5 className="text-center">{member.name}</h5>
                  <p className="pl-4 text-brwn dark:text-drka text-[14px]">{member.Designation}</p>
                  <p className="pl-4 text-brwn dark:text-drka text-[14px]">{member.position}</p>
                </>
              )}
            </div>
          </div>
        ))}

        {isEditing && (
          <button
            className="bg-gray-200 text-text px-3 py-2 rounded h-44 w-64 border-dashed border-2 border-gray-500 flex items-center justify-center"
            onClick={handleAddMember}
          >
            <Plus /> Add Member
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-center mt-2 gap-2">
          {selectedRows.size > 0 && (
            <button onClick={openDeleteMultiple} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded">
              <Trash2 /> Delete Selected
            </button>
          )}
        </div>
      )}

      <div className="py-4 mt-4 flex justify-end gap-4 mr-8">
        {isEditing && (
          <>
            <button className="bg-gray-500 px-3 py-2 rounded text-prim" onClick={handleCancelSession}>Cancel</button>
            {sessionChanges.length > 0 && (
              <button className="bg-secd hover:bg-brwn text-text hover:text-prim  px-3 py-2 rounded-lg" onClick={handleSave}>Save</button>
            )}
          </>
        )}

        {!isEditing && isSavedOnce && (
          <>
            <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>Discard All</button>
            <button className="bg-secd text-text px-3 py-2 flex flex-row rounded  hover:bg-brwn hover:text-prim " onClick={handleRequest}><Send className="mr-2" /> Request</button>
          </>
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
                  <td className="py-2 px-3 border text-center">
                    {change.action === "edit" && <span className="text-blue-600">✎ Edited</span>}
                    {change.action === "add" && <span className="text-green-600">+ Added</span>}
                    {change.action === "delete" && <span className="text-red-600">🗑 Deleted</span>}
                  </td>
                  <td className="py-2 px-3 border text-center">Committee</td>
                  <td className="py-2 px-3 border text-[13px] text-center">
                    {change.action === "delete" ? (
                      <div>Member deleted</div>
                    ) : Object.keys(change.changes || {}).length === 0 ? (
                      <div>Added/changed entire member</div>
                    ) : (
                      <div>
                        {Object.keys(change.changes)
                          .filter((field) => change.changes[field].old !== change.changes[field].new)
                          .map((field) => field.charAt(0).toUpperCase() + field.slice(1))
                          .join(", ")}
                      </div>
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
          className="px-4 py-2 rounded bg-gray-400 text-prim"
        >
          Cancel
        </button>
        <button
          onClick={handleFinalRequestConfirm}
          className="px-4 py-2 rounded bg-secd text-black hover:bg-brwn hover:text-prim"
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
              <button className="px-4 py-2 rounded bg-gray-400 text-white" onClick={cancelDelete}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} />
    </>
  );
}
