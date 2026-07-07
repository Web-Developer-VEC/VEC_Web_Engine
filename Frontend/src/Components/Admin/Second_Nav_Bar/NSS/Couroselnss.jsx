import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaRegCircleLeft, FaRegCircleRight } from "react-icons/fa6";
import { Pencil, Trash2, Plus, Save, Send, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Couroselnss.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (data) =>
  data.map((item) => ({
    ...item,
    _file: item._file || null
  }));

const CarouselNSS = ({ data }) => {
  const swiperRef = useRef(null);
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

  const { sendRequest, loading } = useAdminRequest();
  
  console.log("Initial data for CarouselNSS:", data);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "/placeholder.jpg"; // fallback
    if (path.startsWith("http") || path.startsWith("blob") || path.startsWith("data:")) {
      return path; // absolute URL or blob/base64
    }
    return `${BASE_URL}${path}`; // relative path
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((item, idx) => ({
        id: idx,
        image_path: item.image_path || "",
        title: item.title || "",
        date: item.date || "",
        selected: false,
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

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      try {
        swiper.navigation.destroy(); // destroy old nav
        swiper.navigation.init();
        swiper.navigation.update();
      } catch (e) {
        // ignore init errors (sometimes Swiper re-init throws harmless errors)
      }
    }
  }, [items, isEditing]);

  const handleStartEdit = () => {
    if (pendingItems) {
      setItems(deepCopy(pendingItems)); // Load draft if exists
    } else {
      setItems(deepCopy(committedItems));
    }
    setIsEditing(true);
    setIsDirty(false);
    setIsSaved(!!pendingItems); // Draft exists
    setSelectedItems([]);
    setSelectAll(false);
  };

  const handleChange = (e, idx, field) => {
    let value = e.target.value;

    // Capitalize first letter of each word for title or date fields
    if (field === "title" || field === "date") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const updated = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    setItems(updated);
    setIsDirty(true);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev.map((item) => ({ ...item })),
      {
        id: Date.now(),
        image_path: "",
        _file: null, // optional File holder for newly uploaded images
        title: "",
        date: "",
        selected: false,
      },
    ]);
    setIsDirty(true);
  };

  const handleItemSelect = (index) => {
    const updatedItems = items.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item));
    setItems(updatedItems);

    const selectedIndices = updatedItems.map((item, i) => (item.selected ? i : -1)).filter((i) => i !== -1);
    setSelectedItems(selectedIndices);
    setSelectAll(selectedIndices.length === updatedItems.length && updatedItems.length > 0);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedItems = items.map((item) => ({ ...item, selected: newSelectAll }));
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
      setItems(deepCopy(pendingItems)); // Revert to draft
      toast.info("Cancelled edits. Draft preserved!");
    } else {
      setItems(deepCopy(committedItems)); // No draft, revert to committed
      toast.info("Cancelled. Reverted to original data!");
    }

    setIsEditing(false);
    setIsDirty(false);
    setSelectedItems([]);
    setSelectAll(false);
    setIsSaved(!!pendingItems); // Maintain draft state
  };

  const handleSave = () => {
    // Check for empty fields
    const invalidItem = items.find((item) => !String(item.image_path || "").trim() || !String(item.title || "").trim() || !String(item.date || "").trim());

    if (invalidItem) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    const pending = items.map((item) => ({
  ...item,
  _file: item._file || null
}));
    setPendingItems(pending); // Save draft
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
    if (!pendingItems) {
      toast.error("No draft to submit. Save changes first.");
      return;
    }

    // Build diffs: inserts, updates, deletes
    const committedMap = new Map(committedItems.map((it) => [it.id, it]));
    const pendingMap = new Map(pendingItems.map((it) => [it.id, it]));

    const payload = [];
    const filesToSend = [];

    // Deleted: in committed but not in pending
    committedItems.forEach((oldItem) => {
      if (!pendingMap.has(oldItem.id)) {
        // Use committed item's meta_data for delete
        payload.push({
          collectionName: "nss",
          collection_type: "events",
          action: "delete",
          title: "delete event",
          category: null,
          meta_data: {
            title: oldItem.title,
            date: oldItem.date,
            image_path: oldItem.image_path,
          },
        });
      }
    });

    // Insert and Update
    pendingItems.forEach((newItem) => {
      const old = committedMap.get(newItem.id);

      // If new item (no old)
      if (!old) {
        // Build image_path: if file was uploaded, use server path (filename). If image_path is an existing relative path, use it.
        let imagePaths = newItem.image_path ? [newItem.image_path] : [];
        if (newItem._file) {
          // create server target path
          const serverPath = `/static/images/nss/event/${newItem._file.name}`;
          imagePaths = [serverPath];
          filesToSend.push(newItem._file);
        } else if (typeof newItem.image_path === "string" && !newItem.image_path.startsWith("data:") && newItem.image_path) {
          imagePaths = [newItem.image_path];
        }

        payload.push({
          collectionName: "nss",
          collection_type: "events",
          action: "insert",
          title: "insert event",
          category: null,
          meta_data: {
            title: newItem.title,
            date: newItem.date,
            image_path: imagePaths.length === 1 ? imagePaths[0] : imagePaths,
          },
        });
      } else {
        // Potential update: compare fields
        const changed =
          (old.image_path !== newItem.image_path) ||
          (old.title !== newItem.title) ||
          (old.date !== newItem.date);

        if (changed) {
          let imagePaths = newItem.image_path ? [newItem.image_path] : [];
          if (newItem._file) {
            const serverPath = `/static/images/nss/event/${newItem._file.name}`;
            imagePaths = [serverPath];
            filesToSend.push(newItem._file);
          } else if (typeof newItem.image_path === "string" && !newItem.image_path.startsWith("data:") && newItem.image_path) {
            imagePaths = [newItem.image_path];
          }

          payload.push({
            collectionName: "nss",
            collection_type: "events",
            action: "update",
            title: "update event",
            category: null,
            meta_data: {
              title: newItem.title,
              date: newItem.date,
              image_path: imagePaths.length === 1 ? imagePaths[0] : imagePaths,
            },
            original_data: {
              title: old.title,
              date: old.date,
              image_path: old.image_path,
            },
          });
        }
      }
    });

    if (payload.length === 0) {
      toast.info("No changes to submit.");
      setShowRequestModal(false);
      return;
    }

    try {
      console.log("Submitting payload:", payload, "Files:", filesToSend);
      const result = await sendRequest(payload, filesToSend);
      if (result) {
        // On success, commit pendingItems as new committedItems
        setCommittedItems(deepCopy(pendingItems));
        setItems(deepCopy(pendingItems));
        setPendingItems(null);
        setIsSaved(false);
        setShowRequestModal(false);
        setIsEditing(false);
        setIsDirty(false);
        toast.success("Final request submitted!");
      } else {
        toast.error("Request failed. Check console for details.");
      }
    } catch (err) {
      console.error("Final request error:", err);
      toast.error("An error occurred while sending request.");
    }
  };

  const revertChange = (itemId) => {
    if (!pendingItems) return;

    const committedItem = committedItems.find((item) => item.id === itemId);
    let updated;

    if (!committedItem) {
      // Item was newly added → remove it
      updated = pendingItems.filter((item) => item.id !== itemId);
    } else if (!pendingItems.find((item) => item.id === itemId)) {
      // Item was deleted → restore it
      updated = [...pendingItems, deepCopy(committedItem)];
    } else {
      // Item was edited → reset to committed version
      updated = pendingItems.map((item) => (item.id === itemId ? deepCopy(committedItem) : item));
    }

    setPendingItems(updated);
    setItems(deepCopy(updated));
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedItems = [...items];
      // Save base64 for preview and keep file object for upload
      updatedItems[index] = { ...updatedItems[index], image_path: event.target.result, _file: file };
      setItems(updatedItems);
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const getChanges = () => {
    if (!pendingItems) return [];
    const changes = [];

    const committedMap = new Map(committedItems.map((item) => [item.id, item]));
    const pendingMap = new Map(pendingItems.map((item) => [item.id, item]));

    // Check for deleted and edited items
    committedMap.forEach((oldItem, id) => {
      if (!pendingMap.has(id)) {
        changes.push({
          action: "Deleted",
          section: "Carousel Items",
          changes: `Item: ${oldItem.title || "Untitled"}`,
          itemId: id,
        });
      } else {
        const newItem = pendingMap.get(id);
        if (oldItem.image_path !== newItem.image_path || oldItem.title !== newItem.title || oldItem.date !== newItem.date) {
          changes.push({
            action: "Edited",
            section: "Carousel Items",
            changes: `Item: ${oldItem.title || "Untitled"}`,
            itemId: id,
          });
        }
      }
    });

    // Check for newly added items
    pendingMap.forEach((newItem, id) => {
      if (!committedMap.has(id)) {
        changes.push({
          action: "Added",
          section: "Carousel Items",
          changes: `Item: ${newItem.title || "New"}`,
          itemId: id,
        });
      }
    });

    return changes;
  };

  const changes = getChanges();

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // if (!data || data.length === 0) {
  //   return (
  //     <div className="text-center text-gray-600 mt-10">
  //       <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
  //         <LoadComp />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="carouselnss-container relative">
        {/* Header */}
        <div className="relative mb-4 flex justify-between items-center">
          {/* Title */}
          <div>
            <h2 className="events-title uppercase text-brwn dark:text-drkt">Events</h2>
            <div className="w-[60px] h-0.5 bg-[#eab308] mb-10 mt-1 rounded"></div>
          </div>

          {/* Edit button on right - Only show when not editing and no saved draft */}
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
                    <th className="border border-black px-4 py-3">Image Path</th>
                    <th className="border border-black px-4 py-3">Title</th>
                    <th className="border border-black px-4 py-3">Date</th>
                    <th className="border border-black px-4 py-3 text-center">
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id || i} className={item.selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                      <td className="border border-black px-4 py-3 text-center">{i + 1}</td>

                      <td className="border border-black px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {/* Show existing or newly uploaded image */}
                          {item.image_path && (
                            <img
                              src={item.image_path.startsWith("data:") ? item.image_path : UrlParser(item.image_path)}
                              alt={item.title || "Event Image"}
                              className="w-24 h-24 object-cover rounded border"
                            />
                          )}
                          <label className="cursor-pointer px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-sm">
                            {item.image_path ? "Replace" : "Upload"}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, i)} />
                          </label>
                        </div>
                      </td>

                      <td className="border border-black px-4 py-3">
                        <input className="w-full p-1 border rounded" value={item.title} onChange={(e) => handleChange(e, i, "title")} placeholder="Title" />
                      </td>
                      <td className="border border-black px-4 py-3">
                        <input className="w-full p-1 border rounded" value={item.date} onChange={(e) => handleChange(e, i, "date")} placeholder="Date" />
                      </td>
                      <td className="border border-black px-4 py-3 text-center">
                        <input type="checkbox" checked={item.selected || false} onChange={() => handleItemSelect(i)} className="h-4 w-4" />
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
                <button className="flex items-center gap-1 px-3 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim" onClick={handleAddItem}>
                  <Plus size={16} /> Add New
                </button>
              </div>

              {/* Delete Selected Button */}
              {selectedItems.length > 0 && (
                <div className="flex justify-center my-2">
                  <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-1 px-3 py-2 bg-red-500 text-prim rounded hover:bg-red-600">
                    <Trash2 size={16} /> Delete Selected ({selectedItems.length})
                  </button>
                </div>
              )}

              {/* Cancel & Save Buttons */}
              <div className="flex justify-end items-center gap-3 mt-4">
                <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
                  Cancel
                </button>

                {isDirty && (
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
                    Save
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          // View Mode - Carousel Display
          <>
            <div className="relative z-[60]">
              <Swiper
                ref={swiperRef}
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={4}
                loop={true}
                navigation={{
                  nextEl: ".custom-next",
                  prevEl: ".custom-prev",
                }}
                breakpoints={{
                  1024: { slidesPerView: 4 },
                  768: { slidesPerView: 3 },
                  600: { slidesPerView: 2 },
                  0: { slidesPerView: 1 },
                }}
              >
                {items.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className="carouselnss-card">
                      <img src={UrlParser(item.image_path)} alt={item.title || "NSS Event"} className="carouselnss-image" />
                      <div className="carouselnss-content">
                        <h3>{item.title}</h3>
                        <p className="carouselnss-location text-brwn dark:text-drka">NSS VEC</p>
                        <span className="carouselnss-date">{item.date}</span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <button className="swiper-button-prev custom-prev">
                <FaRegCircleLeft />
              </button>
              <button className="swiper-button-next custom-next">
                <FaRegCircleRight />
              </button>
            </div>

            {/* Discard/Request buttons when saved draft exists */}
            {isSaved && (
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={handleDiscard} className="px-4 py-2 rounded bg-gray-400 text-prim hover:bg-gray-500">
                  Discard Changes
                </button>
                {changes.length > 0 && (
                  <button onClick={handleRequest} className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim">
                    <Send size={18} /> Request
                  </button>
                )}
              </div>
            )}
          </>
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
                          <button onClick={() => revertChange(ch.itemId)} className="p-1 rounded hover:bg-gray-100" title="Revert this change">
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
                  <button onClick={handleFinalRequestConfirm} className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim" disabled={loading}>
                    {loading ? "Processing..." : "Final Request"}
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
                Are you sure you want to delete {selectedItems.length} selected item{selectedItems.length > 1 ? "s" : ""}?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700">
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

export default CarouselNSS;
