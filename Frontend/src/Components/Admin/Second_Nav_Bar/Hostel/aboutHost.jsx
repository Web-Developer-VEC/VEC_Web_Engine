import { useState, useEffect } from "react";
import "./aboutHost.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AboutHostel({ hostelData, theme, toggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPageView, setIsPageView] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [tempImageFile, setTempImageFile] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [changes, setChanges] = useState({
    modified: [],
    added: [],
    deleted: []
  });
  const [hasChanges, setHasChanges] = useState(false);

  let data;
  if (hostelData) {
    data = hostelData[0];
  }

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (data) {
      setAboutText(data?.about_us || "");
      setImagePath(UrlParser(data?.image_path));
      setOriginalData(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  // Check for changes whenever aboutText or tempImageFile changes
  useEffect(() => {
    if (!originalData) return;
    
    const textChanged = aboutText !== originalData.about_us;
    const imageChanged = tempImageFile !== null;
    
    setHasChanges(textChanged || imageChanged);
  }, [aboutText, tempImageFile, originalData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImageFile(file);
      setUploadedFile({
        file: file,
        fileURL: URL.createObjectURL(file)
      });
      setImagePath(URL.createObjectURL(file));
    }
  };

  const analyzeChanges = () => {
    if (!originalData) return;
    
    const changesDetected = [];
    
    // Check if about text changed
    if (aboutText !== originalData.about_us) {
      changesDetected.push("About text modified");
    }
    
    // Check if image changed
    if (tempImageFile) {
      changesDetected.push("Image changed");
    }
    
    if (changesDetected.length > 0) {
      setChanges({
        modified: changesDetected,
        added: [],
        deleted: []
      });
      setShowRequestModal(true);
    } else {
      toast.info("No changes detected");
    }
  };

  const handleRequestConfirm = () => {
    console.log("Saving data:", {
      about_us: aboutText,
      image: tempImageFile ? "New image uploaded" : "No image change"
    });
    
    // In a real implementation, you would send this data to your backend
    // For now, we'll just simulate the request
    toast.success("Request submitted successfully!");
    setIsEditing(false);
    setIsPageView(false);
    setShowRequestModal(false);
    
    // Update original data with new values
    if (originalData) {
      const updatedOriginal = {...originalData};
      updatedOriginal.about_us = aboutText;
      if (tempImageFile) {
        updatedOriginal.image_path = imagePath; // This would be the server path in real implementation
      }
      setOriginalData(updatedOriginal);
    }
    
    setTempImageFile(null);
    setUploadedFile(null);
    setHasChanges(false);
  };

  const cancelChanges = () => {
    setAboutText(originalData?.about_us || "");
    setImagePath(UrlParser(originalData?.image_path));
    setIsEditing(false);
    setIsPageView(false);
    setTempImageFile(null);
    setUploadedFile(null);
    setChanges({ modified: [], added: [], deleted: [] });
    setHasChanges(false);
    toast.info("Changes have been reverted");
  };

  const togglePageView = () => {
    setIsPageView(!isPageView);
    // When exiting page view, go back to edit mode
    if (isPageView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  // Extract filename from path
  const getFilenameFromPath = (path) => {
    if (!path) return "";
    return path.split('/').pop();
  };

  return (
    <>
      {data ? (
        <section className="about-hostel relative w-full max-w-7xl mx-auto p-4">
          {/* Top Right Buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            {!isEditing && !isPageView && (
              <button
                onClick={() => setIsEditing(true)}
                className="edit-btn-t mr-8"
              >
                Edit
              </button>
            )}
            {isEditing && !isPageView && (
              <>
                <button
                  onClick={cancelChanges}
                  className="cancel-btn-t mr-6"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <h2 className="about-hostel-heading text-center text-3xl font-bold mb-4 text-brwn dark:text-drkt">
            About Our Hostel
          </h2>

          <div className="hostel-abt-container flex flex-col md:flex-row items-center justify-center gap-6 font-[poppins]">
            {/* About Us Text */}
            <div className="md:w-1/2 w-full">
              {isEditing && !isPageView ? (
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
              {/* {isEditing && !isPageView && (
                <label className="mt-2 cursor-pointer text-blue-600">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  📤 Upload Image
                </label>
              )} */}
            </div>
          </div>

          {/* Request Button in Page View mode */}
          {isPageView && (
            <div className="request-button-cntnr">
              <button className="request-btn-1 absolute mb-4 bottom-2 right-8 flex gap-2" onClick={analyzeChanges}>Request</button>
            </div>
          )}

          {/* Page View Toggle Button at bottom of page - Only show when hasChanges is true */}
          {hasChanges && (
            <div className="page-view-button-container">
              {!isPageView ? (
                <button className="page-view-btn" onClick={togglePageView}>
                  save
                </button>
              ) : (
                <button className="exit-page-view-btn mt-2" onClick={togglePageView}>
                  Back To Edit
                </button>
              )}
            </div>
          )}
        </section>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

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
                  {changes.modified.map((change, index) => (
                    <tr key={index}>
                      <td className="py-1 text-blue-600">✎ Edited</td>
                      <td className="py-1">Hostel About</td>
                      <td className="py-1 text-[12px] flex flex-col items-center">
                        {change.includes("text") && (
                          <>
                            <span>Text content updated</span>
                          </>
                        )}
                        {change.includes("Image") && uploadedFile && (
                          <>
                            <span>Previous: {getFilenameFromPath(originalData?.image_path)}</span>
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
                  ))}
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