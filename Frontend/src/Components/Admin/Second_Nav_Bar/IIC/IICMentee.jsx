import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const IICMentee = ({ title, data, collectionType = "mentee" }) => {
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
      const formattedData = data.map((item, idx) => ({
        id: item.id || idx,
        mentee_institute: item.mentee_institute || "",
        State: item.State || "",
        Zone: item.Zone || "",
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
    const baseData = pendingRows ? deepCopy(pendingRows) : deepCopy(committedRows);
    setRows(baseData);
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(false);
    setSelectedRows([]);
    setSelectAll(false);
  };

  const handleChange = (e, idx, field) => {
    const value = capitalizeWords(e.target.value);
    const updated = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    setRows(updated);
    setIsDirty(true);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev.map((r) => ({ ...r })), { 
      id: Date.now(), 
      mentee_institute: "", 
      State: "", 
      Zone: "",
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
      // ✅ Draft exists → revert only current edits, keep the draft
      setRows(deepCopy(pendingRows));
    } else {
      // ❌ No draft yet → revert back to committed/original data
      setRows(deepCopy(committedRows));
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows([]);
    setSelectAll(false);
    setIsSaved(!!pendingRows); // show Discard/Request buttons if draft exists
  };

  const handleSave = () => {
    // Check for empty fields
    const invalidRow = rows.find(row =>
      !row.mentee_institute?.trim() || 
      !row.State?.trim() || 
      !row.Zone?.trim()
    );

    if (invalidRow) {
      toast.error("Please fill all fields before saving!");
      return;
    }

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
    toast.info("Changes discarded!");
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
          title: `Delete ${oldRow.mentee_institute}`,
          category: oldRow.mentee_institute,
          meta_data: {
            mentee_institute: oldRow.mentee_institute,
            State: oldRow.State,
            Zone: oldRow.Zone
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
          title: `Insert ${newRow.mentee_institute}`,
          category: newRow.mentee_institute,
          meta_data: {
            mentee_institute: newRow.mentee_institute,
            State: newRow.State,
            Zone: newRow.Zone
          }
        });
      } else {
        const oldRow = committedMap.get(newRow.id);
        // Check if row was updated
        if (
          oldRow.mentee_institute !== newRow.mentee_institute ||
          oldRow.State !== newRow.State ||
          oldRow.Zone !== newRow.Zone
        ) {
          payload.push({
            collectionName: "iic",
            collection_type: collectionType,
            action: "update",
            title: `Update ${newRow.mentee_institute}`,
            category: newRow.mentee_institute,
            meta_data: {
              mentee_institute: newRow.mentee_institute,
              State: newRow.State,
              Zone: newRow.Zone
            },
            original_data: {
              mentee_institute: oldRow.mentee_institute,
              State: oldRow.State,
              Zone: oldRow.Zone
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

    console.log("Submitting mentee payload:", payload);
    
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

  const revertChange = (rowId) => {
    if (!pendingRows) return;

    const committedRow = committedRows.find(r => r.id === rowId);
    let updated;

    if (!committedRow) {
      // Row was newly added → remove it
      updated = pendingRows.filter(r => r.id !== rowId);
    } else if (!pendingRows.find(r => r.id === rowId)) {
      // Row was deleted → restore it
      updated = [...pendingRows, deepCopy(committedRow)];
    } else {
      // Row was edited → reset to committed version
      updated = pendingRows.map(r => r.id === rowId ? deepCopy(committedRow) : r);
    }

    setPendingRows(updated);
    setRows(deepCopy(updated));
  };

  const getChanges = () => {
    if (!pendingRows) return [];
    const changes = [];

    const committedMap = new Map(committedRows.map(r => [r.id, r]));
    const pendingMap = new Map(pendingRows.map(r => [r.id, r]));

    // Check for deleted and edited rows
    committedMap.forEach((oldRow, id) => {
      if (!pendingMap.has(id)) {
        changes.push({
          action: "Deleted",
          section: "Mentee Details",
          changes: `Row with Institute: ${oldRow.mentee_institute}`,
          rowId: id
        });
      } else {
        const newRow = pendingMap.get(id);
        if (
          oldRow.mentee_institute !== newRow.mentee_institute ||
          oldRow.State !== newRow.State ||
          oldRow.Zone !== newRow.Zone
        ) {
          changes.push({
            action: "Edited",
            section: "Mentee Details",
            changes: `Row with Institute: ${oldRow.mentee_institute}`,
            rowId: id
          });
        }
      }
    });

    // Check for newly added rows
    pendingMap.forEach((newRow, id) => {
      if (!committedMap.has(id)) {
        changes.push({
          action: "Added",
          section: "Mentee Details",
          changes: `Row with Institute: ${newRow.mentee_institute || "New"}`,
          rowId: id
        });
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

  if (!data) {
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
        <div className="relative mb-4">
          {/* Title centered */}
          <h2 className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">
            {title || "Mentee Institution"}
          </h2>
          {/* Edit button on right */}
          {!isEditing  && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
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
          <table className="min-w-full table-auto border border-black text-[16px]">
            <thead>
              <tr className="bg-gry">
                <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">SL No</th>
                <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">Mentee Institute</th>
                <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">State</th>
                <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">Zone</th>
                {isEditing && (
                  <th className="ic-table-head border-2 border-text dark:border-prim px-3 py-2">
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
              {rows.map((item, i) => (
                <tr key={item.id || i} className={item.selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                  <td className="ic-table-data px-4 py-3 border-2 border-text dark:border-prim">{i + 1}</td>
                  <td className="ic-table-data text-left px-4 py-3 border-2 border-text dark:border-prim">
                    {isEditing ? (
                      <input
                        className="border p-1 w-full"
                        value={item.mentee_institute}
                        onChange={(e) => handleChange(e, i, "mentee_institute")}
                        placeholder="Mentee Institute"
                      />
                    ) : (
                      capitalizeWords(item.mentee_institute || "")
                    )}
                  </td>
                  <td className="ic-table-data text-center px-4 py-3 border-2 border-text dark:border-prim">
                    {isEditing ? (
                      <input
                        className="border p-1 w-full text-center"
                        value={item.State}
                        onChange={(e) => handleChange(e, i, "State")}
                        placeholder="State"
                      />
                    ) : (
                      item.State
                    )}
                  </td>
                  <td className="ic-table-data text-center px-4 py-3 border-2 border-text dark:border-prim">
                    {isEditing ? (
                      <input
                        className="border p-1 w-full text-center"
                        value={item.Zone}
                        onChange={(e) => handleChange(e, i, "Zone")}
                        placeholder="Zone"
                      />
                    ) : (
                      item.Zone
                    )}
                  </td>
                  {isEditing && (
                    <td className="ic-table-head border-2 border-text dark:border-prim px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.selected || false}
                        onChange={() => handleRowSelect(i)}
                        className="h-4 w-4"
                      />
                    </td>
                  )}
                </tr>
              ))}
              {isEditing && (
                <tr>
                  <td colSpan={isEditing ? 5 : 4} className="ic-table-data text-center">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim mx-auto mt-2 mb-2"
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
};

export default IICMentee;