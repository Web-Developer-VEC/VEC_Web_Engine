import { Edit, Trash2, Plus, Save, Send, ArrowDown, Upload } from "lucide-react";
import LoadComp from "../../LoadComp";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function IqaAud({ iqacData }) {
  const [editableData, setEditableData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (typeof path !== "string") return "";
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (iqacData && Array.isArray(iqacData)) {
      // Ensure path and year are always arrays
      const normalized = iqacData.map((dept) => ({
        ...dept,
        year: Array.isArray(dept.year) ? dept.year : [],
        path: Array.isArray(dept.path) ? dept.path : [],
      }));
      setEditableData(normalized);
    }
  }, [iqacData]);

  // Handle input changes
  const handleInputChange = (rowIndex, field, value, subIndex = null) => {
    const newData = [...editableData];
    const row = newData[rowIndex];

    let oldValue;
    let newValue = value;

    if (field === "path") {
        oldValue = row.path[subIndex] || "Empty";
        row.path[subIndex] = value;
    } else if (field === "year") {
        oldValue = row.year[subIndex] || "Empty";
        row.year[subIndex] = value;
    } else {
        oldValue = row[field] || "Empty";
        row[field] = value;
    }

    setEditableData(newData);
    setHasChanges(true);

    setChanges((prev) => {
        const existingChangeIndex = prev.findIndex((c) => c.index === rowIndex);

        if (row.isNew) {
        // For new rows → merge into "add"
        if (existingChangeIndex >= 0) {
            return prev.map((c, i) =>
            i === existingChangeIndex
                ? {
                    ...c,
                    changes: {
                    ...c.changes,
                    [`${field}${subIndex !== null ? `_${subIndex}` : ""}`]: {
                        old: oldValue,
                        new: newValue,
                    },
                    },
                }
                : c
            );
        }
        } else {
        // For existing rows → merge into one "edit"
        if (existingChangeIndex >= 0) {
            return prev.map((c, i) =>
            i === existingChangeIndex
                ? {
                    ...c,
                    action: "edit", // keep it edit
                    changes: {
                    ...c.changes,
                    [`${field}${subIndex !== null ? `_${subIndex}` : ""}`]: {
                        old: oldValue,
                        new: newValue,
                    },
                    },
                }
                : c
            );
        } else {
            return [
            ...prev,
            {
                index: rowIndex,
                action: "edit",
                changes: {
                [`${field}${subIndex !== null ? `_${subIndex}` : ""}`]: {
                    old: oldValue,
                    new: newValue,
                },
                },
            },
            ];
        }
        }

        return prev;
    });
  };

  // Handle PDF upload
  const handleFileUpload = (rowIndex, subIndex, file) => {
    if (file && file.type === "application/pdf") {
      const fakePath = `temp/pdfs/iqac/aaa/${file.name}`; 
      handleInputChange(rowIndex, "path", fakePath, subIndex);
    } else {
      alert("Only PDF files are allowed!");
    }
  };

  // Add new department row
  const handleAddRow = () => {
    const newRow = {
        department_name: "",
        year: [""],
        path: [""],
        isNew: true,   // 👈 mark this as new
    };
    setEditableData([...editableData, newRow]);
    setEditingRow(editableData.length);
    setHasChanges(true);

    setChanges((prev) => [
        ...prev,
        {
        index: editableData.length,
        action: "add",
        changes: {
            department_name: { old: "Empty", new: "" },
        },
        },
    ]);
    };

  // Add new report inside department
