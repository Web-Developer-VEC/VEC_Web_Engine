import React, { useState, useEffect } from "react";
import styles from "./NCCNMembers.module.css";
import axios from "axios";
import LoadComp from "../../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle } from "lucide-react";
import { FaUpload, FaEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";

const deepCopy = (v) => structuredClone(v);

function NCCNMembers({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";

  const UrlParser = (path) => {
    if (!path) return "/placeholder.jpg";
    if (typeof path !== "string") return "/placeholder.jpg";

    const trimmed = path.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }

    // If path already includes /static or starts with /, ensure leading slash then prepend BASE_URL
    if (trimmed.startsWith("/")) {
      return `${BASE_URL}${trimmed}`;
    }

    if (trimmed.includes("/static/") || trimmed.includes("static/")) {
      return `${BASE_URL}/${trimmed.replace(/^\/+/, "")}`;
    }

    // If it looks like a filename with extension, assume it's stored in your upload folder
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(trimmed)) {
      return `${BASE_URL}/static/images/ncc/ncc_navy/${trimmed}`;
    }

    // Fallback: treat as relative path and prepend slash
    return `${BASE_URL}/${trimmed}`;
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

  // Normalize incoming image_path helper (keeps existing absolute paths, fixes filenames)
  const normalizeIncomingImagePath = (rawPath) => {
    if (!rawPath) return "";
    if (typeof rawPath !== "string") return "";

    const p = rawPath.trim();
    if (
      p.startsWith("http://") ||
      p.startsWith("https://") ||
      p.startsWith("blob:") ||
      p.startsWith("data:")
    ) {
      return p;
    }

    // If already contains /static or starts with '/', keep it (ensure leading slash)
    if (p.startsWith("/")) return p;
    if (p.includes("/static/") || p.includes("static/")) return p.startsWith("/") ? p : `/${p}`;

    // If looks like filename, convert to expected upload folder
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(p)) {
      return `/static/images/ncc/ncc_navy/${p}`;
    }

    // fallback: return as-is with leading slash
    return p.startsWith("/") ? p : `/${p}`;
  };

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length >= 2) {
      const coordinator = data[0]?.members?.[0] || null;
      const students = Array.isArray(data[1]?.members) ? data[1].members : [];

      const coordinatorNormalized = coordinator
        ? {
            ...coordinator,
            image_path: normalizeIncomingImagePath(coordinator.image_path)
          }
        : null;

      const studentsWithIds = students.map((s, i) => ({
        ...s,
        id: s?.id !== undefined && s?.id !== null ? String(s.id) : `gen-${Date.now()}-${i}`,
        image_path: normalizeIncomingImagePath(s?.image_path)
      }));

      setCommittedCoor(coordinatorNormalized ? deepCopy(coordinatorNormalized) : null);
      setCommittedStud(deepCopy(studentsWithIds));
      setCoor(coordinatorNormalized ? deepCopy(coordinatorNormalized) : null);
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
      image_file: file,
      image_path: `/static/images/ncc/ncc_navy/${file.name}`
    }));

    setIsDirty(true);
  };

  const handleStudentPreviewChange = (index, file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPreviewImgs((prev) => ({ ...prev, [index]: previewUrl }));

    setStud((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              image_file: file,
              image_path: `/static/images/ncc/ncc_navy/${file.name}`
            }
          : s
      )
    );

    setIsDirty(true);
  };

  const handleAddStudent = () => {
    const newStudent = {
      id: String(Date.now()),
      name: "",
      regiment_no: "",
      rank: "",
      universityno: "",
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
      .map((student, i) => (student.selected ? i : -1))
      .filter((i) => i !== -1);

    setSelectedItems(selectedIndices);
    setSelectAll(selectedIndices.length === updatedStud.length && updatedStud.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedStud = stud.map((student) => ({ ...student, selected: newSelectAll }));
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
      if (!student?.rank?.trim()) {
        newErrors[`studentRank_${index}`] = "Required";
      }
      if (!student?.universityno?.trim()) {
        newErrors[`studentUniversityNo_${index}`] = "Required";
      }
      if (!student?.department?.trim()) {
        newErrors[`studentDepartment_${index}`] = "Required";
      }
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

  const buildPayload = () => {
    return changes.map((ch) => {
      const isStudent = ch.section === "Student Coordinators";

      const actionMap = {
        Added: "insert",
        Edited: "update",
        Deleted: "delete"
      };

      const action = actionMap[ch.action];

      let original_data = null;
      let meta_data = null;

      if (ch.isCoor) {
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
        const oldItem = committedStud.find((s) => String(s.id) === String(ch.itemId));
        const newItem = stud.find((s) => String(s.id) === String(ch.itemId));

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
        collectionName: "ncc_navy",
        collection_type: "team",
        action,
        category: isStudent ? "student_coordinators" : "faculty_coordinators",
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
        ...(original_data ? { original_data: cleanImageFields(original_data) } : {}),
        ...(meta_data ? { meta_data: cleanImageFields(meta_data) } : {})
      };
    });
  };

  const handleFinalRequestConfirm = async () => {
    if (!pendingCoor && pendingStud.length === 0) return;

    const payload = buildPayload();
    const files = [];

    if (pendingCoor?.image_file instanceof File) {
      files.push(pendingCoor.image_file);
    }

    pendingStud.forEach((s) => {
      if (s?.image_file instanceof File) {
        files.push(s.image_file);
      }
    });

    try {
      await sendRequest(payload, files);
      toast.success("Request sent successfully!");

      // update committed state so UI shows approved paths (we assume server will store the same path pattern)
      setCommittedCoor(deepCopy(pendingCoor || coor));
      setCommittedStud(deepCopy(pendingStud.length ? pendingStud : stud));

      setPendingCoor(null);
      setPendingStud([]);
      setIsSaved(false);
      setShowRequestModal(false);
      setPreviewImgs({});
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
        const committed = (committedStud || []).find((s) => String(s.id) === idKey);
        if (committed) {
          setPendingStud((prev) => {
            if (prev.some((s) => String(s.id) === idKey)) return prev;
            return [...prev, deepCopy(committed)];
          });
          setStud((prev) => {
            if (prev.some((s) => String(s.id) === idKey)) return prev;
            return [...prev, deepCopy(committed)];
          });
        }
      } else if (action === "Added") {
        setPendingStud((prev) => prev.filter((s) => String(s.id) !== idKey));
        setStud((prev) => prev.filter((s) => String(s.id) !== idKey));
      } else if (action === "Edited") {
        const committed = (committedStud || []).find((s) => String(s.id) === idKey);
        if (committed) {
          setPendingStud((prev) => prev.map((s) => (String(s.id) === idKey ? deepCopy(committed) : s)));
          setStud((prev) => prev.map((s) => (String(s.id) === idKey ? deepCopy(committed) : s)));
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
    str ? str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : "";

  const getChanges = () => {
    const changes = [];
    const currentCoor = pendingCoor || coor;
    const currentStud = pendingStud.length > 0 ? pendingStud : stud;

    const makeKey = (stu) => (stu && stu.id != null ? String(stu.id) : `gen-${normalize(stu?.name)}-${normalize(stu?.regiment_no)}`);

    const committedMap = new Map((committedStud || []).map((s) => [makeKey(s), s]));
    const currentMap = new Map((currentStud || []).map((s) => [makeKey(s), s]));

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
          isCoor: true
        });
      }
    } else if (!committedCoor && currentCoor) {
      changes.push({
        action: "Added",
        section: "Faculty Coordinator",
        changes: `Coordinator: ${currentCoor.name || "New Coordinator"}`,
        itemId: "coor",
        isCoor: true
      });
    } else if (committedCoor && !currentCoor) {
      changes.push({
        action: "Deleted",
        section: "Faculty Coordinator",
        changes: `Coordinator: ${committedCoor.name || "Coordinator"}`,
        itemId: "coor",
        isCoor: true
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
          isCoor: false
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
          isCoor: false
        });
      } else {
        const oldStudent = committedMap.get(key);
        const studentChanged =
          normalize(oldStudent?.name) !== normalize(newStudent?.name) ||
          normalize(oldStudent?.regiment_no) !== normalize(newStudent?.regiment_no) ||
          normalize(oldStudent?.rank) !== normalize(newStudent?.rank) ||
          normalize(oldStudent?.universityno) !== normalize(newStudent?.universityno) ||
          normalize(oldStudent?.department) !== normalize(newStudent?.department) ||
          normalizeImage(oldStudent?.image_path) !== normalizeImage(newStudent?.image_path);

        if (studentChanged) {
          changes.push({
            action: "Edited",
            section: "Student Coordinators",
            changes: `Student: ${newStudent?.name || "Unnamed Student"}`,
            itemId: String(newStudent?.id ?? key),
            isCoor: false
          });
        }
      }
    }

    return changes;
  };

  const cleanImageFields = (obj) => {
    if (!obj) return obj;

    const cleaned = { ...obj };

    delete cleaned.image_file;

    if (cleaned.image_path?.startsWith("blob:")) {
      cleaned.image_path = undefined;
    }

    return cleaned;
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
    <div className={styles.container}>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className={styles.headerRow}>
        <h2 className={styles.title}></h2>

        {/* Edit button on right */}
        {!isEditing && (
          <div>
            <button
              onClick={handleStartEdit}
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnIcon}`}
            >
              <Pencil size={18} />
              Edit
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <>
          <h2 className={styles.subTitle}>FACULTY COORDINATOR</h2>

          <div className={styles.coordinatorWrapper}>
            <div className={styles.coordinatorCard}>
              <div style={{ flexShrink: 0, position: "relative" }}>
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
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <label className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                      {coor?.image_path ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCoorPreviewChange(e.target.files?.[0])}
                        style={{ display: "none" }}
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
                      onChange={(e) => handleChangeCoor("name", e.target.value)}
                      className={styles.input}
                      placeholder="Coordinator Name"
                    />
                    <input
                      type="text"
                      value={coor?.designation || ""}
                      onChange={(e) => handleChangeCoor("designation", toTitleCase(e.target.value))}
                      className={styles.input}
                      placeholder="Designation"
                    />
                  </>
                ) : (
                  <>
                    <h3 className={styles.coordinatorName}>{coor?.name}</h3>
                    <p className={styles.coordinatorDesignation}>{coor?.designation}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <h2 className={styles.subTitle} style={{ marginTop: 24 }}>
            STUDENT COORDINATORS
          </h2>

          <div className={styles.studentGrid}>
            {stud.map((member, index) => (
              <div key={index} className={styles.studentCard}>
                {isEditing && (
                  <input
                    type="checkbox"
                    checked={member.selected || false}
                    onChange={() => handleItemSelect(index)}
                    className={styles.checkbox}
                  />
                )}

                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={member?.name || ""}
                      onChange={(e) => handleChangeStudent(index, "name", e.target.value.toUpperCase())}
                      className={styles.input}
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={member?.regiment_no || ""}
                      onChange={(e) => handleChangeStudent(index, "regiment_no", e.target.value.toUpperCase())}
                      className={styles.input}
                      placeholder="Regiment No"
                    />
                    <input
                      type="text"
                      value={member?.rank || ""}
                      onChange={(e) => handleChangeStudent(index, "rank", e.target.value.toUpperCase())}
                      className={styles.input}
                      placeholder="Rank"
                    />
                    <input
                      type="text"
                      value={member?.universityno || ""}
                      onChange={(e) => handleChangeStudent(index, "universityno", e.target.value.toUpperCase())}
                      className={styles.input}
                      placeholder="University No"
                    />
                    <input
                      type="text"
                      value={member?.department || ""}
                      onChange={(e) => handleChangeStudent(index, "department", e.target.value.toUpperCase())}
                      className={styles.input}
                      placeholder="Department"
                    />
                  </>
                ) : (
                  <>
                    <h3 className={styles.studentTitle}>{member?.name}</h3>
                    <p className={styles.studentText}>Regiment No: {member?.regiment_no}</p>
                    <p className={styles.studentText}>Rank: {member?.rank}</p>
                    <p className={styles.studentText}>University No: {member?.universityno}</p>
                    <p className={styles.studentText}>Department: {member?.department}</p>
                  </>
                )}
              </div>
            ))}

            {isEditing && (
              <div onClick={handleAddStudent} className={styles.addCard}>
                <PlusCircle size={40} />
                <span className={styles.addText}>Add Student</span>
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className={styles.deleteBar}>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={`${styles.btn} ${styles.btnDanger} ${styles.btnIcon}`}
              >
                <Trash2 size={18} /> Delete Selected ({selectedItems.length})
              </button>
            </div>
          )}

          <div className={styles.actions}>
            <button onClick={handleCancel} className={`${styles.btn} ${styles.btnGray}`}>
              Cancel
            </button>

            {changes.length > 0 && isDirty && (
              <button onClick={handleSave} className={`${styles.btn} ${styles.btnPrimary}`}>
                Save
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className={styles.subTitle} style={{ textTransform: "capitalize", marginBottom: 16 }}>
            FACULTY COORDINATOR
          </h2>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className={styles.coordinatorCard}>
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
              <div className={styles.coordinatorInfo}>
                <h3 className={styles.coordinatorName}>{coor?.name}</h3>
                <p className={styles.coordinatorDesignation}>{coor?.designation}</p>
              </div>
            </div>
          </div>

          <h2 className={styles.subTitle} style={{ textTransform: "capitalize", marginTop: 26 }}>
            STUDENT COORDINATORS
          </h2>

          <div className={styles.studentGrid}>
            {stud.map((item, i) => (
              <div key={i} className={styles.studentCard}>
                <div className={styles.studentInfo}>
                  <h5 className={styles.studentTitle}>{item?.name}</h5>
                  <p className={styles.studentText}>Regiment No: {item?.regiment_no}</p>
                  <p className={styles.studentText}>Rank: {item?.rank}</p>
                  <p className={styles.studentText}>University No: {item?.universityno}</p>
                  <p className={styles.studentText}>Department: {item?.department}</p>
                </div>
              </div>
            ))}
          </div>

          {isSaved && (
            <div className={styles.actions} style={{ marginTop: 16 }}>
              <button onClick={handleDiscard} className={`${styles.btn} ${styles.btnGray}`}>
                Discard Changes
              </button>
              {changes.length > 0 && (
                <button
                  onClick={handleRequest}
                  className={"flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"}
                >
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
                <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Delete</h3>
            <p className={styles.modalNote} style={{ color: "#444" }}>
              Are you sure you want to delete {selectedItems.length} selected student{selectedItems.length > 1 ? "s" : ""}?
            </p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowDeleteModal(false)} className={`${styles.btn} ${styles.btnGray}`}>
                Cancel
              </button>
              <button onClick={confirmDelete} className={`${styles.btn} ${styles.btnDanger}`}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NCCNMembers;