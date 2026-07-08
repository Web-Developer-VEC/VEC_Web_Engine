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
  const [originalData, setOriginalData] = useState({ admin: [], staff: [] }); // This should never change after initial fetch
  const [lastSavedData, setLastSavedData] = useState(null); // This is the last saved state
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
  const [allChanges, setAllChanges] = useState([]); // This accumulates all changes across sessions

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

  // Helper function to check if a member has any data
  const hasMemberData = (member) => {
    return (
      member.name?.trim() || 
      member.designation?.trim() || 
      member.image_path || 
      member.imageFile
    );
  };

  // Compare current data with last saved data to determine if there are actual changes in this session
  const hasActualChanges = () => {
    const current = tempData;
    const lastSaved = lastSavedData || originalData;

    // Check if lengths are different (added or deleted members)
    if (current.admin.length !== lastSaved.admin.length || 
        current.staff.length !== lastSaved.staff.length) {
      // But only count if the new members have actual data
      if (current.admin.length > lastSaved.admin.length) {
        const newAdmins = current.admin.filter(
          a => !lastSaved.admin.some(la => la.id === a.id)
        );
        if (newAdmins.some(hasMemberData)) return true;
      }
      if (current.staff.length > lastSaved.staff.length) {
        const newStaff = current.staff.filter(
          s => !lastSaved.staff.some(ls => ls.id === s.id)
        );
        if (newStaff.some(hasMemberData)) return true;
      }
      if (current.admin.length < lastSaved.admin.length ||
          current.staff.length < lastSaved.staff.length) {
        // Check if deleted members had data
        const deletedMembers = [
          ...lastSaved.admin.filter(la => !current.admin.some(ca => ca.id === la.id)),
          ...lastSaved.staff.filter(ls => !current.staff.some(cs => cs.id === ls.id))
        ];
        if (deletedMembers.some(hasMemberData)) return true;
      }
    }

    // Check for changes in existing members
    for (let i = 0; i < current.admin.length; i++) {
      const currentMember = current.admin[i];
      const lastSavedMember = lastSaved.admin.find(la => la.id === currentMember.id);
      
      if (lastSavedMember) {
        if (currentMember.name !== lastSavedMember.name ||
            currentMember.designation !== lastSavedMember.designation ||
            currentMember.image_path !== lastSavedMember.image_path ||
            currentMember.imageFile) {
          return true;
        }
      }
    }

    for (let i = 0; i < current.staff.length; i++) {
      const currentMember = current.staff[i];
      const lastSavedMember = lastSaved.staff.find(ls => ls.id === currentMember.id);
      
      if (lastSavedMember) {
        if (currentMember.name !== lastSavedMember.name ||
            currentMember.designation !== lastSavedMember.designation ||
            currentMember.image_path !== lastSavedMember.image_path ||
            currentMember.imageFile) {
          return true;
        }
      }
    }

    return false;
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
  };

  // Handle field changes
  const handleChange = (type, idx, updated) => {
    setTempData((prev) => {
      const updatedType = [...prev[type]];
      updatedType[idx] = updated;
      return { ...prev, [type]: updatedType };
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
    setTempData((prev) => {
      const newAdmin = prev.admin.filter((m) => !selectedIds.includes(m.id));
      const newStaff = prev.staff.filter((m) => !selectedIds.includes(m.id));
      return { admin: newAdmin, staff: newStaff };
    });

    setSelectedIds([]);
    setShowDeleteModal(false);
  };
  
  const handleCancel = () => {
    if (hasActualChanges()) {
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

  // Helper function to build change objects
  const buildChangeObjects = () => {
    const changes = [];
    const current = tempData;
    const lastSaved = lastSavedData || originalData;

    // Find deleted members
    [...lastSaved.admin, ...lastSaved.staff].forEach((savedMember) => {
      const stillExists = [...current.admin, ...current.staff].some(
        m => m.id === savedMember.id
      );
      if (!stillExists && hasMemberData(savedMember)) {
        changes.push({
          id: savedMember.id,
          type: "delete",
          data: savedMember,
          changes: { deleted: true },
        });
      }
    });

    // Find added and updated members
    [...current.admin, ...current.staff].forEach((currMember) => {
      const savedMember = [...lastSaved.admin, ...lastSaved.staff].find(
        m => m.id === currMember.id
      );

      if (!savedMember && hasMemberData(currMember)) {
        // New member with data
        changes.push({
          id: currMember.id,
          type: "insert",
          data: currMember,
          changes: {
            name: { old: "", new: currMember.name },
            designation: { old: "", new: currMember.designation },
            image: currMember.imageFile ? { file: currMember.imageFile } : null,
          },
        });
      } else if (savedMember) {
        // Check for updates
        const changeObj = {
          id: currMember.id,
          type: "update",
          data: currMember,
          changes: {},
        };

        if (currMember.name !== savedMember.name) {
          changeObj.changes.name = { old: savedMember.name, new: currMember.name };
        }
        if (currMember.designation !== savedMember.designation) {
          changeObj.changes.designation = { old: savedMember.designation, new: currMember.designation };
        }
        if (currMember.image_path !== savedMember.image_path || currMember.imageFile) {
          changeObj.changes.image = { 
            old: savedMember.image_path, 
            new: currMember.image_path,
            file: currMember.imageFile 
          };
        }

        if (Object.keys(changeObj.changes).length > 0) {
          changes.push(changeObj);
        }
      }
    });

    return changes;
  };

  // Save changes
  const handleSave = () => {
    // Validate all members have name and designation
    const allMembers = [...tempData.admin, ...tempData.staff];
    for (const m of allMembers) {
      if (!m.name?.trim() || !m.designation?.trim()) {
        toast.error("Name and designation are required for all members.");
        return;
      }
    }

    if (!hasActualChanges()) {
      toast.info("No changes to save.");
      return;
    }

    // Build change objects for this session
    const sessionChangeObjects = buildChangeObjects();

    // Merge session changes into allChanges
    setAllChanges((prev) => {
      const newChanges = [...prev];
      
      sessionChangeObjects.forEach((sessionChange) => {
        // Check if this member already has a change in allChanges
        const existingIndex = newChanges.findIndex(
          (c) => c.id === sessionChange.id
        );

        if (existingIndex >= 0) {
          // If it's a delete, remove any existing changes for this member
          if (sessionChange.type === "delete") {
            newChanges[existingIndex] = sessionChange;
          } else {
            // Update existing change
            newChanges[existingIndex] = {
              ...newChanges[existingIndex],
              ...sessionChange,
              changes: {
                ...newChanges[existingIndex].changes,
                ...sessionChange.changes,
              },
            };
          }
        } else {
          // Add new change
          newChanges.push(sessionChange);
        }
      });

      return newChanges;
    });

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
      if (change.type === "insert") {
        changes.push({
          type: "insert",
          id: change.id,
          label: change.data.name || "New Member",
          details: "New member will be added",
        });
      } else if (change.type === "update") {
        const fields = Object.keys(change.changes || {})
          .filter((key) => key !== "image" || change.changes.image?.file)
          .map((key) => key === "image" ? "photo" : key)
          .join(", ");

        changes.push({
          type: "update",
          id: change.id,
          label: change.data.name || "Member",
          details: fields || "Fields updated",
        });
      } else if (change.type === "delete") {
        changes.push({
          type: "delete",
          id: change.id,
          label: change.data.name || "Member",
          details: "Member will be removed",
        });
      }
    });

    return changes;
  };

  const handleUndo = (changeToUndo) => {
    // Remove this change from allChanges
    const newAllChanges = allChanges.filter((c) => c.id !== changeToUndo.id);

    // Reconstruct lastSavedData from originalData and remaining changes
    let reconstructedData = deepClone(originalData);

    // Apply all remaining changes to reconstruct the state
    newAllChanges.forEach((change) => {
      if (change.type === "insert") {
        // Add member
        const targetType = reconstructedData.admin.length < 2 ? "admin" : "staff";
        if (!reconstructedData[targetType]) reconstructedData[targetType] = [];
        reconstructedData[targetType].push(change.data);
      } else if (change.type === "update") {
        // Apply update
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
          (m) => m.id !== change.id
        );
        reconstructedData.staff = reconstructedData.staff.filter(
          (m) => m.id !== change.id
        );
      }
    });

    setAllChanges(newAllChanges);
    setLastSavedData(deepClone(reconstructedData));
    setTempData(deepClone(reconstructedData));

    if (newAllChanges.length === 0) {
      setIsSaved(false);
    }
    setShowConfirmModal(false);
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
    
    allChanges.forEach((change) => {
      if (change.type === "insert") {
        // New member
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
          title: `Insert Admin Office Member - ${member.name || ""}`,
          category: "administration",
          meta_data: meta,
          original_data: {},
        });
      } else if (change.type === "update") {
        // Updated member
        const member = change.data;
        const original = 
          originalData.admin.find((m) => m.id === change.id) ||
          originalData.staff.find((m) => m.id === change.id);

        if (!original) return;

        const meta = {};
        if (change.changes?.name) meta.name = member.name;
        if (change.changes?.designation) meta.designation = member.designation;
        
        if (change.changes?.image) {
          if (member.imageFile) {
            const safe = makeSafeFileName(member.imageFile);
            meta.image_path = `/static/images/admin_office/${safe}`;
            const renamed = new File([member.imageFile], safe, {
              type: member.imageFile.type,
            });
            filesToSend.push(renamed);
          } else if (member.image_path !== original.image_path) {
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
        // Deleted member
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

      console.log("Request entries:", entries);
      console.log("Files:", filesToSend);

      const result = await sendRequest(
        entries,
        filesToSend.length ? filesToSend : null,
      );

      if (result?.success) {
        // After successful request, update originalData to match the current state
        const currentMembers = [
          ...(tempData?.admin || []),
          ...(tempData?.staff || []),
        ];
        const updatedAdminData = currentMembers.map((m) => ({
          id: m.id,
          name: m.name,
          designation: m.designation,
          image_path: m.image_path || "",
        }));

        setAdminData(updatedAdminData);

        // Update original data to the new state
        const newOriginal = {
          admin: updatedAdminData.slice(0, 2),
          staff: updatedAdminData.slice(2),
        };

        setOriginalData(deepClone(newOriginal));
        setLastSavedData(deepClone(newOriginal));
        setAllChanges([]); // Clear all changes after successful request
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
                  {hasActualChanges() && (
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
                            <span className="text-green-600">+ Insert</span>
                          )}
                          {g.type === "update" && (
                            <span className="text-blue-600">✎ Update</span>
                          )}
                          {g.type === "delete" && (
                            <span className="text-red-600">– Delete</span>
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