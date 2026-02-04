import { Trash2, Plus, Send, Eye, Pencil, X } from "lucide-react";
import LoadComp from "../../LoadComp";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function IqaPra({ iqacData }) {
  const [editableData, setEditableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [changesLog, setChangesLog] = useState([]);
  const { sendRequest, loading, error } = useAdminRequest();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (typeof path !== "string") return "";
    if (!path) return "";
    return path.startsWith("http") ? path : path.startsWith("blob") ? path : `${BASE_URL}${path}`;
  };

  // Helper function to deep clone data
  const deepClone = (data) => {
    return data.map((row) => ({
      ...row,
      title: Array.isArray(row.title) ? [...row.title] : [],
    }));
  };

  useEffect(() => {
    if (iqacData && Array.isArray(iqacData)) {
      // Add a unique _id to each row for tracking
      const withIds = iqacData.map((row, idx) => ({
        _id: row._id || Date.now() + idx,
        ...row,
        year: row.year || "",
        title: Array.isArray(row.title) ? [...row.title] : [],
        pdf_path: row.pdf_path || "",
      }));
      setEditableData(deepClone(withIds));
      setOriginalData(deepClone(withIds));
    }
  }, [iqacData]);

  const logChange = (action, index, row) => {
    const rowTitle = row?.year || "Untitled Year";

    setChangesLog((prev) => {
      const existingIndex = prev.findIndex((c) => c.rowIndex === index);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          action: updated[existingIndex].action === "Insert" ? "Insert" : action,
          title: rowTitle,
          row,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: Date.now() + index,
          rowIndex: index,
          action,
          section: "Best Practices",
          title: rowTitle,
          row,
        },
      ];
    });
  };

  // Toggle select row
  const toggleRowSelection = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Handle input change
  const handleInputChange = (index, field, value) => {
    const newData = [...editableData];
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", index, newData[index]);
  };

  // Handle file upload
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

  // Add new row
  const handleAddRow = () => {
    const newRow = {
      _id: Date.now(),
      year: "",
      title: [""],
      pdf_path: "",
      _isNew: true,
    };
    setEditableData([...editableData, newRow]);
    setHasChanges(true);
    logChange("Insert", editableData.length, newRow);
  };

  // Delete selected rows
  const handleDeleteSelected = () => {
    const deletedRows = editableData.filter((_, i) =>
      selectedRows.includes(i)
    );
    deletedRows.forEach((row, i) => {
      logChange("Delete", i, row);
    });
    const newData = editableData.filter((_, i) => !selectedRows.includes(i));
    setEditableData(newData);
    setSelectedRows([]);
    setHasChanges(true);
  };

  const handleTitleChange = (rowIndex, titleIndex, value) => {
    const newData = [...editableData];
    const titles = [...newData[rowIndex].title];
    titles[titleIndex] = value;
    newData[rowIndex].title = titles;
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", rowIndex, newData[rowIndex]);
  };

  const handleAddTitle = (rowIndex) => {
    const newData = [...editableData];
    newData[rowIndex].title = [...newData[rowIndex].title, ""];
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", rowIndex, newData[rowIndex]);
  };

  const handleDeleteTitle = (rowIndex, titleIndex) => {
    const newData = [...editableData];
    newData[rowIndex].title = newData[rowIndex].title.filter((_, i) => i !== titleIndex);
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", rowIndex, newData[rowIndex]);
  };

  // Save changes
  const handleSave = () => {
    setIsEditMode(false);
    // Don't update originalData here - keep it for comparison in buildPayload
    toast.success("Changes saved. You can now request approval or discard.");
  };

  // Cancel edit mode
  const handleCancel = () => {
    setEditableData(deepClone(originalData));
    setSelectedRows([]);
    setHasChanges(false);
    setIsEditMode(false);
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setEditableData(deepClone(originalData));
    setUploadedFiles({});
    setSelectedRows([]);
    setHasChanges(false);
    setChangesLog([]);
    toast.info("All changes discarded.");
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
          collection_type: "best_practices",
          action: "delete",
          title: "deletion of best practices",
          category: "Best Practices",
          meta_data: { ...cleanData },
          original_data: null,
        });
      } else if (JSON.stringify(match) !== JSON.stringify(orig)) {
        // Update
        const { _id, _isNew, ...cleanMatch } = match;
        const { _id: origId, _isNew: origIsNew, ...cleanOrig } = orig;
        payload.push({
          collectionName: "iqac",
          collection_type: "best_practices",
          action: "update",
          title: "updation of best practices",
          category: "Best Practices",
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
          collection_type: "best_practices",
          action: "insert",
          title: "insertion of best practices",
          category: "Best Practices",
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
      setOriginalData(deepClone(editableData));
      setChangesLog([]);
      setUploadedFiles({});
    }
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
              Best Practices
            </h2>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1 px-3 py-1 bg-secd text-text hover:bg-brwn hover:text-prim rounded"
              >
                <Pencil size={16} /> Edit
              </button>
            )}
          </div>

          {/* Editable Mode */}
          {isEditMode ? (
            <div className="flex justify-center p-4 w-full">
              <div className="overflow-x-auto border rounded-lg shadow-md">
                <table className="w-[1000px] department-table">
                  <thead className="bg-gry">
                    <tr>
                      <th className="px-2 py-2 text-center">S.No</th>
                      <th className="px-2 py-2 text-center">Year</th>
                      <th className="px-2 py-2 text-center">Best Practices</th>
                      <th className="px-2 py-2 text-center">PDF</th>
                      <th className="px-2 py-2 text-center">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableData?.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center px-2 py-2">{index + 1}</td>
                        <td className="text-center px-2 py-2">
                          <input
                            type="text"
                            value={item.year || ""}
                            onChange={(e) =>
                              handleInputChange(index, "year", e.target.value)
                            }
                            className="w-[100px] px-2 py-1 border rounded text-center"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-col gap-2">
                            {item.title?.map((t, tIndex) => (
                              <div key={tIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={t}
                                  onChange={(e) => handleTitleChange(index, tIndex, e.target.value)}
                                  className="w-[250px] px-2 py-1 border rounded"
                                />
                                <button
                                  onClick={() => handleDeleteTitle(index, tIndex)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete Title"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddTitle(index)}
                              className="px-2 py-1 text-xs bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded flex w-fit"
                            >
                              + Add Title
                            </button>
                          </div>
                        </td>
                        <td className="text-center px-2 py-2">
                          <div className="flex gap-2 items-center justify-center">
                            <label className="px-3 py-1 bg-secd text-text hover:bg-brwn hover:text-prim rounded cursor-pointer">
                              {item.pdf_path ? "Replace PDF" : "Upload PDF"}
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                  handleFileUpload(index, e.target.files[0])
                                }
                                className="hidden"
                              />
                            </label>
                            {(uploadedFiles[index] || item.pdf_path) && (
                              <a
                                href={
                                  uploadedFiles[index]?.fileURL ||
                                  UrlParser(item.pdf_path)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600"
                              >
                                <Eye size={18} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="text-center px-2 py-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={() => toggleRowSelection(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Row actions */}
                <div className="flex justify-center gap-2 p-4 border-t">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded"
                  >
                    <Plus size={16} /> Add New Row
                  </button>
                  {selectedRows.length > 0 && (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded"
                    >
                      <Trash2 size={16} /> Delete Selected
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Non-editable view
            <div className="flex justify-center p-4 w-full">
              <div className="overflow-x-auto border rounded-lg shadow-md">
                <table className="w-[800px] department-table">
                  <thead className="bg-gry">
                    <tr>
                      <th className="text-center px-4 py-2 w-2">S.No</th>
                      <th className="text-center px-4 py-2">Year</th>
                      <th className="text-center px-4 py-2">Best Practices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableData?.map((dept, deptIndex) => (
                      <tr key={deptIndex}>
                        <td className="text-center w-2">{deptIndex + 1}</td>
                        <td className="text-center">{dept?.year}</td>
                        <td>
                          <ul className="reportlist">
                            {Array.isArray(dept?.title) &&
                              dept?.title?.map((title, repIndex) => (
                                <li key={repIndex}>
                                  <a
                                    href={UrlParser(dept?.pdf_path) || "#"}
                                    target={dept?.pdf_path ? "_blank" : ""}
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline cursor-pointer"
                                  >
                                    {title}
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Buttons */}
          {isEditMode && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
                >
                  Save
                </button>
              )}
            </div>
          )}

          {!isEditMode && hasChanges && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Changes stay pending until approved by the superior admin.
            </p>
            <div className="max-h-[300px] overflow-y-auto mb-4">
              <table className="w-full text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1 text-center">Action</th>
                    <th className="px-2 py-1 text-center">Section</th>
                    <th className="px-2 py-1 text-center">Changes</th>
                    <th className="px-2 py-1 text-center">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changesLog.length > 0 ? (
                    changesLog.map((log) => (
                      <tr key={log.id}>
                        <td className="text-center px-2 py-1">{log.action}</td>
                        <td className="text-center px-2 py-1">{log.section}</td>
                        <td className="px-2 py-1">{log.title}</td>
                        <td className="text-center px-2 py-1">
                          <button
                            onClick={() =>
                              setChangesLog((prev) => prev.filter((c) => c.id !== log.id))
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-2 text-gray-500">
                        No changes detected
                      </td>
                    </tr>
                  )}
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
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected rows?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteSelected();
                  setDeleteConfirm(false);
                }}
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