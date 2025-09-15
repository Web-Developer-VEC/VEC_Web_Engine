// AdminCardPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./admin.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaPlus, FaTrash, FaPaperPlane } from "react-icons/fa";
import { MdUndo } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


/* ---------- Editable + Display Cards ---------- */

const EditableCard = ({ data, onChange, onDelete, isMain }) => {
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...data, imageFile: file, image: url });
  };

  return (
    <div
      className={`${isMain ? "admin-card-ao" : "admin-card"} border-2 border-secd dark:border-drks relative flex flex-col items-center p-4 w-60 rounded`}
    >
      <img
        src={data.image || "https://via.placeholder.com/150"}
        alt={data.name || "Profile"}
        className="admin-card-image rounded-md"
      />

      {/* Upload button centered under image */}
      <label className="mt-2 bg-secd text-black text-xs px-3 py-1 cursor-pointer shadow-md hover:bg-brwn hover:text-prime rounded">
        Upload Photo
        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </label>

      <input
        type="text"
        value={data.name}
        placeholder="Enter Name"
        className="admin-card-name text-center mt-2 w-full border-b"
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />
      <input
        type="text"
        value={data.designation}
        placeholder="Enter Designation"
        className="admin-card-designation text-center w-full border-b"
        onChange={(e) => onChange({ ...data, designation: e.target.value })}
      />

      {/* Show delete only if handler provided (safe) */}
      {onDelete && (
        <button onClick={onDelete} className="text-red-500 mt-2 text-sm flex items-center gap-1">
          <FaTrash /> Delete
        </button>
      )}
    </div>
  );
};

