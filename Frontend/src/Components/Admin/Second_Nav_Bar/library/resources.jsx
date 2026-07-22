import { useEffect, useState } from "react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2, Save, Send } from "lucide-react";
import { motion } from "framer-motion";

export function LIBResources({ data }) {
  const [openSection, setOpenSection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestChanges, setRequestChanges] = useState([]);
  const { sendRequest, loading, error } = useAdminRequest();

  useEffect(() => {
    if (data) {
      setFormData(deepCopy(data));
      setOriginalData(deepCopy(data));
    }
  }, [data]);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const deepCopy = (v) => JSON.parse(JSON.stringify(v));

  const handleEditClick = () => {
    setIsEditing(true);
    setShowRequestButtons(false);
  };

  const handleInputChange = (sectionIndex, contentIndex, value, field) => {
    const updated = [...formData];
    const updatedContent = [...updated[sectionIndex].content];

    if (typeof updatedContent[contentIndex] === "string") {
      updatedContent[contentIndex] = value;
    } else {
      updatedContent[contentIndex] = { ...updatedContent[contentIndex], [field]: value };
    }

    updated[sectionIndex] = { ...updated[sectionIndex], content: updatedContent };
    setFormData(updated);
  };

  const cleanupFormData = (data) => {
    // Remove temporary properties like 'selected' and convert _isString back to strings
    return data.map(section => ({
      ...section,
      content: section.content.map(item => {
        if (typeof item === "string") return item;

        // If it's marked as a string, convert back
        if (item._isString) {
          return item.value;
        }

        // For objects, remove 'selected' property
        const { selected, ...cleanItem } = item;
        return cleanItem;
      })
    }));
  };

  const validateRequiredFields = () => {
    const errors = [];

    formData.forEach((section, sectionIdx) => {
      section.content.forEach((item, itemIdx) => {
        // Handle string items
        if (typeof item === "string") {
          if (!item.trim()) {
            errors.push(`${section.category} - Item ${itemIdx + 1}: Field is empty`);
          }
        }
        // Handle _isString marked items
        else if (item?._isString) {
          if (!item.value || !item.value.trim()) {
            errors.push(`${section.category} - Item ${itemIdx + 1}: Field is empty`);
          }
        }
        // Handle object items (name/link)
        else if (typeof item === "object") {
          if (!item.name || !item.name.trim()) {
            errors.push(`${section.category} - Item ${itemIdx + 1}: Name is required`);
          }
          if (!item.link || !item.link.trim()) {
            errors.push(`${section.category} - Item ${itemIdx + 1}: Link is required`);
          }
        }
      });
    });

    return errors;
  };

  const getDetailedChanges = (cleanedData) => {
    const detailedChanges = [];

    const getItemKey = (item) => {
      if (typeof item === "string") return item.trim();

      if (item?._isString) return item.value.trim();

      return `${item.name || ""}|||${item.link || ""}`;
    };

    const formatItem = (item) => {
      if (typeof item === "string") return item;
      if (item?._isString) return item.value;
      return `${item.name} - ${item.link}`;
    };

    cleanedData.forEach((section, sectionIdx) => {
      const origSection = originalData[sectionIdx];
      if (!origSection) return;

      const oldContent = origSection.content || [];
      const newContent = section.content || [];

      // ---------- Deleted ----------
      oldContent.forEach((oldItem) => {
        const exists = newContent.some(
          (newItem) => getItemKey(newItem) === getItemKey(oldItem)
        );

        if (!exists) {
          detailedChanges.push({
            type: "Deleted",
            sectionName: section.category,
            sectionIndex: sectionIdx,
            item: oldItem,
            displayText: formatItem(oldItem),
          });
        }
      });

      // ---------- Added ----------
      newContent.forEach((newItem) => {
        const exists = oldContent.some(
          (oldItem) => getItemKey(oldItem) === getItemKey(newItem)
        );

        if (!exists) {
          detailedChanges.push({
            type: "Added",
            sectionName: section.category,
            sectionIndex: sectionIdx,
            item: newItem,
            displayText: formatItem(newItem),
          });
        }
      });

      // ---------- Edited ----------
      const limit = Math.min(oldContent.length, newContent.length);

      for (let i = 0; i < limit; i++) {
        const oldItem = oldContent[i];
        const newItem = newContent[i];

        if (getItemKey(oldItem) === getItemKey(newItem)) continue;

        // ignore if it was already classified as add/delete
        const oldStillExists = newContent.some(
          (x) => getItemKey(x) === getItemKey(oldItem)
        );

        const newAlreadyExisted = oldContent.some(
          (x) => getItemKey(x) === getItemKey(newItem)
        );

        if (!oldStillExists && !newAlreadyExisted) {
          if (
            typeof oldItem === "object" &&
            typeof newItem === "object" &&
            !oldItem._isString &&
            !newItem._isString
          ) {
            const parts = [];

            if (oldItem.name !== newItem.name) {
              parts.push(`Name: "${oldItem.name}" → "${newItem.name}"`);
            }

            if (oldItem.link !== newItem.link) {
              parts.push(`Link: "${oldItem.link}" → "${newItem.link}"`);
            }

            detailedChanges.push({
              type: "Edited",
              sectionName: section.category,
              sectionIndex: sectionIdx,
              oldItem,
              newItem,
              displayText: parts.join(" | "),
            });
          }
        }
      }
    });

    return detailedChanges;
  };

  const handleSave = () => {
    // Validate required fields first
    const validationErrors = validateRequiredFields();

    if (validationErrors.length > 0) {
      toast.error(
        <div>
          <div className="font-bold mb-2">Please fix the following errors:</div>
          {validationErrors.slice(0, 3).map((error, idx) => (
            <div key={idx} className="text-sm">• {error}</div>
          ))}
          {validationErrors.length > 3 && (
            <div className="text-sm mt-1">... and {validationErrors.length - 3} more</div>
          )}
        </div>,
        { autoClose: 5000 }
      );
      return;
    }

    // Clean up the data
    const cleanedData = cleanupFormData(formData);

    // Get detailed changes
    const detailedChanges = getDetailedChanges(cleanedData);

    if (detailedChanges.length === 0) {
      toast.info("No changes detected");
      setIsEditing(false);
      return;
    }

    // Update formData with cleaned data
    setFormData(cleanedData);
    setRequestChanges(detailedChanges);
    setShowRequestButtons(true);
    setIsEditing(false);
  };

  const handleDelete = (sectionIndex) => {
    const section = formData[sectionIndex];
    const deletedItems = section.content.filter((item) => {
      // Handle both string and object items
      if (typeof item === "string") return false; // strings don't have selected property
      return item?.selected;
    });

    const updatedContent = section.content.filter((item) => {
      if (typeof item === "string") return true; // keep all strings
      return !item?.selected; // remove selected objects
    });

    if (deletedItems.length === 0) {
      toast.warn("No items selected for deletion");
      setShowDeleteModal(false);
      return;
    }

    const updated = [...formData];
    updated[sectionIndex] = { ...section, content: updatedContent };
    setFormData(updated);

    setShowDeleteModal(false);
    toast.info(`Deleted ${deletedItems.length} item(s). Click Save to confirm.`);
  };

  const handleCancel = () => {
    setFormData(deepCopy(originalData));
    setIsEditing(false);
    setShowRequestButtons(false);
    setRequestChanges([]);
  };

  const handleDiscard = () => {
    setFormData(deepCopy(originalData));
    setShowRequestButtons(false);
    setRequestChanges([]);
    toast.info("Changes discarded");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleRequestConfirm = async () => {
    if (requestChanges.length === 0) {
      toast.warn("No changes to submit");
      return;
    }

    // Group changes by section
    const sectionChanges = {};
    requestChanges.forEach((change) => {
      if (!sectionChanges[change.sectionName]) {
        sectionChanges[change.sectionName] = [];
      }
      sectionChanges[change.sectionName].push(change);
    });

    const payload = Object.keys(sectionChanges).map((sectionName) => {
      const section = formData.find(s => s.category === sectionName);
      const origSection = originalData.find(s => s.category === sectionName);
      const changes = sectionChanges[sectionName];

      // Check if there are any edits or additions
      const hasEditsOrAdds = changes.some(c => c.type === "Edited" || c.type === "Added");
      const hasDeletes = changes.some(c => c.type === "Deleted");

      if (hasDeletes && !hasEditsOrAdds) {
        // Only deletions
        return {
          collectionName: "library",
          collection_type: "library_resources",
          action: "delete",
          title: `Delete from ${sectionName}`,
          category: sectionName,
          meta_data: {
            category: sectionName,
            content: section.content,
          },
          original_data: {
            category: sectionName,
            content: origSection.content,
          },
        };
      } else {
        // Updates or additions
        return {
          collectionName: "library",
          collection_type: "library_resources",
          action: "update",
          title: `Update ${sectionName}`,
          category: sectionName,
          meta_data: {
            category: sectionName,
            content: section.content,
          },
          original_data: {
            category: sectionName,
            content: origSection.content,
          },
        };
      }
    });

    console.log("📦 FINAL LIBRARY RESOURCE PAYLOAD:", payload);

    try {
      await sendRequest(payload);

      setOriginalData(deepCopy(formData));
      setShowRequestModal(false);
      setShowRequestButtons(false);
      setRequestChanges([]);

      // toast.success("Library resources request submitted!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to submit request");
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={2000} />
      {Array.isArray(data) && (
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
            <h2 className="text-4xl font-bold text-accn dark:text-drkt">
              Library Resources
            </h2>

            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 p-3
bg-[#FDCC03] text-black font-medium
rounded-xl shadow-md
hover:bg-[#800000] hover:!text-white
hover:shadow-lg
active:scale-95 transition-all duration-200"
              >
                <Pencil size={20} />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="max-w-xl mx-auto space-y-6">
            {formData?.map((section, index) => (
              <div
                key={index}
                className="dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-2xl shadow-lg relative"
              >
                {/* Toggle button */}
                <button
                  onClick={() => toggleSection(index)}
                  className={`w-full flex justify-between items-center 
                  text-base sm:text-lg px-4 py-2 font-semibold
                  transition-all rounded-2xl text-white dark:text-drkp mb-4
                  ${openSection === index
                      ? "bg-[#FDCC03] text-black dark:bg-drks"
                      : "bg-accn dark:bg-drks"
                    }`}
                >
                  <h2
                    className={`text-xl font-bold mb-0 ${openSection === index ? "text-black" : "text-white"
                      }`}
                  >
                    {section.category}
                  </h2>

                  {openSection === index ? (
                    <span className="text-black">▲</span>
                  ) : (
                    <span>▼</span>
                  )}
                </button>

                {/* Collapsible content */}
                {openSection === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2 relative"
                  >
                    {/* Editing form */}
                    {isEditing && (
                      <div className="space-y-3 pb-4">
                        {section.content?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2"
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={item?.selected || false}
                              onChange={(e) => {
                                const updated = [...formData];
                                const updatedContent = [...updated[index].content];

                                // Handle string vs object differently
                                if (typeof updatedContent[idx] === "string") {
                                  // For strings, create an object with the value and selected state
                                  updatedContent[idx] = {
                                    _isString: true,
                                    value: updatedContent[idx],
                                    selected: e.target.checked,
                                  };
                                } else {
                                  updatedContent[idx] = {
                                    ...updatedContent[idx],
                                    selected: e.target.checked,
                                  };
                                }

                                updated[index] = { ...updated[index], content: updatedContent };
                                setFormData(updated);
                              }}
                              className="h-4 w-4"
                            />

                            {/* Editable fields */}
                            {(typeof item === "string" || item?._isString) ? (
                              <input
                                type="text"
                                value={typeof item === "string" ? item : item.value}
                                onChange={(e) => {
                                  const updated = [...formData];
                                  const updatedContent = [...updated[index].content];

                                  if (typeof updatedContent[idx] === "string") {
                                    updatedContent[idx] = e.target.value;
                                  } else if (updatedContent[idx]._isString) {
                                    updatedContent[idx] = {
                                      ...updatedContent[idx],
                                      value: e.target.value,
                                    };
                                  }

                                  updated[index] = { ...updated[index], content: updatedContent };
                                  setFormData(updated);
                                }}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-drkp dark:text-drka"
                              />
                            ) : (
                              <div className="flex gap-2 w-full">
                                <input
                                  type="text"
                                  value={item.name || ""}
                                  onChange={(e) =>
                                    handleInputChange(index, idx, e.target.value, "name")
                                  }
                                  placeholder="Name"
                                  className="w-1/2 px-3 py-2 border rounded-lg dark:bg-drkp dark:text-drka"
                                />
                                <input
                                  type="text"
                                  value={item.link || ""}
                                  onChange={(e) =>
                                    handleInputChange(index, idx, e.target.value, "link")
                                  }
                                  placeholder="Link"
                                  className="w-1/2 px-3 py-2 border rounded-lg dark:bg-drkp dark:text-drka"
                                />
                              </div>
                            )}
                          </div>
                        ))}

                        {/* + New Link/Item button */}
                        <button
                          onClick={() => {
                            const updated = [...formData];
                            const currentSection = updated[index];

                            // Detect content type: check first non-selected item
                            const firstRealItem = currentSection.content.find(item => {
                              if (typeof item === "string") return true;
                              if (item?._isString) return true;
                              if (!item?.selected) return true;
                              return false;
                            });

                            const isStringSection = typeof firstRealItem === "string" || firstRealItem?._isString;

                            // Add appropriate type
                            if (isStringSection) {
                              updated[index] = {
                                ...updated[index],
                                content: [...updated[index].content, ""]
                              };
                            } else {
                              updated[index] = {
                                ...updated[index],
                                content: [...updated[index].content, { name: "", link: "" }]
                              };
                            }

                            setFormData(updated);
                          }}
                          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          + New Item
                        </button>

                        {/* Delete button */}
                        {section.content.some((item) => {
                          // Check if any object items have selected=true
                          if (typeof item === "string") return false;
                          return item?.selected;
                        }) && (
                            <div className="mt-4">
                              <button
                                onClick={() => setShowDeleteModal(index)}
                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                <Trash2 size={18} />
                                Delete Selected
                              </button>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Normal view (when not editing) */}
                    {!isEditing && (
                      <>
                        {Array.isArray(section.content) ? (
                          <ul className="list-disc marker:text-accn dark:marker:text-drka pl-6 space-y-2">
                            {section.content.map((item, idx) => {
                              // Handle string, object, or _isString marked items
                              let displayText;
                              if (typeof item === "string") {
                                displayText = item;
                              } else if (item?._isString) {
                                displayText = item.value;
                              } else {
                                displayText = item?.name || "";
                              }

                              return (
                                <li
                                  key={idx}
                                  className="text-text dark:text-drka"
                                >
                                  {displayText}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-text dark:text-drka">{section.content}</p>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Global action buttons */}
          {(isEditing || showRequestButtons) && (
            <div className="max-w-4xl mx-auto mt-8 flex justify-end gap-4">
              {isEditing && !showRequestButtons && (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-[#fdcc03] text-black rounded-lg hover:bg-[#800000] hover:!text-white font-medium"
                  >

                    Save
                  </button>
                </>
              )}

              {showRequestButtons && (
                <>
                  <button
                    onClick={handleDiscard}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleRequest}
                    className="flex items-center gap-2 px-6 py-3 bg-[#fdcc03] text-black rounded-lg hover:bg-[#800000] hover:!text-white font-medium"
                  >
                    <Send size={20} />
                    Send Request
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal !== false && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl shadow-lg w-[400px] text-center">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-drka">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the selected items? This action
              cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>

            <p className="text-sm text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will go live.
            </p>

            <table className="w-full text-sm border border-gray-300 dark:text-drkt">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border py-2 text-center w-[100px]">
                    Action
                  </th>
                  <th className="border py-2 text-center">Section</th>
                  <th className="border py-2 text-center">Changes</th>
                  <th className="border py-2 text-center w-[80px]">Undo</th>
                </tr>
              </thead>

              <tbody>
                {requestChanges.map((change, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="border py-2 text-center font-semibold">
                      <span className={`
                        ${change.type === "Added" ? "text-green-600" : ""}
                        ${change.type === "Edited" ? "text-blue-600" : ""}
                        ${change.type === "Deleted" ? "text-red-600" : ""}
                      `}>
                        {change.type}
                      </span>
                    </td>

                    <td className="border py-2 text-center">
                      {change.sectionName}
                    </td>

                    <td className="border py-2 px-3 text-left">
                      {change.type === "Added" && (
                        <div className="text-green-700 dark:text-green-400">
                          <span className="font-semibold">New: </span>
                          {change.displayText}
                        </div>
                      )}
                      {change.type === "Edited" && (
                        <div className="text-blue-700 dark:text-blue-400">
                          {change.displayText}
                        </div>
                      )}
                      {change.type === "Deleted" && (
                        <div className="text-red-700 dark:text-red-400">
                          <span className="font-semibold">Removed: </span>
                          {change.displayText}
                        </div>
                      )}
                    </td>

                    <td className="border py-2 text-center">
                      <button
                        onClick={() => {
                          const sectionIdx = change.sectionIndex;

                          // Undo the specific change in formData
                          setFormData((prev) => {
                            const updated = deepCopy(prev);
                            const section = updated[sectionIdx];

                            if (change.type === "Added") {
                              // Remove the added item
                              const getItemKey = (item) => {
                                if (typeof item === "string") return item;
                                if (item?.name && item?.link) return `${item.name}|||${item.link}`;
                                return JSON.stringify(item);
                              };
                              const targetKey = getItemKey(change.item);
                              section.content = section.content.filter(
                                item => getItemKey(item) !== targetKey
                              );
                            } else if (change.type === "Deleted") {
                              // Add the deleted item back (append to end)
                              section.content.push(change.item);
                            } else if (change.type === "Edited") {
                              // Revert the edited item to original
                              const getItemKey = (item) => {
                                if (typeof item === "string") return item;
                                if (item?.name && item?.link) return `${item.name}|||${item.link}`;
                                return JSON.stringify(item);
                              };
                              const newKey = getItemKey(change.newItem);
                              const itemIndex = section.content.findIndex(
                                item => getItemKey(item) === newKey
                              );
                              if (itemIndex !== -1) {
                                section.content[itemIndex] = change.oldItem;
                              }
                            }

                            return updated;
                          });

                          // Remove this change from the list
                          const newChanges = requestChanges.filter((_, i) => i !== idx);
                          setRequestChanges(newChanges);

                          // If no changes left at all, close modal and reset state
                          if (newChanges.length === 0) {
                            setShowRequestModal(false);
                            setShowRequestButtons(false);
                            toast.success("All changes reverted");
                          } else {
                            toast.info(`Reverted: ${change.displayText}`);
                          }
                        }}
                        className="inline-flex items-center justify-center p-1 rounded hover:bg-red-100 text-red-600 hover:text-red-800 font-bold"
                        title="Undo change"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestConfirm}
                disabled={loading}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-[#800000] text-black font-medium hover:!text-white"
              >
                {loading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
