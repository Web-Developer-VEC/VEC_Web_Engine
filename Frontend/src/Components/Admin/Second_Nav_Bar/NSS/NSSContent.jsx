import React, { useState, useEffect } from "react";
import "./NSSCotent.css";
import { Pencil, Plus, Send, X, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import Autotextarea from "../AutoResizeTextarea";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const NSSContent = ({ data }) => {
  const [content, setContent] = useState(null);
  const [committedContent, setCommittedContent] = useState(null);
  const [pendingContent, setPendingContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const { sendRequest, loading, error } = useAdminRequest();

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const contentData = data[0];
      const copy = deepCopy(contentData);
      setCommittedContent(copy);
      setContent(deepCopy(copy));
      setPendingContent(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
    }
  }, [data]);

  const handleStartEdit = () => {
    if (pendingContent) {
      setContent(deepCopy(pendingContent));
    } else {
      setContent(deepCopy(committedContent));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingContent);
  };

  const handleChange = (section, index, value) => {
    const updatedContent = { ...content };
    
    if (Array.isArray(updatedContent[section])) {
      const newSection = [...updatedContent[section]];
      newSection[index] = value;
      updatedContent[section] = newSection;
    } else {
      updatedContent[section] = value;
    }
    
    setContent(updatedContent);
    setIsDirty(true);
  };

  const handleAddPoint = (section) => {
    const updatedContent = { ...content };
    
    if (Array.isArray(updatedContent[section])) {
      updatedContent[section] = [...updatedContent[section], ""];
    } else {
      updatedContent[section] = [""];
    }
    
    setContent(updatedContent);
    setIsDirty(true);
  };

  const handleRemovePoint = (section, index) => {
    const updatedContent = { ...content };
    
    if (Array.isArray(updatedContent[section])) {
      updatedContent[section] = updatedContent[section].filter((_, i) => i !== index);
      setContent(updatedContent);
      setIsDirty(true);
    }
  };

  const handleCancel = () => {
    if (pendingContent) {
      setContent(deepCopy(pendingContent));
    } else {
      setContent(deepCopy(committedContent));
    }

    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(!!pendingContent);
  };

  const handleSave = () => {
    let hasEmptyFields = false;
    
    if (content.about) {
      hasEmptyFields = content.about.some(item => !item.trim());
    }
    
    if (content.objectives && !hasEmptyFields) {
      hasEmptyFields = content.objectives.some(item => !item.trim());
    }

    if (hasEmptyFields) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    const pending = deepCopy(content);
    setPendingContent(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setContent(deepCopy(committedContent));
    setPendingContent(null);
    setIsSaved(false);
    setIsDirty(false);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = async () => {
    if (!pendingContent) {
      toast.error("No draft to submit. Please save changes first.");
      return;
    }

const payload = [];

    if (JSON.stringify(committedContent.about) !== JSON.stringify(pendingContent.about)) {
      payload.push({
        collectionName: "nss",
        collection_type: "about",
        action: "update",
        title: "update about NSS",
        category: null,
        meta_data: { about: pendingContent.about },
        original_data: { about: committedContent.about },
      });
    }

    if (JSON.stringify(committedContent.objectives) !== JSON.stringify(pendingContent.objectives)) {
      payload.push({
        collectionName: "nss",
        collection_type: "about",
        action: "update",
        title: "update objectives NSS",
        category: null,
        meta_data: { objectives: pendingContent.objectives },
        original_data: { objectives: committedContent.objectives },
      });
    }

    if (payload.length === 0) {
      toast.error("No changes detected.");
      return;
    }

    try {
      const result = await sendRequest(payload, []); 
      if (result) {
        setCommittedContent(deepCopy(pendingContent));
        setContent(deepCopy(pendingContent));
        setPendingContent(null);
        setIsSaved(false);
        setShowRequestModal(false);
      } else {
        toast.error("Request failed. Check console for details.");
      }
    } catch (err) {
      console.error("Final request error:", err);
      toast.error("An error occurred while sending request.");
    }
  };

  const revertChange = (section) => {
    if (!pendingContent || !committedContent) return;

    const updated = deepCopy(pendingContent);
    updated[section] = committedContent[section];
    
    setPendingContent(updated);
    setContent(deepCopy(updated));
  };

  const getChanges = () => {
    if (!pendingContent || !committedContent) return [];
    const changes = [];

    if (JSON.stringify(committedContent.about) !== JSON.stringify(pendingContent.about)) {
      changes.push({
        action: "Edited",
        section: "About Section",
        changes: "Updated NSS introduction content",
        itemId: "about"
      });
    }

    if (JSON.stringify(committedContent.objectives) !== JSON.stringify(pendingContent.objectives)) {
      changes.push({
        action: "Edited",
        section: "Objectives Section",
        changes: "Updated objectives content",
        itemId: "objectives"
      });
    }

    return changes;
  };

  const changes = getChanges();

  if (!content) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }
return (
  <> 
    {/* Header Section */}
    <div className="relative flex items-center justify-center mt-8 mr-7">
      <h2 className="text-3xl font-bold text-brwn dark:text-drkt"></h2>
      
      {/* Edit button on right */}
      {!isEditing && (
        <div className="absolute right-0">
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
          >
            <Pencil size={18} />
            Edit
          </button>
        </div>
      )}
    </div>

    {/* Content Section */}
    <div className="nss-container"> 
      <ToastContainer position="bottom-right" autoClose={2000} />

      <div className="nss-content">
        {/* Left Section - NSS Introduction */}
        <div className="nss-box border-l-4 border-secd dark:border-drks dark:bg-drkb hover:scale-105 ease-in-out duration-300">
          <h2 className="nss-title text-accn dark:text-drkt inline-block border-b-2 border-secd dark:text-drks pb-1">
            Welcome to the National Service Scheme
          </h2>
          {isEditing ? (
            <div className="py-2">
              {content.about && content.about.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Autotextarea
                    type="text"
                    value={item}
                    onChange={(e) => handleChange("about", index, e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="About point"
                  />
                  <button
                    onClick={() => handleRemovePoint("about", index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddPoint("about")}
                className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Plus size={16} /> Add Scheme
              </button>
            </div>
          ) : (
            <ul className="nss-list marker:text-accn dark:marker:text-drka">
              {content.about && content.about.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Section - Objectives */}
        <div className="nss-box border-l-4 border-secd dark:border-drks dark:bg-drkb hover:scale-105 ease-in-out duration-300">
          <h2 className="nss-title text-accn dark:text-drkt inline-block border-b-2 border-secd dark:text-drks pb-1">
            Our Objectives
          </h2>
          {isEditing ? (
            <div className="py-2">
              {content.objectives && content.objectives.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Autotextarea
                    type="text"
                    value={item}
                    onChange={(e) => handleChange("objectives", index, e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Objective point"
                  />
                  <button
                    onClick={() => handleRemovePoint("objectives", index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddPoint("objectives")}
                className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Plus size={16} /> Add Objectives
              </button>
            </div>
          ) : (
            <ul className="nss-list marker:text-accn dark:marker:text-drka">
              {content.objectives && content.objectives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>

    {/* Separate Buttons Container */}
    <div className="mt-8 flex justify-end px-6 mb-5 mr-5">
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
          >
            Cancel
          </button>
          {isDirty && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              Save
            </button>
          )}
        </div>
      )}

      {isSaved && !isEditing && (
        <div className="flex gap-3 mb-5 mr-5">
          <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
            Discard Changes
          </button>
          {changes.length > 0 && (
            <button
              onClick={handleRequest}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
              <Send size={18} /> Request
            </button>
          )}
        </div>
      )}
    </div>

    {/* Final Request Modal */}
    {showRequestModal && (
      <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
        <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
          <p className="text-sm text-red-500 mb-4">
            Note: Your changes will stay pending until approved by the superior admin. Once approved will go live.
          </p>
          {changes.length > 0 ? (
            <table className="w-full text-center text-sm border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Revert</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((ch, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-blue-600">{ch.action}</td>
                    <td className="border p-2">{ch.section}</td>
                    <td className="border p-2">{ch.changes}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => revertChange(ch.itemId)}
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
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-prim">
              Cancel
            </button>
            {changes.length > 0 && (
              <button
                onClick={handleFinalRequestConfirm}
                className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                disabled={loading}
              >
                {loading ? "Processing..." : "Final Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </>
);

};

export default NSSContent;
