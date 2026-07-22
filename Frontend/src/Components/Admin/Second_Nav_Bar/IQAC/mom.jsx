import { Edit, Trash2, Plus, Save, Send, Eye, Pencil, X } from "lucide-react";
import LoadComp from "../../LoadComp";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function IqaMet({ iqacData }) {
  const [editableData, setEditableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [changesLog, setChangesLog] = useState([]); // track all changes
  const { sendRequest, loading, error } = useAdminRequest();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (typeof path !== "string") return "";
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // ✅ Add stable IDs when loading data
  useEffect(() => {
    if (iqacData && Array.isArray(iqacData)) {
      const withIds = iqacData.map((row, i) => ({
        ...row,
        _id: row._id || `${Date.now()}-${i}`, // stable id
      }));
      setEditableData(withIds);
      setOriginalData(withIds);
    }
  }, [iqacData]);

  const logChange = (action, rowId, row) => {
    const rowTitle = row?.year || "Untitled Row";

    setChangesLog((prev) => {
      const existingIndex = prev.findIndex((c) => c.rowId === rowId);

      if (existingIndex !== -1) {
        const updatedLogs = [...prev];
        updatedLogs[existingIndex] = {
          ...updatedLogs[existingIndex],
          action: updatedLogs[existingIndex].action === "Insert" ? "Insert" : action,
          title: rowTitle,
          row,
        };
        return updatedLogs;
      }

      return [
        ...prev,
        {
          id: Date.now() + rowId,
          rowId,
          action,
          section: "IQAC",
          title: rowTitle,
          row,
        },
      ];
    });
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...editableData];
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", newData[index]._id, newData[index]);
  };

  const handleFileUpload = (index, file) => {
    if (file && file.type === "application/pdf") {
      const fileURL = URL.createObjectURL(file);
      setUploadedFiles((prev) => ({
        ...prev,
        [editableData[index]._id]: { file, fileURL },
      }));
      handleInputChange(index, "pdf_path", file.name);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      _id: `${Date.now()}-${Math.random()}`,
      year: "",
      pdf_path: "",
      type: "",
      conducted_on: "",
    };
    setEditableData([...editableData, newRow]);
    setHasChanges(true);
    logChange("Insert", newRow._id, newRow);
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleDeleteSelected = () => {
    selectedRows.forEach((rowId) => {
      const row = editableData.find((r) => r._id === rowId);
      logChange("Delete", rowId, row);
    });
    setEditableData(editableData.filter((r) => !selectedRows.includes(r._id)));
    setSelectedRows([]);
    setShowDeleteConfirm(false);
    setHasChanges(true);
  };

  const handleSave = () => {
    setEditMode(false);
    toast.success("Changes saved. Submit request for approval.");
  };

  const handleCancel = () => {
    setEditableData([...originalData]);
    setUploadedFiles({});
    setHasChanges(false);
    setEditMode(false);
    setSelectedRows([]);
    setChangesLog([]);
  };

  const handleDiscard = () => {
    setEditableData([...originalData]);
    setUploadedFiles({});
    setHasChanges(false);
    setChangesLog([]);
    toast.info("Changes discarded.");
  };

  const buildPayload = (changesLog, editableData, originalData) => {
    return changesLog.map((change) => {
      const row = editableData.find((r) => r._id === change.rowId) || change.row;
      const oldRow = originalData.find((r) => r._id === change.rowId) || null;

      const yearWithType = row?.year && row?.type ? `${row.year} (${row.type})` : row?.year;

      let actionType = "";
      let title = "";

      switch (change.action) {
        case "Insert":
          actionType = "insert";
          title = "insertion of iqac minutes of meetings";
          break;
        case "Edit":
          actionType = "update";
          title = "updation of iqac minutes of meetings";
          break;
        case "Delete":
          actionType = "delete";
          title = "deletion of iqac minutes of meetings";
          break;
        default:
          actionType = "unknown";
      }

      return {
        collectionName: "iqac",
        collection_type: "minutes_of_meetings",
        action: actionType,
        title,
        meta_data: {
          year: row?.year || "",
          pdf_path: row?.pdf_path || "",
          type: row?.type || "",
          conducted_on: row?.conducted_on || "",
        },
        original_data:
          actionType === "update"
            ? {
              year: oldRow?.year || "",
              pdf_path: oldRow?.pdf_path || "",
              type: oldRow?.type || "",
              conducted_on: oldRow?.conducted_on || "",
            }
            : null,
      };
    });
  };

  const handleRequestConfirm = async () => {
    const payload = buildPayload(changesLog, editableData, originalData);

    const files = Object.values(uploadedFiles).map((f) => f.file).filter(Boolean);

    const result = await sendRequest(payload, files);
    if (result) {
      setShowRequestModal(false);
      setHasChanges(false);
      setChangesLog([]);
      setUploadedFiles({});
    }
  };

  // 🔹 Convert dd.mm.yyyy -> yyyy-mm-dd
  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split(".");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // 🔹 Convert yyyy-mm-dd -> dd.mm.yyyy
  const formatFromInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  };

  const handleUndoChange = (id) => {
    setChangesLog((prev) => prev.filter((c) => c.id !== id));
    toast.info("Change removed from request list.");
  };

  return (
    <>
      {!iqacData ? (
        <div className="flex justify-center items-center min-h-screen">
          <LoadComp />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mt-[15px] px-6">
            <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px]">
              Minutes of Meetings
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-[10px]"
              >
                <Pencil size={16} /> Edit
              </button>
            )}
          </div>

          {/* Table */}
          <div className="flex justify-center p-4 w-full">
            <div className="overflow-x-auto border rounded-lg shadow-md">
              <table className="w-[1000px] department-table">
                <thead className="bg-gry">
                  <tr>
                    <th className="text-center px-4 py-2">S.No</th>
                    <th className="text-center px-4 py-2">Year</th>
                    <th className="text-center px-4 py-2">ODD/EVEN</th>
                    <th className="text-center px-4 py-2">Conducted On</th>
                    <th className="text-center px-4 py-2">PDF</th>
                    {editMode && (
                      <th className="px-2 py-2 text-center">Select</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {editableData?.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="text-center px-2 py-2">{index + 1}</td>

                      {/* Year */}
                      <td className="text-center px-2 py-2">
                        {editMode ? (
                          <input
                            type="text"
                            value={item.year || ""}
                            onChange={(e) =>
                              handleInputChange(index, "year", e.target.value)
                            }
                            className="w-[120px] px-2 py-1 border rounded text-center"
                          />
                        ) : (
                          item.year
                        )}
                      </td>

                      {/* ODD / EVEN */}
                      <td className="text-center px-2 py-2">
                        {editMode ? (
                          <select
                            value={item.type || ""}
                            onChange={(e) =>
                              handleInputChange(index, "type", e.target.value)
                            }
                            className="w-[120px] px-2 py-1 border rounded text-center"
                          >
                            <option value="">Select</option>
                            <option value="ODD">ODD</option>
                            <option value="EVEN">EVEN</option>
                          </select>
                        ) : (
                          item.type
                        )}
                      </td>

                      {/* Conducted On */}
                      <td className="text-center px-2 py-2">
                        {editMode ? (
                          <input
                            type="date"
                            value={formatToInputDate(item.conducted_on)}
                            onChange={(e) =>
                              handleInputChange(index, "conducted_on", formatFromInputDate(e.target.value))
                            }
                            className="w-[150px] px-2 py-1 border rounded text-center"
                          />
                        ) : (
                          item.conducted_on
                        )}
                      </td>

                      {/* PDF */}
                      <td className="text-center px-2 py-2 flex justify-center items-center gap-2">
                        {editMode ? (
                          <>
                            <label className="px-3 py-1 bg-secd text-text hover:bg-brwn hover:text-prim rounded cursor-pointer">
                              {item.pdf_path ? "Replace PDF" : "Upload PDF"}
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(index, e.target.files[0])
                                }
                              />
                            </label>
                            {(uploadedFiles[item._id] || item.pdf_path) && (
                              <a
                                href={
                                  uploadedFiles[item._id]?.fileURL ||
                                  UrlParser(item.pdf_path)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600"
                              >
                                <Eye size={16} />
                              </a>
                            )}
                          </>
                        ) : (
                          <a
                            href={UrlParser(item.pdf_path) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View PDF
                          </a>
                        )}
                      </td>

                      {editMode && (
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item._id)}
                            onChange={() => toggleRowSelection(item._id)}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add & Delete Buttons */}
              {editMode && (
                <div className="flex justify-center gap-2 p-4 border-t">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded"
                  >
                    <Plus size={16} /> Add Row
                  </button>
                  {selectedRows.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 size={16} /> Delete Selected
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          {editMode && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded"
                >
                  Save
                </button>
              )}
            </div>
          )}

          {!editMode && hasChanges && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-[10px]"
              >
                <Send size={16} /> Request
              </button>
            </div>
          )}

          <ToastContainer position="bottom-right" autoClose={3000} />
        </>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] overflow-y-auto">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
              Request Changes
            </h2>
            <p className="text-sm text-red-500 mb-4 text-center">
              Note: Changes stay pending until approved by the superior admin.
            </p>

            <table className="w-full border mb-4">
              <thead className="bg-gry">
                <tr>
                  <th className="px-2 py-1 text-center">Action</th>
                  <th className="px-2 py-1 text-center">Section</th>
                  <th className="px-2 py-1 text-center">Changes</th>
                  <th className="px-2 py-1 text-center">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changesLog.map((c) => (
                  <tr key={c.id}>
                    <td className="px-2 py-1 text-center">{c.action}</td>
                    <td className="px-2 py-1 text-center">{c.section}</td>
                    <td className="px-2 py-1 text-center">{c.title}</td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleUndoChange(c.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {changesLog.length === 0 && (
              <p className="text-center text-gray-500">
                No changes to request.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                Cancel
              </button>
              {changesLog.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  className={`px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim ${loading ? "cursor-progress" : "hover:bg-[#800000]"}`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Final Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] overflow-y-auto">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">
              Confirm Delete
            </h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected rows?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}