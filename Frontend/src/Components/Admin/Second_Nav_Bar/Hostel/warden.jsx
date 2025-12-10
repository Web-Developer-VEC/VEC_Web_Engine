import { useEffect, useState } from "react";
import "./warden.css";
import LoadComp from "../../LoadComp";
import { Pencil, Send, X, Trash2 } from "lucide-react";

export default function AdminWarden({ hostelData }) {
  const [chief, setChief] = useState(null);
  const [chiefDeputy, setChiefDeputy] = useState(null);
  const [boysWardens, setBoysWardens] = useState([]);
  const [girlsWardens, setGirlsWardens] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPostSaveActions, setShowPostSaveActions] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [changes, setChanges] = useState([]);

  // selection & delete states
  const [selectedItems, setSelectedItems] = useState([]); // array of ids like "boysWardens-2"
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { section, index } or null
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  useEffect(() => {
    if (hostelData?.length > 0) {
      const wardenData = hostelData.find((item) => item.category === "warden");
      const maleWardenData = hostelData.find((item) => item.category === "male_warden");
      const femaleWardenData = hostelData.find((item) => item.category === "female_warden");

      if (wardenData?.members?.length) {
        setChief(wardenData.members[0] || null);
        setChiefDeputy(wardenData.members[1] || null);
      }

      setBoysWardens(maleWardenData?.members || []);
      setGirlsWardens(femaleWardenData?.members || []);
    }
  }, [hostelData]);

  const handleEdit = () => {
    const dataCopy = {
      chief: { ...chief },
      chiefDeputy: { ...chiefDeputy },
      boysWardens: [...boysWardens],
      girlsWardens: [...girlsWardens],
    };
    setIsEditing(true);
    setEditData(dataCopy);
    setOriginalData(dataCopy);
    setHasChanges(false);
    setSelectedItems([]); // clear selections on entering edit mode
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setHasChanges(false);
    setSelectedItems([]);
  };

  const computeFinalChanges = (updatedData) => {
    const finalChanges = [];

    const checkDiff = (orig, updated, sectionName) => {
      if (!orig) return;
      if (orig.warden_name !== updated.warden_name)
        finalChanges.push({ action: "Edit", section: sectionName, name: updated.warden_name });
      if (orig.designation !== updated.designation)
        finalChanges.push({ action: "Edit", section: sectionName, name: updated.designation });
      if (orig.phone_number !== updated.phone_number)
        finalChanges.push({ action: "Edit", section: sectionName, name: updated.phone_number });
      if (orig.image_path !== updated.image_path)
        finalChanges.push({ action: "Edit", section: sectionName, name: "Image Changed" });
    };

    checkDiff(originalData.chief, updatedData.chief, "Chief");
    checkDiff(originalData.chiefDeputy, updatedData.chiefDeputy, "Chief Deputy");

    ["Boys Wardens", "Girls Wardens"].forEach((sec, i) => {
      const dataArray = i === 0 ? updatedData.boysWardens : updatedData.girlsWardens;
      const origArray = i === 0 ? originalData.boysWardens : originalData.girlsWardens;
      dataArray.forEach((w, idx) => {
        if (!origArray[idx]) {
          finalChanges.push({ action: "Add", section: sec, name: w.warden_name || "New Warden" });
        } else {
          checkDiff(origArray[idx], w, sec);
        }
      });
    });

    return finalChanges;
  };

  const handleSave = () => {
    const updatedData = { ...editData };

    if (updatedData.chief?.previewImage) updatedData.chief.image_path = updatedData.chief.previewImage;
    if (updatedData.chiefDeputy?.previewImage)
      updatedData.chiefDeputy.image_path = updatedData.chiefDeputy.previewImage;
    updatedData.boysWardens = updatedData.boysWardens.map((w) =>
      w.previewImage ? { ...w, image_path: w.previewImage } : w
    );
    updatedData.girlsWardens = updatedData.girlsWardens.map((w) =>
      w.previewImage ? { ...w, image_path: w.previewImage } : w
    );

    setChief(updatedData.chief);
    setChiefDeputy(updatedData.chiefDeputy);
    setBoysWardens(updatedData.boysWardens);
    setGirlsWardens(updatedData.girlsWardens);

    setIsEditing(false);
    setHasChanges(false);
    setEditData(null);
    setShowPostSaveActions(true);

    const finalChanges = computeFinalChanges(updatedData);
    setChanges(finalChanges);
    setSelectedItems([]);
  };

  const handleDiscardChanges = () => {
    if (originalData) {
      setChief(originalData.chief);
      setChiefDeputy(originalData.chiefDeputy);
      setBoysWardens(originalData.boysWardens);
      setGirlsWardens(originalData.girlsWardens);
    }
    setEditData(null);
    setIsEditing(false);
    setHasChanges(false);
    setShowPostSaveActions(false);
    setChanges([]);
    setSelectedItems([]);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleChange = (section, index, field, value) => {
    setEditData((prev) => {
      const updated = { ...prev };
      if (section === "chief" || section === "chiefDeputy") {
        updated[section] = { ...updated[section], [field]: value };
      } else {
        updated[section] = [...updated[section]];
        updated[section][index] = { ...updated[section][index], [field]: value };
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleAddWarden = (section) => {
    const newWarden = { warden_name: "", designation: "", phone_number: "", image_path: "", previewImage: "" };
    setEditData((prev) => {
      const updated = { ...prev };
      updated[section] = [...updated[section], newWarden];
      return updated;
    });
    setHasChanges(true);
  };

  const undoChange = (change) => {
    // revert this change locally before sending request
    handleDiscardChanges(); // simple way: revert everything
  };

  const handleFinalRequest = () => {
    setShowRequestModal(false);
    setShowPostSaveActions(false);
    setChanges([]);
  };

  // --- Selection helpers ---
  const itemId = (section, index) => `${section}-${index}`;

  const handleToggleSelect = (section, index) => {
    const id = itemId(section, index);
    setSelectedItems((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  };

  // --- Delete logic ---
  const confirmDelete = () => {
    // Single delete (deleteConfirm set) OR multi delete (showMultiDeleteConfirm)
    if (!isEditing) {
      // only allow deletions while editing in this flow
      setDeleteConfirm(null);
      setShowMultiDeleteConfirm(false);
      return;
    }

    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };

      // Single delete
      if (deleteConfirm) {
        const { section, index } = deleteConfirm;
        updated[section] = updated[section].filter((_, i) => i !== index);
      }

      // Multi delete
      if (showMultiDeleteConfirm && selectedItems.length > 0) {
        // build a map of section -> set of indices to remove
        const removal = {};
        selectedItems.forEach((id) => {
          const [section, idxStr] = id.split("-");
          const idx = parseInt(idxStr, 10);
          if (!removal[section]) removal[section] = new Set();
          removal[section].add(idx);
        });

        ["boysWardens", "girlsWardens"].forEach((section) => {
          if (updated[section]) {
            updated[section] = updated[section].filter((_, i) => !removal[section]?.has(i));
          }
        });
      }

      return updated;
    });

    // cleanup
    setHasChanges(true);
    setSelectedItems([]);
    setDeleteConfirm(null);
    setShowMultiDeleteConfirm(false);
  };

  // If user cancels delete modal
  const cancelDelete = () => {
    setDeleteConfirm(null);
    setShowMultiDeleteConfirm(false);
  };

  if (!chief || !chiefDeputy || boysWardens.length === 0 || girlsWardens.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const renderWardenCard = (warden, section, index) => {
    const isSelectableSection = section === "boysWardens" || section === "girlsWardens";
    const id = index !== null && index !== undefined ? itemId(section, index) : `${section}-top`;

    return (
      <div key={id} className="warden-card-flex relative">
        
        {/* top-right checkbox (only show for boys/girls and only in edit mode) */}
        {isEditing && isSelectableSection && (
          <label className="absolute top-2 right-2 flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.includes(id)}
              onChange={() => handleToggleSelect(section, index)}
              className="w-3 h-3"
            />
          </label>
        )}

        <div className="flex flex-col items-center">
          <img
            src={warden.previewImage || UrlParser(warden?.image_path) || "/placeholder.png"}
            alt={warden?.warden_name || "Warden"}
            className="w-32 h-32 object-cover rounded"
          />
          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`replace-image-${section}-${index}`}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    handleChange(section, index, "previewImage", previewUrl);
                  }
                }}
              />
              <label
                htmlFor={`replace-image-${section}-${index}`}
                className={`mt-2 px-3 py-1 text-xs rounded cursor-pointer transition ${
                  warden.previewImage || warden.image_path
                    ? "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                    : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                }`}
              >
                {warden.previewImage || warden.image_path ? "Replace" : "Upload"}
              </label>
            </>
          )}
        </div>

        <div className="warden-info">
          {isEditing ? (
            <>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#fdcc03] mb-1"
                value={warden?.warden_name || ""}
                onChange={(e) => handleChange(section, index, "warden_name", e.target.value)}
              />
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#fdcc03] mb-1"
                value={warden?.designation || ""}
                onChange={(e) => handleChange(section, index, "designation", e.target.value)}
              />
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#fdcc03]"
                value={warden?.phone_number || ""}
                onChange={(e) => handleChange(section, index, "phone_number", e.target.value)}
              />
            </>
          ) : (
            <>
              <p>{warden?.warden_name}</p>
              <p>{warden?.designation}</p>
              {warden?.phone_number && <a href={`tel:${warden?.phone_number}`}>{warden?.phone_number}</a>}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative mt-10">
        <h2 className="warden-heading1 text-brwn text-3xl font-bold dark:text-drkt font-[poppins]">Wardens</h2>
        {!isEditing && (
          <button
            className="absolute top-6 right-8 flex items-center gap-2 px-4 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
            onClick={handleEdit}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <div className="warden-top-column font-[poppins]">
        {[isEditing ? editData?.chief : chief, isEditing ? editData?.chiefDeputy : chiefDeputy].map(
          (warden, index) => renderWardenCard(warden, index === 0 ? "chief" : "chiefDeputy", null)
        )}
      </div>

      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 font-[poppins] mb-2">Boys Warden</h2>
      <div className="warden-row font-[poppins]">
        {(isEditing ? editData?.boysWardens : boysWardens).map((warden, index) =>
          renderWardenCard(warden, "boysWardens", index)
        )}
        {isEditing && (
          <div
            className="warden-card-flex flex-col items-center justify-center border border-dashed border-gray-400 rounded w-32 h-32 cursor-pointer hover:bg-gray-100"
            onClick={() => handleAddWarden("boysWardens")}
          >
            <span className="text-3xl font-bold text-gray-500">+</span>
          </div>
        )}
      </div>

      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 font-[poppins] mb-2">Girls Warden</h2>
      <div className="warden-row font-[poppins]">
        {(isEditing ? editData?.girlsWardens : girlsWardens).map((warden, index) =>
          renderWardenCard(warden, "girlsWardens", index)
        )}
        {isEditing && (
          <div
            className="warden-card-flex flex-col items-center justify-center border border-dashed border-gray-400 rounded w-32 h-32 cursor-pointer hover:bg-gray-100"
            onClick={() => handleAddWarden("girlsWardens")}
          >
            <span className="text-3xl font-bold text-gray-500">+</span>
          </div>
        )}
      </div>

      {/* edit/save controls */}
      {isEditing && (
        <div className="w-full flex justify-end gap-4 mt-6 mb-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
      )}

      {/* Multi-delete action when editing and items selected */}
      {isEditing && selectedItems.length > 0 && (
        <div className="hos-delete-action flex justify-center mt-6 mb-4">
          <button
            onClick={() => setShowMultiDeleteConfirm(true)}
            className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete ({selectedItems.length})
          </button>
        </div>
      )}

      {!isEditing && showPostSaveActions && (
        <div className="w-full flex justify-end gap-4 mt-6 mb-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            onClick={handleDiscardChanges}
          >
            Discard Changes
          </button>
          <button
            className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim flex items-center gap-2 transition"
            onClick={handleRequest}
          >
            <Send size={16} /> Request
          </button>
        </div>
      )}

      {/* Request modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[40%] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-drkt">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            <table className="w-full border border-gray-300 text-sm text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-blue-600">{change.action}</td>
                    <td className="border p-2">{change.section}</td>
                    <td className="border p-2">{change.name}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => undoChange(change)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Revert this change"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-white">
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">Are you sure you want to delete this member?</p>
            <div className="flex justify-center gap-3">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-400 text-white rounded">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi delete confirmation modal */}
      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">
              Are you sure you want to delete the selected {selectedItems.length} member
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowMultiDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
