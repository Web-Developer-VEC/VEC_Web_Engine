import { useState, useEffect } from "react";
import "./aboutHost.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Send, X } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

export default function AboutHostel({ hostelData, theme, toggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPageView, setIsPageView] = useState(false); // kept for compatibility (not heavily used)
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [aboutText, setAboutText] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [tempImageFile, setTempImageFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [originalData, setOriginalData] = useState(null); // current "saved" state
  const [initialSnapshot, setInitialSnapshot] = useState(null); // snapshot at mount (used for discard all)
  const [changes, setChanges] = useState({ modified: [], added: [], deleted: [] });

  const [hasChanges, setHasChanges] = useState(false); // unsaved (in-edit) changes
  const [changesSaved, setChangesSaved] = useState(false); // indicates we have saved changes that can be requested or discarded

  // New: detailed change log used for the final request modal with undo
  const [changeLog, setChangeLog] = useState([]);

  const [isRequesting, setIsRequesting] = useState(false);//Load for the final request

  const { sendRequest, loading, error } = useAdminRequest();

  let data;
  if (hostelData) {
    data = hostelData[0];
  }
  const BASE_URL = process.env.REACT_APP_BASE_URL ?? "";

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Initialize data / snapshots
  useEffect(() => {
    if (data) {
      const deepCopy = JSON.parse(JSON.stringify(data));
      setOriginalData(deepCopy);
      setInitialSnapshot(JSON.parse(JSON.stringify(deepCopy))); // baseline snapshot for discard
      setAboutText(deepCopy?.about_us || "");
      setImagePath(UrlParser(deepCopy?.image_path));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Monitor unsaved (in-edit) changes vs current originalData
  useEffect(() => {
    if (!originalData) {
      setHasChanges(false);
      return;
    }
    const textChanged = aboutText !== (originalData.about_us || "");
    const imageChanged = !!tempImageFile; // if a new file is selected it's unsaved
    setHasChanges(textChanged || imageChanged);
  }, [aboutText, tempImageFile, originalData]);

  // File upload handler (for editing)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImageFile(file);
      const fileURL = URL.createObjectURL(file);
      setUploadedFile({
        file,
        fileURL,
      });
      setImagePath(fileURL);
    }
  };

  // Compute filename helper
  const getFilenameFromPath = (path) => {
    if (!path) return "";
    return path.split("/").pop();
  };

  // Cancel while editing: only revert recent unsaved changes (not saved changes)
  const cancelUnsavedChanges = () => {
    if (!originalData) return;
    setAboutText(originalData.about_us || "");
    setImagePath(UrlParser(originalData.image_path));
    setTempImageFile(null);
    setUploadedFile(null);
    setHasChanges(false);
    setIsEditing(false);

  };

  // Save current unsaved changes into "originalData" (commit)
  const handleSave = () => {
    if (!originalData) return;

    const modified = [];
    const newChangeEntries = [];

    if (aboutText !== (originalData.about_us || "")) {
      modified.push("About text modified");
      // push to changeLog with previous value so we can undo later
      newChangeEntries.push({
        action: "Edited",
        section: "About Hostel",
        title: "About Text",
        data: {
          prev: originalData.about_us || "",
          next: aboutText,
        },
      });
    }
    if (tempImageFile) {
      modified.push("Image changed");
      newChangeEntries.push({
        action: "Edited",
        section: "About Hostel",
        title: "Hostel Image",
        data: {
          prev: originalData.image_path || initialSnapshot?.image_path || "",
          // store file name and preview URL for user-friendly display
          next: uploadedFile ? uploadedFile.file.name : tempImageFile.name,
          fileURL: uploadedFile ? uploadedFile.fileURL : null,
        },
      });
    }

    if (modified.length === 0) {
      toast.info("No changes to save");
      return;
    }

    // update originalData to reflect saved changes
    const updatedOriginal = { ...originalData };
    if (aboutText !== (originalData.about_us || "")) {
      updatedOriginal.about_us = aboutText;
    }
    // In real scenario: server will return a new image path; here we store data URL for preview
    if (tempImageFile) {
      // store the preview URL or just the filename; we keep the preview for UX
      updatedOriginal.image_path = imagePath;
    }
    setOriginalData(updatedOriginal);

    // Append new entries to changeLog
    setChangeLog((prev) => [...prev, ...newChangeEntries]);

    // Set saved changes summary
    setChanges({
      modified,
      added: [],
      deleted: [],
    });

    setTempImageFile(null);
    // keep uploadedFile for preview in modal
    setHasChanges(false);
    setChangesSaved(true);
    setIsEditing(false);

  };

  // Discard all saved changes -> reset to initialSnapshot (the state when component mounted)
  const handleDiscardAll = () => {
    if (!initialSnapshot) return;

    setOriginalData(JSON.parse(JSON.stringify(initialSnapshot)));
    setAboutText(initialSnapshot.about_us || "");
    setImagePath(UrlParser(initialSnapshot.image_path));
    setTempImageFile(null);
    setUploadedFile(null);
    setChanges({ modified: [], added: [], deleted: [] });
    setHasChanges(false);
    setChangesSaved(false);
    setIsEditing(false);
    setChangeLog([]);

  };

  // Open request modal (if there are saved changes)
  const openRequestModal = () => {
    if (!changesSaved || changeLog.length === 0) {

      return;
    }
    setShowRequestModal(true);
  };

  // When user confirms the final request
  const handleRequestConfirm = async () => {
    if (!originalData) return;

    setIsRequesting(true);   // 🔥 START LOADING

    try {

      const oldAbout = initialSnapshot?.about_us || "";
      const oldImagePath = initialSnapshot?.image_path || "";

      let newImagePath = originalData.image_path;

      if (uploadedFile?.file) {
        newImagePath = `/static/images/hostel/${uploadedFile.file.name}`;
      }

      const payload = [
        {
          action: "update",
          collectionName: "hostel_details",
          collection_type: "about",
          title: "Hostel About",
          category: null,

          original_data: {
            about_us: oldAbout,
            image_path: oldImagePath,
          },

          meta_data: {
            about_us: originalData.about_us,
            image_path: newImagePath,
          },
        },
      ];

      const result = await sendRequest(
        payload,
        uploadedFile?.file || null
      );

      if (result) {
        toast.success("Request submitted successfully!");
        setShowRequestModal(false);
        setChangesSaved(false);
        setChangeLog([]);
        setUploadedFile(null);
        setTempImageFile(null);
        setHasChanges(false);
      }

    } catch (err) {
      toast.error("Request Failed!");
    }

    setIsRequesting(false);  // 🔥 STOP LOADING
  };


  // Toggle Page View (kept for compatibility; this toggles editing appropriately)
  const togglePageView = () => {
    setIsPageView(!isPageView);
    if (isPageView) {
      // Exiting page view -> go back to edit
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  // Revert a specific saved change from changeLog (undo)
  const revertChange = (index) => {
    const ch = changeLog[index];
    if (!ch) return;

    // Create new changeLog without the reverted entry
    const newLog = changeLog.filter((_, i) => i !== index);

    // Apply revert based on the change type/title
    if (ch.title === "About Text") {
      // revert the text to previous value
      setOriginalData((prev) => {
        const copy = { ...(prev || {}) };
        copy.about_us = ch.data.prev;
        return copy;
      });
      setAboutText(ch.data.prev);
    } else if (ch.title === "Hostel Image") {
      const prevPath = ch.data.prev || "";
      setOriginalData((prev) => {
        const copy = { ...(prev || {}) };
        copy.image_path = prevPath;
        return copy;
      });
      setImagePath(prevPath ? UrlParser(prevPath) : "");
      // Clear uploaded/temp image since we reverted the image change
      setUploadedFile(null);
      setTempImageFile(null);
    } else {
      // Generic fallback: if data.prev contains keys, try to revert those
      if (ch.data && typeof ch.data.prev === "object") {
        setOriginalData((prev) => ({ ...(prev || {}), ...(ch.data.prev || {}) }));
      }
    }

    setChangeLog(newLog);

    // If no more saved changes remain, clear flags & summary
    if (newLog.length === 0) {
      setChangesSaved(false);
      setChanges({ modified: [], added: [], deleted: [] });
    } else {
      // rebuild changes.modified summary from remaining log
      setChanges({
        ...changes,
        modified: newLog.map((g) => {
          if (g.title === "About Text") return "About text modified";
          if (g.title === "Hostel Image") return "Image changed";
          return "Edited";
        }),
      });
    }


  };

  // If no data loaded
  if (!data) {
    return (
      <>
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </>
    );
  }

  const hasExistingImage = Boolean(imagePath || data?.image_path || originalData?.image_path);

  return (
    <>
      <section className="about-hostel relative w-full max-w-7xl mx-auto p-4">
        {/* Top Right Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 items-center">
          {/* Edit button: visible when not currently editing */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim mr-9"
            >
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>

        <h2 className="about-hostel-heading text-center text-3xl font-bold mb-4 text-brwn dark:text-drkt">
          About Our Hostel
        </h2>

        <div className="hostel-abt-container flex flex-col md:flex-row items-center justify-center gap-6 font-[poppins]">
          {/* About Us Text */}
          <div className="md:w-1/2 w-full">
            {isEditing ? (
              <textarea
                className="w-full p-3 border rounded-md dark:bg-drkb edit-textarea"
                rows={8}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
              />
            ) : (
              <p className="hostel-about-para text-justify border-l-4 border-secd dark:border-drks p-4 rounded-md dark:bg-drkb">
                {aboutText || data?.about_us}
              </p>
            )}
          </div>

          {/* Image Section */}
          <div className="hostel-about-image md:w-1/2 w-full flex flex-col items-center justify-center">
            <img
              src={imagePath || UrlParser(data?.image_path)}
              alt="hostel building"
              className="w-full max-w-xs md:max-w-md object-cover rounded"
            />

            {/* Upload when editing */}
            {isEditing && (
              <label className="mt-2 cursor-pointer text-white bg-[#fdcc03] px-3 py-1 rounded inline-flex items-center gap-2">
                {/* Show 'Replace' if an image already exists, otherwise 'Upload' */}
                {hasExistingImage ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>


        {/* Optional Page View / Save bar (kept for compatibility with your earlier logic) */}

      </section>


      {/* Bottom controls while editing: Cancel (left) and Save (right) */}
      {isEditing && (
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={cancelUnsavedChanges}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>

          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              Save
            </button>
          )}
        </div>
      )}

      {/* Bottom controls after Save */}
      {!isEditing && changesSaved && changeLog.length > 0 && (
        <div className="w-full flex justify-end gap-3 px-6 py-4">
          <button
            onClick={handleDiscardAll}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Discard Changes
          </button>

          <button
            onClick={openRequestModal}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Send size={16} />
            Request
          </button>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />


      {/* Final Request Modal (updated to the requested layout) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
          <div className="bg-prim p-6 rounded-xl w-[40%] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Your changes will stay pending until approved by the superior admin. Once approved they will go live.
            </p>

            {changeLog.length > 0 ? (
              <table className="w-full text-center text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Action</th>
                    <th className="border p-2">Section</th>
                    <th className="border p-2">Changes</th>
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changeLog.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      {/* Always "About Hostel" / "Hostel" section */}
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2 text-left whitespace-pre-wrap">
                        {/* For text changes show a short snippet */}
                        {ch.title === "About Text" && (
                          <div>
                            <p>About text changed</p>
                          </div>
                        )}

                        {/* For image changes show previous filename → new filename with preview link */}
                        {ch.title === "Hostel Image" && (
                          <div className="flex flex-col items-start gap-1">
                            <span>Previous: {getFilenameFromPath(ch.data.prev || initialSnapshot?.image_path || originalData?.image_path)}</span>
                            <span className="mx-2">→</span>
                            {ch.data.fileURL ? (
                              <a
                                href={ch.data.fileURL}
                                className="cursor-pointer text-blue-500 underline text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {ch.data.next}
                              </a>
                            ) : (
                              <span className="text-sm">{ch.data.next}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => revertChange(i)}
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
            ) : (
              <p className="text-gray-600">No changes detected.</p>
            )}

            <div className="flex justify-end gap-2 mt-6 mr-9">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-prim"
              >
                Cancel
              </button>
              {changeLog.length > 0 && (
                <button
                  onClick={handleRequestConfirm}
                  disabled={isRequesting}
                  className={`px-4 py-2 rounded flex items-center gap-2
                  ${isRequesting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#fdcc03] hover:bg-[#800000] hover:text-prim"
                    } text-text`}
                >
                  {isRequesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    "Final Request"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
