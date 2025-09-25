import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

function IICExpert({ data = [] }) {
  const [rows, setRows] = useState([]);
  const [committedRows, setCommittedRows] = useState([]);
  const [pendingRows, setPendingRows] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((expert, idx) => ({
        id: expert.id || idx,
        name: expert.name || "",
        designation: expert.designation || "",
        selected: false
      }));
      
      const copy = deepCopy(formattedData);
      setCommittedRows(copy);
      setRows(deepCopy(copy));
      setPendingRows(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setSelectedRows(new Set());
      setSelectAll(false);
    }
  }, [data]);

const handleStartEdit = () => {
  // if there’s a pending draft, let user edit that
  const baseData = pendingRows ? deepCopy(pendingRows) : deepCopy(committedRows);

  setRows(baseData);
  setIsEditing(true);
  setIsDirty(false);
  setIsSaved(false);
  setSelectedRows(new Set());
  setSelectAll(false);
};




  const handleChange = (idx, field, value) => {
    const updated = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    setRows(updated);
    setIsDirty(true);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev.map((r) => ({ ...r })), { 
      id: Date.now(), 
      name: "", 
      designation: "",
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
    
    setSelectedRows(new Set(selectedIndices));
    setSelectAll(selectedIndices.length === updatedRows.length && updatedRows.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const updatedRows = rows.map(row => ({ ...row, selected: newSelectAll }));
    setRows(updatedRows);
    
    setSelectedRows(newSelectAll ? new Set(rows.map((_, i) => i)) : new Set());
  };

  const confirmDelete = () => {
    const updated = rows.filter((_, i) => !selectedRows.has(i)).map((r) => ({ ...r }));
    setRows(updated);
    setSelectedRows(new Set());
    setSelectAll(false);
    setDeleteIndex(null);
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (pendingRows) {
      setRows(deepCopy(pendingRows));
      toast.info("Cancelled edits. Draft preserved!");
    } else {
      setRows(deepCopy(committedRows));
      toast.info("Cancelled. Reverted to original data!");
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows(new Set());
    setSelectAll(false);
    setIsSaved(!!pendingRows);
  };

  const handleSave = () => {
    const invalidItem = rows.find(item => !item.name?.trim() || !item.designation?.trim());
    
    if (invalidItem) {
      toast.error("Please fill all fields before saving!");
      return;
    }
    
    const pending = deepCopy(rows);
    setPendingRows(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows(new Set());
    setSelectAll(false);
    toast.success("Changes saved as draft!");
  };

  const handleDiscard = () => {
    setRows(deepCopy(committedRows));
    setPendingRows(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows(new Set());
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

const revertChange = (rowId) => {
  if (!pendingRows) return;

  let reverted = deepCopy(pendingRows);

  const oldRow = committedRows.find(r => r.id === rowId);
  const isDeleted = !reverted.some(r => r.id === rowId);
  const isAdded = !committedRows.some(r => r.id === rowId);

  if (isDeleted && oldRow) {
    // find the original index of the row in committedRows
    const originalIndex = committedRows.findIndex(r => r.id === rowId);

    // insert it back in the correct place
    reverted.splice(originalIndex, 0, deepCopy(oldRow));
  } else if (isAdded) {
    // remove newly added row
    reverted = reverted.filter(r => r.id !== rowId);
  } else if (oldRow) {
    // revert edits
    reverted = reverted.map(r => r.id === rowId ? deepCopy(oldRow) : r);
  }

  setPendingRows(reverted);
  setRows(deepCopy(reverted));

  // check if still has diffs
  const committedMap = new Map(committedRows.map(r => [r.id, r]));
  const hasDiff =
    reverted.length !== committedRows.length ||
    reverted.some(r => {
      const c = committedMap.get(r.id) || {};
      return r.name !== c.name || r.designation !== c.designation;
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

  // make quick lookup maps
  const committedMap = new Map(committedRows.map(r => [r.id, r]));
  const pendingMap = new Map(pendingRows.map(r => [r.id, r]));

  // check deleted
  committedRows.forEach((oldRow) => {
    if (!pendingMap.has(oldRow.id)) {
      changes.push({
        action: "Deleted",
        section: "Expert Details",
        changes: `Expert: ${oldRow.name}`,
        rowId: oldRow.id
      });
    }
  });

  // check added + edited
  pendingRows.forEach((newRow) => {
    if (!committedMap.has(newRow.id)) {
changes.push({
  action: "Edited",
  section: "Expert Details",
  changes: `Expert: ${newRow.name}`,
  rowId: newRow.id   // ✅ use rowId
});

    } else {
      const oldRow = committedMap.get(newRow.id);
      if (oldRow.name !== newRow.name || oldRow.designation !== newRow.designation) {
        changes.push({
          action: "Edited",
          section: "Expert Details",
          changes: `Expert: ${newRow.name}`,
          rowId: newRow.id
        });
      }
    }
  });

  return changes;
};


  const changes = getChanges();

  if (!data) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
        <LoadComp />
      </div>
    );
  }

    const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

  return (
    <>
      <div className='p-8 relative'>
{/* Header Section */}
<div className="flex flex-col md:flex-row items-center justify-between mb-6">
  {/* Title centered */}
  <div className="flex-1 flex justify-center md:justify-center">
    <h2 className="iic-h3 text-brwn dark:text-drkt">Expert Representation</h2>
  </div>

  {/* Edit button on right */}
  <div className="flex justify-end mt-2 md:mt-0">
    {!isEditing && (
      <button
        onClick={handleStartEdit}
        className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
      >
        <Pencil size={18} />
        Edit
      </button>
    )}
  </div>
</div>


        <div className="iic-members-grid">
          {rows.map((expert, i) => (
            <div key={expert.id || i} className={`faculty-card dark:bg-text relative ${expert.selected ? "ring-2 ring-blue-500" : ""}`}>
              {isEditing && (
                <input
                  type="checkbox"
                  checked={expert.selected || false}
                  onChange={() => handleRowSelect(i)}
                  className="absolute top-2 right-2 h-4 w-4"
                />
              )}
              
              <div className="ncc-n-stu-detail p-2 text-left">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={expert.name}
                      // onChange={(e) => handleChange(i, "name", e.target.value)}
                      onChange={(e) => handleChange(i, "name", e.target.value.toUpperCase())}
                      className="border p-1 w-full mb-2 text-center"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={expert.designation}
                      // onChange={(e) => handleChange(i, "designation", e.target.value)}
                      onChange={(e) => handleChange(i, "designation", toTitleCase(e.target.value))}
                      className="border p-1 w-full"
                      placeholder="Designation"
                    />
                  </>
                ) : (
                  <>
                    <h5 className="text-center text-[18px]">{expert.name}</h5>
                    <p className="pl-4 text-brwn dark:text-drka text-sm">{expert.designation}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {isEditing && (
            <div 
              className="faculty-card flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-500 p-7"
              onClick={handleAddRow}
            >
              <Plus size={20} className="text-gray-500 mr-2" />
              <span className="text-gray-500">Add Expert</span>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
{isEditing && (
  <>
    {/* Delete Selected - Centered */}
    {selectedRows.size > 0 && (
      <div className="flex justify-center my-4">
        <button
          onClick={() => setDeleteIndex(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-prim rounded hover:bg-red-600"
        >
          <Trash2 size={18} /> Delete Selected ({selectedRows.size})
        </button>
      </div>
    )}

    {/* Cancel & Save - Right aligned */}
    <div className="flex justify-end gap-3 mt-6">
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
  onClick={() => revertChange(ch.rowId)}   // ✅ send rowId not rowIndex
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
        {deleteIndex && (
          <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
            <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedRows.size} selected expert{selectedRows.size > 1 ? 's' : ''}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteIndex(false)}
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

export default IICExpert;