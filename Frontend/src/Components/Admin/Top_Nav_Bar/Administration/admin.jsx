import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./admin.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaPlus, FaPaperPlane } from "react-icons/fa";
import { MdUndo } from "react-icons/md";
import { Trash2, Pencil, X } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast } from "react-toastify";

// Confirmation Modal Component
const ConfirmModal = ({
  show,
  onCancel,
  onConfirm,
  message,
  type = "default",
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000] scrabble-bg bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[420px] max-w-[92vw] relative">
        <p className="text-lg font-semibold mb-6 text-center text-brwn">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          {type === "delete" ? (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
              >
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EditableCard = ({
  data,
  onChange,
  isMain,
  selected,
  onSelect,
  editMode,
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...data, imageFile: file, image_path: url });
  };

  const showReplace =
    !!data.image_path &&
    !["", "https://via.placeholder.com/150"].includes(data.image_path);

  return (
    <div
      className={`${isMain ? "admin-card-ao" : "admin-card"} border-2 border-secd dark:border-drks relative flex flex-col items-center p-4 w-60 rounded`}
    >
      {editMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(data.id)}
          className="absolute top-3 right-3 admin-checkbox"
          title="Select"
        />
      )}
      <img
        src={data.image_path || "https://via.placeholder.com/150"}
        alt={data.name || "Profile"}
        className="admin-card-image rounded-md"
      />
      <label className="mt-2 bg-yellow-400 text-black text-xs px-3 py-1 cursor-pointer shadow-md hover:bg-yellow-500 rounded">
        {showReplace ? "Replace Photo" : "Upload Photo"}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>
      <input
        type="text"
        value={data.name}
        placeholder="Enter Name"
        className="admin-card-name text-center mt-2 w-full border border-gray-400 rounded"
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />
      <input
        type="text"
        value={data.designation}
        placeholder="Enter Designation"
        className="admin-card-designation text-center w-full border border-gray-400 rounded"
        onChange={(e) => onChange({ ...data, designation: e.target.value })}
      />
    </div>
  );
};

const Card = ({
  image_path,
  name,
  designation,
  isMain,
  selected,
  onSelect,
  editMode,
}) => (
  <div
    className={`${isMain ? "admin-card-ao" : "admin-card"} border-2 border-secd dark:border-drks relative flex flex-col items-center p-4 w-60 rounded`}
  >
    {editMode && (
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="absolute top-3 right-3 admin-checkbox"
        title="Select"
      />
    )}
    <img src={image_path} alt={name} className="admin-card-image rounded-md" />
    <h3 className="admin-card-name text-accn dark:text-drkt mt-2 font-[poppins] text-center">
      {name}
    </h3>
    <p className="admin-card-designation font-[poppins] text-gray-600 dark:text-drka text-center">
      {designation}
    </p>
  </div>
);

const AddCard = ({ label, onAdd }) => (
  <div
    className="border-2 border-dashed border-gray-400 dark:border-drks flex flex-col items-center justify-center p-6 w-60 h-[250px] rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
    onClick={onAdd}
  >
    <FaPlus className="text-2xl text-gray-600 mb-2" />
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
  </div>
);

