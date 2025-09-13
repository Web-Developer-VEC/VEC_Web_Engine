import React, { useState, useEffect } from "react";
import "./NCCNCarousel.css";
import LoadComp from "../../../LoadComp";
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
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { PlusCircle, Trash2, SquarePen } from "lucide-react";
import AutoResizeTextarea from '../../AutoResizeTextarea'
import useBlockNavigation from "../../useBlockNavigation";

const NCCNCarousel = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState([]);
  const [carouselData, setCarouselData] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
// const [carouselData, setCarouselData] = useState([]);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
useBlockNavigation(isEditing);
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  // Initialize data from props
  useEffect(() => {
    if (data) {
      setCarouselData(JSON.parse(JSON.stringify(data)));
      setBackupData(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  // Auto-slide functionality
  useEffect(() => {
    if (isAutoPlay && !isEditing && !isPreviewing && carouselData.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, isAutoPlay, isEditing, isPreviewing, carouselData]);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselData.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === carouselData.length - 1 ? 0 : prev + 1
    );
  };

  // --- Handlers ---
  const handleEdit = () => {
    setBackupData(JSON.parse(JSON.stringify(carouselData)));
    setIsEditing(true);
    setIsAutoPlay(false);
  };

  const handleCancel = () => {
    setCarouselData(backupData);
    setChanges([]);
    setIsEditing(false);
    setIsPreviewing(false);
    setIsAutoPlay(true);
    toast.info("Changes discarded!");
  };

  const handleBackToEdit = () => {
    setIsEditing(true);
    setIsPreviewing(false);
  };

// const handleChange = (index, field, value) => {
//   // Safety: check if index exists
//   if (!carouselData || !carouselData[index]) return;

//   const updated = [...carouselData];

//   // Safety: make sure the object exists at the index
//   updated[index] = { ...updated[index], [field]: value };
//   setCarouselData(updated);

//   // Track changes safely
//   const existingChangeIndex = changes.findIndex(
//     (change) => change.index === index && change.field === field
//   );

//   if (existingChangeIndex !== -1) {
//     const updatedChanges = [...changes];
//     updatedChanges[existingChangeIndex].newValue = value;
//     setChanges(updatedChanges);
//   } else {
//     setChanges([
//       ...changes,
//       {
//         action: "edited",
//         index,
//         field,
//         oldValue: backupData?.[index]?.[field] ?? "", // safe access
//         newValue: value,
//       },
//     ]);
//   }
// };

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
      const imageUrl = URL.createObjectURL(file);
      handleChange(index, "image_path", imageUrl);
    }
  };

// Add a new slide
const handleAddSlide = () => {
  const newSlide = { 
    image_path: "", 
    title: "", 
    description: "" 
  };

  setCarouselData((prevData) => {
    const updatedData = [...prevData, newSlide];

    setChanges((prevChanges) => [
      ...prevChanges,
      {
        action: "added",
        index: updatedData.length - 1,
        newSlide: { ...newSlide }
      }
    ]);

    return updatedData;
  });
};

// Handle field change (safe check)



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
// Validation function
const validateCarouselData = () => {
  for (let slide of carouselData) {
    if (!slide.image_path || slide.image_path.trim() === "") return false;
    if (!slide.description || slide.description.trim() === "") return false;
  }
  return true;
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
    setIsAutoPlay(true);
  };

  if (!carouselData || carouselData.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="ncc-carousel-wrapper">
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
      {isPreviewing ?
       (
        <div className="ncc-carousel-wrap">
          <div
            className="ncc-carousel-container"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {carouselData.map((slide, index) => (
              <div className="ncc-carousel-slide" key={index}>
                <img src={UrlParser(slide.image_path)} alt={slide.title} />
                <div className="ncc-carousel-text">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            className="ncc-carousel-btn ncc-carousel-btn-left"
            onClick={prevSlide}
          >
            &#10094;
          </button>
          <button
            className="ncc-carousel-btn ncc-carousel-btn-right"
            onClick={nextSlide}
          >
            &#10095;
          </button>

          {/* Dots Indicator */}
          <div className="ncc-carousel-dots">
            {carouselData.map((_, index) => (
              <span
                key={index}
                className={`ncc-dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      )
       :
        isEditing ? (
        /* Edit Mode (Table) */
        <div className="ncc-edit-table-container">
          <h2>Edit Carousel Slides</h2>
          <table className="ncc-edit-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
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
                      type="text"
                      value={slide.title}
                      placeholder="Enter title"
                      onChange={(e) =>
                        handleChange(index, "title", e.target.value)
                      }
                      className="ncc-edit-input"
                    />
                  </td>
                  <td>
                    <AutoResizeTextarea
                      value={slide.description}
                      placeholder="Enter description"
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
        <div className="ncc-carousel-wrap">
          <div
            className="ncc-carousel-container"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {carouselData.map((slide, index) => (
              <div className="ncc-carousel-slide" key={index}>
                <img src={UrlParser(slide.image_path)} alt={slide.title} />
                <div className="ncc-carousel-text">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            className="ncc-carousel-btn ncc-carousel-btn-left"
            onClick={prevSlide}
          >
            &#10094;
          </button>
          <button
            className="ncc-carousel-btn ncc-carousel-btn-right"
            onClick={nextSlide}
          >
            &#10095;
          </button>

          {/* Dots Indicator */}
          <div className="ncc-carousel-dots">
            {carouselData.map((_, index) => (
              <span
                key={index}
                className={`ncc-dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      )}

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
    } else {
      toast.error("Please fill all required fields before previewing.");
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

      const targetText = 
        ch.action === "added"
          ? ch.newSlide?.title || `New Slide ${ch.index + 1}`
          : ch.action === "deleted"
          ? ch.removedSlide.title
          : `Slide ${ch.index + 1} - ${ch.field}`;

      return (
        <tr key={i} className="border-t">
          <td className="py-2 flex items-center gap-1">
            {IconComponent && <IconComponent className="w-5 h-5" />}
            <span className="capitalize">{ch.action}</span>
          </td>
          <td>{targetText}</td>
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

export default NCCNCarousel;