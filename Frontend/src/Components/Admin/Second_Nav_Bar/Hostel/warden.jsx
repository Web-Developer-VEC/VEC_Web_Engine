import { useEffect, useState } from "react";
import "./warden.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2 } from "lucide-react";

export default function Warden({ hostelData }) {
  const [chief, setChief] = useState(null);
  const [chiefDeputy, setChiefDeputy] = useState(null);
  const [boysWardens, setBoysWardens] = useState([]);
  const [girlsWardens, setGirlsWardens] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (hostelData?.length > 0) {
      const wardenData = hostelData.find((i) => i.category === "warden");
      const maleWardenData = hostelData.find((i) => i.category === "male_warden");
      const femaleWardenData = hostelData.find((i) => i.category === "female_warden");

      setChief(wardenData?.members?.[0] || null);
      setChiefDeputy(wardenData?.members?.[1] || null);
      setBoysWardens(maleWardenData?.members || []);
      setGirlsWardens(femaleWardenData?.members || []);

      setOriginalData({
        chief: wardenData?.members?.[0] || null,
        chiefDeputy: wardenData?.members?.[1] || null,
        boysWardens: maleWardenData?.members || [],
        girlsWardens: femaleWardenData?.members || [],
      });
    }
  }, [hostelData]);

  useEffect(() => {
    if (!originalData) return;
    const changed =
      JSON.stringify(chief) !== JSON.stringify(originalData.chief) ||
      JSON.stringify(chiefDeputy) !== JSON.stringify(originalData.chiefDeputy) ||
      JSON.stringify(boysWardens) !== JSON.stringify(originalData.boysWardens) ||
      JSON.stringify(girlsWardens) !== JSON.stringify(originalData.girlsWardens);
    setHasChanges(changed);
  }, [chief, chiefDeputy, boysWardens, girlsWardens, originalData]);

  const handlePhoneInput = (e) => e.target.value.replace(/\D/g, "").slice(0, 10);

  const handleEdit = (type, index, field, value) => {
    if (type === "chief") setChief({ ...chief, [field]: value });
    if (type === "chiefDeputy") setChiefDeputy({ ...chiefDeputy, [field]: value });
    if (type === "boysWardens") {
      const arr = [...boysWardens];
      arr[index] = { ...arr[index], [field]: value };
      setBoysWardens(arr);
    }
    if (type === "girlsWardens") {
      const arr = [...girlsWardens];
      arr[index] = { ...arr[index], [field]: value };
      setGirlsWardens(arr);
    }
  };

  const handleImageUpload = (type, index, file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    if (type === "chief") setChief({ ...chief, image_path: imageUrl });
    if (type === "chiefDeputy") setChiefDeputy({ ...chiefDeputy, image_path: imageUrl });
    if (type === "boysWardens") {
      const arr = [...boysWardens];
      arr[index] = { ...arr[index], image_path: imageUrl };
      setBoysWardens(arr);
    }
    if (type === "girlsWardens") {
      const arr = [...girlsWardens];
      arr[index] = { ...arr[index], image_path: imageUrl };
      setGirlsWardens(arr);
    }
  };

  const cancelChanges = () => {
    setChief(originalData.chief);
    setChiefDeputy(originalData.chiefDeputy);
    setBoysWardens(originalData.boysWardens);
    setGirlsWardens(originalData.girlsWardens);
    setHasChanges(false);
    toast.info("Recent changes discarded");
  };

  const discardAllChanges = () => {
    setChief(originalData.chief);
    setChiefDeputy(originalData.chiefDeputy);
    setBoysWardens(originalData.boysWardens);
    setGirlsWardens(originalData.girlsWardens);
    setHasChanges(false);
    setEditMode(false);
    toast.info("All changes discarded");
  };

  const handleSave = () => {
    toast.success("Saved successfully!");
  };

  const handleRequestConfirm = () => {
    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
    setEditMode(false);
    setHasChanges(false);
  };

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const WardenCard = ({ warden, type, index, isEditable }) => {
    if (!warden) return null;
    return (
      <div className="warden-card-flex border p-2 rounded relative">
        {editMode && (
          <input
            type="checkbox"
            className="absolute top-2 left-2"
            checked={selectedItems.includes(warden.warden_name)}
            onChange={() => toggleSelection(warden.warden_name)}
          />
        )}
        <div className="warden-image-container">
          <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
          {isEditable && (
            <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(type, index, e.target.files[0])}
              />
            </label>
          )}
        </div>
        <div className="warden-info-ed">
          {isEditable ? (
            <>
              <input
                type="text"
                value={warden.warden_name || ""}
                onChange={(e) => handleEdit(type, index, "warden_name", e.target.value)}
                className="warden-edit-input"
                placeholder="Warden Name"
              />
              <input
                type="text"
                value={warden.designation || ""}
                onChange={(e) => handleEdit(type, index, "designation", e.target.value)}
                className="warden-edit-input"
                placeholder="Designation"
              />
              <input
                type="text"
                value={warden.phone_number || ""}
                onChange={(e) => handleEdit(type, index, "phone_number", handlePhoneInput(e))}
                className="warden-edit-input"
                placeholder="Phone Number"
              />
            </>
          ) : (
            <>
              <p>{warden.warden_name}</p>
              <p>{warden.designation}</p>
              {warden.phone_number && <a href={`tel:${warden.phone_number}`}>{warden.phone_number}</a>}
            </>
          )}
        </div>
      </div>
    );
  };

  if (!chief || !chiefDeputy || boysWardens.length === 0 || girlsWardens.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      {/* Top right edit */}
      {!editMode && (
        <div className="flex justify-end mt-3 mr-5">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            onClick={() => setEditMode(true)}
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      )}

      <h2 className="warden-heading1 text-brwn text-3xl font-bold dark:text-drkt mt-10 font-[poppins]">
        Wardens
      </h2>

      <div className="warden-top-column font-[poppins]">
        <WardenCard warden={chief} type="chief" index={0} isEditable={editMode} />
        <WardenCard warden={chiefDeputy} type="chiefDeputy" index={0} isEditable={editMode} />
      </div>

      {/* Boys */}
      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 font-[poppins]">
        Boys Wardens
      </h2>
      <div className="warden-row">
        {boysWardens.map((w, i) => (
          <WardenCard key={i} warden={w} type="boysWardens" index={i} isEditable={editMode} />
        ))}
      </div>

      {/* Girls */}
      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 font-[poppins]">
        Girls Wardens
      </h2>
      <div className="warden-row">
        {girlsWardens.map((w, i) => (
          <WardenCard key={i} warden={w} type="girlsWardens" index={i} isEditable={editMode} />
        ))}
      </div>

      {/* Bottom right buttons */}
      {editMode && !hasChanges && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={cancelChanges}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      {editMode && hasChanges && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={cancelChanges}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            Save
          </button>
        </div>
      )}

      {!editMode && hasChanges && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={discardAllChanges}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Discard Changes
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            Request
          </button>
        </div>
      )}

      {/* Multi delete */}
      {editMode && selectedItems.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2">
            <Trash2 size={16} /> Delete ({selectedItems.length})
          </button>
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">Request</h2>
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
                    <th className="py-1">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="text-blue-600 py-1">Edited</td>
                    <td className="py-1">Wardens</td>
                    <td className="py-1 text-[12px]">Sample change</td>
                  </tr>
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
                className="px-4 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
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
