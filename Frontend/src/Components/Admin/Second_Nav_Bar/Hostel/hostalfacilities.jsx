import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Send, Trash2, X } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function HostelFacilities({ hostelData, addFlow = "inline" }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL ?? "";

const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loadedImages, setLoadedImages] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isPageView, setIsPageView] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [facilitiesData, setFacilitiesData] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  const [deletedFacilities, setDeletedFacilities] = useState([]);
  const [changes, setChanges] = useState({ modified: [], added: [], deleted: [] });
  const [changesSaved, setChangesSaved] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFacility, setNewFacility] = useState({
    title: "",
    description: "",
    image: null,
    imageURL: ""
  });
  const [tempId, setTempId] = useState(null);
  const { sendRequest, loading, error } = useAdminRequest();

  // Initialize when hostelData arrives
  useEffect(() => {
    if (hostelData) {
      const dataWithIds = hostelData.map((item, index) => ({
        ...item,
        id: item.id ?? index
      }));
      setFacilitiesData(dataWithIds);
      setOriginalData(JSON.parse(JSON.stringify(dataWithIds)));
      setInitialSnapshot(JSON.parse(JSON.stringify(dataWithIds)));
      setDeletedFacilities([]);
      setChanges({ modified: [], added: [], deleted: [] });
      setChangesSaved(false);
      setHasChanges(false);
      setSelectedItems([]);
      setShowAddModal(false);
      setNewFacility({ title: "", description: "", image: null, imageURL: "" });
      setTempId(null);
    }
  }, [hostelData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setExpandedId(null);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // HasChanges derived from original + deleted list
  useEffect(() => {
    if (!originalData) {
      setHasChanges(false);
      return;
    }
    const detected = computeChanges(facilitiesData, originalData, deletedFacilities);
    const changed = detected.added.length > 0 || detected.deleted.length > 0 || detected.modified.length > 0;
    setHasChanges(changed);
  }, [facilitiesData, originalData, deletedFacilities]);

  const handleExpand = (id) => {
    if (isMobile) setExpandedId(expandedId === id ? null : id);
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const openAddInlinePlaceholder = () => {
    const placeholder = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      image_path: "",
      __isTemp: true
    };
    setFacilitiesData((prev) => [...prev, placeholder]);
    setTempId(placeholder.id);
    setEditMode(true);
    setShowAddModal(false);
    setHasChanges(true);
    setNewFacility({ title: "", description: "", image: null, imageURL: "" });
  };

  const openAddModalWithPlaceholder = () => {
    if (showAddModal && tempId) return;
    const placeholder = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      image_path: "",
      __isTemp: true
    };
    setFacilitiesData((prev) => [...prev, placeholder]);
    setTempId(placeholder.id);
    setShowAddModal(true);
    setHasChanges(true);
    setNewFacility({ title: "", description: "", image: null, imageURL: "" });
  };

  const onClickAddNew = () => {
    if (addFlow === "modal") {
      openAddModalWithPlaceholder();
    } else {
      openAddInlinePlaceholder();
    }
  };

  const handleNewFacilityChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setNewFacility((p) => ({ ...p, image: file, imageURL: URL.createObjectURL(file) }));
    } else {
      setNewFacility((p) => ({ ...p, [name]: value }));
    }
  };

  const confirmAddFacility = () => {
    if (!newFacility.title.trim() || !newFacility.description.trim()) {
      toast.error("Please fill title & description");
      return;
    }

    const idx = facilitiesData.findIndex((f) => f.id === tempId);
    if (idx === -1) {
      const newItem = {
        id: Date.now(),
        title: newFacility.title.trim(),
        description: newFacility.description.trim(),
        image_path: newFacility.imageURL || ""
      };
      setFacilitiesData((prev) => [...prev, newItem]);
    } else {
      const updated = [...facilitiesData];
      updated[idx] = {
        id: tempId,
        title: newFacility.title.trim(),
        description: newFacility.description.trim(),
        image_path: newFacility.imageURL || ""
      };
      setFacilitiesData(updated);
    }

    setTempId(null);
    setShowAddModal(false);
    setNewFacility({ title: "", description: "", image: null, imageURL: "" });
    toast.success("Added new facility (unsaved)");
  };

  const cancelAddModal = () => {
    if (tempId) {
      setFacilitiesData((prev) => prev.filter((f) => f.id !== tempId));
    }
    setTempId(null);
    setShowAddModal(false);
    setNewFacility({ title: "", description: "", image: null, imageURL: "" });
    toast.info("Add cancelled");
  };

  const handleToggleSelect = (id) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

