import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VisionMission.css";
import LoadComp from "../../../LoadComp";
import { Pencil,X } from "lucide-react";

const VisionMission = ({ data }) => {
  console.log(data);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [formData, setFormData] = useState(() => {
    return {
      about:
        data?.find((item) => item.category === "about_the_department")
          ?.content || "",
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


  // Track selected items for deletion
  const [selectedItems, setSelectedItems] = useState({
    peo: [],
    po: [],
    pso: [],
  });

  // Track modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Track if we are in request mode (after Save)
  const [requestMode, setRequestMode] = useState(false);

  useEffect(() => {
    setHasChanges(
      backupData ? JSON.stringify(formData) !== JSON.stringify(backupData) : false
    );
  }, [formData, backupData]);

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );

 const handleEdit = () => {
  setBackupData(JSON.parse(JSON.stringify(formData)));
  setInitialData(JSON.parse(JSON.stringify(formData))); // track original
  setIsEditing(true);
  setRequestMode(false); // if you have a request mode state
};


  const handleCancel = () => {
    setFormData(backupData);
    setIsEditing(false);
    setSelectedItems({ peo: [], po: [], pso: [] });
    setRequestMode(false);
  };

  const handleSave = () => {
    console.log("Final Saved Data:", formData);
    setIsEditing(false);
    setSelectedItems({ peo: [], po: [], pso: [] });
    setRequestMode(true); // enable request/discard mode
  };

  const handleDiscardChanges = () => {
    setFormData(backupData);
    setBackupData(null);
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

  return (
    <div className="main-content font-[Poppins] relative flex flex-col min-h-screen">
      {/* Edit button */}
      <div className="absolute top-2 right-4 flex gap-2 z-10">
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
                    <li key={index}>
                      {isEditing ? (
                        <input
                          className="w-full border p-1 rounded"
                          value={item}
                          onChange={(e) => {
                            const updated = [...formData.vision];
                            updated[index] = e.target.value;
                            setFormData({ ...formData, vision: updated });
                          }}
                        />
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
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
                  <li key={index}>
                    {isEditing ? (
                      <input
                        className="w-full border p-1 rounded mb-2"
                        value={item}
                        onChange={(e) => {
                          const updated = [...formData.mission];
                          updated[index] = e.target.value;
                          setFormData({ ...formData, mission: updated });
                        }}
                      />
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>

              {isEditing && (
                <button
                  className="mt-2 px-3 py-1 bg-[#fdcc03] text-text rounded shadow hover:bg-[#800000] transition hover:text-prim"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      mission: [...prev.mission, ""],
                    }))
                  }
                >
                  + New Mission
                </button>
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
            className="px-4 py-2 bg-[#fdcc03] text-text rounded-lg shadow hover:bg-[#800000] transition hover:text-prim"
            onClick={() => setShowRequestModal(true)}
          >
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
        Note: Your changes will stay pending until approved by the superior admin. Once approved, they will go live.
      </p>

      {/* Changes Table */}
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
          {Object.keys(initialData).map((field) => {
            if (field === "Social_media_links" || field === "Image") return null;
            const oldVal = Array.isArray(initialData[field]) ? initialData[field].join(", ") : initialData[field];
            const newVal = Array.isArray(formData[field]) ? formData[field].join(", ") : formData[field];
            if (oldVal !== newVal) {
              return (
                <tr key={field}>
                  <td className="border p-2 text-blue-600">Edited</td>
                  <td className="border p-2">HOD</td>
                  <td className="border p-2">{field}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, [field]: initialData[field] }))}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Revert this field"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              );
            }
            return null;
          })}

          {Object.keys(initialData.Social_media_links || {}).map((key) => {
            const oldVal = initialData.Social_media_links[key] || "";
            const newVal = formData.Social_media_links?.[key] || "";
            if (oldVal !== newVal) {
              return (
                <tr key={key}>
                  <td className="border p-2 text-blue-600">Edited</td>
                  <td className="border p-2">Social Links</td>
                  <td className="border p-2">{key}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          Social_media_links: { ...prev.Social_media_links, [key]: initialData.Social_media_links[key] }
                        }))
                      }
                      className="p-1 rounded hover:bg-gray-100"
                      title="Revert this link"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              );
            }
            return null;
          })}

          {initialData.Image !== formData.Image && (
            <tr>
              <td className="border p-2 text-blue-600">Edited</td>
              <td className="border p-2">HOD Image</td>
              <td className="border p-2">Image</td>
              <td className="border p-2">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, Image: initialData.Image }))}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Revert image"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Actions */}
<div className="flex justify-end gap-2 mt-6">
  <button
    onClick={() => setShowRequestModal(false)}
    className="px-4 py-2 rounded bg-gray-400 text-white"
  >
    Cancel
  </button>
  <button
    onClick={() => {
      console.log("Request sent:", formData); 
      setShowRequestModal(false);

      // SAVE CHANGES LOCALLY
      setBackupData(JSON.parse(JSON.stringify(formData))); // updates backup with requested changes
      setInitialData(JSON.parse(JSON.stringify(formData))); // reset initialData to latest
      setRequestMode(false); // re-enable edit button after confirming request
    }}
    className="px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000]"
  >
    Confirm Request
  </button>
</div>

    </div>
  </div>
)}

    </div>
  );
};

export default VisionMission;
