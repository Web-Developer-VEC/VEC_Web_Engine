import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

export default function IicFacEvent({ title, data }) {
  const [rows, setRows] = useState([]);
  const [committedRows, setCommittedRows] = useState([]);
  const [pendingRows, setPendingRows] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((event, idx) => ({
        id: event.id || idx,
        name_of_the_program: event.name_of_the_program || "",
        date: event.date || "",
        number_of_participants: event.number_of_participants || "",
        selected: false
      }));
      
      const copy = deepCopy(formattedData);
      setCommittedRows(copy);
      setRows(deepCopy(copy));
      setPendingRows(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setSelectedRows([]);
      setSelectAll(false);
    }
  }, [data]);

const handleStartEdit = () => {
  // If draft exists → edit from pendingRows, else from committedRows
  const baseData = pendingRows ? deepCopy(pendingRows) : deepCopy(committedRows);

  setRows(baseData);
  setIsEditing(true);
  setIsDirty(false);

  // 🔑 Reset isSaved so Discard/Request don’t show while editing
  setIsSaved(false);

  setSelectedRows([]);
  setSelectAll(false);
};


const handleChange = (e, idx, field) => {
  const value = capitalizeWords(e.target.value); // capitalize first letter of each word
  const updated = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
  setRows(updated);
  setIsDirty(true);
};

  const handleAddRow = () => {
    setRows((prev) => [...prev.map((r) => ({ ...r })), { 
      id: Date.now(), 
      name_of_the_program: "", 
      date: "", 
      number_of_participants: "",
      selected: false
    }]);
    setIsDirty(true);
  };

  const handleRowSelect = (index) => {
    const updatedRows = rows.map((row, i) => 
      i === index ? { ...row, selected: !row.selected } : row
    );
    
    setRows(updatedRows);
    
    const selectedIndices = updatedRows
      .map((row, i) => row.selected ? i : -1)
      .filter(i => i !== -1);
    
    setSelectedRows(selectedIndices);
    setSelectAll(selectedIndices.length === updatedRows.length && updatedRows.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const updatedRows = rows.map(row => ({ ...row, selected: newSelectAll }));
    setRows(updatedRows);
    
    setSelectedRows(newSelectAll ? rows.map((_, i) => i) : []);
  };

  const confirmDelete = () => {
    const updated = rows.filter((_, i) => !selectedRows.includes(i)).map((r) => ({ ...r }));
    setRows(updated);
    setSelectedRows([]);
    setSelectAll(false);
    setShowDeleteModal(false);
    setIsDirty(true);
  };

const handleCancel = () => {
  if (pendingRows) {
    // ✅ Draft exists → cancel should only discard current edits, keep draft
    setRows(deepCopy(pendingRows));
    toast.info("Cancelled edits. Draft preserved!");
    setIsSaved(true);   // still in draft mode → show Discard/Request
  } else {
    // ❌ No draft exists → cancel back to committed/original
    setRows(deepCopy(committedRows));
    toast.info("Cancelled. Reverted to original data!");
    setIsSaved(false);
  }

  setIsEditing(false);
  setIsDirty(false);
  setSelectedRows([]);
  setSelectAll(false);
};


const handleSave = () => {
  // Check for empty fields
  const invalidRow = rows.find(row =>
    !row.name_of_the_program?.trim() || 
    !row.date?.trim() || 
    row.number_of_participants === undefined || 
    row.number_of_participants === null || 
    row.number_of_participants === ""
  );

  if (invalidRow) {
    toast.error("Please fill all fields before saving!");
    return; // Stop saving
  }

  const pending = deepCopy(rows);
  setPendingRows(pending);
  setIsSaved(true);
  setIsEditing(false);
  setIsDirty(false);
  setSelectedRows([]);
  setSelectAll(false);
  toast.success("Changes saved as draft!");
};


  const handleDiscard = () => {
    setRows(deepCopy(committedRows));
    setPendingRows(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows([]);
    setSelectAll(false);
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    if (!pendingRows) return;
    setCommittedRows(deepCopy(pendingRows));
    setRows(deepCopy(pendingRows));
    setPendingRows(null);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

const revertChange = (id) => {
  if (!pendingRows) return;

  const committedMap = new Map(committedRows.map(r => [r.id, r]));

  let updatedPending = [...pendingRows];

  // Row existed in committedRows → restore it
  if (committedMap.has(id)) {
    const idx = updatedPending.findIndex(r => r.id === id);
    if (idx !== -1) {
      updatedPending[idx] = deepCopy(committedMap.get(id));
    } else {
      updatedPending.push(deepCopy(committedMap.get(id)));
    }
  } else {
    // Row was newly added → remove it
    updatedPending = updatedPending.filter(r => r.id !== id);
  }

  setPendingRows(updatedPending);
  setRows(deepCopy(updatedPending));

  // Check if any changes remain
  const hasDiff =
    updatedPending.length !== committedRows.length ||
    updatedPending.some(r => {
      const c = committedMap.get(r.id);
      return !c || r.name_of_the_program !== c.name_of_the_program ||
             r.date !== c.date ||
             r.number_of_participants !== c.number_of_participants;
    });

  if (!hasDiff) {
    setPendingRows(null);
    setIsSaved(false);
    setShowRequestModal(false);
  }
};


const getChanges = () => {
  if (!pendingRows) return [];

  const changes = [];

  const committedMap = new Map(committedRows.map(r => [r.id, r]));
  const pendingMap = new Map(pendingRows.map(r => [r.id, r]));

  // Deletions
  committedRows.forEach(oldRow => {
    if (!pendingMap.has(oldRow.id)) {
      changes.push({
        action: "Deleted",
        section: "Event Details",
        changes: `Program: ${oldRow.name_of_the_program}`,
        rowId: oldRow.id // save ID instead of index
      });
    }
  });

  // Additions + edits
  pendingRows.forEach(newRow => {
    if (!committedMap.has(newRow.id)) {
      changes.push({
        action: "Added",
        section: "Event Details",
        changes: `Program: ${newRow.name_of_the_program}`,
        rowId: newRow.id
      });
    } else {
      const oldRow = committedMap.get(newRow.id);
      if (
        oldRow.name_of_the_program !== newRow.name_of_the_program ||
        oldRow.date !== newRow.date ||
        oldRow.number_of_participants !== newRow.number_of_participants
      ) {
        changes.push({
          action: "Edited",
          section: "Event Details",
          changes: `Program: ${newRow.name_of_the_program}`,
          rowId: newRow.id
        });
      }
    }
  });

  return changes;
};



const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

  const changes = getChanges();

  if (!data || !title) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <div className="ic-table-container m-4 relative">
        {/* Header */}
<div className="relative flex items-center justify-center mb-4">
  {/* Title centered */}
  <h2 className="text-4xl text-brwn dark:text-drkt font-bold">{title}</h2>

  {/* Edit button on right */}
  {!isEditing && (
    <div className="absolute right-0">
      <button
        onClick={handleStartEdit}
        className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
      >
        <Pencil size={18} />
        Edit
      </button>
    </div>
  )}
</div>


        {/* Table */}
        <div className="overflow-x-auto">
          <table className="ic-data-table">
            <thead>
              <tr>
                <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                <th className="ic-table-head border-2 border-text dark:border-prim">Name of the program</th>
                <th className="ic-table-head border-2 border-text dark:border-prim">Date</th>
                <th className="ic-table-head border-2 border-text dark:border-prim">Number of Participants</th>
                                {isEditing && (
                  <th className="ic-table-head border-2 border-text dark:border-prim text-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4"
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((event, i) => (
                <tr key={event.id || i} className={event.selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                                    <td className="ic-table-data">{i + 1}</td>
                  <td className="ic-table-data text-left">
{isEditing ? (
 <input
  className="border p-1 w-full"
  value={event.name_of_the_program}
  onChange={(e) => handleChange(e, i, "name_of_the_program")}
  placeholder="Name of the Program"
/>

) : (
  capitalizeWords(event.name_of_the_program || "")
)}

                  </td>
<td className="ic-table-data text-center">
  {isEditing ? (
    <input
      type="date"
      className="border p-1 w-full text-center"
      value={event.date ? event.date.split(".").reverse().join("-") : ""}
      onChange={(e) => {
        const dateParts = e.target.value.split("-"); // ["YYYY","MM","DD"]
        const formatted = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; // "DD.MM.YYYY"
        handleChange({ target: { value: formatted } }, i, "date");
      }}
    />
  ) : (
    event.date
  )}
</td>


                  <td className="ic-table-data text-center">
                    {isEditing ? (
                      <input
                      type="number"
                        className="border p-1 w-full text-center"
                        value={event.number_of_participants}
                        onChange={(e) => handleChange(e, i, "number_of_participants")}
                      />
                    ) : (
                      event.number_of_participants
                    )}
                  </td>
                  {isEditing && (
                    <td className="ic-table-data text-center">
                      <input
                        type="checkbox"
                        checked={event.selected || false}
                        onChange={() => handleRowSelect(i)}
                        className="h-4 w-4"
                      />
                    </td>
                  )}
                </tr>
              ))}
              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 6 : 5} className="ic-table-data text-center">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim mx-auto"
                    >
                      <Plus size={18} /> Add Row
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
{isEditing && (
  <>
    {/* Delete Selected Button - Centered */}
    {selectedRows.length > 0 && (
      <div className="flex justify-center my-4">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 flex items-center gap-2 bg-red-500 text-prim rounded hover:bg-red-600"
        >
          <Trash2 size={18} /> Delete Selected ({selectedRows.length})
        </button>
      </div>
    )}

    {/* Cancel & Save Buttons - Right aligned */}
    <div className="flex justify-end items-center gap-3 mt-6">
      <button
        onClick={handleCancel}
        className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
      >
        Cancel
      </button>

      {isDirty && (
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
        >
           Save
        </button>
      )}
    </div>
  </>
)}

        {isSaved && (
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
              Discard Changes
            </button>
            {changes.length > 0 && (
              <button
                onClick={handleRequest}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                <Send size={18} /> Request
              </button>
            )}
          </div>
        )}

        {/* Final Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
            <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
              </p>
              {changes.length > 0 ? (
                <table className="w-full text-center text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Section</th>
                      <th className="border p-2">Changes</th>
                      <th className="border p-2">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((ch, i) => (
                      <tr key={i}>
                        <td className="border p-2 text-blue-600">{ch.action}</td>
                        <td className="border p-2">{ch.section}</td>
                        <td className="border p-2">{ch.changes}</td>
                        <td className="border p-2">
                          <button
  onClick={() => revertChange(ch.rowId)}
  className="p-1 rounded hover:bg-gray-100"
  title="Revert this change"
>
  <X size={16} className="text-red-500" />
</button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No changes detected.</p>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
                  Cancel
                </button>
                {changes.length > 0 && (
                  <button
                    onClick={handleFinalRequestConfirm}
                    className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                  >
                    Final Request
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
            <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedRows.length} selected row{selectedRows.length > 1 ? 's' : ''}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={2000} />
      </div>
    </>
  );
}