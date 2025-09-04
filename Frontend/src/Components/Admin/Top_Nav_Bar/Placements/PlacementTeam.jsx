import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPlacementTeam.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FiEdit, FiTrash2, FiX, FiUpload } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PersonDetail({ person, isEditing, onChange, isViewMode }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("blob") || path?.startsWith("http")
      ? path
      : `${BASE_URL}${path}`;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onChange({ ...person, photo_path: imageUrl });
    }
  };

  return (
    <div className="person-detail left dark:bg-drkts">
      <div className="flex items-start gap-6 w-full">
        <div className="flex flex-col items-center">
          <img
            src={UrlParser(person?.photo_path)}
            alt={person?.name}
            className="w-40 h-40 mt-10 object-cover rounded-md"
          />
          {isEditing && !isViewMode && (
            <label className="mt-2 cursor-pointer flex items-center gap-2 text-blue-500">
              <FiUpload size={18} /> Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        <div className="flex-1">
          {isEditing && !isViewMode ? (
            <>
              <input
                type="text"
                value={person.name}
                onChange={(e) => onChange({ ...person, name: e.target.value })}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={person.designation}
                onChange={(e) =>
                  onChange({ ...person, designation: e.target.value })
                }
                className="w-full p-2 mb-3 border border-gray-300 rounded-md"
              />
              <textarea
                value={person.content}
                onChange={(e) =>
                  onChange({ ...person, content: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
              />
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
    </div>
  );
}

function PersonMemberDetail({
  person,
  isImageLeft,
  isEditing,
  onChange,
  onDelete,
  isViewMode
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("blob") || path?.startsWith("http")
      ? path
      : `${BASE_URL}${path}`;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onChange({ ...person, photo_path: imageUrl });
    }
  };

  return (
    <div
      className={`person-detail ${isImageLeft ? "left" : "right"} dark:bg-drkts`}
    >
      <div className="flex flex-col items-center">
        <img
          src={UrlParser(person.photo_path)}
          alt={person.name}
          className="person-image-mem"
        />
        {isEditing && !isViewMode && (
          <label className="mt-2 cursor-pointer flex items-center gap-2 text-blue-500">
            <FiUpload size={16} /> Upload
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>

      <div className="person-content-mem">
        {isEditing && !isViewMode ? (
          <>
            <input
              type="text"
              value={person.name}
              onChange={(e) => onChange({ ...person, name: e.target.value })}
              className="w-full p-1 mb-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={person.designation}
              onChange={(e) =>
                onChange({ ...person, designation: e.target.value })
              }
              className="w-full p-1 mb-2 border border-gray-300 rounded-md"
            />
            <button className="delete-btn-tt" onClick={onDelete}>
              <FiTrash2 size={20} />
            </button>
          </>
        ) : (
          <>
            <h3 className="placement-member-head">{person.name}</h3>
            <p className="text-accn dark:text-drka">{person.designation}</p>
          </>
        )}
      </div>
    </div>
  );
}

export const AdminPlacementTeam = ({ toggle, theme }) => {
  const [PlacementTeam, setPlacementTeam] = useState([]);
  const [editedTeam, setEditedTeam] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    designation: "",
    content: "",
    photo_path: "",
  });
  const [showSavePopup, setShowSavePopup] = useState(false);
  const navigate = useNavigate();

  // ---------- fetch data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/placement`, {
          type: "placement_team",
        });
        const data = response.data.data || [];

        // assign temporary _id
        const withIds = data.map((p, i) => ({ ...p, _id: i + 1 }));

        setPlacementTeam(withIds);
        setEditedTeam(JSON.parse(JSON.stringify(withIds)));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
        setLoading(true);
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

  const handleProfileChange = (index, newData) => {
    setEditedTeam((prev) => {
      const updated = [...prev];
      updated[index] = newData;
      return updated;
    });
  };

  const handleDelete = (index) => {
    const removedPerson = editedTeam[index];
    setEditedTeam((prev) => prev.filter((_, i) => i !== index));
    const existedInOriginal = PlacementTeam.some((p) => p._id === removedPerson._id);
    if (existedInOriginal) {
      setDeletedItems((prev) =>
        prev.some((p) => p._id === removedPerson._id) ? prev : [...prev, removedPerson]
      );
    }
  };

  const hasChanges = () => {
    if (deletedItems.length > 0) return true;
    const added = editedTeam.some((person) => !PlacementTeam.some((p) => p._id === person._id));
    if (added) return true;
    const modified = editedTeam.some((person) => {
      const old = PlacementTeam.find((p) => p._id === person._id);
      if (!old) return false;
      return (
        old.name !== person.name ||
        old.designation !== person.designation ||
        (old.content || "") !== (person.content || "")
      );
    });
    if (modified) return true;
    return false;
  };

  const handleSaveAll = () => {
    if (!hasChanges()) {
      toast.info("No changes to save");
      return;
    }
    setShowSavePopup(true);
  };

  const confirmSaveAll = () => {
    setPlacementTeam(JSON.parse(JSON.stringify(editedTeam)));
    setIsEditing(false);
    setShowSavePopup(false);
    setDeletedItems([]);
    toast.success("Request submitted successfully!");
  };

  const handleViewPage = () => {
    setIsViewMode(true);
    setIsEditing(false);
  };

  const handleExitViewPage = () => {
    setIsViewMode(false);
  };

  const handleRequest = () => {
    setShowSavePopup(true);
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
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Team"
        subHeaderText="Connecting talent with opportunity through strategic partnerships and career support services."
      />

      <div className="place-container relative">
        <div className="absolute top-5 right-5 flex gap-2">
          {!isEditing && !isViewMode ? (
            <button
              className="edit-btn-t flex items-center gap-1"
              onClick={() => {
                setIsEditing(true);
                setDeletedItems([]);
              }}
            >
              <FiEdit size={18} /> Edit
            </button>
          ) : !isViewMode ? (
            <button
              className="bg-gray-400 text-white px-4 py-1 rounded-md flex items-center gap-1"
              onClick={() => {
                setIsEditing(false);
                setEditedTeam(JSON.parse(JSON.stringify(PlacementTeam)));
                setDeletedItems([]);
              }}
            >
              <FiX size={18} /> Cancel
            </button>
          ) : null}
        </div>

        <div className="Placement-App" style={{ marginTop: "30px" }}>
          {isLoading ? (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
              <LoadComp txt={""} />
            </div>
          ) : (
            <>
              {editedTeam[0] && (
                <PersonDetail
                  key={editedTeam[0]._id}
                  person={editedTeam[0]}
                  isEditing={isEditing}
                  onChange={(data) => handleProfileChange(0, data)}
                  isViewMode={isViewMode}
                />
              )}

              <div className="placement-members">
                {editedTeam.slice(1).map((person, index) => (
                  <PersonMemberDetail
                    key={person._id}
                    person={person}
                    isImageLeft={index % 2 === 0}
                    isEditing={isEditing}
                    onChange={(data) => handleProfileChange(index + 1, data)}
                    onDelete={() => handleDelete(index + 1)}
                    isViewMode={isViewMode}
                  />
                ))}

                {isEditing && !isViewMode && (
                  <div
                    className="person-detail add-box dark:bg-drkts cursor-pointer"
                    onClick={() => setShowPopup(true)}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-4xl text-gray-500">+</span>
                      <p className="text-gray-600">Add Member</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* View Page Button at the bottom */}
        <div className="mt-8 mb-4 flex justify-center gap-4">
          {!isViewMode ? (
            <button className="view-btn" onClick={handleViewPage}>
              View Page
            </button>
          ) : (
            <>
              <button className="exit-view-btn" onClick={handleExitViewPage}>
                Exit View Page
              </button>
              <button className="request-btn" onClick={handleRequest}>
                Request
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add member popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Add New Member</h2>
            <input
              type="text"
              placeholder="Name"
              value={newPerson.name}
              onChange={(e) =>
                setNewPerson({ ...newPerson, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Designation"
              value={newPerson.designation}
              onChange={(e) =>
                setNewPerson({ ...newPerson, designation: e.target.value })
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  setNewPerson({ ...newPerson, photo_path: imageUrl });
                }
              }}
            />
            <div className="popup-buttons">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button
                onClick={() => {
                  if (!newPerson.name || !newPerson.designation) {
                    toast.error("Name & Designation required");
                    return;
                  }
                  setEditedTeam((prev) => [
                    ...prev,
                    { ...newPerson, _id: Date.now() }, // new member with unique id
                  ]);
                  setShowPopup(false);
                  setNewPerson({
                    name: "",
                    designation: "",
                    content: "",
                    photo_path: "",
                  });
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save summary popup */}
      {showSavePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Changes Summary</h2>
            <p className="note-pop">Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.</p>
            <ul className="text-left mb-4">
              {editedTeam.map((person) => {
                const old = PlacementTeam.find((p) => p._id === person._id);
                if (!old) {
                  return (
                    <li key={"add-" + person._id}>
                      <strong>{person.name}</strong> → Added
                    </li>
                  );
                }
                const isModified =
                  old.name !== person.name ||
                  old.designation !== person.designation ||
                  (old.content || "") !== (person.content || "");
                if (isModified) {
                  return (
                    <li key={"mod-" + person._id}>
                      <strong>{old.name}</strong> → Modified
                    </li>
                  );
                }
                return null;
              })}

              {deletedItems.map((p) => (
                <li key={"del-" + p._id}>
                  <strong>{p.name}</strong> → Deleted
                </li>
              ))}
            </ul>
            <div className="popup-buttons">
              <button
                onClick={() => {
                  setShowSavePopup(false);
                }}
              >
                Cancel
              </button>
              <button onClick={confirmSaveAll}>Send Request</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};