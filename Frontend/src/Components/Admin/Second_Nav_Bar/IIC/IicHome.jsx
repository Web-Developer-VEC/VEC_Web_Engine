import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Pencil, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

function IicHome({ data }) {
  const [aboutContent, setAboutContent] = useState([]);
  const [committedContent, setCommittedContent] = useState([]);
  const [pendingContent, setPendingContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [emptyFields, setEmptyFields] = useState([]);

  const { sendRequest, loading, error } = useAdminRequest();

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0 && data[0]?.about_iic) {
      const aboutArray = data[0].about_iic || [];
      setCommittedContent(deepCopy(aboutArray));
      setAboutContent(deepCopy(aboutArray));
      setPendingContent(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setEmptyFields([]);
    }
  }, [data]);

  const handleStartEdit = () => {
    if (pendingContent) {
      setAboutContent(deepCopy(pendingContent));
    } else {
      setAboutContent(deepCopy(committedContent));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingContent);
    setEmptyFields([]);
  };

  const handleChangeParagraph = (index, value) => {
    const updatedContent = [...aboutContent];
    updatedContent[index] = value;
    setAboutContent(updatedContent);
    setIsDirty(true);
    
    // Update empty fields array
    const empty = updatedContent.reduce((acc, p, idx) => {
      if (!p.trim()) {
        acc.push(idx);
      }
      return acc;
    }, []);
    setEmptyFields(empty);
  };

  const handleAddParagraph = () => {
    const newContent = [...aboutContent, ""];
    setAboutContent(newContent);
    setIsDirty(true);
    setEmptyFields([...emptyFields, newContent.length - 1]);
  };

  const handleRemoveParagraph = (index) => {
    if (aboutContent.length <= 1) {
      toast.error("You need at least one paragraph!");
      return;
    }

    const updatedContent = aboutContent.filter((_, i) => i !== index);
    setAboutContent(updatedContent);
    setIsDirty(true);
    
    // Update empty fields array
    const empty = updatedContent.reduce((acc, p, idx) => {
      if (!p.trim()) {
        acc.push(idx);
      }
      return acc;
    }, []);
    setEmptyFields(empty);
  };

  const handleCancel = () => {
    if (pendingContent) {
      setAboutContent(deepCopy(pendingContent));
    } else {
      setAboutContent(deepCopy(committedContent));
    }

    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(!!pendingContent);
    setEmptyFields([]);
  };

  const handleSave = () => {
    // Check for empty paragraphs
    const emptyParagraphs = aboutContent.filter((p) => !p.trim());
    
    if (emptyParagraphs.length > 0) {
      // Show which paragraphs are empty
      const emptyIndices = aboutContent.reduce((acc, p, idx) => {
        if (!p.trim()) {
          acc.push(idx + 1);
        }
        return acc;
      }, []);
      
      toast.error(`Please fill all paragraphs before saving! Empty paragraphs: ${emptyIndices.join(', ')}`);
      return;
    }

    setPendingContent(deepCopy(aboutContent));
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setEmptyFields([]);
  };

  const handleDiscard = () => {
    setAboutContent(deepCopy(committedContent));
    setPendingContent(null);
    setIsSaved(false);
    setIsDirty(false);
    setEmptyFields([]);
  };

  const handleRequest = () => {
    // Double-check for empty paragraphs before showing modal
    if (pendingContent) {
      const emptyParagraphs = pendingContent.filter((p) => !p.trim());
      if (emptyParagraphs.length > 0) {
        const emptyIndices = pendingContent.reduce((acc, p, idx) => {
          if (!p.trim()) {
            acc.push(idx + 1);
          }
          return acc;
        }, []);
        toast.error(`Cannot request with empty paragraphs. Please edit and fill all fields. Empty paragraphs: ${emptyIndices.join(', ')}`);
        return;
      }
    }
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = async () => {
    if (!pendingContent) return;

    // Final check for empty paragraphs
    const emptyParagraphs = pendingContent.filter((p) => !p.trim());
    if (emptyParagraphs.length > 0) {
      const emptyIndices = pendingContent.reduce((acc, p, idx) => {
        if (!p.trim()) {
          acc.push(idx + 1);
        }
        return acc;
      }, []);
      toast.error(`Cannot submit request with empty paragraphs. Please go back and fill all fields. Empty paragraphs: ${emptyIndices.join(', ')}`);
      setShowRequestModal(false);
      return;
    }

    // Build payload in the format you provided
    const payload = [
      {
        collectionName: "iic",
        collection_type: "home",
        action: "update",
        title: "Update about_iic",
        meta_data: {
          about_iic: deepCopy(pendingContent),
        },
        original_data: {
          about_iic: deepCopy(committedContent || []),
        },
      },
    ];

    try {
      const result = await sendRequest(payload, []); // no files for this page
      if (result) {
        // commit locally
        setCommittedContent(deepCopy(pendingContent));
        setAboutContent(deepCopy(pendingContent));
        setPendingContent(null);
        setIsSaved(false);
        setShowRequestModal(false);
        setEmptyFields([]);
      }
    } catch (err) {
      console.error("IIC final request error:", err);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const revertChange = () => {
    setAboutContent(deepCopy(committedContent));
    setPendingContent(null);
    setIsSaved(false);
    setShowRequestModal(false);
    setEmptyFields([]);
  };

  const getChanges = () => {
    if (!pendingContent) return [];

    const changes = [];

    // Check if content has changed
    const hasChanges = JSON.stringify(committedContent) !== JSON.stringify(pendingContent);

    if (hasChanges) {
      changes.push({
        action: "Edited",
        section: "About IIC",
        changes: "Content has been modified",
      });
    }

    return changes;
  };

  const changes = getChanges();

  if (!Array.isArray(data) || data.length === 0 || !data[0]?.about_iic) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="relative">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className="grid grid-cols-3 items-center mb-4 mr-8">
        <div></div>

        <h1 className="text-accn dark:text-drkt text-[32px] mt-4 mb-4 font-bold text-center">Home</h1>

        <div className="flex justify-end">
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="naac-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb iic-box m-auto text-sm md:text-base">
        <h2 className="text-[24px] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 naac-about">About IIC</h2>

        {isEditing ? (
          // Edit Mode
          <div className="text-text dark:text-drkt mt-4 mr-4">
            {aboutContent.map((paragraph, index) => (
              <div key={index} className="mb-4 relative">
                <div className="flex items-center mb-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paragraph {index + 1} <span className="text-red-500">*</span>
                  </label>
                  {!paragraph.trim() && (
                    <span className="ml-2 text-xs text-red-500">(Required)</span>
                  )}
                </div>
                <textarea
                  value={paragraph}
                  onChange={(e) => handleChangeParagraph(index, e.target.value)}
                  className={`w-full p-2 border rounded min-h-[100px] ${
                    !paragraph.trim() ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter paragraph content (required)"
                  required
                />
                {/* Uncomment to allow removal of paragraphs
                {aboutContent.length > 1 && (
                  <button
                    onClick={() => handleRemoveParagraph(index)}
                    className="absolute top-8 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    title="Remove paragraph"
                  >
                    <X size={16} />
                  </button>
                )} */}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {/* Uncomment to allow adding paragraphs
              <button
                onClick={handleAddParagraph}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add Paragraph
              </button> */}

              <div className="flex gap-3 ml-auto">
                <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
                  Cancel
                </button>

                {isDirty && (
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${
                      emptyFields.length > 0 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                    }`}
                    disabled={emptyFields.length > 0}
                  >
                    <Save size={18} /> Save
                  </button>
                )}
              </div>
            </div>
            {emptyFields.length > 0 && (
              <p className="text-xs text-red-500 mt-2">
                Please fill all required fields before saving. Empty paragraphs: {emptyFields.map(i => i + 1).join(', ')}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
        ) : (
          // View Mode
          <div className="text-text dark:text-drkt mr-5">
            {aboutContent.map((paragraph, index) => (
              <p key={index} className="mb-2 text-justify">
                {paragraph}
              </p>
            ))}

            {/* Discard/Request buttons when saved */}
            {isSaved && (
              <div className="flex justify-end gap-3 mt-6">
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
                    <th className="border p-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => (
                    <tr key={i}>
                      <td className="border p-2 text-blue-600">{ch.action}</td>
                      <td className="border p-2">{ch.section}</td>
                      <td className="border p-2">{ch.changes}</td>
                      <td className="border p-2">
                        <button onClick={revertChange} className="p-1 rounded hover:bg-gray-100" title="Revert all changes">
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
    </div>
  );
}

export default IicHome;