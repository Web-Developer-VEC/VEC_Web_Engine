import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPlacementTeam.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Trash2 } from "react-feather";
import { Pencil, Send, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

function PersonDetail({ person, isEditable, onChange, errors = {} }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  if (!person) return null;

  const hasImage = !!(person.image_path || person.photo_file);
  const imageSrc =
    person.preview_url ||
    (person.image_path ? UrlParser(person.image_path) : "");

  return (
    <div
      className={`person-detail left dark:bg-drkts new-card-wrap`}
      style={{ position: "relative" }}
    >
      <div className="person-image-wrap new-image-wrap">
        <img src={imageSrc} alt={person?.name} className="person-image" />
        {isEditable && (
          <div className="new-upload-below">
            <label className={`new-upload-label ${!hasImage && !person?.image_path && !person?.photo_file ? 'border-2 border-red-500' : ''} bg-blue-500 text-white px-3 py-1 rounded cursor-pointer`}>
              {hasImage ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onChange("photo_file", e.target.files[0])}
              />
            </label>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>
        )}
      </div>

      <div className="person-content" style={{ width: '100%' }}>
        {isEditable ? (
          <>
            <div style={{ width: '100%', marginBottom: '15px' }}>
              <input
                className={`person-input ${errors.name ? 'border-red-500' : ''}`}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                value={person.name || ""}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Name *"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div style={{ width: '100%', marginBottom: '15px' }}>
              <input
                className={`person-input ${errors.designation ? 'border-red-500' : ''}`}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                value={person.designation || ""}
                onChange={(e) => onChange("designation", e.target.value)}
                placeholder="Designation *"
              />
              {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
            </div>
            <div style={{ width: '100%' }}>
              <textarea
                className={`person-textarea ${errors.content ? 'border-red-500' : ''}`}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                rows={9}
                value={person.content || ""}
                onChange={(e) => onChange("content", e.target.value)}
                placeholder="Description / Content *"
              />
              {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
            </div>
          </>
        ) : (
          <>
            <h3 className="placement-head">{person?.name}</h3>
            <p className="text-accn dark:text-drka text-[24px]">
              {person?.designation}
            </p>
            <p>{person?.content}</p>
          </>
        )}
      </div>
    </div>
  );
}

function PersonMemberDetail({
  person,
  isImageLeft,
  isEditable,
  onChange,
  checked,
  onCheck,
  errors = {},
  index
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  const hasImage = !!(person.image_path || person.photo_file);
  const { sendRequest, loading, error } = useAdminRequest();
  const imageSrc =
    person.preview_url ||
    (person.image_path ? UrlParser(person.image_path) : "");
    
  return (
    <div
      className={`person-detail ${isImageLeft ? "left" : "right"} dark:bg-drkts new-card-wrap`}
      style={{ position: "relative" }}
    >
      {isEditable && (
        <input
          type="checkbox"
          className="new-top-checkbox"
          checked={!!checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label={`select ${person?.name || "member"}`}
        />
      )}

      <div className="new-image-wrap">
        <img src={imageSrc} alt={person?.name} className="person-image" />
        {isEditable && (
          <div className="new-upload-below">
            <label className={`new-upload-label ${!hasImage && !person?.image_path && !person?.photo_file ? 'border-2 border-red-500' : ''} bg-blue-500 text-white px-3 py-1 rounded cursor-pointer`}>
              {hasImage ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onChange("photo_file", e.target.files[0])}
              />
            </label>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>
        )}
      </div>

      <div className="person-content-mem">
        {isEditable ? (
          <>
            <div className="flex items-center justify-between">
              <input
                className={`w-[100%] p-1 rounded border ${errors.name ? 'border-red-500' : ''}`}
                value={person.name || ""}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Name *"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            <input
              className={`w-full mt-2 p-1 rounded border ${errors.designation ? 'border-red-500' : ''}`}
              value={person.designation || ""}
              onChange={(e) => onChange("designation", e.target.value)}
              placeholder="Designation *"
            />
            {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
          </>
        ) : (
          <>
            <h3 className="placement-member-head">{person?.name}</h3>
            <p className="text-accn dark:text-drka ">{person?.designation}</p>
          </>
        )}
      </div>
    </div>
  );
}

export const AdminPlacementTeam = ({ toggle, theme }) => {
  // saved (server) version:
  const [placementTeam, setPlacementTeam] = useState([]);
  // current in-editor draft (when editMode true):
  const [draftTeam, setDraftTeam] = useState([]);
  // saved-by-user draft that is pending approval (when user clicks Save)
  const [pendingDraft, setPendingDraft] = useState(null);

  // snapshot of the draft when entering edit mode — used so Cancel reverts only session edits
  const [initialDraft, setInitialDraft] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false); // true when pendingDraft exists
  const [selectedItems, setSelectedItems] = useState([]); // indexes of selected members in draftTeam.slice(1)
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { sendRequest, loading, error } = useAdminRequest();
  const navigate = useNavigate();

  // returns whether the draft differs from saved placementTeam (unsaved edits vs server)
  const hasServerDiff = (d = draftTeam) =>
    JSON.stringify(placementTeam) !== JSON.stringify(d);

  // returns whether the draft differs from initialDraft (i.e., session unsaved changes)
  const hasSessionChanges = () => {
    if (!initialDraft) return false;
    return JSON.stringify(initialDraft) !== JSON.stringify(draftTeam);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/placement`, {
          type: "placement_team",
        });
        const data = response.data.data || [];
        const withUID = data.map((x) => ({
          ...x,
          _uid: x._uid || genUID(),
        }));

        setPlacementTeam(withUID);
        setDraftTeam(withUID.map((x) => ({ ...x })));
        setPendingDraft(null);
        setPendingChanges(false);
        setInitialDraft(null);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error?.message);
        if (error?.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error?.response?.data?.message },
          });
        }
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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

  // Validation function
  const validateTeam = (team) => {
    const errors = {};
    
    team.forEach((member, index) => {
      if (!errors[index]) errors[index] = {};
      
      // Check required fields
      if (!member.name || member.name.trim() === '') {
        errors[index].name = 'Name is required';
      }
      
      if (!member.designation || member.designation.trim() === '') {
        errors[index].designation = 'Designation is required';
      }
      
      // For main person (index 0), check content
      if (index === 0 && (!member.content || member.content.trim() === '')) {
        errors[index].content = 'Description is required';
      }
      
      // Check if image exists
      const hasImage = member.image_path || member.photo_file;
      if (!hasImage) {
        errors[index].image = 'Image is required';
      }
    });
    
    return errors;
  };

  const isValidTeam = (team) => {
    const errors = validateTeam(team);
    return Object.keys(errors).length === 0;
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }
  
  const buildPlacementPayload = ({ action, newData, oldData }) => {
    // 🟢 INSERT
    if (action === "Added") {
      return {
        action: "insert",
        collectionName: "placement",
        title: "placement_team_insert",
        collection_type: "placement_team",
        meta_data: {
          name: newData.name,
          designation: newData.designation,
          qualification: newData.qualification || "",
          photo_path: newData.image_path || "", // backend will replace if file sent
        },
      };
    }

    // 🔵 UPDATE
    if (action === "Edited") {
      return {
        action: "update",
        collectionName: "placement",
        title: "placement_team_update",
        collection_type: "placement_team",
        original_data: {
          name: oldData?.name, // identifier
        },
        meta_data: {
          name: newData.name,
          designation: newData.designation,
          qualification: newData.qualification || "",
          photo_path: newData.image_path || "",
        },
      };
    }

    // 🔴 DELETE
    if (action === "Deleted") {
      return {
        action: "delete",
        collectionName: "placement",
        title: "placement_team_delete",
        collection_type: "placement_team",
        meta_data: {
          name: oldData?.name,
        },
      };
    }

    return null;
  };
  
  const collectPlacementFiles = (draft) => {
    const files = [];

    draft.forEach((member, index) => {
      if (member?.photo_file instanceof File) {
        files.push({
          key: `placement_image_${index}`,
          file: member.photo_file,
        });
      }
    });

    return files;
  };

  // ---------- Editable handlers ----------
  const enterEdit = () => {
    setEditMode(true);
    // choose base: pendingDraft (if user previously saved) else placementTeam
    const base = pendingDraft ? pendingDraft : placementTeam;
    const snapshot = (base || []).map((x) => ({ ...x }));
    setInitialDraft(snapshot); // snapshot of state at edit-session start
    setDraftTeam(snapshot.map((x) => ({ ...x })));
    setValidationErrors({});
  };

  const exitEdit = () => {
    // revert unsaved edits only — now we revert to initialDraft (session start)
    if (initialDraft) {
      setDraftTeam(initialDraft.map((x) => ({ ...x })));
    } else {
      setDraftTeam((placementTeam || []).map((x) => ({ ...x })));
    }
    setSelectedItems([]);
    setEditMode(false);
    setInitialDraft(null);
    setValidationErrors({});
  };

  const handleFieldChange = (idx, field, value) => {
    setDraftTeam((prev) => {
      const copy = prev.map((x) => ({ ...x }));
      if (!copy[idx]) copy[idx] = {};

      if (field === "photo_file") {
        copy[idx].photo_file = value;

        // create preview blob url
        if (value) {
          copy[idx].preview_url = URL.createObjectURL(value);
        }
      } else {
        copy[idx][field] = value;
      }

      return copy;
    });

    // Clear validation error for this field when user starts typing/uploading
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[idx] && newErrors[idx][field]) {
        delete newErrors[idx][field];
        
        // If no errors left for this index, remove the index entirely
        if (Object.keys(newErrors[idx]).length === 0) {
          delete newErrors[idx];
        }
      }
      return newErrors;
    });
  };

  const handleSave = () => {
    // Validate all fields before saving
    const errors = validateTeam(draftTeam);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }
    
    setPendingDraft(draftTeam.map((x) => ({ ...x })));
    setPendingChanges(true);
    setEditMode(false);
    setSelectedItems([]);
    setInitialDraft(null);
    setValidationErrors({});
    toast.success("Draft saved successfully");
  };

  const handleDiscardAll = () => {
    setPendingDraft(null);
    setDraftTeam((placementTeam || []).map((x) => ({ ...x })));
    setPendingChanges(false);
    setEditMode(false);
    setInitialDraft(null);
    setValidationErrors({});
    toast.error("All changes discarded.");
  };

  const handleCancel = () => {
    if (hasSessionChanges()) {
      setDraftTeam(initialDraft.map((x) => ({ ...x })));
      setEditMode(false);
      setSelectedItems([]);
      setInitialDraft(null);
    } else {
      setEditMode(false);
      setInitialDraft(null);
    }
    setValidationErrors({});
  };
  
  const genUID = () =>
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  const toggleSelectItem = (memberIndex, checked) => {
    setSelectedItems((prev) => {
      const copy = new Set(prev);
      if (checked) copy.add(memberIndex);
      else copy.delete(memberIndex);
      return Array.from(copy);
    });
  };

  const confirmMultiDelete = () => {
    setShowMultiDeleteConfirm(false);
    // selectedItems correspond to indexes inside draftTeam.slice(1)
    setDraftTeam((prev) =>
      prev.filter((_, idx) => !(idx >= 1 && selectedItems.includes(idx - 1))),
    );
    setSelectedItems([]);
  };

  // Add a new blank member at the end
  const handleAddNewMember = () => {
    setDraftTeam((prev) => [
      ...prev,
      {
        _uid: genUID(),
        name: "",
        designation: "",
        image_path: "",
        content: "",
      },
    ]);
  };

  const getChanges = (baseDraft = pendingDraft) => {
    const changes = [];

    const origMap = new Map();
    const draftMap = new Map();

    (placementTeam || []).forEach((item, index) => {
      origMap.set(item._uid, { item, index });
    });

    (baseDraft || []).forEach((item, index) => {
      draftMap.set(item._uid, { item, index });
    });

    // 🔴 Deleted
    origMap.forEach(({ item, index }, uid) => {
      if (!draftMap.has(uid)) {
        changes.push({
          action: "Deleted",
          section: "Placement Team",
          data: item,
          index,
        });
      }
    });

    // 🟢 Added
    draftMap.forEach(({ item, index }, uid) => {
      if (!origMap.has(uid)) {
        changes.push({
          action: "Added",
          section: "Placement Team",
          data: item,
          index,
        });
      }
    });

    // 🔵 Edited
    draftMap.forEach(({ item, index }, uid) => {
      if (origMap.has(uid)) {
        const originalItem = origMap.get(uid).item;
        if (JSON.stringify(originalItem) !== JSON.stringify(item)) {
          changes.push({
            action: "Edited",
            section: "Placement Team",
            data: item,
            index,
          });
        }
      }
    });

    return changes;
  };

  const handleRevertChange = (change) => {
    setPendingDraft((prevPending) => {
      const working = (prevPending || []).map((x) => ({ ...x }));
      if (!prevPending) {
        setDraftTeam((prev) => {
          const copy = prev.map((x) => ({ ...x }));
          if (change.action === "Added") {
            copy.splice(change.index, 1);
            return copy;
          } else if (change.action === "Edited") {
            copy[change.index] = { ...(placementTeam[change.index] || {}) };
            return copy;
          } else if (change.action === "Deleted") {
            copy.splice(change.index, 0, placementTeam[change.index] || {});
            return copy;
          }
          return prev;
        });
        return null;
      }

      if (change.action === "Added") {
        working.splice(change.index, 1);
      } else if (change.action === "Edited") {
        working[change.index] = { ...(placementTeam[change.index] || {}) };
      } else if (change.action === "Deleted") {
        working.splice(change.index, 0, {
          ...(placementTeam[change.index] || {}),
        });
      }
      setDraftTeam(working.map((x) => ({ ...x })));
      return working;
    });
  };

  const handleFinalRequestConfirm = async () => {
    // Validate all fields before final request
    if (pendingDraft) {
      const errors = validateTeam(pendingDraft);
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error("Please fill in all required fields before submitting request");
        setShowRequestModal(false);
        return;
      }
    }
    
    const changes = getChanges(pendingDraft);

    if (changes.length === 0) {
      toast.warn("No changes to submit");
      return;
    }

    const payload = changes
      .map((change) =>
        buildPlacementPayload({
          action: change.action,
          newData: change.data,
          oldData: placementTeam[change.index],
        }),
      )
      .filter(Boolean);

    // 🔥 THIS IS THE KEY LINE
    const files = collectPlacementFiles(draftTeam);

    console.log("📦 PAYLOAD:", payload);
    console.log("🖼 FILES:", files);

    await sendRequest(payload, files);

    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Team"
        subHeaderText="Connecting talent with opportunity through strategic partnerships and career support services."
      />

      <div className="place-container pb-60 pt-10">
        <div
          className="Placement-App"
          style={{ marginTop: "30px", position: "relative" }}
        >
          {/* Edit button top-right (visible when not editing) */}
          {!editMode && (
            <div
              style={{ position: "absolute", right: 12, top: -50, zIndex: 50 }}
            >
              <button
                onClick={enterEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                aria-label="Enter edit mode"
              >
                <Pencil size={16} />
                <span>Edit</span>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
              <LoadComp txt={""} />
            </div>
          ) : (
            <>
              {/* Main person */}
              <PersonDetail
                person={
                  draftTeam[0] || {
                    name: "",
                    designation: "",
                    content: "",
                    image_path: "",
                  }
                }
                isEditable={editMode}
                onChange={(field, value) => handleFieldChange(0, field, value)}
                errors={validationErrors[0] || {}}
              />

              {/* Members list */}
              <div className="placement-members">
                {draftTeam.slice(1).map((person, index) => (
                  // use stable key based on index to avoid remount when name changes
                  <PersonMemberDetail
                    key={`member-${index}`}
                    person={person}
                    isImageLeft={index % 2 === 0}
                    isEditable={editMode}
                    onChange={(field, value) =>
                      handleFieldChange(index + 1, field, value)
                    }
                    checked={selectedItems.includes(index)}
                    onCheck={(checked) => toggleSelectItem(index, checked)}
                    errors={validationErrors[index + 1] || {}}
                    index={index + 1}
                  />
                ))}

                {/* ADD NEW MEMBER CARD centered and same size */}
                {editMode && (
                  <div
                    className="person-detail centered-card dark:bg-drkts new-card-wrap flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    style={{
                      position: "relative",
                      minHeight: "220px",
                      minWidth: "300px",
                      margin: "20px auto",
                    }}
                    onClick={handleAddNewMember}
                    aria-label="Add new member"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Plus size={26} />
                      <span className="text-sm text-gray-600">Add New Member</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-delete center bottom (visible only while editing and items selected) */}
              {editMode && selectedItems.length > 0 && (
                <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 z-40">
                  <button
                    onClick={() => setShowMultiDeleteConfirm(true)}
                    className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete ({selectedItems.length})
                  </button>
                </div>
              )}

              {/* Bottom right action buttons */}
              <div
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: -40,
                  display: "flex",
                  gap: 8,
                  zIndex: 60,
                }}
              >
                {/* CANCEL (left) - visible in edit mode */}
                {editMode && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}

                {/* SAVE (right) - visible only while editing and there are unsaved session changes */}
                {editMode && hasSessionChanges() && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                  >
                    Save
                  </button>
                )}

                {/* After saving (not editing) show Discard & Request */}
                {!editMode && pendingChanges && (
                  <>
                    <button
                      onClick={handleDiscardAll}
                      className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                    >
                      <Send size={16} />
                      Request
                    </button>
                  </>
                )}
              </div>

              {/* Multi-delete Confirmation Modal */}
              {showMultiDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
                  <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[420px]">
                    <h3 className="text-lg font-semibold mb-3">
                      Confirm Delete
                    </h3>
                    <p className="mb-4">
                      Are you sure you want to delete {selectedItems.length}{" "}
                      selected item(s)?
                    </p>
                    <div className="flex justify-end gap-2 mt-[20px]">
                      <button
                        onClick={() => setShowMultiDeleteConfirm(false)}
                        className="px-4 py-2 rounded bg-gray-400 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmMultiDelete}
                        className="px-4 py-2 rounded bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Request Modal (shows changes from pendingDraft) */}
              {showRequestModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                  <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
                    <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                      Request
                    </h2>
                    <p className="text-sm text-red-500 mb-4">
                      Note: Your changes will stay pending until approved by the
                      superior admin. Once approved they will go live.
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
                          {getChanges(pendingDraft).map((change, idx) => (
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
                              <td className="py-1">Placement Team</td>
                              <td className="py-1 text-[12px]">
                                <div className="flex items-center justify-center gap-2">
                                  <span>{change.data?.name || "Unnamed"}</span>
                                </div>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleRevertChange(change)}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                          {getChanges(pendingDraft).length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-3 text-sm">
                                No pending changes.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowRequestModal(false)}
                        className="px-4 py-2 rounded bg-gray-400 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFinalRequestConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${
                          loading ? "cursor-progress" : "hover:bg-[#800000]"
                        }`}
                      >
                        {loading ? "Processing..." : "Final Request"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default AdminPlacementTeam;