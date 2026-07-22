import { useEffect, useState } from "react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X, Pencil, Trash2, Save, Send } from "lucide-react";

export function LIBCommitteMembers({ data }) {
  const [members, setMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (data) {
      setMembers(data);
      setOriginalMembers(data);
    }
  }, [data]);

  // Track all changes
  const [changes, setChanges] = useState([]);

  // Toggle checkbox
  const toggleCheckbox = (index) => {
    if (selectedMembers.includes(index)) {
      setSelectedMembers(selectedMembers.filter((i) => i !== index));
    } else {
      setSelectedMembers([...selectedMembers, index]);
    }
  };

  // Open confirm modal instead of direct delete
  const handleDeleteSelected = () => {
    if (selectedMembers.length > 0) {
      setShowDeleteConfirm(true);
    }
  };
  const buildAdvisorPayload = (change) => {
    const base = {
      collectionName: "library",
      collection_type: "advisors",
    };

    // 🟢 ADD (INSERT)
    if (change.type === "Added") {
      // prefer the snapshot if available
      const current = change.newData || members[change.index];

      if (!current?.name || !current?.designation) return null;

      return {
        ...base,
        action: "insert",
        title: "Add new advisors",
        meta_data: {
          name: current.name,
          designation: current.designation,
        },
      };
    }

    // ✏️ UPDATE
    if (change.type === "Edited") {
      // prefer explicit snapshots stored on the change; fall back to
      // looking up by index in case the item was removed/added later
      const original = change.oldData || originalMembers[change.index];
      const updated = change.newData || members[change.index];

      if (!original || !updated) return null;

      return {
        collectionName: "library",
        collection_type: "advisors",
        action: "update",
        title: "update advisors",

        original_data: {
          name: original.name,
          designation: original.designation,
        },

        meta_data: {
          name: updated.name,
          designation: updated.designation,
        },
      };
    }

    // ❌ DELETE
    if (change.type === "Deleted") {
      return {
        ...base,
        action: "delete",
        title: "delete advisors",
        meta_data: {
          name: change.data.name,
          designation: change.data.designation,
        },
      };
    }

    return null;
  };

  const formatMemberValue = (member) => {
    if (!member) return "Member";
    return `${member.name || "Unnamed"}${member.designation ? " – " + member.designation : ""
      }`;
  };

  // Confirm delete action
  const confirmDeleteSelected = () => {
    // capture selected indexes now to avoid state-timing issues
    const selIndexes = [...selectedMembers];
    const updated = members.filter((_, i) => !selIndexes.includes(i));
    const deleted = members.filter((_, i) => selIndexes.includes(i));

    setMembers(updated);
    setHasChanges(true);
    setShowDeleteConfirm(false);
    // clear selection AFTER we've captured it
    setSelectedMembers([]);

    // Remove any pending Added/Edited changes for the deleted indexes
    setChanges((prev) => {
      // Build a set of selected indexes for quick lookup (use captured selIndexes)
      const sel = new Set(selIndexes);

      // Filter out any prior change that refers to a deleted index
      let cleaned = prev.filter((c) => !sel.has(c.index));

      const deletedChanges = selIndexes
        .filter((i) => !members[i]?.isNew) // ignore newly added rows
        .map((i) => {
          const orig = originalMembers[i] || members[i];

          return {
            type: "Deleted",
            section: "Library Advisory Committee",
            field: "member",
            value: orig?.name || "Unnamed",
            data: orig,
            index: i,
          };
        });

      // Also remove any prior 'Added' changes that correspond to deleted new items
      const deletedNewNames = new Set(deleted.filter((d) => d?.isNew).map((d) => d.name));
      cleaned = cleaned.filter((c) => !(c.type === 'Added' && deletedNewNames.has(c.value)));

      return [...cleaned, ...deletedChanges];
    });

    toast.info("Selected members deleted");
  };

  const cancelDeleteSelected = () => {
    setShowDeleteConfirm(false);
  };
  // console.log("appu",changes);-7

  const handleAddInlineMember = () => {
    const newMember = { name: "", designation: "", isNew: true };

    setMembers((prev) => {
      const updated = [...prev, newMember];

      setChanges((changes) => [
        ...changes,
        {
          type: "Added",
          section: "Library Advisory Committee",
          field: "member",
          value: newMember.name || "Unnamed",
          data: newMember,
          newData: newMember,
          index: updated.length - 1,
        },
      ]);

      return updated;
    });

    setHasChanges(true);
  };

  const handleEditChange = (index, field, value) => {
    // update the members state first
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    setHasChanges(true);

    setChanges((prev) => {
      // build a snapshot of the updated member using the new field value
      const priorMember = members[index] || {};
      const updatedMember = { ...priorMember, [field]: value };
      const originalMember = originalMembers[index] || priorMember;

      // if this member was added during this edit session, just adjust that
      if (priorMember?.isNew) {
        return prev.map((c) => {
          if (c.type === "Added" && c.index === index) {
            return {
              ...c,
              // keep the displayed name in sync
              value: updatedMember.name || "Unnamed",
              newData: updatedMember,
            };
          }
          return c;
        });
      }

      const existingIndex = prev.findIndex(
        (c) => c.type === "Edited" && c.index === index,
      );

      if (existingIndex !== -1) {
        const updatedChanges = [...prev];
        updatedChanges[existingIndex] = {
          ...updatedChanges[existingIndex],
          value: updatedMember.name || "Unnamed",
          newData: updatedMember,
        };
        return updatedChanges;
      }

      return [
        ...prev,
        {
          type: "Edited",
          section: "Library Advisory Committee",
          field,
          oldValue: originalMember[field] ?? "",
          value: updatedMember.name || "Unnamed",
          index,
          oldData: originalMember,
          newData: updatedMember,
        },
      ];
    });
  };

  const handleCancelEdit = () => {
    setMembers(originalMembers);
    setIsEditing(false);
    setHasChanges(false);
    setSelectedMembers([]);
    setChanges([]);
  };

  const handleSaveChanges = () => {
    // Only proceed to saved/pending state when there are real changes
    if (changes.length === 0) {
      toast.warn("No changes to save");
      return;
    }

    // ✅ Validate all members have required fields
    if (!validateRequiredFields()) return;

    setIsEditing(false);
    setHasChanges(false);
    setShowRequestBtn(true);
    setSelectedMembers([]);
  };

  const handleDiscardChanges = () => {
    setMembers(originalMembers);
    setHasChanges(false);
    setShowRequestBtn(false);
    setChanges([]);
    toast.info("Changes discarded");
  };

  const handleRequest = () => setShowRequestModal(true);

  const handleRequestConfirm = async () => {
    // ✅ Final validation before submission
    if (!validateRequiredFields()) {
      return;
    }

    if (changes.length === 0) {
      toast.warn("No changes to submit");
      return;
    }

    const payload = changes
      .map((change) => buildAdvisorPayload(change))
      .filter(Boolean);

    if (payload.length === 0) {
      toast.warn("No valid changes to submit");
      return;
    }

    console.log("📦 FINAL ADVISOR PAYLOAD:", payload);

    try {
      await sendRequest(payload);

      // ✅ Reset UI states
      setShowRequestModal(false);
      setShowRequestBtn(false);
      setChanges([]);


    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to submit request");
    }
  };

  // Revert change properly
  const handleRevertChange = (change, index) => {
    setChanges((prev) => prev.filter((_, i) => i !== index));

    if (change.type === "Added") {
      setMembers((prev) => prev.filter((m) => m !== change.data));
    } else if (change.type === "Deleted") {
      setMembers((prev) => [...prev, change.data]);
    } else if (change.type === "Edited") {
      setMembers((prev) =>
        prev.map((m, i) =>
          i === change.index
            ? change.oldData
              ? { ...change.oldData }
              : { ...m, [change.field]: change.oldValue }
            : m,
        ),
      );
    }
  };

  // ✅ Validate all required fields
  const validateRequiredFields = () => {
    const emptyFields = [];

    // Check each member for empty name or designation
    members.forEach((member, index) => {
      if (!member.name || member.name.toString().trim() === "") {
        emptyFields.push(`Member ${index + 1} - Name is required`);
      }
      if (!member.designation || member.designation.toString().trim() === "") {
        emptyFields.push(`Member ${index + 1} - Designation is required`);
      }
    });

    if (emptyFields.length > 0) {
      toast.error(`Please fill all required fields:\n${emptyFields.join("\n")}`);
      return false;
    }

    return true;
  };

  return (
    <>
      <div className="flex flex-col lg:px-0 mt-8 relative">
        {/* Edit Button */}
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setShowRequestBtn(false);
              setOriginalMembers([...members]);
            }}
            className="absolute top-0 right-3 px-4 py-2 rounded-lg bg-[#fdcc03] text-text shadow-lg hover:bg-[#800000] transition flex items-center gap-2 hover:text-prim"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}

        <p className="text-2xl font-poppins text-accn dark:text-drkt font-semibold mb-4">
          LIBRARY ADVISORY COMMITTEE MEMBERS
        </p>

        {/* Members list */}
        <div className="flex flex-wrap gap-4 justify-center">
          {members.map((adv, i) => (
            <div
              className="relative md:basis-2/5 grow py-2 px-4 rounded-xl border border-transparent hover:border-l-4 border-secd dark:border-drks
                  bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                  transition-colors duration-300 ease-in"
              key={i}
            >
              {isEditing && (
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(i)}
                  onChange={() => toggleCheckbox(i)}
                  className="absolute top-2 right-2 w-4 h-4"
                />
              )}

              {isEditing ? (
                <>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={adv.name}
                    onChange={(e) =>
                      handleEditChange(i, "name", e.target.value)
                    }
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    className="w-full mb-2 p-1 border rounded-md dark:bg-gray-800"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Enter designation"
                    value={adv.designation}
                    onChange={(e) =>
                      handleEditChange(i, "designation", e.target.value)
                    }
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    className="w-full p-1 border rounded-md dark:bg-gray-800 text-sm"
                  />
                </>
              ) : (
                <>
                  <p className="text-xl font-poppi max-sm:text-base">
                    {adv.name}
                  </p>
                  <p className="text-sm text-accn dark:text-drka font-poppi max-sm:text-xs">
                    {adv.designation}
                  </p>
                </>
              )}
            </div>
          ))}

          {isEditing && (
            <div
              onClick={handleAddInlineMember}
              className="md:basis-2/5 grow py-2 px-4 rounded-xl flex items-center justify-center cursor-pointer
                          border-2 border-dashed border-secd dark:border-drks
                          bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          transition-colors duration-300 ease-in"
            >
              <Plus size={32} className="text-accn dark:text-drka" />
            </div>
          )}
        </div>

        {/* Bottom action buttons for edit mode */}
        { isEditing && (
          <>
            {/* Delete button */}
            {selectedMembers.length > 0 && !showDeleteConfirm && (
              <div className="w-full flex justify-center mt-6">
                <button
                  onClick={handleDeleteSelected}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white shadow-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}

            {/* Cancel & Save buttons */}
            <div className="w-full flex justify-end mt-6 gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold shadow-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>

              {hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 rounded-lg bg-[#fdcc03] text-text shadow-lg hover:bg-[#800000] hover:text-prim transition"
                >
                  Save
                </button>
              )}
            </div>
          </>
        )}

        {showRequestBtn && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 rounded-lg bg-gray-400 text-white shadow-lg hover:bg-gray-500 transition flex items-center gap-2"
            >
              Discard Changes
            </button>
            <button
              onClick={handleRequest}
              className="px-6 py-2 rounded-lg bg-[#fdcc03] text-text hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
            >
              <Send className="w-4 h-4" /> Request
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1000]">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedMembers.length}</span>{" "}
              selected member(s)?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteSelected}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSelected}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <h2 className="text-lg font-semibold mb-4 dark:text-drkt">
              Final Request
            </h2>

            <p className="text-red-600 mb-4 text-sm">
              <span className="font-medium">Note:</span> Your changes will
              stay pending until approved by the superior admin. Once
              approved, they will go live.
            </p>

            {/* Table */}
            <table className="w-full text-sm border dark:border-gray-700">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="border p-2 text-center">Action</th>
                  <th className="border p-2 text-center">Section</th>
                  <th className="border p-2 text-center">Changes</th>
                  <th className="border p-2 text-center">Undo</th>
                </tr>
              </thead>

              <tbody>
                {changes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No pending changes.
                    </td>
                  </tr>
                ) : (
                  changes.map((change, index) => (
                    <tr
                      key={index}
                      className="border-b dark:border-gray-700 text-center"
                    >
                      {/* Action */}
                      <td className="p-2 font-semibold">
                        <span
                          className={
                            change.type === "Added"
                              ? "text-green-600"
                              : change.type === "Deleted"
                                ? "text-red-600"
                                : "text-blue-600"
                          }
                          style={{ textTransform: "capitalize" }}
                        >
                          {change.type}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="border p-2">{change.section}</td>

                      {/* Change */}
                      <td className="border p-2">{change.value}</td>

                      {/* Undo */}
                      <td className="border p-2">
                        <button
                          onClick={() => handleRevertChange(change, index)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestConfirm}
                disabled={loading || changes.length === 0}
                className={`px-4 py-2 rounded-md flex items-center gap-2
                ${loading || changes.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
                  }`}
              >
                {loading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}