const AdminCardPage = ({ theme, toggle }) => {
  const [adminData, setAdminData] = useState([]);
  const [tempData, setTempData] = useState({ admin: [], staff: [] });
  const [originalData, setOriginalData] = useState({ admin: [], staff: [] });
  const [lastSavedData, setLastSavedData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionChanges, setSessionChanges] = useState([]);
  const [allChanges, setAllChanges] = useState([]);

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    if (typeof path !== "string") return String(path);
    if (
      path.startsWith("http") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    )
      return path;
    const base = BASE_URL ? String(BASE_URL).replace(/\/$/, "") : "";
    if (!base) return path;
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const { sendRequest, loading: reqLoading } = useAdminRequest();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(`/api/main-backend/administration`, {
          type: "admin_office",
        });
        const dataArr = res.data?.data || [];
        const formatted = dataArr.map((d, i) => ({
          id: d.id ?? i,
          image_path: UrlParser(
            d.image_path || d.photo_path || d.photo || d.image || "",
          ),
          name: d.name || "",
          designation: d.designation || "",
        }));
        setAdminData(formatted);
        const initial = {
          admin: formatted.slice(0, 2),
          staff: formatted.slice(2),
        };
        setTempData(deepClone(initial));
        setOriginalData(deepClone(initial));
        setLastSavedData(deepClone(initial));
      } catch (error) {
        if (error?.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        } else {
          console.error("Failed fetching administration:", error);
        }
      } finally {
        setLoading(false);
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

  const hasUnsavedChanges = () => {
    return JSON.stringify(tempData) !== JSON.stringify(lastSavedData);
  };

  const startEditMode = () => {
    setTempData(deepClone(lastSavedData || { admin: [], staff: [] }));
    setEditMode(true);
    setDeletedHistory([]);
    setSelectedIds([]);
    setSessionChanges([]);
  };

  const handleAddMember = () => {
    const newId = Date.now();
    const newMember = {
      id: newId,
      image_path: "",
      name: "",
      designation: "",
      _new: true,
    };

    setTempData((prev) => ({
      ...prev,
      staff: [...prev.staff, newMember],
    }));

    // Track in session changes
    setSessionChanges((prev) => [
      ...prev,
      {
        id: newId,
        type: "add",
        data: newMember,
        changes: {
          name: { old: "", new: "" },
          designation: { old: "", new: "" },
        },
      },
    ]);

    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  // Handle field changes
  const handleChange = (type, idx, updated) => {
    const oldData = tempData[type][idx];

    setTempData((prev) => {
      const updatedType = [...prev[type]];
      updatedType[idx] = updated;
      return { ...prev, [type]: updatedType };
    });

    // Track changes in session
    setSessionChanges((prev) => {
      // Check if this member already has a change recorded
      const existingIndex = prev.findIndex((c) => c.id === updated.id);

      const changes = {};
      if (oldData.name !== updated.name)
        changes.name = { old: oldData.name, new: updated.name };
      if (oldData.designation !== updated.designation)
        changes.designation = {
          old: oldData.designation,
          new: updated.designation,
        };
      if (oldData.image_path !== updated.image_path || updated.imageFile) {
        changes.image = {
          old: oldData.image_path,
          new: updated.image_path,
          file: updated.imageFile,
        };
      }

      if (existingIndex >= 0) {
        // Update existing change
        const updatedChanges = [...prev];
        updatedChanges[existingIndex] = {
          ...updatedChanges[existingIndex],
          data: updated,
          changes: {
            ...updatedChanges[existingIndex].changes,
            ...changes,
          },
        };
        return updatedChanges;
      } else {
        // Add new change
        return [
          ...prev,
          {
            id: updated.id,
            type: updated._new ? "add" : "edit",
            data: updated,
            changes,
          },
        ];
      }
    });
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };
const confirmDeleteSelected = () => {
  const deleted = [];

  setTempData((prev) => {
    const newAdmin = prev.admin.filter((m) => {
      if (selectedIds.includes(m.id)) {
        deleted.push({ member: m, type: "admin" });
        return false;
      }
      return true;
    });

    const newStaff = prev.staff.filter((m) => {
      if (selectedIds.includes(m.id)) {
        deleted.push({ member: m, type: "staff" });
        return false;
      }
      return true;
    });

    return { admin: newAdmin, staff: newStaff };
  });

  // Track deletions in session changes
  const newSessionChanges = [...sessionChanges];
  
  deleted.forEach(({ member }) => {
    // First remove any existing add/edit changes for this member
    const filtered = newSessionChanges.filter((c) => c.id !== member.id);
    
    // Add delete change
    filtered.push({
      id: member.id,
      type: "delete",
      data: member,
      changes: { deleted: true },
    });
    
    // Update sessionChanges in one go
    setSessionChanges(filtered);
  });

  setDeletedHistory((h) => [...h, ...deleted]);
  setSelectedIds([]);
  setShowDeleteModal(false);
};
  const handleCancel = () => {
    if (sessionChanges.length > 0) {
      setShowCancelModal(true);
    } else {
      setEditMode(false);
      setDeletedHistory([]);
      setSelectedIds([]);
      setSessionChanges([]);
    }
  };

  const confirmCancel = () => {
    setTempData(deepClone(lastSavedData));
    setEditMode(false);
    setDeletedHistory([]);
    setSelectedIds([]);
    setSessionChanges([]);
    setShowCancelModal(false);
  };

  // Save changes (move from session to allChanges)
  const handleSave = () => {
    // Validate all members have name and designation
    const allMembers = [...tempData.admin, ...tempData.staff];
    for (const m of allMembers) {
      if (!m.name?.trim() || !m.designation?.trim()) {
        toast.error("Name and designation are required for all members.");
        return;
      }
    }

    if (sessionChanges.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    // Log for debugging
    console.log("Saving session changes:", sessionChanges);

    // Create a deep copy of current tempData for lastSavedData
    const savedData = {
      admin: tempData.admin.map((m) => {
        const cloned = { ...m };
        if (m.imageFile) {
          cloned.imageFile = m.imageFile;
        }
        return cloned;
      }),
      staff: tempData.staff.map((m) => {
        const cloned = { ...m };
        if (m.imageFile) {
          cloned.imageFile = m.imageFile;
        }
        return cloned;
      }),
    };

    // Update lastSavedData with current tempData
    setLastSavedData(savedData);

    // Merge session changes into allChanges, avoiding duplicates
    setAllChanges((prev) => {
      const newChanges = [...prev];

      sessionChanges.forEach((sessionChange) => {
        // Check if this change already exists in allChanges
        const existingIndex = newChanges.findIndex(
          (c) => c.id === sessionChange.id,
        );

        if (existingIndex >= 0) {
          // Replace existing change with updated one
          newChanges[existingIndex] = sessionChange;
        } else {
          // Add new change
          newChanges.push(sessionChange);
        }
      });

      console.log("Updated allChanges:", newChanges);
      return newChanges;
    });

    // Clear session changes
    setSessionChanges([]);

    // Mark as saved and exit edit mode
    setIsSaved(true);
    setEditMode(false);
    setSelectedIds([]);

    toast.success("Changes saved locally. Submit request to apply.");
  };

  const handleDiscardAll = () => setShowDiscardModal(true);

  const confirmDiscardAll = () => {
    setTempData(deepClone(originalData));
    setLastSavedData(deepClone(originalData));
    setAllChanges([]);
    setSessionChanges([]);
    setIsSaved(false);
    setShowDiscardModal(false);
    setSelectedIds([]);
    setDeletedHistory([]);
  };

  const getChanges = () => {
    const changes = [];

    allChanges.forEach((change) => {
      if (change.type === "add") {
        changes.push({
          type: "insert",
          id: change.id,
          label: change.data.name || "New Member",
          details: "New member will be added",
          original: change,
        });
      } else if (change.type === "edit") {
        const fields = Object.keys(change.changes || {})
          .filter((key) => {
            if (key === "image") {
              return (
                change.changes.image?.file ||
                change.changes.image?.new !== change.changes.image?.old
              );
            }
            return true;
          })
          .map((key) => {
            if (key === "image") return "photo";
            return key;
          })
          .join(", ");

        changes.push({
          type: "update",
          id: change.id,
          label: change.data.name || "Member",
          details: fields || "Fields updated",
          original: change,
        });
      } else if (change.type === "delete") {
        changes.push({
          type: "delete",
          id: change.id,
          label: change.data.name || "Member",
          details: "Member will be removed",
          original: change,
        });
      }
    });

    return changes;
  };

  const handleUndo = (changeToUndo) => {
    // Find the actual change object in allChanges
    const actualChange = allChanges.find(
      (c) => c.id === changeToUndo.id && c.type === changeToUndo.type,
    );

    if (!actualChange) return;

    // Remove this change from allChanges
    const newAllChanges = allChanges.filter((c) => c !== actualChange);

    // Reconstruct lastSavedData from remaining changes
    let reconstructedData = deepClone(originalData);

    // Apply all remaining changes to reconstruct the state
    newAllChanges.forEach((change) => {
      if (change.type === "add") {
        // Add member back
        const targetType = change.data._new ? "staff" : "admin";
        if (!reconstructedData[targetType]) reconstructedData[targetType] = [];
        reconstructedData[targetType].push(change.data);
      } else if (change.type === "edit") {
        // Apply edit
        const member =
          reconstructedData.admin.find((m) => m.id === change.id) ||
          reconstructedData.staff.find((m) => m.id === change.id);
        if (member) {
          Object.assign(member, change.data);
          if (change.changes?.image?.file) {
            member.imageFile = change.changes.image.file;
          }
        }
      } else if (change.type === "delete") {
        // Remove deleted member
        reconstructedData.admin = reconstructedData.admin.filter(
          (m) => m.id !== change.id,
        );
        reconstructedData.staff = reconstructedData.staff.filter(
          (m) => m.id !== change.id,
        );
      }
    });

    setAllChanges(newAllChanges);
    setLastSavedData(deepClone(reconstructedData));
    setTempData(deepClone(reconstructedData));

    if (newAllChanges.length === 0) {
      setIsSaved(false);
      setShowConfirmModal(false);
    }
  };

  const makeSafeFileName = (file) => {
    if (!file) return "";
    const ts = Date.now();
    const name = file.name.replace(/\s+/g, "_");
    return `${ts}_${name}`;
  };

  const buildEntriesAndFiles = () => {
    const entries = [];
    const filesToSend = [];
   console.log("sathish " , entries);
   
    // Get current state from lastSavedData (since that's what's saved)
    const currentMembers = [
      ...(lastSavedData?.admin || []),
      ...(lastSavedData?.staff || []),
    ];

    allChanges.forEach((change) => {
      if (change.type === "add") {
        const member = change.data;
        let meta = {
          name: member.name || "",
          designation: member.designation || "",
        };

        if (member.imageFile) {
          const safe = makeSafeFileName(member.imageFile);
          meta.image_path = `/static/images/admin_office/${safe}`;
          const renamed = new File([member.imageFile], safe, {
            type: member.imageFile.type,
          });
          filesToSend.push(renamed);
        } else {
          meta.image_path = member.image_path || "";
        }

        entries.push({
          collectionName: "administration",
          collection_type: "admin_office",
          action: "insert",
          title: `Add Admin Office Member - ${member.name || ""}`,
          category: "administration",
          meta_data: meta,
          original_data: {},
        });
      } else if (change.type === "edit") {
        const member = change.data;
        const original =
          originalData.admin.find((m) => m.id === change.id) ||
          originalData.staff.find((m) => m.id === change.id);

        if (!original) return;

        const meta = {};
        if (change.changes?.name) meta.name = member.name;
        if (change.changes?.designation) meta.designation = member.designation;
        if (change.changes?.image || member.imageFile) {
          if (member.imageFile) {
            const safe = makeSafeFileName(member.imageFile);
            meta.image_path = `/static/images/admin_office/${safe}`;
            const renamed = new File([member.imageFile], safe, {
              type: member.imageFile.type,
            });
            filesToSend.push(renamed);
          } else {
            meta.image_path = member.image_path;
          }
        }

        entries.push({
          collectionName: "administration",
          collection_type: "admin_office",
          action: "update",
          title: `Update Admin Office Member - ${member.name || ""}`,
          category: "administration",
          meta_data: meta,
          original_data: {
            id: original.id,
            name: original.name || "",
            designation: original.designation || "",
            image_path: original.image_path || "",
          },
        });
      } else if (change.type === "delete") {
        const member = change.data;
        entries.push({
          collectionName: "administration",
          collection_type: "admin_office",
          action: "delete",
          title: `Delete Admin Office Member - ${member.name || ""}`,
          category: "administration",
          meta_data: {
            id: member.id,
            name: member.name || "",
            designation: member.designation || "",
          },
          original_data: {
            id: member.id,
            name: member.name || "",
            designation: member.designation || "",
            image_path: member.image_path || "",
          },
        });
      }
    });

    return { entries, filesToSend };
  };

  const handleRequest = async () => {
    try {
      const { entries, filesToSend } = buildEntriesAndFiles();

      if (!entries.length) {
        toast.info("No changes to request.");
        setShowConfirmModal(false);
        return;
      }

      const result = await sendRequest(
        entries,
        filesToSend.length ? filesToSend : null,
      );

      if (result?.success) {
        // Update adminData with current state
        const currentMembers = [
          ...(lastSavedData?.admin || []),
          ...(lastSavedData?.staff || []),
        ];
        const updatedAdminData = currentMembers.map((m) => ({
          id: m.id,
          name: m.name,
          designation: m.designation,
          image_path: m.image_path || "",
        }));

        setAdminData(updatedAdminData);

        // Update original data
        const newOriginal = {
          admin: updatedAdminData.slice(0, 2),
          staff: updatedAdminData.slice(2),
        };

        setOriginalData(deepClone(newOriginal));
        setLastSavedData(deepClone(newOriginal));
        setAllChanges([]);
        setSessionChanges([]);
        setDeletedHistory([]);
        setSelectedIds([]);
        setIsSaved(false);
        setShowConfirmModal(false);

        toast.success("Request submitted successfully.");
      } else {
        if (result?.status === 429 || result?.data?.status === 429) {
          navigate("/ratelimit", {
            state: {
              msg:
                result?.message ||
                result?.data?.message ||
                "Rate limit exceeded",
            },
          });
          return;
        }
        toast.error(result?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Failed to submit admin request", err);
      toast.error("Request failed.");
    }
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Administrative Office"
        subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="admin-card-page px-6 relative">
          <div className="flex justify-end gap-3 mb-4">
            {!editMode && !isSaved && (
              <button
                onClick={startEditMode}
                className="px-4 py-2 mr-7 bg-yellow-400 text-[poppins] rounded shadow-md hover:bg-yellow-500 flex items-center"
              >
                <Pencil size={16} className="mr-2" />
                Edit
              </button>
            )}
            {isSaved && !editMode && (
              <button
                onClick={startEditMode}
                className="px-4 py-2 bg-yellow-400 text-black font-[poppins] rounded hover:bg-yellow-500 ml-2 mr-7 flex items-center"
              >
                <Pencil size={16} className="mr-2" />
                Edit
              </button>
            )}
          </div>

          <div className="ao-container flex flex-col md:flex-row gap-4 mb-6">
            {tempData.admin.map((m, i) =>
              editMode ? (
                <EditableCard
                  key={m.id}
                  data={m}
                  isMain
                  onChange={(updated) => handleChange("admin", i, updated)}
                  selected={selectedIds.includes(m.id)}
                  onSelect={() => handleSelect(m.id)}
                  editMode={editMode}
                />
              ) : (
                <Card
                  key={m.id}
                  {...m}
                  isMain
                  selected={false}
                  onSelect={() => {}}
                  editMode={false}
                />
              ),
            )}
            {editMode && tempData.admin.length < 2 && (
              <AddCard
                label="Add Superior"
                onAdd={() => {
                  const newId = Date.now();
                  const newMember = {
                    id: newId,
                    image_path: "",
                    name: "",
                    designation: "",
                    _new: true,
                  };
                  setTempData((prev) => ({
                    ...prev,
                    admin: [...prev.admin, newMember],
                  }));
                  setSessionChanges((prev) => [
                    ...prev,
                    {
                      id: newId,
                      type: "add",
                      data: newMember,
                      changes: {
                        name: { old: "", new: "" },
                        designation: { old: "", new: "" },
                      },
                    },
                  ]);
                }}
              />
            )}
          </div>

          <div className="admin-card-container flex flex-wrap gap-4">
            {tempData.staff.map((m, i) =>
              editMode ? (
                <EditableCard
                  key={m.id}
                  data={m}
                  onChange={(updated) => handleChange("staff", i, updated)}
                  selected={selectedIds.includes(m.id)}
                  onSelect={() => handleSelect(m.id)}
                  editMode={editMode}
                />
              ) : (
                <Card
                  key={m.id}
                  {...m}
                  selected={false}
                  onSelect={() => {}}
                  editMode={false}
                />
              ),
            )}
            {editMode && <AddCard label="Add Member" onAdd={handleAddMember} />}
          </div>

          {/* BOTTOM BUTTONS */}
          <div className="flex flex-col items-end">
            {editMode && selectedIds.length > 0 && (
              <div className="w-full flex justify-center my-3">
                <button
                  onClick={handleDeleteSelected}
                  className="px-6 py-2 bg-red-600 text-white rounded flex items-center gap-2 hover:bg-red-700"
                >
                  <Trash2 size={22} /> Delete Selected
                </button>
              </div>
            )}
            <div className="flex gap-3 mt-5 mr-5">
              {editMode && (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-400 text-white rounded shadow-md hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  {sessionChanges.length > 0 && (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-secd font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                    >
                      Save
                    </button>
                  )}
                </>
              )}
              {isSaved && !editMode && (
                <>
                  <button
                    onClick={handleDiscardAll}
                    className="px-4 py-2 bg-red-500 text-white font-[poppins] rounded hover:bg-red-600"
                  >
                    Discard All
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
                  >
                    <FaPaperPlane /> Request
                  </button>
                </>
              )}
            </div>
            <div ref={bottomRef}></div>
          </div>
        </div>
      )}

      {/* Confirm delete modal for selected cards */}
      <ConfirmModal
        show={showDeleteModal}
        message={`Are you sure you want to delete the selected member${selectedIds.length > 1 ? "s" : ""}?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSelected}
        type="delete"
      />

      <ConfirmModal
        show={showCancelModal}
        message="Are you sure you want to cancel all unsaved changes?"
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        type="confirm"
      />

      <ConfirmModal
        show={showDiscardModal}
        message="Are you sure you want to discard all saved changes?"
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={confirmDiscardAll}
        type="confirm"
      />

      {/* Confirm request modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>

            <div className="max-h-[300px] overflow-y-auto mb-4">
              {getChanges().length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border">Action</th>
                      <th className="py-2 px-3 border">Member</th>
                      <th className="py-2 px-3 border">Details</th>
                      <th className="py-2 px-3 border">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getChanges().map((g, i) => (
                      <tr key={i} className="even:bg-white odd:bg-gray-50">
                        <td className="py-2 px-3 border">
                          {g.type === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {g.type === "update" && (
                            <span className="text-blue-600">✎ Edited</span>
                          )}
                          {g.type === "delete" && (
                            <span className="text-red-600">– Deleted</span>
                          )}
                        </td>
                        <td className="py-2 px-3 border">{g.label}</td>
                        <td className="py-2 px-3 border">{g.details}</td>
                        <td className="py-2 px-3 border text-center">
                          <button
                            onClick={() => handleUndo(g)}
                            className="text-red-500 font-bold hover:text-red-700"
                            title="Undo this change"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No changes found.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {/* Discard All button inside popup */}

              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 rounded bg-gray-400 text-white ${reqLoading ? "cursor-not-allowed" : ""}`}
                disabled={reqLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${reqLoading ? "cursor-progress" : "hover:bg-[#800000]"}`}
                disabled={reqLoading}
              >
                {reqLoading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCardPage;
