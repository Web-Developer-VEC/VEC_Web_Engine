import React, { useState, useEffect } from "react";
import "./NCCAMenbers.css";
import LoadComp from "../../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTimes, faPaperPlane, faUndo,faEye } from "@fortawesome/free-solid-svg-icons";
import { Trash2, PlusCircle, SquarePen} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUpload } from "react-icons/fa6";
import useBlockNavigation from "../../useBlockNavigation";

function NCCAMembers({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  // --- State ---
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [nccData, setNccData] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Initialize nccData when `data` prop changes
  useEffect(() => {
    if (Array.isArray(data)) {
      setNccData(JSON.parse(JSON.stringify(data))); // deep copy
    }
  }, [data]);
  
useBlockNavigation(isEditing);
  const coor = nccData?.[0]?.members?.[0] || null;
  const stud = Array.isArray(nccData?.[1]?.members) ? nccData[1].members : [];

  // --- Handlers ---
  const handleEdit = () => {
    setBackupData(JSON.parse(JSON.stringify(nccData)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (backupData) setNccData(backupData);
    setChanges([]);
    setIsEditing(false);
    toast.info("Changes discarded!");
  };

  const handleAddStudent = () => {
    const updated = JSON.parse(JSON.stringify(nccData));
    if (!updated[1]?.members) updated[1] = { members: [] };

    const newStudent = {
      name: "",
      regiment_no: "",
      year: "",
      department: "",
      rank: "",
      image_path: "",
    };

    updated[1].members.push(newStudent);

    setNccData(updated);
    setChanges((prev) => [
      ...prev,
      { action: "added", target: `Student ${updated[1].members.length}`, index: updated[1].members.length - 1, newStudent },
    ]);
  };

  const handleChange = (type, index, field, value) => {
    const updated = JSON.parse(JSON.stringify(nccData));

    if (type === "faculty" && updated?.[0]?.members?.[0]) {
      updated[0].members[0][field] = value;
    } else if (type === "student" && updated?.[1]?.members?.[index]) {
      updated[1].members[index][field] = value;

      // Update "added" changes if student is new
      const isNewStudent = Object.values(updated[1].members[index]).some((val) => val === "");
      if (isNewStudent) {
        setChanges((prev) =>
          prev.map((change) => {
            if (change.action === "added" && change.index === index) {
              return { ...change, newStudent: { ...change.newStudent, [field]: value } };
            }
            return change;
          })
        );
        setNccData(updated);
        return;
      }
    }

    setNccData(updated);

    if (!(type === "student" && Object.values(updated[1].members[index]).some((val) => val === ""))) {
      setChanges((prev) => {
        const target = type === "faculty" ? "Faculty" : `Student ${index + 1}`;
        const existingIndex = prev.findIndex((c) => c.target === target && c.field === field && c.action === "edited");
        if (existingIndex !== -1) {
          const updatedChanges = [...prev];
          updatedChanges[existingIndex] = { ...updatedChanges[existingIndex], newValue: value };
          return updatedChanges;
        } else {
          return [
            ...prev,
            {
              action: "edited",
              target,
              field,
              oldValue: type === "faculty" ? backupData?.[0]?.members?.[0]?.[field] || "" : backupData?.[1]?.members?.[index]?.[field] || "",
              newValue: value,
            },
          ];
        }
      });
    }
  };

  const handleUndo = (changeIndex) => {
    const change = changes[changeIndex];
    const updated = JSON.parse(JSON.stringify(nccData));

    if (change.action === "edited") {
      if (change.target === "Faculty") updated[0].members[0][change.field] = change.oldValue;
      else if (change.target.startsWith("Student")) {
        const index = parseInt(change.target.split(" ")[1], 10) - 1;
        updated[1].members[index][change.field] = change.oldValue;
      }
    } else if (change.action === "added") {
      updated[1].members.splice(change.index, 1);
    } else if (change.action === "deleted") {
      updated[1].members.splice(change.index, 0, change.removed);
    }

    setNccData(updated);
    setChanges(changes.filter((_, index) => index !== changeIndex));
  };

  const handleDeleteStudent = (index) => {
    const updated = JSON.parse(JSON.stringify(nccData));
    const removed = updated[1].members.splice(index, 1)[0];

    setNccData(updated);
    setChanges((prev) => [...prev, { action: "deleted", target: `Student ${index + 1}`, removed, index }]);
  };

  const handleRequest = () => {
    console.log("Changes to be submitted:", changes);
    toast.success("Request submitted successfully!");
    setChanges([]);
    setShowPopup(false);
    setIsEditing(false);

  };

  // --- Render ---
  if (!coor && stud.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }
// A single function that handles the entire process: validate, then proceed.
const handlePreviewClick = () => {
  let hasEmptyFields = false;

  // 1. Validation Check: If any required faculty fields are empty, set the flag.
  if (!coor?.name?.trim() || !coor?.designation?.trim() || !coor?.image_path) {
    hasEmptyFields = true;
  }

  // 2. Validation Check: Check all student fields as well.
  if (stud && stud.length > 0) {
    const studentsWithEmptyFields = stud.some(student =>
      !student.name?.trim() ||
      !student.regiment_no?.trim() ||
      !student.year?.trim() ||
      !student.department?.trim() ||
      !student.rank?.trim()
    );
    if (studentsWithEmptyFields) {
      hasEmptyFields = true;
    }
  }

  // 3. Conditional Logic: If validation fails, stop here.
  if (hasEmptyFields) {
    // Show a pop-up error message to the user
    toast.error(" Please fill all required fields before previewing.");
    return; // Exit the function immediately
  }

  // 4. Success Case: Only if all fields are valid, proceed to the next step.
  setIsPreviewing(true);
};

// The button's onClick handler now calls the single validation function.


  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="yrc-coordinators-container relative">
        {isEditing && !isPreviewing && (
          <div className="absolute bottom-4 right-4">

            <button
    className={`nss-btn nss-btn-request flex items-center gap-1 ${changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
    onClick={handlePreviewClick} // Call the new validation function
    disabled={changes.length === 0}
>
    <FontAwesomeIcon icon={faEye} /> View Changes
</button>
          </div>
        )}

        {/* Inline Preview */}
        {isPreviewing ? 
        (
<>          <div className="preview-mode mt-6">
<div className="flex flex-col items-center justify-center">
  <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt capitalize mb-1">
    FACULTY COORDINATOR (Preview)
  </h2>
  <div className="yrc-member-card-1 dark:bg-text">
    <img
      src={UrlParser(coor?.image_path)}
      alt={coor?.name}
      className="yrc-member-image1 mb-2"
    />
    <div className="yrc-member-info1 text-center">
      <h3>{nccData?.[0]?.members?.[0]?.name}</h3>
      <p className="yrc-title text-brwn dark:text-drka">
        {nccData?.[0]?.members?.[0]?.designation}
      </p>
    </div>
  </div>
</div>

           

            <h2 className="text-lg md:text-2xl font-bold text-center text-brwn dark:text-drkt capitalize mb-1">
              STUDENT COORDINATORS (Preview)
            </h2>
            <div className="yrc-members-grid grid grid-cols-4 gap-6 auto-rows-auto justify-items-center">
              {stud?.map((member, index) => (
                <div className="student-card dark:bg-text" key={index}>
                  <h5 className="text-text dark:text-drkt font-sm mt-4">{member?.name}</h5>
                  <p className="text-brwn dark:text-drka">{member?.regiment_no}</p>
                  <p className="text-brwn dark:text-drka">{member?.year}</p>
                  <p className="text-brwn dark:text-drka">{member?.rank} - {member?.department}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsPreviewing(false)}>
                Back to Edit
              </button>
              <button className="nss-btn nss-btn-request flex items-center gap-1" onClick={() => setShowPopup(true)}>
                <FontAwesomeIcon icon={faPaperPlane} /> Request
              </button>
            </div>
          </div></>
        ):
        (
        <>  
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
           <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt capitalize mb-1">
          FACULTY COORDINATOR
        </h2>
        <div className="yrc-member-card-1 dark:bg-text">
          {isEditing ? (
            <div className="relative">
              <img src={UrlParser(coor?.image_path)} alt={coor?.name} className="yrc-member-image1" />
              <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow-md">
                <FaUpload size={16} />
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleChange("faculty", 0, "image_path", URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <img src={UrlParser(coor?.image_path)} alt={coor?.name} className="yrc-member-image1" />
          )}
          <div className="yrc-member-info1">
            {isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <h3>{coor?.name}</h3>
                <p className="yrc-title text-brwn dark:text-drka">{coor?.designation}</p>
              </>
            )}
          </div>
        </div>

        {/* Student Coordinators */}
        <h2 className="text-lg md:text-2xl font-bold text-center text-brwn dark:text-drkt capitalize mb-1">
          STUDENT COORDINATORS
        </h2>
        <div className="yrc-members-grid grid grid-cols-4 gap-6 auto-rows-auto justify-items-center">
          {stud?.map((member, index) => (
            <div className="student-card dark:bg-text" key={index}>
              {isEditing ? (
                <div className="ncc-student-edit-form">
                  <input
                    className="ncc-input"
                    value={member?.name || ""}
                    onChange={(e) => handleChange("student", index, "name", e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    className="ncc-input"
                    value={member?.regiment_no || ""}
                    onChange={(e) => handleChange("student", index, "regiment_no", e.target.value)}
                    placeholder="Regiment No"
                  />
                  <input
                    className="ncc-input"
                    value={member?.year || ""}
                    onChange={(e) => handleChange("student", index, "year", e.target.value)}
                    placeholder="Year"
                  />
                  <input
                    className="ncc-input"
                    value={member?.department || ""}
                    onChange={(e) => handleChange("student", index, "department", e.target.value)}
                    placeholder="Department"
                  />
                  <input
                    className="ncc-input"
                    value={member?.rank || ""}
                    onChange={(e) => handleChange("student", index, "rank", e.target.value)}
                    placeholder="Rank"
                  />
                  <button onClick={() => handleDeleteStudent(index)} className="ncc-delete-btn">
                    <Trash2 className="mr-1" size={16} /> Delete
                  </button>
                </div>
              ) : (
                <>
                  <h5 className="text-text dark:text-drkt font-sm mt-4">{member?.name}</h5>
                  <p className="text-brwn dark:text-drka">{member?.regiment_no}</p>
                  <p className="text-brwn dark:text-drka">{member?.year}</p>
                  <p className="text-brwn dark:text-drka">
                    {member?.rank} - {member?.department}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
        <>        {isEditing && (
          <div className="mt-4 flex justify-center">
            <button onClick={handleAddStudent} className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2">
              <PlusCircle size={18} /> Add New Student
            </button>
          </div>
        )}
</>
</>

)}

        {/* Popup for final changes */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[600px]">
              <h3 className="text-lg font-semibold mb-4">Final Request for the Changes</h3>
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
                      let IconComponent = null;
                      if (ch.action === "added") IconComponent = PlusCircle;
                      else if (ch.action === "deleted") IconComponent = Trash2;
                      else if (ch.action === "edited") IconComponent = SquarePen;

                      return (
                        <tr key={i} className="border-t">
                          <td className="py-2 flex items-center gap-1">
                            {IconComponent && <IconComponent className="w-5 h-5" />}
                            <span className="capitalize">{ch.action}</span>
                          </td>
                          <td>
                            {ch.action === "added" && ch.newStudent ? ch.newStudent.name || "New Student" : ch.action === "deleted" ? ch.removed.name : ch.target}
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
              <p className="text-red-600 mb-4">
                Note: Your changes will stay pending until approved by the superior admin.
              </p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>

                 <button
                                className={`nss-btn nss-btn-request flex items-center gap-1 ${changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={handleRequest}
                                disabled={changes.length === 0}
                              >
                                <FontAwesomeIcon icon={faPaperPlane} /> Request
                              </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NCCAMembers;
