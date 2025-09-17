import { useState, useEffect } from "react";
import "./aboutHost.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Send } from "lucide-react";

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
      setUploadedFile({
        file,
        fileURL: URL.createObjectURL(file),
      });
      setImagePath(URL.createObjectURL(file));
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
    toast.info("Recent unsaved changes reverted");
  };

  // Save current unsaved changes into "originalData" (commit)
  const handleSave = () => {
    if (!originalData) return;

    const modified = [];
    if (aboutText !== (originalData.about_us || "")) {
      modified.push("About text modified");
    }
    if (tempImageFile) {
      modified.push("Image changed");
    }

    if (modified.length === 0) {
      toast.info("No changes to save");
      return;
    }

    // update originalData to reflect saved changes
    const updatedOriginal = { ...originalData };
    updatedOriginal.about_us = aboutText;
    // In real scenario: server will return a new image path; here we store data URL for preview
    if (tempImageFile) {
      updatedOriginal.image_path = imagePath;
    }
    setOriginalData(updatedOriginal);

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
    toast.success("Changes saved");
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
    toast.info("All saved changes discarded");
  };

  // Open request modal (if there are saved changes)
  const openRequestModal = () => {
    if (!changesSaved || (changes.modified && changes.modified.length === 0)) {
      toast.info("No saved changes to request");
      return;
    }
    setShowRequestModal(true);
  };

  // When user confirms the final request
  const handleRequestConfirm = () => {
    // Simulate sending request to backend
    console.log("Request submitted:", {
      about_us: originalData?.about_us,
      image: uploadedFile ? uploadedFile.file.name : "No image change",
      changes: changes.modified,
    });

    toast.success("Request submitted successfully!");

    // CLOSE the modal
    setShowRequestModal(false);

    // IMPORTANT: hide Discard & Request buttons by clearing the "changesSaved" flag
    // Also clear the changes list since request has been sent
    setChangesSaved(false);
    setChanges({ modified: [], added: [], deleted: [] });

    // Optionally keep 'originalData' as-is (we left it updated on save)
    // Clean uploadedFile/temp file if you prefer:
    setUploadedFile(null);
    setTempImageFile(null);
    setHasChanges(false);

    // Now the Discard + Request buttons (which are shown only when changesSaved === true)
    // will disappear automatically.
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

  return (
    <>
      <section className="about-hostel relative w-full max-w-7xl mx-auto p-4">
        {/* Top Right Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 items-center">
          {/* Edit button: visible when not currently editing */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
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
              <label className="mt-2 cursor-pointer text-white bg-blue-500 px-3 py-1 rounded inline-flex items-center gap-2">
                Upload
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

        {/* Bottom controls while editing: Cancel (left) and Save (right) */}
        {isEditing && (
          <div className="absolute bottom-4 right-4 flex gap-2 items-center z-[60]">
            {/* Cancel (left) */}
            <button
              onClick={cancelUnsavedChanges}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>

            {/* Save (right) - only visible when there are unsaved changes */}
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

        {/* After Save: show Discard Changes + Request (bottom-right) */}
        {!isEditing && changesSaved && (
          <div className="absolute bottom-4 right-4 flex gap-2 items-center z-[60]">
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
              <Send size={16}/>Request
            </button>
          </div>
        )}

        {/* Optional Page View / Save bar (kept for compatibility with your earlier logic) */}
        {hasChanges && !isEditing && (
          <div className="page-view-button-container fixed bottom-20 right-4 z-[50]">
            {!isPageView ? (
              <button className="page-view-btn px-4 py-2 rounded bg-[#fdcc03] text-text" onClick={togglePageView}>
                Save (open editor)
              </button>
            ) : (
              <button className="exit-page-view-btn mt-2 px-4 py-2 rounded bg-gray-400 text-white" onClick={togglePageView}>
                Back To Edit
              </button>
            )}
          </div>
        )}
      </section>

      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Request Modal Popup */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px]">
            {/* Title */}
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            {/* Note */}
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            {/* Summary */}
            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.modified && changes.modified.length > 0 ? (
                    changes.modified.map((change, index) => (
                      <tr key={index}>
                        <td className="py-1 text-blue-600">✎ Edited</td>
                        <td className="py-1">Hostel About</td>
                        <td className="py-1 text-[12px] flex flex-col items-center">
                          {change.toLowerCase().includes("text") && (
                            <span>Text content updated</span>
                          )}

                          {change.toLowerCase().includes("image") && uploadedFile && (
                            <>
                              <span>Previous: {getFilenameFromPath(initialSnapshot?.image_path || originalData?.image_path)}</span>
                              <span className="mx-2">→</span>
                              <a
                                href={uploadedFile.fileURL}
                                className="cursor-pointer text-blue-500 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {uploadedFile.file.name}
                              </a>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2" colSpan={3}>
                        No changes to request
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
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
