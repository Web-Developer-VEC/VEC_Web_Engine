// Components/Second_Nav_Bar/IIC/IICFaculty.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import "./IICFaculty.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

/* ----------------------------
   IICFaculty component
   - manages faculty rows: add/edit/delete/draft/final request
   - builds payload array for insert/update/delete and sends via useAdminRequest
   ---------------------------- */
function IICFaculty({ data }) {
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

  // useAdminRequest hook for sending final payloads
  const { sendRequest, loading } = useAdminRequest();

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((faculty, idx) => ({
        id: faculty.id ?? idx,
        name: faculty.name ?? "",
        designation: faculty.designation ?? "",
        selected: false,
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
    // If draft exists, edit that, otherwise edit committed data
    const baseData = pendingRows ? deepCopy(pendingRows) : deepCopy(committedRows);

    setRows(baseData);
    setIsEditing(true);
    setIsDirty(false);

    // 🔑 Reset this so discard/request buttons don't show while editing
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
    setRows((prev) => [
      ...prev.map((r) => ({ ...r })),
      {
        id: Date.now(),
        name: "",
        designation: "",
        selected: false,
      },
    ]);
    setIsDirty(true);
  };

  const handleRowSelect = (index) => {
    const updatedRows = rows.map((row, i) => (i === index ? { ...row, selected: !row.selected } : row));

    setRows(updatedRows);

    const selectedIndices = updatedRows.map((row, i) => (row.selected ? i : -1)).filter((i) => i !== -1);

    setSelectedRows(new Set(selectedIndices));
    setSelectAll(selectedIndices.length === updatedRows.length && updatedRows.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedRows = rows.map((row) => ({ ...row, selected: newSelectAll }));
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
      // Restore the draft (pending changes)
      setRows(deepCopy(pendingRows));
      toast.info("Cancelled edits. Draft preserved!");
    } else {
      // No draft, restore original committed data
      setRows(deepCopy(committedRows));
      toast.info("Cancelled. Reverted to original data!");
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedRows(new Set());
    setSelectAll(false);
    setIsSaved(!!pendingRows); // true if draft exists
  };

  const handleSave = () => {
    const invalidItem = rows.find((item) => !item.name?.trim() || !item.designation?.trim());

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

  // Build payload and send to server
  const handleFinalRequestConfirm = async () => {
    const draft = pendingRows;
    if (!draft) {
      toast.error("No draft to submit. Save changes first.");
      return;
    }

    const committedMap = new Map(committedRows.map((r) => [String(r.id), r]));
    const draftMap = new Map(draft.map((r) => [String(r.id), r]));

    const payload = [];

    // Deleted items: in committed but not in draft
    for (const [id, oldRow] of committedMap.entries()) {
      if (!draftMap.has(id)) {
        payload.push({
          collectionName: "iic",
          collection_type: "faculty",
          action: "delete",
          title: `Delete ${oldRow.name}`,
          meta_data: {
            name: oldRow.name,
            designation: oldRow.designation,
          },
        });
      }
    }

    // Added & Updated
    for (const [id, newRow] of draftMap.entries()) {
      const oldRow = committedMap.get(id);
      if (!oldRow) {
        // Insert
        payload.push({
          collectionName: "iic",
          collection_type: "faculty",
          action: "insert",
          title: `Insert ${newRow.name}`,
          meta_data: {
            name: newRow.name,
            designation: newRow.designation,
          },
        });
      } else {
        // Possibly updated
        if (oldRow.name !== newRow.name || oldRow.designation !== newRow.designation) {
          payload.push({
            collectionName: "iic",
            collection_type: "faculty",
            action: "update",
            title: `Update ${newRow.name}`,
            meta_data: {
              name: newRow.name,
              designation: newRow.designation,
            },
            original_data: {
              name: oldRow.name,
              designation: oldRow.designation,
            },
          });
        }
      }
    }

    if (payload.length === 0) {
      toast.info("No changes detected to submit.");
      setShowRequestModal(false);
      return;
    }

    try {
      // sendRequest handles FormData and token; we're sending only JSON payload so pass empty files array
      const res = await sendRequest(payload, []);
      if (res) {
        // commit locally
        setCommittedRows(deepCopy(draft));
        setRows(deepCopy(draft));
        setPendingRows(null);
        setIsSaved(false);
        setShowRequestModal(false);
        setIsEditing(false);
        setIsDirty(false);
        toast.success("Final request submitted!");
      } else {
        toast.error("Request failed. Check console for details.");
      }
    } catch (err) {
      console.error("Final request error (faculty):", err);
      toast.error("An error occurred while sending final request.");
    }
  };

  const revertChange = (rowId) => {
    if (!pendingRows) return;

    let reverted = deepCopy(pendingRows);

    const oldRow = committedRows.find((r) => r.id === rowId);
    const isDeleted = !reverted.some((r) => r.id === rowId);
    const isAdded = !committedRows.some((r) => r.id === rowId);

    if (isDeleted && oldRow) {
      // find the original index of the row in committedRows
      const originalIndex = committedRows.findIndex((r) => r.id === rowId);
      // insert it back in the correct place
      reverted.splice(originalIndex, 0, deepCopy(oldRow));
    } else if (isAdded) {
      // remove newly added row
      reverted = reverted.filter((r) => r.id !== rowId);
    } else if (oldRow) {
      // revert edits
      reverted = reverted.map((r) => (r.id === rowId ? deepCopy(oldRow) : r));
    }

    setPendingRows(reverted);
    setRows(deepCopy(reverted));

    // check if still has diffs
    const committedMap = new Map(committedRows.map((r) => [r.id, r]));
    const hasDiff =
      reverted.length !== committedRows.length ||
      reverted.some((r) => {
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

    const committedMap = new Map(committedRows.map((r) => [r.id, r]));
    const pendingMap = new Map(pendingRows.map((r) => [r.id, r]));

    // Deleted rows
    committedRows.forEach((oldRow) => {
      if (!pendingMap.has(oldRow.id)) {
        changes.push({
          action: "Deleted",
          section: "Faculty Details",
          changes: `Faculty: ${oldRow.name}`,
          rowId: oldRow.id,
        });
      }
    });

    // Added + Edited rows
    pendingRows.forEach((newRow) => {
      if (!committedMap.has(newRow.id)) {
        changes.push({
          action: "Added",
          section: "Faculty Details",
          changes: `Faculty: ${newRow.name}`,
          rowId: newRow.id,
        });
      } else {
        const oldRow = committedMap.get(newRow.id);
        if (oldRow.name !== newRow.name || oldRow.designation !== newRow.designation) {
          changes.push({
            action: "Edited",
            section: "Faculty Details",
            changes: `Faculty: ${newRow.name}`,
            rowId: newRow.id,
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
    return String(str || "").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  return (
    <>
      <div className="p-8 relative">
        {/* Header with Edit Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          {/* Title centered */}
          <div className="flex-1 flex justify-center md:justify-center">
            <h2 className="iic-h3 text-brwn dark:text-drkt font-bold">Faculty Members</h2>
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
          {rows.map((faculty, i) => (
            <div
              key={faculty.id ?? i}
              className={`iic-faculty-card dark:bg-text relative ${faculty.selected ? "ring-2 ring-blue-500" : ""}`}
            >
              {isEditing && (
                <input
                  type="checkbox"
                  checked={faculty.selected || false}
                  onChange={() => handleRowSelect(i)}
                  className="absolute top-2 right-2 h-4 w-4"
                />
              )}

              <div className="ncc-n-stu-detail p-2 text-left">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={faculty.name}
                      onChange={(e) => handleChange(i, "name", e.target.value.toUpperCase())} // convert to uppercase
                      className="border p-1 w-full mb-2 text-center"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={faculty.designation}
                      onChange={(e) => handleChange(i, "designation", toTitleCase(e.target.value))}
                      className="border p-1 w-full"
                      placeholder="Designation"
                    />
                  </>
                ) : (
                  <>
                    <h5 className="text-center text-[18px]">{faculty.name}</h5>
                    <p className="pl-4 text-brwn text-center dark:text-drka text-sm">{faculty.designation}</p>
                  </>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <div
              className="iic-faculty-card flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-500 p-7"
              onClick={handleAddRow}
            >
              <Plus size={20} className="text-gray-500 mr-2" />
              <span className="text-gray-500">Add Faculty</span>
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
              <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
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
                          <button onClick={() => revertChange(ch.rowId)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Final Request"}
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
                Are you sure you want to delete {selectedRows.size} selected faculty member{selectedRows.size > 1 ? "s" : ""}?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteIndex(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700">
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

const IICStudent = ({ data = [] }) => {
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

  const { sendRequest, loading: requestLoading, error } = useAdminRequest();

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((categoryBlock, idx) => ({
        id: categoryBlock.id || idx,
        category: categoryBlock.category || "",
        members:
          categoryBlock.members?.map((member, memIdx) => ({
            id: member.id || `${idx}-${memIdx}`,
            name: member.name || "",
            // mail_id: member.mail_id || "",
            // phone: member.phone || "",
            // sex: member.sex || "",
            responsibility: member.responsibility || "",
            dept: member.dept || "",
            year: member.year || "",
            selected: false,
          })) || [],
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
    const baseData = pendingRows ? deepCopy(pendingRows) : deepCopy(committedRows);
    setRows(baseData);
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(false);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const handleChange = (catIdx, memIdx, field, value) => {
    const updated = deepCopy(rows);
    updated[catIdx].members[memIdx][field] = value;
    setRows(updated);
    setIsDirty(true);
  };

  const handleAddRow = (catIdx) => {
    const updated = deepCopy(rows);
    updated[catIdx].members.push({
      id: Date.now(),
      name: "",
      // mail_id: "",
      // phone: "",
      // sex: "",
      responsibility: "",
      dept: "",
      year: "",
      selected: false,
    });
    setRows(updated);
    setIsDirty(true);
  };

  const handleRowSelect = (catIdx, memIdx) => {
    const key = `${catIdx}-${memIdx}`;
    const updatedRows = deepCopy(rows);
    updatedRows[catIdx].members[memIdx].selected = !updatedRows[catIdx].members[memIdx].selected;

    setRows(updatedRows);

    const selectedIndices = new Set();
    updatedRows.forEach((category, cIdx) => {
      category.members.forEach((member, mIdx) => {
        if (member.selected) {
          selectedIndices.add(`${cIdx}-${mIdx}`);
        }
      });
    });

    setSelectedRows(selectedIndices);
  };

  const confirmDelete = () => {
    const updated = deepCopy(rows);

    selectedRows.forEach((key) => {
      const [catIdx, memIdx] = key.split("-").map(Number);
      updated[catIdx].members.splice(memIdx, 1);
    });

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
    const invalidItem = rows.some((category) =>
      category.members.some((member) => 
        !member.name?.trim() || 
        // !member.mail_id?.trim() || 
        // !member.phone?.trim() || 
        // !member.sex?.trim() || 
        !member.responsibility?.trim() || 
        !member.dept?.trim() || 
        !member.year?.trim()
      )
    );

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

  const buildPayload = () => {
    if (!pendingRows) return [];
    
    const payload = [];
    
    // Create maps for easy lookup
    const committedFlat = [];
    const pendingFlat = [];
    
    // Flatten committed rows
    committedRows.forEach((categoryBlock, catIdx) => {
      categoryBlock.members.forEach((member, memIdx) => {
        committedFlat.push({
          ...member,
          category: categoryBlock.category,
          catIdx,
          memIdx
        });
      });
    });
    
    // Flatten pending rows
    pendingRows.forEach((categoryBlock, catIdx) => {
      categoryBlock.members.forEach((member, memIdx) => {
        pendingFlat.push({
          ...member,
          category: categoryBlock.category,
          catIdx,
          memIdx
        });
      });
    });
    
    // Create maps by id
    const committedMap = new Map(committedFlat.map(m => [m.id, m]));
    const pendingMap = new Map(pendingFlat.map(m => [m.id, m]));
    
    // Check for deleted members
    committedFlat.forEach(oldMember => {
      if (!pendingMap.has(oldMember.id)) {
        payload.push({
          collectionName: "iic",
          collection_type: "student_representation",
          action: "delete",
          title: `Delete ${oldMember.name} - ${oldMember.category}`,
          category: oldMember.category,
          meta_data: {
            name: oldMember.name,
            // mail_id: oldMember.mail_id,
            // phone: oldMember.phone,
            // sex: oldMember.sex,
            year: oldMember.year,
            dept: oldMember.dept,
            responsibility: oldMember.responsibility
          }
        });
      }
    });
    
    // Check for added and updated members
    pendingFlat.forEach(newMember => {
      if (!committedMap.has(newMember.id)) {
        // New member (insert)
        payload.push({
          collectionName: "iic",
          collection_type: "student_representation",
          action: "insert",
          title: `Insert ${newMember.name} - ${newMember.category}`,
          category: newMember.category,
          meta_data: {
            name: newMember.name,
            // mail_id: newMember.mail_id,
            // phone: newMember.phone,
            // sex: newMember.sex,
            year: newMember.year,
            dept: newMember.dept,
            responsibility: newMember.responsibility
          }
        });
      } else {
        const oldMember = committedMap.get(newMember.id);
        // Check if member was updated
        if (
          oldMember.name !== newMember.name ||
          // oldMember.mail_id !== newMember.mail_id ||
          // oldMember.phone !== newMember.phone ||
          // oldMember.sex !== newMember.sex ||
          oldMember.year !== newMember.year ||
          oldMember.dept !== newMember.dept ||
          oldMember.responsibility !== newMember.responsibility
        ) {
          payload.push({
            collectionName: "iic",
            collection_type: "student_representation",
            action: "update",
            title: `Update ${newMember.name} - ${newMember.category}`,
            category: newMember.category,
            meta_data: {
              name: newMember.name,
              // mail_id: newMember.mail_id,
              // phone: newMember.phone,
              // sex: newMember.sex,
              year: newMember.year,
              dept: newMember.dept,
              responsibility: newMember.responsibility
            },
            original_data: {
              name: oldMember.name,
              // mail_id: oldMember.mail_id,
              // phone: oldMember.phone,
              // sex: oldMember.sex,
              year: oldMember.year,
              dept: oldMember.dept,
              responsibility: oldMember.responsibility
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
      toast.error("No changes to submit!");
      return;
    }

    console.log("Submitting student payload:", payload);
    
    const result = await sendRequest(payload, []);
    
    if (result) {
      // Update committed rows with pending rows
      setCommittedRows(deepCopy(pendingRows));
      setRows(deepCopy(pendingRows));
      setPendingRows(null);
      setIsSaved(false);
      setShowRequestModal(false);
      toast.success("Final request submitted successfully!");
    } else {
      toast.error("Failed to submit request. Please check console for details.");
    }
  };

  // Advanced change tracking with revert functionality
  const revertChange = (change) => {
    if (!pendingRows) return;

    let reverted = deepCopy(pendingRows);

    if (change.catIdx !== undefined && change.memIdx !== undefined) {
      // Handle category/member level changes
      const oldMember = committedRows[change.catIdx]?.members[change.memIdx];

      if (change.action === "Deleted" && oldMember) {
        // Re-add deleted member
        reverted[change.catIdx].members.splice(change.memIdx, 0, deepCopy(oldMember));
      } else if (change.action === "Added") {
        // Remove added member
        reverted[change.catIdx].members.splice(change.memIdx, 1);
      } else if (change.action === "Edited" && oldMember) {
        // Revert edited member
        reverted[change.catIdx].members[change.memIdx] = deepCopy(oldMember);
      }
    } else if (change.catIdx !== undefined) {
      // Handle category level changes
      const oldCategory = committedRows[change.catIdx];

      if (change.action === "Deleted" && oldCategory) {
        // Re-add deleted category
        reverted.splice(change.catIdx, 0, deepCopy(oldCategory));
      } else if (change.action === "Added") {
        // Remove added category
        reverted.splice(change.catIdx, 1);
      }
    }

    setPendingRows(reverted);
    setRows(deepCopy(reverted));

    // Check if changes still exist
    const hasDiff = JSON.stringify(reverted) !== JSON.stringify(committedRows);
    if (!hasDiff) {
      setPendingRows(null);
      setIsSaved(false);
      setShowRequestModal(false);
    }
  };

  const getChanges = () => {
    if (!pendingRows) return [];
    const changes = [];

    pendingRows.forEach((newCategory, catIdx) => {
      const oldCategory = committedRows.find((c) => c.id === newCategory.id);

      if (!oldCategory) {
        changes.push({ action: "Added", section: "Category", changes: newCategory.category, catIdx });
        return;
      }

      // Track member changes
      newCategory.members.forEach((newMember, memIdx) => {
        const oldMember = oldCategory.members.find((m) => m.id === newMember.id);

        if (!oldMember) {
          changes.push({ action: "Added", section: newCategory.category, changes: newMember.name, catIdx, memIdx });
        } else if (
          oldMember.name !== newMember.name ||
          // oldMember.mail_id !== newMember.mail_id ||
          // oldMember.phone !== newMember.phone ||
          // oldMember.sex !== newMember.sex ||
          oldMember.year !== newMember.year ||
          oldMember.dept !== newMember.dept ||
          oldMember.responsibility !== newMember.responsibility
        ) {
          changes.push({ action: "Edited", section: newCategory.category, changes: newMember.name, catIdx, memIdx });
        }
      });

      // Check for deleted members
      oldCategory.members.forEach((oldMember) => {
        const stillExists = newCategory.members.find((m) => m.id === oldMember.id);
        if (!stillExists) {
          const memIdx = oldCategory.members.indexOf(oldMember);
          changes.push({ action: "Deleted", section: oldCategory.category, changes: oldMember.name, catIdx, memIdx });
        }
      });
    });

    // Check for deleted categories
    committedRows.forEach((oldCategory) => {
      const stillExists = pendingRows.find((c) => c.id === oldCategory.id);
      if (!stillExists) {
        const catIdx = committedRows.indexOf(oldCategory);
        changes.push({ action: "Deleted", section: "Category", changes: oldCategory.category, catIdx });
      }
    });

    return changes;
  };

  const changes = getChanges();

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const toTitleCase = (str) => {
    return String(str || "").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  return (
    <div className="p-2 relative">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        {/* Title centered */}
        <div className="flex-1 flex justify-center md:justify-center">
          <h2 className="iic-h3 text-brwn dark:text-drkt">Student Representation</h2>
        </div>

        {/* Edit button on right */}
        <div className="flex justify-end mt-2 md:mt-0">
          {!isEditing && !isSaved && (
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

      {rows.map((categoryBlock, catIdx) => (
        <div key={catIdx}>
          <h2 className="text-3xl font-bold text-brwn dark:text-drkt text-center my-4">{categoryBlock?.category}</h2>

          <div className="flex flex-wrap gap-[20px] justify-center">
            {categoryBlock?.members?.map((details, memIdx) => {
              const key = `${catIdx}-${memIdx}`;
              return (
                <div key={key} className={`iic-faculty-card dark:bg-text relative ${details.selected ? "ring-2 ring-blue-500" : ""}`}>
                  {isEditing && (
                    <input
                      type="checkbox"
                      checked={details.selected || false}
                      onChange={() => handleRowSelect(catIdx, memIdx)}
                      className="absolute top-2 right-2 h-4 w-4"
                    />
                  )}

                  <div className="ncc-n-stu-detail p-2 text-left">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={details.name}
                          onChange={(e) => handleChange(catIdx, memIdx, "name", e.target.value.toUpperCase())}
                          className="border p-1 w-full mb-2"
                          placeholder="Name"
                        />
                        {/* <input
                          type="email"
                          value={details.mail_id}
                          onChange={(e) => handleChange(catIdx, memIdx, "mail_id", e.target.value)}
                          className="border p-1 w-full mb-2"
                          placeholder="Email ID"
                        />
                        <input
                          type="text"
                          value={details.phone}
                          onChange={(e) => handleChange(catIdx, memIdx, "phone", e.target.value)}
                          className="border p-1 w-full mb-2"
                          placeholder="Phone"
                        />
                        <select
                          value={details.sex}
                          onChange={(e) => handleChange(catIdx, memIdx, "sex", e.target.value)}
                          className="border p-1 w-full mb-2"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select> */}
                        <input
                          type="text"
                          value={details.responsibility}
                          onChange={(e) => {
                            const formattedValue = toTitleCase(e.target.value);
                            handleChange(catIdx, memIdx, "responsibility", formattedValue);
                          }}
                          className="border p-1 w-full mb-2"
                          placeholder="Responsibility"
                        />
                        <input
                          type="text"
                          value={details.dept}
                          onChange={(e) => handleChange(catIdx, memIdx, "dept", e.target.value.toUpperCase())}
                          className="border p-1 w-full mb-2"
                          placeholder="Department"
                        />
                        <input
                          type="text"
                          value={details.year}
                          onChange={(e) => handleChange(catIdx, memIdx, "year", e.target.value.toUpperCase())}
                          className="border p-1 w-full"
                          placeholder="Year"
                        />
                      </>
                    ) : (
                      <>
                        <h5 className="text-center text-[18px] font-semibold">{details?.name}</h5>
                        {/* <p className="pl-4 text-brwn dark:text-drka text-sm">Email: {details?.mail_id}</p> */}
                        {/* <p className="pl-4 text-brwn dark:text-drka text-sm">Phone: {details?.phone}</p> */}
                        {/* <p className="pl-4 text-brwn dark:text-drka text-sm">Gender: {details?.sex}</p> */}
                        <p className="pl-4 text-brwn dark:text-drka text-sm">Responsibility: {details?.responsibility}</p>
                        <p className="pl-4 text-brwn dark:text-drka text-sm">
                          {details?.dept} - {details?.year}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {isEditing && (
              <div className="iic-faculty-card flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-500 p-7" onClick={() => handleAddRow(catIdx)}>
                <Plus size={20} className="text-gray-500 mr-2" />
                <span className="text-gray-500">Add Student</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Footer Buttons */}
      {isEditing && (
        <>
          {/* Delete Selected - Centered */}
          {selectedRows.size > 0 && (
            <div className="flex justify-center my-4">
              <button onClick={() => setDeleteIndex(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-prim rounded hover:bg-red-600">
                <Trash2 size={18} /> Delete Selected ({selectedRows.size})
              </button>
            </div>
          )}

          {/* Cancel & Save - Right aligned */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
              Cancel
            </button>
            {isDirty && (
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
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
            <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
              <Send size={18} /> Request
            </button>
          )}
        </div>
      )}

      {/* Final Request Modal with Revert Functionality */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go on live.
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
                        <button onClick={() => revertChange(ch)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
      {deleteIndex && (
        <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
          <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedRows.size} selected student{selectedRows.size > 1 ? "s" : ""}?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteIndex(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};


export { IICFaculty, IICStudent };