const handleImageChange = (index, file) => {
  if (!file) return;

  setFacilitiesData(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      image_path: URL.createObjectURL(file), // UI preview
      imageFile: file,                       // 🔥 REAL FILE
    };
    return updated;
  });
};

const confirmMultiDelete = () => {
  if (selectedItems.length === 0) {
    setShowMultiDeleteConfirm(false);
    return;
  }

  // Items the user selected to delete
  const deleted = facilitiesData.filter((f) => selectedItems.includes(f.id));
  // Remaining items after deletion
  const remaining = facilitiesData.filter((f) => !selectedItems.includes(f.id));

  // Only keep *non-temp* records for deletedFacilities (temp -> ignore)
  const actuallyDeleted = deleted.filter(
    (d) => !(d && (d.__isTemp === true || (typeof d.id === "string" && d.id.startsWith("temp-"))))
  );

  // Update UI immediately
  setFacilitiesData(remaining);

  // If there are real items to mark deleted, add them to deletedFacilities
  if (actuallyDeleted.length > 0) {
    const newDeletedFacilities = [...deletedFacilities, ...actuallyDeleted];
    setDeletedFacilities(newDeletedFacilities);

    // recompute hasChanges using the new state (we use local vars to compute synchronously)
    const detected = computeChanges(remaining, originalData, newDeletedFacilities);
    const hasRealChanges =
      detected.added.length > 0 || detected.modified.length > 0 || detected.deleted.length > 0;
    setHasChanges(hasRealChanges);

    toast.info(`Deleted ${actuallyDeleted.length} item(s) (unsaved)`);
  } else {
    // nothing real got marked deleted (it was just a temp placeholder)
    const detected = computeChanges(remaining, originalData, deletedFacilities);
    const hasRealChanges =
      detected.added.length > 0 || detected.modified.length > 0 || detected.deleted.length > 0;
    setHasChanges(hasRealChanges);

    toast.info(`Removed ${deleted.length} temporary item(s)`);
  }

  setSelectedItems([]);
  setShowMultiDeleteConfirm(false);
};


  const handleEdit = (index, field, value) => {
    const updated = [...facilitiesData];
    updated[index] = { ...updated[index], [field]: value };
    setFacilitiesData(updated);
    setHasChanges(true);
  };

  // computeChanges: returns object with added/modified/deleted arrays
