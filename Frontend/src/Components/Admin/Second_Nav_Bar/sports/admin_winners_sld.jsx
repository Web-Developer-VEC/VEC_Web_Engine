import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { Plus, Trash2, Send,Pencil} from "lucide-react";

const  AdminWinnerSlider = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [winners, setWinners] = useState([]);
  const [tempWinners, setTempWinners] = useState([]);
  const [editWinners, setEditWinners] = useState(false);
  const [selected, setSelected] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Modal & request states
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);
 // Load and format data
  useEffect(() => {
    if (!data) {
      setWinners([]);
      setTempWinners([]);
      return;
    }

    const formattedData = data.map((item, index) => ({
      id: index + 1,
      title: item?.title || "No Title",
      image: UrlParser(item?.image_path),
    }));

    setWinners(formattedData);
    setTempWinners(formattedData);
  }, [data]);

  // Auto-slide carousel
  useEffect(() => {
    if (isHovered || winners.length === 0) return;
    const interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % winners.length);
         }, 3000);

    return () => clearInterval(interval);
    }, [isHovered, winners]);

  const handlePrev = () => {
    if (winners.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + winners.length) % winners.length);
  };
  const handleNext = () => {
    if (winners.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % winners.length);
  };

  // ---- Edit Mode Handlers ----
  const handleInputChange = (id, field, value) => {
    setTempWinners((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleImageUpload = (id, file) => {
    const imageUrl = URL.createObjectURL(file);
    setTempWinners((prev) =>
      prev.map((item) => (item.id === id ? { ...item, image: imageUrl, newFile: file } : item))
    );
  };

  const handleAddRow = () => {
    const newId = tempWinners.length ? Math.max(...tempWinners.map(a => a.id)) + 1 : 1;
    setTempWinners((prev) => [...prev, { id: newId, title: "", image: "", newFile: null }]);
  };

  const toggleSelect = id => {
    setSelected((prev) => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    setTempWinners(prev => prev.filter(item => !selected.includes(item.id)));
    setSelected([]);
    setShowDeleteModal(false);
  };

  const handleSave = () => {
    const invalid = tempWinners.some(item => !item.title.trim() || !item.image);
    if (invalid) {
      alert("All fields (Title and Image) are mandatory!");
      return;
    }
    setWinners(tempWinners);
    setEditWinners(false);
    setShowRequestButtons(true);
  };

  const handleCancel = () => {
    setTempWinners(winners);
    setEditWinners(false);
  };

  // ---- Discard Changes Handler ----
  const confirmDiscard = () => {
    // Reset to initial state from props
    const formattedData = data?.map((item, index) => ({
      id: index + 1,
      title: item?.title || "No Title",
      image: UrlParser(item?.image_path),
    })) || [];

    setWinners(formattedData);
    setTempWinners(formattedData);
    setSelected([]);
    setShowRequestButtons(false);
    setShowDiscardModal(false);
    setEditWinners(false);
  };

  // ---- Pagination Logic ----
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempWinners.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempWinners.length / rowsPerPage);

  return (
    <>
      {/* Edit Button */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editWinners && !showRequestButtons && (
          <button className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20 mt-4" onClick={() => setEditWinners(true)}>
           <Pencil size={16} />  Edit
          </button>
        )}
      </div>

      {data ? (
        <div className="relative w-full max-w-4xl mx-auto mb-10 mt-10">
          <h2 className="text-center text-accn dark:text-drkt text-3xl font-bold mb-4">
            Winners
          </h2>

          {/* ---- Carousel View ---- */}
          {!editWinners && (
            winners.length > 0 ? (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {winners.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                        style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                      >
                        <img
                          src={item.image}
                          alt="Winner"
                          className="w-full h-80 object-contain rounded-t-lg"
                        />
                        <div className="p-4 text-center rounded-b-lg">
                          <p className="text-lg font-semibold text-text dark:text-drkt">{item.title}</p>
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
                  {winners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? "bg-blue-500" : "bg-gray-300"} transition-all`}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">No winners available</p>
            )
          )}

          {/* ---- Edit Mode ---- */}
          {editWinners && (
            <div className="overflow-x-auto border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2">Title</th>
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
                          value={item.title}
                          onChange={(e) => handleInputChange(item.id, "title", e.target.value)}
                          className="border p-1 w-full rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        {item.image && (
                          <img src={item.image} alt="preview" className="w-20 h-20 object-cover rounded" />
                        )}
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
                  className="px-4 py-1 bg-[#800000] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
             )}

          {/* ---- Request Buttons ---- */}
          {showRequestButtons && !editWinners && (
            <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowDiscardModal(true)}
              >
                Discard Changes
              </button>
              <button
                className="px-4 py-2 bg-yellow-400 text-white rounded flex items-center gap-2"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={16} /> Request Changes
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[530px]">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-black">Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-black dark:text-white">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 text-blue-600">✎ Edited</td>
                    <td className="py-1">Winners</td>
                    <td className="py-1 text-[12px]">Updated winners list</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-400 text-white">Cancel</button>
              <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white">Final Request</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Discard Modal ---- */}
      {showDiscardModal && (
         <div className="fixed inset-0 flex items-center justify-center bg-white/40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="font-semibold mb-4">Discard Changes?</h2>
            <p>All your unsaved changes will be lost.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDiscardModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDiscard}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AdminWinnerSlider;