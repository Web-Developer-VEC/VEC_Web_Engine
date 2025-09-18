import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Plus, Trash2, Send, Save, Pencil } from "lucide-react";

const Others = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [others, setOthers] = useState([]);
  const [tempOthers, setTempOthers] = useState([]);
  const [editOthers, setEditOthers] = useState(false);
  const [selected, setSelected] = useState([]);

  // Modal states
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [changes, setChanges] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Format data on load
  useEffect(() => {
    if (!data) {
      setOthers([]);
      setTempOthers([]);
      return;
    }

    const formattedData = data.map((item, index) => ({
      id: index + 1,
      text: item?.title || "No Title",
      image: UrlParser(item?.image_path),
    }));

    setOthers(formattedData);
    setTempOthers(formattedData);
  }, [data]);

  // Carousel auto-slide
  useEffect(() => {
    if (isHovered || others.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % others.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, others]);

  const handlePrev = () => {
    if (others.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + others.length) % others.length);
  };

  const handleNext = () => {
    if (others.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % others.length);
  };

const handleInputChange = (id, field, value) => {
  setTempOthers((prev) =>
    prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
  );

  const originalItem = others.find((o) => o.id === id);
  if (originalItem && originalItem[field] !== value) {
    setChanges((prev) => {
      const existing = prev.find((c) => c.id === id && c.field === field);
      if (existing) {
        return prev.map((c) =>
          c.id === id && c.field === field ? { ...c, newValue: value } : c
        );
      }
      return [
        ...prev,
        { id, action: "Edited", field:`image - ${id}`, oldValue: originalItem[field], newValue: value },
      ];
    });
  } else {
    setChanges((prev) => prev.filter((c) => !(c.id === id && c.field === field)));
  }
};

const handleImageUpload = (id, file) => {
  const imageUrl = URL.createObjectURL(file);
  setTempOthers((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, image: imageUrl, newFile: file } : item
    )
  );

  const originalItem = others.find((o) => o.id === id);
  if (originalItem && originalItem.image !== imageUrl) {
    setChanges((prev) => {
      const existing = prev.find((c) => c.id === id && c.field === "image");
      if (existing) {
        return prev.map((c) =>
          c.id === id && c.field === "image" ? { ...c, newValue: imageUrl } : c
        );
      }
      return [
        ...prev,
        {
          id,
          action: "Edited",
          field: "image",
          oldValue: originalItem.image,
          newValue: imageUrl,
        },
      ];
    });
  }
};

const handleAddRow = () => {
  const newId = tempOthers.length
    ? Math.max(...tempOthers.map((a) => a.id)) + 1
    : 1;
  const newRow = { id: newId, text: "", image: "", newFile: null };
  setTempOthers((prev) => [...prev, newRow]);

  setChanges((prev) => [
    ...prev,
    { id: newId, action: "Added", field: `image - ${newId}`, oldValue: null, newValue: newRow },
  ]);
};

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

