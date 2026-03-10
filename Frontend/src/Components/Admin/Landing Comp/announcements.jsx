import React, { useState, useEffect } from "react";
import "./announcements.css";
import img1 from "../../Assets/hostel.png";
import star from "../../Assets/championship.gif";
import { Check, Edit, Eye, Pencil, Trash2 } from "lucide-react";
import { useAdminRequest } from "../../hooks/useAdminRequest";
import { toast } from "react-toastify";

const Announcements1 = ({ anno, spc }) => {
    const [flipped, setFlipped] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [hasPendingRequests, setHasPendingRequests] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [discardPopup, setDiscardPopup] = useState(false);
    const [editedContent, setEditedContent] = useState({ spc: [], anno: [] });
    const [originalContent, setOriginalContent] = useState({ spc: [], anno: [] });
    const [pendingRequests, setPendingRequests] = useState({ spc: [], anno: [] });
    const [deletionIndex, setDeletionIndex] = useState(null);
    const [linkReplacementIndex, setLinkReplacementIndex] = useState(null);

    // State for editing announcements
    const [editIndex, setEditIndex] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({
        unique_id: "",
        announcement_name: "",
        pdf_path: "",
        date: new Date().toISOString().split('T')[0],
        status: "active",
        file: null
    });

    // Track files to upload
    const [filesToUpload, setFilesToUpload] = useState([]);

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const { sendRequest, loading } = useAdminRequest();

    // Helper function to create URL-safe filename (no spaces or special characters)
    const createSafeFilename = (originalName) => {
        // Replace spaces and special characters with underscores
        const safeName = originalName
            .replace(/[^a-zA-Z0-9.]/g, '_') // Replace any non-alphanumeric except dot with underscore
            .replace(/_+/g, '_'); // Replace multiple underscores with single
        
        // Add timestamp to ensure uniqueness
        const timestamp = Date.now();
        const nameParts = safeName.split('.');
        if (nameParts.length > 1) {
            const ext = nameParts.pop();
            const baseName = nameParts.join('.');
            return `${baseName}_${timestamp}.${ext}`;
        }
        return `${safeName}_${timestamp}`;
    };

    const UrlParser = (path) => {
        if (!path) return "";
        if (typeof path !== "string") return URL.createObjectURL(path);
        if (path.startsWith("http")) return path;
        return `${BASE_URL}${path}`;
    };

    useEffect(() => {
        setOriginalContent({ spc: spc || [], anno: anno || [] });
        setEditedContent({ spc: spc || [], anno: anno || [] });
        setPendingRequests({ spc: spc || [], anno: anno || [] });
        // Reset hasPendingRequests if pendingRequests equals originalContent
        if (JSON.stringify({ spc: spc || [], anno: anno || [] }) === JSON.stringify(pendingRequests)) {
            setHasPendingRequests(false);
        }
    }, [spc, anno]);

    useEffect(() => {
        let flipInterval;
        let indexUpdateInterval;
        if (!hovered && !isEditing) {
            flipInterval = setInterval(() => setFlipped((prev) => !prev), 6000);
            indexUpdateInterval = setInterval(() => {
                setCurrentIndex((prev) => {
                    const nextIndex = prev + 8;
                    return nextIndex >= editedContent.anno.length ? 0 : nextIndex;
                });
            }, 12000);
        }
        return () => {
            clearInterval(flipInterval);
            clearInterval(indexUpdateInterval);
        };
    }, [hovered, editedContent.anno.length, isEditing]);

    const ITEMS_PER_PAGE = 4;
    const PAGE_SIZE = ITEMS_PER_PAGE * 2;
    
    const handleManualFlip = (direction) => {
        setCurrentIndex((prev) => {
            const maxIndex =
                Math.ceil(editedContent.anno.length / PAGE_SIZE) * PAGE_SIZE - PAGE_SIZE;

            if (direction === "next") {
                return prev >= maxIndex ? 0 : prev + PAGE_SIZE;
            }

            if (direction === "prev") {
                return prev <= 0 ? maxIndex : prev - PAGE_SIZE;
            }

            return prev;
        });

        setFlipped(f => !f);
    };

    const getItems = (arr, start, count) => (!arr?.length ? [] : arr.slice(start, start + count));
    const frontItems = editedContent.anno.length <= 4 ? editedContent.anno : getItems(editedContent.anno, currentIndex, 4);
    const backItems = getItems(editedContent.anno, currentIndex + 4 < editedContent.anno.length ? currentIndex + 4 : 0, 4);

    const handleEditClick = () => {
        setEditedContent(JSON.parse(JSON.stringify(pendingRequests)));
        setIsEditing(true);
        setHasUnsavedChanges(false);
    };

    const handleCancel = () => {
        setEditedContent(JSON.parse(JSON.stringify(pendingRequests)));
        setHasUnsavedChanges(false);
        setIsEditing(false);
        setLinkReplacementIndex(null);
        setDeletionIndex(null);
        setEditIndex(null);
        setNewAnnouncement({ 
            unique_id: "", announcement_name: "", pdf_path: "", 
            date: new Date().toISOString().split('T')[0], status: "active", file: null 
        });
        setFilesToUpload([]);
    };

    const handleSave = () => {
        setPendingRequests(JSON.parse(JSON.stringify(editedContent)));
        setHasUnsavedChanges(false);
        setIsEditing(false);
        setEditIndex(null);
        setNewAnnouncement({ 
            unique_id: "", announcement_name: "", pdf_path: "", 
            date: new Date().toISOString().split('T')[0], status: "active", file: null 
        });
        setFilesToUpload([]);
        // Only set hasPendingRequests to true if there are actual changes from original
        if (JSON.stringify(originalContent) !== JSON.stringify(editedContent)) {
            setHasPendingRequests(true);
        }
    };

    const handleDiscardAll = () => {
        setDiscardPopup(true);
    };

    const confirmDiscardAll = () => {
        setPendingRequests(JSON.parse(JSON.stringify(originalContent)));
        setEditedContent(JSON.parse(JSON.stringify(originalContent)));
        setHasPendingRequests(false);
        setHasUnsavedChanges(false);
        setIsEditing(false);
        setDiscardPopup(false);
    };

    const handleRequest = () => setConfirmPopup(true);

    const handleConfirmRequest = async () => {
        const payload = [];
        
        // Handle special announcements (spc) changes
        if (JSON.stringify(originalContent.spc) !== JSON.stringify(pendingRequests.spc)) {
            payload.push({
                collectionName: "landing_page_details",
                collection_type: "special_announcements",
                action: "update",
                title: "update in special_announcements",
                original_data: originalContent.spc[0],
                meta_data: pendingRequests.spc[0]
            });
        }

        // Create maps for easy lookup
        const originalAnnoMap = new Map();
        originalContent.anno.forEach(item => {
            const key = item.unique_id || item.announcement_name;
            originalAnnoMap.set(key, item);
        });

        const pendingAnnoMap = new Map();
        pendingRequests.anno.forEach(item => {
            const key = item.unique_id || item.announcement_name;
            pendingAnnoMap.set(key, item);
        });

        // Find deleted announcements
        originalContent.anno.forEach(item => {
            const key = item.unique_id || item.announcement_name;
            if (!pendingAnnoMap.has(key)) {
                payload.push({
                    collectionName: "landing_page_details",
                    collection_type: "announcements",
                    action: "delete",
                    title: "delete in announcements",
                    meta_data: item  // For delete, we send the item to be deleted
                });
            }
        });

        // Find inserted announcements
        pendingRequests.anno.forEach(item => {
            const key = item.unique_id || item.announcement_name;
            if (!originalAnnoMap.has(key)) {
                payload.push({
                    collectionName: "landing_page_details",
                    collection_type: "announcements",
                    action: "insert",
                    title: "insert in announcements",
                    meta_data: {
                        unique_id: item.unique_id,
                        announcement_name: item.announcement_name,
                        pdf_path: item.pdf_path,
                        date: item.date,
                        status: item.status
                    }
                });
            }
        });

        // Find updated announcements (exists in both but content changed)
        pendingRequests.anno.forEach(item => {
            const key = item.unique_id || item.announcement_name;
            const originalItem = originalAnnoMap.get(key);
            
            if (originalItem && JSON.stringify(originalItem) !== JSON.stringify(item)) {
                payload.push({
                    collectionName: "landing_page_details",
                    collection_type: "announcements",
                    action: "update",
                    title: "update in announcements",
                    original_data: originalItem,
                    meta_data: {
                        unique_id: item.unique_id,
                        announcement_name: item.announcement_name,
                        pdf_path: item.pdf_path,
                        date: item.date,
                        status: item.status
                    }
                });
            }
        });

        // Send request with files
        if (payload.length > 0) {
            const result = await sendRequest(payload, filesToUpload);
            if (result?.success) {
                setOriginalContent(JSON.parse(JSON.stringify(pendingRequests)));
                setHasPendingRequests(false);
                setConfirmPopup(false);
                toast.success("Request submitted successfully");
            }
        }
    };

    const handleLinkReplace = (index, newLink) => {
        setHasUnsavedChanges(true);
        const updatedSpc = [...editedContent.spc];
        const updatedLinks = [...updatedSpc[0].list_of_links];
        updatedLinks[index] = newLink;
        updatedSpc[0].list_of_links = updatedLinks;
        setEditedContent({ ...editedContent, spc: updatedSpc });
        setLinkReplacementIndex(null);
    };

    const handleAnnouncementChange = (index, field, value) => {
        setHasUnsavedChanges(true);
        const updatedAnno = [...editedContent.anno];
        updatedAnno[index] = { ...updatedAnno[index], [field]: value };
        setEditedContent({ ...editedContent, anno: updatedAnno });
    };

    const handleDeleteAnnouncement = (index) => setDeletionIndex(index);

    const confirmDelete = () => {
        setHasUnsavedChanges(true);
        const updatedAnno = [...editedContent.anno];
        updatedAnno.splice(deletionIndex, 1);
        setEditedContent({ ...editedContent, anno: updatedAnno });
        setDeletionIndex(null);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a safe filename (no spaces or special characters)
            const safeFileName = createSafeFilename(file.name);
            
            // Create a new File object with the safe filename
            const safeFile = new File([file], safeFileName, { type: file.type });
            
            setFilesToUpload(prev => [...prev, safeFile]);
            
            // Create the server path with the safe filename
            const serverPath = `/static/pdfs/announcements/${safeFileName}`;
            
            setNewAnnouncement({
                ...newAnnouncement,
                pdf_path: serverPath,
                file: safeFile
            });
            setHasUnsavedChanges(true);
        }
    };

    const handleAddOrUpdateAnnouncement = () => {
        setHasUnsavedChanges(true);
        
        if (editIndex !== null) {
            // Update existing announcement
            const updatedAnno = [...editedContent.anno];
            updatedAnno[editIndex] = { 
                unique_id: editedContent.anno[editIndex].unique_id || `ann_${Date.now()}`,
                announcement_name: newAnnouncement.announcement_name,
                pdf_path: newAnnouncement.pdf_path,
                date: newAnnouncement.date,
                status: "active"
            };
            setEditedContent({ ...editedContent, anno: updatedAnno });
            setEditIndex(null);
        } else {
            // Add new announcement
            const newItem = {
                unique_id: `ann_${Date.now()}`,
                announcement_name: newAnnouncement.announcement_name,
                pdf_path: newAnnouncement.pdf_path,
                date: newAnnouncement.date,
                status: "active"
            };
            const updatedAnno = [...editedContent.anno, newItem];
            setEditedContent({ ...editedContent, anno: updatedAnno });
        }
        setNewAnnouncement({ 
            unique_id: "", announcement_name: "", pdf_path: "", 
            date: new Date().toISOString().split('T')[0], status: "active", file: null 
        });
    };

    const startEditAnnouncement = (item, index) => {
        setNewAnnouncement({
            unique_id: item.unique_id || `ann_${Date.now()}`,
            announcement_name: item.announcement_name,
            pdf_path: item.pdf_path,
            date: item.date || new Date().toISOString().split('T')[0],
            status: item.status || "active",
            file: null
        });
        setEditIndex(index);
    };

    return (
        <div className="news-container bg-prim dark:bg-drkp text-text dark:text-drkt font-popp mt-4 w-full relative">
            {!isEditing && (
                <button
                    className="absolute -top-6 right-[85px] bg-secd dark:bg-drks text-text dark:text-drkt px-3 py-1 rounded-md z-10 flex"
                    onClick={handleEditClick}
                >
                    <Pencil size={16} /> Edit
                </button>
            )}

            <div className="announcement-wrapper flex flex-col md:flex-row w-full min-h-[50vh]">
                {/* IMAGE + NOMINATIONS LEFT SIDE */}
                <div className="image-section hidden md:block md:w-[40%] lg:w-[30%] relative">
                    <div className="image-overlay"></div>
                    <img className="college-image" src={img1} alt="college" />
                </div>
                <div className="nominations-section w-full md:w-[55%] lg:w-[35%] px-4 md:px-0">
                    {editedContent.spc?.map((item, spcIndex) => (
                        <div key={spcIndex} className="mb-4">
                            {isEditing ? (
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            setHasUnsavedChanges(true);
                                            const updatedSpc = [...editedContent.spc];
                                            updatedSpc[spcIndex].title = e.target.value;
                                            setEditedContent({ ...editedContent, spc: updatedSpc });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded mb-2"
                                        placeholder="Title"
                                    />
                                    <textarea
                                        value={item.content}
                                        onChange={(e) => {
                                            setHasUnsavedChanges(true);
                                            const updatedSpc = [...editedContent.spc];
                                            updatedSpc[spcIndex].content = e.target.value;
                                            setEditedContent({ ...editedContent, spc: updatedSpc });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="Content"
                                        rows="3"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="lan-section-title">{item.title}</h2>
                                    <p className="section-content">{item.content}</p>
                                </>
                            )}
                        </div>
                    ))}
                    <ul className="awards-list">
                        {editedContent.spc[0]?.list_of_contents?.map((item, index) => (
                            <li className="award-item flex items-center" key={index}>
                                <img className="award-icon" src={star} alt="Trophy" />
                                {isEditing ? (
                                    <div className="flex items-center w-full">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => {
                                                setHasUnsavedChanges(true);
                                                const updatedSpc = [...editedContent.spc];
                                                const updatedContents = [...updatedSpc[0].list_of_contents];
                                                updatedContents[index] = e.target.value;
                                                updatedSpc[0].list_of_contents = updatedContents;
                                                setEditedContent({ ...editedContent, spc: updatedSpc });
                                            }}
                                            className="flex-grow p-1 border border-gray-300 rounded mr-2"
                                        />
                                        <button
                                            onClick={() =>
                                                window.open(editedContent.spc[0]?.list_of_links[index], "_blank")
                                            }
                                            className="px-2 py-1 text-blue-500 rounded text-sm mr-1"
                                            title="Preview"
                                        >
                                            <Eye size={20}/>
                                        </button>
                                        {linkReplacementIndex === index ? (
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    defaultValue={editedContent.spc[0]?.list_of_links[index]}
                                                    onBlur={(e) => handleLinkReplace(index, e.target.value)}
                                                    className="p-1 border border-gray-300 rounded mr-1"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => setLinkReplacementIndex(null)}
                                                    className="px-2 py-1 bg-gray-300 rounded"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setLinkReplacementIndex(index)}
                                                className="px-2 py-1 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded text-sm ml-2"
                                            >
                                                Replace Link
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <a
                                        href={editedContent.spc[0]?.list_of_links[index]}
                                        className="award-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ANNOUNCEMENTS SECTION */}
                <div className="announcements-card w-[200px] md:w-[200px] lg:w-[25%] px-4 md:px-0">
                    {!isEditing ? (
                        <div
                            className="card-container"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                                <div className="card-front overflow-y-auto">
                                    <h2 className="card-title">
                                        Announcements
                                    </h2>
                                    <div className="announcements-content">
                                        {frontItems?.map((item, i) => (
                                            <div key={i} className="announcement-item flex justify-between items-center">
                                                <a
                                                    href={UrlParser(item?.pdf_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="announcement-link text-left flex-grow"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {item?.announcement_name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flip-buttons">
                                        <button className="flip-btn" onClick={() => handleManualFlip("prev")}>↺</button>
                                        <button className="flip-btn" onClick={() => handleManualFlip("next")}>↻</button>
                                    </div>
                                </div>
                                <div className="card-back overflow-y-auto">
                                    <h2 className="card-title">Announcements</h2>
                                    <div className="announcements-content">
                                        {backItems?.map((item, i) => (
                                            <div key={i} className="announcement-item flex justify-between items-center">
                                                <a
                                                    href={UrlParser(item?.pdf_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="announcement-link text-left flex-grow"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {item?.announcement_name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flip-buttons">
                                        <button className="flip-btn" onClick={() => handleManualFlip("prev")}>↺</button>
                                        <button className="flip-btn" onClick={() => handleManualFlip("next")}>↻</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-container overflow-y-auto max-h-[400px] p-2">
                            <h2 className="card-title">Announcements (Editing)</h2>
                            {editedContent.anno?.map((item, i) => (
                                <div key={i} className="announcement-item flex justify-between items-center mb-2">
                                    <input
                                        type="text"
                                        value={item.announcement_name}
                                        onChange={(e) => handleAnnouncementChange(i, "announcement_name", e.target.value)}
                                        className="flex-grow p-1 border border-gray-300 rounded mr-1"
                                    />
                                    <button
                                        onClick={() => window.open(UrlParser(item?.pdf_path), "_blank")}
                                        className="px-2 py-1 text-blue-500 text-sm mr-1"
                                        title="Preview"
                                    >
                                        <Eye size={16}/>
                                    </button>
                                    <button
                                        onClick={() => startEditAnnouncement(item, i)}
                                        className="px-2 py-1 text-green-500 rounded text-sm mr-1"
                                    >
                                        <Edit size={16}/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(i)}
                                        className="px-2 py-1 text-red-500 rounded text-sm"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ADD/UPDATE ANNOUNCEMENT FORM */}
                    {isEditing && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <h3 className="font-semibold mb-2">
                                {editIndex !== null ? "Update Announcement" : "Add New Announcement"}
                            </h3>
                            <input
                                type="text"
                                value={newAnnouncement.announcement_name}
                                onChange={(e) =>
                                    setNewAnnouncement({ ...newAnnouncement, announcement_name: e.target.value })
                                }
                                placeholder="Announcement Name"
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                            />
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    id="pdfUpload"
                                    style={{ display: "none" }}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("pdfUpload").click()}
                                    className="px-4 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded"
                                >
                                    {!newAnnouncement.file ? "Upload PDF" : "Replace PDF"}
                                </button>
                                {newAnnouncement.file && (
                                    <span className="text-sm truncate max-w-[150px]">
                                        {newAnnouncement.file.name}
                                    </span>
                                )}
                                {newAnnouncement.pdf_path && !newAnnouncement.file && (
                                    <span className="text-sm truncate max-w-[150px] text-gray-600">
                                        Current: {newAnnouncement.pdf_path.split('/').pop()}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddOrUpdateAnnouncement}
                                    className="w-full py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded"
                                    disabled={
                                        !newAnnouncement.announcement_name ||
                                        (!newAnnouncement.file && !newAnnouncement.pdf_path)
                                    }
                                >
                                    {editIndex !== null ? "Update Announcement" : "Add Announcement"}
                                </button>
                                {editIndex !== null && (
                                    <button
                                        onClick={() => {
                                            setEditIndex(null);
                                            setNewAnnouncement({ 
                                                unique_id: "", announcement_name: "", pdf_path: "", 
                                                date: new Date().toISOString().split('T')[0], status: "active", file: null 
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                                    >
                                        Cancel Update
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION BUTTONS */}
            {isEditing && (
                <div className="w-full flex justify-center gap-4 p-4 mt-4">
                    <button 
                        onClick={handleCancel} 
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    {hasUnsavedChanges && (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded-md"
                        >
                            Save
                        </button>
                    )}
                </div>
            )}

            {/* Only show Request and Discard All buttons if there are actual pending requests */}
            {!isEditing && hasPendingRequests && (
                <div className="w-full flex justify-center gap-4 p-4 mt-4">
                    <button
                        onClick={handleDiscardAll}
                        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                    >
                        Discard All Changes
                    </button>
                    <button
                        onClick={handleRequest}
                        disabled={loading}
                        className="px-4 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded-md"
                    >
                        {loading ? "Sending..." : "Request"}
                    </button>
                </div>
            )}

            {/* DELETE MODAL */}
            {deletionIndex !== null && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[350px]">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">Are you sure you want to delete this announcement?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeletionIndex(null)} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISCARD ALL MODAL */}
            {discardPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Discard All Changes</h2>
                        <p className="mb-4 text-red-500">
                            Warning: This will discard all pending requests and revert to the original content. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDiscardPopup(false)}
                                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDiscardAll}
                                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                            >
                                Discard All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REQUEST MODAL */}
            {confirmPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Confirm Request</h2>
                        <p className="text-sm text-red-500 mb-4">
                            Note: Your changes will stay pending until approved by the superior admin. 
                            Once approved, they will be applied automatically to the live site.
                        </p>
                        <div className="max-h-[200px] overflow-y-auto mb-4">
                            <table className="w-full text-left text-text dark:text-drkt">
                                <thead>
                                    <tr>
                                        <th className="py-1">Action</th>
                                        <th className="py-1">Section</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {JSON.stringify(originalContent.spc) !== JSON.stringify(pendingRequests.spc) && (
                                        <tr>
                                            <td className="py-1 text-blue-600">✎ Edited</td>
                                            <td className="py-1">Special Announcements</td>
                                        </tr>
                                    )}
                                    {JSON.stringify(originalContent.anno) !== JSON.stringify(pendingRequests.anno) && (
                                        <tr>
                                            <td className="py-1 text-blue-600">✎ Edited</td>
                                            <td className="py-1">Announcements</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmPopup(false)}
                                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRequest}
                                disabled={loading}
                                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
                            >
                                {loading ? "Sending..." : "Final Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements1;