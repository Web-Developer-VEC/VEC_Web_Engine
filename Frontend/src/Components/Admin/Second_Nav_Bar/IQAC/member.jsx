import React, { useEffect, useState } from "react";
import { Trash2, Plus, X, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function IqaMem({ iqacData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(null); // local working data
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 🔹 track all changes separately
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    setData(iqacData || []);
  }, [iqacData]);

  const trackChange = (action, groupIdx, memberIdx, newData, oldData = null) => {
    const category = data[groupIdx]?.category;

    setChanges((prev) => {
      // 🟢 If it's an update on an already "added" member → just replace last newData
      if (action === "updated") {
        const existingAdd = prev.find(
          (c) =>
            c.action === "added" &&
            c.category === category &&
            c.memberIdx === memberIdx
        );
        if (existingAdd) {
          return prev?.map((c) =>
            c === existingAdd ? { ...c, newData } : c
          );
        }
      }

      // 🟢 For updates → merge with latest update for the same member instead of duplicating
      if (action === "updated") {
        const withoutOld = prev.filter(
          (c) =>
            !(
              c.action === "updated" &&
              c.category === category &&
              c.memberIdx === memberIdx
            )
        );
        return [
          ...withoutOld,
          {
            action,
            category,
            memberIdx,
            newData,
            oldData,
            timestamp: new Date().toISOString(),
          },
        ];
      }

      // Default case → add new change
      return [
        ...prev,
        {
          action,
          category,
          memberIdx,
          newData,
          oldData,
          timestamp: new Date().toISOString(),
        },
      ];
    });

    setHasChanges(true);
  };

  const handleFieldChange = (groupIdx, memberIdx, field, value) => {
    const updated = [...data];
    const oldData = { ...updated[groupIdx].members[memberIdx] };

    updated[groupIdx].members[memberIdx][field] = value;
    setData(updated);

    trackChange(
      "updated",
      groupIdx,
      memberIdx,
      updated[groupIdx].members[memberIdx],
      oldData
    );
  };

  const handleAddMember = (groupIdx) => {
    const updated = [...data];
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
    const deletedMember = data[groupIdx].members[memberIdx];

    const updated = [...data];
    updated[groupIdx].members.splice(memberIdx, 1);
    setData(updated);

    trackChange("deleted", groupIdx, memberIdx, deletedMember);

    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (hasChanges) {
      setShowRequest(true); // only show request/discard after changes
    }
    console.log("Saved locally:", data);
    console.log("Pending Changes:", changes);
  };

  const handleRequest = () => {
    setConfirmPopup(true);
  };

  const handleConfirmRequest = () => {
    setConfirmPopup(false);
    console.log("Final submitted data:", data);
    console.log("Submitted Changes:", changes);
    toast.success("Request submitted successfully!");
    // 👉 Here you can send { data, changes } to your backend
    setChanges([]); // clear after submission
    setShowRequest(false);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setData(iqacData || []);
    setChanges([]);
    setShowRequest(false);
    setHasChanges(false);
    toast.info("All changes discarded.");
  };

  const handleUndoChange = (index) => {
    setChanges((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-8 mb-4 px-4">
      {/* Top-right Edit Button */}
      <div className="top-10 right-10 flex justify-end gap-2 z-50">
        {!isEditing && !showRequest && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 bg-secd dark:bg-drks text-text rounded hover:bg-[#800000] hover:text-drkt flex items-center gap-1"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {/* Content */}
      {Array.isArray(data) &&
        data?.map((group, groupIdx) => (
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
                      ${
                        group.members.length === 1
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
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}

                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={member.name}
                          placeholder="Name"
                          onChange={(e) =>
                            handleFieldChange(
                              groupIdx,
                              i,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                          type="text"
                          value={member.designation}
                          placeholder="Designation"
                          onChange={(e) =>
                            handleFieldChange(
                              groupIdx,
                              i,
                              "designation",
                              e.target.value
                            )
                          }
                          className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                          type="text"
                          value={member.role}
                          placeholder="Role"
                          onChange={(e) =>
                            handleFieldChange(
                              groupIdx,
                              i,
                              "role",
                              e.target.value
                            )
                          }
                          className="w-full mb-2 p-2 border rounded"
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-poppins">{member.name}</p>
                        {member.designation && (
                          <p className="text-sm text-accn dark:text-drka">
                            {member.designation}
                          </p>
                        )}
                        {member.role && (
                          <p className="text-sm text-accn dark:text-drka">
                            {member.role}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {isEditing && (
                <div
                  onClick={() => handleAddMember(groupIdx)}
                  className="md:basis-[48%] flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer py-6 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus size={28} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
        ))}

      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Bottom Buttons */}
      <div className="flex justify-center mt-6 gap-3">
        {isEditing && !hasChanges && (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
        )}

        {isEditing && hasChanges && (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-secd text-white rounded hover:bg-[#800000]"
            >
              Save
            </button>
          </>
        )}

        {showRequest && !isEditing && (
          <>
            <button
              onClick={handleDiscard}
              className="px-6 py-2 bg-gray-400 text-white rounded"
            >
              Discard Changes
            </button>
            <button
              onClick={handleRequest}
              className="px-6 py-2 bg-secd dark:bg-drks text-text rounded hover:bg-[#800000] hover:text-drkt"
            >
              Request
            </button>
          </>
        )}
      </div>

      {/* Delete confirmation popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex justify-center z-[1000] overflow-y-auto py-10">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px] h-fit my-auto">
            <h2 className="text-lg font-bold mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete this member?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Confirmation Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex justify-center z-[1000] overflow-y-auto py-10">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[550px] h-fit my-auto">
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
            <div className="max-h-[250px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="py-1 border">Action</th>
                    <th className="py-1 border">Section</th>
                    <th className="py-1 border text-center">Changes</th>
                    <th className="py-1 border text-center">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.length > 0 ? (
                    changes?.map((change, index) => (
                      <tr key={index} className="border-b">
                        {/* Action */}
                        <td className="py-1 text-blue-600 border capitalize">
                          {change.action}
                        </td>

                        {/* Section / Category */}
                        <td className="py-1 border">{change.category}</td>

                        {/* Changes */}
                        <td className="py-1 text-[12px] flex flex-col items-center gap-1 border">
                          {change.action === "updated" && (
                            <span className="text-red-400">
                              {change.newData.name}
                            </span>
                          )}

                          {change.action === "added" && (
                            <span className="text-green-500">
                              ➕ {change.newData?.name || "New Member Added"}
                            </span>
                          )}

                          {change.action === "deleted" && (
                            <span className="text-red-500">
                              🗑️ {change.newData?.name || "Member Deleted"}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleUndoChange(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-2 text-gray-400">
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
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IqaMem;