import { Edit, Trash2, Plus, Save, Send, Eye, Pencil, X } from "lucide-react";
import LoadComp from "../../LoadComp";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function IqaAud({ iqacData }) {
  const [editableData, setEditableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [changesLog, setChangesLog] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (typeof path !== "string") return "";
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (iqacData && Array.isArray(iqacData)) {
      setEditableData([...iqacData]);
      setOriginalData([...iqacData]);
    }
  }, [iqacData]);

  const logChange = (action, index, row) => {
    const rowTitle = row?.department_name || "Untitled Department";
    setChangesLog((prev) => [
      ...prev,
      { id: Date.now() + index, rowIndex: index, action, section: "Audit", title: rowTitle, row }
    ]);
  };

  const toggleRowSelection = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...editableData];
    newData[index] = { ...newData[index], [field]: value };
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", index, newData[index]);
  };

  const handleYearChange = (deptIndex, yearIndex, value) => {
    const newData = [...editableData];
    const years = [...newData[deptIndex].year];
    years[yearIndex] = value;
    newData[deptIndex].year = years;
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", deptIndex, newData[deptIndex]);
  };

  const handleFileUpload = (deptIndex, yearIndex, file) => {
    if (file && file.type === "application/pdf") {
      const fileURL = URL.createObjectURL(file);
      setUploadedFiles((prev) => ({
        ...prev,
        [`${deptIndex}-${yearIndex}`]: { file, fileURL }
      }));
      const newData = [...editableData];
      const paths = [...newData[deptIndex].path];
      paths[yearIndex] = file.name;
      newData[deptIndex].path = paths;
      setEditableData(newData);
      setHasChanges(true);
      logChange("Edit", deptIndex, newData[deptIndex]);
    }
  };

  const handleAddRow = () => {
    const newRow = { department_name: "", year: [""], path: [""] };
    setEditableData([...editableData, newRow]);
    setHasChanges(true);
  };

  const handleDeleteSelected = () => {
    const newData = editableData.filter((_, i) => !selectedRows.includes(i));
    setEditableData(newData);
    setSelectedRows([]);
    setHasChanges(true);
  };

  const handleAddYear = (deptIndex) => {
    const newData = [...editableData];
    newData[deptIndex].year.push("");
    newData[deptIndex].path.push("");
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", deptIndex, newData[deptIndex]);
  };

  const handleDeleteYear = (deptIndex, yearIndex) => {
    const newData = [...editableData];
    newData[deptIndex].year = newData[deptIndex].year.filter((_, i) => i !== yearIndex);
    newData[deptIndex].path = newData[deptIndex].path.filter((_, i) => i !== yearIndex);
    setEditableData(newData);
    setHasChanges(true);
    logChange("Edit", deptIndex, newData[deptIndex]);
  };

  const handleSave = () => {
    setIsEditMode(false);
    setOriginalData([...editableData]);
    toast.success("Changes saved. You can now request approval or discard.");
  };

  const handleCancel = () => {
    setEditableData([...originalData]);
    setSelectedRows([]);
    setHasChanges(false);
    setIsEditMode(false);
  };

  const handleDiscardChanges = () => {
    setEditableData([...originalData]);
    setUploadedFiles({});
    setSelectedRows([]);
    setHasChanges(false);
    toast.info("All changes discarded.");
  };

  const handleRequestConfirm = () => {
    console.log("Final request submitted:", editableData, uploadedFiles);
    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
    setHasChanges(false);
    setOriginalData([...editableData]);
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
              Academic and Administrative Audit
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
                <table className="w-[1100px] department-table">
                  <thead className="bg-gry">
                    <tr>
                      <th className="px-2 py-2 text-center">S.No</th>
                      <th className="px-2 py-2 text-center">Department</th>
                      <th className="px-2 py-2 text-center">Year & Report</th>
                      <th className="px-2 py-2 text-center">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableData?.map((dept, deptIndex) => (
                      <tr key={deptIndex}>
                        <td className="text-center">{deptIndex + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={dept.department_name}
                            onChange={(e) =>
                              handleInputChange(deptIndex, "department_name", e.target.value)
                            }
                            className="w-[250px] px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-col gap-3">
                            {dept.year?.map((year, yearIndex) => (
                              <div key={yearIndex} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={year}
                                  onChange={(e) =>
                                    handleYearChange(deptIndex, yearIndex, e.target.value)
                                  }
                                  className="w-[120px] px-2 py-1 border rounded text-center"
                                />
                                <label className="px-3 py-1 bg-secd text-text hover:bg-brwn hover:text-prim rounded cursor-pointer">
                                  {dept.path[yearIndex] ? "Replace PDF" : "Upload PDF"}
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) =>
                                      handleFileUpload(deptIndex, yearIndex, e.target.files[0])
                                    }
                                    className="hidden"
                                  />
                                </label>
                                {(uploadedFiles[`${deptIndex}-${yearIndex}`] ||
                                  dept.path[yearIndex]) && (
                                  <a
                                    href={
                                      uploadedFiles[`${deptIndex}-${yearIndex}`]?.fileURL ||
                                      UrlParser(dept.path[yearIndex])
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 cursor-pointer"
                                  >
                                    <Eye size={18} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteYear(deptIndex, yearIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddYear(deptIndex)}
                              className="px-2 py-1 text-xs bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded w-fit"
                            >
                              + Add Year
                            </button>
                          </div>
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(deptIndex)}
                            onChange={() => toggleRowSelection(deptIndex)}
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
                    <Plus size={16} /> Add New Department
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
            // Non-editable mode
            <div className="flex justify-center p-4 w-full">
              <div className="overflow-x-auto border rounded-lg shadow-md">
                <table className="w-[1000px] department-table">
                  <thead className="bg-gry">
                    <tr>
                      <th className="text-center px-4 py-2 w-2">S.No</th>
                      <th className="text-center px-4 py-2">Department</th>
                      <th className="text-center px-4 py-2">Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableData?.map((dept, deptIndex) => (
                      <tr key={deptIndex}>
                        <td className="text-center">{deptIndex + 1}</td>
                        <td>{dept.department_name}</td>
                        <td>
                          <ul className="reportlist">
                            {dept.year?.map((yr, yrIndex) => (
                              <li key={yrIndex}>
                                <a
                                  href={UrlParser(dept.path[yrIndex])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {yr}
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
              <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-white">
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