import React, { useEffect, useState } from "react";
import { Trash2, Plus, X, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

function IqaMem({ iqacData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { sendRequest, loading, error } = useAdminRequest();
  const cloneDeep = (obj) => {
    if (obj === undefined || obj === null) return obj;
    return JSON.parse(JSON.stringify(obj));
  };

  // 🔹 track all changes separately
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    if (iqacData) {
      setData(cloneDeep(iqacData));
      setOriginalData(cloneDeep(iqacData));
    }
  }, [iqacData]);

  /** ✅ Refactored trackChange */
  const trackChange = (action, groupIdx, memberIdx, newData, oldData = null) => {
    const category = data[groupIdx]?.category;
    const memberName = newData?.name || oldData?.name || "Unknown";

    setChanges((prev) => {
      const filtered = prev.filter(
        (c) =>
          !(
            c.category === category &&
            c.memberIdx === memberIdx &&
            c.action === action
          )
      );

      const existing = prev.find(
        (c) =>
          c.category === category &&
          c.memberIdx === memberIdx &&
          c.action === "updated"
      );

      const newChange = {
        action,
        category,
        groupIdx,
        memberIdx,
        memberName,
        newData: action !== "deleted" ? cloneDeep(newData) : null,
        oldData:
          action === "updated"
            ? existing?.oldData ?? cloneDeep(oldData)
            : null,
        timestamp: new Date().toISOString(),
      };

      return [...filtered, newChange];
    });

    setHasChanges(true);
  };

  /** ✅ handle field change */
  const handleFieldChange = (groupIdx, memberIdx, field, value) => {
    const updated = cloneDeep(data);
    const oldData = cloneDeep(
      originalData[groupIdx].members[memberIdx]
    );


    updated[groupIdx].members[memberIdx][field] = value;

    setData(updated);

    trackChange(
      "updated",
      groupIdx,
      memberIdx,
      cloneDeep(updated[groupIdx].members[memberIdx]),
      cloneDeep(
        originalData?.[groupIdx]?.members?.[memberIdx] ?? null
      )
    );

  };

  const handleAddMember = (groupIdx) => {
    const updated = cloneDeep(data);
    const newMember = {
      name: "",
      role: "",
      designation: "",
      imagepath: "",
    };
    updated[groupIdx].members.push(newMember);
    setData(updated);

    trackChange(
      "added",
      groupIdx,
      updated[groupIdx].members.length - 1,
      newMember
    );
  };

  const handleDeleteMember = (groupIdx, memberIdx) => {
    setDeleteConfirm({ groupIdx, memberIdx });
  };

  const confirmDelete = () => {
    const { groupIdx, memberIdx } = deleteConfirm;
    const deletedMember = cloneDeep(data[groupIdx].members[memberIdx]);

    const updated = cloneDeep(data);
    updated[groupIdx].members.splice(memberIdx, 1);
    setData(updated);

    trackChange("deleted", groupIdx, memberIdx, deletedMember);

    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (hasChanges) {
      setShowRequest(true);
    }
  };

  const handleCancel = () => {
    // Revert to original data
    setData(cloneDeep(originalData));
    setIsEditing(false);
    setHasChanges(false);
    setChanges([]);
    setShowRequest(false);
    toast.info("Changes cancelled");
  };

  const handleRequest = () => {
    setConfirmPopup(true);
  };

  const buildPayload = () => {
    return changes.map((change) => {
      let actionType = "";
      let title = "";
      let meta_data = null;
      let original_data = null;

      if (change.action === "added") {
        actionType = "insert";
        title = `insertion of iqac ${change.category.toLowerCase()} member`;
        meta_data = change.newData;
      } else if (change.action === "updated") {
        actionType = "update";
        title = `updation of iqac ${change.category.toLowerCase()} member`;
        meta_data = change.newData;
        original_data = change.oldData;
      } else if (change.action === "deleted") {
        actionType = "delete";
        title = `deletion of iqac ${change.category.toLowerCase()} member`;
        meta_data = change.newData;
      }

      return {
        collectionName: "iqac",
        collection_type: "members",
        action: actionType,
        title,
        category: change.category,
        meta_data: meta_data,
        original_data: original_data,
      };
    });
  };

  const handleConfirmRequest = async () => {
    if (changes.length === 0) return;

    const payload = buildPayload();

    const result = await sendRequest(payload);

    if (result) {
      setConfirmPopup(false);
      setOriginalData(cloneDeep(data));
      setChanges([]);
      setShowRequest(false);
      setHasChanges(false);
      setIsEditing(false);
      // toast.success("Request sent successfully!");
    }
  };

  const handleDiscard = () => {
    setData(cloneDeep(originalData));
    setChanges([]);
    setShowRequest(false);
    setHasChanges(false);
    setIsEditing(false);
    toast.info("All changes discarded.");
  };

  const handleUndoChange = (index) => {
    const changeToUndo = changes[index];

    // Revert the data based on the change being undone
    if (changeToUndo) {
      const revertedData = cloneDeep(originalData);

      // Apply all changes except the one being undone
      changes.forEach((change, idx) => {
        if (idx !== index) {
          const { groupIdx, memberIdx, action, newData, oldData } = change;

          if (action === "added") {
            // Add this member
            if (!revertedData[groupIdx].members[memberIdx]) {
              revertedData[groupIdx].members.splice(memberIdx, 0, newData);
            }
          } else if (action === "updated") {
            // Update this member
            if (revertedData[groupIdx].members[memberIdx]) {
              revertedData[groupIdx].members[memberIdx] = newData;
            }
          } else if (action === "deleted") {
            // Remove this member if present
            const memberToDelete = revertedData[groupIdx].members.findIndex(
              m => m.name === change.memberName
            );
            if (memberToDelete !== -1) {
              revertedData[groupIdx].members.splice(memberToDelete, 1);
            }
          }
        }
      });

      setData(revertedData);
    }

    // Remove the change
    setChanges(prev => prev.filter((_, i) => i !== index));
    if (changes.length === 1) {
      setHasChanges(false);
      setShowRequest(false);
    }
  };

  const getActionDisplay = (action) => {
    switch (action) {
      case "added": return { text: "➕ Added", color: "text-green-600", bgColor: "bg-green-50" };
      case "updated": return { text: "✎ Edited", color: "text-blue-600", bgColor: "bg-blue-50" };
      case "deleted": return { text: "🗑️ Deleted", color: "text-red-600", bgColor: "bg-red-50" };
      default: return { text: action, color: "text-gray-600", bgColor: "bg-gray-50" };
    }
  };

  return (
    <div className="mt-8 mb-4 px-4 relative min-h-[400px]">
      {/* Top-right Edit Button - Always visible when not editing but showRequest might be true */}
      <div className="absolute top-0 right-0 z-50">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-secd dark:bg-drks text-text rounded hover:bg-[#800000] hover:text-drkt flex items-center gap-1"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {/* Content */}
      {Array.isArray(data) && data?.map((group, groupIdx) => (
        <div key={groupIdx} className="mb-10">
          <h2 className="text-2xl font-semibold font-poppins mb-4 text-center text-accn dark:text-drkt">
            {group.category}
          </h2>

          <div className="flex flex-wrap gap-4">
            {group.members?.map((member, i) => {
              const isLast = i === group.members.length - 1;
              const isOdd = group.members.length % 2 !== 0;

              return (
                <div
                  key={i}
                  className={`relative 
                    ${group.members.length === 1
                      ? "basis-full max-w-xl mx-auto"
                      : isLast && isOdd
                        ? "md:basis-[48%] md:mx-auto"
                        : "md:basis-[48%]"
                    }
                    py-4 px-4 rounded-xl border-l-4 border-secd dark:border-drks
                    bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                    transition-colors duration-300 ease-in w-full
                  `}
                >
                  {isEditing && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleDeleteMember(groupIdx, i)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete member"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={member.name || ""}
                        placeholder="Name *"
                        onChange={(e) =>
                          handleFieldChange(
                            groupIdx,
                            i,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-secd"
                      />
                      <input
                        type="text"
                        value={member.designation || ""}
                        placeholder="Designation"
                        onChange={(e) =>
                          handleFieldChange(
                            groupIdx,
                            i,
                            "designation",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-secd"
                      />
                      <input
                        type="text"
                        value={member.role || ""}
                        placeholder="Role"
                        onChange={(e) =>
                          handleFieldChange(
                            groupIdx,
                            i,
                            "role",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-secd"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-poppins font-semibold">{member.name}</p>
                      {member.designation && (
                        <p className="text-sm text-accn dark:text-drka mt-1">
                          {member.designation}
                        </p>
                      )}
                      {member.role && (
                        <p className="text-sm text-accn dark:text-drka">
                          {member.role}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isEditing && (
              <div
                onClick={() => handleAddMember(groupIdx)}
                className="md:basis-[48%] flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer py-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus size={28} className="text-gray-500" />
              </div>
            )}
          </div>
        </div>
      ))}

      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Bottom Center Buttons - Inside Container */}
      <div className="flex justify-center gap-3 mt-6 mb-4">
        {isEditing && (
          <>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2 bg-secd text-white rounded hover:bg-[#800000] transition-colors ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={!hasChanges}
            >
              Save
            </button>
          </>
        )}

        {showRequest && !isEditing && (
          <>
            <button
              onClick={handleDiscard}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Discard Changes
            </button>
            <button
              onClick={handleRequest}
              className="px-6 py-2 bg-secd dark:bg-drks text-text rounded hover:bg-[#800000] hover:text-drkt transition-colors"
            >
              Request
            </button>
          </>
        )}
      </div>

      {/* Delete confirmation popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-sm mb-6 text-center text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this member?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Confirmation Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            {/* Title */}
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            {/* Note */}
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live
              site.
            </p>

            {/* Summary of Changes */}
            <div className="max-h-[300px] overflow-y-auto mb-4 border rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 border-b">Action</th>
                    <th className="py-2 px-3 border-b">Category</th>
                    <th className="py-2 px-3 border-b">Member</th>
                    <th className="py-2 px-3 border-b text-center">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.length > 0 ? (
                    changes.map((change, index) => {
                      const actionDisplay = getActionDisplay(change.action);
                      return (
                        <tr key={index} className={`border-b ${actionDisplay.bgColor}`}>
                          {/* Action */}
                          <td className="py-2 px-3">
                            <span className={`font-medium ${actionDisplay.color}`}>
                              {actionDisplay.text}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-2 px-3 font-medium">
                            {change.category}
                          </td>

                          {/* Member Details */}
                          <td className="py-2 px-3">
                            <div className="text-sm">
                              {change.action === "added" && (
                                <span className="text-green-600 block">
                                  New: {change.newData?.name || "Unnamed"}
                                </span>
                              )}
                              {change.action === "updated" && (
                                <>
                                  {/* <span className="text-gray-500 line-through block text-xs">
                                    Old: {change.oldData?.name} - {change.oldData?.designation}
                                  </span> */}
                                  <span className="text-blue-600 block text-sm">
                                    {change.newData?.name} - {change.newData?.designation}
                                  </span>
                                </>
                              )}
                              {change.action === "deleted" && (
                                <span className="text-red-600 block">
                                  Deleted: {change.newData?.name}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Undo Button */}
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleUndoChange(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Undo this change"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400">
                        No changes to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed opacity-50" : "hover:bg-gray-500"
                  } transition-colors`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className={`px-4 py-2 rounded bg-secd text-white ${loading ? "cursor-progress opacity-50" : "hover:bg-[#800000]"
                  } transition-colors`}
                disabled={changes.length === 0 || loading}
              >
                {loading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IqaMem;