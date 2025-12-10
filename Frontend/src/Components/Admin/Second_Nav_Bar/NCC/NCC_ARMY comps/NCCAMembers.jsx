import React, { useState, useEffect } from "react";
import "./NCCAMenbers.css";
import axios from "axios";
import LoadComp from "../../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle, XCircle, Edit2 } from "lucide-react";
import { FaPaperPlane, FaUpload, FaRegCircleLeft, FaEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

function NCCAMembers({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  if (!path) return "/placeholder.jpg"; // fallback

  if (
    path.startsWith("http") ||
    path.startsWith("blob") ||
    path.startsWith("data:")
  ) {
    return path; // absolute URL or blob/base64
  }

  return `${BASE_URL}${path}`; // relative path
};


  // State management
  const [coor, setCoor] = useState(null);
  const [stud, setStud] = useState([]);
  const [committedCoor, setCommittedCoor] = useState(null);
  const [committedStud, setCommittedStud] = useState([]);
  const [pendingCoor, setPendingCoor] = useState(null);
  const [pendingStud, setPendingStud] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewImgs, setPreviewImgs] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length >= 2) {
      const coordinator = data[0]?.members?.[0] || null;
      const students = Array.isArray(data[1]?.members) ? data[1].members : [];

      // Ensure each student has a stable string id
      const studentsWithIds = students.map((s, i) => ({
        ...s,
        id: s?.id !== undefined && s?.id !== null ? String(s.id) : `gen-${Date.now()}-${i}`
      }));

      setCommittedCoor(coordinator ? deepCopy(coordinator) : null);
      setCommittedStud(deepCopy(studentsWithIds));
      setCoor(coordinator ? deepCopy(coordinator) : null);
      setStud(deepCopy(studentsWithIds));
      
      setPendingCoor(null);
      setPendingStud([]);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setSelectedItems([]);
      setSelectAll(false);
      setPreviewImgs({});
    }
  }, [data]);

  const handleStartEdit = () => {
    const baseCoor = pendingCoor ? deepCopy(pendingCoor) : deepCopy(committedCoor);
    const baseStud = pendingStud.length > 0 ? deepCopy(pendingStud) : deepCopy(committedStud);

    setCoor(baseCoor);
    setStud(baseStud);
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(false);
    setSelectedItems([]);
    setSelectAll(false);
  };

  const handleChangeCoor = (key, value) => {
    if (!coor) return;
    const updated = { ...coor, [key]: value };
    setCoor(updated);
    setIsDirty(true);
  };

  const handleChangeStudent = (index, key, value) => {
    const updatedStud = stud.map((s, i) =>
      i === index ? { ...s, [key]: value } : s
    );
    setStud(updatedStud);
    setIsDirty(true);
  };

  const handleCoorPreviewChange = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImgs((prev) => ({ ...prev, coor: url }));
      handleChangeCoor("image_path", url);
    }
  };

  const handleStudentPreviewChange = (index, file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImgs((prev) => ({ ...prev, [index]: url }));
      handleChangeStudent(index, "image_path", url);
    }
  };

  const handleAddStudent = () => {
    const newStudent = { 
      id: String(Date.now()),
      name: "", 
      regiment_no: "", 
      year: "",
      rank: "",
      department: "",
      image_path: "",
      selected: false
    };
    setStud((prev) => [...prev, newStudent]);
    setIsDirty(true);
  };

  const handleItemSelect = (index) => {
    const updatedStud = stud.map((student, i) => 
      i === index ? { ...student, selected: !student.selected } : student
    );
    
    setStud(updatedStud);
    
    const selectedIndices = updatedStud
      .map((student, i) => student.selected ? i : -1)
      .filter(i => i !== -1);
    
    setSelectedItems(selectedIndices);
    setSelectAll(selectedIndices.length === updatedStud.length && updatedStud.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const updatedStud = stud.map(student => ({ ...student, selected: newSelectAll }));
    setStud(updatedStud);
    
    setSelectedItems(newSelectAll ? stud.map((_, i) => i) : []);
  };

  const confirmDelete = () => {
    const updated = stud.filter((_, i) => !selectedItems.includes(i));
    setStud(updated);
    setSelectedItems([]);
    setSelectAll(false);
    setShowDeleteModal(false);
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (pendingCoor || pendingStud.length > 0) {
      setCoor(deepCopy(pendingCoor || committedCoor));
      setStud(deepCopy(pendingStud.length > 0 ? pendingStud : committedStud));
      toast.info("Cancelled edits. Draft preserved!");
      setIsSaved(true);
    } else {
      setCoor(deepCopy(committedCoor));
      setStud(deepCopy(committedStud));
      toast.info("Cancelled. Reverted to original data!");
      setIsSaved(false);
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    setPreviewImgs({});
  };

  const handleSave = () => {
    // Validate fields
    let newErrors = {};
    
    if (!coor?.name?.trim()) {
      newErrors.coorName = "Required";
    }
    if (!coor?.designation?.trim()) {
      newErrors.coorDesignation = "Required";
    }
    if (!coor?.image_path) {
      newErrors.coorImage = "Coordinator image is required";
    }

    stud.forEach((student, index) => {
      if (!student?.name?.trim()) {
        newErrors[`studentName_${index}`] = "Required";
      }
      if (!student?.regiment_no?.trim()) {
        newErrors[`studentRegiment_${index}`] = "Required";
      }
      if (!student?.year?.trim()) {
        newErrors[`studentYear_${index}`] = "Required";
      }
      if (!student?.rank?.trim()) {
        newErrors[`studentRank_${index}`] = "Required";
      }
      if (!student?.department?.trim()) {
        newErrors[`studentDepartment_${index}`] = "Required";
      }
      // if (!student?.image_path) {
      //   newErrors[`studentImage_${index}`] = "Image required";
      // }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields before saving.");
      return;
    }

    setPendingCoor(deepCopy(coor));
    setPendingStud(deepCopy(stud));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    toast.success("Changes saved as draft!");
  };

  const handleDiscard = () => {
    setCoor(deepCopy(committedCoor));
    setStud(deepCopy(committedStud));
    setPendingCoor(null);
    setPendingStud([]);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    setPreviewImgs({});
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    if (!pendingCoor && pendingStud.length === 0) return;
    
    setCommittedCoor(deepCopy(pendingCoor || coor));
    setCommittedStud(deepCopy(pendingStud.length > 0 ? pendingStud : stud));
    setCoor(deepCopy(pendingCoor || coor));
    setStud(deepCopy(pendingStud.length > 0 ? pendingStud : stud));
    setPendingCoor(null);
    setPendingStud([]);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

  const revertChange = (itemId, action, isCoor = false) => {
    const idKey = String(itemId);

    if (isCoor) {
      setPendingCoor(deepCopy(committedCoor));
      setCoor(deepCopy(committedCoor));
    } else {
      if (action === "Deleted") {
        const committed = (committedStud || []).find(s => String(s.id) === idKey);
        if (committed) {
          setPendingStud(prev => {
            if (prev.some(s => String(s.id) === idKey)) return prev;
            return [...prev, deepCopy(committed)];
          });
          setStud(prev => {
            if (prev.some(s => String(s.id) === idKey)) return prev;
            return [...prev, deepCopy(committed)];
          });
        }
      } else if (action === "Added") {
        setPendingStud(prev => prev.filter(s => String(s.id) !== idKey));
        setStud(prev => prev.filter(s => String(s.id) !== idKey));
      } else if (action === "Edited") {
        const committed = (committedStud || []).find(s => String(s.id) === idKey);
        if (committed) {
          setPendingStud(prev => prev.map(s => String(s.id) === idKey ? deepCopy(committed) : s));
          setStud(prev => prev.map(s => String(s.id) === idKey ? deepCopy(committed) : s));
        }
      }
    }

    const remaining = getChanges();
    if (remaining.length === 0) {
      setPendingCoor(null);
      setPendingStud([]);
      setIsSaved(false);
    }
  };

  const normalize = (val) => (val ? val.toString().trim() : "");
  const normalizeImage = (path) => {
    if (!path) return "";
    return path.replace(/^https?:\/\/[^/]+/, "");
  };

  const toTitleCase = (str) =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());



  const getChanges = () => {
    const changes = [];
    const currentCoor = pendingCoor || coor;
    const currentStud = pendingStud.length > 0 ? pendingStud : stud;

    const makeKey = (stu) =>
      (stu && stu.id != null) ? String(stu.id) : `gen-${normalize(stu?.name)}-${normalize(stu?.regiment_no)}`;

    const committedMap = new Map((committedStud || []).map(s => [makeKey(s), s]));
    const currentMap = new Map((currentStud || []).map(s => [makeKey(s), s]));

    // Coordinator changes
    if (committedCoor && currentCoor) {
      const coorChanged =
        normalize(committedCoor.name) !== normalize(currentCoor.name) ||
        normalize(committedCoor.designation) !== normalize(currentCoor.designation) ||
        normalizeImage(committedCoor.image_path) !== normalizeImage(currentCoor.image_path);

      if (coorChanged) {
        changes.push({
          action: "Edited",
          section: "Faculty Coordinator",
          changes: `Coordinator: ${currentCoor.name || "Unnamed"}`,
          itemId: "coor",
          isCoor: true,
        });
      }
    } else if (!committedCoor && currentCoor) {
      changes.push({
        action: "Added",
        section: "Faculty Coordinator",
        changes: `Coordinator: ${currentCoor.name || "New Coordinator"}`,
        itemId: "coor",
        isCoor: true,
      });
    } else if (committedCoor && !currentCoor) {
      changes.push({
        action: "Deleted",
        section: "Faculty Coordinator",
        changes: `Coordinator: ${committedCoor.name || "Coordinator"}`,
        itemId: "coor",
        isCoor: true,
      });
    }

    // Student changes
    for (const [key, oldStudent] of committedMap.entries()) {
      if (!currentMap.has(key)) {
        changes.push({
          action: "Deleted",
          section: "Student Coordinators",
          changes: `Student: ${oldStudent?.name || "Unnamed Student"}`,
          itemId: String(oldStudent?.id ?? key),
          isCoor: false,
        });
      }
    }

    for (const [key, newStudent] of currentMap.entries()) {
      if (!committedMap.has(key)) {
        changes.push({
          action: "Added",
          section: "Student Coordinators",
          changes: `Student: ${newStudent?.name || "New Student"}`,
          itemId: String(newStudent?.id ?? key),
          isCoor: false,
        });
      } else {
        const oldStudent = committedMap.get(key);
        const studentChanged =
          normalize(oldStudent?.name) !== normalize(newStudent?.name) ||
          normalize(oldStudent?.regiment_no) !== normalize(newStudent?.regiment_no) ||
          normalize(oldStudent?.year) !== normalize(newStudent?.year) ||
          normalize(oldStudent?.rank) !== normalize(newStudent?.rank) ||
          normalize(oldStudent?.department) !== normalize(newStudent?.department) ||
          normalizeImage(oldStudent?.image_path) !== normalizeImage(newStudent?.image_path);

        if (studentChanged) {
          changes.push({
            action: "Edited",
            section: "Student Coordinators",
            changes: `Student: ${newStudent?.name || "Unnamed Student"}`,
            itemId: String(newStudent?.id ?? key),
            isCoor: false,
          });
        }
      }
    }

    return changes;
  };

  const changes = getChanges();

  if (!coor || !Array.isArray(stud)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className="relative flex items-center justify-center mb-4">
        <h2 className="text-3xl font-bold text-brwn dark:text-drkt">NCCA Coordinators</h2>
        
        {/* Edit button on right */}
        {!isEditing && (
          <div className="absolute right-0">
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={18} />
              Edit
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <>

          <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">
            FACULTY COORDINATOR
          </h2>
<div className="flex flex-col items-center justify-center">
  {/* Faculty Coordinator Section */}
          <div className="yrc-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 ">
            {/* Coordinator Image */}
            <div className="flex-shrink-0 relative">
              <img
                src={
                  previewImgs.coor
                    ? previewImgs.coor
                    : coor?.image_path
                    ? UrlParser(coor.image_path)
                    : "/placeholder-image.jpg"
                }
                alt={coor?.name || "Coordinator"}
                className="w-32 h-32 rounded border object-cover"
              />

              {isEditing && (
                <div className="flex flex-col items-center mt-2 gap-2">
<label className="cursor-pointer px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-sm">
      {coor?.image_path ? "Replace" : "Upload"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleCoorPreviewChange(e.target.files?.[0])}
      />
    </label>

                  
                </div>
              )}
            </div>

            {/* Coordinator Name + Designation */}
            <div className="text-center md:text-left w-full">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={coor?.name || ""}
                    onChange={(e) => handleChangeCoor("name", e.target.value.toUpperCase())}
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Coordinator Name"
                  />
                  <input
                    type="text"
                    value={coor?.designation || ""}
                    onChange={(e) => handleChangeCoor("designation",  toTitleCase(e.target.value))}
                    className="border p-1 w-full"
                    placeholder="Designation"
                  />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{coor?.name}</h3>
                  <p className="text-gray-600">{coor?.designation}</p>
                </>
              )}
            </div>
          </div>
</div>

          {/* Students Section */}
          <h2 className="text-xl md:text-2xl font-bold text-center mt-6 text-brwn dark:text-drkt">
            STUDENT COORDINATORS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stud.map((member, index) => (
              <div
                key={index}
                className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center relative"
              >
                {/* Checkbox at top-right corner */}
                {isEditing && (
                  <input
                    type="checkbox"
                    checked={member.selected || false}
                    onChange={() => handleItemSelect(index)}
                    className="absolute top-2 right-2 h-4 w-4 cursor-pointer"
                  />
                )}

                {/* Student Image */}
                {/* <div className="relative w-24 h-24 mb-3">
                  <img
                    src={
                      previewImgs[index]
                        ? previewImgs[index]
                        : member?.image_path
                        ? UrlParser(member.image_path)
                        : "/placeholder-image.jpg"
                    }
                    alt={member?.name || "Student"}
                    className="w-24 h-24 border rounded object-cover"
                  />

                  {previewImgs[index] && (
                    <button
                      onClick={() => window.open(previewImgs[index], "_blank")}
                      className="absolute top-1 right-1 bg-white p-1 rounded-full shadow text-green-600 hover:text-green-800"
                    >
                      <FaEye size={14} />
                    </button>
                  )}
                </div> */}

                {/* Upload Button */}
                {/* {isEditing && (
                  <div className="mb-3">
                    <label className="cursor-pointer flex items-center justify-center gap-2 text-blue-500">
                      <FaUpload size={16} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleStudentPreviewChange(index, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )} */}

                {/* Student Fields */}
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={member?.name || ""}
                      onChange={(e) => handleChangeStudent(index, "name", e.target.value.toUpperCase())}
                      className="border p-1 mb-2 w-full"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={member?.regiment_no || ""}
                      onChange={(e) => handleChangeStudent(index, "regiment_no", e.target.value.toUpperCase())}
                      className="border p-1 mb-2 w-full"
                      placeholder="Regiment No"
                    />
                    <input
                      type="text"
                      value={member?.year || ""}
                      onChange={(e) => handleChangeStudent(index, "year", e.target.value.toUpperCase())}
                      className="border p-1 mb-2 w-full"
                      placeholder="Year"
                    />
                    <input
                      type="text"
                      value={member?.rank || ""}
                      onChange={(e) => handleChangeStudent(index, "rank", e.target.value.toUpperCase())}
                      className="border p-1 mb-2 w-full"
                      placeholder="Rank"
                    />
                    <input
                      type="text"
                      value={member?.department || ""}
                      onChange={(e) => handleChangeStudent(index, "department", e.target.value.toUpperCase())}
                      className="border p-1 w-full"
                      placeholder="Department"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{member?.name}</h3>
                    <p className="text-sm text-brwn dark:text-drka">{member?.regiment_no}</p>
                    <p className="text-sm text-brwn dark:text-drka">{member?.year}</p>
                    <p className="text-sm text-brwn dark:text-drka">{member?.rank} - {member?.department}</p>
                  </>
                )}
              </div>
            ))}

            {/* Add Student Button */}
            {isEditing && (
              <div
                onClick={handleAddStudent}
                className="border-2 border-dashed border-gray-400 rounded-xl flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <PlusCircle size={40} className="text-gray-500 mb-2" />
                <span className="text-gray-500">Add Student</span>
              </div>
            )}
          </div>

          {/* Delete Selected Button */}
          {selectedItems.length > 0 && (
            <div className="flex justify-center my-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-prim rounded hover:bg-red-600"
              >
                <Trash2 size={18} /> Delete Selected ({selectedItems.length})
              </button>
            </div>
          )}

          {/* Cancel & Save Buttons */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
            >
              Cancel
            </button>
            
            {changes.length > 0 && isDirty && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                Save
              </button>
            )}
          </div>
        </>
      ) : (
        // View Mode - Normal Display
        <>
          {/* Faculty Coordinator */}
          <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">
            FACULTY COORDINATOR
          </h2>
<div className="flex justify-center">
  <div className="yrc-member-card-1 dark:bg-text">
    <img
      src={UrlParser(coor?.image_path)}
      alt={coor?.name}
      className="yrc-member-image1"
    />

    <div className="yrc-member-info1 text-center">
      {/* <span className="yrc-platoon">Programme Officer</span> */}
      <h3>{coor?.name}</h3>
      <p className="yrc-title text-brwn dark:text-drka">{coor?.designation}</p>
    </div>
  </div>
</div>

          {/* Students */}
          <h2 className="text-lg md:text-2xl font-bold text-center text-brwn dark:text-drkt mb-1">
            STUDENT COORDINATORS
          </h2>
          <div className="yrc-members-grid grid grid-cols-4 gap-6 auto-rows-auto justify-items-center justify-content-center align-items-center">
            {stud.map((member, index) => (
              <div className="student-card dark:bg-text" key={index}>
                <h5 className="text-text dark:text-drkt font-sm mt-4">{member?.name}</h5>
                <p className="text-brwn dark:text-drka">{member?.regiment_no}</p>
                <p className="text-brwn dark:text-drka">{member?.year}</p>
                <p className="text-brwn dark:text-drka">{member?.rank} - {member?.department}</p>
              </div>
            ))}
          </div>

          {/* Discard/Request buttons when saved */}
          {isSaved && (
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
                Discard Changes
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleRequest}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  <Send size={18} /> Request
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>
            {changes.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2">{ch.changes}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => revertChange(ch.itemId, ch.action, ch.isCoor)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Revert this change"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
                Cancel
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleFinalRequestConfirm}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
          <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedItems.length} selected student{selectedItems.length > 1 ? 's' : ''}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NCCAMembers;