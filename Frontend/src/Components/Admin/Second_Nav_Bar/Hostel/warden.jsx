import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import "./warden.css";
import LoadComp from "../../LoadComp";
import { Pencil, Send, X, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

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
  const [selectedItems, setSelectedItems] = useState([]); // array of ids like "boysWardens-wdn_102"
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { section, wardenId } or null
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  useEffect(() => {
    if (hostelData?.length > 0) {
      const wardenData = hostelData.find((item) => item.category === "warden");
      const maleWardenData = hostelData.find((item) => item.category === "male_warden");
      const femaleWardenData = hostelData.find((item) => item.category === "female_warden");

      const ensureId = (w) => (w ? { ...w, id: w.id ?? nanoid() } : null);

      if (wardenData?.members?.length) {
        setChief(ensureId(wardenData.members[0] || null));
        setChiefDeputy(ensureId(wardenData.members[1] || null));
      }

      setBoysWardens((maleWardenData?.members || []).map((w) => ensureId(w)));
      setGirlsWardens((femaleWardenData?.members || []).map((w) => ensureId(w)));
    }
  }, [hostelData]);

  const isDataEqual = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

  
useEffect(() => {
  if (!isEditing || !editData || !originalData) {
    setHasChanges(false);
    return;
  }

  setHasChanges(!isDataEqual(editData, originalData));
}, [editData, originalData, isEditing]);

  const handleEdit = () => {
    const dataCopy = {
      chief: chief ? { ...chief } : null,
      chiefDeputy: chiefDeputy ? { ...chiefDeputy } : null,
      boysWardens: boysWardens.map((w) => ({ ...w })),
      girlsWardens: girlsWardens.map((w) => ({ ...w })),
    };
    setIsEditing(true);
    setEditData(dataCopy);
    setOriginalData(JSON.parse(JSON.stringify(dataCopy)));
    setHasChanges(false);
    setSelectedItems([]); // clear selections on entering edit mode
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    // setHasChanges(false);
    setSelectedItems([]);
  };

const computeFinalChanges = (updatedData) => {
  const finalChanges = [];

  const checkDiff = (orig, updated, sectionName) => {
    if (!orig || !updated) return;

    const hasChanged =
      orig.warden_name !== updated.warden_name ||
      orig.designation !== updated.designation ||
      orig.phone_number !== updated.phone_number ||
      updated.imageFile || updated.previewImage;

    if (hasChanged) {
      finalChanges.push({
        action: "Edit",
        section: sectionName,
        name: updated.warden_name || "Warden",
      });
    }
  };

  checkDiff(originalData?.chief, updatedData?.chief, "Chief");
  checkDiff(originalData?.chiefDeputy, updatedData?.chiefDeputy, "Chief Deputy");

  [
    { section: "Boys Wardens", orig: originalData?.boysWardens, updated: updatedData.boysWardens },
    { section: "Girls Wardens", orig: originalData?.girlsWardens, updated: updatedData.girlsWardens },
  ].forEach(({ section, orig = [], updated = [] }) => {

    const origMap = new Map(orig.map(w => [w.id, w]));
    const updatedMap = new Map(updated.map(w => [w.id, w]));

    updated.forEach(w => {
      const origWarden = origMap.get(w.id);

      if (!origWarden) {
        finalChanges.push({
          action: "Add",
          section,
          id: w.id,
          name: w.warden_name || "New Warden",
        });
        return;
      }

      const hasChanged =
        w.warden_name !== origWarden.warden_name ||
        w.designation !== origWarden.designation ||
        w.phone_number !== origWarden.phone_number ||
        w.imageFile || w.previewImage;

      if (hasChanged) {
        finalChanges.push({
          action: "Edit",
          section,
          id: w.id,
          name: w.warden_name || "Warden",
        });
      }
    });

    orig.forEach(w => {
      if (!updatedMap.has(w.id)) {
        finalChanges.push({
          action: "Delete",
          section,
          id: w.id,
          name: w.warden_name || "Warden",
        });
      }
    });
  });

  return finalChanges;
};


const validateRequiredFields = (data) => {
  const errors = [];

  const validateOne = (warden, label) => {
    if (!warden) return;

    if (!warden.warden_name?.trim()) {
      errors.push(`${label}: Name is required`);
    }

    if (!warden.designation?.trim()) {
      errors.push(`${label}: Designation is required`);
    }

    // image is required (either existing image_path or new previewImage)
    if (!warden.image_path && !warden.previewImage) {
      errors.push(`${label}: Image is required`);
    }
  };

  validateOne(data.chief, "Chief");
  validateOne(data.chiefDeputy, "Chief Deputy");

  data.boysWardens.forEach((w, i) =>
    validateOne(w, `Boys Warden ${i + 1}`)
  );

  data.girlsWardens.forEach((w, i) =>
    validateOne(w, `Girls Warden ${i + 1}`)
  );

  return errors;
};


const handleSave = () => {
  if (!editData) return;

  const validationErrors = validateRequiredFields(editData);

  if (validationErrors.length > 0) {
    validationErrors.forEach((msg) =>
      toast.error(msg, { autoClose: 3000 })
    );
    return; // ⛔ STOP SAVE
  }

  const updatedData = { ...editData };

  if (updatedData.chief?.previewImage)
    updatedData.chief.image_path = updatedData.chief.previewImage;

  if (updatedData.chiefDeputy?.previewImage)
    updatedData.chiefDeputy.image_path = updatedData.chiefDeputy.previewImage;

updatedData.boysWardens = updatedData.boysWardens.map((w) => ({
  ...w,
  image_path: w.image_path, // keep original path
}));

updatedData.girlsWardens = updatedData.girlsWardens.map((w) => ({
  ...w,
  image_path: w.image_path, // keep original path
}));

  setChief(updatedData.chief);
  setChiefDeputy(updatedData.chiefDeputy);
  setBoysWardens(updatedData.boysWardens);
  setGirlsWardens(updatedData.girlsWardens);

  setIsEditing(false);
  setEditData(null);
  setShowPostSaveActions(true);

  setChanges(prev => [
  ...prev,
  ...computeFinalChanges(updatedData)
]);
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
    // setHasChanges(false);
    setShowPostSaveActions(false);
    setChanges([]);
    setSelectedItems([]);
  };

const handleRequest = () => {
  const computed = computeFinalChanges({
    chief,
    chiefDeputy,
    boysWardens,
    girlsWardens
  });

  if (computed.length === 0) {
    toast.info("No changes detected");
    return;
  }

  setChanges(computed);
  setShowRequestModal(true);
};

  // updated handleChange: accepts wardenId (or for chief/chiefDeputy it ignores id)
  const handleChange = (section, wardenId, field, value) => {
    setEditData((prev) => {
      const updated = { ...prev };
      if (section === "chief" || section === "chiefDeputy") {
        updated[section] = { ...updated[section], [field]: value };
      } else {
        updated[section] = [...updated[section]];
        const idx = updated[section].findIndex((w) => w.id === wardenId);
        if (idx === -1) return prev; // safety
        updated[section][idx] = { ...updated[section][idx], [field]: value };
      }
      return updated;
    });
    // setHasChanges(true);
  };

  const handleAddWarden = (section) => {
    const newWarden = { id: nanoid(), warden_name: "", designation: "", phone_number: "", image_path: "", previewImage: "" };
    setEditData((prev) => {
      const updated = { ...prev };
      updated[section] = [...updated[section], newWarden];
      return updated;
    });
    // setHasChanges(true);
  };

const undoChange = (change) => {
  if (change.action !== "Delete") return;

  const sectionKey =
    change.section === "Boys Wardens"
      ? "boysWardens"
      : change.section === "Girls Wardens"
      ? "girlsWardens"
      : null;

  if (!sectionKey) return;

  // find original warden
  const originalWarden = originalData?.[sectionKey]?.find(
    (w) => w.warden_name === change.name
  );

  if (!originalWarden) return;

  // restore only that warden
  if (sectionKey === "boysWardens") {
    setBoysWardens((prev) => [...prev, originalWarden]);
  } else if (sectionKey === "girlsWardens") {
    setGirlsWardens((prev) => [...prev, originalWarden]);
  }

  // remove that change row from modal
  setChanges((prev) =>
    prev.filter(
      (c) =>
        !(
          c.action === change.action &&
          c.section === change.section &&
          c.name === change.name
        )
    )
  );
};

  const sectionToCategory = {
  boysWardens: "male_warden",
  girlsWardens: "female_warden",
  chief: "warden",
  chiefDeputy: "warden",
};



const handleFinalRequest = async () => {
  const payloads = [];
  const files = [];
const buildImagePath = (file) => {
  if (!file) return "";
  return `/static/images/warden_profile_photos/${file.name}`;
};

  const processSingleWarden = (sectionKey, originalWarden, updatedWarden) => {
  if (!originalWarden || !updatedWarden) return;

  const category = sectionToCategory[sectionKey];

const imagePath = updatedWarden.imageFile
  ? buildImagePath(updatedWarden.imageFile, updatedWarden.warden_name)
  : originalWarden.image_path;

  const hasChanged =
    updatedWarden.warden_name !== originalWarden.warden_name ||
    updatedWarden.designation !== originalWarden.designation ||
    updatedWarden.phone_number !== originalWarden.phone_number ||
    imagePath !== originalWarden.image_path;

  if (!hasChanged) return;

  payloads.push({
    collection_type: "warden",
    action: "update",
    collectionName: "hostel_details",
    category,
    title: "Update Hostel Warden",

    original_data: {
      warden_name: originalWarden.warden_name,
      designation: originalWarden.designation,
      phone_number: originalWarden.phone_number,
      image_path: originalWarden.image_path,
    },

    // ✅ FULL UPDATED DATA
    meta_data: {
      warden_name: updatedWarden.warden_name,
      designation: updatedWarden.designation,
      phone_number: updatedWarden.phone_number,
      image_path: imagePath,
    },
  });

if (updatedWarden.imageFile) {
  files.push(updatedWarden.imageFile);
}
};


  const processSection = (sectionKey, originalList = [], updatedList = []) => {
    const category = sectionToCategory[sectionKey];

    const origMap = new Map(originalList.map(w => [w.id, w]));
    const updatedMap = new Map(updatedList.map(w => [w.id, w]));

    // ---------- INSERT ----------
    updatedList.forEach(w => {
      if (!origMap.has(w.id)) {
        const imagePath = buildImagePath(w.imageFile);

        payloads.push({
          collection_type: "warden",
          action: "insert",
          collectionName: "hostel_details",
          category,
          title: "Insert Hostel Warden",
          meta_data: {
            warden_name: w.warden_name,
            designation: w.designation,
            phone_number: w.phone_number,
            image_path: imagePath,
          },
        });

if (w.imageFile) {
  files.push(w.imageFile);
}
      }
    });

// ---------- UPDATE (SEND FULL UPDATED DATA) ----------
updatedList.forEach(w => {
  const orig = origMap.get(w.id);
  if (!orig) return;

const imagePath = w.imageFile
  ? buildImagePath(w.imageFile, w.warden_name)
  : orig.image_path;

const hasChanged =
  w.warden_name !== orig.warden_name ||
  w.designation !== orig.designation ||
  w.phone_number !== orig.phone_number ||
  w.imageFile; // image changed

  if (!hasChanged) return;

  payloads.push({
    collection_type: "warden",
    action: "update",
    collectionName: "hostel_details",
    category,
    title: "Update Hostel Warden",

    // 🔍 ORIGINAL (for audit / approval)
    original_data: {
      warden_name: orig.warden_name,
      designation: orig.designation,
      phone_number: orig.phone_number,
      image_path: orig.image_path,
    },

    // ✅ FULL UPDATED STATE (NOT PARTIAL)
    meta_data: {
      warden_name: w.warden_name,
      designation: w.designation,
      phone_number: w.phone_number,
      image_path: imagePath,
    },
  });

if (w.imageFile) {
  files.push(w.imageFile);
}
});


    // ---------- DELETE ----------
    originalList.forEach(w => {
      if (!updatedMap.has(w.id)) {
        payloads.push({
          collection_type: "warden",
          action: "delete",
          collectionName: "hostel_details",
          category,
          title: "Delete Hostel Warden",
          meta_data: {
            warden_name: w.warden_name,
            designation: w.designation,
            phone_number: w.phone_number,
            image_path: w.image_path,
          },
        });
      }
    });
  };
  
  processSingleWarden("chief", originalData.chief, chief);
processSingleWarden("chiefDeputy", originalData.chiefDeputy, chiefDeputy);

processSection("boysWardens", originalData.boysWardens, boysWardens);
processSection("girlsWardens", originalData.girlsWardens, girlsWardens);

if (payloads.length === 0) {
  toast.info("No changes to submit");
  return;
}
console.log("files",files);

try {
  await sendRequest(payloads, files); // 🔥 SINGLE REQUEST

  toast.success("Request submitted successfully!");
  setShowRequestModal(false);
  setShowPostSaveActions(false);
  setChanges([]);
} catch (err) {
  toast.error("Failed to submit request");
}
};




  // --- Selection helpers ---
  const itemId = (section, wardenId) => `${section}-${wardenId}`;

  const handleToggleSelect = (section, wardenId) => {
    const id = itemId(section, wardenId);
    setSelectedItems((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  };

  // --- Delete logic ---
  const confirmDelete = () => {
    if (!isEditing) {
      setDeleteConfirm(null);
      setShowMultiDeleteConfirm(false);
      return;
    }

    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };

      // Single delete
      if (deleteConfirm) {
        const { section, wardenId } = deleteConfirm;
        if (updated[section]) {
          updated[section] = updated[section].filter((w) => w.id !== wardenId);
        }
      }

      // Multi delete
      if (showMultiDeleteConfirm && selectedItems.length > 0) {
        const removal = new Set(
  selectedItems.map((id) => id.substring(id.indexOf("-") + 1))
);

        ["boysWardens", "girlsWardens"].forEach((section) => {
          if (updated[section]) {
            updated[section] = updated[section].filter((w) => !removal.has(w.id));
          }
        });
      }

      return updated;
    });

    // cleanup
    // setHasChanges(true);
    setSelectedItems([]);
    setDeleteConfirm(null);
    setShowMultiDeleteConfirm(false);
  };

  // If user cancels delete modal
  const cancelDelete = () => {
    setDeleteConfirm(null);
    setShowMultiDeleteConfirm(false);
  };

