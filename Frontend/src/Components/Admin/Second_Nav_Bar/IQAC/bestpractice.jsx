import { Edit, Trash2, Plus, Save, Send, ArrowDown } from 'lucide-react';
import LoadComp from "../../LoadComp";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function IqaPra({ iqacData }) {
    const [editableData, setEditableData] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [changes, setChanges] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({}); // keep track of uploaded PDFs
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
            setEditableData([...iqacData]);
        }
    }, [iqacData]);

    const handleInputChange = (index, field, value) => {
        const newData = [...editableData];
        newData[index] = { ...newData[index], [field]: value };
        setEditableData(newData);
        setHasChanges(true);

        setChanges((prevChanges) => {
            const changeIndex = prevChanges.findIndex((c) => c.index === index);

            if (changeIndex >= 0) {
                const updatedChanges = [...prevChanges];
                const updatedChange = { ...updatedChanges[changeIndex] };

                updatedChange.changes = {
                    ...updatedChange.changes,
                    [field]: {
                        old: iqacData[index]?.[field],
                        new: value,
                    },
                };

                updatedChanges[changeIndex] = updatedChange;
                return updatedChanges;
            } else {
                return [
                    ...prevChanges,
                    {
                        index,
                        action: iqacData[index] ? "edit" : "add",
                        changes: {
                            [field]: { old: iqacData[index]?.[field], new: value },
                        },
                    },
                ];
            }
        });
    };

    const handleFileUpload = (index, file) => {
        if (file && file.type === "application/pdf") {
            const fileURL = URL.createObjectURL(file);
            setUploadedFiles((prev) => ({
                ...prev,
                [index]: { file, fileURL },
            }));
            handleInputChange(index, "path", file.name); // just store file name for now
        }
    };

    const handleEdit = (index) => setEditingRow(index);

    const handleDelete = (index) => {
        const newData = editableData.filter((_, i) => i !== index);
        setEditableData(newData);
        setHasChanges(true);
        setChanges([
            ...changes,
            { index, action: "delete", deletedItem: editableData[index] },
        ]);
    };

    const handleAddRow = () => {
        const newRow = {
            year: "",
            title: [""],
            path: "",
        };
        setEditableData([...editableData, newRow]);
        setEditingRow(editableData.length);
        setHasChanges(true);
    };

    const handleTitleChange = (rowIndex, titleIndex, value) => {
        const newData = [...editableData];
        const updatedTitles = [...newData[rowIndex].title];
        updatedTitles[titleIndex] = value;
        newData[rowIndex].title = updatedTitles;
        setEditableData(newData);
        setHasChanges(true);
    };

    const handleAddTitle = (rowIndex) => {
        const newData = [...editableData];
        const oldTitles = [...newData[rowIndex].title];

        newData[rowIndex].title.push("");
        setEditableData(newData);
        setHasChanges(true);

        setChanges((prev) => {
            const changeIndex = prev.findIndex((c) => c.index === rowIndex);

            if (changeIndex >= 0) {
                const updatedChanges = [...prev];
                const updatedChange = { ...updatedChanges[changeIndex] };

                updatedChange.changes = {
                    ...updatedChange.changes,
                    title: {
                        old: oldTitles,
                        new: newData[rowIndex].title,
                    },
                };

                updatedChanges[changeIndex] = updatedChange;
                return updatedChanges;
            } else {
                return [
                    ...prev,
                    {
                        index: rowIndex,
                        action: editableData[rowIndex] ? "edit" : "add",
                        changes: {
                            title: { old: oldTitles, new: newData[rowIndex].title },
                        },
                    },
                ];
            }
        });
    };

    const handleRemoveTitle = (rowIndex, titleIndex) => {
        const newData = [...editableData];
        const oldTitles = [...newData[rowIndex].title];

        newData[rowIndex].title.splice(titleIndex, 1);
        setEditableData(newData);
        setHasChanges(true);

        setChanges((prev) => {
            const changeIndex = prev.findIndex((c) => c.index === rowIndex);

            if (changeIndex >= 0) {
                const updatedChanges = [...prev];
                const updatedChange = { ...updatedChanges[changeIndex] };

                updatedChange.changes = {
                    ...updatedChange.changes,
                    title: {
                        old: oldTitles,
                        new: newData[rowIndex].title,
                    },
                };

                updatedChanges[changeIndex] = updatedChange;
                return updatedChanges;
            } else {
                return [
                    ...prev,
                    {
                        index: rowIndex,
                        action: editableData[rowIndex] ? "edit" : "add",
                        changes: {
                            title: { old: oldTitles, new: newData[rowIndex].title },
                        },
                    },
                ];
            }
        });
    };

    const confirmDelete = () => {
        handleDelete(indexToDelete);
        setDeleteConfirm(false);
        setIndexToDelete(null);
    };

    const handleRequestConfirm = () => {
        console.log("Final request submitted:", editableData, changes, uploadedFiles);
        toast.success("Request submitted successfully!");
        setShowRequestModal(false);
        setHasChanges(false);
        setChanges([]);
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
                        Best Practices
                    </h2>

                    <div className="flex justify-center p-4 w-full">
                        <div className="overflow-x-auto border rounded-lg shadow-md">
                            <table className="w-[1000px] department-table">
                                <thead className="bg-gry">
                                    <tr>
                                        <th className="text-center px-4 py-2">S.No</th>
                                        <th className="text-center px-4 py-2">Year</th>
                                        <th className="text-center px-4 py-2">Best Practices</th>
                                        <th className="text-center px-4 py-2">PDF</th>
                                        <th className="text-center px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableData?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="text-center px-2 py-2">{index + 1}</td>

                                            {/* Year */}
                                            <td className="text-center px-2 py-2">
                                                {editingRow === index ? (
                                                    <input
                                                        type="text"
                                                        value={item.year || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(index, "year", e.target.value)
                                                        }
                                                        className="w-[100px] px-2 py-1 border rounded text-center"
                                                    />
                                                ) : (
                                                    item.year
                                                )}
                                            </td>

                                            {/* Titles */}
                                            <td className="text-left px-2 py-2">
                                                {editingRow === index ? (
                                                    <div className="flex flex-col gap-2">
                                                        {item.title?.map((t, tIndex) => (
                                                            <div key={tIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={t}
                                                                    onChange={(e) =>
                                                                        handleTitleChange(
                                                                            index,
                                                                            tIndex,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-[250px] px-2 py-1 border rounded"
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveTitle(index, tIndex)
                                                                    }
                                                                    className="text-red-500"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => handleAddTitle(index)}
                                                            className="flex items-center gap-1 text-green-600 text-sm"
                                                        >
                                                            <Plus size={14} /> Add Title
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <ul className="list-disc pl-4">
                                                        {item.title?.map((t, i) => (
                                                            <li key={i}>{t}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>

                                            {/* PDF */}
                                            <td className="text-center px-2 py-2">
                                                {editingRow === index ? (
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                        className="w-[250px] px-2 py-1 border rounded"
                                                    />
                                                ) : uploadedFiles[index] ? (
                                                    <a
                                                        href={uploadedFiles[index].fileURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        {uploadedFiles[index].file.name}
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={UrlParser(item.path) || "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        View PDF
                                                    </a>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="text-center px-2 py-2">
                                                {editingRow === index ? (
                                                    <button
                                                        onClick={() => setEditingRow(null)}
                                                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {setDeleteConfirm(true); setIndexToDelete(index)}}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Add Row */}
                            <div className="flex justify-center p-4 border-t">
                                <button
                                    onClick={handleAddRow}
                                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text rounded hover:drks dark:hover:secd"
                                >
                                    <Plus size={16} /> Add New Row
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
                                <Send size={16} /> Request Approval
                            </button>
                        )}
                    </div>
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
                            <table className="w-full text-center text-text dark:text-drkt">
                                <thead>
                                    <tr>
                                        <th className="py-1">Action</th>
                                        <th className="py-1">Section</th>
                                        <th className="py-1">Changes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {changes?.map((change, index) => (
                                        <tr key={index}>
                                            <td className="py-1">
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
                                            <td className="py-1">Best Practices</td>
                                            <td className="py-1 text-[12px]">
                                                {change.action === "delete" ? (
                                                    <span>Row {change.index + 1} deleted</span>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        {Object.entries(change.changes)?.map(
                                                            ([field, values]) => (
                                                                <div key={field}>
                                                                    <strong>{field}:</strong>{" "}
                                                                    {values.old || "Empty"}{" "}
                                                                    <ArrowDown size={12} className="inline" />{" "}
                                                                    {values.new}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
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
