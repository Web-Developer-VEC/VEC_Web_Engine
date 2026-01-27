import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./admin.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaPlus, FaPaperPlane } from "react-icons/fa";
import { MdUndo } from "react-icons/md";
import { Trash2, Pencil } from "lucide-react"; // Import Pencil icon
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { toast } from "react-toastify";

// Confirmation Modal Component
const ConfirmModal = ({
  show,
  onCancel,
  onConfirm,
  message,
  type = "default", // type: 'delete', 'confirm'
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000] scrabble-bg bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[420px] max-w-[92vw] relative">
        <p className="text-lg font-semibold mb-6 text-center text-brwn">{message}</p>
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
  editMode
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // set both imageFile (for upload) and image_path (for preview consistency)
    onChange({ ...data, imageFile: file, image_path: url });
  };

  // If image exists and isn't just a placeholder, show "Replace Photo", else "Upload Photo"
  const showReplace = !!data.image_path && !["", "https://via.placeholder.com/150"].includes(data.image_path);

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
        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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
  editMode
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
    <h3 className="admin-card-name text-accn dark:text-drkt mt-2 font-[poppins] text-center">{name}</h3>
    <p className="admin-card-designation font-[poppins] text-gray-600 dark:text-drka text-center">{designation}</p>
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
  const [adminData, setAdminData] = useState([]); // original from backend
  const [tempData, setTempData] = useState({ admin: [], staff: [] }); // editing buffer
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

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Robust UrlParser: preserve absolute URLs, blobs, data URLs; otherwise prefix BASE_URL if provided
  const UrlParser = (path) => {
    if (!path) return "";
    if (typeof path !== "string") return String(path);
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
    const base = BASE_URL ? String(BASE_URL).replace(/\/$/, "") : "";
    if (!base) return path;
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const { sendRequest, loading: reqLoading } = useAdminRequest();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(`/api/main-backend/administration`, { type: "admin_office" });
        // res.data.data is expected to be an array of admin office members
        const dataArr = res.data?.data || [];
        // map to consistent shape using image_path (matches JSON key)
        const formatted = dataArr.map((d, i) => ({
          id: d.id ?? i,
          image_path: UrlParser(d.image_path || d.photo_path || d.photo || d.image || ""),
          name: d.name || "",
          designation: d.designation || "",
        }));
        setAdminData(formatted);
        const initial = {
          admin: formatted.slice(0, 2),
          staff: formatted.slice(2),
        };
        setTempData(deepClone(initial));
        setLastSavedData(deepClone(initial));
      } catch (error) {
        if (error?.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
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
  };

  const handleAddMember = () => {
    setTempData((prev) => (({
      ...prev,
      staff: [
        ...prev.staff,
        { id: Date.now(), image_path: "", name: "", designation: "", _new: true },
      ],
    })));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleChange = (type, idx, updated) => {
    setTempData((prev) => {
      const updatedType = [...prev[type]];
      updatedType[idx] = updated;
      return { ...prev, [type]: updatedType };
    });
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setShowDeleteModal(true);
  };
  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) {
      setShowDeleteModal(false);
      return;
    }
    setTempData((prev) => {
      const newAdmin = prev.admin.filter((m) => !selectedIds.includes(m.id));
      const newStaff = prev.staff.filter((m) => !selectedIds.includes(m.id));
      const deleted = [
        ...prev.admin
          .map((m, idx) =>
            selectedIds.includes(m.id)
              ? { member: m, index: idx, type: "admin" }
              : null
          )
          .filter(Boolean),
        ...prev.staff
          .map((m, idx) =>
            selectedIds.includes(m.id)
              ? { member: m, index: idx, type: "staff" }
              : null
          )
          .filter(Boolean),
      ];
      setDeletedHistory((h) => [...h, ...deleted]);
      return { admin: newAdmin, staff: newStaff };
    });
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelModal(true);
    } else {
      setEditMode(false);
      setDeletedHistory([]);
      setSelectedIds([]);
    }
  };

  const confirmCancel = () => {
    setTempData(deepClone(lastSavedData));
    setEditMode(false);
    setDeletedHistory([]);
    setSelectedIds([]);
    setShowCancelModal(false);
  };

  const handleSave = () => {
    const mergedData = [...(tempData.admin || []), ...(tempData.staff || [])];
    for (const m of mergedData) {
      if (!m.name?.trim() || !m.designation?.trim()) {
        toast.error("Name and designation are required for all members.");
        return;
      }
    }
    if (!hasUnsavedChanges()) {
      setEditMode(false);
      setIsSaved(false);
      setSelectedIds([]);
      return;
    }
    setLastSavedData(deepClone(tempData));
    setIsSaved(true);
    setEditMode(false);
    setSelectedIds([]);
    toast.success("Changes saved locally. Submit request to apply.");
  };

  const handleDiscardAll = () => setShowDiscardModal(true);
  const confirmDiscardAll = () => {
    const original = {
      admin: adminData.slice(0, 2),
      staff: adminData.slice(2),
    };
    setTempData(deepClone(original));
    setLastSavedData(deepClone(original));
    setIsSaved(false);
    setShowDiscardModal(false);
    setSelectedIds([]);
  };

  const getChanges = () => {
    const mergedTemp = [...(tempData.admin || []), ...(tempData.staff || [])];
    const mergedOriginal = [...adminData];
    const byIdOriginal = new Map(mergedOriginal.map((m) => [m.id, m]));
    const byIdTemp = new Map(mergedTemp.map((m) => [m.id, m]));
    const changes = [];

    mergedTemp.forEach((m) => {
      if (!byIdOriginal.has(m.id) || m._new) {
        changes.push({
          type: "Added",
          id: m.id,
          label: m.name || "(new member)"
        });
      } else {
        const o = byIdOriginal.get(m.id);
        const fieldsChanged = [];
        if ((o.name || "") !== (m.name || "")) fieldsChanged.push("name");
        if ((o.designation || "") !== (m.designation || "")) fieldsChanged.push("designation");
        if (m.imageFile || (o.image_path || "") !== (m.image_path || "")) fieldsChanged.push("photo");
        if (fieldsChanged.length) {
          changes.push({
            type: "Updated",
            id: m.id,
            label: m.name || o.name,
            fields: fieldsChanged
          });
        }
      }
    });

    mergedOriginal.forEach((m, idx) => {
      if (!byIdTemp.has(m.id)) {
        changes.push({
          type: "Deleted",
          id: m.id,
          label: m.name,
          index: idx
        });
      }
    });

    return changes;
  };

  const handleUndo = (change) => {
    const updateBoth = (fn) => {
      setTempData(prev => fn(prev));
      setLastSavedData(prev => fn(prev));
    };

    if (change.type === "Added") {
      updateBoth(prev => {
        const key = prev.admin.some(m => m.id === change.id) ? "admin" : "staff";
        return {
          ...prev,
          [key]: prev[key].filter((m) => m.id !== change.id),
        };
      });
      return;
    }
    if (change.type === "Deleted") {
      const historyIdx = deletedHistory.findIndex(h => h.member.id === change.id);
      if (historyIdx < 0) return;
      const history = deletedHistory[historyIdx];

      updateBoth(prev => {
        const arr = [...prev[history.type]];
        arr.splice(history.index, 0, history.member);
        return { ...prev, [history.type]: arr };
      });

      setDeletedHistory(prev => prev.filter((_, idx) => idx !== historyIdx));
      return;
    }
    if (change.type === "Updated") {
      const original = adminData.find((m) => m.id === change.id);
      if (!original) return;
      updateBoth(prev => {
        const key = prev.admin.some(m => m.id === change.id) ? "admin" : "staff";
        return {
          ...prev,
          [key]: prev[key].map((m) =>
            m.id === change.id ? { ...original, imageFile: undefined } : m
          ),
        };
      });
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
    const mergedTemp = [...(lastSavedData?.admin || tempData.admin || []), ...(lastSavedData?.staff || tempData.staff || [])];
    
    const mergedSubmitted = [...(tempData.admin || []), ...(tempData.staff || [])];
    const originalById = new Map(adminData.map(m => [m.id, m]));

  
    mergedSubmitted.forEach((m, idx) => {
      const orig = originalById.get(m.id);
   
      if (!orig || m._new) {
        let meta = { name: m.name || "", designation: m.designation || "" };
        if (m.imageFile) {
          const safe = makeSafeFileName(m.imageFile);
          meta.image_path = `/static/images/admin_office/${safe}`;
          const renamed = new File([m.imageFile], safe, { type: m.imageFile.type });
          filesToSend.push(renamed);
        } else {
          meta.image_path = m.image_path || "";
        }

        entries.push({
          collectionName: "administration",
          collection_type: "admin_office",
          action: "add",
          title: `Add Admin Office Member - ${m.name || ""}`,
          category: "administration",
          meta_data: meta,
          original_data: {}
        });
      } else {
        // Possibly updated
        const fieldsChanged = [];
        if ((orig.name || "") !== (m.name || "")) fieldsChanged.push("name");
        if ((orig.designation || "") !== (m.designation || "")) fieldsChanged.push("designation");
        if (m.imageFile || ((orig.image_path || "") !== (m.image_path || ""))) fieldsChanged.push("photo");

        if (fieldsChanged.length) {
          let meta = {};
          if (fieldsChanged.includes("name")) meta.name = m.name || "";
          if (fieldsChanged.includes("designation")) meta.designation = m.designation || "";
          if (fieldsChanged.includes("photo")) {
            if (m.imageFile) {
              const safe = makeSafeFileName(m.imageFile);
              meta.image_path = `/static/images/admin_office/${safe}`;
              const renamed = new File([m.imageFile], safe, { type: m.imageFile.type });
              filesToSend.push(renamed);
            } else {
              meta.image_path = m.image_path || "";
            }
          }
          entries.push({
            collectionName: "administration",
            collection_type: "admin_office",
            action: "update",
            title: `Update Admin Office Member - ${m.name || ""}`,
            category: "administration",
            meta_data: meta,
            original_data: {
              id: orig.id,
              name: orig.name || "",
              designation: orig.designation || "",
              image_path: orig.image_path || ""
            }
          });
        }
      }
    });

    const submittedIds = new Set(mergedSubmitted.map(m => m.id));
    adminData.forEach((orig) => {
      if (!submittedIds.has(orig.id)) {
        // Deleted
        entries.push({
          collectionName: "administration",
          collection_type: "admin_office",
          action: "delete",
          title: `Delete Admin Office Member - ${orig.name || ""}`,
          category: "administration",
          meta_data: { id: orig.id, name: orig.name || "", designation: orig.designation || "" },
          original_data: { id: orig.id, name: orig.name || "", designation: orig.designation || "", image_path: orig.image_path || "" }
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

      const result = await sendRequest(entries, filesToSend.length ? filesToSend : null);

      if (result?.success) {
        const mergedSubmitted = [...(tempData.admin || []), ...(tempData.staff || [])];

        const updatedAdminData = mergedSubmitted.map((m) => {
          if (m.imageFile) {
            const safe = makeSafeFileName(m.imageFile);
            return {
              id: m.id,
              name: m.name,
              designation: m.designation,
              image_path: `/static/images/admin_office/${safe}`
            };
          }
          return {
            id: m.id,
            name: m.name,
            designation: m.designation,
            image_path: m.image_path || ""
          };
        });

        setAdminData(updatedAdminData);
        const snapshot = {
          admin: updatedAdminData.slice(0, 2),
          staff: updatedAdminData.slice(2),
        };
        setLastSavedData(deepClone(snapshot));
        setDeletedHistory([]);
        setSelectedIds([]);
        setIsSaved(false);
        setShowConfirmModal(false);
        toast.success("Request submitted successfully.");
      } else {
        if (result?.status === 429 || result?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: result?.message || result?.data?.message || "Rate limit exceeded" }});
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
              )
            )}
            {editMode && tempData.admin.length < 2 && (
              <AddCard
                label="Add Superior"
                onAdd={() =>
                  setTempData((prev) => (({
                    ...prev,
                    admin: [
                      ...prev.admin,
                      { id: Date.now(), image_path: "", name: "", designation: "", _new: true },
                    ],
                  })))
                }
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
              )
            )}
            {editMode && (
              <AddCard label="Add Member" onAdd={handleAddMember} />
            )}
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
                  {hasUnsavedChanges() && (
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
                    onClick={confirmDiscardAll}
                    className="px-4 py-2 mt-bg-brwn text-white font-[poppins] rounded hover:text-brown-500"
                  >
                    Discard All Changes
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
        message="Are you sure you want to discard all changes?"
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={confirmDiscardAll}
        type="confirm"
      />

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[2000] scrabble-bg bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[520px] max-w-[92vw]">
            <h2 className="text-lg font-bold mb-4">Final Request for the Changes</h2>
            <p className="text-red-600 mb-4">
              <span className="font-semibold">Note:</span> Your changes will stay pending
              until approved by the superior admin. Once approved, they will be applied automatically.
            </p>
            <table className="w-full border-collapse mb-6 text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {getChanges().length ? (
                  getChanges().map((c, idx) => (
                    <tr key={`${c.type}-${c.id}-${idx}`} className="border-b">
                      <td className="py-2">{c.type}</td>
                      <td className="py-2">{c.label}</td>
                      <td className="py-2">
                        {c.type === "Updated" ? c.fields?.join(", ") : "—"}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleUndo(c)}
                          className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-1"
                          title="Undo this change"
                        >
                          <MdUndo /> Undo
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No changes detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="px-4 py-2 bg-yellow-400 text-black rounded flex items-center gap-2 hover:bg-yellow-500"
                disabled={reqLoading}
              >
                <FaPaperPlane /> {reqLoading ? "Processing..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCardPage;