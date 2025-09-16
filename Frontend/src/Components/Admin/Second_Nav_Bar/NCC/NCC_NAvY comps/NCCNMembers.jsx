import React, { useState, useEffect } from "react";
import "./NCCNMembers.css";
import LoadComp from "../../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTimes, faPaperPlane, faUndo, faEye } from "@fortawesome/free-solid-svg-icons";
import { Trash2, PlusCircle, SquarePen } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUpload } from "react-icons/fa6";
import useBlockNavigation from "../../useBlockNavigation";

const NCCNMembers = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  // --- States ---
  const [nccData, setNccData] = useState([]);
  const [backupData, setBackupData] = useState(null);
  const [changes, setChanges] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Block navigation if editing
  useBlockNavigation(isEditing);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data)) {
      setNccData(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  const coor = nccData?.[0]?.members?.[0] || null;
  const stud = Array.isArray(nccData?.[1]?.members) ? nccData[1].members : [];

  // --- Handlers ---
  const handleEdit = () => {
    setBackupData(JSON.parse(JSON.stringify(nccData)));
    setIsEditing(true);
    setIsPreviewing(false);
  };

  const handleCancel = () => {
    if (backupData) setNccData(backupData);
    setChanges([]);
    setIsEditing(false);
    setIsPreviewing(false);
    toast.info("Changes discarded!");
  };
// Function to validate all required fields before preview
const validateNCCData = () => {
  if (!nccData || nccData.length === 0) return false;

  let valid = true;

  // Validate faculty coordinator
  const faculty = nccData?.[0]?.members?.[0];
  if (!faculty?.name?.trim() || !faculty?.designation?.trim() || !faculty?.image_path?.trim()) {
    valid = false;
  }

  // Validate student coordinators
  const students = nccData?.[1]?.members || [];
  students.forEach((stu) => {
    if (
      !stu.name?.trim() ||
      !stu.regiment_no?.trim() ||
      !stu.rank?.trim() ||
      !stu.universityno?.toString()?.trim() ||
      !stu.department?.trim()
    ) {
      valid = false;
    }
  });

  return valid;
};

  const handleChange = (type, index, field, value) => {
    const updated = JSON.parse(JSON.stringify(nccData));

    if (type === "faculty" && updated?.[0]?.members?.[0]) {
      updated[0].members[0][field] = value;
    } else if (type === "student" && updated?.[1]?.members?.[index]) {
      updated[1].members[index][field] = value;
      
      // Check if this is a new student (has empty fields)
      const isEmptyStudent = Object.values(updated[1].members[index]).some(val => val === "");
      
      // If it's a new student, update the "added" change instead of creating an "edited" change
      if (isEmptyStudent) {
        setChanges((prev) =>
          prev.map((change) => {
            if (change.action === "added" && change.index === index) {
              return { 
                ...change, 
                newStudent: { ...change.newStudent, [field]: value } 
              };
            }
            return change;
          })
        );
        setNccData(updated);
        return;
      }
    }

    setNccData(updated);

    const target = type === "faculty" ? "Faculty" : `Student ${index + 1}`;
    const oldValue =
      type === "faculty"
        ? backupData?.[0]?.members?.[0]?.[field] || ""
        : backupData?.[1]?.members?.[index]?.[field] || "";

    const existingIndex = changes.findIndex(
      (c) => c.target === target && c.field === field && c.action === "edited"
    );

    if (existingIndex !== -1) {
      const updatedChanges = [...changes];
      updatedChanges[existingIndex] = { ...updatedChanges[existingIndex], newValue: value };
      setChanges(updatedChanges);
    } else {
      setChanges((prev) => [...prev, { action: "edited", target, field, oldValue, newValue: value }]);
    }
  };

  const handleImageChange = (e, type, index) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      if (type === "faculty") {
        handleChange("faculty", index, "image_path", imageUrl);
      }
      // You could add student image handling here if needed
    }
  };

  const handleAddStudent = () => {
    const updated = JSON.parse(JSON.stringify(nccData));
    if (!updated[1]?.members) updated[1] = { members: [] };

    const newStudent = { 
      name: "", 
      regiment_no: "", 
      rank: "", 
      universityno: "", 
      department: "",
      image_path: "" 
    };
    updated[1].members.push(newStudent);

    setNccData(updated);
    setChanges((prev) => [
      ...prev,
      { 
        action: "added", 
        target: `Student ${updated[1].members.length}`, 
        index: updated[1].members.length - 1, 
        newStudent: {...newStudent} 
      },
    ]);
  };

  const handleDeleteStudent = (index) => {
    const updated = JSON.parse(JSON.stringify(nccData));
    const removed = updated[1].members.splice(index, 1)[0];

    setNccData(updated);
    setChanges((prev) => [...prev, { action: "deleted", target: `Student ${index + 1}`, removed, index }]);
  };

  const handleUndo = (changeIndex) => {
    const change = changes[changeIndex];
    const updated = JSON.parse(JSON.stringify(nccData));

    if (change.action === "edited") {
      if (change.target === "Faculty") {
        updated[0].members[0][change.field] = change.oldValue;
      } else if (change.target.startsWith("Student")) {
        const idx = parseInt(change.target.split(" ")[1], 10) - 1;
        updated[1].members[idx][change.field] = change.oldValue;
      }
    } else if (change.action === "added") {
      updated[1].members.splice(change.index, 1);
    } else if (change.action === "deleted") {
      updated[1].members.splice(change.index, 0, change.removed);
    }

    setNccData(updated);
    setChanges(changes.filter((_, i) => i !== changeIndex));
  };

  const handleRequest = () => {
    console.log("Submitted Changes:", changes);
    toast.success("Request submitted successfully!");
    setChanges([]);
    setShowPopup(false);
    setIsEditing(false);
    setIsPreviewing(false);
  };

  // --- Render ---
  if (!coor && stud.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="yrc-coordinators-container relative">
        {/* Edit/Cancel Buttons */}
        {!isPreviewing && (
          <div className="absolute top-4 right-4 pb-4">
            {!isEditing ? (
              <button className="nss-btn nss-btn-edit" onClick={handleEdit}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
            ) : (
              <button className="nss-btn nss-btn-cancel" onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            )}
          </div>
        )}

        {/* Preview Mode */}
        {isPreviewing ? 
        (
          <div className="preview-mode">
                   <div className="yrc-coordinators-container">
      <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt capitalize mb-4">
        FACULTY COORDINATOR 
        <div className="yrc-underline2"></div>
      </h2>
      
      <div className="yrc-member-card-1 dark:bg-text">
        <img
          src={UrlParser(coor?.image_path)}
          alt={coor?.name}
          className="yrc-member-image1"
          />

        <div className="yrc-member-info1">
          {/* <span className="yrc-platoon">Programme Officer</span> */}
          <h3>{coor?.name}</h3>
          <p className="yrc-title text-brwn dark:text-drka">{coor?.designation}</p>
        </div>
      </div>

        <h2 className="text-lg md:text-2xl font-bold text-center text-brwn dark:text-drkt capitalize mb-4">
            STUDENT COORDINATORS
        </h2>
      <div className="yrc-members-grid grid grid-cols-4 gap-6 auto-rows-auto justify-items-center justify-content-center align-items-center">
     {stud?.map((item,i) => (
        <div key={i} className="student-card dark:bg-text">
          {/* <img src={UrlParser(student.image)} className="w-[150px] h-[200px] m-auto" alt={student.name} /> */}
          <div className="ncc-n-stu-detail p-2 text-left">
            <h5 className="text-center">{item?.name}</h5>
            <p className="pl-4 text-brwn dark:text-drka">regiment no: {item?.regiment_no}</p>
            <p className="pl-4 text-brwn dark:text-drka">Rank : {item?.rank}</p>
            <p className="pl-4 text-brwn dark:text-drka">University No : {item?.universityno}</p>
            <p className="pl-4 text-brwn dark:text-drka">Department: {item?.department}</p>
          </div>
        </div>
      ))}
    </div>

    </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setIsPreviewing(false)}
              >
                Back to Edit
              </button>
              <button
                className="nss-btn nss-btn-request flex items-center gap-1"
                onClick={() => setShowPopup(true)}
              >
                <FontAwesomeIcon icon={faPaperPlane} /> Request
              </button>
            </div>
          </div>
        ) : (
          /* Normal/Edit View Mode */
          <>
            {/* Faculty Coordinator */}
            <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt capitalize mb-4">
              FACULTY COORDINATOR
            </h2>

            <div className="yrc-member-card-1 dark:bg-text">
              {isEditing ? 
              (
<>        <div className="relative">
                       <img 
                    src={UrlParser(nccData?.[0]?.members?.[0]?.image_path)} 
                    alt={nccData?.[0]?.members?.[0]?.name} 
                    className="yrc-member-image1" 
                  />
                      <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow-md">
                        <FaUpload size={16} />
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "faculty", 0)}
                        />
                      </label>
                      
      </div>              
<div>
                  <div className="yrc-member-info1">
                    <input
                      className="border p-1 w-full mb-2 ncc-input"
                      value={nccData?.[0]?.members?.[0]?.name || ""}
                      onChange={(e) => handleChange("faculty", 0, "name", e.target.value)}
                      placeholder="Name"
                    />
                    <input
                      className="border p-1 w-full ncc-input"
                      value={nccData?.[0]?.members?.[0]?.designation || ""}
                      onChange={(e) => handleChange("faculty", 0, "designation", e.target.value)}
                      placeholder="Designation"
                    />
                  </div>
                </div></>

              ) : (
                <>
                  <img
                    src={UrlParser(coor?.image_path)}
                    alt={coor?.name}
                    className="yrc-member-image1"
                  />
                  <div className="yrc-member-info1">
                    <h3>{coor?.name}</h3>
                    <p className="yrc-title text-brwn dark:text-drka">{coor?.designation}</p>
                  </div>
                </>
              )}
            </div>

            {/* Student Coordinators */}
            <h2 className="text-lg md:text-2xl font-bold text-center text-brwn dark:text-drkt capitalize mb-4">
              STUDENT COORDINATORS
            </h2>

            <div className="yrc-members-grid grid grid-cols-4 gap-6 auto-rows-auto justify-items-center">
              {nccData?.[1]?.members?.map((item, index) => (
                <div key={index} className="student-card dark:bg-text">
                  {isEditing ? (
                    <div className="ncc-student-edit-form">
                      <input
                        className="ncc-input"
                        value={item?.name || ""}
                        onChange={(e) => handleChange("student", index, "name", e.target.value)}
                        placeholder="Name"
                      />
                      <input
                        className="ncc-input"
                        value={item?.regiment_no || ""}
                        onChange={(e) => handleChange("student", index, "regiment_no", e.target.value)}
                        placeholder="Regiment No"
                      />
                      <input
                        className="ncc-input"
                        value={item?.rank || ""}
                        onChange={(e) => handleChange("student", index, "rank", e.target.value)}
                        placeholder="Rank"
                      />
                      <input type="number"
                        className="ncc-input"
                        value={item?.universityno || ""}
                        onChange={(e) => handleChange("student", index, "universityno", e.target.value)}
                        placeholder="University No"
                      />
                      <input
                        className="ncc-input"
                        value={item?.department || ""}
                        onChange={(e) => handleChange("student", index, "department", e.target.value)}
                        placeholder="Department"
                      />
                      <button onClick={() => handleDeleteStudent(index)} className="ncc-delete-btn">
                        <Trash2 className="mr-1" size={16} /> Delete
                      </button>
                    </div>
                  ) : (
                    <div className="ncc-stu-detail p-2 text-left">
                      <h5 className="text-center">{item?.name}</h5>
                      <p className="pl-4 text-brwn dark:text-drka">Regiment No: {item?.regiment_no}</p>
                      <p className="pl-4 text-brwn dark:text-drka">Rank: {item?.rank}</p>
                      <p className="pl-4 text-brwn dark:text-drka">University No: {item?.universityno}</p>
                      <p className="pl-4 text-brwn dark:text-drka">Department: {item?.department}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add new student */}
            {isEditing && (
              <div className="mt-4 flex justify-center">
                <button onClick={handleAddStudent} className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2">
                  <PlusCircle size={18} /> Add New Student
                </button>
              </div>
            )}

            {/* Preview button */}
{isEditing && (
  <div className="absolute bottom-4 right-4">
            <button
              className={`nss-btn nss-btn-request flex items-center gap-1 ${
                changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              // onClick={() => changes.length > 0 && setIsPreviewing(true)}
              onClick={() => {
    if (validateNCCData()) {
      setIsPreviewing(true);
    } else {
      toast.error("Please fill all required fields before previewing.");
    }
  }}
              disabled={changes.length === 0}
            >
              <FontAwesomeIcon icon={faEye} /> View Changes
            </button>

  </div>
)}


          </>
        )}

        {/* Request Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[600px]">
              <h3 className="text-lg font-semibold mb-4">Final Request for Changes</h3>
              <div className="max-h-64 overflow-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Target</th>
                      <th className="pb-2">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((ch, i) => {
                      let Icon = null;
                      if (ch.action === "added") Icon = PlusCircle;
                      else if (ch.action === "deleted") Icon = Trash2;
                      else if (ch.action === "edited") Icon = SquarePen;

                      return (
                        <tr key={i} className="border-t">
                          <td className="py-2 flex items-center gap-1">
                            {Icon && <Icon className="w-5 h-5" />}
                            <span className="capitalize">{ch.action}</span>
                          </td>
                          <td>
                            {ch.action === "added" && ch.newStudent
                              ? ch.newStudent.name || "New Student"
                              : ch.action === "deleted"
                              ? ch.removed.name
                              : ch.target}
                          </td>
                          <td>
                            <button
                              onClick={() => handleUndo(i)}
                              className="px-2 py-1 bg-yellow-400 rounded text-black flex items-center gap-1 text-sm"
                            >
                              <FontAwesomeIcon icon={faUndo} /> Undo
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-red-600 mb-4">Note: Your changes will stay pending until approved by the superior admin.</p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
                <button className="nss-btn nss-btn-request flex items-center gap-1" onClick={handleRequest} disabled={changes.length === 0}>
                  <FontAwesomeIcon icon={faPaperPlane} /> Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </>
    
  );
};

export default NCCNMembers;