const computeChanges = (current = [], original = [], deletedList = []) => {
  const changesDetected = { modified: [], added: [], deleted: [] };

  const origById = {};
  (original || []).forEach((o) => (origById[o.id] = o));

  // Deleted: only include deletions of items that were present on server (ignore temp placeholders)
  (deletedList || []).forEach((d) => {
    // skip temp placeholders
    if (d && (d.__isTemp === true || (typeof d.id === "string" && d.id.startsWith("temp-")))) {
      return;
    }
    changesDetected.deleted.push({ id: d.id, title: d.title || "Untitled" });
  });

  // Added: any current item not present in original (by id) OR items explicitly marked __isTemp
  (current || []).forEach((f) => {
    const existsInOriginal = !!origById[f.id];
    if (!existsInOriginal || f.__isTemp) {
      changesDetected.added.push({ id: f.id, title: f.title || "Untitled" });
    }
  });

  // Modified: items that are in both current & original but with differences
  (current || []).forEach((f) => {
    const orig = origById[f.id];
    if (orig) {
      const titleChanged = (f.title || "") !== (orig.title || "");
      const descChanged = (f.description || "") !== (orig.description || "");
      const imageChanged = (f.image_path || "") !== (orig.image_path || "");
      if (titleChanged || descChanged || imageChanged) {
        const parts = [];
        if (titleChanged) parts.push("title");
        if (descChanged) parts.push("description");
        if (imageChanged) parts.push("image");
        changesDetected.modified.push({
          id: f.id,
          oldTitle: orig.title || "Untitled",
          newTitle: f.title || "Untitled",
          changes: parts
        });
      }
    }
  });

  return changesDetected;
};


  // returns list of rows for popup in required format
  const buildChangeRows = () => {
    const cur = computeChanges(facilitiesData, originalData, deletedFacilities);

    const out = [];

    (cur.added || []).forEach((item) => {
      out.push({
        action: "Added",
        section: "Hostel Facilities",
        changesText: ` ${item.title || "Untitled"}`,
        data: { id: item.id, name: item.title || "Untitled" }
      });
    });

    (cur.deleted || []).forEach((item) => {
      out.push({
        action: "Deleted",
        section: "Hostel Facilities",
        changesText: `${item.title || "Untitled"}`,
        data: { id: item.id, name: item.title || "Untitled" }
      });
    });

    (cur.modified || []).forEach((item) => {
      out.push({
        action: "Edited",
        section: "Hostel Facilities",
        changesText: `${item.oldTitle || "Untitled"}`,
        data: {
          id: item.id,
          oldName: item.oldTitle || "Untitled",
          newName: item.newTitle || "Untitled",
          changes: item.changes
        }
      });
    });

    return out;
  };

  // Revert a change row (Added / Deleted / Edited)
  const handleRevertChange = (changeRow) => {
    if (!changeRow) return;
    const { action, data } = changeRow;

    if (action === "Added") {
      // remove the added item from current
      const newFacilities = facilitiesData.filter((f) => f.id !== data.id);
      setFacilitiesData(newFacilities);
      // recompute changes with the new current & existing original/deleted
      const recomputed = computeChanges(newFacilities, originalData, deletedFacilities);
      setChanges(recomputed);
      toast.info(`Reverted add: ${data.name}`);
    } else if (action === "Deleted") {
      // restore deleted item from deletedFacilities
      const found = deletedFacilities.find((d) => d.id === data.id);
      if (found) {
        // ensure we don't duplicate if already present
        const already = facilitiesData.some((f) => f.id === found.id);
        const newFacilities = already ? [...facilitiesData] : [...facilitiesData, found];
        const newDeleted = deletedFacilities.filter((d) => d.id !== found.id);
        setFacilitiesData(newFacilities);
        setDeletedFacilities(newDeleted);
        const recomputed = computeChanges(newFacilities, originalData, newDeleted);
        setChanges(recomputed);
        toast.info(`Restored: ${data.name}`);
      } else {
        toast.warn("Original deleted item not found to restore");
      }
    } else if (action === "Edited") {
      // revert modified item to originalData version
      const orig = (originalData || []).find((d) => d.id === data.id);
      if (orig) {
        const newFacilities = facilitiesData.map((f) => (f.id === data.id ? { ...orig } : f));
        setFacilitiesData(newFacilities);
        const recomputed = computeChanges(newFacilities, originalData, deletedFacilities);
        setChanges(recomputed);
        toast.info(`Reverted edit: ${data.newName} → ${data.oldName}`);
      } else {
        toast.warn("Unable to find original data to revert");
      }
    }
  };

  const analyzeChanges = () => {
    const detected = computeChanges(facilitiesData, originalData, deletedFacilities);
    const hasReal =
      detected.modified.length > 0 || detected.added.length > 0 || detected.deleted.length > 0;
    if (hasReal) {
      setChanges(detected);
      setShowRequestModal(true);
    } else {
      toast.info("No changes detected");
    }
  };

  // returns { ok: boolean, missing: Array<{id, missingFields: string[]}> }
const validateChangesBeforeSave = () => {
  const detected = computeChanges(facilitiesData, originalData, deletedFacilities);
  const problems = [];

  // helper to check a facility object
  const check = (fac) => {
    const missing = [];
    if (!fac.title || !fac.title.toString().trim()) missing.push("title");
    if (!fac.description || !fac.description.toString().trim()) missing.push("description");
    // require image for new/changed items — remove image check if not required
    if (!fac.image_path || fac.image_path.toString().trim() === "") missing.push("image");
    return missing;
  };

  // check added items
  (detected.added || []).forEach((a) => {
    const f = facilitiesData.find((x) => x.id === a.id);
    if (!f) return;
    const missing = check(f);
    if (missing.length) problems.push({ id: f.id, missingFields: missing });
  });

  // check modified items — ensure we check the current item
  (detected.modified || []).forEach((m) => {
    const f = facilitiesData.find((x) => x.id === m.id);
    if (!f) return;
    const missing = check(f);
    if (missing.length) problems.push({ id: f.id, missingFields: missing });
  });

  return { ok: problems.length === 0, missing: problems };
};

// optional: compute array of invalid ids to use in the render for red borders
const invalidIds = (() => {
  const res = validateChangesBeforeSave();
  return res.missing.map((p) => p.id);
})();


  // Save = create a draft snapshot of changes but DO NOT overwrite originalData
  const handleSave = () => {
    const detected = computeChanges(facilitiesData, originalData, deletedFacilities);
    const hasReal =
      detected.modified.length > 0 || detected.added.length > 0 || detected.deleted.length > 0;
    if (!hasReal) {
      toast.info("No changes to save");
      return;
    }

    // Keep originalData intact so computeChanges can still detect differences
    setChanges(detected);
    setChangesSaved(true);

    // Do NOT clear deletedFacilities here — we need them for Request popup
    setHasChanges(false);
    setEditMode(false);
    setSelectedItems([]);
    toast.success("Changes saved (pending request)");
  };

const findFileFromBlobURL = (blobUrl) => {
  // Only works if you still have access to file objects
  // Recommended improvement: store File along with image_path when uploading
  return null;
};

  // Final Request = simulate sending request and APPLY the changes (update originalData)
