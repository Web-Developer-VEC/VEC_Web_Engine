import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

function IicEco({ data, isEditing, onUpdate }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const handleChange = (index, value) => {
    const newData = [...data];
    newData[index] = value;
    onUpdate(newData);
  };

  const handleAddPoint = () => {
    const newData = [...data, ""];
    onUpdate(newData);
  };

  const handleRemovePoint = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onUpdate(newData);
  };

  return (
    <div className="mb-10">
      <div className="card-plc functions-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h1 className="text-accn dark:text-drkt text-4xl">I & E Ecosystem</h1>
        <h2 className="text-[30px] iic-eco">Functions of IIC</h2>
        
        {isEditing ? (
          <div className="py-2">
            {data.map((point, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Function point"
                />
                <button
                  onClick={() => handleRemovePoint(i)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  {/* <X size={16} /> */}
                </button>
              </div>
            ))}
            {/* <button
              onClick={handleAddPoint}
              className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Plus size={16} /> Add Point
            </button> */}
          </div>
        ) : (
          <p className="text-justify">
            {data.map((point, i) => (
              <span key={i}>
                <br />• {point}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

function IicEst({ data }) {
  const [items, setItems] = useState([]);
  const [committedItems, setCommittedItems] = useState([]);
  const [pendingItems, setPendingItems] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const copy = deepCopy(data);
      setCommittedItems(copy);
      setItems(deepCopy(copy));
      setPendingItems(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
    }
  }, [data]);

  const getCategory = (data, category) => {
    const item = data.find(item => item.category === category);
    return item ? item.content : [];
  };

  const handleStartEdit = () => {
    if (pendingItems) {
      setItems(deepCopy(pendingItems));
    } else {
      setItems(deepCopy(committedItems));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingItems);
  };

  const handleChange = (category, index, value) => {
    const updatedItems = items.map(item => {
      if (item.category === category) {
        if (Array.isArray(item.content)) {
          const newContent = [...item.content];
          newContent[index] = value;
          return { ...item, content: newContent };
        } else {
          return { ...item, content: value };
        }
      }
      return item;
    });
    
    setItems(updatedItems);
    setIsDirty(true);
  };

  const handleAddPoint = (category) => {
    const updatedItems = items.map(item => {
      if (item.category === category) {
        const newContent = Array.isArray(item.content) ? [...item.content, ""] : [""];
        return { ...item, content: newContent };
      }
      return item;
    });
    
    setItems(updatedItems);
    setIsDirty(true);
  };

  const handleRemovePoint = (category, index) => {
    const updatedItems = items.map(item => {
      if (item.category === category && Array.isArray(item.content)) {
        const newContent = item.content.filter((_, i) => i !== index);
        return { ...item, content: newContent };
      }
      return item;
    });
    
    setItems(updatedItems);
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (pendingItems) {
      setItems(deepCopy(pendingItems));
      toast.info("Cancelled edits. Draft preserved!");
    } else {
      setItems(deepCopy(committedItems));
      toast.info("Cancelled. Reverted to original data!");
    }

    setIsEditing(false);
    setIsDirty(false);
    setIsSaved(!!pendingItems);
  };

  const handleSave = () => {
    // Check for empty fields
    const invalidItem = items.find(item => {
      if (Array.isArray(item.content)) {
        return item.content.some(point => !point.trim());
      } else {
        return !item.content.trim();
      }
    });

    if (invalidItem) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    const pending = deepCopy(items);
    setPendingItems(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    toast.success("Changes saved as draft!");
  };

  const handleDiscard = () => {
    setItems(deepCopy(committedItems));
    setPendingItems(null);
    setIsSaved(false);
    setIsDirty(false);
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    if (!pendingItems) return;
    
    setCommittedItems(deepCopy(pendingItems));
    setItems(deepCopy(pendingItems));
    setPendingItems(null);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

  const revertChange = (category) => {
    if (!pendingItems) return;

    const committedItem = committedItems.find(item => item.category === category);
    const updated = pendingItems.map(item => 
      item.category === category ? deepCopy(committedItem) : item
    );

    setPendingItems(updated);
    setItems(deepCopy(updated));
  };

  const getChanges = () => {
    if (!pendingItems) return [];
    const changes = [];

    const committedMap = new Map(committedItems.map(item => [item.category, item]));
    const pendingMap = new Map(pendingItems.map(item => [item.category, item]));

    // Check for edited items
    committedMap.forEach((oldItem, category) => {
      if (pendingMap.has(category)) {
        const newItem = pendingMap.get(category);
        const oldContent = Array.isArray(oldItem.content) ? oldItem.content.join(', ') : oldItem.content;
        const newContent = Array.isArray(newItem.content) ? newItem.content.join(', ') : newItem.content;
        
        if (oldContent !== newContent) {
          changes.push({
            action: "Edited",
            section: category.charAt(0).toUpperCase() + category.slice(1),
            changes: `Updated content`,
            category: category
          });
        }
      }
    });

    return changes;
  };

  const changes = getChanges();

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // get content dynamically by category
  const majorFocus = getCategory(items, "majorfocus");
  const vision = getCategory(items, "vision");
  const mission = getCategory(items, "mission");
  const functions = getCategory(items, "function");

  return (
    <div className="about-section">
      <ToastContainer position="bottom-right" autoClose={2000} />
      
      {/* Header */}
      <div className="relative mb-4 flex justify-between items-center">
        <h1 className="text-brwn dark:text-drkt text-4xl font-bold">
          Establishment of IIC
        </h1>
        
        {/* Edit button on right - Only show when not editing */}
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

      <div className="naac-info-panel-icc border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">
          Major Focus of IIC
        </h2>
        
        {isEditing ? (
          <div className="py-2">
            {Array.isArray(majorFocus) && majorFocus.map((point, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleChange("majorfocus", i, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Major focus point"
                />
                <button
                  onClick={() => handleRemovePoint("majorfocus", i)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  {/* <X size={16} /> */}
                </button>
              </div>
            ))}
            {/* <button
              onClick={() => handleAddPoint("majorfocus")}
              className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Plus size={16} /> Add Point
            </button> */}
          </div>
        ) : (
          <p className="text-justify">
            {Array.isArray(majorFocus) && majorFocus.map((point, i) => (
              <span key={i}>
                <br />• {point}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Vision */}
        <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
          <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">
            Vision
          </h2>
          {isEditing ? (
            <textarea
              value={Array.isArray(vision) ? vision[0] || "" : vision || ""}
              onChange={(e) => handleChange("vision", 0, e.target.value)}
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Vision statement"
            />
          ) : (
            <p>{Array.isArray(vision) ? vision[0] : vision}</p>
          )}
        </div>

        {/* Mission */}
        <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
          <h2 className="text-[30px] iic-establishment border-b-2 border-secd dark:border-drks pb-1 text-brwn dark:text-drkt">
            Mission
          </h2>
          {isEditing ? (
            <textarea
              value={Array.isArray(mission) ? mission[0] || "" : mission || ""}
              onChange={(e) => handleChange("mission", 0, e.target.value)}
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Mission statement"
            />
          ) : (
            <p>{Array.isArray(mission) ? mission[0] : mission}</p>
          )}
        </div>
      </div>

      {/* I&E Ecosystem */}
      <div>
        <IicEco data={functions} isEditing={isEditing} onUpdate={(newData) => {
          const updatedItems = items.map(item => 
            item.category === "function" ? { ...item, content: newData } : item
          );
          setItems(updatedItems);
          setIsDirty(true);
        }} />
      </div>

      {/* Edit Mode Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
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

      {/* Discard/Request buttons when saved draft exists */}
      {isSaved && !isEditing && (
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
                        <button
                          onClick={() => revertChange(ch.category)}
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
                >
                  Final Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IicEst;