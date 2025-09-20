import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2 } from "lucide-react";

export default function HostelFacilities({ hostelData, addFlow = "inline" }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL ?? "";

  const UrlParser = (path) =>
    encodeURI(path?.startsWith("http") ? path : `${BASE_URL}${path || ""}`);

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

  useEffect(() => {
    if (!originalData) {
      setHasChanges(false);
      return;
    }
    const hasDataChanged =
      JSON.stringify(facilitiesData) !== JSON.stringify(originalData) ||
      (deletedFacilities && deletedFacilities.length > 0);
    setHasChanges(hasDataChanged);
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
    const updated = [...facilitiesData];
    updated[index] = {
      ...updated[index],
      image_path: URL.createObjectURL(file)
    };
    setFacilitiesData(updated);
    setHasChanges(true);
    toast.info("Image updated (unsaved)");
  };

  const confirmMultiDelete = () => {
    if (selectedItems.length === 0) {
      setShowMultiDeleteConfirm(false);
      return;
    }
    const deleted = facilitiesData.filter((f) => selectedItems.includes(f.id));
    const remaining = facilitiesData.filter((f) => !selectedItems.includes(f.id));
    setFacilitiesData(remaining);
    setDeletedFacilities((prev) => [...prev, ...deleted]);
    setSelectedItems([]);
    setShowMultiDeleteConfirm(false);
    setHasChanges(true);
    toast.info(`Deleted ${deleted.length} item(s) (unsaved)`);
  };

  const handleEdit = (index, field, value) => {
    const updated = [...facilitiesData];
    updated[index] = { ...updated[index], [field]: value };
    setFacilitiesData(updated);
    setHasChanges(true);
  };

  const computeChanges = (current, original, deletedList) => {
    const changesDetected = { modified: [], added: [], deleted: [] };
    if (!original) {
      (current || []).forEach((f) => changesDetected.added.push({id: f.id, title: f.title || "Untitled"}));
      return changesDetected;
    }

    current.forEach((facility) => {
      const isNew = !original.some((orig) => orig.id === facility.id);
      if (isNew) changesDetected.added.push({id: facility.id, title: facility.title || "Untitled"});
    });

    if (deletedList && deletedList.length > 0) {
      deletedList.forEach((f) => changesDetected.deleted.push({id: f.id, title: f.title || "Untitled"}));
    }

    current.forEach((facility) => {
      const orig = original.find((o) => o.id === facility.id);
      if (orig) {
        const titleChanged = facility.title !== orig.title;
        const descChanged = facility.description !== orig.description;
        const imageChanged = (facility.image_path || "") !== (orig.image_path || "");
        if (titleChanged || descChanged || imageChanged) {
          const parts = [];
          if (titleChanged) parts.push("title");
          if (descChanged) parts.push("description");
          if (imageChanged) parts.push("image");
          changesDetected.modified.push({
            id: facility.id,
            oldTitle: orig.title,
            newTitle: facility.title,
            changes: parts
          });
        }
      }
    });

    return changesDetected;
  };

  const getChanges = () => {
    const cur = changes && (changes.added.length > 0 || changes.deleted.length > 0 || changes.modified.length > 0) 
      ? changes 
      : computeChanges(facilitiesData, originalData, deletedFacilities);
    
    const out = [];
    
    (cur.added || []).forEach((item) => {
      out.push({ 
        action: "Added", 
        section: "Facilities", 
        data: { name: item.title || "Untitled", id: item.id },
        raw: `Added: "${item.title || "Untitled"}"`
      });
    });
    
    (cur.deleted || []).forEach((item) => {
      out.push({ 
        action: "Deleted", 
        section: "Facilities", 
        data: { name: item.title || "Untitled", id: item.id },
        raw: `Deleted: "${item.title || "Untitled"}"`
      });
    });
    
    (cur.modified || []).forEach((item) => {
      out.push({
        action: "Edited",
        section: "Facilities",
        data: { 
          oldName: item.oldTitle || "Untitled", 
          newName: item.newTitle || "Untitled", 
          id: item.id,
          changes: item.changes
        },
        raw: `Edited: "${item.oldTitle || "Untitled"}" → "${item.newTitle || "Untitled"}" (${item.changes.join(" & ")})`
      });
    });
    
    return out;
  };

  const handleRevertChange = (change) => {
    if (!change) return;
    
    if (change.action === "Added") {
      const id = change.data?.id;
      setFacilitiesData((prev) => prev.filter((f) => f.id !== id));
      toast.info(`Reverted add: ${change.data?.name}`);
    } else if (change.action === "Deleted") {
      const id = change.data?.id;
      const found = deletedFacilities.find((d) => d.id === id);
      if (found) {
        setFacilitiesData((prev) => [...prev, found]);
        setDeletedFacilities((prev) => prev.filter((d) => d.id !== id));
        toast.info(`Restored: ${change.data?.name}`);
      } else {
        toast.warn("Original deleted item not found to restore");
      }
    } else if (change.action === "Edited") {
      const id = change.data?.id;
      const found = originalData.find((d) => d.id === id);
      if (found) {
        setFacilitiesData((prev) => 
          prev.map((f) => f.id === id ? {...found} : f)
        );
        toast.info(`Reverted edit: ${change.data?.newName} → ${change.data?.oldName}`);
      } else {
        toast.warn("Unable to find original data to revert");
      }
    }
    
    // Recompute changes after revert
    const recomputed = computeChanges(facilitiesData, originalData, deletedFacilities);
    setChanges(recomputed);
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

  const handleSave = () => {
    const detected = computeChanges(facilitiesData, originalData, deletedFacilities);
    const hasReal =
      detected.modified.length > 0 || detected.added.length > 0 || detected.deleted.length > 0;
    if (!hasReal) {
      toast.info("No changes to save");
      return;
    }

    setOriginalData(JSON.parse(JSON.stringify(facilitiesData)));
    setChanges(detected);
    setChangesSaved(true);
    setDeletedFacilities([]);
    setHasChanges(false);
    setEditMode(false);
    setSelectedItems([]);
    toast.success("Changes saved (pending request)");
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

  const handleRequestConfirm = () => {
    console.log("Request sent:", { facilities: facilitiesData, changes });
    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
    setChangesSaved(false);
    setChanges({ modified: [], added: [], deleted: [] });
    setHasChanges(false);
    setDeletedFacilities([]);
    setSelectedItems([]);
    setEditMode(false);
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

  return (
    <>
      <div className="hos-facility">
        <div className="hos-top-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
          {!editMode && !isPageView && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
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
                      src={UrlParser(facility.image_path)}
                      alt={facility.title || "placeholder"}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </div>

                  <div className="hos-text-content">
                    {editMode && !isPageView ? (
                      <>
                        <div style={{ marginBottom: 5 , alignItems: "center" }}>
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
          <div className="hos-action-buttons flex gap-2 items-center mt-6 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>

            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
              >
                Save
              </button>
            )}
          </div>
          )}

        {!editMode && changesSaved && (
        <div className="hos-action-buttons flex gap-2 items-center mt-6 justify-end">
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
            Request
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

        {hasChanges && !editMode && (
          <div className="hos-page-view-button-container">
            {!isPageView ? (
              <button className="hos-page-view-btn" onClick={togglePageView}>
                save
              </button>
            ) : (
              <button className="hos-exit-page-view-btn-1" onClick={togglePageView}>
                Back To Edit
              </button>
            )}
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
              Are you sure you want to delete the selected item(s)?
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
                    <th className="py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change, idx) => (
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
                        {change.section || "Facilities"}
                      </td>

                      <td className="py-1 text-[12px]">
                        {change.action === "Added" && `Added: "${change.data?.name}"`}
                        {change.action === "Deleted" && `Deleted: "${change.data?.name}"`}
                        {change.action === "Edited" && `Edited: "${change.data?.oldName}" → "${change.data?.newName}"`}
                      </td>
                      
                      <td className="py-1">
                        <button
                          onClick={() => handleRevertChange(change)}
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                          title="Revert this change"
                        >
                          Revert
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