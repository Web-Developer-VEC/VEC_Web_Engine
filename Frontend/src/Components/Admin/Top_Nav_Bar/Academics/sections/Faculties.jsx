import React, { useEffect, useRef, useState } from "react";
import styles from "./Faculties.module.css";
import ImageCard from "./ImageCard";
import LoadComp from "../../../LoadComp";
import {Pencil, Send, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Faculties component (final)
 * - Keeps your original UI & classes
 * - Required validation: name, designation, image_pathvmd
 * - Save button visible only when sessionChanges exist
 * - Delete confirm modal, Replace PDF, Final Request modal kept
 * - Multi-select & multi-delete added (via checkboxes on each card)
 */


export default function Faculties({ data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedOnce, setIsSavedOnce] = useState(false);

  // data sections
  const [hod, setHod] = useState(null);
  const [teachingStaff, setTeachingStaff] = useState([]);
  const [nonTeachingStaff, setNonTeachingStaff] = useState([]);
  const [facultyPdfPath, setFacultyPdfPath] = useState("");

  // change tracking
  const [sessionChanges, setSessionChanges] = useState([]); // changes in current editing session
  const [allChanges, setAllChanges] = useState([]); // saved changes pending request

  // modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // multi-delete UI
  const [selectedIds, setSelectedIds] = useState(new Set()); // set of selected faculty uids
  const [multiDeleteConfirmOpen, setMultiDeleteConfirmOpen] = useState(false);
  const [multiDeletePreview, setMultiDeletePreview] = useState([]); // array of {section, index, uid, item}

  // refs for original/saved snapshots
  const originalRef = useRef({ hod: null, teaching: [], nonTeaching: [], faculty_pdf_path: "" });
  const savedDataRef = useRef({ hod: null, teaching: [], nonTeaching: [], faculty_pdf_path: "" });

  // helper to get id
  const getId = (f) => {
    if (!f) return undefined;
    return f.unique_id ?? f.id ?? f.uid ?? f._id;
  };

  // initialize from data prop
  useEffect(() => {
    if (!data) return;
    const hod_from_data = data?.find((i) => i.category === "head_of_department")?.members || [];
    const teaching_from_data = data?.find((i) => i.category === "teaching_staff")?.members || [];
    const non_teaching_from_data = data?.find((i) => i.category === "non_teaching_staff")?.members || [];
    const pdf_path = data?.find((i) => i.category === "faculty_pdf_path")?.content?.[0] || "";

    const init = {
      hod: hod_from_data?.[0] ?? null,
      teaching: Array.isArray(teaching_from_data) ? teaching_from_data.slice() : [],
      nonTeaching: Array.isArray(non_teaching_from_data) ? non_teaching_from_data.slice() : [],
      faculty_pdf_path: pdf_path,
    };

    originalRef.current = JSON.parse(JSON.stringify(init));
    savedDataRef.current = JSON.parse(JSON.stringify(init));

    setHod(init.hod);
    setTeachingStaff(init.teaching);
    setNonTeachingStaff(init.nonTeaching);
    setFacultyPdfPath(init.faculty_pdf_path);
    setSessionChanges([]);
    setAllChanges([]);
    setIsSavedOnce(false);
    setSelectedIds(new Set());
  }, [data]);

  // clear selection whenever editing mode exits
  useEffect(() => {
    if (!isEditing) {
      setSelectedIds(new Set());
    }
  }, [isEditing]);

  // push session change helper
  const pushSessionChange = (change) => {
    setSessionChanges((prev) => [...prev, change]);
  };

  // start editing
  const startEdit = () => {
    setIsEditing(true);
    setSelectedIds(new Set());
  };

  // cancel session => restore savedDataRef
  const handleCancelSession = () => {
    const saved = savedDataRef.current;
    setHod(saved.hod ? JSON.parse(JSON.stringify(saved.hod)) : null);
    setTeachingStaff(saved.teaching ? JSON.parse(JSON.stringify(saved.teaching)) : []);
    setNonTeachingStaff(saved.nonTeaching ? JSON.parse(JSON.stringify(saved.nonTeaching)) : []);
    setFacultyPdfPath(saved.faculty_pdf_path ?? "");
    setSessionChanges([]);
    setIsEditing(false);
    setSelectedIds(new Set());
    toast.info("Session changes discarded. Previous saves preserved.");
  };

  // validate required fields in current local state (used for Save)
  const validateCurrentRequired = () => {
    // HOD (if exists)
    if (hod) {
      if (!hod.name || !hod.designation || !(hod.image_path || hod.image)) {
        toast.error("HOD: Name, Designation and Photo are required.");
        return false;
      }
    }
    // teaching
    for (let i = 0; i < teachingStaff.length; i++) {
      const f = teachingStaff[i];
      if (!f.name || !f.designation || !(f.image_path || f.image)) {
        toast.error(`Teaching staff row ${i + 1}: Name, Designation and Photo are required.`);
        return false;
      }
    }
    // non teaching
    for (let i = 0; i < nonTeachingStaff.length; i++) {
      const f = nonTeachingStaff[i];
      if (!f.name || !f.designation || !(f.image_path || f.image)) {
        toast.error(`Non-teaching staff row ${i + 1}: Name, Designation and Photo are required.`);
        return false;
      }
    }
    return true;
  };

  // save session
  const handleSave = () => {
    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }
    if (!validateCurrentRequired()) return;

    savedDataRef.current = {
      hod: JSON.parse(JSON.stringify(hod)),
      teaching: JSON.parse(JSON.stringify(teachingStaff)),
      nonTeaching: JSON.parse(JSON.stringify(nonTeachingStaff)),
      faculty_pdf_path: facultyPdfPath,
    };
    setAllChanges((prev) => [...prev, ...sessionChanges]);
    setSessionChanges([]);
    setIsSavedOnce(true);
    setIsEditing(false);
    setSelectedIds(new Set());
    toast.success("Changes saved. You can now Request or Edit again.");
  };

  // discard all saved -> restore originalRef
  const handleDiscardAll = () => {
    const orig = originalRef.current;
    savedDataRef.current = JSON.parse(JSON.stringify(orig));
    setHod(orig.hod ? JSON.parse(JSON.stringify(orig.hod)) : null);
    setTeachingStaff(orig.teaching ? JSON.parse(JSON.stringify(orig.teaching)) : []);
    setNonTeachingStaff(orig.nonTeaching ? JSON.parse(JSON.stringify(orig.nonTeaching)) : []);
    setFacultyPdfPath(orig.faculty_pdf_path ?? "");
    setSessionChanges([]);
    setAllChanges([]);
    setIsSavedOnce(false);
    setIsEditing(false);
    setSelectedIds(new Set());
    toast.info("All changes discarded and data reset.");
  };

  // request
  const handleRequest = () => {
    if (allChanges.length === 0) {
      toast.info("No changes to request.");
      return;
    }
    // validate saved data (final request should use saved state)
    const saved = savedDataRef.current;
    // validate saved HOD
    if (saved.hod) {
      if (!saved.hod.name || !saved.hod.designation || !(saved.hod.image_path || saved.hod.image)) {
        toast.error("Saved HOD is missing required fields.");
        return;
      }
    }
    for (let i = 0; i < (saved.teaching || []).length; i++) {
      const f = saved.teaching[i];
      if (!f.name || !f.designation || !(f.image_path || f.image)) {
        toast.error(`Saved teaching staff row ${i + 1} missing required fields.`);
        return;
      }
    }
    for (let i = 0; i < (saved.nonTeaching || []).length; i++) {
      const f = saved.nonTeaching[i];
      if (!f.name || !f.designation || !(f.image_path || f.image)) {
        toast.error(`Saved non-teaching staff row ${i + 1} missing required fields.`);
        return;
      }
    }

    setShowRequestModal(true);
  };

  // final request confirm
  const handleFinalRequestConfirm = () => {
    // submit (replace with real API integration)
    console.log("FINAL REQUEST SUBMITTED:", { allChanges, savedDataRef: savedDataRef.current });
    toast.success("Final request submitted");
    setShowRequestModal(false);
    setAllChanges([]);
    setSessionChanges([]);
    setIsSavedOnce(false);
    setIsEditing(false);
    setSelectedIds(new Set());
    originalRef.current = JSON.parse(JSON.stringify(savedDataRef.current));
  };

  // add new faculty (append)
  const handleAddFaculty = (section) => {
    const newFaculty = {
      unique_id: `new_${Date.now()}`,
      name: "",
      designation: "",
      image_path: "",
      socialmedia_links: {},
      resume_pdf: "",
    };

    if (section === "teaching") {
      const idx = teachingStaff.length;
      setTeachingStaff((prev) => [...prev, newFaculty]);
      pushSessionChange({ section: "teaching", index: idx, action: "add", faculty: newFaculty });
    } else {
      const idx = nonTeachingStaff.length;
      setNonTeachingStaff((prev) => [...prev, newFaculty]);
      pushSessionChange({ section: "nonTeaching", index: idx, action: "add", faculty: newFaculty });
    }
  };

  // handle faculty change from ImageCard: (field, value, uid)
  const handleFacultyChange = (group, uid, field, value) => {
    const targetArr = group === "teaching" ? [...teachingStaff] : [...nonTeachingStaff];
    const idIndex = targetArr.findIndex((f) => String(getId(f)) === String(uid));
    if (idIndex === -1) return;

    const oldVal = (targetArr[idIndex] && (targetArr[idIndex][field] ?? undefined));

    // apply change
    if (field === "socialmedia_links") {
      targetArr[idIndex] = { ...targetArr[idIndex], socialmedia_links: { ...(targetArr[idIndex].socialmedia_links || {}), ...(value || {}) } };
    } else if (field === "image_path") {
      // set image_path
      targetArr[idIndex] = { ...targetArr[idIndex], image_path: value };
    } else {
      targetArr[idIndex] = { ...targetArr[idIndex], [field]: value };
    }

    if (group === "teaching") setTeachingStaff(targetArr);
    else setNonTeachingStaff(targetArr);

    // merge session changes
    setSessionChanges((prev) => {
      const copy = [...prev];
      const existingIdx = copy.findIndex((c) => c.section === group && c.index === idIndex && c.action !== "delete");
      if (existingIdx >= 0) {
        const existing = copy[existingIdx];
        const action = existing.action === "add" ? "add" : "edit";
        const existingChanges = existing.changes ? { ...existing.changes } : {};
        existingChanges[field] = { old: oldVal, new: value };
        copy[existingIdx] = { ...existing, action, changes: existingChanges };
      } else {
        const savedArray = savedDataRef.current[group] || [];
        const actionType = savedArray[idIndex] ? "edit" : "add";
        copy.push({ section: group, index: idIndex, action: actionType, changes: { [field]: { old: oldVal, new: value } } });
      }
      return copy;
    });
  };
  const handleUndoChange = (idx) => {
  setAllChanges((prev) => {
    const copy = [...prev];
    if (idx >= 0 && idx < copy.length) copy.splice(idx, 1);
    return copy;
  });
  toast.info("Change removed from request");
};

  // handle HOD changes
  const handleHodChange = (field, value) => {
    const oldVal = (savedDataRef.current.hod && (savedDataRef.current.hod[field] ?? undefined));
    setHod((prev) => ({ ...(prev || {}), [field]: value }));
    setSessionChanges((prev) => {
      const copy = [...prev];
      const existingIdx = copy.findIndex((c) => c.section === "hod" && c.action !== "delete");
      if (existingIdx >= 0) {
        const existing = copy[existingIdx];
        const action = existing.action === "add" ? "add" : "edit";
        const existingChanges = existing.changes ? { ...existing.changes } : {};
        existingChanges[field] = { old: oldVal, new: value };
        copy[existingIdx] = { ...existing, action, changes: existingChanges };
      } else {
        copy.push({ section: "hod", index: 0, action: savedDataRef.current.hod ? "edit" : "add", changes: { [field]: { old: oldVal, new: value } } });
      }
      return copy;
    });
  };

  // open delete confirm (section + uid) - used for single-delete if parent triggers it
  const openDeleteConfirm = (section, uid) => {
    const arr = section === "teaching" ? teachingStaff : nonTeachingStaff;
    const index = arr.findIndex((f) => String(getId(f)) === String(uid));
    if (index === -1) return;
    setDeleteTarget({ section, index, uid, item: arr[index] });
    setDeleteConfirmOpen(true);
  };

  // confirm delete (single)
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { section, index, item } = deleteTarget;

    if (section === "teaching") {
      const newArr = [...teachingStaff];
      newArr.splice(index, 1);
      setTeachingStaff(newArr);
    } else {
      const newArr = [...nonTeachingStaff];
      newArr.splice(index, 1);
      setNonTeachingStaff(newArr);
    }

    pushSessionChange({ section: deleteTarget.section, index: deleteTarget.index, action: "delete", deletedItem: item });
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    toast.success("Faculty deleted in this session.");
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      copy.delete(String(getId(item)));
      return copy;
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Replace faculty PDF
  const handleFacultyPdfReplace = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const old = facultyPdfPath;
      setFacultyPdfPath(dataUrl);
      pushSessionChange({ section: "meta", index: 0, action: "edit", changes: { faculty_pdf_path: { old, new: dataUrl } } });
    };
    reader.readAsDataURL(file);
  };

  // URL parser
  const UrlParser = (path) => {
    if (!path) return "";
    return String(path).startsWith("http") ? path : `${process.env.REACT_APP_BASE_URL || ""}${path}`;
  };

  // toggle selection of a faculty uid (used by ImageCard checkboxes)
  const toggleSelect = (uid) => {
    if (!uid) return;
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const key = String(uid);
      if (copy.has(key)) copy.delete(key);
      else copy.add(key);
      return copy;
    });
  };

  // Open multi-delete confirmation modal (compute preview list)
  const openMultiDeleteConfirm = () => {
    if (!selectedIds || selectedIds.size === 0) return;
    const sel = Array.from(selectedIds).map(String);

    const preview = [];
    // find items in teaching
    teachingStaff.forEach((item, index) => {
      const id = String(getId(item));
      if (sel.includes(id)) preview.push({ section: "teaching", index, uid: id, item });
    });
    // find items in nonTeaching
    nonTeachingStaff.forEach((item, index) => {
      const id = String(getId(item));
      if (sel.includes(id)) preview.push({ section: "nonTeaching", index, uid: id, item });
    });

    if (preview.length === 0) {
      toast.info("Selected items not found.");
      return;
    }

    setMultiDeletePreview(preview);
    setMultiDeleteConfirmOpen(true);
  };

  // Confirm multi-delete
  const confirmMultiDelete = () => {
    const preview = [...multiDeletePreview];
    if (preview.length === 0) {
      setMultiDeleteConfirmOpen(false);
      return;
    }

    // Separate by section and sort indices descending to safely remove
    const teachingDeletes = preview
      .filter((p) => p.section === "teaching")
      .sort((a, b) => b.index - a.index);
    const nonTeachingDeletes = preview
      .filter((p) => p.section === "nonTeaching")
      .sort((a, b) => b.index - a.index);

    // Delete from teaching
    if (teachingDeletes.length > 0) {
      const newTeaching = [...teachingStaff];
      for (const del of teachingDeletes) {
        // push session change using the index at time of deletion
        pushSessionChange({ section: "teaching", index: del.index, action: "delete", deletedItem: del.item });
        if (del.index >= 0 && del.index < newTeaching.length) newTeaching.splice(del.index, 1);
      }
      setTeachingStaff(newTeaching);
    }

    // Delete from non-teaching
    if (nonTeachingDeletes.length > 0) {
      const newNonTeaching = [...nonTeachingStaff];
      for (const del of nonTeachingDeletes) {
        pushSessionChange({ section: "nonTeaching", index: del.index, action: "delete", deletedItem: del.item });
        if (del.index >= 0 && del.index < newNonTeaching.length) newNonTeaching.splice(del.index, 1);
      }
      setNonTeachingStaff(newNonTeaching);
    }

    // Clear selections & close modal
    setSelectedIds(new Set());
    setMultiDeletePreview([]);
    setMultiDeleteConfirmOpen(false);
    toast.success("Selected faculty deleted in this session.");
  };

  const cancelMultiDelete = () => {
    setMultiDeletePreview([]);
    setMultiDeleteConfirmOpen(false);
  };

  // UI rendering guard
  if (!data || !Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <div className={styles.app + " p-0 md:p-12"}>
        {/* Edit button */}
        {!isEditing && (
          <div className="flex justify-end pr-8">
            <button className="flex ml-auto mr-8 items-center bg-secd px-3 py-2 rounded text-text hover:bg-brwn hover:text-prim my-4" onClick={startEdit}>
              <Pencil  className="mr-2" /> Edit
            </button>
          </div>
        )}

        <div className={styles.imageGallery + " w-full"}>
          {/* HOD */}
          <div className={`${styles.fullWidthTile} relative`}>
            <ImageCard
              key={hod?.unique_id ?? "hod"}
              name={hod?.name}
              photo={hod?.image_path}
              Designation={hod?.designation}
              Scholar={hod?.socialmedia_links?.googlescholar}
              Research={hod?.socialmedia_links?.researchgate}
              Orchid={hod?.socialmedia_links?.orchidprofile}
              Publon={hod?.socialmedia_links?.publonprofile}
              Scopus={hod?.socialmedia_links?.scopus}
              Linkedin={hod?.socialmedia_links?.linkedin}
              firstTile={true}
              uid={hod?.unique_id ?? "hod"}
              profile={hod?.resume_pdf}
              isEdit={isEditing}
              teaching={true}
              onChange={(field, value, uid) => handleHodChange(field, value)}
            />

            {/* Faculty List + Replace */}
            <div className="absolute bottom-[10px] top-[28%] -right-[10%] xl:top-[50%] xl:left-[70%] transform -translate-x-1/2 -translate-y-1/2">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="hover:bg-secd bg-accn hover:text-text text-prim px-2 py-2 rounded-md" onClick={() => {
                  if (facultyPdfPath && facultyPdfPath.trim() !== "") {
                    const url = UrlParser(facultyPdfPath);
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  }
                }}>
                  Faculty List
                </button>

                {isEditing && (
                  <>
                    <input id="replace-faculty-pdf" type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFacultyPdfReplace} />
                    <label htmlFor="replace-faculty-pdf" className="px-2 py-2 bg-gray-200 rounded cursor-pointer">Replace</label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Teaching */}
          <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Faculty Members</h2>
          <div className={styles.gridContainer + " grid grid-cols-2 md:grid-cols-4"}>
            {teachingStaff.map((faculty, index) => (
              <ImageCard
                key={getId(faculty) ?? index}
                name={faculty?.name}
                photo={faculty?.image_path}
                Designation={faculty?.designation}
                Scholar={faculty?.socialmedia_links?.googlescholar}
                Research={faculty?.socialmedia_links?.researchgate}
                Orchid={faculty?.socialmedia_links?.orchidprofile}
                Publon={faculty?.socialmedia_links?.publonprofile}
                Scopus={faculty?.socialmedia_links?.scopus}
                Linkedin={faculty?.socialmedia_links?.linkedin}
                uid={getId(faculty)}
                profile={faculty?.resume_pdf}
                firstTile={false}
                isViewmore={true}
                teaching={true}
                isEdit={isEditing}
                selected={selectedIds.has(String(getId(faculty)))}
                onSelect={(uid) => toggleSelect(uid)}
                onChange={(field, value, uid) => handleFacultyChange("teaching", uid ?? getId(faculty), field, value)}
                onDelete={(uid) => openDeleteConfirm("teaching", uid ?? getId(faculty))}
              />
            ))}

            {isEditing && (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg mx-8 min-h-96 h-100 cursor-pointer" onClick={() => handleAddFaculty("teaching")}>
                + Add New Faculty
              </div>
            )}
          </div>

          {/* Non Teaching */}
          <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Non Teaching Staff</h2>
          <div className={`${styles.gridContainer} grid grid-cols-2 md:grid-cols-4 bg-black-100`}>
            {nonTeachingStaff.map((faculty, index) => (
              <ImageCard
                key={getId(faculty) ?? index}
                name={faculty?.name}
                photo={faculty?.image_path}
                Designation={faculty?.designation}
                Scholar={faculty?.socialmedia_links?.googlescholar}
                Research={faculty?.socialmedia_links?.researchgate}
                Orchid={faculty?.socialmedia_links?.orchidprofile}
                Publon={faculty?.socialmedia_links?.publonprofile}
                Scopus={faculty?.socialmedia_links?.scopus}
                Linkedin={faculty?.socialmedia_links?.linkedin}
                uid={getId(faculty)}
                profile={faculty?.resume_pdf}
                isViewmore={false}
                teaching={false}
                isEdit={isEditing}
                selected={selectedIds.has(String(getId(faculty)))}
                onSelect={(uid) => toggleSelect(uid)}
                onChange={(field, value, uid) => handleFacultyChange("nonTeaching", uid ?? getId(faculty), field, value)}
                onDelete={(uid) => openDeleteConfirm("nonTeaching", uid ?? getId(faculty))}
              />
            ))}

            {isEditing && (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg mx-8 min-h-96 h-100 cursor-pointer" onClick={() => handleAddFaculty("nonTeaching")}>
                + Add New Faculty
              </div>
            )}
          </div>
        </div>

        {/* Delete Selected button (visible only in edit mode and when there's a selection) */}
        <div className="my-4 flex justify-center">
          {isEditing && selectedIds && selectedIds.size > 0 && (
            <button
              onClick={openMultiDeleteConfirm}
              className="bg-red-500 bottom-0 text-prim flex rounded flex-row m-auto px-3 py-2 items-center gap-2"
              title="Delete selected faculty"
            >
              <Trash2 /> Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-row gap-2 mr-8 justify-end my-4">
          {isEditing ? (
            <>
              <button className="bg-gray-500 px-3 py-2 rounded text-prim" onClick={handleCancelSession}>Cancel</button>
              {/* Save visible only when sessionChanges exist */}
              {sessionChanges.length > 0 && (
                <button className="bg-secd hover:bg-brwn text-text hover:text-prim px-3 py-2 rounded-lg" onClick={handleSave}>Save</button>
              )}
            </>
          ) : (
            isSavedOnce && (
              <>
                <button className="bg-red-500 px-3 py-2 rounded text-prim" onClick={handleDiscardAll}>Discard All</button>
                <button className="bg-secd hover:bg-brwn  px-3 py-2 flex flex-row rounded text-text" onClick={handleRequest}><Send className="mr-2" /> Request</button>
              </>
            )
          )}
        </div>
      </div>

      {/* Multi-delete confirmation modal */}
      {multiDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1150]">
          <div className="bg-white p-6 rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete Selected</h3>
            <p className="text-sm mb-4">Are you sure you want to delete the following faculty from current session? This can be undone only before saving.</p>

            <div className="max-h-64 overflow-y-auto border p-2 rounded">
              {multiDeletePreview.map((p, idx) => (
                <div key={idx} className="flex justify-between border-b py-2">
                  <div>
                    <div className="font-medium text-sm">{p.item?.name || "(no name)"}</div>
                    <div className="text-xs text-gray-600">{p.section} — index {p.index}</div>
                  </div>
                  <div className="text-xs text-red-600">Will be deleted</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={cancelMultiDelete} className="px-4 py-2 rounded bg-gray-400 text-white">Cancel</button>
              <button onClick={confirmMultiDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete Selected</button>
            </div>
          </div>
        </div>
      )}

      {/* Request modal */}
      {showRequestModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
    <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2 text-center">Request</h2>

      <p className="text-sm text-red-500 mb-4 text-center">
        Note: Your changes will stay pending until approved by the superior admin. Once approved they will go live.
      </p>

      <div className="max-h-[320px] overflow-y-auto mb-4">
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 border">Action</th>
              <th className="py-2 px-3 border">Section</th>
              <th className="py-2 px-3 border">Changes</th>
              <th className="py-2 px-3 border">Undo</th>
            </tr>
          </thead>
          <tbody>
            {allChanges.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">No changes to submit</td>
              </tr>
            ) : (
              allChanges.map((change, idx) => (
                <tr key={idx} className="even:bg-white odd:bg-gray-50">
                  <td className="py-2 px-3 border text-center">
                    {change.action === "edit" ? (
                      <span className="text-blue-600">✎ Edited</span>
                    ) : change.action === "add" ? (
                      <span className="text-green-600">+ Added</span>
                    ) : (
                      <span className="text-red-600">🗑 Deleted</span>
                    )}
                  </td>

                  <td className="py-2 px-3 border text-center">{change.section}</td>

                  <td className="py-2 px-3 border text-[13px]">
                    {change.action === "delete" ? (
                      // if the push included deletedItem, try to show name
                      <div>{change.deletedItem?.name ?? "Item deleted"}</div>
                    ) : (change.changes && Object.keys(change.changes).length > 0) ? (
                      // list fields where old !== new
                      <div>
                        {Object.keys(change.changes)
                          .filter((f) => {
                            const c = change.changes[f];
                            // handle nested or missing old/new gracefully
                            return !(c?.old === c?.new);
                          })
                          .join(", ") || "Changed"}
                      </div>
                    ) : change.action === "add" ? (
                      <div>Added item</div>
                    ) : (
                      <div>Changed</div>
                    )}
                  </td>

                  <td className="py-2 px-3 border text-center">
                    <button className="text-red-500" onClick={() => handleUndoChange(idx)} title="Remove from request">
                      <X />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
          Cancel
        </button>
        <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-secd text-black hover:bg-brwn hover:text-prim">
          Final Request
        </button>
      </div>
    </div>

  </div>
)}

      {/* Delete confirmation (single) */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100]">
          <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm mb-4">Are you sure you want to delete this faculty from current session?</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 rounded bg-gray-400 text-white" onClick={cancelDelete}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} />
    </>
  );
}
