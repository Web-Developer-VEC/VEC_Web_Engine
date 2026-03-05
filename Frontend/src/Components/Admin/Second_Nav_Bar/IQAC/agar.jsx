import { Edit, Trash2, Plus, Save, Send, Eye, X, Pencil } from "lucide-react";
import LoadComp from "../../LoadComp";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function IqaQar({ iqacData }) {
  const [editableData, setEditableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [changesLog, setChangesLog] = useState([]); // 🔹 track all changes
  const { sendRequest, loading, error } = useAdminRequest();
  const [pendingData, setPendingData] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (typeof path !== "string") return "";
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Helper function to deep clone data
  const deepClone = (data) => {
    return data.map((row) => ({
      ...row,
    }));
  };

  useEffect(() => {
    if (iqacData && Array.isArray(iqacData)) {
      // Add a unique _id to each row for tracking
      const withIds = iqacData.map((row, idx) => ({
        _id: row._id || Date.now() + idx,
        ...row,
        year: row.year || "",
        pdf_path: row.pdf_path || "",
      }));
      setEditableData(deepClone(withIds));
      setOriginalData(deepClone(withIds));
    }
  }, [iqacData]);

  // 🔹 Track changes (merge instead of duplicate)
  const logChange = (action, index, row) => {
    const rowTitle = row?.year || "Untitled Row";

    setChangesLog((prev) => {
      const existingIndex = prev.findIndex((c) => c.rowIndex === index);

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
          id: Date.now() + index,
          rowIndex: index,
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
    logChange("Edit", index, newData[index]);
  };

  const handleFileUpload = (index, file) => {
    if (file && file.type === "application/pdf") {
      const fileURL = URL.createObjectURL(file);
      setUploadedFiles((prev) => ({
        ...prev,
        [index]: { file, fileURL },
      }));
      handleInputChange(index, "pdf_path", file.name);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      _id: Date.now(),
      year: "",
      pdf_path: "",
      _isNew: true,
    };
    setEditableData([...editableData, newRow]);
    setHasChanges(true);
    logChange("Insert", editableData.length, newRow);
  };

  const toggleRowSelection = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDeleteSelected = () => {
    selectedRows.forEach((index) => {
      logChange("Delete", index, editableData[index]);
    });
    setEditableData(editableData.filter((_, i) => !selectedRows.includes(i)));
    setSelectedRows([]);
    setShowDeleteConfirm(false);
    setHasChanges(true);
  };

  const handleSave = () => {
    setPendingData(deepClone(editableData)); // save draft
    setEditMode(false);
    setHasChanges(false);
    toast.success("Changes saved as draft!");
  };

  const handleCancel = () => {
    if (pendingData) {
  setEditableData(deepClone(pendingData));

  // 🔥 Recalculate changesLog properly
  const recalculated = buildPayload(originalData, pendingData, {}).payload;

  setChangesLog(
    recalculated.map((item, index) => ({
      id: Date.now() + index,
      action: item.action,
      section: "IQAC",
      title: item.meta_data?.year || "AQAR",
    }))
  );
}
  };

 const handleDiscard = () => {
  setEditableData(deepClone(originalData));  // revert to server state
  setUploadedFiles({});
  setHasChanges(false);
  setChangesLog([]);
  setPendingData(null);  
  toast.info("Changes discarded.");
};

  const buildPayload = (originalData, editableData, uploadedFiles) => {
    const payload = [];
    const files = [];

    // Deletions & Updates
    originalData.forEach((orig) => {
      const match = editableData.find((ed) => ed._id === orig._id);

      if (!match) {
        // Deletion
        const { _id, _isNew, ...cleanData } = orig;
        payload.push({
          collectionName: "iqac",
          collection_type: "aqar",
          action: "delete",
          title: "deletion of AQAR",
          category: "AQAR",
          meta_data: { ...cleanData },
          original_data: null,
        });
      } else if (JSON.stringify(match) !== JSON.stringify(orig)) {
        // Update
        const { _id, _isNew, ...cleanMatch } = match;
        const { _id: origId, _isNew: origIsNew, ...cleanOrig } = orig;
        payload.push({
          collectionName: "iqac",
          collection_type: "aqar",
          action: "update",
          title: "updation of AQAR",
          category: "AQAR",
          meta_data: { ...cleanMatch },
          original_data: { ...cleanOrig },
        });
      }
    });

    // Insertions
    editableData.forEach((ed) => {
      if (ed._isNew) {
        const { _id, _isNew, ...cleanData } = ed;
        payload.push({
          collectionName: "iqac",
          collection_type: "aqar",
          action: "insert",
          title: "insertion of AQAR",
          category: "AQAR",
          meta_data: { ...cleanData },
          original_data: null,
        });
      }
    });

    // Collect files
    Object.values(uploadedFiles).forEach(({ file }) => {
      if (file) files.push(file);
    });

    return { payload, files };
  };

  const handleRequestConfirm = async () => {
    const { payload, files } = buildPayload(
      originalData,
      editableData,
      uploadedFiles
    );
    console.log("Final request payload:", payload);
    console.log("Files to upload:", files);

    const response = await sendRequest(payload, files);
    if (response) {
      setShowRequestModal(false);
      setHasChanges(false);
      setOriginalData(deepClone(pendingData || editableData));
      setEditableData(deepClone(pendingData || editableData));
      setPendingData(null);
      setChangesLog([]);
      setUploadedFiles({});
    }
  };

const handleUndoChange = (id) => {
  const change = changesLog.find((c) => c.id === id);
  if (!change) return;

  let newData = [...editableData];

  if (change.action === "Edit") {
    // revert this row to original version
    const originalRow = originalData.find(
      (row) => row._id === change.row._id
    );

    newData = newData.map((row) =>
      row._id === change.row._id ? { ...originalRow } : row
    );
  }

  if (change.action === "Insert") {
    // remove inserted row
    newData = newData.filter(
      (row) => row._id !== change.row._id
    );
  }

  if (change.action === "Delete") {
    // add back deleted row
    newData.push(change.row);
  }

  setEditableData(newData);
  setPendingData(newData);

  // remove only this change from log
  setChangesLog((prev) => prev.filter((c) => c.id !== id));

  toast.info("Change reverted.");
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
              AQAR
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
              <table className="w-[700px] department-table">
                <thead className="bg-gry">
                  <tr>
                    <th className="text-center px-4 py-2">S.No</th>
                    <th className="text-center px-4 py-2">Year</th>
                    <th className="text-center px-4 py-2">PDF</th>
                    {editMode && <th className="px-2 py-2 text-center">Select</th>}
                  </tr>
                </thead>
                <tbody>
                  {editableData?.map((item, index) => (
                    <tr
                      key={index}
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
                            {(uploadedFiles[index] || item.pdf_path) && (
                              <a
                                href={
                                  uploadedFiles[index]?.fileURL || UrlParser(item.pdf_path)
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
                            checked={selectedRows.includes(index)}
                            onChange={() => toggleRowSelection(index)}
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

          {!editMode && pendingData && (
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
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              {changesLog.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  className="px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim"
                >
                  Confirm Request
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