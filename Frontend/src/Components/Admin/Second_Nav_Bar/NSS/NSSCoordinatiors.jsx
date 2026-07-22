// Components/Second_Nav_Bar/NSS/Coordinators.jsx
import React, { useState, useEffect, useRef } from "react";
import "./NSSCoordinators.css";
import LoadComp from "../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle, XCircle, Edit2 } from "lucide-react";
import { FaPaperPlane, FaUpload, FaRegCircleLeft, FaEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => {
      const copy = { ...item };
      if (item._file) copy._file = item._file; // preserve File
      return copy;
    });
  }

  const copy = { ...data };
  if (data._file) copy._file = data._file; // preserve File
  return copy;
};


const Coordinators = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const parseUrl = (path) => {
    if (!path) return "/placeholder.jpg"; // fallback
    if (typeof path !== "string") return "/placeholder.jpg";
    if (path.startsWith("http") || path.startsWith("blob") || path.startsWith("data:")) {
      return path; // absolute URL or blob/base64
    }
    return `${BASE_URL}${path}`; // relative path
  };

  const [faculty, setFaculty] = useState(null);
  const [students, setStudents] = useState([]);
  const [committedFaculty, setCommittedFaculty] = useState(null);
  const [committedStudents, setCommittedStudents] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewImgs, setPreviewImgs] = useState({});
  const [errors, setErrors] = useState({});

  const { sendRequest, loading } = useAdminRequest();

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length >= 2) {
      const fac = data[0]?.members?.[0] ?? null;
      const studsRaw = Array.isArray(data[1]?.members) ? data[1].members : [];

      const studs = studsRaw.map((s, i) => ({
        ...s,
        id: s?.id !== undefined && s?.id !== null ? String(s.id) : `gen-${Date.now()}-${i}`,
        selected: false,
      }));

      setCommittedFaculty(fac ? deepCopy(fac) : null);
      setCommittedStudents(deepCopy(studs));
      setFaculty(fac ? deepCopy(fac) : null);
      setStudents(deepCopy(studs));
      setPendingFaculty(null);
      setPendingStudents([]);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setSelectedItems([]);
      setSelectAll(false);
      setPreviewImg(null);
      setPreviewImgs({});
    }
  }, [data]);

  const handleStartEdit = () => {
    const baseFaculty = pendingFaculty ? deepCopy(pendingFaculty) : deepCopy(committedFaculty);
    const baseStudents = pendingStudents && pendingStudents.length > 0 ? deepCopy(pendingStudents) : deepCopy(committedStudents);

    setFaculty(baseFaculty);
    setStudents(baseStudents);
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!(pendingFaculty || (pendingStudents && pendingStudents.length > 0)));
    setSelectedItems([]);
    setSelectAll(false);
  };

  const handleChangeFaculty = (key, value) => {
    if (!faculty) return;
    const updated = { ...faculty, [key]: value };
    setFaculty(updated);
    setIsDirty(true);
  };

  const handleChangeStudent = (index, key, value) => {
    const updatedStudents = students.map((s, i) => (i === index ? { ...s, [key]: value } : s));
    setStudents(updatedStudents);
    setIsDirty(true);
  };

  // Faculty image preview + keep file reference (_file)
  const handleFacultyPreviewChange = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImg(url);
      setFaculty((prev) => {
        if (!prev) return prev;
        return { ...prev, image_path: url, _file: file };
      });
      setIsDirty(true);
    }
  };

  // Student image preview + keep file reference (_file)
  const handleStudentPreviewChange = (index, file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImgs((prev) => ({ ...prev, [index]: url }));
      setStudents((prev) => {
        const copy = [...prev];
        copy[index] = { ...(copy[index] || {}), image_path: url, _file: file };
        return copy;
      });
      setIsDirty(true);
    }
  };

  const handleAddStudent = () => {
    const newStudent = {
      id: String(Date.now()),
      name: "",
      designation: "",
      image_path: "",
      selected: false,
    };
    setStudents((prev) => [...prev, newStudent]);
    setIsDirty(true);
  };

  const handleItemSelect = (index) => {
    const updatedStudents = students.map((student, i) => (i === index ? { ...student, selected: !student.selected } : student));
    setStudents(updatedStudents);
    const selectedIndices = updatedStudents.map((s, i) => (s.selected ? i : -1)).filter((i) => i !== -1);
    setSelectedItems(selectedIndices);
    setSelectAll(selectedIndices.length === updatedStudents.length && updatedStudents.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updatedStudents = students.map((student) => ({ ...student, selected: newSelectAll }));
    setStudents(updatedStudents);
    setSelectedItems(newSelectAll ? students.map((_, i) => i) : []);
  };

  const confirmDelete = () => {
    const updated = students.filter((_, i) => !selectedItems.includes(i));
    setStudents(updated);
    setSelectedItems([]);
    setSelectAll(false);
    setShowDeleteModal(false);
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (pendingFaculty || (pendingStudents && pendingStudents.length > 0)) {
      setFaculty(deepCopy(pendingFaculty || committedFaculty));
      setStudents(deepCopy((pendingStudents && pendingStudents.length > 0) ? pendingStudents : committedStudents));
      toast.info("Cancelled edits. Draft preserved!");
      setIsSaved(true);
    } else {
      setFaculty(deepCopy(committedFaculty));
      setStudents(deepCopy(committedStudents));
      toast.info("Cancelled. Reverted to original data!");
      setIsSaved(false);
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    setPreviewImg(null);
    setPreviewImgs({});
  };

  const handleSave = () => {
    // Validate fields
    let newErrors = {};

    if (!faculty?.name?.trim()) {
      newErrors.facultyName = "Required";
    }
    if (!faculty?.designation?.trim()) {
      newErrors.facultyDesignation = "Required";
    }
    if (!faculty?.image_path) {
      newErrors.facultyImage = "Faculty image is required";
    }

    students.forEach((student, index) => {
      if (!student?.name?.trim()) {
        newErrors[`studentName_${index}`] = "Required";
      }
      if (!student?.designation?.trim()) {
        newErrors[`studentDesignation_${index}`] = "Required";
      }
      // if (!student?.image_path) {
      //   newErrors[`studentImage_${index}`] = "Image required";
      // }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields (including images) before saving.");
      return;
    }

    setPendingFaculty(deepCopy(faculty));
    setPendingStudents(deepCopy(students));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
  };

  const handleDiscard = () => {
    setFaculty(deepCopy(committedFaculty));
    setStudents(deepCopy(committedStudents));
    setPendingFaculty(null);
    setPendingStudents([]);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    setPreviewImg(null);
    setPreviewImgs({});
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  // Build payload for faculty + students (insert, update, delete) and send with files
  const handleFinalRequestConfirm = async () => {
    // Use pending if available, otherwise nothing to submit
    if (!pendingFaculty && (!pendingStudents || pendingStudents.length === 0)) {
      toast.error("No draft to submit. Save changes first.");
      return;
    }

    const payload = [];
    const filesToSend = [];

    // ---- Faculty diffs ----
    const oldFac = committedFaculty;
    const newFac = pendingFaculty || faculty;

    // helper to choose server path for a file
    const fileServerPath = (file) => `/static/images/nss/${file.name}`;

    if (!oldFac && newFac) {
      // insert faculty
      let facImagePath = newFac.image_path || "";
      if (newFac._file) {
        facImagePath = fileServerPath(newFac._file);
        filesToSend.push(newFac._file);
      }
      payload.push({
        collectionName: "nss",
        collection_type: "team",
        action: "insert",
        title: "insert team member",
        category: "faculty_coordinater",
        meta_data: {
          name: newFac.name,
          designation: newFac.designation,
          image_path: facImagePath,
        },
      });
    } else if (oldFac && newFac) {
      // maybe update
      const changed =
        String((oldFac.name || "").trim()) !== String((newFac.name || "").trim()) ||
        String((oldFac.designation || "").trim()) !== String((newFac.designation || "").trim()) ||
        String((oldFac.image_path || "").replace(/^https?:\/\/[^/]+/, "")) !== String((newFac.image_path || "").replace(/^https?:\/\/[^/]+/, ""));

      if (changed) {
        let facImagePath = newFac.image_path || "";
        if (newFac._file) {
          facImagePath = fileServerPath(newFac._file);
          filesToSend.push(newFac._file);
        }

        payload.push({
          collectionName: "nss",
          collection_type: "team",
          action: "update",
          title: "update team member",
          category: "faculty_coordinater",
          meta_data: {
            name: newFac.name,
            designation: newFac.designation,
            image_path: facImagePath,
          },
          original_data: {
            name: oldFac.name,
            designation: oldFac.designation,
            image_path: oldFac.image_path,
          },
        });
      }
    } else if (oldFac && !newFac) {
      // delete faculty
      payload.push({
        collectionName: "nss",
        collection_type: "team",
        action: "delete",
        title: "delete team member",
        category: "faculty_coordinater",
        meta_data: {
          name: oldFac.name,
          designation: oldFac.designation,
          image_path: oldFac.image_path,
        },
      });
    }

    // ---- Student diffs ----
    const committedMap = new Map((committedStudents || []).map((s) => [String(s.id), s]));
    const pendingMap = new Map((pendingStudents || []).map((s) => [String(s.id), s]));

    // Deleted students: in committed but not in pending
    for (const [id, oldStudent] of committedMap.entries()) {
      if (!pendingMap.has(id)) {
        payload.push({
          collectionName: "nss",
          collection_type: "team",
          action: "delete",
          title: "delete team member",
          category: "student_coordinater",
          meta_data: {
            name: oldStudent.name,
            designation: oldStudent.designation,
            image_path: oldStudent.image_path,
          },
        });
      }
    }

    // Inserts and updates
    for (const [id, newStudent] of pendingMap.entries()) {
      const oldStudent = committedMap.get(id);

      let studentImagePath = newStudent.image_path || "";
      if (newStudent._file) {
        const serverPath = fileServerPath(newStudent._file);
        studentImagePath = serverPath;
        filesToSend.push(newStudent._file);
      }

      if (!oldStudent) {
        // insert
        payload.push({
          collectionName: "nss",
          collection_type: "team",
          action: "insert",
          title: "insert team member",
          category: "student_coordinater",
          meta_data: {
            name: newStudent.name,
            designation: newStudent.designation,
            image_path: studentImagePath,
          },
        });
      } else {
        const changed =
          String((oldStudent.name || "").trim()) !== String((newStudent.name || "").trim()) ||
          String((oldStudent.designation || "").trim()) !== String((newStudent.designation || "").trim()) ||
          String((oldStudent.image_path || "").replace(/^https?:\/\/[^/]+/, "")) !== String((studentImagePath || "").replace(/^https?:\/\/[^/]+/, ""));

        if (changed) {
          payload.push({
            collectionName: "nss",
            collection_type: "team",
            action: "update",
            title: "update team member",
            category: "student_coordinater",
            meta_data: {
              name: newStudent.name,
              designation: newStudent.designation,
              image_path: studentImagePath,
            },
            original_data: {
              name: oldStudent.name,
              designation: oldStudent.designation,
              image_path: oldStudent.image_path,
            },
          });
        }
      }
    }

    if (payload.length === 0) {
      toast.info("No changes to submit.");
      setShowRequestModal(false);
      return;
    }

    try {
      const result = await sendRequest(payload, filesToSend);
      if (result) {
        // commit changes locally
        setCommittedFaculty(deepCopy(pendingFaculty || faculty));
        setCommittedStudents(deepCopy(pendingStudents));
        setFaculty(deepCopy(pendingFaculty || faculty));
        setStudents(deepCopy(pendingStudents));
        setPendingFaculty(null);
        setPendingStudents([]);
        setIsSaved(false);
        setShowRequestModal(false);
        setIsEditing(false);
        setIsDirty(false);
        
      } else {
        toast.error("Final request failed. Check console for details.");
      }
    } catch (err) {
      console.error("Final request error:", err);
      toast.error("An error occurred while sending request.");
    }
  };

  const revertChange = (itemId, action, isFaculty = false) => {
    const idKey = String(itemId);

    if (isFaculty) {
      setPendingFaculty(deepCopy(committedFaculty));
      setFaculty(deepCopy(committedFaculty));
    } else {
      if (action === "Deleted") {
        const committed = (committedStudents || []).find((s) => String(s.id) === idKey);
        if (committed) {
          setPendingStudents((prev) => {
            if (!prev) prev = [];
            if (prev.some((s) => String(s.id) === idKey)) return prev;
            return [...prev, deepCopy(committed)];
          });
          setStudents((prev) => {
            if (prev.some((s) => String(s.id) === idKey)) return prev;
            return [...prev, deepCopy(committed)];
          });
        }
      } else if (action === "Added") {
        setPendingStudents((prev) => (prev || []).filter((s) => String(s.id) !== idKey));
        setStudents((prev) => (prev || []).filter((s) => String(s.id) !== idKey));
      } else if (action === "Edited") {
        const committed = (committedStudents || []).find((s) => String(s.id) === idKey);
        if (committed) {
          setPendingStudents((prev) => (prev || []).map((s) => (String(s.id) === idKey ? deepCopy(committed) : s)));
          setStudents((prev) => (prev || []).map((s) => (String(s.id) === idKey ? deepCopy(committed) : s)));
        }
      }
    }

    const remaining = getChanges();
    if (remaining.length === 0) {
      setPendingFaculty(null);
      setPendingStudents([]);
      setIsSaved(false);
    }
  };

  const normalize = (val) => (val ? val.toString().trim() : "");
  const normalizeImage = (path) => {
    if (!path) return "";
    return path.replace(/^https?:\/\/[^/]+/, "");
  };

  const getChanges = () => {
    const changes = [];
    const currentFaculty = pendingFaculty || faculty;
    const currentStudents = pendingStudents && pendingStudents.length > 0 ? pendingStudents : students;

    const makeKey = (stu) => (stu && stu.id != null ? String(stu.id) : `gen-${normalize(stu?.name)}-${normalize(stu?.designation)}`);

    const committedMap = new Map((committedStudents || []).map((s) => [makeKey(s), s]));
    const currentMap = new Map((currentStudents || []).map((s) => [makeKey(s), s]));

    // Faculty changes
    if (committedFaculty && currentFaculty) {
      const facultyChanged =
        normalize(committedFaculty.name) !== normalize(currentFaculty.name) ||
        normalize(committedFaculty.designation) !== normalize(currentFaculty.designation) ||
        normalizeImage(committedFaculty.image_path) !== normalizeImage(currentFaculty.image_path);

      if (facultyChanged) {
        changes.push({
          action: "Edited",
          section: "Faculty Coordinator",
          changes: `Faculty: ${currentFaculty.name || "Unnamed"}`,
          itemId: "faculty",
          isFaculty: true,
        });
      }
    } else if (!committedFaculty && currentFaculty) {
      changes.push({
        action: "Added",
        section: "Faculty Coordinator",
        changes: `Faculty: ${currentFaculty.name || "New Faculty"}`,
        itemId: "faculty",
        isFaculty: true,
      });
    } else if (committedFaculty && !currentFaculty) {
      changes.push({
        action: "Deleted",
        section: "Faculty Coordinator",
        changes: `Faculty: ${committedFaculty.name || "Faculty"}`,
        itemId: "faculty",
        isFaculty: true,
      });
    }

    // Student deletions
    for (const [key, oldStudent] of committedMap.entries()) {
      if (!currentMap.has(key)) {
        changes.push({
          action: "Deleted",
          section: "Student Coordinators",
          changes: `Student: ${oldStudent?.name || "Unnamed Student"}`,
          itemId: String(oldStudent?.id ?? key),
          isFaculty: false,
        });
      }
    }

    // Student added/edited
    for (const [key, newStudent] of currentMap.entries()) {
      if (!committedMap.has(key)) {
        changes.push({
          action: "Added",
          section: "Student Coordinators",
          changes: `Student: ${newStudent?.name || "New Student"}`,
          itemId: String(newStudent?.id ?? key),
          isFaculty: false,
        });
      } else {
        const oldStudent = committedMap.get(key);
        const studentChanged =
          normalize(oldStudent?.name) !== normalize(newStudent?.name) ||
          normalize(oldStudent?.designation) !== normalize(newStudent?.designation) ||
          normalizeImage(oldStudent?.image_path) !== normalizeImage(newStudent?.image_path);

        if (studentChanged) {
          changes.push({
            action: "Edited",
            section: "Student Coordinators",
            changes: `Student: ${newStudent?.name || "Unnamed Student"}`,
            itemId: String(newStudent?.id ?? key),
            isFaculty: false,
          });
        }
      }
    }

    return changes;
  };

  const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const changes = getChanges();

  if (!faculty || !Array.isArray(students)) {
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
        <h2 className="text-3xl font-bold text-brwn dark:text-drkt">Coordinators</h2>

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
          {/* Faculty Section */}
          <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">FACULTY COORDINATOR</h2>

          <div className="nss-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4 p-4">
            {/* Faculty Image */}
            <div className="flex-shrink-0 relative">
              <img
                src={previewImg ? previewImg : faculty?.image_path ? parseUrl(faculty.image_path) : "/placeholder-image.jpg"}
                alt={faculty?.name || "Faculty"}
                className="w-32 h-32 rounded border object-cover"
              />

              {isEditing && (
                <div className="flex flex-col items-center mt-2 gap-2">
                  <label className="cursor-pointer px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-sm">
                    {faculty?.image_path ? "Replace" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFacultyPreviewChange(e.target.files?.[0])} />
                  </label>

                  {previewImg && (
                    <button onClick={() => window.open(previewImg, "_blank")} className="flex items-center gap-2 text-green-600">
                      <FaEye size={16} /> Preview
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Faculty Name + Designation */}
            <div className="text-center md:text-left w-full">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={faculty?.name || ""}
                    onChange={(e) => handleChangeFaculty("name", e.target.value.toUpperCase())}
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Faculty Name"
                  />
                  <input
                    type="text"
                    value={faculty?.designation || ""}
                    onChange={(e) => handleChangeFaculty("designation", toTitleCase(e.target.value))}
                    className="border p-1 w-full"
                    placeholder="Designation"
                  />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{faculty?.name}</h3>
                  <p className="text-gray-600">{faculty?.designation}</p>
                </>
              )}
            </div>
          </div>

          {/* Students Section */}
          <h2 className="text-xl md:text-2xl font-bold text-center mt-6 text-brwn dark:text-drkt">STUDENT COORDINATORS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students.map((member, index) => (
              <div key={index} className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center relative">
                {isEditing && <input type="checkbox" checked={member.selected || false} onChange={() => handleItemSelect(index)} className="absolute top-2 right-2 h-4 w-4 cursor-pointer" />}

                {member?.image_path && (
                  <div className="relative w-24 h-24 mb-3">
                    <img
                      src={
                        previewImgs[index]
                          ? previewImgs[index]
                          : parseUrl(member.image_path)
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
                  </div>
                )}

                {isEditing && member?.image_path && (
                  <div className="mb-3">
                    <label className="cursor-pointer px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-sm">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleStudentPreviewChange(index, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )}

                {isEditing ? (
                  <>
                    <input type="text" value={member?.name || ""} onChange={(e) => handleChangeStudent(index, "name", e.target.value.toUpperCase())} className="border p-1 mb-2 w-full" placeholder="Name" />
                    <input type="text" value={member?.designation || ""} onChange={(e) => handleChangeStudent(index, "designation", toTitleCase(e.target.value))} className="border p-1 w-full" placeholder="Designation" />
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{member?.name}</h3>
                    <p className="text-sm text-brwn dark:text-drka">{member?.designation}</p>
                  </>
                )}
              </div>
            ))}

            {isEditing && (
              <div onClick={handleAddStudent} className="border-2 border-dashed border-gray-400 rounded-xl flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <PlusCircle size={40} className="text-gray-500 mb-2" />
                <span className="text-gray-500">Add Student</span>
              </div>
            )}
          </div>

          {/* Delete Selected Button */}
          {selectedItems.length > 0 && (
            <div className="flex justify-center my-2">
              <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-prim rounded hover:bg-red-600">
                <Trash2 size={18} /> Delete Selected ({selectedItems.length})
              </button>
            </div>
          )}

          {/* Cancel & Save Buttons */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">Cancel</button>

            {changes.length > 0 && isDirty && (
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
                Save
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* View Mode - Faculty */}
          <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">FACULTY COORDINATOR</h2>
          <div className="nss-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4 p-4">
            <div className="flex-shrink-0">
              <img src={faculty?.image_path ? parseUrl(faculty.image_path) : "/placeholder-image.jpg"} alt={faculty?.name || "Faculty"} className="w-32 h-32 rounded border object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold">{faculty?.name}</h3>
              <p className="text-sm">{faculty?.designation}</p>
            </div>
          </div>

          {/* Students Grid */}
          <h2 className="text-xl md:text-2xl font-bold text-center mt-6 text-brwn dark:text-drkt">STUDENT COORDINATORS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {students.map((student, index) => (
              <div key={index} className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center">
                {student?.image_path && (
                  <img
                    src={parseUrl(student.image_path)}
                    alt={student?.name || "Student"}
                    className="w-24 h-24 border rounded object-cover mb-3"
                  />
                )}
                <h3 className="text-lg font-semibold">{student?.name}</h3>
                <p className="text-sm text-brwn dark:text-drka">{student?.designation}</p>
              </div>
            ))}
          </div>

          {/* Discard/Request buttons when saved */}
          {isSaved && (
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">Discard Changes</button>
              {changes.length > 0 && (
                <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
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
                        <button onClick={() => revertChange(ch.itemId, ch.action, ch.isFaculty)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">Cancel</button>
              {changes.length > 0 && (
                <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim" disabled={loading}>
                  {loading ? "Processing..." : "Final Request"}
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
              Are you sure you want to delete {selectedItems.length} selected student{selectedItems.length > 1 ? "s" : ""}?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Coordinators;
