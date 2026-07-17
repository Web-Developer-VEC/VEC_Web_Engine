import React, { useState } from "react";
import styles from '../HeadDepartment.module.css';
import { FaBook, FaLinkedin } from 'react-icons/fa';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import LoadComp from "../../../LoadComp";
import { Pencil, Save, X, Send } from "lucide-react";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeadDepartment = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const UrlParser = (path) => {
  console.log("UrlParser received:", path, typeof path);

  if (!path) return "";

  if (Array.isArray(path)) {
    path = path[0];
  }

  if (typeof path !== "string") {
    console.log("INVALID PATH:", path);
    return "";
  }

  if (path.startsWith("blob:")) return path;
  if (path.startsWith("http")) return path;

  if (BASE_URL && path.startsWith("/")) {
    return `${BASE_URL}${path}`;
  }

  return path;
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
  const deptId = data?.find((item) => item.category === "banner_name_and_image")?.content?.[0]?.dept_id || "005";
  const collectionName = deptMap[deptId];

  const hod_details = data?.find((item) => item.category === "hod_details")?.content || [];

  const [initialData, setInitialData] = useState({
    Name: hod_details?.[0]?.name || "",
    uid: hod_details?.[0]?.unique_id || "",
    Qualification: hod_details?.[0]?.qualification || [],
    designation: hod_details?.[0]?.designation || "",
    Hod_message: Array.isArray(hod_details?.[0]?.hod_message)
      ? hod_details[0].hod_message[0]
      : (hod_details?.[0]?.hod_message || ""),
    Image: hod_details?.[0]?.image_path || "",
    ImageFile: null,
    Social_media_links: hod_details?.[0]?.Social_media_links || {},
    resume: hod_details?.[0]?.pdf_path || ""
  });

  const profiles = [
    { key: "linkedin", label: "LinkedIn" },
    { key: "googlescholar", label: "Google Scholar" },
    { key: "researchgate", label: "ResearchGate" },
    { key: "orchidprofile", label: "OrchidProfile" },
    { key: "publonprofile", label: "PublonProfile" },
    { key: "scopus", label: "Scopus" },
  ];

  const [formData, setFormData] = useState(initialData);
  const [backupData, setBackupData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [globalSaved, setGlobalSaved] = useState(false);
  const [savedData, setSavedData] = useState(null); // Data snapshot after save
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (backupData) setFormData(backupData); // revert session
    setIsEditing(false);
    setIsDirty(false);
    setShowLinkEditor(false);
  };

  const handleSave = () => {
    // Required field validation
    if (!formData.Name.trim()) {
      return;
    }

    if (
      !formData.Qualification ||
      formData.Qualification.length === 0 ||
      formData.Qualification.join("").trim() === ""
    ) {
      return;
    }

    if (!formData.designation.trim()) {
      return;
    }

    if (!formData.Hod_message.trim()) {
      return;
    }
    setSavedData({
      ...formData,
      Qualification: [...formData.Qualification],
      Social_media_links: { ...formData.Social_media_links },
      ImageFile: formData.ImageFile
    });
    setGlobalSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setShowLinkEditor(false);
  };

  const handleDiscard = () => {
    setFormData(backupData || initialData);
    setGlobalSaved(false);
    setBackupData(null);
    setIsDirty(false);
    setSavedData(null);
  };

  // Build payload based on changes
  const buildPayload = () => {
    if (!savedData) return null;

    const meta_data = {
      department_id: hod_details?.[0]?.department_id || "",
      name: savedData.Name,
      department_name: hod_details?.[0]?.department_name || "",
      unique_id: savedData.uid,
      pdf_path: savedData.resume,
      qualification: savedData.Qualification,
      hod_message: [savedData.Hod_message],
      image_path: savedData.ImageFile
        ? `/static/images/hods/${savedData.ImageFile.name}`
        : savedData.Image,
      designation: savedData.designation,
      Social_media_links: savedData.Social_media_links
    };

    const original_data = {
      department_id: hod_details?.[0]?.department_id || "",
      name: initialData.Name,
      department_name: hod_details?.[0]?.department_name || "",
      unique_id: initialData.uid,
      pdf_path: initialData.resume,
      qualification: initialData.Qualification,
      hod_message: Array.isArray(initialData.Hod_message) ? initialData.Hod_message : [initialData.Hod_message],
      image_path: initialData.ImageFile
        ? `/static/images/hods/${initialData.ImageFile.name}`
        : initialData.Image,
      designation: initialData.designation,
      Social_media_links: initialData.Social_media_links
    };

    return {
      collectionName,
      collection_type: "hod",
      action: "update",
      title: "update for hod",
      category: "hod_details",
      meta_data,
      original_data
    };
  };

  // Send request
  const handleRequestConfirm = async () => {
    const payload = buildPayload();

    if (!payload) {
      setShowRequestModal(false);
      return;
    }

    try {
      const files = [];

      if (savedData.ImageFile) {
        files.push(savedData.ImageFile);
      }

      await sendRequest([payload], files);
      // Update baseline
      setInitialData({ ...savedData });
      // setBackupData(JSON.parse(JSON.stringify(savedData)));
      setBackupData({
        ...savedData,
        Qualification: [...savedData.Qualification],
        Social_media_links: { ...savedData.Social_media_links },
        ImageFile: savedData.ImageFile
      });
      setSavedData(null);
      setGlobalSaved(false);
      setShowRequestModal(false);
    } catch (error) {
      console.error("Request failed:", error);
      toast.error("Failed to send request");
    }
  };

  const handleRequest = () => setShowRequestModal(true);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {formData.Hod_message ? (
        <div className={styles.messageContent + " text-text dark:text-drkt relative"}>

          {/* Top Edit button always visible if global save clicked */}
          {(globalSaved || !isEditing) && (
            <button
              className="absolute -top-4 right-8 flex items-center gap-2 px-4 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
              onClick={() => { setBackupData(formData); setIsEditing(true); setGlobalSaved(false); }}
            >
              <Pencil size={16} />
              Edit
            </button>
          )}

          <div className={`${styles.textColumn} mb-18`}>
            <div className={styles.hodInfo}>
              {isEditing ? (
                <>
                  <label className="font-medium mb-1 block"> Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.Name} onChange={(e) => handleChange("Name", e.target.value)} className="border px-2 py-1 mb-2 w-full" />
                  <label className="font-medium mb-1 block"> Qualification <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.Qualification.join(", ")} onChange={(e) => handleChange("Qualification", e.target.value.split(",").map(q => q.trim()))} className="border px-2 py-1 mb-2 w-full" />
                  <label className="font-medium mb-1 block"> Designation <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.designation} onChange={(e) => handleChange("designation", e.target.value)} className="border px-2 py-1 mb-2 w-full" />
                </>
              ) : (
                <>
                  <h2 className={styles.messageHeader + " + text-[#00000]"}>
                    {formData.Name}, <span className={styles.messageHeader2 + " text-text dark:text-drka"}>{formData.Qualification.join(", ")}</span>
                  </h2>
                  <p className={styles.hodDesignation}>{formData.designation}</p>
                </>
              )}
            </div>

            <div className={styles.hodMessage + " text-text dark:text-drkt"}>
              <h3 className={styles.messageTitle + " + text-[#800000] dark:text-drkt border-b-2 border-secd dark:border-drks"}>HOD's Message</h3>
              {isEditing ? (
                <textarea required value={formData.Hod_message} onChange={(e) => handleChange("Hod_message", e.target.value)} className="border p-2 w-full h-48" />
              ) : (
                <p className={styles.messageBody}>{formData.Hod_message}</p>
              )}
            </div>
          </div>

          <div className={`${styles.imageColumn} mb-24`}>
            {formData.Image ? (
              <img
  src={UrlParser(formData.Image)}
  alt="Head of Department"
  className={styles.hodImage}
/>
            ) : (<p>No image available</p>)}

            {/* Upload button */}
            {isEditing && (
              <div className="mt-3">
                <input type="file" accept="image/*" id="hod-image-upload" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    const previewUrl = URL.createObjectURL(file);

                    setFormData(prev => ({
                      ...prev,
                      Image: previewUrl,      // preview only
                      ImageFile: file         // keep the original file
                    }));

                    setIsDirty(true);
                  }}
                />
                <label htmlFor="hod-image-upload" className="px-3 py-1 bg-[#fdcc03] text-text rounded cursor-pointer hover:bg-[#800000] hover:text-prim">Replace Image</label>
              </div>
            )}

            <div className={styles.socialLinks}>
              {Object.entries(formData.Social_media_links).map(([key, link]) => {
                const icons = {
                  linkedin: <FaLinkedin />,
                  googlescholar: <FaGoogleScholar />,
                  researchgate: <FaResearchgate />,
                  orchidprofile: <FaOrcid />,
                  publonprofile: <SiPublons />,
                  scopus: <FaBook />
                };
                return link ? (
                  <a key={key} href={link} className={styles.socialLink + " text-accn dark:text-drka hover:text-secd dark:hover:text-drks"} target="_blank" rel="noopener noreferrer">{icons[key]}</a>
                ) : null;
              })}
            </div>

            {isEditing && (
              <button onClick={() => setShowLinkEditor(true)} className="mt-3 px-3 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim">Add / Edit Link</button>
            )}
          </div>

          {/* Global buttons */}
          <div className="absolute bottom-0 right-4 flex gap-3">
            {globalSaved ? (
              <>
                <button onClick={handleDiscard} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Discard</button>
                <button onClick={handleRequest} className="px-4 py-2 flex items-center gap-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim">
                  <Send size={16} /> Request
                </button>
              </>
            ) : (
              <>
                {isEditing && <button onClick={handleCancel} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>}
                {isDirty && <button onClick={handleSave} className="px-4 py-2 flex items-center gap-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"> Save</button>}
              </>
            )}
          </div>

          {/* Link Editor Modal */}
          {showLinkEditor && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 pt-32">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto relative">
                <button
                  onClick={() => setShowLinkEditor(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">Edit Social Links</h2>

                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2 text-left">Profile</th>
                      <th className="border p-2 text-left">Link</th>
                      <th className="border p-2 text-center">Delete</th> {/* NEW Column */}
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => {
                      const currentVal = formData.Social_media_links[profile.key] || "";
                      return (
                        <tr key={profile.key}>
                          <td className="border p-2 font-medium">{profile.label}</td>
                          <td className="border p-2">
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  Social_media_links: {
                                    ...prev.Social_media_links,
                                    [profile.key]: val
                                  }
                                }));
                                setIsDirty(true);
                              }}
                              className="border px-2 py-1 w-full rounded"
                            />
                          </td>
                          <td className="border p-2 text-center">
                            <button
                              onClick={() => {
                                setFormData((prev) => {
                                  const updatedLinks = { ...prev.Social_media_links };
                                  delete updatedLinks[profile.key]; // remove the link
                                  return { ...prev, Social_media_links: updatedLinks };
                                });
                                setIsDirty(true);
                              }}
                              className="p-1 rounded hover:bg-red-100"
                              title="Delete this link"
                            >
                              <X size={18} className="text-red-500" /> {/* Trash Icon */}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowLinkEditor(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>

                  {/* Show Save only if any social link changed */}
                  {profiles.some(profile =>
                    (formData.Social_media_links[profile.key] || "") !== (initialData.Social_media_links[profile.key] || "")
                  ) && (
                      <button
                        onClick={() => {
                          setShowLinkEditor(false);
                          setIsDirty(true);
                        }}
                        className="px-4 py-2 flex items-center gap-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                      >
                        Save
                      </button>
                    )}
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
                    {/* Base Fields */}
                    {Object.keys(initialData).map((field) => {
                      if (
                        field === "Social_media_links" ||
                        field === "Image" ||
                        field === "ImageFile"
                      ) {
                        return null;
                      } const oldVal = Array.isArray(initialData[field]) ? initialData[field].join(", ") : initialData[field];
                      const newVal = Array.isArray(savedData[field]) ? savedData[field].join(", ") : savedData[field];
                      if (oldVal !== newVal) {
                        return (
                          <tr key={field}>
                            <td className="border p-2 text-blue-600">Edited</td>
                            <td className="border p-2">HOD</td>
                            <td className="border p-2">{field}</td>
                            <td className="border p-2">
                              <button
                                onClick={() => setSavedData(prev => ({ ...prev, [field]: initialData[field] }))}
                                className="p-1 rounded hover:bg-gray-100"
                                title="Revert this field"
                                disabled={requestLoading}
                              >
                                <X size={16} className="text-red-500" />
                              </button>
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}

                    {/* Social Media Links */}
                    {savedData && Object.keys(initialData.Social_media_links).map((key) => {
                      const oldVal = initialData.Social_media_links[key] || "";
                      const newVal = savedData.Social_media_links[key] || "";
                      if (oldVal !== newVal) {
                        return (
                          <tr key={key}>
                            <td className="border p-2 text-blue-600">Edited</td>
                            <td className="border p-2">Social Links</td>
                            <td className="border p-2">{key}</td>
                            <td className="border p-2">
                              <button
                                onClick={() =>
                                  setSavedData(prev => ({
                                    ...prev,
                                    Social_media_links: { ...prev.Social_media_links, [key]: initialData.Social_media_links[key] }
                                  }))
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Revert this link"
                                disabled={requestLoading}
                              >
                                <X size={16} className="text-red-500" />
                              </button>
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}

                    {/* Image */}
                    {savedData && initialData.Image !== savedData.Image && (
                      <tr>
                        <td className="border p-2 text-blue-600">Edited</td>
                        <td className="border p-2">HOD Image</td>
                        <td className="border p-2">Image</td>
                        <td className="border p-2">
                          <button
                            onClick={() => setSavedData(prev => ({ ...prev, Image: initialData.Image }))}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Revert image"
                            disabled={requestLoading}
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
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestConfirm}
                    className={`px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-white ${requestLoading ? "cursor-progress opacity-70" : ""
                      }`}
                    disabled={requestLoading}
                  >
                    {requestLoading ? "Sending..." : "Confirm Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}

    </>
  );
};

export default HeadDepartment;
