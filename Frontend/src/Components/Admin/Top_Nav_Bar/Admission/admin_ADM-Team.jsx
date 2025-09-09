import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "../../../Banner";
import LoadComp from "../../../LoadComp";
import { useNavigate } from "react-router";
import {
  SquarePen,
  Plus,
  CircleX,
  Edit3,
  Trash2,
  Send,
  PlusCircle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Modal = ({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  isEditing,
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: URL.createObjectURL(files[0]) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-drkp p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Faculty" : "Add Faculty"}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            name="photo_path"
            onChange={handleChange}
          />

          {formData.photo_path && (
            <img
              src={formData.photo_path}
              alt="Preview"
              className="w-24 h-28 object-cover rounded-md"
            />
          )}

          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Enter name"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            type="text"
            name="designation"
            value={formData.designation}
            placeholder="Enter designation"
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={
              !formData.photo_path ||
              !formData.name.trim() ||
              !formData.designation.trim()
            }
            className={`px-3 py-1 rounded text-white ${
              !formData.photo_path ||
              !formData.name.trim() ||
              !formData.designation.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Card = ({ image, name, designation, onEdit, onDelete, editMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative border-2 border-secd dark:border-drks rounded-md flex flex-col items-center p-4 w-60 bg-prim dark:bg-drkp shadow hover:shadow-lg transition-shadow">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className={`rounded-md w-36 h-44 object-cover transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="text-red-500">Failed to load image</div>
      )}

      <h3 className="mt-2 font-semibold text-brwn dark:text-drkt text-center text-[18px]">
        {name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {designation}
      </p>

      {editMode && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            className="bg-white p-1 rounded-full shadow hover:bg-gray-200"
            onClick={onEdit}
          >
            <Edit3 size={18} />
          </button>

          <button
            onClick={onDelete}
            className="bg-white p-1 rounded-full shadow hover:bg-red-100 text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const AdminCard = ({ image, name, designation, onEdit, onDelete, editMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative border-2 border-secd dark:border-drks rounded-md flex flex-col items-center p-4 w-60 bg-prim dark:bg-drkp shadow hover:shadow-lg transition-shadow">
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className={`rounded-md w-36 h-44 object-cover transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="text-red-500">Failed to load image</div>
      )}
      <div className="mt-2 text-center">
        <h3 className="font-semibold text-brwn dark:text-prim text-[16px]">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{designation}</p>
      </div>

      {editMode && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            className="bg-white p-1 rounded-full shadow hover:bg-gray-200"
            onClick={onEdit}
          >
            <Edit3 size={18} />
          </button>

          <button
            onClick={onDelete}
            className="bg-white p-1 rounded-full shadow hover:bg-red-100 text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default function AdminADMteam({ theme, toggle }) {
  const [admissionteamData, setadmissionteamData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [teamcardedit, setTeamcardEdit] = useState(false);
  const navigate = useNavigate();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    photo_path: "",
    name: "",
    designation: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Change tracking states
  const [changeList, setChangeList] = useState([]);
  const [ugData, setUgData] = useState({ admission_team: [] });
  const [showPopup, setShowPopup] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, {
          type: "admission_team",
        });
        setadmissionteamData(response.data.data);
        setUgData({ admission_team: response.data.data });
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

  const handleFinalRequest = async () => {
    try {
      await axios.post("/api/admin/request-changes", {
        changes: changeList,
        data: ugData,
      });
      toast.success("Request submitted for approval!");
      setChangeList([]);
      setShowPopup(false);
    } catch (err) {
      toast.error("Failed to submit request!");
    }
  };

  const handleUndoChange = (idx) => {
    const change = changeList[idx];
    let updatedData = { ...ugData };

    if (change.type === "added") {
      updatedData[change.section] = updatedData[change.section].filter(
        (row) => row !== change.row
      );
    } else if (change.type === "deleted") {
      updatedData[change.section] = [...updatedData[change.section], change.row];
    } else if (change.type === "edited") {
      const sectionData = [...updatedData[change.section]];
      const itemIdx = sectionData.findIndex(
        (item) => Object.keys(item)[0] === change.to
      );
      if (itemIdx !== -1) {
        sectionData[itemIdx] = {
          [change.from]: Object.values(sectionData[itemIdx])[0],
        };
      }
      updatedData[change.section] = sectionData;
    }

    setUgData(updatedData);
    setChangeList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (
      !formData.photo_path ||
      !formData.name.trim() ||
      !formData.designation.trim()
    ) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    let updated = [...admissionteamData];

    if (isEditing && editIndex !== null) {
      updated[editIndex] = formData;
      setChangeList((prev) => [
        ...prev,
        { type: "edited", section: "admission_team", row: formData },
      ]);
    } else {
      updated.push(formData);
      setChangeList((prev) => [
        ...prev,
        { type: "added", section: "admission_team", row: formData },
      ]);
    }

    setadmissionteamData(updated);
    setUgData({ admission_team: updated });
    setShowModal(false);
    setIsEditing(false);
    setEditIndex(null);
    setFormData({ photo_path: "", name: "", designation: "" });
    toast.success("Saved successfully!");
  };

  const handleDelete = (index) => {
    let updated = [...admissionteamData];
    const removed = updated.splice(index, 1)[0];
    setadmissionteamData(updated);
    setUgData({ admission_team: updated });

    setChangeList((prev) => [
      ...prev,
      { type: "deleted", section: "admission_team", row: removed },
    ]);
    toast.info("Deleted successfully!");
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Admission team"
        subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
      />

      <div className="flex justify-end mr-10">
        <button
          className="admin-edit-ug flex-end flex gap-1 mt-3"
          onClick={() => setTeamcardEdit(!teamcardedit)}
        >
          {teamcardedit ? (
            <>
              <CircleX /> Cancel
            </>
          ) : (
            <>
              <SquarePen /> Edit
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <LoadComp txt="" />
        </div>
      ) : (
        <div className="regulation-container flex flex-col items-center ">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {admissionteamData[0] && (
              <AdminCard
                image={UrlParser(admissionteamData[0]?.photo_path)}
                name={admissionteamData[0]?.name}
                designation={admissionteamData[0]?.designation}
                editMode={teamcardedit}
                onEdit={() => {
                  setFormData(admissionteamData[0]);
                  setEditIndex(0);
                  setIsEditing(true);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(0)}
              />
            )}
            {admissionteamData[1] && (
              <AdminCard
                image={UrlParser(admissionteamData[1]?.photo_path)}
                name={admissionteamData[1]?.name}
                designation={admissionteamData[1]?.designation}
                editMode={teamcardedit}
                onEdit={() => {
                  setFormData(admissionteamData[1]);
                  setEditIndex(1);
                  setIsEditing(true);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(1)}
              />
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {admissionteamData.slice(2).map((card, index) => (
              <Card
                key={card.id || index}
                image={UrlParser(card.photo_path)}
                name={card.name}
                designation={card.designation}
                editMode={teamcardedit}
                onEdit={() => {
                  setFormData(card);
                  setEditIndex(index + 2);
                  setIsEditing(true);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(index + 2)}
              />
            ))}

            {teamcardedit && (
              <div
                className="border-2 rounded-md flex flex-col items-center justify-center p-4 w-60 bg-prim shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setFormData({ photo_path: "", name: "", designation: "" });
                  setIsEditing(false);
                  setShowModal(true);
                }}
              >
                <Plus className="size-[30px]" />
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
      />

      <ToastContainer position="bottom-right" autoClose={3000} />
      {teamcardedit && (
        <div className="admin-controls-ug flex justify-end mb-2">
          <button
            className="admin-edit-ug flex gap-1"
            onClick={() => setShowPopup(true)}
          >
            <Send /> Request changes
          </button>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">
              Final Request for the Changes
            </h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span> Your changes will stay
              pending until approved by the superior admin. Once approved, they
              will be applied automatically to the live site.
            </p>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Section</th>
                  <th className="text-left p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changeList.map((req, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 flex items-center space-x-2">
                      {req.type === "added" && (
                        <PlusCircle className="text-green-600" size={16} />
                      )}
                      {req.type === "deleted" && (
                        <Trash2 className="text-red-600" size={16} />
                      )}
                      {req.type === "edited" && (
                        <SquarePen className="text-blue-600" size={16} />
                      )}
                      <span className="capitalize">{req.type}</span>
                    </td>
                    <td className="p-2 capitalize">{req.section}</td>
                    <td className="p-2">
                      <button
                        className="nss-btn nss-btn-undo flex items-center gap-1"
                        onClick={() => handleUndoChange(idx)}
                      >
                        Undo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                onClick={handleFinalRequest}
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
