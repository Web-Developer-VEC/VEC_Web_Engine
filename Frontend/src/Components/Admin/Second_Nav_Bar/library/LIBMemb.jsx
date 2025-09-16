import React, { useState, useEffect } from "react";
import { Pencil, Plus, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const LIBMemb = ({ data }) => {
  const members = data.find((sec) => sec.category === "Member Details")?.content || [];
  const books = data.find((sec) => sec.category === "no_of_books")?.content || [];
  const cds = data.find((sec) => sec.category === "periodical_back_volumes_cd")?.content || [];

  const [rows, setRows] = useState([]);
  const [committedRows, setCommittedRows] = useState([]);
  const [pendingRows, setPendingRows] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const merged = members.map((m, idx) => ({
      member: m || "",
      book: books[idx] || "",
      cd: cds[idx] || "",
      checked: false,
    }));
    const copy = deepCopy(merged);
    setCommittedRows(copy);
    setRows(deepCopy(copy));
    setPendingRows(null);
    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(false);
  }, [data]);

  const handleStartEdit = () => {
    // Load pendingRows if exist; otherwise, load committedRows
    if (pendingRows) {
      setRows(deepCopy(pendingRows));
    } else {
      setRows(deepCopy(committedRows));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(false);
  };

  const handleChange = (e, idx, field) => {
    let value = e.target.value;

    // Only allow numbers for book and cd fields
    if (field === "book" || field === "cd") {
      value = value.replace(/\D/g, ""); // remove non-digit characters
    }

    const updated = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    setRows(updated);
    setIsDirty(true);
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev.map((r) => ({ ...r })),
      { member: "", book: "", cd: "", checked: false },
    ]);
    setIsDirty(true);
  };

  const confirmDelete = () => {
    const updated = rows.filter((r) => !r.checked).map((r) => ({ ...r }));
    setRows(updated);
    setShowDeleteConfirm(false);
    setIsDirty(true);
  };

  const handleCancel = () => {
    // Revert current session changes
    if (pendingRows) {
      setRows(deepCopy(pendingRows));
    } else {
      setRows(deepCopy(committedRows));
    }

    setIsEditing(false);
    setIsDirty(false);

    // Keep the "Discard & Request" buttons if pendingRows exist
    if (pendingRows) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    const pending = deepCopy(rows);
    setPendingRows(pending);
    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(true); // Show Discard & Request buttons
  };

  const handleDiscard = () => {
    setRows(deepCopy(committedRows));
    setPendingRows(null);
    setIsSaved(false);
    setIsDirty(false);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    if (!pendingRows) return;
    // Finalize pending changes
    setCommittedRows(deepCopy(pendingRows));
    setRows(deepCopy(pendingRows));
    setPendingRows(null);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

  const revertChange = (rowIndex) => {
    if (!pendingRows) return;

    const reverted = deepCopy(pendingRows);

    if (!committedRows[rowIndex] && reverted[rowIndex]) {
      reverted.splice(rowIndex, 1);
    } else if (committedRows[rowIndex] && !reverted[rowIndex]) {
      reverted.splice(rowIndex, 0, deepCopy(committedRows[rowIndex]));
    } else if (committedRows[rowIndex] && reverted[rowIndex]) {
      reverted[rowIndex] = deepCopy(committedRows[rowIndex]);
    }

    setPendingRows(reverted);
    setRows(deepCopy(reverted));

    const hasDiff =
      reverted.length !== committedRows.length ||
      reverted.some((r, i) => {
        const c = committedRows[i] || {};
        return r.member !== c.member || r.book !== c.book || r.cd !== c.cd;
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
    const maxLen = Math.max(committedRows.length, pendingRows.length);

    for (let i = 0; i < maxLen; i++) {
      const oldRow = committedRows[i];
      const newRow = pendingRows[i];

      if (oldRow && !newRow) {
        changes.push({
          action: "Deleted",
          section: "Membership Details",
          changes: `Row ${i + 1}`,
          rowIndex: i,
        });
      } else if (!oldRow && newRow) {
        changes.push({
          action: "Added",
          section: "Membership Details",
          changes: `Row ${i + 1}`,
          rowIndex: i,
        });
      } else if (oldRow && newRow) {
        if (oldRow.member !== newRow.member || oldRow.book !== newRow.book || oldRow.cd !== newRow.cd) {
          changes.push({
            action: "Edited",
            section: "Membership Details",
            changes: `Row ${i + 1}`,
            rowIndex: i,
          });
        }
      }
    }
    return changes;
  };

  const changes = getChanges();

  const hasChecked = rows.some((r) => r.checked);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="block overflow-x-auto px-4 sm:px-8 py-10 font-[Poppins] relative">
      {rows.length > 0 && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#800000]">
              Membership Details
            </h2>
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

          {/* Table */}
          <div className="flex justify-center md:justify-start">
            <table className="lg:w-full w-[600px] mx-auto border border-gray-300 text-center text-sm relative">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">S. No</th>
                  <th className="border p-2">Member Details</th>
                  <th className="border p-2">No. of Books</th>
                  <th className="border p-2">Periodical / Back Volume / CD</th>
                  {isEditing && <th className="border p-2">Check</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{idx + 1}</td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={row.member}
                          onChange={(e) => handleChange(e, idx, "member")}
                        />
                      ) : (
                        row.member
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          className="border p-1 w-full"
                          value={row.book}
                          onChange={(e) => handleChange(e, idx, "book")}
                        />
                      ) : (
                        row.book
                      )}
                    </td>
                    <td className="border p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          className="border p-1 w-full"
                          value={row.cd}
                          onChange={(e) => handleChange(e, idx, "cd")}
                        />
                      ) : (
                        row.cd
                      )}
                    </td>
                    {isEditing && (
                      <td className="border p-2">
                        <input
                          type="checkbox"
                          checked={row.checked || false}
                          onChange={(e) => {
                            const updated = [...rows];
                            updated[idx].checked = e.target.checked;
                            setRows(updated);
                          }}
                        />
                      </td>
                    )}
                  </tr>
                ))}
                {isEditing && (
                  <tr>
                    <td colSpan="5" className="border p-2 text-center">
                      <button
                        onClick={handleAddRow}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] mx-auto hover:text-prim"
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
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              {isDirty && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  <Save size={18} /> Save
                </button>
              )}
            </div>
          )}

          {/* Delete Button */}
          {isEditing && hasChecked && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          )}

          {/* Discard & Request Buttons */}
          {!isEditing && isSaved && changes.length > 0 && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Discard Changes
              </button>
              <button
                onClick={handleRequest}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                <Send size={18} /> Request
              </button>
            </div>
          )}

          {showRequestModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
    <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Request</h2>
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
            </tr>
          </thead>
          <tbody>
            {/* Render only rows that have changes */}
            {changes.map((ch, i) => (
              <tr key={i}>
                <td className="border p-2 text-blue-600">{ch.action}</td>
                <td className="border p-2">{ch.section}</td>
                <td className="border p-2 flex items-center justify-center gap-2">
                  {ch.changes}
                  <button
                    onClick={() => revertChange(ch.rowIndex)}
                    className="ml-2 p-1 rounded hover:bg-gray-100"
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
        <button
          onClick={() => setShowRequestModal(false)}
          className="px-4 py-2 rounded bg-gray-400 text-white"
        >
          Cancel
        </button>
        {changes.length > 0 && (
          <button
            onClick={handleFinalRequestConfirm}
            className="px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000]"
          >
            Final Request
          </button>
        )}
      </div>
    </div>
  </div>
)}


          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            bg-white p-6 rounded-lg shadow-lg border z-50 w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete selected rows?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          <ToastContainer position="bottom-right" autoClose={2000} />
        </>
      )}
    </div>
  );
};

export default LIBMemb;
