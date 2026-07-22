import { useEffect, useState } from "react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, X, Pencil, Save, Send } from "lucide-react";
import LoadComp from "../../LoadComp";

const LIBDownloads = ({ data }) => {
  const ebooks = Array.isArray(data) ? data : [];
  const deepCopy = (v) => JSON.parse(JSON.stringify(v));

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
      checkedRows.includes(i)
        ? { ...row, __deleted: true }
        : row
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
               className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black hover:bg-[#800000] hover:!text-white transition duration-200"
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
                {rows
                  .filter((row) => !row.__deleted)
                  .map((row, idx) => (
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
                   className="flex items-center bg-[#fdcc03] hover:bg-[#800000] text-black hover:!text-white px-3 py-2 rounded-lg transition duration-200"
                >
                   Save
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
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-black hover:bg-[#800000] hover:!text-white"
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
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>

                  {changes.length > 0 && (
                    <button
                      onClick={handleFinalRequestConfirm}
                      className={`px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000] ${loading ? 'opacity-50 cursor-wait' : ''}`}
                      disabled={loading}
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
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
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

export default LIBDownloads;