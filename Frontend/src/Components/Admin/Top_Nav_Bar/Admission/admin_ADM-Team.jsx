import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Pencil, Plus, Trash2, PlusCircle, SquarePen, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminADMteam = ({ theme, toggle }) => {
  const [admissionteamData, setAdmissionteamData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [teamCardEdit, setTeamCardEdit] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, {
          type: "admission_team",
        });
        const dataWithIds = (response.data.data || []).map((item) => ({
          ...item,
          id: item.id || generateId(),
        }));
        setAdmissionteamData(dataWithIds);
        setOriginalData(dataWithIds);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);

  // Online/offline detection
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

  // Track changes
  const trackChange = (index, field, value) => {
    setAdmissionteamData((prev) => {
      const updated = [...prev];
      if (field === "name") value = value.toUpperCase();
      updated[index] = { ...updated[index], [field]: value };
      const item = updated[index];

      // Update change list for added items
      setChangeList((prevChanges) =>
        prevChanges.map((c) =>
          c.type === "added" && c.data.id === item.id && field === "name"
            ? { ...c, section: value || "New Team Member" }
            : c
        )
      );

      if (item.isNew) return updated;

      const original = originalData.find((o) => o.id === item.id) || {};
      const editedFields = {};
      ["name", "designation", "photo_path"].forEach((key) => {
        if (item[key] !== original[key]) {
          editedFields[key] = {
            before: original[key] || "",
            after: item[key] || "",
          };
        }
      });

      setChangeList((prevChanges) => {
        const existingIndex = prevChanges.findIndex(
          (c) => c.data?.id === item.id && c.type === "edited"
        );
        if (Object.keys(editedFields).length === 0) {
          if (existingIndex >= 0)
            return prevChanges.filter((_, i) => i !== existingIndex);
          return prevChanges;
        }
        const newChange = {
          type: "edited",
          section: item.name || "Team Member",
          fields: editedFields,
          data: item,
        };
        if (existingIndex >= 0) {
          const updatedChanges = [...prevChanges];
          updatedChanges[existingIndex] = newChange;
          return updatedChanges;
        } else {
          return [...prevChanges, newChange];
        }
      });

      return updated;
    });
  };

  // Selection
  const handleSelect = (id, isChecked) => {
    setSelectedItems((prev) =>
      isChecked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  // Add new member
  const addNewCard = () => {
    const newMember = {
      id: generateId(),
      name: "",
      designation: "",
      photo_path: "",
      isNew: true,
    };
    setAdmissionteamData((prev) => [...prev, newMember]);
    setChangeList((prev) => [
      ...prev,
      {
        type: "added",
        section: newMember.name || "New Team Member",
        fields: {},
        data: newMember,
      },
    ]);
  };

  // Delete selected members
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.info("No team member selected.");
      return;
    }
    const deletedItems = admissionteamData.filter((item) =>
      selectedItems.includes(item.id)
    );
    setAdmissionteamData((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
    );
    setChangeList((prev) => [
      ...prev,
      ...deletedItems.map((d) => ({
        type: "deleted",
        section: d.name,
        fields: {},
        data: d,
      })),
    ]);
    setSelectedItems([]);
    toast.success("Selected members deleted.");
  };

  // Revert change
  const revertField = (changeIdx) => {
    setChangeList((prevChanges) => {
      const change = prevChanges[changeIdx];
      if (!change) return prevChanges;

      if (change.type === "added") {
        setAdmissionteamData((prev) =>
          prev.filter((f) => f.id !== change.data.id)
        );
        return prevChanges.filter((_, i) => i !== changeIdx);
      }

      if (change.type === "deleted") {
        setAdmissionteamData((prev) => [...prev, change.data]);
        return prevChanges.filter((_, i) => i !== changeIdx);
      }

      if (change.type === "edited") {
        setAdmissionteamData((prev) => {
          const updated = [...prev];
          const idxF = updated.findIndex((f) => f.id === change.data.id);
          if (idxF >= 0) {
            Object.keys(change.fields).forEach((field) => {
              updated[idxF][field] =
                originalData.find((o) => o.id === change.data.id)?.[field] || "";
            });
          }
          return updated;
        });
        return prevChanges.filter((_, i) => i !== changeIdx);
      }

      return prevChanges;
    });
  };

  // Save changes
  const handleSave = () => {
    const invalid = admissionteamData.some(
      (f) => !f.name || !f.designation || !f.photo_path
    );
    if (invalid) {
      toast.error("All fields are mandatory.");
      return;
    }
    toast.success("Changes saved! You can request or discard now.");
    setShowRequestButtons(true);
    setTeamCardEdit(false);
  };

  // Discard all changes
  const handleDiscard = () => {
    setAdmissionteamData([...originalData]);
    setSelectedItems([]);
    setChangeList([]);
    setImagePreviews({});
    setShowRequestButtons(false);
    setTeamCardEdit(false);
    toast.info("All changes discarded, back to original data.");
  };

  // Request approval
  const handleRequestConfirm = async () => {
    try {
      await axios.post("/api/admin/request-changes", {
        changes: changeList,
        data: admissionteamData,
      });
      toast.success("Request submitted for approval!");
      setChangeList([]);
      setShowRequestModal(false);
      setShowRequestButtons(false);
      setTeamCardEdit(false);
    } catch (err) {
      toast.error("Failed to submit request!");
    }
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  // Split first 2 cards and the rest
  const firstTwoCards = admissionteamData.slice(0, 1);
  const remainingCards = admissionteamData.slice(1);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Admission team"
        subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
      />

      <div className="flex justify-end mb-4">
        {!teamCardEdit && (
          <button
            onClick={() => {
              setTeamCardEdit(true);
              setShowRequestButtons(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <LoadComp txt="" />
        </div>
      ) : (
        <div className="regulation-container flex flex-col items-center">
          {/* First two cards */}
          <div className="flex justify-center gap-6 mb-6 flex-wrap">
            {firstTwoCards.map((member, index) => (
              <TeamCard
                key={member.id}
                member={member}
                index={index}
                teamCardEdit={teamCardEdit}
                selectedItems={selectedItems}
                handleSelect={handleSelect}
                trackChange={trackChange}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                UrlParser={UrlParser}
              />
            ))}
          </div>

          {/* Remaining cards */}
          <div className="flex flex-wrap justify-center gap-6">
            {remainingCards.map((member, index) => (
              <TeamCard
                key={member.id}
                member={member}
                index={index + 2}
                teamCardEdit={teamCardEdit}
                selectedItems={selectedItems}
                handleSelect={handleSelect}
                trackChange={trackChange}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                UrlParser={UrlParser}
              />
            ))}

            {teamCardEdit && (
              <div
                className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 w-60 bg-prim shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={addNewCard}
              >
                <Plus className="text-gray-500" />
                <span className="mt-2 text-gray-500">Add New Member</span>
              </div>
            )}
          </div>

          {/* Delete Selected */}
          {teamCardEdit && selectedItems.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2"
                onClick={handleDeleteSelected}
              >
                <Trash2 size={16} /> Delete Selected
              </button>
            </div>
          )}

          {/* Save / Cancel Buttons */}
          {teamCardEdit && !showRequestButtons && (
            <div className="mt-4 flex justify-end gap-3 w-full">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setAdmissionteamData([...originalData]);
                  setSelectedItems([]);
                  setChangeList([]);
                  setImagePreviews({});
                  setTeamCardEdit(false);
                  toast.info("Edits cancelled.");
                }}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                onClick={handleSave}
              >
                Save 
              </button>
            </div>
          )}

          {/* Request Modal */}
          {showRequestModal && (
            <RequestModal
              changeList={changeList}
              revertField={revertField}
              handleRequestConfirm={handleRequestConfirm}
              closeModal={() => setShowRequestModal(false)}
            />
          )}

          {/* Request / Discard buttons after save */}
          {showRequestButtons && (
            <div className="flex justify-end w-full  gap-3 mt-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={handleDiscard}
              >
                Discard chnages
              </button>
              <button
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                Request 
              </button>
            </div>
          )}
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

// TeamCard Component
const TeamCard = ({
  member,
  index,
  teamCardEdit,
  selectedItems,
  handleSelect,
  trackChange,
  imagePreviews,
  setImagePreviews,
  UrlParser,
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);

      // Revoke old object URL to prevent memory leaks
      if (imagePreviews[member.id]) {
        URL.revokeObjectURL(imagePreviews[member.id]);
      }

      setImagePreviews((prev) => ({
        ...prev,
        [member.id]: url,
      }));

      trackChange(index, "photo_path", url);
    }
  };

  return (
    <div className="relative border-2 border-secd dark:border-drks rounded-md flex flex-col items-center p-4 w-60 bg-prim dark:bg-drkp shadow hover:shadow-lg transition-shadow">
      <img
        src={imagePreviews[member.id] || UrlParser(member.photo_path)}
        alt={member.name}
        className="rounded-md w-36 h-44 object-cover mb-2"
      />
      {teamCardEdit ? (
        <>
          <label className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer mb-2">
            <span>{member.photo_path ? "Replace" : "Upload"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          <input
            type="text"
            value={member.name}
            placeholder="Name"
            className="w-full border p-2 rounded mb-2"
            onChange={(e) => trackChange(index, "name", e.target.value)}
          />
          <input
            type="text"
            value={member.designation}
            placeholder="Designation"
            className="w-full border p-2 rounded mb-2"
            onChange={(e) => trackChange(index, "designation", e.target.value)}
          />
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(member.id)}
              onChange={(e) => handleSelect(member.id, e.target.checked)}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-brwn dark:text-drkt text-center text-[18px]">
            {member.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {member.designation}
          </p>
        </>
      )}
    </div>
  );
};

// RequestModal Component
const RequestModal = ({ changeList, revertField, handleRequestConfirm, closeModal }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
    <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800"> Request  Changes</h2>
      <p className="text-red-600 mb-4">
        <span className="font-medium">Note:</span> Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 border">Action</th>
            <th className="text-left p-2 border">Section</th>
            <th className="text-left p-2 border">changes</th>
            <th className="text-left p-2 border">Undo</th>
          </tr>
        </thead>
        <tbody>
          {changeList.map((c, idx) => (
            <tr key={idx} className="border-b">
              <td className=" border p-2">
                {c.type === "added"  }
                {c.type === "deleted" }
                {c.type === "edited" }
                <span className="capitalize ml-1">{c.type}</span>
              </td>
              <td className="p-2 border">Admin-team</td>
              <td>
                {c.section}
              </td>
              <td className="p-2 border">
                <button
                  className=" p-1 rounded hover:bg-gray-100"
                  onClick={() => revertField(idx)}
                >
                 <X/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end gap-3 mt-4">
        <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={closeModal}>
          Cancel
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={handleRequestConfirm}>
          Final Request
        </button>
      </div>
    </div>
  </div>
);

export default AdminADMteam;
