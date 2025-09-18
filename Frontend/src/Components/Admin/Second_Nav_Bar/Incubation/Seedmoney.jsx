import React, { useEffect, useRef, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import LoadComp from "../../LoadComp";
import { Send, Save, Plus, Trash2, ArrowDown } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Seedmoney({ data }) {
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
      const safeData = data.map((d) => ({
        ...d,
        funds: Array.isArray(d.funds)
          ? d.funds
          : [
              {
                amount_in_rupees: "",
                organization: "",
                year: "",
              },
            ],
      }));
      originalRef.current = JSON.parse(JSON.stringify(safeData));
      savedDataRef.current = JSON.parse(JSON.stringify(safeData));
      setEditableData(JSON.parse(JSON.stringify(safeData)));
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
      slNo: editableData.length + 1,
      name: "",
      funds: [
        {
          amount_in_rupees: "",
          organization: "",
          year: "",
        },
      ],
    };
    setEditableData((p) => [...p, newRow]);
    setSessionChanges((p) => [
      ...p,
      { index: editableData.length, action: "add", changes: {} },
    ]);
  };

  const handleFieldChange = (rowIndex, field, value, fundIndex = null) => {
    const newData = [...editableData];
    let oldVal;

    if (fundIndex !== null) {
      oldVal = newData[rowIndex].funds[fundIndex][field];
      newData[rowIndex].funds[fundIndex][field] = value;
    } else {
      oldVal = newData[rowIndex][field];
      newData[rowIndex][field] = value;
    }
    setEditableData(newData);

    setSessionChanges((prev) => {
      const cp = [...prev];
      const existingIndex = cp.findIndex(
        (c) => c.index === rowIndex && c.action !== "delete"
      );
      if (existingIndex >= 0) {
        cp[existingIndex] = {
          ...cp[existingIndex],
          action: cp[existingIndex].action === "add" ? "add" : "edit",
          changes: {
            ...cp[existingIndex].changes,
            [fundIndex !== null ? `${field}_${fundIndex}` : field]: {
              old: oldVal,
              new: value,
            },
          },
        };
      } else {
        cp.push({
          index: rowIndex,
          action: savedDataRef.current[rowIndex] ? "edit" : "add",
          changes: {
            [fundIndex !== null ? `${field}_${fundIndex}` : field]: {
              old: oldVal,
              new: value,
            },
          },
        });
      }
      return cp;
    });
  };

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
    } else if (typeof indexToDelete === "number") {
      const idx = indexToDelete;
      newChanges.push({ index: idx, action: "delete", deletedItem: newData[idx] });
      newData.splice(idx, 1);
    }

    newData.forEach((r, i) => (r.slNo = i + 1));
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
      {!isEditing && (
        <div className="flex justify-end pr-8 mt-10">
          <button
            className="flex items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim"
            onClick={() => setIsEditing(true)}
          >
            <FaUserEdit className="mr-2" /> Edit
          </button>
        </div>
      )}

      <div className="ic-table-container m-4">
        <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Seed Money</p>

        <table className="ic-data-table">
          <thead>
            <tr>
              <th className="ic-table-head">SL No</th>
              <th className="ic-table-head">Name</th>
              <th className="ic-table-head">Amount (₹)</th>
              <th className="ic-table-head">Organization</th>
              <th className="ic-table-head">Year</th>
              {isEditing && <th className="ic-table-head text-secd">Select</th>}
            </tr>
          </thead>

          <tbody>
            {editableData.map((row, i) =>
              (row.funds || []).map((fund, j) => (
                <tr key={`${i}-${j}`}>
                  {j === 0 && (
                    <>
                      <td rowSpan={row.funds.length} className="ic-table-data">{row.slNo ?? i + 1}</td>
                      <td rowSpan={row.funds.length} className="ic-table-data">
                        {isEditing ? (
                          <input
                            className="border px-0 py-1 w-full"
                            value={row.name ?? ""}
                            onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                          />
                        ) : (
                          row.name || "-"
                        )}
                      </td>
                    </>
                  )}

                  <td className="ic-table-data">
                    {isEditing ? (
                      <input
                        className="border px-0 py-1 w-full"
                        value={fund.amount_in_rupees ?? ""}
                        onChange={(e) => handleFieldChange(i, "amount_in_rupees", e.target.value, j)}
                      />
                    ) : (
                      fund.amount_in_rupees || "-"
                    )}
                  </td>
                  <td className="ic-table-data">
                    {isEditing ? (
                      <input
                        className="border px-0 py-1 w-full"
                        value={fund.organization ?? ""}
                        onChange={(e) => handleFieldChange(i, "organization", e.target.value, j)}
                      />
                    ) : (
                      fund.organization || "-"
                    )}
                  </td>
                  <td className="ic-table-data">
                    {isEditing ? (
                      <input
                        className="border px-0 py-1 w-full"
                        value={fund.year ?? ""}
                        onChange={(e) => handleFieldChange(i, "year", e.target.value, j)}
                      />
                    ) : (
                      fund.year || "-"
                    )}
                  </td>

                  {isEditing && j === 0 && (
                    <td rowSpan={row.funds.length} className="ic-table-data text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(i)}
                        onChange={() => toggleSelectRow(i)}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
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

      <div className="py-4 mt-4 flex justify-end gap-4">
        {isEditing && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-gray-500 px-3 py-2 rounded text-prim" onClick={handleCancelSession}>
              Cancel
            </button>
            {sessionChanges.length > 0 && (
              <button className="border-4 border-yellow-400 px-3 py-2 rounded-lg" onClick={handleSave}>
                Save
              </button>
            )}
          </div>
        )}

        {!isEditing && isSavedOnce && (
          <div className="flex flex-row gap-2 mr-8">
            <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>
              Discard All
            </button>
            <button className="bg-secd text-text px-3 py-2 flex flex-row rounded  hover:bg-brwn hover:text-prim " onClick={handleRequest}>
              <Send className="mr-2" /> Request
            </button>
          </div>
        )}
      </div>

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-center">  Request </h2>
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
                  </tr>
                </thead>
                <tbody>
                  {allChanges.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
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
                        <td className="py-2 px-3 border align-top">Seed Money</td>
                        <td className="py-2 px-3 border text-[13px]">
                          {change.action === "delete" ? (
                            <div>Row {change.index + 1} deleted</div>
                          ) : Object.keys(change.changes || {}).length === 0 ? (
                            <div>Added/changed entire row</div>
                          ) : (
                            Object.entries(change.changes).map(([field, values]) => (
                              <div key={field} className="mb-1">
                                <strong className="capitalize">{field}:</strong>{" "}
                                {values.old ?? "-"}
                                <ArrowDown className="inline mx-2" size={14} />
                                {values.new ?? "-"}
                              </div>
                            ))
                          )}
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
              <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-yellow-400 text-black">
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