if (
  chief === null ||
  chiefDeputy === null ||
  boysWardens === null ||
  girlsWardens === null
) {
  return (
    <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
      <LoadComp />
    </div>
  );
}

  const renderWardenCard = (warden, section) => {
    const isSelectableSection = section === "boysWardens" || section === "girlsWardens";
    const id = warden?.id ? itemId(section, warden.id) : `${section}-top`;

    return (
      <div key={warden?.id ?? `${section}-top`} className="warden-card-flex relative">
                {/* top-right checkbox (only show for boys/girls and only in edit mode) */}
        {isEditing && isSelectableSection && (
          <label className="absolute top-2 right-2 flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.includes(id)}
              onChange={() => handleToggleSelect(section, warden.id)}
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
                id={`replace-image-${section}-${warden.id}`}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    handleChange(section, warden.id, "previewImage", previewUrl);
                    handleChange(section, warden.id, "imageFile", file); // ✅ IMPORTANT
                  }
                }}
              />
              <label
                htmlFor={`replace-image-${section}-${warden.id}`}
                className={`mt-2 px-3 py-1 text-xs rounded cursor-pointer transition ${
                  warden.previewImage || warden.image_path ? "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim" : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
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
                placeholder="Warden Name"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#fdcc03] mb-1"
                value={warden?.warden_name || ""}
                onChange={(e) => handleChange(section, warden.id, "warden_name", e.target.value)}
              />
              <input
                type="text"
                placeholder="Designation"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#fdcc03] mb-1"
                value={warden?.designation || ""}
                onChange={(e) => handleChange(section, warden.id, "designation", e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#fdcc03]"
                value={warden?.phone_number || ""}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                  if (value.length <= 10) {
                    handleChange(section, warden.id, "phone_number", value);
                  }
                }}
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
        <ToastContainer position="bottom-right" autoClose={3000} />
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
        {[isEditing ? editData?.chief : chief, isEditing ? editData?.chiefDeputy : chiefDeputy].map((warden, idx) =>
          renderWardenCard(warden, idx === 0 ? "chief" : "chiefDeputy")
        )}
      </div>

      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 font-[poppins] mb-2">Boys Warden</h2>
      <div className="warden-row font-[poppins]">
        {(isEditing ? editData?.boysWardens : boysWardens).map((warden) => renderWardenCard(warden, "boysWardens"))}
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
        {(isEditing ? editData?.girlsWardens : girlsWardens).map((warden) => renderWardenCard(warden, "girlsWardens"))}
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
        <div className="w-full flex justify-end gap-4 mt-6 mb-2 pr-9">
          <button className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" onClick={handleCancel}>
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
        <div className="w-full flex justify-end gap-4 mt-6 mb-2 pr-9">
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
            <p className="text-sm text-red-500 mb-4">Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.</p>

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
                      <button onClick={() => undoChange(change)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
  disabled={loading}
  className={`px-4 py-2 rounded flex items-center gap-2
    ${loading
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
    }`}
>
  {loading ? "Submitting..." : "Confirm Request"}
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
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Multi delete confirmation modal */}
      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
            <p className="text-sm mb-4 text-center">Are you sure you want to delete the selected {selectedItems.length} member</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowMultiDeleteConfirm(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
