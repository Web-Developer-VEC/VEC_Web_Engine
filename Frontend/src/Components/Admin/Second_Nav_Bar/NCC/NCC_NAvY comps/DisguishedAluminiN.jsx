import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadComp from "../../../LoadComp";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle } from "lucide-react";
import { FaUpload } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";

const deepCopy = (v) => structuredClone(v);

const AlumniSlider1 = ({ data }) => {
  const [items, setItems] = useState([]);
  const [committedItems, setCommittedItems] = useState([]);
  const [pendingItems, setPendingItems] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http") || path.startsWith("blob") || path.startsWith("data:")) {
      return path;
    }
    return `${BASE_URL}${path}`;
  };

  // Initialize data
  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((item, idx) => ({
        id: idx,
        image_path: item.image_path || "",
        description: item.description || "",
        selected: false
      }));
      
      const copy = deepCopy(formattedData);
      setCommittedItems(copy);
      setItems(deepCopy(copy));
      setPendingItems(null);
      setIsEditing(false);
      setIsDirty(false);
      setIsSaved(false);
      setSelectedItems([]);
      setSelectAll(false);
    }
  }, [data]);

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered || items.length === 0 || isEditing) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, items, isEditing]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
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
    setSelectedItems([]);
    setSelectAll(false);
  };

  const handleChange = (e, idx, field) => {
    let value = e.target.value;

    // Capitalize first letter of each word for description field
    if (field === "description") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setItems(updated);
    setIsDirty(true);
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev.map((item) => ({ ...item })), { 
      id: Date.now(), 
      image_path: "",
      description: "",
      selected: false
    }]);
    setIsDirty(true);
  };

  const handleItemSelect = (index) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    );
    
    setItems(updatedItems);
    
    const selectedIndices = updatedItems
      .map((item, i) => item.selected ? i : -1)
      .filter(i => i !== -1);
    
    setSelectedItems(selectedIndices);
    setSelectAll(selectedIndices.length === updatedItems.length && updatedItems.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const updatedItems = items.map(item => ({ ...item, selected: newSelectAll }));
    setItems(updatedItems);
    
    setSelectedItems(newSelectAll ? items.map((_, i) => i) : []);
  };

  const confirmDelete = () => {
    const updated = items.filter((_, i) => !selectedItems.includes(i)).map((item) => ({ ...item }));
    setItems(updated);
    setSelectedItems([]);
    setSelectAll(false);
    setShowDeleteModal(false);
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
    setSelectedItems([]);
    setSelectAll(false);
    setIsSaved(!!pendingItems);
  };

  const handleSave = () => {
    // Check for empty fields
    const invalidItem = items.find(item => 
      !item.image_path?.trim() || 
      !item.description?.trim()
    );

    if (invalidItem) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    const pending = deepCopy(items);
    setPendingItems(pending);
    setIsSaved(true);
    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    toast.success("Changes saved as draft!");
  };

  const handleDiscard = () => {
    setItems(deepCopy(committedItems));
    setPendingItems(null);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    toast.info("Changes discarded!");
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

const handleImageUpload = (e, index) => {
  const file = e.target.files[0];
  if (!file) return;

  const previewUrl = URL.createObjectURL(file);

  setItems(prev =>
    prev.map((item, i) =>
      i === index
        ? {
            ...item,
            _file: file, // actual file for uploading
            image_path: `/static/images/ncc/navy/${file.name}`, // final path saved in DB
            preview_url: previewUrl, // temporary preview in UI
          }
        : item
    )
  );

  setIsDirty(true);
};


  
const handleFinalRequestConfirm = async () => {
  if (!pendingItems) return;

  const payload = [];

  const committedMap = new Map(committedItems.map(i => [i.id, i]));
  const pendingMap = new Map(pendingItems.map(i => [i.id, i]));

  // -------- DELETED ITEMS ----------
  committedMap.forEach((oldItem, id) => {
    if (!pendingMap.has(id)) {
      payload.push({
        collectionName: "ncc_navy",
        collection_type: "awards",
        action: "delete",
        title: "delete awards",
        meta_data: {
          image_path: oldItem.image_path,
          title: oldItem.title,
          description: oldItem.description,
        },
      });
    }
  });

  // -------- INSERT & UPDATE ----------
  pendingMap.forEach((item, id) => {
    const oldItem = committedMap.get(id);

    const imagePath =
      item._file
        ? `/static/images/ncc/navy/${item._file.name}`
        : item.image_path;

    const metaData = {
      image_path: imagePath,
      title: item.title,
      description: item.description,
    };

    // INSERT
    if (!oldItem) {
      payload.push({
        collectionName: "ncc_navy",
        collection_type: "awards",
        action: "insert",
        title: "Add awards",
        meta_data: metaData,
      });
    }

    // UPDATE
    else if (
      oldItem.title !== item.title ||
      oldItem.description !== item.description ||
      oldItem.image_path !== imagePath
    ) {
      payload.push({
        collectionName: "ncc_navy",
        collection_type: "awards",
        action: "update",
        title: "update awards",
        original_data: {
          image_path: oldItem.image_path,
          title: oldItem.title,
          description: oldItem.description,
        },
        meta_data: metaData,
      });
    }
  });

  if (payload.length === 0) {
    toast.info("No changes to submit");
    return;
  }

  // Collect all uploaded files
  const files = pendingItems
    .filter(i => i._file)
    .map(i => i._file);
console.log("files",files);

  const result = await sendRequest(payload, files);

  if (result) {
    setCommittedItems(deepCopy(pendingItems));
    setItems(deepCopy(pendingItems));
    setPendingItems(null);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Request submitted successfully!");
  }
};



  const revertChange = (itemId) => {
    if (!pendingItems) return;

    const committedItem = committedItems.find(item => item.id === itemId);
    let updated;

    if (!committedItem) {
      updated = pendingItems.filter(item => item.id !== itemId);
    } else if (!pendingItems.find(item => item.id === itemId)) {
      updated = [...pendingItems, deepCopy(committedItem)];
    } else {
      updated = pendingItems.map(item => item.id === itemId ? deepCopy(committedItem) : item);
    }

    setPendingItems(updated);
    setItems(deepCopy(updated));
  };




  const getChanges = () => {
    if (!pendingItems) return [];
    const changes = [];

    const committedMap = new Map(committedItems.map(item => [item.id, item]));
    const pendingMap = new Map(pendingItems.map(item => [item.id, item]));

    // Check for deleted and edited items
    committedMap.forEach((oldItem, id) => {
      if (!pendingMap.has(id)) {
        changes.push({
          action: "Deleted",
          section: "Award Items",
          changes: `Item: ${oldItem.description || "Untitled"}`,
          itemId: id
        });
      } else {
        const newItem = pendingMap.get(id);
        if (
          oldItem.image_path !== newItem.image_path ||
          oldItem.description !== newItem.description
        ) {
          changes.push({
            action: "Edited",
            section: "Award Items",
            changes: `Item: ${oldItem.description || "Untitled"}`,
            itemId: id
          });
        }
      }
    });

    // Check for newly added items
    pendingMap.forEach((newItem, id) => {
      if (!committedMap.has(id)) {
        changes.push({
          action: "Added",
          section: "Award Items",
          changes: `Item: ${newItem.description || "New"}`,
          itemId: id
        });
      }
    });

    return changes;
  };

  const changes = getChanges();

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full max-w-4xl mx-auto mt-5">
        <ToastContainer position="bottom-right" autoClose={2000} />
        
        {/* Header */}
        <div className="relative mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brwn dark:text-drkt">Awards & Achievements</h2>
          
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

        {/* Content */}
        {isEditing ? (
          // Edit Mode - Table View
          <>
            <div className="overflow-x-auto border border-black rounded-md mb-4">
              <table className="min-w-full table-auto border border-black text-[16px]">
                <thead>
                  <tr className="bg-gry">
                    <th className="border border-black px-4 py-3">S.No.</th>
                    <th className="border border-black px-4 py-3">Image</th>
                    <th className="border border-black px-4 py-3">Description</th>
                    <th className="border border-black px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id || i} className={item.selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                      <td className="border border-black px-4 py-3 text-center">{i + 1}</td>
                      <td className="border border-black px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {item.image_path && (
                            <img
                                src={
                                item.preview_url
                                  ? item.preview_url
                                  : item.image_path
                                  ? UrlParser(item.image_path)
                                  : "/placeholder.jpg"
                              }
                              alt={item.description || "Award Image"}
                              className="w-24 h-24 object-contain rounded border"
                            />
                          )}
                          <label className="cursor-pointer px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-sm">
                            {item.image_path ? "Replace" : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, i)}
                            />
                          </label>
                        </div>
                      </td>
                      <td className="border border-black px-4 py-3">
                        <textarea
                          className="w-full p-1 border rounded"
                          value={item.description}
                          onChange={(e) => handleChange(e, i, "description")}
                          placeholder="Description"
                          rows={3}
                        />
                      </td>
                      <td className="border border-black px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() => handleItemSelect(i)}
                          className="h-4 w-4"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Buttons outside the table container */}
            <div className="mt-4">
              {/* Add Row Button */}
              <div className="flex justify-start mb-3">
                <button 
                  className="flex items-center gap-1 px-3 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim" 
                  onClick={handleAddItem}
                >
                  <Plus size={16} /> Add New
                </button>
              </div>
              
              {/* Delete Selected Button */}
              {selectedItems.length > 0 && (
                <div className="flex justify-center my-2">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-prim rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} /> Delete Selected ({selectedItems.length})
                  </button>
                </div>
              )}
              
              {/* Cancel & Save Buttons */}
              <div className="flex justify-end items-center gap-3 mt-4 pb-5">
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
            </div>
          </>
        ) : (
          // View Mode - Slider Display
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                    style={{
                      opacity: activeIndex === index ? 1 : 0.5,
                      transition: "opacity 0.5s ease-in-out",
                    }}
                  >
                    <img
                                                    src={
                                item.preview_url
                                  ? item.preview_url
                                  : item.image_path
                                  ? UrlParser(item.image_path)
                                  : "/placeholder.jpg"
                              }
                      alt={`Award ${index + 1}`}
                      className="w-full h-80 object-contain rounded-t-lg"
                    />
                    <div className="p-4 text-center rounded-b-lg">
                      <p className="text-lg font-semibold text-text dark:text-drkt">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prev and Next buttons */}
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
              >
                &#10094;
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
              >
                &#10095;
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-4 mb-4">
              {items.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                  } transition-all`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>

            {/* Discard/Request buttons when saved draft exists */}
            {isSaved && (
              <div className="flex justify-end gap-3 mt-6 pb-5">
                <button 
                  onClick={handleDiscard} 
                  className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500"
                >
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
                  >
                    Final Request
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
            <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedItems.length} selected item{selectedItems.length > 1 ? 's' : ''}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AlumniSlider1;