import React, { useState, useEffect } from "react";
import LoadComp from "../../LoadComp";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTimes,
  faPaperPlane,
  faUndo,
  faEye,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { PlusCircle, Trash2, SquarePen } from "lucide-react";
import AutoResizeTextarea from '../AutoResizeTextarea';
import useBlockNavigation from "../useBlockNavigation";
const Awardsnss = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [backupData, setBackupData] = useState([]);
  const [carouselData, setCarouselData] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
useBlockNavigation(isEditing);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Initialize data from props
  useEffect(() => {
    if (data && data.length > 0) {
      setCarouselData([...data]);
      setBackupData([...data]);
    }
  }, [data]);

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered || !carouselData || carouselData.length === 0 || isEditing || isPreviewing) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselData.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isHovered, carouselData, isEditing, isPreviewing]);

  const handlePrev = () => {
    if (!carouselData || carouselData.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const handleNext = () => {
    if (!carouselData || carouselData.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % carouselData.length);
  };

  const goToSlide = (index) => {
    if (!carouselData || carouselData.length === 0) return;
    setActiveIndex(index);
  };

  // --- Edit Mode Handlers ---
  const handleEdit = () => {
    setBackupData([...carouselData]);
    setIsEditing(true);
    setIsPreviewing(false);
    setChanges([]);
  };

  const handleCancel = () => {
    setCarouselData([...backupData]);
    setChanges([]);
    setIsEditing(false);
    setIsPreviewing(false);
    toast.info("Changes discarded!");
  };

  const handlePreview = () => {
    if (changes.length > 0) {
      setIsPreviewing(true);
    } else {
      toast.info("No changes to preview");
    }
  };

  const handleBackToEdit = () => {
    setIsPreviewing(false);
  };

const handleChange = (index, field, value) => {
  // Safety: check if index exists
  if (!carouselData || !carouselData[index]) return;

  const updatedData = [...carouselData];
  const oldValue = updatedData[index]?.[field] ?? "";
  updatedData[index] = { ...updatedData[index], [field]: value };
  setCarouselData(updatedData);

  // Check if this is a change to a newly added slide
  const existingAddedChangeIndex = changes.findIndex(
    (change) => change.action === "added" && change.index === index
  );

  if (existingAddedChangeIndex !== -1) {
    // If it's a new slide, update the newSlide object within the 'added' change
    const updatedChanges = [...changes];
    updatedChanges[existingAddedChangeIndex].newSlide[field] = value;
    setChanges(updatedChanges);
  } else {
    // It's a change to an existing (old) slide
    const existingEditedChangeIndex = changes.findIndex(
      (change) => change.action === "edited" && change.index === index && change.field === field
    );

    if (existingEditedChangeIndex !== -1) {
      // Update an existing 'edited' change
      const updatedChanges = [...changes];
      updatedChanges[existingEditedChangeIndex].newValue = value;
      setChanges(updatedChanges);
    } else {
      // Create a new 'edited' change
      setChanges([
        ...changes,
        {
          action: "edited",
          index,
          field,
          oldValue: backupData?.[index]?.[field] ?? "",
          newValue: value,
        },
      ]);
    }
  }
};



  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange(index, "image_path", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = () => {
    const newSlide = { 
      image_path: "", 
      title: "",
      description: "" 
    };
    const updatedData = [...carouselData, newSlide];
    setCarouselData(updatedData);
    
    setChanges([
      ...changes,
      {
        action: "added",
        index: updatedData.length - 1,
        newSlide: { ...newSlide }
      }
    ]);
  };

  const handleDeleteSlide = (index) => {
    const removedSlide = {...carouselData[index]};
    const updatedData = carouselData.filter((_, i) => i !== index);
    setCarouselData(updatedData);
    
    setChanges([
      ...changes,
      {
        action: "deleted",
        index,
        removedSlide
      }
    ]);
    
    // Adjust active index if needed
    if (activeIndex >= updatedData.length) {
      setActiveIndex(Math.max(0, updatedData.length - 1));
    }
    
    toast.info("Slide deleted!");
  };
const validateAwardnssData = () => {
    for (let slide of carouselData) {
      if (!slide.title || !slide.image_path) {
        return false;
      }
    }
    return true;
    };


  const handleUndo = (changeIndex) => {
    const change = changes[changeIndex];
    let updatedData = [...carouselData];

    if (change.action === "edited") {
      updatedData[change.index][change.field] = change.oldValue;
    } else if (change.action === "added") {
      updatedData = updatedData.filter((_, i) => i !== change.index);
    } else if (change.action === "deleted") {
      updatedData.splice(change.index, 0, change.removedSlide);
    }

    setCarouselData(updatedData);
    
    // Remove the change from changes list
    const updatedChanges = changes.filter((_, idx) => idx !== changeIndex);
    setChanges(updatedChanges);
    
    // If no changes left, exit preview mode
    if (updatedChanges.length === 0 && isPreviewing) {
      setIsPreviewing(false);
    }
  };

  const handleRequest = () => {
    console.log("Changes to be submitted:", changes);
    // Here you would typically send the changes to your backend
    toast.success("Request submitted successfully!");
    setChanges([]);
    setShowPopup(false);
    setIsEditing(false);
    setIsPreviewing(false);
    
    // Update backup data to current state after successful submission
    setBackupData([...carouselData]);
  };

  if (!carouselData || carouselData.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  // Determine which data to display based on mode
  const displayData = isPreviewing ? carouselData : data;

  return (
    <div className="relative">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      {/* Top Right Buttons */}
      {!isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-3">
          {!isEditing ? (
            <button 
              className="nss-btn nss-btn-edit flex items-center gap-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600" 
              onClick={handleEdit}
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          ) : (
            <button 
              className="nss-btn nss-btn-cancel flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" 
              onClick={handleCancel}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          )}
        </div>
      )}

      {/* Carousel Display (for both view and preview modes) */}
      {(isPreviewing || !isEditing) && (
        <div
          className="relative w-full max-w-4xl mx-auto mt-5 mb-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {displayData.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                >
                  <img
                    src={item?.image_path ? UrlParser(item.image_path) : "/placeholder-image.jpg"}
                    alt={item?.title || `Slide ${index + 1}`}
                    className="w-full h-80 md:h-96 object-cover rounded-t-lg mx-auto"
                  />
                  <div className="p-4 text-center rounded-b-lg">
                    <p className="text-lg font-semibold text-text dark:text-drkt">
                      {item?.title || "Untitled Slide"}
                    </p>
                    {item?.description && (
                      <p className="text-sm text-text dark:text-drkt mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            {displayData.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  aria-label="Previous Slide"
                >
                  &#10094;
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                  aria-label="Next Slide"
                >
                  &#10095;
                </button>
              </>
            )}
          </div>

          {/* Pagination dots */}
          {displayData.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {displayData.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                  } transition-all`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Mode (Table) */}
      {isEditing && !isPreviewing && (
        <div className="ncc-edit-table-container bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Edit Carousel Slides</h2>
          <div className="overflow-x-auto">
            <table className="ncc-edit-table w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {carouselData.map((slide, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div className="ncc-image-upload flex items-center gap-2">
                        <img
                          src={
                            slide.image_path
                              ? (slide.image_path.startsWith('data:') ? slide.image_path : UrlParser(slide.image_path))
                              : "/placeholder-image.jpg"
                          }
                          alt={`Slide ${index + 1}`}
                          className="ncc-thumbnail w-16 h-16 object-cover rounded"
                        />
                        <label className="ncc-upload-btn cursor-pointer bg-blue-500 text-white p-2 rounded">
                          <FontAwesomeIcon icon={faPlus} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(index, e)}
                          />
                        </label>
                      </div>
                    </td>
                    <td className="p-2">
                      <AutoResizeTextarea 
                        type="text" 
                        placeholder="Enter title"
                        value={slide.title || ""} 
                        onChange={(e) => handleChange(index, "title", e.target.value)}
                        className="ncc-edit-textarea w-full p-2 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <AutoResizeTextarea
                      placeholder="Enter description"
                        value={slide.description || ""}
                        onChange={(e) => handleChange(index, "description", e.target.value)}
                        className="ncc-edit-textarea w-full p-2 border rounded"
                        rows={3}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDeleteSlide(index)}
                        className="ncc-delete-btn p-2 hover:bg-red-100 rounded"
                        aria-label="Delete slide"
                      >
                        <Trash2 size={20} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ncc-edit-actions mt-4 flex justify-between items-center">
            <button 
              onClick={handleAddSlide} 
              className="nss-btn nss-btn-add flex items-center gap-2 px-4 py-2 bg-yellow-600 text-black rounded hover:bg-yellow-700"
            >
              <FontAwesomeIcon icon={faPlus} /> Add New Slide
            </button>
            
              <button 
                // onClick={handlePreview}
                             onClick={() => {
                                if (validateAwardnssData()) {
                                  handlePreview(true);
                                } else {
                                  toast.error("Please fill all required fields before previewing.");
                                }
                              }}
                className={`nss-btn nss-btn-request ${!changes.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FontAwesomeIcon icon={faEye} /> Preview Changes 
              </button>
       
          </div>
        </div>
      )}

      {/* Bottom Right Buttons for Preview Mode */}
      {isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-3">
          <button 
            className="nss-btn nss-btn-edit flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" 
            onClick={handleBackToEdit}
          >
            <FontAwesomeIcon icon={faUndo} /> Back to Edit
          </button>
          <button
            className="nss-btn nss-btn-request flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setShowPopup(true)}
          >
            <FontAwesomeIcon icon={faPaperPlane} /> Request Changes
          </button>
        </div>
      )}

      {/* Changes Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[600px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Final Request for Changes</h3>
            <div className="max-h-64 overflow-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Details</th>
                    <th className="pb-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => {
                    let IconComponent = null;
                    if (ch.action === "added") IconComponent = PlusCircle;
                    else if (ch.action === "deleted") IconComponent = Trash2;
                    else if (ch.action === "edited") IconComponent = SquarePen;

                    return (
                      <tr key={i} className="border-t">
                        <td className="py-2 flex items-center gap-1">
                          {IconComponent && <IconComponent className="w-5 h-5" />}
                          <span className="capitalize">{ch.action}</span>
                        </td>
                        <td className="py-2">
                          {ch.action === "added" && ch.newSlide
                            ? `Slide ${ch.index + 1}: ${ch.newSlide.title || "New Slide"}`
                            : ch.action === "deleted"
                            ? `Slide ${ch.index + 1}: ${ch.removedSlide.title || "Untitled"}`
                            : `Slide ${ch.index + 1}: ${ch.field} updated`
                          }
                        </td>
                        <td>
                          <button
                            onClick={() => handleUndo(i)}
                            className="px-3 py-1 bg-yellow-400 rounded text-black flex items-center gap-1 text-sm hover:bg-yellow-500"
                          >
                            <FontAwesomeIcon icon={faUndo} /> Undo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-red-600 mb-4 text-sm">
              Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button 
                className="nss-btn nss-btn-request flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
                onClick={handleRequest} disabled={changes.length === 0}
              >
                <FontAwesomeIcon icon={faPaperPlane} /> Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Awardsnss;