import React, {useEffect, useState} from "react";
import "./IQAC.css";
import Banner from "../../Banner";
import axios from "axios";
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Send, Pencil, X, Trash2, Plus } from 'lucide-react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IqaMet from "./mom";
import IqaAud from "./acadamicaudit";
import IqaPra from "./bestpractice";
import IqaQar from "./agar";
import IqaMem from "./member";
import IqaGal from "./gallery";
import { useAdminRequest } from "../../../hooks/useAdminRequest";


const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    // Return empty string if path is not a string
    if (typeof path !== 'string') return '';
    
    // Handle cases where path might be empty or undefined
    if (!path) return '';
    
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const AdminIQAC = ({ toggle , theme }) => {
    const [iqacData, setIqacData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [iqa, setIqa] = useState("Objectives");
    const navigate = useNavigate();
    const navData = {
        "Objectives": <IqaObj/>,
        "Coordinator": <IqaCor/>,
        "Members": <IqaMem iqacData={iqacData}/>,
        "Minutes of Meetings": <IqaMet iqacData={iqacData}/>,
        "Academic and Administrative Audit": <IqaAud iqacData={iqacData}/>,
        "Gallery": <IqaGal iqacData={iqacData}/>,
        "Strategic Development Plan": <IqaOne title={"Strategic Development Plan"}/>,
        "Best Practices": <IqaPra iqacData={iqacData}/>,
        "Institutional Distinctiveness": <IqaOne title={"Institutional Distinctiveness"}/>,
        "Code of Ethics": <IqaOne title={"Code of Ethics"}/>,
        "AQAR": <IqaQar iqacData={iqacData}/>,
        "ISO Certificate": <IqaOne title={"ISO Certificate"}/>,
    };

    useEffect(() => {

        const typeMatch = {
            "Objectives": "objectives",
            "Coordinator": "coordinator",
            "Members": "members",
            "Minutes of Meetings": "minutes_of_meetings",
            "Academic and Administrative Audit": "academic_admin_audit",
            "Gallery": "gallery",
            "Strategic Development Plan": "strategic_plan",
            "Best Practices": "best_practices",
            "Institutional Distinctiveness": "institutional_distinctiveness",
            "Code of Ethics": "code_of_ethics",
            "AQAR": "aqar",
            "ISO Certificate": "iso_certificate"
        }
        // Simulate fetching data from a local source
        const fetchData = async () => {
            setIqacData(null);
            try {
                const response = await axios.post('/api/main-backend/iqac',
                    {
                        type: typeMatch[iqa]
                    }
                );
                setIqacData(response.data.data);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                if (error.response.data.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message}})
                } 
            }
        };

        fetchData();
    }, [iqa]);

    // Render Objectives content
    function IqaObj () {
        const [isEditing, setIsEditing] = useState(false);
        const [editedData, setEditedData] = useState(iqacData || { about: "", objectives: [] });
        const [savedData, setSavedData] = useState(iqacData || { about: "", objectives: [] });
        const [showRequestModal, setShowRequestModal] = useState(false);
        const [changes, setChanges] = useState({ about: null, objectives: [] });
        const { sendRequest, loading, error } = useAdminRequest();

        if (!iqacData) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            );
        }

        const handleAboutChange = (e) => {
            setEditedData({ ...editedData, about: e.target.value });
        };

        const handleObjectiveChange = (index, value) => {
            const newObjectives = [...editedData.objectives];
            newObjectives[index] = value;
            setEditedData({ ...editedData, objectives: newObjectives });
        };

        const handleAddObjective = () => {
            setEditedData({
                ...editedData,
                objectives: [...editedData.objectives, ""]
            });
        };

        const handleDeleteObjective = (index) => {
            const newObjectives = editedData.objectives.filter((_, i) => i !== index);
            setEditedData({ ...editedData, objectives: newObjectives });
        };

        const handleSave = () => {
            // Compare original with edited and collect changes with proper action types
            const aboutChange = editedData.about !== iqacData.about ? {
                old: iqacData.about,
                new: editedData.about,
                action: "edit"
            } : null;
            
            // Track objective changes
            const objectiveChanges = [];
            const oldObjectives = iqacData.objectives || [];
            const newObjectives = editedData.objectives || [];
            
            // Track which old objectives have been matched
            const matchedOldIndices = new Set();
            
            // First, find exact matches (same content and roughly same position)
            // This helps identify edits vs adds/deletes
            newObjectives.forEach((newObj, newIndex) => {
                // Look for this objective in the old list
                for (let oldIndex = 0; oldIndex < oldObjectives.length; oldIndex++) {
                    if (!matchedOldIndices.has(oldIndex) && oldObjectives[oldIndex] === newObj) {
                        // Exact match found - no change
                        matchedOldIndices.add(oldIndex);
                        return;
                    }
                }
                
                // If we get here, this objective is either new or moved
                // Check if it might be an edit of a nearby objective
                for (let oldIndex = 0; oldIndex < oldObjectives.length; oldIndex++) {
                    if (!matchedOldIndices.has(oldIndex)) {
                        const oldObj = oldObjectives[oldIndex];
                        const similarity = calculateSimilarity(oldObj, newObj);
                        if (similarity > 0.7) { // 70% similar - likely an edit
                            objectiveChanges.push({
                                index: newIndex,
                                old: oldObj,
                                new: newObj,
                                action: "edit"
                            });
                            matchedOldIndices.add(oldIndex);
                            return;
                        }
                    }
                }
                
                // No match found - this is a new objective
                objectiveChanges.push({
                    index: newIndex,
                    old: null,
                    new: newObj,
                    action: "add"
                });
            });
            
            // Any remaining old objectives are deletions
            oldObjectives.forEach((oldObj, oldIndex) => {
                if (!matchedOldIndices.has(oldIndex)) {
                    objectiveChanges.push({
                        index: oldIndex,
                        old: oldObj,
                        new: null,
                        action: "delete"
                    });
                }
            });

            // Sort changes by index for better display
            objectiveChanges.sort((a, b) => a.index - b.index);

            setSavedData(editedData);
            setChanges({
                about: aboutChange,
                objectives: objectiveChanges
            });
            setIsEditing(false);
        };

        // Helper function to calculate similarity between two strings
        const calculateSimilarity = (str1, str2) => {
            if (!str1 || !str2) return 0;
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0) return 1.0;
            
            // Simple Levenshtein distance based similarity
            const costs = [];
            for (let i = 0; i <= shorter.length; i++) {
                let lastValue = i;
                for (let j = 0; j <= longer.length; j++) {
                    if (i === 0) {
                        costs[j] = j;
                    } else if (j > 0) {
                        let newValue = costs[j - 1];
                        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
                if (i > 0) costs[longer.length] = lastValue;
            }
            
            const maxLength = Math.max(shorter.length, longer.length);
            const distance = costs[shorter.length];
            return (maxLength - distance) / maxLength;
        };

        const handleCancel = () => {
            setEditedData(savedData);
            setIsEditing(false);
            setChanges({ about: null, objectives: [] });
        };

        const handleDiscard = () => {
            setSavedData(iqacData);
            setEditedData(iqacData);
            setChanges({ about: null, objectives: [] });
        };

        const handleUndoAbout = () => {
            setSavedData(prev => ({ ...prev, about: iqacData.about }));
            setEditedData(prev => ({ ...prev, about: iqacData.about }));
            setChanges(prev => ({ ...prev, about: null }));
        };

        const handleUndoObjective = (changeIndex) => {
            // Remove this specific change
            const remainingChanges = changes.objectives.filter((_, idx) => idx !== changeIndex);
            
            // Reconstruct the objectives array based on remaining changes
            let reconstructedObjectives = [...iqacData.objectives];
            
            remainingChanges.forEach(change => {
                if (change.action === "add") {
                    // Add this objective
                    if (change.index <= reconstructedObjectives.length) {
                        reconstructedObjectives.splice(change.index, 0, change.new);
                    } else {
                        reconstructedObjectives.push(change.new);
                    }
                } else if (change.action === "delete") {
                    // Remove this objective
                    const deleteIndex = reconstructedObjectives.findIndex(obj => obj === change.old);
                    if (deleteIndex !== -1) {
                        reconstructedObjectives.splice(deleteIndex, 1);
                    }
                } else if (change.action === "edit") {
                    // Update this objective
                    const editIndex = reconstructedObjectives.findIndex(obj => obj === change.old);
                    if (editIndex !== -1) {
                        reconstructedObjectives[editIndex] = change.new;
                    }
                }
            });
            
            setSavedData(prev => ({ ...prev, objectives: reconstructedObjectives }));
            setEditedData(prev => ({ ...prev, objectives: reconstructedObjectives }));
            setChanges(prev => ({ 
                ...prev, 
                objectives: remainingChanges 
            }));
        };

        const handleRequestConfirm = async () => {
            if (!changes.about && changes.objectives.length === 0) return;

            const payload = [{
                collectionName: "iqac",
                collection_type: "objectives",
                action: "update",
                title: "updation of iqac objectives",
                meta_data: {
                    about: savedData.about,
                    objectives: savedData.objectives,
                    changes_summary: {
                        about: changes.about,
                        objectives: changes.objectives
                    }
                },
                original_data: {
                    about: iqacData.about,
                    objectives: iqacData.objectives
                }
            }];

            const result = await sendRequest(payload, null);

            if (result) {
                setShowRequestModal(false);
                setChanges({ about: null, objectives: [] });
                setIsEditing(false);
            }
        };

        const getActionDisplay = (action) => {
            switch(action) {
                case "add": return { text: "➕ Added", color: "text-green-600", bgColor: "bg-green-100" };
                case "delete": return { text: "🗑️ Deleted", color: "text-red-600", bgColor: "bg-red-100" };
                case "edit": return { text: "✎ Edited", color: "text-blue-600", bgColor: "bg-blue-100" };
                default: return { text: "✎ Edited", color: "text-blue-600", bgColor: "bg-blue-100" };
            }
        };

        return (
            <>
                <div className="objectives-container relative">
                    {/* Edit Button */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-4 right-8 bg-secd text-text px-3 py-1 rounded hover:bg-[#800000] hover:text-drkt z-10"
                        >
                            Edit
                        </button>
                    )}

                    {/* About IQAC Card */}
                    <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About IQAC</h3>
                        {isEditing ? (
                            <textarea
                                value={editedData.about}
                                onChange={handleAboutChange}
                                className="w-full px-3 py-2 border rounded min-h-[150px] text-text dark:text-drkt dark:bg-gray-800"
                            />
                        ) : (
                            <p className="objectives-text text-text dark:text-drkt">{savedData?.about}</p>
                        )}
                    </div>

                    {/* Objectives Card */}
                    <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">IQAC Objectives</h3>
                        {isEditing ? (
                            <div className="space-y-3">
                                {editedData.objectives?.map((objective, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <span className="text-text dark:text-drkt mt-2">{index + 1}.</span>
                                        <textarea
                                            value={objective}
                                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded min-h-[80px] text-text dark:text-drkt dark:bg-gray-800"
                                        />
                                        <button
                                            onClick={() => handleDeleteObjective(index)}
                                            className="mt-2 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddObjective}
                                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-[#800000] hover:text-drkt rounded"
                                >
                                    <Plus size={16} /> Add Objective
                                </button>
                            </div>
                        ) : (
                            <ul className="objectives-list">
                                {savedData?.objectives?.map((objective, index) => (
                                    <li key={index} className="objectives-item text-text dark:text-drkt">{objective}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Save + Cancel Buttons */}
                {isEditing && (
                    <div className="flex justify-end gap-2 mt-3 mr-4">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-400 text-white rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
                        >
                            Save
                        </button>
                    </div>
                )}

                {/* Discard + Request Buttons */}
                {!isEditing && (changes.about || changes.objectives.length > 0) && (
                    <div className="flex justify-end gap-2 mt-4 mr-5">
                        <button
                            onClick={handleDiscard}
                            className="px-4 py-2 bg-gray-400 text-white rounded"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
                        >
                            Request
                        </button>
                    </div>
                )}

                <ToastContainer position="bottom-right" autoClose={3000} />

                {/* Request Modal */}
                {showRequestModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] overflow-y-auto">
                        <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">Final Request for the Changes</h2>
                            <p className="text-sm text-red-500 mb-4">
                                Note: Your changes will stay pending until approved by the superior admin.
                            </p>

                            <div className="max-h-[300px] overflow-y-auto mb-4">
                                <table className="w-full text-left text-text dark:text-drkt border-collapse">
                                    <thead className="sticky top-0 bg-drkt dark:bg-drkp">
                                        <tr className="border-b-2 border-secd">
                                            <th className="py-2 px-2">Action</th>
                                            <th className="py-2 px-2">Field</th>
                                            <th className="py-2 px-2">Changes</th>
                                            <th className="py-2 px-2 text-center">Undo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {changes.about && (
                                            <tr className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-3 px-2">
                                                    <span className="text-blue-600 font-medium">✎ Edited</span>
                                                </td>
                                                <td className="py-3 px-2 font-medium">About IQAC</td>
                                                <td className="py-3 px-2">
                                                    <div className="text-sm">
                                                        <span className="line-through text-gray-500 block">{changes.about.old.substring(0, 50)}...</span>
                                                        <span className="text-green-600 block">{changes.about.new.substring(0, 50)}...</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <button 
                                                        onClick={handleUndoAbout} 
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                                        title="Undo this change"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                        
                                        {changes.objectives.map((change, idx) => {
                                            const actionDisplay = getActionDisplay(change.action);
                                            return (
                                                <tr key={`objective-${idx}`} className={`border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${actionDisplay.bgColor} bg-opacity-30`}>
                                                    <td className="py-3 px-2">
                                                        <span className={`${actionDisplay.color} font-medium`}>
                                                            {actionDisplay.text}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 font-medium">{`Objective ${change.index + 1}`}</td>
                                                    <td className="py-3 px-2">
                                                        <div className="text-sm">
                                                            {change.action === "add" && (
                                                                <span className="text-green-600 block">"{change.new.substring(0, 50)}{change.new.length > 50 ? '...' : ''}"</span>
                                                            )}
                                                            {change.action === "delete" && (
                                                                <span className="text-red-600 line-through block">"{change.old.substring(0, 50)}{change.old.length > 50 ? '...' : ''}"</span>
                                                            )}
                                                            {change.action === "edit" && (
                                                                <>
                                                                    <span className="text-gray-500 line-through block text-xs">Old: "{change.old.substring(0, 30)}..."</span>
                                                                    <span className="text-green-600 block text-sm">New: "{change.new.substring(0, 30)}..."</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <button 
                                                            onClick={() => handleUndoObjective(idx)} 
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                                            title="Undo this change"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                
                                {!changes.about && changes.objectives.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No changes to display
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed" : "hover:bg-gray-500"}`}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestConfirm}
                                    className={`px-4 py-2 rounded bg-secd text-text ${loading ? "cursor-progress opacity-50" : "hover:bg-[#800000] hover:text-drkt"}`}
                                    disabled={(!changes.about && changes.objectives.length === 0) || loading}
                                >
                                    {loading ? "Processing..." : "Final Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };
    
    // Render Coordinator content
    function IqaCor() {
        const [isEditing, setIsEditing] = useState(false);
        const [editedData, setEditedData] = useState(iqacData || {});
        const [savedData, setSavedData] = useState(iqacData || {});
        const [uploadedFile, setUploadedFile] = useState(null);
        const [showRequestModal, setShowRequestModal] = useState(false);
        const [changes, setChanges] = useState({});
        const { sendRequest, loading, error } = useAdminRequest();

        if (!iqacData) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            );
        }

        const handleChange = (e) => {
            setEditedData({ ...editedData, [e.target.name]: e.target.value });
        };

        const handleFileUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileURL = URL.createObjectURL(file);
                setUploadedFile({ file, fileURL });
            }
        };

        const handleSave = () => {
            setSavedData(editedData);

            // Compare original with edited and collect changes
            const diff = {};
            
            // Check each field for changes
            Object.keys(editedData).forEach((key) => {
                if (editedData[key] !== iqacData[key]) {
                    diff[key] = { 
                        old: iqacData[key], 
                        new: editedData[key],
                        action: "edit" 
                    };
                }
            });
            
            // Check for image change
            if (uploadedFile) {
                diff.image_path = {
                    old: iqacData.image_path,
                    new: uploadedFile.file.name,
                    action: "edit"
                };
            }

            setChanges(diff);
            setIsEditing(false);
        };

        const handleCancel = () => {
            setEditedData(savedData);
            setUploadedFile(null);
            setIsEditing(false);
            setChanges({});
        };

        const handleDiscard = () => {
            setSavedData(iqacData);
            setEditedData(iqacData);
            setUploadedFile(null);
            setChanges({});
        };

        const handleUndo = (field) => {
            // Create a copy of changes without the undone field
            const newChanges = { ...changes };
            delete newChanges[field];
            
            // Update savedData with original value for this field
            const updatedSavedData = { ...savedData };
            updatedSavedData[field] = iqacData[field];
            
            // Also update editedData to match
            const updatedEditedData = { ...editedData };
            updatedEditedData[field] = iqacData[field];
            
            setSavedData(updatedSavedData);
            setEditedData(updatedEditedData);
            
            // If undoing image, clear uploadedFile
            if (field === "image_path") {
                setUploadedFile(null);
            }
            
            setChanges(newChanges);
        };

        const handleRequestConfirm = async () => {
            if (Object.keys(changes).length === 0) return;

            // old data from DB
            const originalData = iqacData;

            // new data from edits
            const metaData = {
                ...savedData,
                image_path: uploadedFile
                    ? `/static/images/profile_photos/${uploadedFile.file.name}` 
                    : savedData.image_path,
            };

            // payload in the required format
            const payload = [
                {
                    collectionName: "iqac",
                    collection_type: "coordinator",
                    action: "update",
                    title: "Updation of iqac coordinator Details",
                    category: "IQAC",
                    meta_data: metaData,
                    original_data: originalData,
                },
            ];            

            const result = await sendRequest(payload, uploadedFile?.file);

            if (result) {
                setShowRequestModal(false);
                setUploadedFile(null);
                setChanges({});
                setIsEditing(false);
            }
        };

        return (
            <div className="coordinator-container flex-wrap">
                <h2 className="text-[24px] text-center text-accn dark:text-drkt my-4 basis-full">
                    IQAC Coordinator
                </h2>

                <div className="coordinator-card relative">
                    {/* Edit Button */}
                    {!isEditing && (
                        <button
                            onClick={() => {
                                setEditedData(savedData);
                                setIsEditing(true);
                            }}
                            className="absolute top-2 right-2 bg-secd text-text px-3 py-1 rounded hover:bg-[#800000] hover:text-drkt"
                        >
                            Edit
                        </button>
                    )}

                    {/* Image */}
                    <div className="admin-coordinator-image-container">
                        {isEditing ? (
                            <>
                                {uploadedFile ? (
                                    <img src={uploadedFile.fileURL} alt="preview" className="coordinator-image mt-2" />
                                ) : (
                                    <img
                                        src={UrlParser(editedData.image_path) || "/placeholder.svg"}
                                        alt={editedData.name}
                                        className="coordinator-image mt-2"
                                    />
                                )}
                                <label className="block w-fit cursor-pointer bg-secd text-text px-3 py-1 rounded hover:bg-[#800000] hover:text-drkt m-auto mt-2">
                                    Replace Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </>
                        ) : (
                            <img
                                src={uploadedFile ? uploadedFile.fileURL : UrlParser(savedData.image_path)}
                                alt={savedData.name}
                                className="coordinator-image"
                            />
                        )}
                    </div>

                    {/* Details */}
                    <div className="coordinator-details w-full">
                        {isEditing ? (
                            <>
                                {["name", "designation", "role", "email", "phone"].map((field) => (
                                    <input
                                        key={field}
                                        type={field === "email" ? "email" : "text"}
                                        name={field}
                                        value={editedData[field] || ""}
                                        onChange={handleChange}
                                        className="border px-2 py-1 rounded w-full mb-2"
                                        placeholder={field}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                <h3 className="coordinator-name">{savedData.name}</h3>
                                <p><span className="font-semibold">Designation:</span> {savedData.designation}</p>
                                <p><span className="font-semibold">Role:</span> {savedData.role}</p>
                                <p><span className="font-semibold">Email:</span> {savedData.email}</p>
                                <p><span className="font-semibold">Phone:</span> {savedData.phone}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Save + Cancel */}
                {isEditing && (
                    <div className="flex gap-2 mt-3 justify-center">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
                        >
                            Save
                        </button>
                    </div>
                )}

                {/* Discard + Request */}
                {!isEditing && Object.keys(changes).length > 0 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            onClick={handleDiscard}
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
                        >
                            Request
                        </button>
                    </div>
                )}

                <ToastContainer position="bottom-right" autoClose={3000} />

                {/* Request Modal */}
                {showRequestModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] overflow-y-auto">
                        <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px] max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Final Request for the Changes</h2>
                            <p className="text-sm text-red-500 mb-4">
                                Note: Your changes will stay pending until approved by the superior admin.
                            </p>

                            <div className="max-h-[200px] overflow-y-auto mb-4">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-drkt dark:bg-drkp">
                                        <tr className="border-b-2 border-secd">
                                            <th className="py-2 px-2">Action</th>
                                            <th className="py-2 px-2">Field</th>
                                            <th className="py-2 px-2">Changes</th>
                                            <th className="py-2 px-2 text-center">Undo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(changes).map((field) => (
                                            <tr key={field} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-3 px-2">
                                                    <span className="text-blue-600 font-medium">✎ Edited</span>
                                                </td>
                                                <td className="py-3 px-2 font-medium capitalize">{field.replace('_', ' ')}</td>
                                                <td className="py-3 px-2">
                                                    <div className="text-sm">
                                                        {field === 'image_path' ? (
                                                            <span className="text-green-600">New image: {changes[field].new}</span>
                                                        ) : (
                                                            <>
                                                                <span className="line-through text-gray-500 block text-xs">Old: {changes[field].old}</span>
                                                                <span className="text-green-600 block">New: {changes[field].new}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <button 
                                                        onClick={() => handleUndo(field)} 
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                                        title="Undo this change"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed" : "hover:bg-gray-500"}`}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestConfirm}
                                    className={`px-4 py-2 rounded bg-secd text-text ${loading ? "cursor-progress opacity-50" : "hover:bg-[#800000] hover:text-drkt"}`}
                                    disabled={Object.keys(changes).length === 0 || loading}
                                >
                                    {loading ? "Processing..." : "Final Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Component for sections with single PDF and replace functionality like Strategic Plan, Institutional Distinctiveness, Code of Ethics, ISO Certificate
    function IqaOne({title}) {
        const [uploadedFile, setUploadedFile] = useState(null);
        const [showRequestModal, setShowRequestModal] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const { sendRequest, loading, error } = useAdminRequest();

        const handleFileUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileURL = URL.createObjectURL(file)
                setUploadedFile({file, fileURL});
            }
        };

        const typeMap = {
            "Code of Ethics": "code_of_ethics",
            "Strategic Development Plan": "strategic_plan",
            "Institutional Distinctiveness": "institutional_distinctiveness",
            "ISO Certificate": "iso_certificate"
        }

        const handleRequestConfirm = async () => {
            if (!uploadedFile) return;

            // const oldPath = iqacData?.[0]?.paths;
            const oldPath = Array.isArray(iqacData) && iqacData[0]?.pdf_path;
            const newPath = `/static/pdfs/iqac/${uploadedFile.file.name}`;

            const payload = [
            {
                collectionName: "iqac",
                collection_type: typeMap[title], 
                action: "update",
                title: `updation of pdf in ${typeMap[title]}`,
                meta_data: {
                    pdf_path: newPath,
                },
                original_data: {
                    pdf_path: oldPath,
                },
            }];

            console.log(payload);
            

            const result = await sendRequest(payload, uploadedFile.file);

            if (result) {
                setShowRequestModal(false);
                setUploadedFile(null);
                setIsEditing(false);
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
                    {!isEditing && (
                        <div className="flex justify-end pt-3 mr-8">
                            <button className="bg-secd text-text px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-drkt flex" onClick={() => setIsEditing(true)}><Pencil/> Edit</button>
                        </div>
                    )}
                    <div className="nirf-pdf-container iqac-pdf-container">
                    <h2 className="basis-full text-center text-[24px] text-brwn dark:text-drkt mb-4">
                        {title}
                    </h2>

                    {/* Replace PDF / Request Button */}
                    {isEditing && (
                        <div className="mb-4 flex justify-center gap-4">
                            {!uploadedFile ? (
                            <>
                                <input
                                    type="file"
                                    id="uploadFile"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <label
                                    htmlFor="uploadFile"
                                    className="bg-yellow-400 text-brown px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white"
                                    >
                                    Replace PDF
                                </label>
                            </>
                            ) : (
                                <>
                                <button onClick={() => {setUploadedFile(null);}} className="bg-gray-500 text-white px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white">
                                    {/* Re - Upload */} Cancel
                                </button>
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="bg-yellow-400 text-brown px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white flex items-center gap-2"
                                >
                                    <Send/> Request
                                </button>
                                </>
                            )}
                        </div>
                    )}

                    <embed
                        className="embed"
                        src={uploadedFile?.fileURL ? uploadedFile.fileURL + "#toolbar=0" : UrlParser(Array.isArray(iqacData) && iqacData[0]?.pdf_path) + "#toolbar=0"}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />

                    <ToastContainer position="bottom-right" autoClose={3000} />

                    {/* Request Confirmation Modal */}
                    {showRequestModal && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                            <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px]">
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
                                <div className="max-h-[200px] overflow-y-auto mb-4">
                                <table className="w-full text-center text-text dark:text-drkt">
                                    <thead>
                                    <tr>
                                        <th className="py-1">Action</th>
                                        <th className="py-1">Section</th>
                                        <th className="py-1 text-center">Changes</th>
                                        <th className="py-1 text-center">Undo</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="py-1 text-blue-600">✎ Edited</td>
                                        <td className="py-1">IQAC {title}</td>
                                        <td className="py-1 text-[12px] flex flex-col items-center">{uploadedFile?.file.name}</td>
                                        <td className="py-1">
                                            <button
                                                onClick={() => {
                                                setUploadedFile(null); // reset uploaded file
                                                setShowRequestModal(false);
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X />
                                            </button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className={`px-4 py-2 rounded bg-gray-400 text-white ${loading ? "cursor-not-allowed" : ""}`}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestConfirm}
                                    className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${loading ? "cursor-progress" : "hover:bg-[#800000]"}`}
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : "Final Request"}
                                </button>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </>
            )}
            </>
        );
    }
    
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }
    return (
        <>
            <Banner
                toggle={toggle} theme={theme}
                backgroundImage="./Banners/IQAC_Banner.webp"
                headerText="IQAC"
                subHeaderText="IQAC"
            />
            <div className="">

                <SideNav sts={iqa} setSts={setIqa} navData={navData} cls={""}/>
            </div>
        </>
    );
};

export default AdminIQAC;