import React, { useState, useEffect } from "react";
import "./announcements.css";
import img1 from "../../Assets/hostel.png";
import star from "../../Assets/championship.gif";
import { Check, Edit, Eye, Pencil, Trash2, X } from "lucide-react";

const Announcements1 = ({ anno, spc }) => {
    const [flipped, setFlipped] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [editedContent, setEditedContent] = useState({ spc: [], anno: [] });
    const [originalContent, setOriginalContent] = useState({ spc: [], anno: [] });
    const [deletionIndex, setDeletionIndex] = useState(null);
    const [linkReplacementIndex, setLinkReplacementIndex] = useState(null);

    // NEW STATE for editing announcements
    const [editIndex, setEditIndex] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({
        announcement_name: "",
        pdf_path: "",
        link: ""
    });

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        if (!path) return "";
        if (typeof path !== "string") return URL.createObjectURL(path);
        if (path.startsWith("http")) return path;
        return `${BASE_URL}${path}`;
    };

    useEffect(() => {
        setOriginalContent({ spc: spc || [], anno: anno || [] });
        setEditedContent({ spc: spc || [], anno: anno || [] });
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

    const handleManualFlip = (direction) => {
        setFlipped((prev) => {
            const newFlipped = !prev;
            if (!newFlipped) {
                setCurrentIndex((prevIndex) => {
                    if (direction === "next") {
                        return prevIndex + 4 >= editedContent.anno.length ? prevIndex : prevIndex + 4;
                    } else if (direction === "prev") {
                        return prevIndex - 4 < 0 ? 0 : prevIndex - 4;
                    }
                    return prevIndex;
                });
            }
            return newFlipped;
        });
    };

    const getItems = (arr, start, count) => (!arr?.length ? [] : arr.slice(start, start + count));
    const frontItems = editedContent.anno.length <= 4 ? editedContent.anno : getItems(editedContent.anno, currentIndex, 4);
    const backItems = editedContent.anno.length <= 4 ? editedContent.anno : getItems(editedContent.anno, currentIndex + 4, 4);

    const handleEditClick = () => setIsEditing(true);

    const handleCancel = () => {
        setEditedContent(originalContent);
        setHasChanges(false);
        setIsEditing(false);
        setLinkReplacementIndex(null);
        setDeletionIndex(null);
        setEditIndex(null);
        setNewAnnouncement({ announcement_name: "", pdf_path: "", link: "" });
    };

    const handleSave = () => {
        setOriginalContent(editedContent);
        setEditedContent(editedContent);
        setHasChanges(true);
        setIsEditing(false);
        setEditIndex(null);
    };

    const handleRequest = () => setConfirmPopup(true);

    const handleConfirmRequest = () => {
        console.log("Changes requested for approval:", editedContent);
        setConfirmPopup(false);
        setHasChanges(false);
    };

    const handleLinkReplace = (index, newLink) => {
        setHasChanges(true);
        const updatedSpc = [...editedContent.spc];
        const updatedLinks = [...updatedSpc[0].list_of_links];
        updatedLinks[index] = newLink;
        updatedSpc[0].list_of_links = updatedLinks;
        setEditedContent({ ...editedContent, spc: updatedSpc });
        setLinkReplacementIndex(null);
    };

    const handleAnnouncementChange = (index, field, value) => {
        setHasChanges(true);
        const updatedAnno = [...editedContent.anno];
        updatedAnno[index] = { ...updatedAnno[index], [field]: value };
        setEditedContent({ ...editedContent, anno: updatedAnno });
    };

    const handleDeleteAnnouncement = (index) => setDeletionIndex(index);

    const confirmDelete = () => {
        setHasChanges(true);
        const updatedAnno = [...editedContent.anno];
        updatedAnno.splice(deletionIndex, 1);
        setEditedContent({ ...editedContent, anno: updatedAnno });
        setDeletionIndex(null);
    };

    const handleAddOrUpdateAnnouncement = () => {
        if (editIndex !== null) {
            const updatedAnno = [...editedContent.anno];
            updatedAnno[editIndex] = { ...newAnnouncement };
            setEditedContent({ ...editedContent, anno: updatedAnno });
            setEditIndex(null);
        } else {
            const updatedAnno = [...editedContent.anno, { ...newAnnouncement }];
            setEditedContent({ ...editedContent, anno: updatedAnno });
        }
        setNewAnnouncement({ announcement_name: "", pdf_path: "", link: "" });
        setHasChanges(true);
    };

    return (
        <div className="news-container bg-prim dark:bg-drkp text-text dark:text-drkt font-popp mt-4 w-full relative">
            {!isEditing && !hasChanges && (
                <button
                    className="absolute -top-6 right-[85px] bg-secd dark:bg-drks text-text dark:text-drkt px-3 py-1 rounded-md z-10 flex"
                    onClick={handleEditClick}
                >
                    <Pencil /> Edit
                </button>
            )}

            <div className="announcement-wrapper flex flex-col md:flex-row w-full min-h-[50vh]">
                {/* IMAGE + NOMINATIONS LEFT SIDE (unchanged) */}
                <div className="image-section hidden md:block md:w-[40%] lg:w-[30%] relative">
                    <div className="image-overlay"></div>
                    <img className="college-image" src={img1} alt="college" />
                </div>
                <div className="nominations-section w-full md:w-[55%] lg:w-[35%] px-4 md:px-0">
                    {/* nominations block unchanged */}
                    {editedContent.spc?.map((item, spcIndex) => (
                        <div key={spcIndex} className="mb-4">
                            {isEditing ? (
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            setHasChanges(true);
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
                                            setHasChanges(true);
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
                                                setHasChanges(true);
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
                        // normal view unchanged
                        <div
                            className="card-container"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                                {/* FRONT + BACK unchanged */}
                                <div className="card-front overflow-y-auto">
                                    <h2 className="card-title">Announcements</h2>
                                    <div className="announcements-content">
                                        {frontItems?.map((item, i) => (
                                            <div key={i} className="announcement-item flex justify-between items-center">
                                                <a
                                                    href={UrlParser(item?.pdf_path || item?.link)}
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
                                                    href={UrlParser(item?.pdf_path || item?.link)}
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
                        // EDIT MODE → with edit + delete
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
                                        onClick={() => window.open(UrlParser(item?.pdf_path || item?.link), "_blank")}
                                        className="px-2 py-1 text-blue-500 text-sm mr-1"
                                        title="Preview"
                                    >
                                        <Eye size={16}/>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewAnnouncement(item);
                                            setEditIndex(i);
                                        }}
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
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        id="pdfUpload"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setNewAnnouncement({
                                                    ...newAnnouncement,
                                                    pdf_path: URL.createObjectURL(e.target.files[0]),
                                                    link: ""
                                                });
                                            }
                                        }}
                                        disabled={!!newAnnouncement.link}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("pdfUpload").click()}
                                        className={`px-4 py-2 rounded ${
                                            newAnnouncement.link
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
                                        }`}
                                        disabled={!!newAnnouncement.link}
                                    >
                                        {!newAnnouncement.pdf_path ? "Upload PDF" : "Replace PDF"}
                                    </button>
                                    {newAnnouncement.pdf_path && (
                                        <a href={newAnnouncement.pdf_path} target="_blank" className="cursor-pointer">
                                            <Eye size={20} />
                                        </a>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={newAnnouncement.link}
                                    onChange={(e) =>
                                        setNewAnnouncement({ ...newAnnouncement, link: e.target.value, pdf_path: "" })
                                    }
                                    placeholder="Link URL (optional)"
                                    className="w-1/2 p-2 border border-gray-300 rounded mb-2"
                                    disabled={!!newAnnouncement.pdf_path}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddOrUpdateAnnouncement}
                                    className="w-full py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded"
                                    disabled={
                                        !newAnnouncement.announcement_name ||
                                        (!newAnnouncement.pdf_path && !newAnnouncement.link)
                                    }
                                >
                                    {editIndex !== null ? "Update Announcement" : "Add Announcement"}
                                </button>
                                {editIndex !== null && (
                                    <button
                                        onClick={() => {
                                            setEditIndex(null);
                                            setNewAnnouncement({ announcement_name: "", pdf_path: "", link: "" });
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
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded-md"
                    >
                        Save
                    </button>
                </div>
            )}

            {!isEditing && hasChanges && (
                <div className="w-full flex justify-center gap-4 p-4 mt-4">
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                        Discard Changes
                    </button>
                    <button
                        onClick={handleRequest}
                        className="px-4 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt rounded-md"
                    >
                        Request
                    </button>
                </div>
            )}

            {/* DELETE MODAL + REQUEST MODAL remain unchanged */}
            {deletionIndex !== null && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[350px]">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">Are you sure you want to delete this announcement?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeletionIndex(null)} className="px-4 py-2 rounded bg-gray-400 text-white">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-500 text-white">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    <tr>
                                        <td className="py-1 text-blue-600">✎ Edited</td>
                                        <td className="py-1">Announcements</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmPopup(false)}
                                className="px-4 py-2 rounded bg-gray-400 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRequest}
                                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
                            >
                                Final Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements1;