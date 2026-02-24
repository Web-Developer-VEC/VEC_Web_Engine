import React from "react";
import { motion } from "framer-motion";
import { Plus, X, Pencil, ArrowDown, Trash2, Save, Send } from "lucide-react";
import { Tilt } from "react-tilt";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import LIBMemb from "./LIBMemb"; // Adjust path if needed
import LIBFacl from "./LIBFacl";
import LIBHod from "./LIBHod";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Object3D } from "three";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const LibrarySections = ({ data, lib }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const LIBFea = ({ data }) => {
    const ebooks = Array.isArray(data) ? data : [];

    const [rows, setRows] = useState([]);
    const [committedRows, setCommittedRows] = useState([]);
    const [pendingRows, setPendingRows] = useState(null);
    const { sendRequest, loading, error } = useAdminRequest();
    const [checkedRows, setCheckedRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
      const copy = deepCopy(ebooks);
      setCommittedRows(copy);
      setRows(deepCopy(copy));
      setPendingRows(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setCheckedRows([]);
    }, [data]);

    const handleStartEdit = () => {
      setRows(deepCopy(committedRows));
      setIsEditing(true);
      setIsDirty(false);
      setIsSaved(false);
    };

    const handleChange = (e, idx, field) => {
      const updated = rows.map((r, i) =>
        i === idx ? { ...r, [field]: e.target.value } : r,
      );
      setRows(updated);
      setIsDirty(true);
    };

    const handleAddRow = () => {
      setRows((prev) => [
        ...prev.map((r) => ({ ...r })),
        { name: "", url: "" },
      ]);
      setIsDirty(true);
    };

    const toggleCheckbox = (idx) => {
      if (checkedRows.includes(idx)) {
        setCheckedRows(checkedRows.filter((i) => i !== idx));
      } else {
        setCheckedRows([...checkedRows, idx]);
      }
    };
    const buildEbookSourcePayload = ({ action, newData, oldData }) => {
      // INSERT
      if (action === "Added") {
        return {
          collectionName: "library",
          collection_type: "Ebook_Sources",
          action: "insert",
          title: "Add ebook source",
          meta_data: {
            name: newData.name,
            url: newData.url,
          },
        };
      }

      // UPDATE (ONLY CHANGED FIELDS)
      if (action === "Edited") {
        const meta_data = {};
        const original_data = {};

        if (newData.name !== oldData.name) {
          meta_data.name = newData.name;
          original_data.name = oldData.name;
        }

        if (newData.url !== oldData.url) {
          meta_data.url = newData.url;
          original_data.url = oldData.url;
        }

        // Safety: no actual diff
        if (Object.keys(meta_data).length === 0) return null;

        return {
          collectionName: "library",
          collection_type: "Ebook_Sources",
          action: "update",
          title: "Update ebook source",
          meta_data,
          original_data,
        };
      }

      // DELETE
      if (action === "Deleted") {
        return {
          collectionName: "library",
          collection_type: "Ebook_Sources",
          action: "delete",
          title: "Delete ebook source",
          meta_data: {
            name: oldData?.name || newData?.name,
          },
        };
      }

      return null;
    };

    const handleDeleteSelected = () => {
      setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
      const updated = rows.map((row, i) =>
        checkedRows.includes(i) ? { ...row, __deleted: true } : row,
      );

      setRows(updated);
      setCheckedRows([]);
      setShowDeleteConfirm(false);
      setIsDirty(true);
    };

    const handleCancel = () => {
      setRows(deepCopy(committedRows));
      setIsEditing(false);
      setIsDirty(false);
      setPendingRows(null);
      setIsSaved(false);
      setCheckedRows([]);
    };

    const handleSave = () => {
      const pending = deepCopy(rows);
      setPendingRows(pending);
      setIsSaved(true);
      setIsEditing(false);
      setIsDirty(false);
      setCheckedRows([]);
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

    const handleFinalRequestConfirm = async () => {
      const changes = getChanges();

      if (changes.length === 0) {
        toast.warn("No changes to submit");
        return;
      }

      const payload = changes
        .map((change) =>
          buildEbookSourcePayload({
            action: change.action,
            newData: pendingRows?.[change.rowIndex],
            oldData: committedRows?.[change.rowIndex],
          }),
        )
        .filter(Boolean);

      console.log("📦 FINAL PAYLOAD:", payload);

      try {
        await sendRequest(payload);
        toast.success("Request submitted successfully!");

        setCommittedRows(deepCopy(pendingRows));
        setRows(deepCopy(pendingRows));
        setPendingRows(null);
        setIsSaved(false);
        setShowRequestModal(false);
      } catch (error) {
        toast.error("Failed to submit request");
      }
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
          return r.name !== c.name || r.url !== c.url;
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

        if (oldRow && newRow?.__deleted) {
          changes.push({
            action: "Deleted",
            section: "E-Books Websites",
            changes: `Row ${i + 1}`,
            rowIndex: i,
          });
        } else if (!oldRow && newRow) {
          changes.push({
            action: "Added",
            section: "E-Books Websites",
            changes: `Row ${i + 1}`,
            rowIndex: i,
          });
        } else if (oldRow && newRow) {
          if (oldRow.name !== newRow.name || oldRow.url !== newRow.url) {
            changes.push({
              action: "Edited",
              section: "E-Books Websites",
              changes: `Row ${i + 1}`,
              rowIndex: i,
            });
          }
        }
      }
      return changes;
    };

    const changes = getChanges();

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
                Some of E-books Download Websites
              </h2>
              {/* Edit button appears whenever NOT editing */}
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-black rounded hover:bg-[#800000]"
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
                    <th className="border p-2">E-Book Source</th>
                    <th className="border p-2">Link</th>
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
                            value={row.name}
                            onChange={(e) => handleChange(e, idx, "name")}
                          />
                        ) : (
                          row.name
                        )}
                      </td>
                      <td className="border p-2">
                        {isEditing ? (
                          <input
                            className="border p-1 w-full"
                            value={row.url}
                            onChange={(e) => handleChange(e, idx, "url")}
                          />
                        ) : (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {row.url}
                          </a>
                        )}
                      </td>
                      {isEditing && (
                        <td className="border p-2">
                          <input
                            type="checkbox"
                            checked={checkedRows.includes(idx)}
                            onChange={() => toggleCheckbox(idx)}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  {isEditing && (
                    <tr>
                      <td
                        colSpan={isEditing ? 4 : 3}
                        className="border p-2 text-center"
                      >
                        <button
                          onClick={handleAddRow}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#fdcc03] text-black rounded hover:bg-[#800000] mx-auto"
                        >
                          <Plus size={18} /> Add Row
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Delete Button (Bottom Center) */}
            {isEditing && checkedRows.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            )}

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
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000]"
                  >
                    <Save size={18} /> Save
                  </button>
                )}
              </div>
            )}

            {/* After Save: Discard + Request buttons */}
            {!isEditing && isSaved && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                >
                  Discard Changes
                </button>
                {changes.length > 0 && (
                  <button
                    onClick={handleRequest}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000]"
                  >
                    <Send size={18} /> Request
                  </button>
                )}
              </div>
            )}

            {/* Final Request Modal */}
            {showRequestModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Request
                  </h2>

                  <p className="text-sm text-red-500 mb-4">
                    Note: Your changes will stay pending until approved by the
                    superior admin. Once approved will go live.
                  </p>

                  {changes.length > 0 ? (
                    <table className="w-full text-sm border border-gray-300">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border p-2 text-center">Action</th>
                          <th className="border p-2 text-center">Section</th>
                          <th className="border p-2 text-center">Changes</th>
                          <th className="border p-2 text-center w-[70px]">
                            Undo
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {changes.map((ch, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="border p-2 text-center text-blue-600 font-semibold">
                              {ch.action}
                            </td>

                            <td className="border p-2 text-center">
                              Downloads
                            </td>

                            <td className="border p-2 text-center">
                              {ch.changes}
                            </td>

                            <td className="border p-2 text-center">
                              <button
                                onClick={() => revertChange(ch.rowIndex)}
                                className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100"
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg border">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete selected row(s)?
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
              </div>
            )}

            <ToastContainer position="bottom-right" autoClose={2000} />
          </>
        )}
      </div>
    );
  };

  function LIBInstr({ data }) {
    const [members, setMembers] = useState(data || []);
    const [originalMembers, setOriginalMembers] = useState(data || []);
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showRequestBtn, setShowRequestBtn] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const { sendRequest, loading, error } = useAdminRequest();
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        const current = members[change.index];

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
        const original = originalMembers[change.index];
        const updated = members[change.index];

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
      return `${member.name || "Unnamed"}${
        member.designation ? " – " + member.designation : ""
      }`;
    };

    // Confirm delete action
    const confirmDeleteSelected = () => {
      const updated = members.filter((_, i) => !selectedMembers.includes(i));
      const deleted = members.filter((_, i) => selectedMembers.includes(i));

      setMembers(updated);
      setSelectedMembers([]);
      setHasChanges(true);
      setShowDeleteConfirm(false);

      deleted.forEach((d, i) => {
        setChanges((prev) => [
          ...prev,
          {
            type: "Deleted",
            section: "Library Advisory Committee",
            field: "member",
            value: d.name || "Unnamed",
            data: d,
            index: i,
          },
        ]);
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
            index: updated.length - 1,
          },
        ]);

        return updated;
      });

      setHasChanges(true);
    };

    const handleEditChange = (index, field, value) => {
      setMembers((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });

      setHasChanges(true);

      setChanges((prev) => {
        const member = members[index];

        if (member?.isNew) {
          return prev.map((c) => {
            if (c.type === "Added" && c.index === index) {
              return {
                ...c,
                // ✅ SHOW ONLY NAME
                value: members[index]?.name || "Unnamed",
              };
            }
            return c;
          });
        }
        // 🟢 CASE 2: Editing existing member (DEDUPED)
        const memberName =
          originalMembers[index]?.name || members[index]?.name || "Unnamed";

        const existingIndex = prev.findIndex(
          (c) => c.type === "Edited" && c.index === index,
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            value: memberName,
          };
          return updated;
        }

        return [
          ...prev,
          {
            type: "Edited",
            section: "Library Advisory Committee",
            field,
            oldValue: originalMembers?.[index]?.[field] ?? "",
            value: memberName,
            index,
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

        // ✅ Commit approved data as new backend truth
        setOriginalMembers(JSON.parse(JSON.stringify(members)));

        // ✅ Reset UI states
        setShowRequestModal(false);
        setShowRequestBtn(false);
        setChanges([]);

        toast.success("Request submitted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to submit request");
      }
    };

    // Revert change properly
    const handleRevertChange = (change, index) => {
      setChanges((prev) => prev.filter((_, i) => i !== index));

      if (change.type === "Added") {
        // Undo addition
        setMembers((prev) => prev.filter((m) => m !== change.data));
      } else if (change.type === "Deleted") {
        // Undo deletion
        setMembers((prev) => [...prev, change.data]);
      } else if (change.type === "Edited") {
        // Undo edit
        setMembers((prev) =>
          prev.map((m, i) =>
            i === change.index ? { ...m, [change.field]: change.oldValue } : m,
          ),
        );
      }
    };

    return (
      <>
        <div className="flex flex-col lg:px-0 mt-8 relative">
          {/* Edit Button */}
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
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
          {isEditing && (
            <div className="mt-6 flex justify-between items-center">
              {selectedMembers.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999]">
                <button
                  onClick={handleDeleteSelected}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white shadow-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
              )}
              <div className="ml-auto flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold shadow-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                {hasChanges && (
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 rounded-lg bg-[#fdcc03] text-text shadow-lg hover:bg-[#800000] transition flex items-center gap-2 hover:text-prim"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                )}
              </div>
            </div>
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
                  ${
                    loading || changes.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
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

  function LIBHigh({ data }) {
    if (!data || !Array.isArray(data)) return null;

    // separate normal sections and image gallery
    const normalSections = data.filter(
      (sec) => sec.category !== "Image_Gallery" || [],
    );
    const imageGallery = data.find(
      (sec) => sec.category === "Image_Gallery" || [],
    );

    return (
      <>
        {/* ✅ First div: Services, Facilities, E-Resources */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {data
            ?.filter((section) => section.category !== "Image_Gallery")
            .map((section, index) => (
              <motion.div
                key={index}
                className="p-4 sm:p-6 md:p-8 rounded-2xl shadow-md sm:shadow-lg text-center dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                          transition duration-500 hover:scale-105 hover:shadow-2xl hover:bg-[color-mix(in_srgb,theme(colors.secd),transparent_85%)]
                          dark:hover:bg-[color-mix(in_srgb,theme(colors.drks),transparent_85%)]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-accn dark:text-drkt mb-4 sm:mb-6">
                  {section.category}
                </h2>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg">
                  {Array.isArray(section.content) &&
                    section.content.map((item, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center space-x-2 sm:space-x-3 hover:text-accn dark:hover:text-drkt transition-colors duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-secd dark:bg-drks rounded-full"></span>
                        <span className="text-start">
                          {typeof item === "string" ? item : item.name}
                        </span>
                      </motion.li>
                    ))}
                </ul>
              </motion.div>
            ))}
        </div>

        {Array.isArray(
          data?.find((section) => section.category === "Image_Gallery")
            ?.content,
        ) &&
          data.find((section) => section.category === "Image_Gallery").content
            .length > 0 && (
            <div className="h-auto py-12 sm:py-16 px-4 sm:px-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-accn dark:text-drkt uppercase tracking-wide mb-8 sm:mb-12">
                Library Highlights
              </h2>

              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {data
                  .find((section) => section.category === "Image_Gallery")
                  .content.map((item, index) => (
                    <motion.div
                      key={index}
                      className="relative group"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.15,
                        ease: "easeOut",
                      }}
                      viewport={{ once: true }}
                    >
                      <Tilt
                        options={{
                          max: 15,
                          scale: 1.05,
                          speed: 400,
                          glare: true,
                          "max-glare": 0.2,
                        }}
                        className="relative rounded-2xl shadow-lg overflow-hidden transition-all transform dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] group-hover:shadow-2xl"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={UrlParser(item.image)}
                            alt={item.title}
                            className="w-full h-56 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-10 transition-opacity"></div>
                        </div>

                        <div className="p-5 sm:p-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-accn dark:text-drkt group-hover:text-secd dark:group-hover:text-drks transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-2 sm:mt-3 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </Tilt>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
      </>
    );
  }

  function LIBMult() {
    return (
      <div className=" pt-16 pb-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Images */}
          <div className="relative group">
            <motion.img
              src={UrlParser(
                "/static/images/library/library_images/Multimedia+Library+1.webp",
              )}
              alt="Multimedia Library"
              className="w-full rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            />
            <motion.img
              src={UrlParser(
                "/static/images/library/library_images/Multimedia+Library+2.webp",
              )}
              alt="Library Resources"
              className="absolute bottom-[-30px] right-[-20px] w-2/3 rounded-xl shadow-xl border-4 border-white transition-transform duration-500 group-hover:rotate-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>

          {/* Right Side - Text Content */}
          <motion.div
            className=""
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-6">
              MULTIMEDIA LIBRARY
            </h2>
            <p className="text-lg leading-relaxed text-justify">
              A separate Multimedia Library is provided to utilize CD-ROMs,
              Online Journals, and NPTEL courses. It offers internet browsing,
              enabling students and faculty to access multidisciplinary video
              learning materials.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-justify">
              Our college is a proud member of <strong>DELNET</strong>,
              promoting resource sharing among libraries. We provide access to
              online journals like IEEE Transactions, ASME Proceedings, and more
              for research activities.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-justify">
              The <strong>National Digital Library of India</strong> integrates
              global digital libraries under a single portal. It supports
              academic disciplines in multiple languages, making knowledge
              accessible for all.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  function LIBArvl({ data }) {
    return (
      <>
        {Array.isArray(data) && (
          <div className="py-16 px-6">
            <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-12 text-center">
              NEW ARRIVALS
            </h2>

            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
              {data?.map((section, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform
                    dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] hover:scale-105"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="group relative">
                    <img
                      src={UrlParser(section.image_path)}
                      alt={section.title}
                      className="w-full h-60 object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                    />
                    <div
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0
                        group-hover:opacity-100 transition-all"
                    >
                      <h3 className="text-2xl text-black font-bold text-center px-4">
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="leading-relaxed">{section.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  function LIBResc({ data }) {
    const [openSection, setOpenSection] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRequestButtons, setShowRequestButtons] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestChanges, setRequestChanges] = useState([]);
    const { sendRequest, loading, error } = useAdminRequest();
    const toggleSection = (index) => {
      setOpenSection(openSection === index ? null : index);
      setEditingIndex(null);
    };

    const handleEditClick = (section, index) => {
      setEditingIndex(index);
      setFormData({ ...section, content: [...section.content] });
      setOriginalData({ ...section, content: [...section.content] });
      setShowRequestButtons(false);
    };

    const handleInputChange = (value, idx, field) => {
      const updatedContent = [...formData.content];
      if (typeof updatedContent[idx] === "string") {
        updatedContent[idx] = value;
      } else {
        updatedContent[idx] = { ...updatedContent[idx], [field]: value };
      }
      setFormData({ ...formData, content: updatedContent });
    };

    const handleSave = () => {
      const changes = [];

      formData.content.forEach((item, idx) => {
        const origItem = originalData.content?.[idx];

        // 🟢 NEW ITEM (INSERT)
        if (!origItem && typeof item === "object") {
          if (item.name || item.link) {
            changes.push({
              type: "Added",
              index: idx,
              sectionName: originalData.category,
              new: item,
            });
          }
          return;
        }

        // 🟡 STRING ITEM
        if (typeof item === "string") {
          if (item !== origItem) {
            changes.push({
              type: "Edited",
              index: idx,
              field: "content",
              old: origItem,
              new: item,
              sectionName: originalData.category,
            });
          }
          return;
        }

        // ✏️ OBJECT ITEM (UPDATE)
        if (typeof item === "object" && origItem) {
          if (item.name !== origItem.name) {
            changes.push({
              type: "Edited",
              index: idx,
              field: "name",
              old: origItem.name,
              new: item.name,
              sectionName: originalData.category,
            });
          }

          if (item.link !== origItem.link) {
            changes.push({
              type: "Edited",
              index: idx,
              field: "link",
              old: origItem.link,
              new: item.link,
              sectionName: originalData.category,
            });
          }
        }
      });

      setRequestChanges(changes);
      setShowRequestButtons(true);
      setEditingIndex(null);
    };

    const handleDelete = () => {
      const deletedItems = formData.content.filter((item) => item?.selected);

      const updatedContent = formData.content.filter((item) => !item?.selected);

      deletedItems.forEach((item, idx) => {
        setRequestChanges((prev) => [
          ...prev,
          {
            type: "Deleted",
            sectionName: originalData.category,
            data: item,
            index: idx,
          },
        ]);
      });

      setFormData({
        ...formData,
        content: updatedContent,
      });

      setShowDeleteModal(false);
      setShowRequestButtons(true);
    };

    const handleDiscard = () => {
      setFormData({ ...originalData });
      setShowRequestButtons(false);
    };

    const handleRequest = () => {
      setShowRequestModal(true);
    };

    const handleRequestConfirm = async () => {
      if (requestChanges.length === 0) {
        toast.warn("No changes to submit");
        return;
      }

      const payload = requestChanges
        .map((change) => {
          // ➕ INSERT
          if (change.type === "Added") {
            return {
              collectionName: "library",
              collection_type: "library_resources",
              action: "insert",
              title: "Add library resources",
              category: change.sectionName,
              meta_data: {
                content: formData.content,
              },
            };
          }

          // ✏️ UPDATE
          if (change.type === "Edited") {
            return {
              collectionName: "library",
              collection_type: "library_resources",
              action: "update",
              title: "Update library resources",
              category: change.sectionName,
              meta_data: {
                content: formData.content,
              },
              original_data: {
                content: originalData.content,
              },
            };
          }

          // ❌ DELETE
          if (change.type === "Deleted") {
            return {
              collectionName: "library",
              collection_type: "library_resources",
              action: "delete",
              title: "Delete library resources",
              category: change.sectionName,
              meta_data: {},
            };
          }

          return null;
        })
        .filter(Boolean);

      console.log("📦 FINAL LIBRARY RESOURCE PAYLOAD:", payload);

      try {
        await sendRequest(payload);

        setOriginalData(deepCopy(formData));
        setShowRequestModal(false);
        setShowRequestButtons(false);
        setRequestChanges([]);

        toast.success("Library resources request submitted!");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to submit request");
      }
    };

    return (
      <>
        {Array.isArray(data) && (
          <div className="py-16 px-6">
            <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-12 text-center">
              Library Resources
            </h2>

            <div className="max-w-4xl mx-auto space-y-6">
              {data?.map((section, index) => (
                <div
                  key={index}
                  className="dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-2xl shadow-lg relative"
                >
                  {/* Toggle button */}
                  <button
                    onClick={() => toggleSection(index)}
                    className={`w-full flex justify-between items-center 
                    text-base sm:text-lg px-6 py-4 font-semibold
                    transition-all rounded-2xl text-white dark:text-drkp mb-4
                    ${
                      openSection === index
                        ? "bg-[#FDCC03] text-black dark:bg-drks"
                        : "bg-accn dark:bg-drks"
                    }`}
                  >
                    <h2
                      className={`${
                        openSection === index ? "text-black" : "text-white"
                      }`}
                    >
                      {section.category}
                    </h2>

                    {openSection === index ? (
                      <span className="text-black">▲</span>
                    ) : (
                      <span>▼</span>
                    )}
                  </button>

                  {/* Collapsible content */}
                  {openSection === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 py-4 relative"
                    >
                      {/* Edit button */}
                      {editingIndex !== index && !showRequestButtons && (
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => handleEditClick(section, index)}
                            className="flex items-center gap-2 px-4 py-2 
                                     bg-[#FDCC03] text-black font-medium 
                                     rounded-xl shadow-md 
                                     hover:bg-[#800000] hover:text-white 
                                     hover:shadow-lg 
                                     active:scale-95 transition-all duration-200"
                          >
                            <Pencil size={18} />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}

                      {/* Editing form */}
                      {(editingIndex === index || showRequestButtons) && (
                        <div className="relative pb-24">
                          <div className="space-y-3">
                            {formData.content?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                {/* Checkbox */}
                                {editingIndex === index && (
                                  <input
                                    type="checkbox"
                                    checked={
                                      formData.content[idx]?.selected || false
                                    }
                                    onChange={(e) => {
                                      const updated = [...formData.content];
                                      updated[idx] = {
                                        ...updated[idx],
                                        selected: e.target.checked,
                                      };
                                      setFormData({
                                        ...formData,
                                        content: updated,
                                      });
                                    }}
                                    className="h-4 w-4"
                                  />
                                )}

                                {/* Editable fields */}
                                {typeof item === "string" ? (
                                  <input
                                    type="text"
                                    value={item}
                                    disabled={showRequestButtons}
                                    onChange={(e) =>
                                      handleInputChange(e.target.value, idx)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-drkp dark:text-drka"
                                  />
                                ) : (
                                  <div className="flex gap-2 w-full">
                                    <input
                                      type="text"
                                      value={item.name}
                                      disabled={showRequestButtons}
                                      onChange={(e) =>
                                        handleInputChange(
                                          e.target.value,
                                          idx,
                                          "name",
                                        )
                                      }
                                      placeholder="Name"
                                      className="w-1/2 px-3 py-2 border rounded-lg dark:bg-drkp dark:text-drka"
                                    />
                                    <input
                                      type="text"
                                      value={item.link}
                                      disabled={showRequestButtons}
                                      onChange={(e) =>
                                        handleInputChange(
                                          e.target.value,
                                          idx,
                                          "link",
                                        )
                                      }
                                      placeholder="Link"
                                      className="w-1/2 px-3 py-2 border rounded-lg dark:bg-drkp dark:text-drka"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* + New Link button */}
                            {editingIndex === index && (
                              <button
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    content: [
                                      ...formData.content,
                                      { name: "", link: "" },
                                    ],
                                  })
                                }
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                + New Link
                              </button>
                            )}
                          </div>

                          {/* Buttons inside section */}
                          <div className="absolute bottom-0 right-0 flex gap-3 mb-4">
                            {/* Editing buttons */}
                            {editingIndex === index && !showRequestButtons && (
                              <>
                                <button
                                  onClick={() => setEditingIndex(null)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSave(index)}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-white rounded-lg hover:bg-[#800000]"
                                >
                                  <Save size={18} />
                                  Save
                                </button>
                              </>
                            )}

                            {/* After save buttons */}
                            {showRequestButtons && (
                              <>
                                <button
                                  onClick={handleDiscard}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                >
                                  Discard Changes
                                </button>
                                <button
                                  onClick={handleRequest}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-white rounded-lg hover:bg-[#800000]"
                                >
                                  <Send size={18} />
                                  Request
                                </button>
                              </>
                            )}
                          </div>
                          {/* Delete button bottom-center */}
                          {editingIndex === index &&
                            formData.content.some((item) => item?.selected) && (
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mt-4">
                                <button
                                  onClick={() => setShowDeleteModal(true)}
                                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                  <Trash2 size={18} />
                                  Delete
                                </button>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Normal view */}
                      {editingIndex !== index && !showRequestButtons && (
                        <>
                          {Array.isArray(section.content) ? (
                            <ul className="list-disc marker:text-accn dark:marker:text-drka pl-6 space-y-2">
                              {section.content.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="text-text dark:text-drka"
                                >
                                  {typeof item === "string" ? item : item.name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{section.content}</p>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl shadow-lg w-[400px] text-center">
              <h3 className="text-lg font-semibold mb-4 text-text dark:text-drka">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete the selected items? This action
                cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                Request
              </h2>

              <p className="text-sm text-red-600 mb-4">
                Note: Your changes will stay pending until approved by the
                superior admin. Once approved, they will go live.
              </p>

              <table className="w-full text-sm border border-gray-300 dark:text-drkt">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="border py-2 text-center w-[100px]">
                      Action
                    </th>
                    <th className="border py-2 text-center">Section</th>
                    <th className="border py-2 text-center">Changes</th>
                    <th className="border py-2 text-center w-[80px]">Undo</th>
                  </tr>
                </thead>

                <tbody>
                  {requestChanges.map((change, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="border py-2 text-center font-semibold text-blue-600">
                        Edited
                      </td>

                      <td className="border py-2 text-center">
                        Library Resources
                      </td>

                      <td className="border py-2 text-center">
                        {/* <span className="inline-block px-2 py-1 bg-yellow-100 text-black rounded-md">
                  {change.field === "name"
                    ? "Name"
                    : change.field === "link"
                    ? "Link"
                    : change.field}
                </span> */}
                        {change.sectionName}
                      </td>

                      <td className="border py-2 text-center">
                        <button
                          onClick={() => {
                            // revert this field
                            setFormData((prev) => {
                              const updatedContent = [...prev.content];
                              const item = updatedContent[change.index];

                              if (typeof item === "string") {
                                updatedContent[change.index] =
                                  originalData.content[change.index];
                              } else {
                                updatedContent[change.index] = {
                                  ...item,
                                  [change.field]:
                                    originalData.content[change.index][
                                      change.field
                                    ],
                                };
                              }

                              return { ...prev, content: updatedContent };
                            });

                            setRequestChanges((prev) =>
                              prev.filter((_, i) => i !== idx),
                            );
                          }}
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-red-100 text-red-600 hover:text-red-800 font-bold"
                          title="Undo change"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRequestConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-[#800000] text-black font-medium"
                >
                  {loading ? "Submitting..." : "Final Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const Counter = ({ value }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = Math.ceil(value / (duration / 50));

      const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(start);
        }
      }, 50);

      return () => clearInterval(counter);
    }, [value]);

    return (
      <span className="text-3xl font-semibold">{count.toLocaleString()}</span>
    );
  };

  const LIBbookdetails = ({ data }) => {
    const stats = [{ icon: "📘" }, { icon: "👥" }, { icon: "🏛" }];

    const [bookData, setBookData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [savedData, setSavedData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showRequestBtn, setShowRequestBtn] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const { sendRequest, loading, error } = useAdminRequest();
    useEffect(() => {
      if (data?.length > 0) {
        const init = deepCopy(data[0]);
        setBookData(init);
        setOriginalData(init);
        setSavedData(init);
      }
    }, [data]);

    const handleChange = (key, value) => {
      setBookData((prev) => {
        const next = deepCopy(prev);
        next[key] = value;
        return next;
      });

      if (value !== "" && value !== null) {
        setHasChanges(true);
      }
    };
    const getChangedFields = (current, original) => {
      const changes = {};
      Object.keys(current).forEach((key) => {
        if (current[key] !== original[key]) {
          changes[key] = current[key];
        }
      });
      return changes;
    };

    const getOriginalChangedFields = (current, original) => {
      const originalChanges = {};
      Object.keys(current).forEach((key) => {
        if (current[key] !== original[key]) {
          originalChanges[key] = original[key];
        }
      });
      return originalChanges;
    };

    const handleEdit = () => {
      setIsEditing(true);
      setHasChanges(false);
    };

    const handleCancel = () => {
      setBookData(deepCopy(savedData));
      setIsEditing(false);
      setHasChanges(false);
    };

    const handleSave = () => {
      const hasEmpty = Object.entries(bookData).some(
        ([, value]) => value === "" || value === null,
      );

      if (hasEmpty) {
        return; // silently ignore
      }

      setSavedData(deepCopy(bookData));
      setIsEditing(false);
      setHasChanges(false);
      setShowRequestBtn(true);
    };

    const handleDiscard = () => {
      setBookData(deepCopy(savedData));
      setShowRequestBtn(false);
      setHasChanges(false);
      setIsEditing(false);
    };

    const handleRequestConfirm = async () => {
      const metaData = getChangedFields(bookData, originalData);
      const originalMetaData = getOriginalChangedFields(bookData, originalData);

      if (Object.keys(metaData).length === 0) {
        toast.error("No changes to submit");
        return;
      }

      const payload = {
        collectionName: "library",
        collection_type: "books",
        action: "update", // ✅ FIXED
        title: "Update book stats",

        meta_data: metaData, // ✅ NEW DATA ONLY
        original_data: originalMetaData, // ✅ OLD DATA ONLY
      };

      console.log("📦 BOOK PAYLOAD:", payload);

      try {
        await sendRequest([payload]);

        setOriginalData(deepCopy(bookData));
        setSavedData(deepCopy(bookData));

        setShowRequestModal(false);
        setShowRequestBtn(false);

        toast.success("Book stats request submitted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to submit book stats");
      }
    };

    const handleRevertField = (key) => {
      setBookData((prev) => {
        const next = deepCopy(prev);
        next[key] = originalData[key]; // revert to backend truth
        return next;
      });
    };

    return (
      <>
        <ToastContainer position="bottom-right" autoClose={3000} />

        {/* Details Section */}
        {Object.keys(bookData).length > 0 ? (
          <div className="relative mt-12 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
            {!isEditing && (
              <div className="absolute -top-12 right-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#FDCC03] text-text shadow-md hover:bg-[#800000] transition hover:text-prim"
                  onClick={handleEdit}
                >
                  <Pencil size={18} /> Edit
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 place-items-center gap-8">
              {Object.entries(bookData).map(([key, value], index) => {
                const icons = stats[index] || {};
                return (
                  <motion.div
                    key={index}
                    className="flex flex-col w-[32rem] h-[14rem] justify-center items-center bg-prim dark:bg-text p-2 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <span className="text-5xl">{icons.icon}</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="mt-2 p-2 w-32 text-center rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
                      />
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                    <p className="text-text dark:text-prim text-lg mt-2">
                      {key}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp />
          </div>
        )}

        {/* Save + Cancel */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                <Save size={18} /> Save
              </button>
            )}
          </div>
        )}

        {/* Discard + Request */}
        {showRequestBtn && !isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Discard Changes
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} /> Request
            </button>
          </div>
        )}
        {/* Final Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[550px]">
              <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                Request
              </h2>

              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the
                superior admin. Once approved will go live.
              </p>

              <div className="max-h-[220px] overflow-y-auto mb-4">
                <table className="w-full text-sm text-center border border-gray-300 dark:text-drkt">
                  <thead className="bg-gray-200 dark:bg-drka">
                    <tr>
                      <th className="border py-2">Action</th>
                      <th className="border py-2">Section</th>
                      <th className="border py-2">Changes</th>
                      <th className="border py-2 w-[70px]">Undo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(bookData)
                      .filter(([key, value]) => value !== originalData[key])
                      .map(([key, value], idx) => (
                        <tr
                          key={idx}
                          className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="border py-2 font-semibold text-yellow-600">
                            Edited
                          </td>

                          <td className="border py-2">Collection-Books</td>

                          <td className="border py-2 font-semibold">{key}</td>

                          <td className="border py-2">
                            <button
                              onClick={() => handleRevertField(key)}
                              className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Undo change"
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRequestConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
                >
                  {loading ? "Submitting..." : "Final Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const deepCopy = (v) => JSON.parse(JSON.stringify(v));

  const LIBjournalsdetails = ({ data }) => {
    const stats = [
      { icon: "📚" },
      { icon: "🇮🇳" },
      { icon: "🌎" },
      { icon: "💻" },
    ];

    const [journalData, setJournalData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [savedData, setSavedData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showRequestBtn, setShowRequestBtn] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const { sendRequest, loading, error } = useAdminRequest();
    useEffect(() => {
      if (data?.length > 0) {
        const init = deepCopy(data[0]);
        setJournalData(init);
        setOriginalData(init);
        setSavedData(init);
      }
    }, [data]);
    const getChangedFields = (current, original) => {
      const changes = {};

      Object.keys(current).forEach((key) => {
        if (current[key] !== original[key]) {
          changes[key] = current[key];
        }
      });

      return changes;
    };
    const getOriginalChangedFields = (current, original) => {
      const originalChanges = {};
      Object.keys(current).forEach((key) => {
        if (current[key] !== original[key]) {
          originalChanges[key] = original[key];
        }
      });
      return originalChanges;
    };

    const handleChange = (key, value) => {
      setJournalData((prev) => {
        const next = deepCopy(prev);
        next[key] = value;
        return next;
      });

      if (value !== "" && value !== null) {
        setHasChanges(true);
      }
    };

    const handleEdit = () => {
      setIsEditing(true);
      setHasChanges(false);
    };

    const handleCancel = () => {
      setJournalData(deepCopy(savedData));
      setIsEditing(false);
      setHasChanges(false);
    };

    const handleSave = () => {
      const hasEmpty = Object.entries(journalData).some(
        ([, value]) => value === "" || value === null,
      );

      if (hasEmpty) {
        return; // no toast, just silently ignore
      }

      setSavedData(deepCopy(journalData));
      setIsEditing(false);
      setHasChanges(false);
      setShowRequestBtn(true);
    };

    const handleDiscard = () => {
      setJournalData(deepCopy(savedData));
      setShowRequestBtn(false);
      setHasChanges(false);
      setIsEditing(false);
    };
    const handleRequestConfirm = async () => {
      const metaData = getChangedFields(journalData, originalData);
      const originalMetaData = getOriginalChangedFields(
        journalData,
        originalData,
      );

      if (Object.keys(metaData).length === 0) {
        toast.error("No changes to submit");
        return;
      }

      const payload = {
        collectionName: "library",
        collection_type: "journal",
        action: "update",
        title: "Update journal stats",

        meta_data: metaData, // ✅ NEW DATA
        original_data: originalMetaData, // ✅ OLD DATA
      };

      console.log("📦 JOURNAL PAYLOAD:", payload);

      try {
        await sendRequest([payload]);

        setOriginalData(deepCopy(journalData));
        setSavedData(deepCopy(journalData));

        setShowRequestModal(false);
        setShowRequestBtn(false);

        toast.success("Journal stats request submitted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to submit journal stats");
      }
    };

    const handleRevertField = (key) => {
      setJournalData((prev) => {
        const next = deepCopy(prev);
        next[key] = originalData[key]; // revert to backend truth
        return next;
      });
    };

    return (
      <>
        <ToastContainer position="bottom-right" autoClose={3000} />

        {/* Details Section */}
        {Object.keys(journalData).length > 0 ? (
          <div className="relative mt-12 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
            {!isEditing && (
              <div className="absolute -top-12 right-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#FDCC03] text-text shadow-md hover:bg-[#800000] transition hover:text-prim"
                  onClick={handleEdit}
                >
                  <Pencil size={18} /> Edit
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 place-items-center gap-8">
              {Object.entries(journalData).map(([key, value], index) => {
                const icons = stats[index] || {};
                return (
                  <motion.div
                    key={index}
                    className="flex flex-col w-[32rem] h-[14rem] justify-center items-center bg-prim dark:bg-text p-2 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <span className="text-5xl">{icons.icon}</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="mt-2 p-2 w-32 text-center rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
                      />
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                    <p className="text-text dark:text-prim text-lg mt-2">
                      {key}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp />
          </div>
        )}

        {/* Save + Cancel */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                <Save size={18} /> Save
              </button>
            )}
          </div>
        )}

        {/* Discard + Request */}
        {showRequestBtn && !isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Discard Changes
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} /> Request
            </button>
          </div>
        )}

        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[550px]">
              <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                Request
              </h2>
              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the
                superior admin. Once approved will go live.
              </p>
              <div className="max-h-[220px] overflow-y-auto mb-4">
                <table className="w-full text-sm text-center border border-gray-300 dark:text-drkt">
                  <thead className="bg-gray-200 dark:bg-drka">
                    <tr>
                      <th className="border py-2">Action</th>
                      <th className="border py-2">Section</th>
                      <th className="border py-2">Changes</th>
                      <th className="border py-2 w-[70px]">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(journalData)
                      .filter(([key, value]) => value !== originalData[key])
                      .map(([key, value], idx) => (
                        <tr
                          key={idx}
                          className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="border py-2 font-semibold text-yellow-600">
                            Edited
                          </td>

                          <td className="border py-2">collection-Journals</td>

                          <td className="border py-2 font-semibold">{key}</td>

                          <td className="border py-2">
                            <button
                              onClick={() => handleRevertField(key)}
                              className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Undo change"
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRequestConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
                >
                  {loading ? "Submitting..." : "Final Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  //   const LIBnewspaperdetails = () => {
  //     const stats = [
  //       { label: "Total Newspapers", value: 325, icon: "📰" },
  //       { label: "Daily Newspapers", value: 120, icon: "📆" },
  //       { label: "Weekly Newspapers", value: 85, icon: "📅" },
  //       { label: "Monthly Newspapers", value: 60, icon: "🗞" },
  //       { label: "Archived Newspapers", value: 45, icon: "📂" },
  //       { label: "Digital Newspapers", value: 15, icon: "💻" }
  //     ];

  //     return (
  //         <>
  //             {stats ? (
  //                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
  //                     {stats?.map((stat, index) => (
  //                     <div key={index} className="flex flex-col items-center bg-prim dark:bg-text p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
  //                         <span className="text-5xl">{stat.icon}</span>
  //                         <Counter value={stat.value} />
  //                         <p className="text-text dark:text-prim text-lg mt-2">{stat.label}</p>
  //                     </div>
  //                     ))}
  //                 </div>
  //             ) : (
  //                 <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
  //                     <LoadComp />
  //                 </div>
  //             )}
  //         </>
  //     );
  //   };

  const [openSection, setOpenSection] = useState(null);
  const navData = {
    Collection: {
      Books: <LIBbookdetails data={data} />,
      Journals: <LIBjournalsdetails data={data} />,
    },
    "HOD's message": <LIBHod />,
    Staff: <LIBFacl />,
    Services: <LIBHigh data={data} />,
    "Advisory committee members": <LIBInstr data={data} />,
    "Membership Details": <LIBMemb data={data} />,
    Downloads: <LIBFea data={data} />,
    "Library Resources": <LIBResc data={data} />,
    Multimedia: <LIBMult />,
    "Digital Library & E-Resources": <LIBArvl data={data} />,
  };

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <>
      <div className="h-auto p-3 md:p-6 lg:p-10 space-y-8 md:space-y-12 lg:space-y-16">
        {Array.isArray(lib) ? navData[lib[0]][lib[1]] : navData[lib]}
      </div>
    </>
  );
};

export default LibrarySections;