const handleRequestConfirm = async () => {
  const detected = computeChanges(facilitiesData, originalData, deletedFacilities);

  const payloads = [];
  const files = [];

  const buildImagePath = (facility) =>
    facility.imageFile
      ? `/static/images/hostel/${Date.now()}_${facility.imageFile.name}`
      : facility.image_path || "";

  // ---------- INSERT ----------
  detected.added.forEach(item => {
    const facility = facilitiesData.find(f => f.id === item.id);
    if (!facility) return;

    const imagePath = buildImagePath(facility);

    payloads.push({
      action: "insert",
      collectionName: "hostel_details",
      collection_type: "hostel_facilities",
      category: null,
      title: "Insert Hostel Facilities",
      meta_data: {
        title: facility.title,
        description: facility.description,
        image_path: imagePath,
      },
    });

    if (facility.imageFile) {
      files.push(facility.imageFile); // ✅ REAL FILE
    }
  });

  // ---------- UPDATE (SEND FULL DATA) ----------
  detected.modified.forEach(item => {
    const current = facilitiesData.find(f => f.id === item.id);
    const original = originalData.find(o => o.id === item.id);
    if (!current || !original) return;

    const imagePath =
      current.imageFile
        ? `/static/images/hostel/${Date.now()}_${current.imageFile.name}`
        : original.image_path;

    payloads.push({
      action: "update",
      collectionName: "hostel_details",
      collection_type: "hostel_facilities",
      category: null,
      title: "Update Hostel Facilities",
      original_data: {
        title: original.title,
        description: original.description,
        image_path: original.image_path,
      },
      meta_data: {
        title: current.title,
        description: current.description,
        image_path: imagePath,
      },
    });

    if (current.imageFile) {
      files.push(current.imageFile);
    }
  });

  // ---------- DELETE ----------
// ---------- DELETE ----------
detected.deleted.forEach(item => {
  const original = originalData.find(o => o.id === item.id);
  if (!original) return;

  // 🔥 NORMALIZE image_path (array → string)
  const imagePath = Array.isArray(original.image_path)
    ? original.image_path[original.image_path.length - 1] // take latest
    : original.image_path;

  payloads.push({
    action: "delete",
    collectionName: "hostel_details",
    collection_type: "hostel_facilities",
    category: null,
    title: "Delete Hostel Facilities",
    meta_data: {
      title: original.title,
      description: original.description,
      image_path: imagePath, // ✅ ALWAYS STRING
    },
  });
});


  if (payloads.length === 0) {
    toast.info("No changes to submit");
    return;
  }
console.log("files",files);
  // 🔥 SINGLE REQUEST (FILES + PAYLOADS)
  await sendRequest(payloads, files);

  toast.success("Request submitted successfully!");

  setShowRequestModal(false);
  setChangesSaved(false);
  setChanges({ modified: [], added: [], deleted: [] });
  setDeletedFacilities([]);
  setSelectedItems([]);
  setEditMode(false);
};



  const handleDiscardAll = () => {
    if (!initialSnapshot) return;
    setFacilitiesData(JSON.parse(JSON.stringify(initialSnapshot)));
    setOriginalData(JSON.parse(JSON.stringify(initialSnapshot)));
    setDeletedFacilities([]);
    setChanges({ modified: [], added: [], deleted: [] });
    setHasChanges(false);
    setChangesSaved(false);
    setEditMode(false);
    setSelectedItems([]);
    setShowAddModal(false);
    setNewFacility({ title: "", description: "", image: null, imageURL: "" });
    setTempId(null);
    toast.info("All saved changes discarded");
  };

  const cancelUnsavedChanges = () => {
    if (!originalData) return;
    setFacilitiesData(JSON.parse(JSON.stringify(originalData)));
    setDeletedFacilities([]);
    setChanges({ modified: [], added: [], deleted: [] });
    setHasChanges(false);
    setEditMode(false);
    setSelectedItems([]);
    setShowAddModal(false);
    setNewFacility({ title: "", description: "", image: null, imageURL: "" });
    setTempId(null);
    toast.info("Recent unsaved changes reverted");
  };

  const handleCancel = () => {
    if (changesSaved) {
      setEditMode(false);
      setHasChanges(false);
      toast.info("Edit cancelled — saved changes remain pending");
    } else {
      cancelUnsavedChanges();
    }
  };

  const togglePageView = () => {
    setIsPageView(!isPageView);
    if (isPageView) setEditMode(true);
    else setEditMode(false);
  };

  if (!facilitiesData) {
    return (
      <>
        <div className="hos-loading-container">
          <LoadComp />
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </>
    );
  }

  const changeRows = buildChangeRows();

  return (
    <>
      <div className="hos-facility">
        <div className="hos-top-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
          {!editMode && !isPageView && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim mr-9"
              onClick={() => {
                setEditMode(true);
                setIsPageView(false);
              }}
              title="Edit"
            >
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>

        <motion.h2
          className="hos-hostel-head"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Facilities
        </motion.h2>

        <div className="hos-facilities-wrapper">
          <motion.div className="hos-hostal-fac-container">
            {facilitiesData?.map((facility, index) => {
              const isPlaceholder = facility.__isTemp === true;
              return (
                <motion.div
                  key={facility.id ?? index}
                  className={`hos-hostel-fac-item ${
                    isMobile && expandedId === index ? "hos-expanded" : ""
                  } ${isPlaceholder ? "hos-placeholder-card" : ""}`}
                >
                  <div
                    className="hos-image-container"
                    onClick={() => handleExpand(index)}
                    style={{ position: "relative" }}
                  >
                    {editMode && (
                      <label
                        className="hos-select-checkbox"
                        title="Select for delete"
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 20,
                          background: "transparent"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(facility.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(facility.id);
                          }}
                        />
                      </label>
                    )}

                    <div
                      className="hos-loading-placeholder"
                      style={{ opacity: loadedImages[index] ? 0 : 1 }}
                    />
                    <img
                      className="hos-facility-image"
                      src={facility.image_path?.startsWith("blob:")? facility.image_path: UrlParser(facility.image_path)}
                      alt={facility.title || "placeholder"}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </div>

                  <div className="hos-text-content">
                    {editMode && !isPageView ? (
                      <>
                        <div style={{ marginBottom: 5, alignItems: "center" }}>
                          <div className="flex justify-center">
                            <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer inline-block">
                              {facility.image_path ? "Replace" : "Upload"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageChange(index, e.target.files ? e.target.files[0] : null)
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={facility.title}
                          onChange={(e) => handleEdit(index, "title", e.target.value)}
                          className="hos-edit-input"
                          style={{ border: "1px solid #e5e7eb", padding: "10px", borderRadius: 6 }}
                        />
                        <textarea
                          value={facility.description}
                          onChange={(e) => handleEdit(index, "description", e.target.value)}
                          className="hos-edit-textarea"
                        />
                      </>
                    ) : (
                      <>
                        <h2>{facility.title}</h2>
                        <p>{facility.description}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {editMode && (
              <div
                className="hos-hostel-fac-item hos-add-box"
                onClick={onClickAddNew}
                style={{ cursor: "pointer" }}
              >
                <div className="hos-plus-icon">+</div>
                <p>Add New</p>
              </div>
            )}
          </motion.div>
        </div>

        {editMode && (
          <div className="hos-action-buttons flex gap-2 items-center mt-6 justify-end mr-9">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>

            {hasChanges && (
  <button
    onClick={() => {
      const validation = validateChangesBeforeSave();
      if (!validation.ok) {
        toast.error("Please fill title, description and upload image for changed items");
        return;
      }
      handleSave();
    }}
    // disabled={!hasChanges || !validateChangesBeforeSave().ok}
    className={`flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim ${(!hasChanges || !validateChangesBeforeSave().ok) ? "opacity-60 cursor-not-allowed" : ""}`}
  >
    Save
  </button>
)}

          </div>
        )}

        {!editMode && changesSaved && (
          <div className="hos-action-buttons flex gap-2 items-center mt-6 justify-end mr-9">
            <button
              onClick={handleDiscardAll}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Discard Changes
            </button>
            <button
              onClick={() => {
                const computed = computeChanges(facilitiesData, originalData, deletedFacilities);
                setChanges(computed);
                setShowRequestModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={16}/>Request
            </button>
          </div>
        )}

        {editMode && selectedItems.length > 0 && (
          <div className="hos-delete-action flex justify-center mt-6">
            <button
              onClick={() => setShowMultiDeleteConfirm(true)}
              className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete ({selectedItems.length})
            </button>
          </div>
        )}
      </div>

      {showAddModal && addFlow === "modal" && (
        <div className="hos-modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
          <div className="hos-modal bg-white rounded-lg p-6 w-[560px]">
            <h3 className="text-lg font-semibold mb-3">Add Facility</h3>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: "100%",
                    height: 160,
                    borderRadius: 8,
                    border: "1px dashed #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  {newFacility.imageURL ? (
                    <img
                      src={newFacility.imageURL}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#6b7280" }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>+</div>
                      <div style={{ marginTop: 6 }}>Image preview</div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 10 }}>
                  <label className="bg-[#fdcc03] text-white px-3 py-1 rounded cursor-pointer inline-block">
                    {newFacility.image ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleNewFacilityChange}
                      name="image"
                    />
                  </label>
                </div>
              </div>

              <div style={{ flex: 1.6 }}>
                <input
                  name="title"
                  placeholder="Title"
                  value={newFacility.title}
                  onChange={handleNewFacilityChange}
                  className="hos-edit-input"
                  style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={newFacility.description}
                  onChange={handleNewFacilityChange}
                  className="hos-edit-textarea"
                  style={{ width: "100%", minHeight: 120, padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button
                onClick={cancelAddModal}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddFacility}
                className="px-4 py-2 rounded bg-[#fdcc03] text-black"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected item?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowMultiDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmMultiDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved will go live.
            </p>

            <div className="max-h-[250px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                    <th className="py-1">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3">No changes detected</td>
                    </tr>
                  )}
                  {changeRows.map((change, idx) => (
                    <tr key={idx} className="border-t">
                      <td
                        className={`py-1 ${
                          change.action === "Added"
                            ? "text-green-600"
                            : change.action === "Deleted"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {change.action}
                      </td>

                      <td className="py-1">
                        {change.section}
                      </td>

                      <td className="py-1 text-[12px]">
                        {change.changesText}
                      </td>
                      
                      <td className="py-1">
                        <button
                          onClick={() => handleRevertChange(change)}
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                          title="Revert this change"
                        >
                        <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}
