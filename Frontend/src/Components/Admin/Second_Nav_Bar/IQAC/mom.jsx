import { Edit, Trash2, Plus, Save, Send, ArrowDown, Upload, Replace } from 'lucide-react';
import LoadComp from "../../LoadComp";
import React, {useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function IqaMet({ iqacData }) {
    const [editableData, setEditableData] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState(null);
    const [changes, setChanges] = useState([]);

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        // Return empty string if path is not a string
        if (typeof path !== 'string') return '';
        
        // Handle cases where path might be empty or undefined
        if (!path) return '';
        
        return path.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    // Initialize editable data when iqacData loads
    useEffect(() => {
        if (iqacData && Array.isArray(iqacData)) {
            setEditableData([...iqacData]);
        }
    }, [iqacData]);

    const confirmDelete = () => {
        handleDelete(indexToDelete);
        setDeleteConfirm(false);
        setIndexToDelete(null);
    }

    // Handle input changes
    const handleInputChange = (index, field, value) => {
        const newData = [...editableData];

        let finalValue = value;
        if (field === 'conducted_on' && value.includes('-')) {
            // Convert back yyyy-MM-dd → dd.MM.yyyy
            const [year, month, day] = value.split('-');
            finalValue = `${day}.${month}.${year}`;
        }

        newData[index] = { ...newData[index], [field]: finalValue };
        setEditableData(newData);
        setHasChanges(true);
        
        // Track changes
        const changeIndex = changes.findIndex(c => c.index === index);
        if (changeIndex >= 0) {
            changes[changeIndex].changes[field] = { old: iqacData[index]?.[field], new: value };
        } else {
            setChanges([...changes, {
                index,
                action: iqacData[index] ? 'edit' : 'add',
                changes: { [field]: { old: iqacData[index]?.[field], new: value } }
            }]);
        }
    };

    // Handle edit button click
    const handleEdit = (index) => {
        setEditingRow(index);
    };

    // Handle delete
    const handleDelete = (index) => {
        const newData = editableData.filter((_, i) => i !== index);
        setEditableData(newData);
        setHasChanges(true);
        
        // Track deletion
        setChanges([...changes, {
            index,
            action: 'delete',
            deletedItem: editableData[index]
        }]);
    };

    // Add new row
    const handleAddRow = () => {
        const newRow = {
            year: '',
            type: 'ODD',
            conducted_on: '',
            path: ''
        };
        setEditableData([...editableData, newRow]);
        setEditingRow(editableData.length);
        setHasChanges(true);
    };

    // Handle request confirmation
    const handleRequestConfirm = () => {
        // Here you would send the request to the backend
        console.log('Final request submitted:', editableData, changes);
        toast.success("Request submitted successfully!");
        setShowRequestModal(false);
        setHasChanges(false);
        setChanges([]);
        // Reset or update UI as needed
    };

    // Convert "dd.MM.yyyy" → "yyyy-MM-dd"
    const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
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
                        Minutes of Meetings
                    </h2>

                    <div className="flex justify-center p-4 w-full">
                        <div className="overflow-x-auto border rounded-lg shadow-md">
                            <table className="w-[1200px] department-table">
                                <thead className="bg-gry">
                                    <tr>
                                        <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                                        <th className="text-center px-4 py-2 text-text">Year</th>
                                        <th className="text-center px-4 py-2 text-text">ODD/EVEN</th>
                                        <th className="text-center px-4 py-2 text-text">Conducted On</th>
                                        <th className="text-center px-4 py-2 text-text">Links</th>
                                        <th className="text-center px-4 py-2 text-text">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableData?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="text-center w-2 px-2 py-2">{index + 1}</td>
                                            
                                            {/* Year */}
                                            <td className="text-center px-2 py-2">
                                                {editingRow === index ? (
                                                    <input
                                                        type="text"
                                                        value={item.year || ''}
                                                        onChange={(e) => handleInputChange(index, 'year', e.target.value)}
                                                        className="w-[100px] px-2 py-1 border rounded text-center"
                                                        placeholder="Year"
                                                    />
                                                ) : (
                                                    item.year
                                                )}
                                            </td>
                                            
                                            {/* Type */}
                                            <td className="text-center px-2 py-2">
                                                {editingRow === index ? (
                                                    <select
                                                        value={item.type || 'ODD'}
                                                        onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                                                        className="w-[100px] px-2 py-1 border rounded text-center"
                                                    >
                                                        <option value="ODD">ODD</option>
                                                        <option value="EVEN">EVEN</option>
                                                    </select>
                                                ) : (
                                                    item.type
                                                )}
                                            </td>
                                            
                                            {/* Conducted On */}
                                            <td className="text-center px-2 py-2">
                                                {editingRow === index ? (
                                                    <input
                                                        type="date"
                                                        value={formatDateForInput(item.conducted_on)}
                                                        onChange={(e) => handleInputChange(index, 'conducted_on', e.target.value)}
                                                        className="w-[150px] px-2 py-1 border rounded text-center"
                                                    />
                                                ) : (
                                                    formatDateForInput(item.conducted_on)
                                                )}
                                            </td>
                                            
                                            {/* PDF file */}
                                            <td className="text-center px-2 py-2 w-[250px]">
                                                {editingRow === index ? (
                                                    <div className="flex justify-between">
                                                        <input
                                                            type="file"
                                                            // value={item.path || ''}
                                                            onChange={(e) => handleInputChange(index, 'path', e.target.value)}
                                                            className="w-[250px] px-2 py-1 border rounded text-center"
                                                            placeholder="File path or URL"
                                                        />
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={UrlParser(item.path) || "#"}
                                                        target={item.path ? "_blank" : ""}
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        View PDF
                                                    </a>
                                                )}
                                            </td>
                                            
                                            {/* Actions */}
                                            <td className="text-center px-2 py-2">
                                                <div className="flex justify-center gap-2">
                                                    {editingRow === index ? (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingRow(null)}
                                                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                                title="Save"
                                                            >
                                                                <Save size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {setDeleteConfirm(true); setIndexToDelete(index);}}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                                title="Delete"
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
                            
                            {/* Add New Row Button */}
                            <div className="flex justify-center p-4 border-t">
                                <button
                                    onClick={handleAddRow}
                                    className="flex items-center gap-2 px-4 py-2 bg-secd dark:bg-drks text-text rounded hover:drks dark:hover:secd"
                                >
                                    <Plus size={16} />
                                    Add New Row
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
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
                    </div>
                    <ToastContainer position="bottom-right" autoClose={3000} />
                </>
            )}

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px] max-h-[80vh] overflow-y-auto">
                        {/* Title */}
                        <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                            Final Request for the Changes
                        </h2>

                        {/* Note */}
                        <p className="text-sm text-red-500 mb-4">
                            Note: Your changes will stay pending until approved by the superior admin. 
                            Once approved, they will be applied automatically to the live site.
                        </p>

                        {/* Summary */}
                        <div className="max-h-[300px] overflow-y-auto mb-4">
                            <table className="w-full text-center text-text dark:text-drkt">
                                <thead>
                                    <tr>
                                        <th className="py-1">Action</th>
                                        <th className="py-1">Section</th>
                                        <th className="py-1 text-center">Changes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {changes.map((change, index) => (
                                        <tr key={index}>
                                            <td className="py-1">
                                                {change.action === 'edit' && <span className="text-blue-600">✎ Edited</span>}
                                                {change.action === 'add' && <span className="text-green-600">+ Added</span>}
                                                {change.action === 'delete' && <span className="text-red-600">🗑 Deleted</span>}
                                            </td>
                                            <td className="py-1">IQAC Minutes</td>
                                            <td className="py-1 text-[12px]">
                                                {change.action === 'delete' ? (
                                                    <span>Row {change.index + 1} deleted</span>
                                                ) : (
                                                    <div className="flex flex-col items-center border-1 border-text">
                                                        {Object.entries(change.changes).map(([field, values]) => (
                                                            <div key={field} className="mb-1">
                                                                <strong>{field}:</strong> {values.old || 'Empty'} 
                                                                <ArrowDown size={12} className="mx-1 inline" /> 
                                                                {values.new}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
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