const handleDeleteSelected = () => {
  const deletedItems = tempOthers.filter((item) => selected.includes(item.id));
  setTempOthers((prev) => prev.filter((item) => !selected.includes(item.id)));

  deletedItems.forEach((item) => {
    setChanges((prev) => [
      ...prev,
      { id: item.id, action: "Deleted", field: `image - ${item.id}`, oldValue: item, newValue: null },
    ]);
  });

  setSelected([]);
  setShowDeleteModal(false);
};
const handleRevertChange = (index) => {
  const change = changes[index];

  if (change.action === "Edited") {
    setTempOthers((prev) =>
      prev.map((item) =>
        item.id === change.id ? { ...item, [change.field]: change.oldValue } : item
      )
    );
  }

  if (change.action === "Added") {
    setTempOthers((prev) => prev.filter((item) => item.id !== change.id));
  }

  if (change.action === "Deleted") {
    setTempOthers((prev) => [...prev, change.oldValue]);
  }

  setChanges((prev) => prev.filter((_, i) => i !== index));
};

  const handleSave = () => {
    const invalid = tempOthers.some(
      (item) => !item.text.trim() || !item.image
    );
    if (invalid) {
      alert("All fields (Description and Image) are mandatory!");
      return;
    }
    setOthers(tempOthers);
    setEditOthers(false);
    setShowRequestButtons(true);
  };

  const handleCancel = () => {
    setTempOthers(others);
    setEditOthers(false);
  };

  const handleDiscardChanges = () => {
    const formattedData = data?.map((item, index) => ({
      id: index + 1,
      text: item?.title || "No Title",
      image: UrlParser(item?.image_path),
    })) || [];

    setOthers(formattedData);
    setTempOthers(formattedData);
    setSelected([]);
    setEditOthers(false);
    setShowRequestButtons(false);
    setShowDiscardModal(false);
    setCurrentPage(1);
    setActiveIndex(0);
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempOthers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempOthers.length / rowsPerPage);
  const [formData, setFormData] = useState({});
  const [originalData] = useState({ title: "Old Title", image: "old.png" });

  const handleRequestConfirm = () => {
    alert("Request submitted!");
    setShowRequestModal(false);
  };

  // ---- Inline Modal Component ----
  const Modal = ({ title, children, onClose, actions, width = "500px" }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div
        className="bg-white dark:bg-drkp p-6 rounded-xl max-h-[80vh] overflow-y-auto shadow-lg"
        style={{ width }}
      >
        {title && (
          <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
            {title}
          </h2>
        )}
        <div>{children}</div>
        {actions && <div className="flex justify-end gap-2 mt-4">{actions}</div>}
      </div>
    </div>
  );

  return (
    <>
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editOthers &&  (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() =>{ setEditOthers(true);
             setShowRequestButtons(true);
            }
          }
          >
            <Pencil size={16}/>
            Edit
          </button>
        )}
      </div>

      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-accn dark:text-drkt text-3xl font-bold mb-4">
            Other Achievements
          </h2>

          {/* Carousel */}
          {!editOthers &&
            (others.length > 0 ? (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {others.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                        style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                      >
                        <img
                          src={item.image}
                          alt="Achievement"
                          className="w-full h-80 object-contain rounded-t-lg"
                        />
                        <div className="p-4 text-center rounded-b-lg">
                          <p className="text-lg font-semibold text-text dark:text-drkt">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prev / Next */}
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

                {/* Dots */}
                <div className="flex justify-center space-x-2 mt-4">
                  {others.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                      } transition-all`}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No achievements available
              </p>
            ))}

          {/* Edit Mode */}
          {editOthers && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2">Description</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) =>
                            handleInputChange(item.id, "text", e.target.value)
                          }
                          className="border p-1 w-full rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
                          <span>{item.image ? "Replace" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(item.id, e.target.files[0])
                            }
                          />
                        </label>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {tempOthers.length > rowsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center items-center mt-4 gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  <Plus size={16} /> Add New
                </button>
                {selected.length > 0 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Request Buttons */}
          {showRequestButtons && !editOthers && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => {
                  handleDiscardChanges(true);
                }}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={16} /> Request 
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          width="400px"
          onClose={() => setShowDeleteModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </>
          }
        >
          <p>Are you sure you want to delete the selected items?</p>
        </Modal>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <Modal
          title="Request"
          width="750px"
          onClose={() => setShowRequestModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black font-medium"
              >
                Final Request
              </button>
            </>
          }
        >
          <p className="text-sm text-red-600 mb-4">
            Note: Your changes will stay pending until approved by the superior admin.  
            Once approved, they will be applied automatically to the live site.
          </p>

          <table className="w-full text-sm text-text dark:text-drkt border">
            <thead className="bg-gray-100 dark:bg-gray-800 text-center">
              <tr>
                <th className="py-2 border">Action</th>
                <th className="py-2 border">Section</th>
                <th className="py-2 border">Changes</th>
                <th className="py-2 border">undo</th>
              </tr>
            </thead>
           <tbody>
              {changes.map((change, index) => (
                <tr key={index} className="border text-center">
                  <td
                    className={`py-2 border font-semibold
                      ${change.action === "Added" ? "text-green-600" : ""}
                      ${change.action === "Edited" ? "text-blue-600" : ""}
                      ${change.action === "Deleted" ? "text-red-600" : ""}`}
                  >
                    {change.action}
                  </td>
                  <td className="py-2 border">Other Achievements</td>
                  <td className="py-2 border">
                    <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                      {change.field}
                    </span>
                  </td>
                  <td className="py-2 border">
                    <button
                      onClick={() => handleRevertChange(index)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

    </>
  );
};

export default Others;
