import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

export default function IicFacEvent({ title, data, collectionType }) {
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

  const { sendRequest, loading: requestLoading, error } = useAdminRequest();

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

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map(word => word ? (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) : "")
      .join(" ");
  };

  const handleStartEdit = () => {
    const baseData = pendingRows ? deepCopy(pendingRows) : deepCopy(committedRows);
    setRows(baseData);
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(false);
    setSelectedRows([]);
    setSelectAll(false);
  };

  const handleChange = (e, idx, field) => {
    const value =
      field === "number_of_participants"
        ? e.target.value
        : capitalizeWords(e.target.value);

    console.log("Changing:", {
      row: idx + 1,
      field,
      value,
    });

    const updated = rows.map((r, i) =>
      i === idx ? { ...r, [field]: value } : r
    );

    console.log("Updated Row:", updated[idx]);

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
      setRows(deepCopy(pendingRows));
      setIsSaved(true);
    } else {
      setRows(deepCopy(committedRows));
      setIsSaved(false);
    }
    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows([]);
    setSelectAll(false);
  };

  const handleSave = () => {
    console.log("========== SAVE CLICKED ==========");
    console.log("All Rows:", rows);

    let invalidRow = null;
    let invalidIndex = -1;

    rows.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);

      console.log("Program:", `"${row.name_of_the_program}"`);
      console.log("Date:", `"${row.date}"`);
      console.log("Participants:", `"${row.number_of_participants}"`);

      if (
        !row.name_of_the_program?.trim() ||
        !row.date?.trim() ||
        row.number_of_participants === undefined ||
        row.number_of_participants === null ||
        row.number_of_participants === ""
      ) {
        invalidRow = row;
        invalidIndex = index;
      }
    });

    if (invalidRow) {
      console.log("❌ Invalid Row Found");
      console.log("Row Number:", invalidIndex + 1);
      console.log(invalidRow);

      toast.error(`Row ${invalidIndex + 1}: Please fill all fields before saving!`);
      return;
    }

    console.log("✅ All rows are valid.");

    const pending = deepCopy(rows);
    setPendingRows(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows([]);
    setSelectAll(false);
  };

  const handleDiscard = () => {
    setRows(deepCopy(committedRows));
    setPendingRows(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedRows([]);
    setSelectAll(false);
  };


  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const buildPayload = () => {
    if (!pendingRows) return [];

    const payload = [];
    const committedMap = new Map(committedRows.map(r => [r.id, r]));
    const pendingMap = new Map(pendingRows.map(r => [r.id, r]));

    // Check for deleted rows
    committedRows.forEach(oldRow => {
      if (!pendingMap.has(oldRow.id)) {
        payload.push({
          collectionName: "iic",
          collection_type: collectionType,
          action: "delete",
          title: `Delete ${oldRow.name_of_the_program}`,
          category: oldRow.name_of_the_program,
          meta_data: {
            name_of_the_program: oldRow.name_of_the_program,
            date: oldRow.date,
            number_of_participants: oldRow.number_of_participants.toString()
          }
        });
      }
    });

    // Check for added and updated rows
    pendingRows.forEach(newRow => {
      if (!committedMap.has(newRow.id)) {
        // New row (insert)
        payload.push({
          collectionName: "iic",
          collection_type: collectionType,
          action: "insert",
          title: `Insert ${newRow.name_of_the_program}`,
          category: newRow.name_of_the_program,
          meta_data: {
            name_of_the_program: newRow.name_of_the_program,
            date: newRow.date,
            number_of_participants: newRow.number_of_participants.toString()
          }
        });
      } else {
        const oldRow = committedMap.get(newRow.id);
        // Check if row was updated
        if (
          oldRow.name_of_the_program !== newRow.name_of_the_program ||
          oldRow.date !== newRow.date ||
          oldRow.number_of_participants !== newRow.number_of_participants
        ) {
          payload.push({
            collectionName: "iic",
            collection_type: collectionType,
            action: "update",
            title: `Update ${newRow.name_of_the_program}`,
            category: newRow.name_of_the_program,
            meta_data: {
              name_of_the_program: newRow.name_of_the_program,
              date: newRow.date,
              number_of_participants: newRow.number_of_participants.toString()
            },
            original_data: {
              name_of_the_program: oldRow.name_of_the_program,
              date: oldRow.date,
              number_of_participants: oldRow.number_of_participants.toString()
            }
          });
        }
      }
    });

    return payload;
  };

  const handleFinalRequestConfirm = async () => {
    if (!pendingRows) return;

    const payload = buildPayload();

    if (payload.length === 0) {
      return;
    }

    console.log("Submitting payload:", payload);

    const result = await sendRequest(payload, []);

    if (result) {
      // Update committed rows with pending rows
      setCommittedRows(deepCopy(pendingRows));
      setRows(deepCopy(pendingRows));
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

    committedRows.forEach(oldRow => {
      if (!pendingMap.has(oldRow.id)) {
        changes.push({
          action: "Deleted",
          section: "Event Details",
          changes: `Program: ${oldRow.name_of_the_program}`,
          rowId: oldRow.id
        });
      }
    });

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

  const revertChange = (id) => {
    if (!pendingRows) return;
    const committedMap = new Map(committedRows.map(r => [r.id, r]));
    let updatedPending = [...pendingRows];
    if (committedMap.has(id)) {
      const idx = updatedPending.findIndex(r => r.id === id);
      if (idx !== -1) {
        updatedPending[idx] = deepCopy(committedMap.get(id));
      } else {
        updatedPending.push(deepCopy(committedMap.get(id)));
      }
    } else {
      updatedPending = updatedPending.filter(r => r.id !== id);
    }
    setPendingRows(updatedPending);
    setRows(deepCopy(updatedPending));
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
      {/* Component-local styles */}
      <style>{`
        .ic-table-container { font-family: Inter, Roboto, system-ui; }
        .ic-table-wrapper { border-radius: 3px; overflow: hidden; }
        .ic-data-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 760px; }
        .ic-data-table thead th {
          background: #808080;
          color: #1f1f1f;
          font-weight: 700;
          padding: 18px 20px;
          text-align: left;
          border: 1px solid #222;
        }
        .ic-data-table tbody td {
          background: #fff;
          padding: 16px 18px;
          vertical-align: middle;
          border: 1px solid #222;
          font-size: 15px;
          color: #111;
        }
        .ic-data-table tbody tr:nth-child(odd) td { background: #ffffff; }
        .ic-data-table tbody tr:nth-child(even) td { background: #fbfbfb; }
        .ic-data-table tbody tr.bg-selected td { background: #f0f8ff; }
        .cell-input {
          width: 100%;
          height: 36px;
          padding: 6px 8px;
          margin: 0;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.08);
          background: transparent;
          font-size: 15px;
          line-height: 1.25;
          color: #111;
          box-sizing: border-box;
        }
        .cell-input::placeholder { color: rgba(0,0,0,0.35); }
        .cell-input:focus {
          background: rgba(253,204,3,0.06);
          outline: 2px solid rgba(253,204,3,0.12);
        }
        .date-input, .number-input { text-align: center; }
        .btn-edit {
          background:#fdcc03;
          color:#000;
          padding:10px 14px;
          border-radius:6px;
          display:inline-flex;
          align-items:center;
          gap:8px;
          border: none;
          cursor:pointer;
        }
        .btn-add {
          background:#fdcc03;
          color:#000;
          padding:10px 14px;
          border-radius:6px;
          border:none;
          cursor:pointer;
        }
        @media (max-width: 900px) {
          .ic-data-table { min-width: 640px; }
        }
      `}</style>

      <div className="ic-table-container m-4 relative">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-4">
          <h2 className="text-4xl text-brwn dark:text-drkt font-bold">{title}</h2>
          {!isEditing && (
            <div className="absolute right-0">
              <button onClick={handleStartEdit} className="flex ml-auto mr-8 items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim my-4">
                <Pencil size={18} /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto ic-table-wrapper">
          <table className="ic-data-table">
            <thead>
              <tr>
                <th className="ic-table-head">SL No</th>
                <th className="ic-table-head">Name of the program</th>
                <th className="ic-table-head">Date</th>
                <th className="ic-table-head">Number of Participants</th>
                {isEditing && (
                  <th className="ic-table-head text-center">
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
              {rows.map((event, i) => {
                const rowClass = event.selected ? "bg-selected" : "";
                return (
                  <tr key={event.id || i} className={rowClass}>
                    <td className="ic-table-data">{i + 1}</td>
                    <td className="ic-table-data text-left">
                      {isEditing ? (
                        <input
                          className="cell-input"
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
                          className="cell-input date-input"
                          value={event.date ? event.date.split(".").reverse().join("-") : ""}
                          onChange={(e) => {
                            const dateParts = e.target.value.split("-");
                            const formatted = dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : "";
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
                          min="0"
                          className="cell-input number-input"
                          value={event.number_of_participants ?? ""}
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
                );
              })}

              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 6 : 5} className="ic-table-data text-center">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center justify-center gap-2 px-4 py-2 btn-add mx-auto"
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
            {selectedRows.length > 0 && (
              <div className="flex justify-center my-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 flex items-center gap-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={18} /> Delete Selected ({selectedRows.length})
                </button>
              </div>
            )}

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

        {/* Final Request Modal - Original Styling */}
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
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-prim"
                  disabled={requestLoading}
                >
                  Cancel
                </button>
                {changes.length > 0 && (
                  <button
                    onClick={handleFinalRequestConfirm}
                    className={`px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim ${requestLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={requestLoading}
                  >
                    {requestLoading ? "Processing..." : "Final Request"}
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