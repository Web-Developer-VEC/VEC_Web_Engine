import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTimes,
  faPaperPlane,
  faUndo,
  faEye,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { PlusCircle, Trash2, SquarePen } from "lucide-react";
import LoadComp from "../../../LoadComp";
import AutoResizeTextarea from '../../AutoResizeTextarea'

const AlumniSlider1 = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [backupData, setBackupData] = useState([]);
  const [carouselData, setCarouselData] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // Initialize data from props
  useEffect(() => {
    if (data) {
      setCarouselData(JSON.parse(JSON.stringify(data)));
      setBackupData(JSON.parse(JSON.stringify(data)));
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
    setBackupData(JSON.parse(JSON.stringify(carouselData)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCarouselData(backupData);
    setChanges([]);
    setIsEditing(false);
    setIsPreviewing(false);
    toast.info("Changes discarded!");
  };

  const handleBackToEdit = () => {
    setIsEditing(true);
    setIsPreviewing(false);
  };

const handleChange = (index, field, value) => {
  const updated = [...carouselData];
  updated[index][field] = value;
  setCarouselData(updated);

  // Check if this slide was "added" (not from backup)
  const addedChangeIndex = changes.findIndex(
    (ch) => ch.action === "added" && ch.index === index
  );

  if (addedChangeIndex !== -1) {
    // Update the added slide's data instead of creating "edited"
    const updatedChanges = [...changes];
    updatedChanges[addedChangeIndex].newSlide[field] = value;
    setChanges(updatedChanges);
  } else {
    // Normal edit tracking for existing slides
    const existingChangeIndex = changes.findIndex(
      (ch) => ch.index === index && ch.field === field
    );

    if (existingChangeIndex !== -1) {
      const updatedChanges = [...changes];
      updatedChanges[existingChangeIndex].newValue = value;
      setChanges(updatedChanges);
    } else {
      setChanges([
        ...changes,
        {
          action: "edited",
          index,
          field,
          oldValue: backupData[index]?.[field] ?? "",
          newValue: value,
        },
      ]);
    }
  }
};



  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleChange(index, "image_path", imageUrl);
    }
  };

const handleAddSlide = () => {
  const newSlide = { 
    image_path: "", 
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

// --- Validation function ---
const validateCarouselData = () => {
  for (let slide of carouselData) {
    if (!slide.image_path || slide.image_path.trim() === "") {
      toast.error("Each slide must have an image!");
      return false;
    }
    if (!slide.description || slide.description.trim() === "") {
      toast.error("Each slide must have a description!");
      return false;
    }
  }
  return true;
};

  const handleDeleteSlide = (index) => {
    const removedSlide = carouselData[index];
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
    
    toast.info("Slide deleted!");
  };

  const handleUndo = (changeIndex) => {
    const change = changes[changeIndex];
    const updatedData = [...carouselData];

    if (change.action === "edited") {
      updatedData[change.index][change.field] = change.oldValue;
    } else if (change.action === "added") {
      updatedData.splice(change.index, 1);
    } else if (change.action === "deleted") {
      updatedData.splice(change.index, 0, change.removedSlide);
    }

    setCarouselData(updatedData);
    setChanges(changes.filter((_, idx) => idx !== changeIndex));
  };

  const handleRequest = () => {
    console.log("Changes to be submitted:", changes);
    toast.success("Request submitted successfully!");
    setChanges([]);
    setShowPopup(false);
    setIsEditing(false);
    setIsPreviewing(false);
  };
  if (!carouselData || carouselData.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="relative">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      {/* Top Right Buttons */}
      {!isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-3">
          {!isEditing ? (
            <button className="nss-btn nss-btn-edit" onClick={handleEdit}>
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          ) : (
            <button className="nss-btn nss-btn-cancel" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          )}
        </div>
      )}

      {/* Preview Mode (Carousel) */}
      {isPreviewing ? (
        <div
          className="relative w-full max-w-4xl mx-auto mt-5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {carouselData.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0.5,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                >
                  <img
                    src={UrlParser(item?.image_path)}
                    alt={`Award ${index + 1}`}
                    className="w-full h-80 object-contain rounded-t-lg"
                  />
                  <div className="p-4 text-center rounded-b-lg">
                    <p className="text-lg font-semibold text-text dark:text-drkt">
                      {item?.description}
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
            {carouselData.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full ${
                  activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                } transition-all`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      ) : isEditing ? (
        /* Edit Mode (Table) */
        <div className="ncc-edit-table-container">
          <h2>Edit Carousel Slides</h2>
          <table className="ncc-edit-table">
            <thead>
              <tr>
                <th>Image</th>
                {/* <th>Title</th> */}
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {carouselData.map((slide, index) => (
                <tr key={index}>
                  <td>
                    <div className="ncc-image-upload">
                      <img
                        src={
                          slide.image_path
                            ? UrlParser(slide.image_path)
                            : "/placeholder-image.jpg"
                        }
                        alt={`Slide ${index + 1}`}
                        className="ncc-thumbnail"
                      />
                      <label className="ncc-upload-btn">
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

                  <td>
                    <AutoResizeTextarea
                      value={slide.description || ""}
                      placeholder="Enter slide description"
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      className="ncc-edit-textarea"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteSlide(index)}
                      className="ncc-delete-btn"
                    >
                      <Trash2 size={20} className="text-red-700" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ncc-edit-actions">
            <button onClick={handleAddSlide} className=" nss-btn nss-btn-add">
              <FontAwesomeIcon icon={faPlus} /> Add New Slide
            </button>
          </div>
        </div>
      ) : (
        /* Normal View Mode (Carousel) */
        <div
          className="relative w-full max-w-4xl mx-auto mt-5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {carouselData.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full transition-opacity duration-500 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0.5,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                >
                  <img
                    src={UrlParser(item?.image_path)}
                    alt={`Award ${index + 1}`}
                    className="w-full h-80 object-contain rounded-t-lg"
                  />
                  <div className="p-4 text-center rounded-b-lg">
                    <p className="text-lg font-semibold text-text dark:text-drkt">
                      {item?.description}
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
            {carouselData.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full ${
                  activeIndex === index ? "bg-blue-500" : "bg-gray-300"
                } transition-all`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Right Buttons */}
{/* Bottom Right Buttons */}
{isEditing && !isPreviewing && (
  <div className="flex justify-end gap-3 mt-4 p-3">
    <button
      className={`nss-btn nss-btn-request flex items-center gap-1 ${
        changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={() => {
        if (validateCarouselData()) {
          setIsPreviewing(true);
        }
      }}
      disabled={changes.length === 0}
    >
      <FontAwesomeIcon icon={faEye} /> View Changes
    </button>
  </div>
)}


      {isPreviewing && (
        <div className="flex justify-end gap-3 mt-4 p-3">
          <button className="nss-btn nss-btn-edit" onClick={handleBackToEdit}>
            <FontAwesomeIcon icon={faUndo} /> Back to Edit
          </button>
          <button
            className="nss-btn nss-btn-request flex items-center gap-1"
            onClick={() => setShowPopup(true)}
          >
            <FontAwesomeIcon icon={faPaperPlane} /> Request
          </button>
        </div>
      )}

      {/* Changes Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[600px]">
            <h3 className="text-lg font-semibold mb-4">Final Request for Changes</h3>
            <div className="max-h-64 overflow-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Target</th>
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
<td>
  {ch.action === "added" && ch.newSlide
    ? (ch.newSlide.description
        ? ch.newSlide.description.split(" ").slice(0, 5).join(" ") + "..."
        : "New Slide")
    : ch.action === "deleted"
    ? (ch.removedSlide.description
        ? ch.removedSlide.description.split(" ").slice(0, 5).join(" ") + "..."
        : "Deleted Slide")
    : `Slide ${ch.index + 1} - ${ch.field}`}
</td>


                        <td>
                          <button
                            onClick={() => handleUndo(i)}
                            className="px-2 py-1 bg-yellow-400 rounded text-black flex items-center gap-1 text-sm"
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
            <p className="text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
            </p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
              <button className="nss-btn nss-btn-request flex items-center gap-1" onClick={handleRequest} disabled={changes.length === 0}>
                <FontAwesomeIcon icon={faPaperPlane} /> Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniSlider1;