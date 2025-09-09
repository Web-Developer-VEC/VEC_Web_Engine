import React, {useEffect, useState} from "react";
import "./IQAC.css";
import Banner from "../../Banner";
import axios from "axios";
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Edit, Trash2, Plus, Save, Send, ArrowDown, Upload, Replace } from 'lucide-react';
import IqaMet from "./mom";


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
        "Members": <IqaMem/>,
        "Minutes of Meetings": <IqaMet iqacData={iqacData}/>,
        "Academic and Administrative Audit": <IqaAud/>,
        "Gallery": <IqaGal/>,
        "Strategic Development Plan": <IqaOne title={"Strategic Development Plan"}/>,
        "Best Practices": <IqaPra/>,
        "Institutional Distinctiveness": <IqaOne title={"Institutional Distinctiveness"}/>,
        "Code of Ethics": <IqaOne title={"Code of Ethics"}/>,
        "AQAR": <IqaQar/>,
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

    // Create coordinator object
    const coordinator = iqacData ? {
        name: iqacData?.name,
        image: UrlParser(iqacData?.image_path),
        designation: iqacData?.designation,
        keyRole: iqacData?.role,
        email: iqacData?.email,
        phone: iqacData?.phone
    } : null;

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

    // Render Gallery content
    function IqaGal () {
    // Assuming iqacData.gallery is your array
    let galleryData;

    if (iqacData) {
        galleryData = iqacData || [];
    }

    // Extract all categories
    const categories = Array.isArray(galleryData) && galleryData?.map(item => item?.category);

    // Find the object matching the selectedCategory
    const selectedItem = Array.isArray(galleryData) && galleryData?.find(item => item?.category === selectedCategory);

    return (
        <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="mr-4">
                    <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>
        
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {Array.isArray(categories) && categories?.map((category) => (
                        <button
                            key={category}
                            className={`px-4 py-1 text-lg font-semibold rounded-lg transition-colors duration-300 ${
                            selectedCategory === category
                                ? "bg-accn text-white"
                                : "bg-secd dark:bg-drks"
                            }`}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                        ))}
                    </div>
        
                    <div className="columns-xs mb-12">
                        {Array.isArray(selectedItem?.paths) && selectedItem?.paths?.map((imagePath, index) => (
                        <img
                            key={imagePath}
                            src={UrlParser(imagePath)}
                            alt={`Gallery Image ${index + 1}`}
                            className={`size-0 block box-border m-2 animate-[fadBorn_1s_ease_forwards]`}
                            style={{ animationDelay: `${100 * index}ms` }}
                        />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
    };

    function IqaMem() {
        const parser = {
            chairperson: "Chairperson",
            deansanddepartmentheads: "Deans and Department Heads",
            seniorteachers: "Senior Teachers",
            memberfrommanagement: "Member from Management",
            localprofessionalsocietychapter: "Local Professional Society Chapter",
            studentmembers: "Student Members",
            aluminimembers: "Alumni Members",
            memberfromemployee: "Member from Employee",
            memberfromindustry: "Member from Industry",
            stakeholders: "Stakeholders",
        };

        return (
            <>
                {!iqacData ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <LoadComp />
                    </div>
                ) : (
                    <div className="mt-8 mb-4 px-4">
                        {Array.isArray(iqacData) && (
                            <>
                                {iqacData?.map((group, idx) => {
                                    const title = parser[group.category?.toLowerCase()] || group.category;
                                    return (
                                    <div key={idx} className="mb-10">
                                        {/* Group Title */}
                                        <h2 className="text-2xl font-semibold font-poppins mb-4 text-center text-accn dark:text-drkt">
                                            {title}
                                        </h2>
                    
                                        {/* Members */}
                                        <div className="flex flex-wrap gap-4">
                                        {group.members?.map((member, i) => {
                                            const isLast = i === group.members.length - 1;
                                            const isOdd = group.members.length % 2 !== 0;
                    
                                            return (
                                            <div
                                                key={i}
                                                className={`
                                                ${
                                                    group.members.length === 1
                                                    ? "basis-full max-w-xl mx-auto"
                                                    : isLast && isOdd
                                                    ? "md:basis-[48%] md:mx-auto"
                                                    : "md:basis-[48%]"
                                                } 
                                                py-2 px-4 rounded-xl border-l-4 border-secd dark:border-drks
                                                bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                                                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                                                transition-colors duration-300 ease-in basis=full w-full
                                                `}
                                            >
                                                <p className="text-xl font-poppins">{member.name}</p>
                                                {member.designation && (
                                                    <p className="text-sm text-accn dark:text-drka">
                                                        {member.designation}
                                                    </p>
                                                )}
                                                {member.role && (
                                                    <p className="text-sm text-accn dark:text-drka">
                                                        {member.role}
                                                    </p>
                                                )}
                                            </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                    );
                                })}
                            
                            </>
                        )}
                    </div>
                )}
            </>
        );
    }

    function IqaMets() {
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
                        <table className="w-[1000px] department-table">
                            <thead className="bg-gry">
                            <tr>
                                <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                                <th className="text-center px-4 py-2 text-text">Year</th>
                                <th className="text-center px-4 py-2 text-text">ODD /EVEN</th>
                                <th className="text-center px-4 py-2 text-text">Conducted On</th>
                                <th className="text-center px-4 py-2 text-text">Links</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Array.isArray(iqacData) &&
                                iqacData?.map((dept, deptIndex) => (
                                <tr key={deptIndex}>
                                    <td className="text-center w-2">{deptIndex + 1}</td>
                                    <td className="text-center">{dept?.year}</td>
                                    <td className="text-center">{dept?.type}</td>
                                    <td className="text-center">{dept?.conducted_on}</td>
                                    <td className="text-center">
                                        <a
                                            href={UrlParser(dept?.path) || "#"}
                                            target={dept?.path ? "_blank" : ""}
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                        View PDF
                                        </a>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </>
                )}
            </>
        );
    }


    function IqaAud() {
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
                    <table className="w-[1000px] department-table">
                        <thead className="bg-gry">
                        <tr>
                            <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                            <th className="text-center px-4 py-2 text-text">Departments</th>
                            <th className="text-center px-4 py-2 text-text">Reports</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(iqacData) &&
                            iqacData?.map((dept, deptIndex) => (
                            <tr key={deptIndex}>
                                <td className="text-center w-2">{deptIndex + 1}</td>
                                <td>{dept?.department_name}</td>
                                <td className="text-center">
                                <ul className="reportlist">
                                    {Array.isArray(dept?.path) && dept?.path?.map((rep, repIndex) => (
                                    <li key={repIndex}>
                                        <a
                                            href={UrlParser(rep) || "#"}
                                            target={rep ? "_blank" : ""}
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                        {dept?.year[repIndex]}
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
                </>
            )}
            </>
        );
    }

    function IqaOne({title}) {
        const [uploadedFile, setUploadedFile] = useState(null);
        const [showRequestModal, setShowRequestModal] = useState(false);

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
                <div className="nirf-pdf-container iqac-pdf-container">
                <h2 className="basis-full text-center text-[24px] text-brwn dark:text-drkt mb-4">
                    {title}
                </h2>

                {/* Replace PDF / Request Button */}
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
                        className="bg-yellow-400 text-brown px-4 py-2 rounded-[20px] cursor-pointer hover:bg-[#800000] hover:text-white"
                        >
                        Replace PDF
                        </label>
                    </>
                    ) : (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="bg-yellow-400 text-brown px-4 py-2 rounded-[20px] cursor-pointer hover:bg-[#800000] hover:text-white"
                    >
                        Request
                    </button>
                    )}
                </div>

                <embed
                    className="embed"
                    src={uploadedFile?.fileURL ? uploadedFile.fileURL + "#toolbar=0" : UrlParser(Array.isArray(iqacData) && iqacData[0]?.paths) + "#toolbar=0"}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                />


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
            )}
            </>
        );
    }

    function IqaPra() {
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
                    <table className="w-[800px] department-table">
                        <thead className="bg-gry">
                        <tr>
                            <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                            <th className="text-center px-4 py-2 text-text">Year</th>
                            <th className="text-center px-4 py-2 text-text">Best Practices</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(iqacData) &&
                            iqacData?.map((dept, deptIndex) => (
                            <tr key={deptIndex}>
                                <td className="text-center w-2">{deptIndex + 1}</td>
                                <td className="text-center">{dept?.year}</td>
                                <td>
                                <ul className="reportlist">
                                    {Array.isArray(dept?.title) && dept?.title?.map((title, repIndex) => (
                                    <li key={repIndex}>
                                        <a
                                            href={UrlParser(dept?.path) || "#"}
                                            target={dept?.path ? "_blank" : ""}
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
                </>
            )}
            </>
        );
    }

    function IqaQar() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <>
                <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
                    AQAR
                </h2>
                <div className="flex justify-center p-4 w-full">
                    <div className="overflow-x-auto border rounded-lg shadow-md">
                    <table className="w-[600px] department-table">
                        <thead className="bg-gry">
                        <tr>
                            <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                            <th className="text-center px-4 py-2 text-text">Year</th>
                            <th className="text-center px-4 py-2 text-text">Links</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(iqacData) &&
                            iqacData?.map((aqar, deptIndex) => (
                            <tr key={deptIndex}>
                                <td className="text-center w-2">{deptIndex + 1}</td>
                                <td className="text-center">{aqar?.year}</td>
                                <td className="text-center">
                                    <a
                                        href={UrlParser(aqar?.path) || "#"}
                                        target={aqar?.path ? "_blank" : ""}
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline cursor-pointer"
                                    >
                                    View PDF
                                    </a>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
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