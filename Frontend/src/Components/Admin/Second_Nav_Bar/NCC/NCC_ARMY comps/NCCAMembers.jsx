import React, { useState, useEffect } from "react";
import styles from "./NCCAMembers.module.css";
import axios from "axios";
import LoadComp from "../../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle, XCircle, Edit2 } from "lucide-react";
import { FaPaperPlane, FaUpload, FaRegCircleLeft, FaEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";

const deepCopy = (v) => structuredClone(v);

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
  const { sendRequest, loading, error } = useAdminRequest();

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
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPreviewImgs((prev) => ({ ...prev, coor: previewUrl }));

    setCoor((prev) => ({
      ...prev,
      image_file: file, // ✅ real file
      image_path: `/static/images/ncc/ncc_navy/${file.name}` // ✅ final stored path
    }));

    setIsDirty(true);
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
    const id = stud[index]?.id;
    if (!id) return;

    setStud(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, selected: !s.selected } : s
      )
    );

    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };


  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedStud = stud.map(student => ({ ...student, selected: newSelectAll }));
    setStud(updatedStud);

    setSelectedItems(newSelectAll ? stud.map((_, i) => i) : []);
  };

  const confirmDelete = () => {
    const updated = stud.filter(
      (student) => !selectedItems.includes(String(student.id))
    );

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
    //toast.success("Changes saved as draft!");
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

 // Set to true whenever student coordinators should also have images.
const ENABLE_STUDENT_IMAGES = false;

const cleanImageFields = (obj, isStudent = false) => {
  if (!obj) return obj;

  const cleaned = { ...obj };

  // Never send File objects
  delete cleaned.image_file;

  if (isStudent && !ENABLE_STUDENT_IMAGES) {
    // Student images are disabled for now.
    delete cleaned.image_path;
  } else {
    // Keep image_path for Faculty Coordinator.
    // If image is a blob preview, don't send it.
    if (cleaned.image_path?.startsWith("blob:")) {
      cleaned.image_path = undefined;
    }
  }

  return cleaned;
};

  const buildPayload = () => {
    return changes.map((ch) => {
      const isStudent = ch.section === "Student Coordinators";

      const actionMap = {
        Added: "insert",
        Edited: "update",
        Deleted: "delete",
      };

      const action = actionMap[ch.action];

      let original_data = null;
      let meta_data = null;

      if (ch.isCoor) {
        // FACULTY COORDINATOR
        if (action === "update") {
          original_data = committedCoor;
          meta_data = pendingCoor;
        }

        if (action === "insert") {
          meta_data = pendingCoor;
        }

        if (action === "delete") {
          original_data = committedCoor;
        }
      } else {
        // STUDENTS
        const oldItem = committedStud.find(
          (s) => String(s.id) === String(ch.itemId)
        );

        const newItem = stud.find(
          (s) => String(s.id) === String(ch.itemId)
        );

        if (action === "update") {
          original_data = oldItem;
          meta_data = newItem;
        }

        if (action === "insert") {
          meta_data = newItem;
        }

        if (action === "delete") {
          original_data = oldItem;
          meta_data = oldItem;
        }

      }

      return {
        collectionName: "ncc_army",
        collection_type: "team",
        action,
        category: isStudent
          ? "student_coordinators"
          : "faculty_coordinators",

        title:
          action === "insert"
            ? isStudent
              ? "Add Student Coordinator"
              : "Add Faculty Coordinator"
            : action === "update"
              ? isStudent
                ? "Update Student Coordinator"
                : "Update Faculty Coordinator"
              : isStudent
                ? "Delete Student Coordinator"
                : "Delete Faculty Coordinator",

        ...(original_data
  ? {
      original_data: cleanImageFields(original_data, isStudent),
    }
  : {}),

...(meta_data
  ? {
      meta_data: cleanImageFields(meta_data, isStudent),
    }
  : {}),
      };

    });
  };



  const handleFinalRequestConfirm = async () => {
    if (!pendingCoor && pendingStud.length === 0) return;

    const payload = buildPayload();

    const files = [];

    // coordinator image
    if (pendingCoor?.image_file instanceof File) {
      files.push(pendingCoor.image_file);
    }

    // student images
    pendingStud.forEach((s) => {
      if (s?.image_file instanceof File) {
        files.push(s.image_file);
      }
    });

    try {
      console.log("files", files)
      await sendRequest(payload, files);

     // toast.success("Request sent successfully!");

      setCommittedCoor(deepCopy(pendingCoor || coor));
      setCommittedStud(deepCopy(pendingStud.length ? pendingStud : stud));

      setPendingCoor(null);
      setPendingStud([]);
      setIsSaved(false);
      setShowRequestModal(false);
    } catch (err) {
      toast.error("Failed to submit request");
    }
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
    <div className={styles.pageWrapper}>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className={styles.headerWrapper}>
        <h2 className={styles.pageTitle}></h2>

        {!isEditing && (
          <div className={styles.editBtnWrapper}>
            <button onClick={handleStartEdit} className={styles.editBtn}>
              <Pencil size={18} />
              Edit
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <>
          <h2 className={styles.sectionTitle}>FACULTY COORDINATOR</h2>

          <div className={styles.centerFlex}>
            <div className={styles.coordinatorCard}>
              <div className={styles.coordinatorImageWrapper}>
                <img
                  src={
                    previewImgs.coor
                      ? previewImgs.coor
                      : coor?.image_path
                        ? UrlParser(coor.image_path)
                        : "/placeholder-image.jpg"
                  }
                  alt={coor?.name || "Coordinator"}
                  className={styles.coordinatorImage}
                />

                {isEditing && (
                  <div className={styles.uploadWrapper}>
                    <label className={styles.uploadBtn}>
                      {coor?.image_path ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.hiddenInput}
                        onChange={(e) =>
                          handleCoorPreviewChange(e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className={styles.coordinatorInfo}>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={coor?.name || ""}
                      onChange={(e) =>
                        handleChangeCoor("name", e.target.value.toUpperCase())
                      }
                      className={styles.input}
                      placeholder="Coordinator Name"
                    />
                    <input
                      type="text"
                      value={coor?.designation || ""}
                      onChange={(e) =>
                        handleChangeCoor("designation", toTitleCase(e.target.value))
                      }
                      className={styles.input}
                      placeholder="Designation"
                    />
                  </>
                ) : (
                  <>
                    <h3 className={styles.coordinatorName}>{coor?.name}</h3>
                    <p className={styles.coordinatorDesignation}>
                      {coor?.designation}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Students */}
          <h2 className={styles.sectionTitle}>STUDENT COORDINATORS</h2>

          <div className={styles.studentGrid}>
            {stud.map((member, index) => (
              <div key={index} className={styles.studentCard}>
                {isEditing && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(String(member.id))}
                    onChange={() => handleItemSelect(index)}
                    className={styles.checkbox}
                  />

                )}

                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={member?.name || ""}
                      onChange={(e) =>
                        handleChangeStudent(index, "name", e.target.value.toUpperCase())
                      }
                      className={styles.input}
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={member?.regiment_no || ""}
                      onChange={(e) =>
                        handleChangeStudent(index, "regiment_no", e.target.value.toUpperCase())
                      }
                      className={styles.input}
                      placeholder="Regiment No"
                    />
                    <select
                      value={member?.year || ""}
                      onChange={(e) =>
                        handleChangeStudent(index, "year", e.target.value)
                      }
                      className={styles.input}
                    >
                      <option value="">Select Year</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                    <input
                      type="text"
                      value={member?.rank || ""}
                      onChange={(e) =>
                        handleChangeStudent(index, "rank", e.target.value.toUpperCase())
                      }
                      className={styles.input}
                      placeholder="Rank"
                    />
                    <input
                      type="text"
                      value={member?.department || ""}
                      onChange={(e) =>
                        handleChangeStudent(index, "department", e.target.value.toUpperCase())
                      }
                      className={styles.input}
                      placeholder="Department"
                    />
                  </>
                ) : (
                  <>
                    <h3 className={styles.studentName}>{member?.name}</h3>
                    <p className={styles.studentText}>{member?.regiment_no}</p>
                    <p className={styles.studentText}>{member?.year}</p>
                    <p className={styles.studentText}>
                      {member?.rank} - {member?.department}
                    </p>
                  </>
                )}
              </div>
            ))}

            {isEditing && (
              <div onClick={handleAddStudent} className={styles.addStudentCard}>
                <PlusCircle size={40} />
                <span>Add Student</span>
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className={styles.centerActions}>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={styles.deleteBtn}
              >
                <Trash2 size={18} /> Delete Selected ({selectedItems.length})
              </button>
            </div>
          )}



          <div className={styles.actionRow}>
            <button onClick={handleCancel} className={styles.cancelBtn}>
              Cancel
            </button>

            {changes.length > 0 && isDirty && (
              <button onClick={handleSave} className={styles.saveBtn}>
                Save
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className={styles.sectionTitle}>FACULTY COORDINATOR</h2>

          <div className={styles.centerFlex}>
            <div className={styles.coordinatorCard}>
              <img
                src={
                  previewImgs.coor
                    ? previewImgs.coor
                    : coor?.image_path
                      ? UrlParser(coor.image_path)
                      : "/placeholder-image.jpg"
                }
                alt={coor?.name}
                className={styles.coordinatorImage}
              />

              <div className={styles.coordinatorInfo}>
                <h3 className={styles.coordinatorName}>{coor?.name}</h3>
                <p className={styles.coordinatorDesignation}>
                  {coor?.designation}
                </p>
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>STUDENT COORDINATORS</h2>

          <div className={styles.studentGrid}>
            {stud.map((member, index) => (
              <div className={styles.studentCard} key={index}>
                <h5 className={styles.studentName}>{member?.name}</h5>
                <p className={styles.studentText}>{member?.regiment_no}</p>
                <p className={styles.studentText}>{member?.year}</p>
                <p className={styles.studentText}>
                  {member?.rank} - {member?.department}
                </p>
              </div>
            ))}
          </div>

          {isSaved && (
            <div className={styles.actionRow}>
              <button onClick={handleDiscard} className={styles.cancelBtn}>
                Discard Changes
              </button>

              {changes.length > 0 && (
                <button onClick={handleRequest} className={styles.saveBtn}>
                  <Send size={18} /> Request
                </button>
              )}
            </div>
          )}
        </>
      )}

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