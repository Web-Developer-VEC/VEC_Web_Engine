import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Save, Send, X, PlusCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import "./YrcNotificationBox.css";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const NotificationBox1 = ({ data }) => {
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
  const { sendRequest, loading, error } = useAdminRequest();

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((item, idx) => ({
        id: idx,
        content: typeof item === "string" ? item : JSON.stringify(item),
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

const handleStartEdit = () => {
  if (pendingItems) {
    setItems(deepCopy(pendingItems));   // load saved draft
    setIsSaved(true);
  } else {
    setItems(deepCopy(committedItems)); // load original committed items
    setIsSaved(false);
  }

  setIsEditing(true);
  setIsDirty(false);
  setSelectedItems([]);
  setSelectAll(false);
};


  const handleChange = (e, idx) => {
    const value = e.target.value;
    const updated = items.map((item, i) => (i === idx ? { ...item, content: value } : item));
    setItems(updated);
    setIsDirty(true);
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev.map((item) => ({ ...item })), { 
      id: Date.now(), 
      content: "",
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
    const invalidItem = items.find(item => !item.content?.trim());

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

const handleFinalRequestConfirm = async () => {
  if (!pendingItems) return;

  // ✅ Convert items → string array (WHAT BACKEND EXPECTS)
  const originalData = committedItems.map(item => item.content);
  const updatedData = pendingItems.map(item => item.content);

  const payload = [
    {
      collectionName: "yrc",
      collection_type: "news_updates",
      action: "update",
      title: "update news",
      original_data: originalData,
      meta_data: updatedData,
    },
  ];

  try {
    const result = await sendRequest(payload);

    if (result) {
      setCommittedItems(deepCopy(pendingItems));
      setItems(deepCopy(pendingItems));
      setPendingItems(null);
      setIsSaved(false);
      setShowRequestModal(false);

      toast.success("Final request submitted successfully!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit request!");
  }
};

  const revertChange = (itemId) => {
    if (!pendingItems) return;

    const committedItem = committedItems.find(item => item.id === itemId);
    let updated;

    if (!committedItem) {
      // Item was newly added → remove it
      updated = pendingItems.filter(item => item.id !== itemId);
    } else if (!pendingItems.find(item => item.id === itemId)) {
      // Item was deleted → restore it
      updated = [...pendingItems, deepCopy(committedItem)];
    } else {
      // Item was edited → reset to committed version
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
          section: "Notification Items",
          changes: `Item: ${oldItem.content.substring(0, 50)}...`,
          itemId: id
        });
      } else {
        const newItem = pendingMap.get(id);
        if (oldItem.content !== newItem.content) {
          changes.push({
            action: "Edited",
            section: "Notification Items",
            changes: `Item: ${oldItem.content.substring(0, 50)}...`,
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
          section: "Notification Items",
          changes: `Item: ${newItem.content.substring(0, 50) || "New"}...`,
          itemId: id
        });
      }
    });

    return changes;
  };

  const changes = getChanges();

  if (!data || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

return (
    <>
      <div className="yrc-notification-container relative">
        {/* Header */}
        {/* Edit Button Div */}
        {!isEditing && (
          <div className="relative w-full mr-6">
            <div className="absolute right-0 top-0">
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
              >
                <Pencil size={18} />
                Edit
              </button>
            </div>
          </div>
        )}
        
        {/* Title Div */}
        <div className="yrc-news-updates text-sm md:text-[16px] ml-auto md:ml-0 text-brwn dark:text-drkt border-b-2 border-[#eab308] pb-1">
          Bringing you the latest news & updates
        </div>
        
        {/* Content */}
{isEditing ? (
  // ✅ Edit Mode
  <>
    <div className="yrc-notification-box dark:bg-drkb mt-2">
      <div className="yrc-notification-header flex justify-between items-center">
        <span>Recent Updates</span>
      </div>
<div>      <div className="overflow-x-auto mt-2">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-yellow-400 text-brown-900">
              <th className="border px-2 py-1">SL No</th>
              <th className="border px-2 py-1">News Item</th>
              <th className="border px-2 py-1 text-center">
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
            {items.map((item, index) => (
              <tr
                key={item.id || index}
                className={item.selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              >
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1">
                  <textarea
                    className="w-full p-1 border rounded"
                    value={item.content}
                    onChange={(e) => handleChange(e, index)}
                    rows={3}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={item.selected || false}
                    onChange={() => handleItemSelect(index)}
                    className="h-4 w-4"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Add + Delete inside table bottom center */}
      <div className="table-actions-container flex justify-center gap-3 mt-4">
        <button
          onClick={handleAddItem}
          className="px-3 py-1 flex items-center gap-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim text-sm mb-3"
        >
          <PlusCircle size={16} /> Add New
        </button>

        {selectedItems.length > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1 flex items-center gap-1 bg-red-500 text-prim rounded hover:bg-red-600 text-sm mb-3"
          >
            <Trash2 size={16} /> Delete Selected ({selectedItems.length})
          </button>
        )}
      </div>

      </div>

    </div>

<div className="relative w-full">
  {/* Table content here */}
  <div className="absolute bottom-2 right-2 flex items-center gap-2">
    <button
      onClick={handleCancel}
      className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500 text-sm"
    >
      Cancel
    </button>

    {isDirty && (
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim text-sm"
      >
        Save
      </button>
    )}
  </div>
</div>

        

    
  </>
) : (
  // ✅ View Mode
  // <div className="yrc-notification-box dark:bg-drkb">
  //   <div className="yrc-notification-header flex justify-between items-center">
  //     <span>Recent Updates</span>
  //   </div>

  //   <div className="yrc-scrolling-news">
  //     <div className="yrc-scrolling-inner">
  //       {items.map((item, index) => (
  //         <p
  //           key={index}
  //           className="news-item text-sm md:text-base text-justify lg:text-base dark:text-drkt mb-2"
  //         >
  //           <li>{item.content}</li>
  //         </p>
  //       ))}
  //     </div>
  //   </div>
  // </div>

    <div className="yrc-notification-box dark:bg-drkb">
    <div className="yrc-notification-header flex justify-between items-center">
      <span>Recent Updates</span>
    </div>

    <div className="yrc-scrolling-news">
      <div className="yrc-scrolling-inner">
        {items.map((item, index) => (
          <p
            key={index}
            className="news-item text-sm md:text-base text-justify lg:text-base dark:text-drkt mb-2"
          >
            <li>{item.content}</li>
          </p>
        ))}
      </div>
    </div>
  </div>

)}

{!isEditing && isSaved && (
  <div className="w-full mt-4">
    {/* Footer for saved changes */}
    <div className="flex justify-end items-center gap-2">
      <button
        onClick={handleDiscard}
        className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500 text-sm"
      >
        Discard Changes
      </button>

      {getChanges().length > 0 && (
        <button
          onClick={handleRequest}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim text-sm"
        >
          <Send size={18} /> Request
        </button>
      )}
    </div>
  </div>
)}



        

        {/* Final Request Modal */}
        {showRequestModal &&
         (
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

        <ToastContainer position="bottom-right" autoClose={2000} />
      </div>
    </>
  );
};

export default NotificationBox1;