const handleAddReport = (rowIndex) => {
    const newData = [...editableData];
    newData[rowIndex].year.push("");
    newData[rowIndex].path.push("");
    setEditableData(newData);
    setHasChanges(true);

    setChanges((prev) => [
        ...prev,
        {
        index: rowIndex,
        action: "edit",
        changes: {
            new_report: { old: null, new: "New empty report row" },
        },
        },
    ]);
    };

    const handleDeleteReport = (rowIndex, subIndex) => {
        const deletedYear = editableData[rowIndex].year[subIndex];
        const deletedPath = editableData[rowIndex].path[subIndex];

        const newData = [...editableData];
        newData[rowIndex].year.splice(subIndex, 1);
        newData[rowIndex].path.splice(subIndex, 1);
        setEditableData(newData);
        setHasChanges(true);

        setChanges((prev) => [
            ...prev,
            {
            index: rowIndex,
            action: "edit",
            changes: {
                [`report_${subIndex}`]: {
                old: `${deletedYear} → ${deletedPath}`,
                new: null,
                },
            },
            },
        ]);
    };

  const handleDeleteDept = (index) => {
    const deletedItem = editableData[index];
    const newData = editableData.filter((_, i) => i !== index);
    setEditableData(newData);
    setHasChanges(true);

    setChanges((prev) => [
        ...prev,
        {
        index,
        action: "delete",
        deletedItem,
        },
    ]);
  };

  const handleSave = () => {
    setEditingRow(null);
    console.log("Saved temporarily:", editableData);
  };

  const confirmDelete = () => {
    handleDeleteDept(indexToDelete);
    setDeleteConfirm(false);
    setIndexToDelete(null);
  };

  const handleRequestConfirm = () => {
    const payload = changes.map(change => {
        const base = {
        collectionName: "iqac",
        collection_type: "academic_admin_audit",
        category: null,
        };

        if (change.action === "edit") {
        return {
            ...base,
            action: "update",
            title: "Updation of Iqac academic_admin_audit pdf",
            meta_data: [editableData[change.index]],
            original_data: [iqacData[change.index]],
        };
        }

        if (change.action === "add") {
        return {
            ...base,
            action: "insert",
            title: "Insertion of Iqac academic_admin_audit pdf",
            meta_data: [editableData[change.index]],
            original_data: null,
        };
        }

        if (change.action === "delete") {
        return {
            ...base,
            action: "delete",
            title: "Deletion of Iqac academic_admin_audit pdf",
            meta_data: [change.deletedItem],
            original_data: null,
        };
        }

        return null;
    }).filter(Boolean);

    console.log("🚀 Final payload:", payload);
    toast.success("Request submitted successfully!"); 
    setShowRequestModal(false);
    setHasChanges(false);
    setChanges([]); 

    // Send to backend
    // fetch(`/api/admin-backend/iqac/temp`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    // })
    //     .then(res => res.json())
    //     .then(data => {
    //     console.log("✅ Backend response:", data);
    //     setShowRequestModal(false);
    //     setHasChanges(false);
    //     setChanges([]);
    //     })
    //     .catch(err => {
    //     console.error("❌ Error submitting changes:", err);
    //     });
  };

  return (
    <>
      {!iqacData ? (
        <div className="flex justify-center items-center min-h-screen">
          <LoadComp />
        </div>
      ) : (
        <>
          <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
            Academic and Administrative Audit
          </h2>

          <div className="flex justify-center p-4 w-full">
            <div className="overflow-x-auto border rounded-lg shadow-md">
              <table className="w-[1200px] department-table">
                <thead className="bg-gry">
                  <tr>
                    <th className="text-center px-4 py-2 w-2">S.No</th>
                    <th className="text-center px-4 py-2">Department</th>
                    <th className="text-center px-4 py-2">Reports</th>
                    <th className="text-center px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editableData?.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      {/* S.No */}
                      <td className="text-center px-2 py-2">{index + 1}</td>

                      {/* Department */}
                      <td className="text-left px-2 py-2">
                        {editingRow === index ? (
                          <input
                            type="text"
                            value={dept.department_name || ""}
                            onChange={(e) =>
                              handleInputChange(index, "department_name", e.target.value)
                            }
                            className="w-[200px] px-2 py-1 border rounded text-center"
                            placeholder="Department"
                          />
                        ) : (
                          dept.department_name
                        )}
                      </td>

                      {/* Reports */}
                      <td className="text-center px-2 py-2">
                        <ul className="flex flex-col gap-2">
                          {dept?.path?.map((rep, repIndex) => (
                            <li key={repIndex}>
                              {editingRow === index ? (
                                <div className="flex gap-2 items-center">
                                  {/* Year input */}
                                  <input
                                    type="text"
                                    value={dept.year[repIndex] || ""}
                                    onChange={(e) =>
                                      handleInputChange(index, "year", e.target.value, repIndex)
                                    }
                                    className="w-[100px] px-2 py-1 border rounded"
                                    placeholder="Year"
                                  />
                                  {/* File upload */}
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) =>
                                      handleFileUpload(index, repIndex, e.target.files[0])
                                    }
                                    className="w-[200px]"
                                  />
                                  {/* Delete Report */}
                                  <button
                                    onClick={() => handleDeleteReport(index, repIndex)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete Report"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <a
                                  href={UrlParser(rep) || "#"}
                                  target={rep ? "_blank" : ""}
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {dept?.year[repIndex]}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>

                        {editingRow === index && (
                          <button
                            onClick={() => handleAddReport(index)}
                            className="flex items-center gap-1 mt-2 text-sm px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus size={14} /> Add Report
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-center px-2 py-2">
                        <div className="flex justify-center gap-2">
                          {editingRow === index ? (
                            <button
                              onClick={handleSave}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingRow(index)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => {setIndexToDelete(index); setDeleteConfirm(true)}}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete Department"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add New Department Button */}
              <div className="flex justify-center p-4 border-t">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 px-4 py-2 bg-secd text-text rounded hover:drks dark:hover:secd"
                >
                  <Plus size={16} />
                  Add Department
                </button>
              </div>
            </div>
          </div>

          {/* Request Approval */}
          <div className="flex justify-center gap-4 mb-4">
            {hasChanges && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
              >
                <Send size={16} />
                Request Approval
              </button>
            )}
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        </>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            {/* Title */}
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                Final Request for the Changes
            </h2>

            {/* Note */}
            <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the superior admin. 
                Once approved, they will be applied automatically to the live site.
            </p>

            {/* Summary Table */}
            <div className="max-h-[300px] overflow-y-auto mb-4">
                <table className="w-full text-center text-text dark:text-drkt border">
                <thead className="bg-gry">
                    <tr>
                    <th className="py-2 px-2">Action</th>
                    <th className="py-2 px-2">Section</th>
                    <th className="py-2 px-2">Changes</th>
                    </tr>
                </thead>
                <tbody>
                    {changes.length === 0 ? (
                    <tr>
                        <td colSpan="3" className="py-4 text-gray-400">
                        No changes detected
                        </td>
                    </tr>
                    ) : (
                    changes.map((change, index) => (
                        <tr key={index} className="border-t">
                        {/* Action */}
                        <td className="py-2 px-2">
                            {change.action === "edit" && (
                            <span className="text-blue-600">✎ Edited</span>
                            )}
                            {change.action === "add" && (
                            <span className="text-green-600">+ Added</span>
                            )}
                            {change.action === "delete" && (
                            <span className="text-red-600">🗑 Deleted</span>
                            )}
                        </td>

                        {/* Section */}
                        <td className="py-2 px-2">Audit Reports</td>

                        {/* Changes */}
                        <td className="py-2 px-2 text-[12px]">
                            {change.action === "delete" ? (
                            <span>Department {change.deletedItem?.department_name} deleted</span>
                            ) : (
                            <div className="flex flex-col items-start gap-1">
                                {Object.entries(change.changes || {}).map(([field, values]) => (
                                <div key={field} className="border rounded px-2 py-1 bg-gray-50 dark:bg-gray-700">
                                    <strong>{field}:</strong>{" "}
                                    {values.old || "Empty"} ➝{" "}
                                    <span className="font-semibold">{values.new}</span>
                                </div>
                                ))}
                            </div>
                            )}
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>

            {/* Buttons */}
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

        {/* Delete confirmation popup */}
        {deleteConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
                <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
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
    </>
  );
}
