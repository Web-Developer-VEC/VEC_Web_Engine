import React, { useState } from "react";
import styles from '../HeadDepartment.module.css';
import { FaBook, FaLinkedin } from 'react-icons/fa';
import { SiPublons } from "react-icons/si";
import { FaGoogleScholar } from "react-icons/fa6";
import { FaOrcid } from "react-icons/fa";
import { FaResearchgate } from "react-icons/fa6";
import LoadComp from "../../../LoadComp";
import { Pencil, Save, X, Send } from "lucide-react";

const HeadDepartment = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  const hod_details = data?.find((item) => item.category === "hod_details")?.content || [];

  const initialData = {
    Name: hod_details?.[0]?.name || "",
    uid: hod_details?.[0]?.unique_id || "",
    Qualification: hod_details?.[0]?.qualification || [],
    designation: hod_details?.[0]?.designation || "",
    Hod_message: hod_details?.[0]?.hod_message || "",
    Image: hod_details?.[0]?.hod_image || "",
    Social_media_links: hod_details?.[0]?.Social_media_links || {},
    resume: hod_details?.[0]?.resume_pdf || ""
  };

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
  const [globalSaved, setGlobalSaved] = useState(false); // tracks global save click
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
    console.log("Global Save:", formData);
    setGlobalSaved(true); // mark global save
    setIsEditing(false);
    setIsDirty(false);
    setShowLinkEditor(false);
  };

  const handleDiscard = () => {
    setFormData(backupData || initialData);
    setGlobalSaved(false);
    setBackupData(null);
    setIsDirty(false);
  };

  const handleRequest = () => setShowRequestModal(true);

  return (
    <>
      {formData.Hod_message ? (
        <div className={styles.messageContent + " text-text dark:text-drkt relative"}>
          
          {/* Top Edit button always visible if global save clicked */}
          {(globalSaved || !isEditing) && (
            <button
              className="absolute top-2 right-2 flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
              onClick={() => { setBackupData(formData); setIsEditing(true); setGlobalSaved(false); }}
            >
              <Pencil size={16} />
              Edit
            </button>
          )}

          <div className={styles.textColumn}>
            <div className={styles.hodInfo}>
              {isEditing ? (
                <>
                  <input type="text" value={formData.Name} onChange={(e) => handleChange("Name", e.target.value)} className="border px-2 py-1 mb-2 w-full"/>
                  <input type="text" value={formData.Qualification.join(", ")} onChange={(e) => handleChange("Qualification", e.target.value.split(",").map(q => q.trim()))} className="border px-2 py-1 mb-2 w-full"/>
                  <input type="text" value={formData.designation} onChange={(e) => handleChange("designation", e.target.value)} className="border px-2 py-1 mb-2 w-full"/>
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
                <textarea value={formData.Hod_message} onChange={(e) => handleChange("Hod_message", e.target.value)} className="border p-2 w-full h-48"/>
              ) : (
                <p className={styles.messageBody}>{formData.Hod_message}</p>
              )}
            </div>
          </div>

          <div className={styles.imageColumn}>
            {formData.Image ? (
              <img src={formData.Image?.startsWith("blob:") ? formData.Image : UrlParser(formData.Image)} alt="Head of Department" className={styles.hodImage}/>
            ) : (<p>No image available</p>)}

            {/* Upload button */}
            {isEditing && (
              <div className="mt-3">
                <input type="file" accept="image/*" id="hod-image-upload" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setFormData((prev) => ({ ...prev, Image: previewUrl }));
                      setIsDirty(true);
                    }
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
          <div className="absolute -bottom-24 right-4 flex gap-3">
            {globalSaved ? (
              <>
                <button onClick={handleDiscard} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Discard</button>
                <button onClick={handleRequest} className="px-4 py-2 flex items-center gap-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim">
                  <Send size={16}/> Request
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
        <X size={20}/>
      </button>
      <h2 className="text-xl font-bold mb-4 text-center">Edit Social Links</h2>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Profile</th>
            <th className="border p-2 text-left">Link</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => {
            const oldVal = initialData.Social_media_links[profile.key] || "";
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
                    }}
                    className="border px-2 py-1 w-full rounded"
                  />
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
      setShowLinkEditor(false); // close the modal
      setIsDirty(true);         // mark form as dirty to show global Save/Cancel buttons
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
      <table className="w-full border border-gray-300 text-sm text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Action</th>
            <th className="border p-2">Section</th>
            <th className="border p-2">Changes</th>
            <th className="border p-2">Undo</th> {/* Undo Column */}
          </tr>
        </thead>
        <tbody>
          {/* Base Fields */}
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

          {/* Social Media Links */}
          {Object.keys(initialData.Social_media_links).map((key) => {
            const oldVal = initialData.Social_media_links[key] || "";
            const newVal = formData.Social_media_links[key] || "";
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

          {/* Image */}
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
            console.log("Request sent:", formData); // send this to API if needed
            setShowRequestModal(false);
            setGlobalSaved(false); // mark as pending request
            // Do NOT call handleDiscard(), keep changes
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
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default HeadDepartment;
