import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Plus, Trash2, Send, Save, Pencil, X } from "lucide-react";

// Simple reusable Modal component
const Modal = ({ title, children, onClose, actions, width = "500px" }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6`} style={{ width }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">{title}</h2>
        <button onClick={onClose} className="text-red-500 font-bold text-lg">×</button>
      </div>
      <div className="mb-4">{children}</div>
      <div className="flex justify-end gap-2">{actions}</div>
    </div>
  </div>
);

const Achievements = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [tempAchievements, setTempAchievements] = useState([]);
  const [editAchievements, setEditAchievements] = useState(false);
  const [selected, setSelected] = useState([]);
  const [changes, setChanges] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempAchievements.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempAchievements.length / rowsPerPage);

  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  useEffect(() => {
    if (!data) {
      setAchievements([]);
      setTempAchievements([]);
      return;
    }
    const formattedData = data.map((item, index) => ({
      id: index + 1,
      text: item?.title || "No Title",
      image: UrlParser(item?.image_path),
    }));
    setAchievements(formattedData);
    setTempAchievements(formattedData);
  }, [data]);

  useEffect(() => {
    if (isHovered || achievements.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () => setActiveIndex((prevIndex) => (prevIndex - 1 + achievements.length) % achievements.length);
  const handleNext = () => setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);

  const handleInputChange = (id, field, value) => {
    setTempAchievements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    const originalItem = achievements.find(a => a.id === id);
    if (originalItem && originalItem[field] !== value) {
      setChanges((prev) => {
        const existing = prev.find(c => c.id === id && c.field === field);
        if (existing) return prev.map(c => c.id === id && c.field === field ? { ...c, newValue: value } : c);
        return [...prev, { id, field, oldValue: originalItem[field], newValue: value }];
      });
    } else {
      setChanges((prev) => prev.filter(c => !(c.id === id && c.field === field)));
    }
  };

  const handleImageUpload = (id, file) => {
    const imageUrl = URL.createObjectURL(file);
    setTempAchievements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, image: imageUrl, newFile: file } : item))
    );
    const originalItem = achievements.find(a => a.id === id);
    if (originalItem && originalItem.image !== imageUrl) {
      setChanges((prev) => {
        const existing = prev.find(c => c.id === id && c.field === "image");
        if (existing) return prev.map(c => c.id === id && c.field === "image" ? { ...c, newValue: imageUrl } : c);
        return [...prev, { id,  action:"Edited",field: "image", oldValue: originalItem.image, newValue: imageUrl }];
      });
    }
  };

  const handleAddRow = () => {
    const newId = tempAchievements.length ? Math.max(...tempAchievements.map(a => a.id)) + 1 : 1;
    const newRow = { id: newId, text: "", image: "", newFile: null };
    setTempAchievements((prev) => [...prev, newRow]);
    setChanges((prev) => [...prev, { id: newId, action:"Added", field: `Image - ${newId}`, oldValue: null, newValue: newRow }]);
  };

  const toggleSelect = id => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleDeleteSelected = () => {
    setTempAchievements(prev => prev.filter(item => !selected.includes(item.id)));
    selected.forEach(id => {
      setChanges(prev => [...prev, { id,action:"delete", field: `Image - ${id}`, oldValue: achievements.find(a => a.id === id), newValue: null }]);
    });
    setSelected([]);
    setShowDeleteModal(false);
  };

  const handleSave = () => {
    const invalid = tempAchievements.some(item => !item.text.trim() || !item.image);
    if (invalid) { alert("All fields (Description and Image) are mandatory!"); return; }
    setAchievements(tempAchievements);
    setEditAchievements(false);
    setShowRequestButtons(true);
  };

  const handleCancel = () => {
    setTempAchievements(achievements);
    setEditAchievements(false);
  };

  const confirmDiscard = () => {
    setShowDiscardModal(false);
    setShowRequestButtons(false);
    setChanges([]);
  };

  const handleRequestConfirm = () => {
    console.log("Request submitted:", changes);
    setShowRequestButtons(false);
    setChanges([]);
    setShowRequestModal(false);
  };

  return (
    <>
      {/* Edit Button */}
      <div className="flex justify-end mb-2">
        {!editAchievements && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {setEditAchievements(true);
              setShowRequestButtons(true);
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-3xl font-bold mb-4 text-black dark:text-white">
            Achievements
          </h2>

          {/* Carousel View */}
          {!editAchievements && achievements.length > 0 && (
            <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {achievements.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                      style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                    >
                      <img src={item.image} alt="Achievement" className="w-full h-80 object-contain rounded-t-lg" />
                      <div className="p-4 text-center rounded-b-lg">
                        <p className="text-lg font-semibold text-black dark:text-white">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prev / Next Buttons */}
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
                {achievements.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? "bg-blue-500" : "bg-gray-300"} transition-all`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {editAchievements && (
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
                          onChange={(e) => handleInputChange(item.id, "text", e.target.value)}
                          className="border p-1 w-full rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        {item.image && <img src={item.image} alt="preview" className="w-20 h-20 object-cover rounded" />}
                        <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
                          <span>{item.image ? "Replace" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
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
              {tempAchievements.length > rowsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
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
          {showRequestButtons && !editAchievements && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => {confirmDiscard();}}
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
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClose={() => setShowDeleteModal(false)}
          actions={
            <>
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-400 text-white">Cancel</button>
              <button onClick={handleDeleteSelected()} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete the selected items?
          </p>
        </Modal>
      )}
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

          <table className="w-full text-sm text-black dark:text-white border">
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
                    <span className="px-2 py-1 bg- text-black rounded-md">
                      {change.field}
                    </span>
                  </td>
                  <td className="py-2 border">
                    <button
                          // onClick={() => handleRevertChange(i)}
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
        </Modal>
      )}

    </>
  );
};

export default Achievements;
