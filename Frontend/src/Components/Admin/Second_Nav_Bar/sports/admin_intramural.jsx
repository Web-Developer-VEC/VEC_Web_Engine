import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import "./admin_SportsInfra.css";
import { Pencil, Trash2, Plus, Send, Save } from "lucide-react";

const Intramural = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [editintra, setEditintra] = useState(false);
  const [selected, setSelected] = useState([]);
  const [tempAchievements, setTempAchievements] = useState([]);

  // New states
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changes, setChanges] = useState([]); // ✅ track changes

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Initialize data
  useEffect(() => {
    if (!data) {
      setAchievements([]);
      return;
    }

    const formattedData = data?.map((image, index) => ({
      id: index + 1,
      text: image?.title || "No Title",
      image: UrlParser(image?.image_path),
    }));

    setAchievements(formattedData);
    setTempAchievements(formattedData);
  }, [data]);

  // Carousel auto-play
  useEffect(() => {
    if (isHovered || achievements.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, achievements]);

  const handlePrev = () => {
    if (achievements.length === 0) return;
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + achievements.length) % achievements.length
    );
  };

  const handleNext = () => {
    if (achievements.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % achievements.length);
  };

  // ---- Edit Mode Handlers ----
  const handleInputChange = (id, field, value) => {
    setTempAchievements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleImageUpload = (id, file) => {
    const imageUrl = URL.createObjectURL(file);
    setTempAchievements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, image: imageUrl, newFile: file } : item
      )
    );
  };

  const handleAddRow = () => {
    const newId = tempAchievements.length
      ? Math.max(...tempAchievements.map((a) => a.id)) + 1
      : 1;
    const newRow = { id: newId, text: "", image: "", newFile: null };
    setTempAchievements((prev) => [...prev, newRow]);

    setChanges((prev) => [
      ...prev,
      { action: "Added", section: "Intramural Achievements", field:`image - ${newId}` },
    ]);
  };

  const handleDeleteSelected = () => {
    const deletedItems = tempAchievements.filter((item) =>
      selected.includes(item.id)
    );
    setTempAchievements((prev) =>
      prev.filter((item) => !selected.includes(item.id))
    );
    setSelected([]);

    deletedItems.forEach((item) => {
      setChanges((prev) => [
        ...prev,
        { action: "Deleted", section: "Intramural Achievements", field: `image - ${item.id}` },
      ]);
    });

    setShowDeleteModal(false);
  };

  const handleSave = () => {
    const invalid = tempAchievements.some(
      (item) => !item.text.trim() || !item.image
    );

    if (invalid) {
      alert("All fields (Description and Image) are mandatory!");
      return;
    }

    // Detect updates
    const updatedChanges = [];
    tempAchievements.forEach((item) => {
      const original = achievements.find((a) => a.id === item.id);
      if (original && (original.text !== item.text || original.image !== item.image)) {
        updatedChanges.push({
          action: "Edited",
          section: "Intramural Achievements",
          field:`image - ${item.id}`,
        });
      }
    });

    setChanges((prev) => [...prev, ...updatedChanges]);
    setAchievements(tempAchievements);
    setEditintra(false);
    setShowRequestButtons(true);
  };

  const handleCancel = () => {
    setTempAchievements(achievements);
    setEditintra(false);
  };

  const confirmDiscard = () => {
    const formattedData = data?.map((image, index) => ({
      id: index + 1,
      text: image?.title || "No Title",
      image: UrlParser(image?.image_path),
    }));

    setAchievements(formattedData);
    setTempAchievements(formattedData);
    setSelected([]);
    setCurrentPage(1);
    setShowRequestButtons(false);
    setEditintra(false);
    setChanges([]);
    setShowDiscardModal(false);
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempAchievements.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempAchievements.length / rowsPerPage);

  return (
    <>
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editintra && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => {setEditintra(true);
              setShowRequestButtons(true);
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-accn dark:text-drkt text-3xl font-bold mb-4">
            Intramural Achievements {data?.year}
          </h2>

          {/* ---- Carousel View ---- */}
          {!editintra &&
            (achievements.length > 0 ? (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
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

                <div className="flex justify-center space-x-2 mt-4">
                  {achievements.map((_, index) => (
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

          {/* ---- Edit Mode ---- */}
          {editintra && (
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
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((s) => s !== item.id)
                                : [...prev, item.id]
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
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

              {/* Table Bottom Controls */}
              <div className="flex justify-center items-center mt-4">
                <div className="flex gap-2">
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
              </div>
            </div>
          )}

          {editintra && (
            <div className="flex gap-2 mt-4 justify-end mr-12">
              <button
                onClick={handleCancel}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow-md hover:bg-yellow-500 transition "
              >
                Save
              </button>
            </div>
          )}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded shadow-lg w-[350px]">
                <h2 className="font-semibold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete the selected items?</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={handleDeleteSelected}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- Request Buttons ---- */}
          {showRequestButtons && !editintra && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => confirmDiscard(true)}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-[#FDCC03] text-white rounded flex items-center gap-2"
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

      {/* ---- Request Modal ---- */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                Request Changes
              </h2>
              <p className="text-sm text-red-600 mb-4">
                Note: Your changes will stay pending until approved by the superior admin.
                Once approved, they will be applied automatically to the live site.
              </p>

              <table className="w-full text-sm text-text dark:text-drkt border">
                <thead className="bg-gray-100 dark:bg-gray-800 text-center">
                  <tr>
                    <th className="py-2 border">Action</th>
                    <th className="py-2 border">Section</th>
                    <th className="py-2 border">Item</th>
                    <th className="py-2 border">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.length > 0 ? (
                    changes.map((change, index) => (
                      <tr key={index} className="border text-center">
                        <td
                          className={`py-2 font-semibold ${
                            change.action === "Added"
                              ? "text-green-600"
                              : change.action === "Updated"
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {change.action}
                        </td>
                        <td className=" border py-2">{change.section}</td>
                        <td className=" border py-2">{change.field}</td>
                        <td className="py-2 border ">
                          <button
                            onClick={() =>
                              setChanges((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-gray-500">
                        No changes detected
                      </td>
                    </tr>
                  )}
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
                  onClick={() => {
                    setShowRequestModal(false);
                    alert("Request submitted!");
                  }}
                  className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black font-medium"
                  disabled={changes.length === 0}
                >
                  Final Request
                </button>
              </div>
            </div>
          </div>
        )}

    </>
  );
};

export default Intramural;