const Card = ({ image, name, designation, isMain }) => (
  <div
    className={`${isMain ? "admin-card-ao" : "admin-card"} border-2 border-secd dark:border-drks relative flex flex-col items-center p-4 w-60 rounded`}
  >
    <img src={image} alt={name} className="admin-card-image rounded-md" />
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

/* -------------------- Main Page -------------------- */

const AdminCardPage = ({ theme, toggle }) => {
  const [adminData, setAdminData] = useState([]);   // original
  const [tempData, setTempData] = useState([]);     // working copy
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState([]); // for undo of deletions

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    if (!path) return "";
    if (typeof path === "string" && (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:"))) {
      return path;
    }
    return `${BASE_URL || ""}${path}`;
  };

  /* Fetch */
  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.post(`/api/main-backend/administration`, { type: "admin_office" });
      const formatted = (res.data?.data || []).map((d, i) => ({
        id: d.id ?? i, // fallback id if missing
        image: UrlParser(d.photo_path),
        name: d.name || "",
        designation: d.designation || "",
      }));

      setAdminData(formatted);

      // split first 2 as admin, rest as staff
      setTempData({
        admin: formatted.slice(0, 2),
        staff: formatted.slice(2),
      });
    } catch (error) {
      console.error("Error fetching data:", error?.message);
      if (error?.response?.data?.status === 429) {
        navigate("/ratelimit", { state: { msg: error.response.data.message } });
      }
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [navigate]);

  /* Online/Offline */
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

  /* CRUD in edit mode */
  const handleAddMember = () => {
    setTempData((prev) => [
      ...prev,
      { id: Date.now(), image: "", name: "", designation: "", _new: true },
    ]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleChange = (id, updated) => {
    setTempData((arr) => arr.map((m) => (m.id === id ? updated : m)));
  };

  const handleDelete = (id) => {
    setTempData((arr) => {
      const idx = arr.findIndex((m) => m.id === id);
      if (idx >= 0) setDeletedHistory((h) => [...h, { member: arr[idx], index: idx }]);
      return arr.filter((m) => m.id !== id);
    });
  };

  const handleCancel = () => {
  setTempData({
    admin: adminData.slice(0, 2),
    staff: adminData.slice(2),
  });
  setDeletedHistory([]);
  setEditMode(false);
  setIsSaved(false);
  toast.info("Edits cancelled. Restored original data.");
};




  const handleSave = () => {
  // Check for empty required fields
  const mergedData = [...(tempData.admin || []), ...(tempData.staff || [])];
  for (const m of mergedData) {
    if (!m.name?.trim() || !m.designation?.trim()) {
      toast.error("Please fill all fields before saving");
      return;
    }
  }

  // If no changes, exit edit mode directly
  if (getChanges().length === 0) {
    toast.info("No changes detected. Returning to normal view.");
    setEditMode(false);
    setIsSaved(false);
    return;
  }

  setIsSaved(true);
  setEditMode(false);
  toast.success("Changes saved locally. Ready to request.");
};


  /* --- Changes & Undo (for modal) --- */
  const getChanges = () => {
  // Merge admin + staff into one flat array
  const mergedTemp = [...(tempData.admin || []), ...(tempData.staff || [])];
  const mergedOriginal = [...adminData]; // adminData stays flat after saving

  const byIdOriginal = new Map(mergedOriginal.map((m) => [m.id, m]));
  const byIdTemp = new Map(mergedTemp.map((m) => [m.id, m]));
  const changes = [];

  // Added or Updated
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
      if ((o.image || "") !== (m.image || "")) fieldsChanged.push("photo");
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

  // Deleted
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
    if (change.type === "Added") {
      // Remove the newly added member
      setTempData((arr) => arr.filter((m) => m.id !== change.id));
      return;
    }
    if (change.type === "Deleted") {
      // Reinsert original at previous index
      const original = adminData.find((m) => m.id === change.id);
      if (!original) return;
      const insertIndex =
        deletedHistory.find((h) => h.member.id === change.id)?.index ?? tempData.length;
      const cloned = [...tempData];
      cloned.splice(insertIndex, 0, original);
      setTempData(cloned);
      return;
    }
    if (change.type === "Updated") {
      const original = adminData.find((m) => m.id === change.id);
      if (!original) return;
      setTempData((arr) =>
        arr.map((m) =>
          m.id === change.id
            ? { ...original, imageFile: undefined } // restore original
            : m
        )
      );
    }
  };

  /* --- Request API --- */
  const handleRequest = async () => {
  try {
    if (getChanges().length === 0) {
      toast.info("No changes to request.");
      setShowConfirmModal(false);
      return;
    }

    const formData = new FormData();
    formData.append("type", "admin_office");

    const mergedData = [...tempData.admin, ...tempData.staff];
    mergedData.forEach((m, i) => {
      formData.append(`members[${i}][id]`, m.id ?? "");
      formData.append(`members[${i}][name]`, m.name ?? "");
      formData.append(`members[${i}][designation]`, m.designation ?? "");
      formData.append(`members[${i}][_new]`, m._new ? "1" : "0");
      if (m.imageFile) {
        formData.append(`members[${i}][photo]`, m.imageFile);
      } else {
        formData.append(`members[${i}][photo_path]`, m.image ?? "");
      }
    });

    await axios.put(`/api/main-backend/update-admin-office`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setAdminData(mergedData);
    setDeletedHistory([]);
    setShowConfirmModal(false);
    setIsSaved(false);
    toast.success("Request sent successfully!");
  } catch (err) {
    console.error("Request failed:", err?.message);
    toast.error("Failed to send request!");
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
            {!editMode && !isSaved ? (
              <button
                onClick={() => {
                  setIsSaved(false);
                  setEditMode(true);
                }}
                className="px-4 py-2 mr-5 bg-yellow-400 text-[poppins] rounded shadow-md hover:bg-yellow-500"
              >
                Edit
              </button>
            ) : editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 mr-7 bg-brwn text-gray-100 rounded shadow-md hover:bg-secd hover:text-black"
                >
                  Cancel
                </button>
              </>
            ) : null}
          </div>

          {/* --------- Cards --------- */}
          <div className="ao-container flex flex-col md:flex-row gap-4 mb-6">
  {tempData.admin.map((m, i) =>
    editMode ? (
      m ? (
        <EditableCard
          key={m.id}
          data={m}
          isMain
          onChange={(updated) => {
            setTempData((prev) => {
              const updatedAdmins = [...prev.admin];
              updatedAdmins[i] = updated;
              return { ...prev, admin: updatedAdmins };
            });
          }}
          onDelete={() => {
            setTempData((prev) => {
              const updatedAdmins = prev.admin.filter((_, idx) => idx !== i);
              return { ...prev, admin: updatedAdmins };
            });
          }}
        />
      ) : (
        <AddCard
          key={`add-admin-${i}`}
          label="Add Superior"
          onAdd={() =>
            setTempData((prev) => {
              const newMember = {
                id: Date.now(),
                image: "",
                name: "",
                designation: "",
                _new: true,
              };
              const updatedAdmins = [...prev.admin];
              updatedAdmins.splice(i, 0, newMember);
              return { ...prev, admin: updatedAdmins };
            })
          }
        />
      )
    ) : (
      <Card key={m.id} {...m} isMain />
    )
  )}

  {editMode && tempData.admin.length < 2 && (
    <AddCard
      label="Add Superior"
      onAdd={() =>
        setTempData((prev) => ({
          ...prev,
          admin: [
            ...prev.admin,
            { id: Date.now(), image: "", name: "", designation: "", _new: true },
          ],
        }))
      }
    />
  )}
</div>


          {/* --------- Members Section --------- */}
          <div className="admin-card-container flex flex-wrap gap-4">
  {tempData.staff.map((m, i) =>
    editMode ? (
      <EditableCard
        key={m.id}
        data={m}
        onChange={(updated) =>
          setTempData((prev) => {
            const updatedStaff = [...prev.staff];
            updatedStaff[i] = updated;
            return { ...prev, staff: updatedStaff };
          })
        }
        onDelete={() =>
          setTempData((prev) => {
            const updatedStaff = prev.staff.filter((_, idx) => idx !== i);
            return { ...prev, staff: updatedStaff };
          })
        }
      />
    ) : (
      <Card key={m.id} {...m} />
    )
  )}

  {editMode && (
    <AddCard
      label="Add Member"
      onAdd={() =>
        setTempData((prev) => ({
          ...prev,
          staff: [
            ...prev.staff,
            { id: Date.now(), image: "", name: "", designation: "", _new: true },
          ],
        }))
      }
    />
  )}
</div>

          {/* --------- Fixed Save (bottom-right) --------- */}
          {editMode && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 mr-7 mb-1 bg-secd font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
              >
                Save
              </button>
       
            </div>
          )}

          {/* --------- After Save: Request only (no Edit) --------- */}
          {isSaved && !editMode && getChanges().length > 0 && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-2 mb-3 bg-brwn text-white font-[poppins] rounded hover:text-brown-500"
              >
                Back to Edit
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-3 py-2 mb-3 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
              >
                <FaPaperPlane /> Request
              </button>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>
      )}

      {/* ---------------- Confirm Modal ---------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2000]">
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
              >
                <FaPaperPlane /> Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCardPage;