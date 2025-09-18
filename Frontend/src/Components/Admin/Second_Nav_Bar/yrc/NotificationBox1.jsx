import React, { useState, useEffect } from "react";
// import "./NotificationBox.css";
import LoadComp from "../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faUndoAlt, faEdit, faTimes, faEye } from "@fortawesome/free-solid-svg-icons";
import { Trash2, PlusCircle, Edit2, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AutoResizeTextarea from "../AutoResizeTextarea";

const NotificationBox1 = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [tempData, setTempData] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setTempData(data);
    }
  }, [data]);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsPreviewing(false);
  };

  const handleCancelClick = () => {
    toast.info("Changes canceled");
    setTempData(data);
    setChanges([]);
    setIsEditing(false);
    setIsPreviewing(false);
    setHasChanges(false);
  };

  // const handlePreviewClick = () => {
  //   setIsPreviewing(true);
  // };
const handlePreviewClick = () => {
  const hasEmptyFields = (tempData || []).some(
    (item) => !item || (typeof item === "object" && !item.text?.trim())
  );

  if (hasEmptyFields) {
    toast.error("Please fill all required fields before previewing.");
    return;
  }

  setIsPreviewing(true);
};


  const handleBackToEdit = () => {
    setIsPreviewing(false);
  };

  const handleDelete = (index) => {
    const deletedItem = tempData[index];
    const newData = tempData.filter((_, i) => i !== index);
    setTempData(newData);
    setChanges([...changes, { action: "deleted", item: deletedItem, index }]);
    setHasChanges(true);
  };

  const handleAddNew = () => {
    const newData = [...tempData, ""];
    setTempData(newData);
    setChanges([...changes, { action: "added", item: "", index: tempData.length }]);
    setHasChanges(true);
  };

  const handleRequestClick = () => {
    if (changes.length > 0) setShowPopup(true);
  };

  const handleFinalRequest = () => {
    toast.success("Final request submitted!");
    console.log("Submitted changes:", changes);
    setShowPopup(false);
    setIsEditing(false);
    setIsPreviewing(false);
    setChanges([]);
    setHasChanges(false);
  };

  const handleUndo = (changeIndex) => {
    const change = changes[changeIndex];
    const newData = [...tempData];

    if (change.action === "deleted") {
      newData.splice(change.index, 0, change.item);
    } else if (change.action === "added") {
      newData.splice(change.index, 1);
    }

    setTempData(newData);
    setChanges(changes.filter((_, i) => i !== changeIndex));
    setHasChanges(changes.length > 1);
  };

  const handleChange = (index, value) => {
    const updated = [...tempData];
    // Convert stringified objects back to object if JSON
    try {
      updated[index] = JSON.parse(value);
    } catch {
      updated[index] = value;
    }
    setTempData(updated);
    setHasChanges(true);
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const renderContent = () => {
    if (isPreviewing) {
      return (
        <div className="nss-notification-container relative">
          <div className="flex justify-between mb-2 items-center">
            <h2 className="nss-news-updates text-sm md:text-lg text-brwn dark:text-drkt border-b-2 border-yellow-500 pb-1">
              Bringing you the latest news & updates
            </h2>
          </div>

          <div className="nss-notification-box dark:bg-drkb mt-2">
            <div className="nss-notification-header flex justify-between items-center">
              <span>Recent Updates</span>
            </div>

            <div className="scrolling-news">
              <div className="scrolling-inner">
                {tempData.map((item, index) =>
                  typeof item === "string" ? (
                    <p key={index} className="news-item mb-2">
                      <li>{item}</li>
                    </p>
                  ) : (
                    Object.entries(item).map(([key, value]) => (
                      <p key={key} className="news-item mb-2">
                        <strong>{key}:</strong> {value}
                      </p>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (isEditing) {
      return (
        <div className="nss-notification-container relative">
          <div className="flex justify-between mb-2 items-center">
            <h2 className="nss-news-updates text-sm md:text-lg text-brwn dark:text-drkt border-b-2 border-yellow-500 pb-1">
              Bringing you the latest news & updates
            </h2>
          </div>

          <div className="nss-notification-box dark:bg-drkb mt-2">
            <div className="nss-notification-header flex justify-between items-center">
              <span>Recent Updates</span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-yellow-400 text-brown-900">
                    <th className="border px-2 py-1">News Item</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tempData.map((item, index) => {
                    const displayValue = typeof item === "string" ? item : JSON.stringify(item, null, 2);
                    return (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="border px-2 py-1 w-full">
                          <AutoResizeTextarea
                            className="w-full p-1 border rounded"
                            value={displayValue}
                            onChange={(e) => handleChange(index, e.target.value)}
                          />
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            className="text-red-700"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-2 flex justify-start">
                <button className="nss-btn nss-btn-add flex m-3" onClick={handleAddNew}>
                  <PlusCircle size={18} /> Add New
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="nss-notification-container relative">
          <div className="flex justify-between mb-2 items-center">
            <h2 className="nss-news-updates text-sm md:text-lg text-brwn dark:text-drkt border-b-2 border-yellow-500 pb-1">
              Bringing you the latest news & updates
            </h2>
          </div>

          <div className="nss-notification-box dark:bg-drkb mt-2">
            <div className="nss-notification-header flex justify-between items-center">
              <span>Recent Updates</span>
            </div>

            <div className="scrolling-news">
              <div className="scrolling-inner">
                {tempData.map((item, index) =>
                  typeof item === "string" ? (
                    <p key={index} className="news-item mb-2">
                      <li>{item}</li>
                    </p>
                  ) : (
                    Object.entries(item).map(([key, value]) => (
                      <p key={key} className="news-item mb-2">
                        <strong>{key}:</strong> {value}
                      </p>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="nss-container relative">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {renderContent()}

      {/* Edit / Cancel Button (Top-Right) */}
      <div className="absolute top-4 right-4">
        {!isEditing ? (
          <button className="nss-btn nss-btn-edit" onClick={handleEditClick}>
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
        ) : (
          <button className="nss-btn nss-btn-cancel" onClick={handleCancelClick}>
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && !isPreviewing && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            className={`nss-btn nss-btn-request ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handlePreviewClick}
            disabled={!hasChanges}
          >
            <FontAwesomeIcon icon={faEye} /> Preview
          </button>

        </div>
      )}

      {isPreviewing && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="nss-btn nss-btn-edit" onClick={handleBackToEdit}>
            <FontAwesomeIcon icon={faUndoAlt} /> Back to Edit
          </button>
          <button
            className="nss-btn nss-btn-request"
            onClick={handleRequestClick}
          >
            <FontAwesomeIcon icon={faPaperPlane} /> Request Changes
          </button>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Final Request for the Changes
            </h2>
            <p className="text-red-600 mb-4">
              <span className="font-medium">Note:</span> Your changes will stay
              pending until approved by the superior admin. Once approved, they
              will be applied automatically to the live site.
            </p>
            
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Action</th>
                  {/* <th className="text-left p-2">Content</th> */}
                  <th className="text-left p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((ch, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 capitalize">{ch.action}</td>
                    {/* <td className="p-2">
                      {typeof ch.item === "string" ? ch.item : JSON.stringify(ch.item)}
                    </td> */}
                    <td className="p-2">
                      <button
                        className="nss-btn nss-btn-undo flex items-center gap-1 text-sm"
                        onClick={() => handleUndo(idx)}
                      >
                        <FontAwesomeIcon icon={faUndoAlt} /> Undo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 nss-btn-request text-white rounded-md flex items-center"
                onClick={handleFinalRequest} disabled={changes.length === 0}
              >
                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" /> Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBox1;