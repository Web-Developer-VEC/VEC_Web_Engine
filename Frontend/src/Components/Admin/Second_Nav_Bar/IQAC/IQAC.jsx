import React, {useEffect, useState} from "react";
import "./IQAC.css";
import Banner from "../../Banner";
import axios from "axios";
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Edit, Trash2, Plus, Save, Send, ArrowDown, Upload, Replace, Pencil } from 'lucide-react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IqaMet from "./mom";
import IqaAud from "./acadamicaudit";
import IqaPra from "./bestpractice";
import IqaQar from "./agar";
import IqaMem from "./member";
import IqaGal from "./gallery";


const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    // Return empty string if path is not a string
    if (typeof path !== 'string') return '';
    
    // Handle cases where path might be empty or undefined
    if (!path) return '';
    
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const AdminIQAC = ({ toggle , theme }) => {
    const [selectedCategory, setSelectedCategory] = useState("OVERALL");
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
    function  IqaObj () {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="objectives-container">
                    <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About IQAC</h3>
                        <p className="objectives-text text-text dark:text-drkt">{iqacData?.about}</p>
                    </div>
                    <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">IQAC Objectives</h3>
                        <ul className="objectives-list">
                            {iqacData?.objectives?.map((objective, index) => (
                                <li key={index} className="objectives-item text-text dark:text-drkt">{objective}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            </>
        );
    };

    // Render Coordinator content
    function IqaCor () {
        const [isEditing, setIsEditing] = useState(false);
        const [editedData, setEditedData] = useState(iqacData || {});
        const [savedData, setSavedData] = useState(iqacData || {});
        const [uploadedFile, setUploadedFile] = useState(null);
        const [showRequestModal, setShowRequestModal] = useState(false);

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
            setIsEditing(false);
        };

        const handleRequestConfirm = () => {
            console.log("Final request submitted with changes:", { savedData, uploadedFile });
            toast.success("Request submitted successfully!");
            setShowRequestModal(false);
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
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 bg-secd text-text px-3 py-1 rounded hover:bg-[#800000] hover:text-drkt"
                >
                    Edit
                </button>
                )}

                {/* Image */}
                <div className="admin-coordinator-image-container">
                {isEditing ? (
                    <>
                    <input type="file" accept="image/*" onChange={handleFileUpload} />
                    {uploadedFile ? (
                        <img
                            src={uploadedFile.fileURL}
                            alt="preview"
                            className="coordinator-image mt-2"
                        />
                    ) : (
                        <img
                            src={UrlParser(savedData.image_path) || "/placeholder.svg"}
                            alt={savedData.name}
                            className="coordinator-image"
                        />
                    )}
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
                    <input
                        type="text"
                        name="name"
                        value={editedData.name || ""}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                        type="text"
                        name="designation"
                        value={editedData.designation || ""}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                        type="text"
                        name="role"
                        value={editedData.role || ""}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                        type="email"
                        name="email"
                        value={editedData.email || ""}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                        type="text"
                        name="phone"
                        value={editedData.phone || ""}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full mb-2"
                    />

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        className="mt-3 px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
                    >
                        Save
                    </button>
                    </>
                ) : (
                    <>
                    <h3 className="coordinator-name text-text dark:text-drkt">{savedData.name}</h3>
                    <p className="coordinator-designation text-brwn dark:text-drka">
                        {savedData.designation}
                    </p>
                    <p className="coordinator-role text-brwn dark:text-drka">{savedData.role}</p>
                    <p className="coordinator-email">
                        Email: <span className="text-drka">{savedData.email}</span>
                    </p>
                    <p className="coordinator-phone">Phone: {savedData.phone}</p>
                    </>
                )}
                </div>
            </div>

            {/* Request button (only if changes done) */}
            {!isEditing && (uploadedFile || savedData !== iqacData) && (
                <div className="flex justify-center mt-4">
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="px-4 py-2 bg-secd text-text rounded hover:bg-[#800000] hover:text-drkt"
                >
                    Request
                </button>
                </div>
            )}

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
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="py-1 text-blue-600">✎ Edited</td>
                            <td className="py-1">IQAC Coordinator</td>
                            <td className="py-1 text-[12px] flex flex-col items-center">
                            {iqacData?.name} <ArrowDown /> {savedData.name} <br />
                            {uploadedFile && (
                                <>
                                <span>Image Changed</span>
                                <ArrowDown />
                                <a
                                    href={uploadedFile.fileURL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    {uploadedFile.file.name}
                                </a>
                                </>
                            )}
                            </td>
                        </tr>
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
            </div>
        );
    };

    // Component for sections with single PDF and replace functionality like Strategic Plan, Institutional Distinctiveness, Code of Ethics, ISO Certificate
    function IqaOne({title}) {
        const [uploadedFile, setUploadedFile] = useState(null);
        const [showRequestModal, setShowRequestModal] = useState(false);
        const [isEditing, setIsEditing] = useState(false);

        const handleFileUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileURL = URL.createObjectURL(file)
                setUploadedFile({file, fileURL});
            }
        };

        const handleRequestConfirm = () => {
            // later you can merge API request here
            console.log("Request confirmed for:", uploadedFile);
            toast.success("Request submitted successfully!");
            setShowRequestModal(false);
        };

        const oldpath = Array.isArray(iqacData) && iqacData[0]?.paths?.split('/');
        
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
                                    className="bg-yellow-400 text-brown px-4 py-2 rounded-[10px] cursor-pointer hover:bg-[#800000] hover:text-white"
                                >
                                    Request
                                </button>
                                </>
                            )}
                        </div>
                    )}

                    <embed
                        className="embed"
                        src={uploadedFile?.fileURL ? uploadedFile.fileURL + "#toolbar=0" : UrlParser(Array.isArray(iqacData) && iqacData[0]?.paths) + "#toolbar=0"}
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
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="py-1 text-blue-600">✎ Edited</td>
                                        <td className="py-1">IQAC {title}</td>
                                        <td className="py-1 text-[12px] flex flex-col items-center">{oldpath[4]} <ArrowDown/> <a href={uploadedFile?.fileURL} className="cursor-pointer" target="_blank">{uploadedFile?.file.name}</a></td>
                                    </tr>
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