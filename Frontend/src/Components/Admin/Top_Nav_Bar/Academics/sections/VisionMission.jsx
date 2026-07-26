import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VisionMission.css";
import LoadComp from "../../../LoadComp";
import { Pencil, X, Trash2, Send } from "lucide-react";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VisionMission = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Department mapping
  const deptMap = {
    "001": "AIDS_001",
    "002": "MECH_002",
    "003": "ECE_003",
    "004": "CIVIL_004",
    "005": "CSE_005",
    "006": "EEE_006",
    "007": "CHEM_007",
    "008": "AUTO_008",
    "009": "AERO_009",
    "010": "PROD_010",
    "011": "BIO_011",
    "012": "TEXTILE_012",
    "013": "APPAREL_013",
    "014": "CIVIL_INFRA_014",
    "015": "FOOD_015",
    "016": "BIOTECH_016",
    "017": "AGRI_017",
    "018": "PS_018"
  };

  // Extract deptId from data
  const deptId = data?.find((item) => item.category === "banner")?.deptId || "005";
  const collectionName = deptMap[deptId] || "CSE_005";

  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [formData, setFormData] = useState(() => {
    const aboutContent = data?.find((item) => item.category === "about_the_department")?.content;
    return {
      about: Array.isArray(aboutContent) ? aboutContent[0] || "" : (aboutContent || ""),
      vision:
        data?.find((item) => item.category === "department_vision")?.content ||
        [],
      mission:
        data?.find((item) => item.category === "department_mission")?.content ||
        [],
      peo:
        data?.find((item) => item.category === "programme_educational_objectives")
          ?.content || [],
      po:
        data?.find((item) => item.category === "program_outcomes")?.content || [],
      pso:
        data?.find((item) => item.category === "program_specific_outcomes")
          ?.content || [],
      banner:
        data?.find((item) => item.category === "banner_name_and_image")
          ?.content || [],
    };
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(JSON.parse(JSON.stringify(formData)));
  const [savedData, setSavedData] = useState(null); // Data snapshot after save

  // Track selected items for deletion (PEO, PO, PSO only)
  const [selectedItems, setSelectedItems] = useState({
    peo: [],
    po: [],
    pso: [],
  });

  // Track modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // NEW: for vision/mission trash delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showItemDeleteModal, setShowItemDeleteModal] = useState(false);

  // Track if we are in request mode (after Save)
  const [requestMode, setRequestMode] = useState(false);

  // Changes tracking
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    setHasChanges(
      backupData ? JSON.stringify(formData) !== JSON.stringify(backupData) : false
    );
  }, [formData, backupData]);

  // Compute changes for request modal
  useEffect(() => {
    if (savedData) {
      console.log("useEffect is running");
      const newChanges = [];

      // Check about_the_department
      if (JSON.stringify(savedData.about) !== JSON.stringify(initialData.about)) {
        newChanges.push({
          action: "update",
          category: "about_the_department",
          field: "about",
          type: "text",
        });
      }

      // Check department_vision
      const visionChanges = detectArrayChanges(
        initialData.vision,
        savedData.vision,
        "department_vision",
        "text"
      );
      newChanges.push(...visionChanges);

      // Check department_mission
      const missionChanges = detectArrayChanges(
        initialData.mission,
        savedData.mission,
        "department_mission",
        "text"
      );
      newChanges.push(...missionChanges);

      // Check PEO
      // Check PEO
      console.log("Initial PEO:", initialData.peo);
      console.log("Saved PEO:", savedData.peo);

      const peoChanges = detectObjectArrayChanges(
        initialData.peo,
        savedData.peo,
        "programme_educational_objectives"
      );
      newChanges.push(...peoChanges);

      // Check PO
      const poChanges = detectObjectArrayChanges(
        initialData.po,
        savedData.po,
        "program_outcomes"
      );
      newChanges.push(...poChanges);

      // Check PSO
      const psoChanges = detectObjectArrayChanges(
        initialData.pso,
        savedData.pso,
        "program_specific_outcomes"
      );
      newChanges.push(...psoChanges);

      setChanges(newChanges);
    }
  }, [savedData, initialData]);

  // Helper: detect changes in simple arrays
  const detectArrayChanges = (original, current, category, type) => {
    const changes = [];

    // Detect updates - compare items at same index
    const maxLen = Math.max(original.length, current.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= original.length && i < current.length) {
        // New item inserted
        changes.push({
          action: "insert",
          category,
          field: type,
          index: i,
          value: current[i],
        });
      } else if (i < original.length && i >= current.length) {
        // Item deleted
        changes.push({
          action: "delete",
          category,
          field: type,
          index: i,
          value: original[i],
        });
      } else if (original[i] !== current[i]) {
        // Item updated
        changes.push({
          action: "update",
          category,
          field: type,
          index: i,
          oldValue: original[i],
          value: current[i],
        });
      }
    }

    return changes;
  };

  // Helper: detect changes in object arrays (PEO, PO, PSO)

  const detectObjectArrayChanges = (original, current, category) => {
    const changes = [];

    const maxLen = Math.max(original.length, current.length);

    for (let i = 0; i < maxLen; i++) {

      // Added
      if (i >= original.length) {
        changes.push({
          action: "insert",
          category,
          field: "object",
          index: i,
          value: current[i],
        });
        continue;
      }

      // Deleted
      if (i >= current.length) {
        changes.push({
          action: "delete",
          category,
          field: "object",
          index: i,
          value: original[i],
        });
        continue;
      }

      // Updated
      if (
        original[i].header !== current[i].header ||
        original[i].content !== current[i].content
      ) {
        changes.push({
          action: "update",
          category,
          field: "object",
          index: i,
          oldValue: original[i],
          value: current[i],
        });
      }
    }

    return changes;
  };

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );

  const handleEdit = () => {
    setBackupData(JSON.parse(JSON.stringify(formData)));
    setInitialData(JSON.parse(JSON.stringify(formData))); // track original
    setSavedData(null);
    setChanges([]);
    setIsEditing(true);
    setRequestMode(false);
  };

  const handleCancel = () => {
    setFormData(backupData);
    setIsEditing(false);
    setSelectedItems({ peo: [], po: [], pso: [] });
    setRequestMode(false);
    setSavedData(null);
    setChanges([]);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(formData))); // Save snapshot
    setIsEditing(false);
    setSelectedItems({ peo: [], po: [], pso: [] });
    setRequestMode(true); // enable request/discard mode
  };

  const handleDiscardChanges = () => {
    setFormData(initialData); // Revert to initial data
    setBackupData(JSON.parse(JSON.stringify(initialData)));
    setSavedData(null);
    setChanges([]);
    setRequestMode(false);
  };

  const handleCheckboxChange = (type, index) => {
    setSelectedItems((prev) => {
      const updated = [...prev[type]];
      if (updated.includes(index)) {
        return { ...prev, [type]: updated.filter((i) => i !== index) };
      } else {
        return { ...prev, [type]: [...updated, index] };
      }
    });
  };

  // Build payload based on changes
  const buildPayload = () => {
    const payload = [];
    const categoriesProcessed = new Set();

    changes.forEach((change) => {
      if (change.category === "about_the_department") {
        if (!categoriesProcessed.has("about_the_department")) {
          payload.push({
            collectionName,
            collection_type: "vision_and_mission",
            action: "update",
            title: "update Vision and Mission",
            category: "about_the_department",
            meta_data: [savedData.about],
            original_data: [initialData.about],
          });
          categoriesProcessed.add("about_the_department");
        }
      } else if (change.category === "department_vision") {
        // For any vision change (insert/update/delete), send entire array as update
        if (!categoriesProcessed.has("department_vision")) {
          payload.push({
            collectionName,
            collection_type: "vision_and_mission",
            action: "update",
            title: "update Vision and Mission",
            category: "department_vision",
            meta_data: savedData.vision,
            original_data: initialData.vision,
          });
          categoriesProcessed.add("department_vision");
        }
      } else if (change.category === "department_mission") {
        // For any mission change (insert/update/delete), send entire array as update
        if (!categoriesProcessed.has("department_mission")) {
          payload.push({
            collectionName,
            collection_type: "vision_and_mission",
            action: "update",
            title: "update Vision and Mission",
            category: "department_mission",
            meta_data: savedData.mission,
            original_data: initialData.mission,
          });
          categoriesProcessed.add("department_mission");
        }
      } else if (
        ["programme_educational_objectives", "program_outcomes", "program_specific_outcomes"].includes(change.category)
      ) {
        if (change.action === "insert") {
          payload.push({
            collectionName,
            collection_type: "vision_and_mission",
            action: "insert",
            title: "Insert Vision and Mission",
            category: change.category,
            meta_data: change.value,
          });
        } else if (change.action === "update") {
          payload.push({
            collectionName,
            collection_type: "vision_and_mission",
            action: "update",
            title: "update Vision and Mission",
            category: change.category,
            meta_data: change.value,
            original_data: change.oldValue,
          });
        } else if (change.action === "delete") {
          payload.push({
            collectionName,
            collection_type: "vision_and_mission",
            action: "delete",
            title: "delete Vision and Mission",
            category: change.category,
            meta_data: change.value,
          });
        }
      }
    });

    return payload;
  };

  // Send request
  const handleRequestConfirm = async () => {
    const payload = buildPayload();

    if (payload.length === 0) {
      toast.info("No changes to request");
      setShowRequestModal(false);
      return;
    }

    console.log(payload);


    try {
      await sendRequest(payload, []);
      //toast.success("Request sent successfully!");

      // Update baseline
      setInitialData(JSON.parse(JSON.stringify(savedData)));
      setBackupData(JSON.parse(JSON.stringify(savedData)));
      setSavedData(null);
      setChanges([]);
      setRequestMode(false);
      setShowRequestModal(false);
    } catch (error) {
      console.error("Request failed:", error);
      toast.error("Failed to send request");
    }
  };

  // Revert individual change
  const revertChange = (changeIndex) => {
    const change = changes[changeIndex];

    if (!change) return;

    if (change.category === "about_the_department") {
      setSavedData((prev) => ({ ...prev, about: initialData.about }));
    } else if (change.category === "department_vision") {
      setSavedData((prev) => ({ ...prev, vision: [...initialData.vision] }));
    } else if (change.category === "department_mission") {
      setSavedData((prev) => ({ ...prev, mission: [...initialData.mission] }));
    } else if (change.category === "programme_educational_objectives") {
      if (change.action === "insert") {
        setSavedData((prev) => ({
          ...prev,
          peo: prev.peo.filter((_, i) => i !== change.index),
        }));
      } else if (change.action === "delete") {
        setSavedData((prev) => {
          const newPeo = [...prev.peo];
          newPeo.splice(change.index, 0, change.value);
          return { ...prev, peo: newPeo };
        });
      } else if (change.action === "update") {
        setSavedData((prev) => {
          const newPeo = [...prev.peo];
          newPeo[change.index] = change.oldValue;
          return { ...prev, peo: newPeo };
        });
      }
    } else if (change.category === "program_outcomes") {
      if (change.action === "insert") {
        setSavedData((prev) => ({
          ...prev,
          po: prev.po.filter((_, i) => i !== change.index),
        }));
      } else if (change.action === "delete") {
        setSavedData((prev) => {
          const newPo = [...prev.po];
          newPo.splice(change.index, 0, change.value);
          return { ...prev, po: newPo };
        });
      } else if (change.action === "update") {
        setSavedData((prev) => {
          const newPo = [...prev.po];
          newPo[change.index] = change.oldValue;
          return { ...prev, po: newPo };
        });
      }
    } else if (change.category === "program_specific_outcomes") {
      if (change.action === "insert") {
        setSavedData((prev) => ({
          ...prev,
          pso: prev.pso.filter((_, i) => i !== change.index),
        }));
      } else if (change.action === "delete") {
        setSavedData((prev) => {
          const newPso = [...prev.pso];
          newPso.splice(change.index, 0, change.value);
          return { ...prev, pso: newPso };
        });
      } else if (change.action === "update") {
        setSavedData((prev) => {
          const newPso = [...prev.pso];
          newPso[change.index] = change.oldValue;
          return { ...prev, pso: newPso };
        });
      }
    }

    // Update formData as well
    setFormData(JSON.parse(JSON.stringify(savedData)));
  };

  return (
    <div className="main-content font-[Poppins] relative flex flex-col min-h-screen">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Edit button */}
      <div className="w-full flex justify-end mb-4">
        {!isEditing && !requestMode && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text  rounded-lg shadow-md hover:bg-[#800000] hover:text-prim "
            onClick={handleEdit}
          >
            <Pencil size={16} className="text-current" />
            Edit
          </button>
        )}
      </div>

      <div className="flex-1">
        {/* About Section */}
        <section className="about-department">
          <div className="about-desktop flex flex-col md:flex-row items-center gap-6">
            <div className="section-card w-full md:w-1/2 border-l-4 border-[#FFD700] dark:border-drks bg-white dark:bg-[linear-gradient(135deg,theme(colors.drkb),color-mix(in_srgb,theme(colors.drkb)_85%,white))] p-4 shadow rounded-md">
              <div className="about-department-text">
                <h2 className="text-brwn dark:text-prim border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">
                  About the Department
                </h2>
                {isEditing ? (
                  <textarea
                    className="w-full h-64 border p-6 rounded resize-none"
                    value={formData.about}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-text dark:text-drkt">{formData.about}</p>
                )}
              </div>
            </div>

            <div className="w-full flex justify-center">
              <img
                src={UrlParser(
                  formData.banner?.[0]?.about_the_department_image_path
                )}
                alt={formData.banner?.[0]?.name}
                className="img-fluid rounded shadow max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <div className="row g-6">
          {/* Vision Section */}
          <div className="d-flex align-items-stretch mb-3">
            <div className="section-card bg-white border-l-4 border-secd dark:border-drks dark:bg-[linear-gradient(135deg,theme(colors.drkb),color-mix(in_srgb,theme(colors.drkb)_85%,white))] p-3 shadow rounded">
              <div className="d-flex align-items-center mb-3">
                <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">
                  Department Vision
                </h2>
              </div>
              {formData.vision?.length > 0 && (
                <ul className="text-text dark:text-drkt list-none">
                  {formData.vision.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            className="w-full border p-1 rounded mb-2"
                            value={item}
                            onChange={(e) => {
                              const updated = [...formData.vision];
                              updated[index] = e.target.value;
                              setFormData({ ...formData, vision: updated });
                            }}
                          />
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: "vision", index });
                              setShowItemDeleteModal(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Vision"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isEditing && (
                <div className="flex justify-start">
                  <button
                    className="mt-2 px-2 py-1 text-sm bg-[#fdcc03] text-text rounded shadow hover:bg-[#800000] transition hover:text-prim"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        vision: [...prev.vision, ""],
                      }))
                    }
                  >
                    + New Vision
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mission Section */}
          <div className="d-flex align-items-stretch mb-3">
            <div className="section-card border-l-4 border-secd dark:border-drks bg-white dark:bg-[linear-gradient(135deg,theme(colors.drkb),color-mix(in_srgb,theme(colors.drkb)_85%,white))] p-3 shadow rounded w-100">
              <div className="d-flex align-items-center mb-3">
                <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit">
                  Department Mission
                </h2>
              </div>
              <ul className="list-none text-text dark:text-drkt">
                {formData.mission?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          className="w-full border p-1 rounded mb-2"
                          value={item}
                          onChange={(e) => {
                            const updated = [...formData.mission];
                            updated[index] = e.target.value;
                            setFormData({ ...formData, mission: updated });
                          }}
                        />
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: "mission", index });
                            setShowItemDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Mission"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>

              {isEditing && (
                <div className="flex justify-start">
                  <button
                    className="mt-2 px-2 py-1 text-sm bg-[#fdcc03] text-text rounded shadow hover:bg-[#800000] transition hover:text-prim"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        mission: [...prev.mission, ""],
                      }))
                    }
                  >
                    + New Mission
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* PEO, PO, PSO Sections */}
        {["peo", "po", "pso"].map((type) =>
          formData[type]?.length > 0 ? (
            <div className="psos-section mt-5" key={type}>
              <h2 className="text-brwn dark:text-drkt border-b-2 border-[#FFD700] dark:border-drks w-fit pb-2">
                {type === "peo"
                  ? "Programme Educational Objectives"
                  : type === "po"
                    ? "Program Outcomes"
                    : "Program Specific Outcomes"}
              </h2>
              <div className="accordion" id={`${type}Accordion`}>
                {formData[type].map((item, index) => (
                  <div
                    className="POE accordion-item-cir bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks rounded-lg relative"
                    key={index}
                  >
                    <div className="flex-1 p-2">
                      <h2 className="accordion-header text-left pt-4">
                        {isEditing ? (
                          <input
                            className="w-full border p-1 rounded mb-2"
                            value={item?.header}
                            onChange={(e) => {
                              const updated = [...formData[type]];
                              updated[index].header = e.target.value;
                              setFormData({ ...formData, [type]: updated });
                            }}
                          />
                        ) : (
                          item?.header
                        )}
                      </h2>
                      <div className="accordion-body show">
                        {isEditing ? (
                          <textarea
                            className="w-full border p-1 rounded"
                            value={item?.content}
                            onChange={(e) => {
                              const updated = [...formData[type]];
                              updated[index].content = e.target.value;
                              setFormData({ ...formData, [type]: updated });
                            }}
                          />
                        ) : (
                          item?.content
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <input
                        type="checkbox"
                        checked={selectedItems[type].includes(index)}
                        onChange={() => handleCheckboxChange(type, index)}
                        className="absolute top-2 right-2"
                      />
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    className="mt-2 px-3 py-1 bg-[#FDCC03] text-text rounded shadow hover:bg-[#800000] transition hover:text-prim"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        [type]: [...prev[type], { header: "", content: "" }],
                      }))
                    }
                  >
                    + New {type.toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Delete Selected Button */}
      {isEditing &&
        (selectedItems.peo.length ||
          selectedItems.po.length ||
          selectedItems.pso.length) > 0 && (
          <div className="w-full flex justify-center mb-4">
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-800 transition"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Selected
            </button>
          </div>
        )}

      {/* Edit / Request Buttons */}
      {isEditing ? (
        <div className="w-full flex justify-end gap-3 p-6 border-t mt-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-600 transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              className="px-4 py-2 bg-[#fdcc03] text-text rounded-lg shadow hover:bg-[#800000] transition hover:text-prim"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
      ) : requestMode ? (
        <div className="w-full flex justify-end gap-3 p-6 border-t mt-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-600 transition"
            onClick={handleDiscardChanges}
          >
            Discard Changes
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded-lg shadow hover:bg-[#800000] transition hover:text-prim"
            onClick={() => setShowRequestModal(true)}
          >
            <Send size={16} className="text-current" />
            Request
          </button>

        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete the selected items?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-600 transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-800 transition"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    peo: prev.peo.filter((_, idx) => !selectedItems.peo.includes(idx)),
                    po: prev.po.filter((_, idx) => !selectedItems.po.includes(idx)),
                    pso: prev.pso.filter((_, idx) => !selectedItems.pso.includes(idx)),
                  }));
                  setSelectedItems({ peo: [], po: [], pso: [] });
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal with Undo Column */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request Changes</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
            </p>

            {/* Changes Table */}
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.length > 0 ? (
                  changes.map((change, idx) => {
                    const getCategoryName = (cat) => {
                      const names = {
                        about_the_department: "About Department",
                        department_vision: "Vision",
                        department_mission: "Mission",
                        programme_educational_objectives: "PEO",
                        program_outcomes: "PO",
                        program_specific_outcomes: "PSO",
                      };
                      return names[cat] || cat;
                    };

                    const getChangeDescription = (change) => {
                      if (change.field === "about") return "Content updated";
                      if (change.field === "text") {
                        if (change.action === "insert") return `Added: "${change.value?.substring(0, 30)}..."`;
                        if (change.action === "delete") return `Deleted: "${change.value?.substring(0, 30)}..."`;
                        if (change.action === "update") return `Updated item ${change.index + 1}`;
                      }
                      if (change.field === "object") {
                        if (change.action === "insert") return `Added: ${change.value?.header || "New item"}`;
                        if (change.action === "delete") return `Deleted: ${change.value?.header || "Item"}`;
                        if (change.action === "update") return `Updated: ${change.value?.header || `Item ${change.index + 1}`}`;
                      }
                      return "Modified";
                    };

                    return (
                      <tr key={idx}>
                        <td className="border p-2">
                          {change.action === "insert" && (
                            <span className="text-green-600">+ Added</span>
                          )}
                          {change.action === "update" && (
                            <span className="text-blue-600">✎ Edited</span>
                          )}
                          {change.action === "delete" && (
                            <span className="text-red-600">– Deleted</span>
                          )}
                        </td>
                        <td className="border p-2">{getCategoryName(change.category)}</td>
                        <td className="border p-2 text-xs">{getChangeDescription(change)}</td>
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => revertChange(idx)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Revert this change"
                            disabled={requestLoading}
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="border p-4 text-center text-gray-500">
                      No changes to request
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className={`px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-white ${requestLoading ? "cursor-progress opacity-70" : ""
                  }`}
                disabled={requestLoading || changes.length === 0}
              >
                {requestLoading ? "Sending..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal for Vision/Mission */}
      {showItemDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this{" "}
              <span className="font-bold">{deleteTarget.type}</span> item?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-600 transition"
                onClick={() => {
                  setDeleteTarget(null);
                  setShowItemDeleteModal(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-800 transition"
                onClick={() => {
                  setFormData((prev) => {
                    const updated = { ...prev };
                    updated[deleteTarget.type] = prev[deleteTarget.type].filter(
                      (_, idx) => idx !== deleteTarget.index
                    );
                    return updated;
                  });
                  setDeleteTarget(null);
                  setShowItemDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionMission;
