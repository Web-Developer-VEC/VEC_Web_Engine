import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Send, X, Plus, Trash2 } from 'lucide-react';
import './Student_activities.css';
import LoadComp from '../../../LoadComp';

const ImageCarousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const student_achievements_content =
    data?.find((item) => item.category === 'student_achievements_content')?.content || [];

  let initialDetails =
    data?.find((item) => item.category === 'student_achievements_details')?.images || [];

// Assign sequential numeric IDs starting from 1
initialDetails = initialDetails.map((item, index) => ({
  ...item,
  id: index + 1, 
}));

  const [introText, setIntroText] = useState(student_achievements_content?.[0] || "");
  const [editMode, setEditMode] = useState(false);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [changes, setChanges] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showRequestModal,setShowRequestModal]=useState();
  const [showDeleteModal,setShowDeleteModal]=useState();
  const [tableData, setTableData] = useState(initialDetails);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const currentRows = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith('http') || path?.startsWith('blob') ? path : `${BASE_URL}${path}`;
  };

  const handleClick = (image) => {
    if (image.status) setSelectedImage(image);
  };

  const closeModal = () => setSelectedImage(null);

  useEffect(() => {
    if (tableData?.length > 0) setCurrentIndex(0);
  }, [tableData]);

  useEffect(() => {
    if (tableData?.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === tableData?.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [tableData, isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === tableData?.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? tableData?.length - 1 : prev - 1));
  };

const handleSave = () => {
  if (!introText.trim()) {
    alert("Introduction text is mandatory!");
    return;
  }

  const invalid = tableData.some((item) => !item.event_name?.trim() || !item.image_path);
  if (invalid) {
    alert("All fields (Event Name and Image) are mandatory!");
    return;
  }

  setEditMode(false);
  setShowRequestButtons(true);  
};


  const confirmDiscard = () => {
    setChanges([]);
    setShowRequestButtons(false);
    setTableData(initialDetails);
    setIntroText(student_achievements_content?.[0] || "");
  };

  const handleRequestConfirm = () => {
    console.log('Request submitted:', changes);
    setChanges([]);
    setShowRequestButtons(false);
  };
const handleChange = (id, field, value) => {
  setTableData((prev) =>
    prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
  );

  setChanges((prev) => {
    const label =
      field === "event_name"
        ? `image - ${id}`
        : field === "image_content"
        ? `image - ${id}`
        : field;

    const existing = prev.find(
      (ch) => ch.id === id && ch.field === label && ch.action === "update"
    );

    if (existing) {
      // Update existing change
      return prev.map((ch) =>
        ch.id === id && ch.field === label && ch.action === "update"
          ? { ...ch, newValue: value }
          : ch
      );
    } else {
      // Add new change
      return [
        ...prev,
        {
          action: "update",
          field: label, // formatted field name
          id,
          oldValue: tableData.find((item) => item.id === id)?.[field] || "",
          newValue: value,
        },
      ];
    }
  });
};


const handleImageUpload = (id, file) => {
  if (!file) return; // Exit if no file

  setTableData((prev) =>
    prev.map((item) => {
      if (item.id === id) {
        // Revoke old object URL if exists to prevent memory leaks
        if (item.image_path && item.image_path.startsWith("blob:")) {
          URL.revokeObjectURL(item.image_path);
        }

        const imageUrl = URL.createObjectURL(file); // Temporary preview URL
        return {
          ...item,
          image_path: imageUrl,
          newFile: file, // store original file
        };
      }
      return item;
    })
  );
};
const handleIntroTextChange = (value) => {
  setIntroText(value);
  setChanges((prev) => {
    const existing = prev.find(
      (ch) => ch.field === "Text" && ch.action === "update"
    );
    if (existing) {
      // Update the existing entry instead of adding a new one
      return prev.map((ch) =>
        ch.field === "Text" && ch.action === "update"
          ? { ...ch, newValue: value }
          : ch
      );
    } else {
      // Only add a new change once
      return [
        ...prev,
        {
          action: "update", // standardized
          field: "Text",
          oldValue: student_achievements_content?.[0] || "",
          newValue: value,
        },
      ];
    }
  });
};



const handleAddRow = () => {
  // Determine next sequential ID
  const nextId = tableData.length > 0 
    ? Math.max(...tableData.map(item => item.id)) + 1 
    : 1;

  const newRow = {
    id: nextId,
    event_name: '',              
    image_content: '',           
    image_path: '',              
    status: false,                 
  };

  // Update table data
  setTableData((prev) => [...prev, newRow]);

  // Track the addition in changes for the modal
  setChanges((prev) => [
    ...prev,
    {
      action: "add",
      field: `image - ${newRow.id}`,
      id: newRow.id,
      description: "New student achievement row added",
    },
  ]);
};

const handleDeleteRows = () => {
  setTableData((prev) => {
    // Find rows that are being deleted
    const deletedRows = prev.filter((item) => selected.includes(item.id));

    // Track each deleted row in changes
    setChanges((prevChanges) => [
      ...prevChanges,
      ...deletedRows.map((item) => ({
        action: "delete",
        field: `image - ${item.id}`,
        id: item.id,
        description: `Deleted student achievement row with ID ${item.id}`,
      })),
    ]);

    return prev.filter((item) => !selected.includes(item.id));
  });
  setSelected([]);
  setShowDeleteModal(false);
};


  if (!data)
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );

  return (
    <div className="carousel-container font-[Poppins]">
      {/* Admin Controls */}
      <div className="admin-controls-ug flex justify-end mb-2">
        {!editMode && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => { setEditMode(true); setShowRequestButtons(false); }}
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {/* Section Heading */}
      <h1 className="intro-title text-accn dark:text-drkt font-[Poppins]">
        Student Achievements
      </h1>
            {(editMode || student_achievements_content?.length > 0) && (
  <div className="intro-section bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] font-[Poppins]">
    {editMode ? (
      <textarea
        value={introText}
        onChange={(e) => handleIntroTextChange(e.target.value)}
        placeholder="Enter introduction text..."
        className="w-full text-[16px] p-2 border rounded resize-y min-h-[150px]"
      />
    ) : (
      <p className="intro-text-act text-text dark:text-drkt">{introText}</p>
    )}
  </div>
)}
      {/* Carousel or Table */}
      {!editMode ? (
        <>
          {/* 🔹 Carousel */}
          <div className="carousel-wrapper">
            <div
              className="carousel-slides"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                display: 'flex',
                transition: 'transform 0.3s ease',
              }}
            >
              {tableData?.map((item, index) => (
                <div key={item.id} className="carousel-slide" style={{ left: `${index * 100}%` }}>
                  <div className="image-wrapper">
                    <img src={UrlParser(item?.image_path)} alt={item?.event_name} className="carousel-image" />
                    {item?.status && (
                      <button className="know-more-button" onClick={() => { handleClick(item); setIsPaused(true); }}>
                        Know More
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal */}
            {selectedImage && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-stud" onClick={(e) => e.stopPropagation()}>
                  {selectedImage?.video_link && (
                    <>
                      <h2 className={`description-title text-accn dark:text-drka ${tableData[currentIndex]?.image_content ? '' : 'text-center'}`}>
                        {tableData[currentIndex]?.event_name}
                      </h2>
                      <p className="description-text-act">{tableData[currentIndex]?.image_content}</p>
                      <a href={selectedImage?.video_link} target="_blank" rel="noopener noreferrer" className="youtube-link">View Full Playlist</a>
                    </>
                  )}
                  <button onClick={closeModal} className="student-close">X</button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <button onClick={prevSlide} className="nav-button prev-button"><ChevronLeft className="nav-icon" /></button>
            <button onClick={nextSlide} className="nav-button next-button"><ChevronRight className="nav-icon" /></button>
          </div>

          {/* Description Box */}
          <div className="description-box bg-prim dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h2 className={`description-title text-accn dark:text-drka ${tableData?.[currentIndex]?.image_content ? '' : 'text-center'}`}>
              {tableData?.[currentIndex]?.event_name}
            </h2>
            <p className="description-text-act">{tableData?.[currentIndex]?.image_content}</p>
          </div>
        </>
      ) : (
        <div className="mt-6">
          {/* Table View */}
          <table className="w-full justify-items-center m-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2">Heading</th>
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
                          value={item.event_name || ""}
                          onChange={(e) => handleChange(item.id, 'event_name', e.target.value)}
                          className="w-full border p-1 rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.image_content || ""}
                          onChange={(e) => handleChange(item.id, 'image_content', e.target.value)}
                          className="w-full border p-1 rounded"
                        />
                      </td>
                      <td className="p-2 flex items-center gap-2">
                      {item.image_path && (
                        <img
                          src={UrlParser(item.image_path)}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
                        <span>{item.image_path ? "Replace" : "Upload"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
                        />
                      </label>
                    </td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() =>
                      setSelected((prev) =>
                        prev.includes(item.id) ? prev.filter((s) => s !== item.id) : [...prev, item.id]
                      )} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Next</button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 justify-center">
            <button onClick={handleAddRow} className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded"><Plus size={16} /> Add New</button>
            {selected.length > 0 && (
              <button onClick={() => {setShowDeleteModal(true);}} className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded"><Trash2 size={16} /> Delete</button>
            )}
          </div>
        </div>
      )}

      {/* Save / Cancel */}
      {editMode && (
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setEditMode(false)} className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>
          <button onClick={handleSave} className="px-4 py-1 bg-[#800000] text-white rounded">Save</button>
        </div>
      )}

      {/* Request Buttons */}
      {showRequestButtons && !editMode && (
        <div className="flex justify-end gap-3 mt-6 mb-4">
          <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={confirmDiscard}>Discard Changes</button>
          <button className="px-4 py-2 bg-yellow-400 text-black rounded flex items-center gap-2" onClick={() => {setShowRequestModal(true)}}><Send size={16} /> Request</button>
        </div>
      )}
       {showRequestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 dark:text-white text-black">
                  Request Changes
                </h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the superior admin.  
                  Once approved, they will be applied automatically to the live site.
                </p>

                <table className="w-full text-sm text-black dark:text-white border">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-center">
                    <tr>
                      <th className="py-2 border">Action</th>
                      <th className="py-2 border">Section</th>
                      <th className="py-2 border">Changes</th>
                      <th className="py-2 border">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((change, index) => (
                      <tr key={index} className="border text-center">
                        <td className="py-2 border text-blue-600 font-semibold">
                          {change.action === "add" && "Added"}
                          {change.action === "delete" && "Deleted"}
                          {change.action === "update" && "Edited"}
                        </td>
                        <td className="py-2 border">
                          Student Achievements
                        </td>
                        <td className="py-2 border">
                          {change.field && (
                            <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                              {change.field}
                            </span>
                          )}
                        </td>
                        <td className="py-2 border">
                          <button
                            onClick={() => {
                              // Remove the change from the list
                              setChanges((prev) => prev.filter((_, i) => i !== index));

                              // Optional: Revert introText if it's an intro text change
                              if (change.field === "Text" && change.action === "update") {
                                setIntroText(change.oldValue || "");
                              }

                              // Optional: Revert table data if needed
                              if (change.action === "add") {
                                setTableData((prev) => prev.filter(item => item.id !== change.id));
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-bold"
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
                    className="px-4 py-2 rounded bg-gray-400 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleRequestConfirm();
                      setShowRequestModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                  >
                    Final Request
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
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
                  onClick={handleDeleteRows}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>   
  );
};

export default ImageCarousel;
