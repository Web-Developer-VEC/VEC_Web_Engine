import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaRegCircleLeft, FaRegCircleRight, FaPaperPlane, FaFontAwesome,FaEye } from "react-icons/fa6";
import { Trash2, PlusCircle, Edit2, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import "./Couroselnss.css";

const CarouselNSS = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [editing, setEditing] = useState(false);
  const [slides, setSlides] = useState(data || []);
  const [changes, setChanges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
const [previewImg, setPreviewImg] = useState(null); // single preview (faculty)
  // refs for navigation buttons
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    setSlides(data);
  }, [data]);

  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]);

  // --- Handlers ---
  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    toast.info("Changes canceled");
    setSlides(data);
    setChanges([]);
    setEditing(false);
    setIsPreviewing(false);
  };

  const handleDelete = (index) => {
    const deletedItem = slides[index];
    setSlides(slides.filter((_, i) => i !== index));
    setChanges([...changes, { action: "deleted", section: deletedItem, index }]);
  };

  const handleAddNew = () => {
    const newSlide = { id: Date.now(), title: "", image_path: "", date: "", isNew: true };
    setSlides([...slides, newSlide]);
    setChanges([...changes, { action: "added", section: newSlide, index: slides.length }]);
  };

  const handleRequest = () => {
    if (changes.length > 0) setShowPopup(true);
  };

const handlePreviewClick = () => {
  // check required fields for all slides
  const hasEmptyFields = slides.some(
    (s) => !s.title.trim() || !s.date.trim() || !s.image_path
  );

  if (hasEmptyFields) {
    toast.error("Please fill all required fields before previewing.");
    return; // stop preview
  }

  setIsPreviewing(true);
};


  const handleBackToEdit = () => {
    setIsPreviewing(false);
  };

  const handleRequestClick = () => {
    if (changes.length > 0) setShowPopup(true);
  };

  // Track edits properly
  const handleChange = (index, key, value) => {
    const updated = [...slides];
    const oldItem = { ...updated[index] };

    updated[index][key] = value;
    setSlides(updated);

    setChanges((prev) => {
      const existingChange = prev.find(
        (ch) => ch.index === index && ch.action === "edited"
      );

      // if it was just added, don't log "edited" separately
      const wasAdded = prev.some((ch) => ch.index === index && ch.action === "added");

      if (wasAdded) {
        return prev.map((ch) =>
          ch.index === index && ch.action === "added"
            ? { ...ch, section: updated[index] }
            : ch
        );
      }

      if (existingChange) {
        return prev.map((ch) =>
          ch.index === index && ch.action === "edited"
            ? { ...ch, section: updated[index] }
            : ch
        );
      }

      return [...prev, { action: "edited", section: updated[index], old: oldItem, index }];
    });
  };

  // File uploads
  const handleFileChange = (index, file) => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      handleChange(index, "image_path", fileUrl);
    }
  };

  // Undo logic
  const handleUndo = (changeIndex) => {
    const change = changes[changeIndex];
    let newSlides = [...slides];

    if (change.action === "deleted") {
      newSlides.splice(change.index, 0, change.section);
    } else if (change.action === "added") {
      newSlides.splice(change.index, 1);
    } else if (change.action === "edited") {
      newSlides[change.index] = change.old;
    }

    setSlides(newSlides);
    setChanges(changes.filter((_, i) => i !== changeIndex));
  };

  // Final request
  const handleFinalRequest = () => {
    if (changes.length === 0) {
      toast.error("No changes to submit");
      return;
    }

    toast.success("Final request submitted!");
    console.log("Submitted changes:", changes);

    setShowPopup(false);
    setEditing(false);
    setChanges([]);
    setIsPreviewing(false);
  };

  // --- Loader ---
  if (!slides || slides.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      </div>
    );
  }

  const hasChanges = changes.length > 0;

  const renderSwiper = () => (
    <div className="p-5">
      <Swiper
        modules={[Navigation]}
        onSwiper={setSwiperInstance}
        spaceBetween={20}
        slidesPerView={4}
        loop={true}
        breakpoints={{
          1024: { slidesPerView: 4 },
          768: { slidesPerView: 3 },
          600: { slidesPerView: 2 },
          0: { slidesPerView: 1 },
        }}
          >
        {slides.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="carouselnss-card relative">
              <img
                src={UrlParser(item.image_path)}
                alt={item.title || "NSS Event"}
                className="carouselnss-image"
              />
              <div className="carouselnss-content">
                <h3>{item.title}</h3>
                <p className="carouselnss-location text-brwn dark:text-drka">NSS VEC</p>
<span className="carouselnss-date">{item.date}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <button ref={prevRef} className="swiper-button-prev custom-prev">
        <FaRegCircleLeft />
      </button>
      <button ref={nextRef} className="swiper-button-next custom-next">
        <FaRegCircleRight />
      </button>
    </div>
  );

  const renderEditTable = () => (
    <div className="overflow-x-auto mt-4">
      <table className="table-auto border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Preview</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {slides.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">
                <input
                  type="text"
                  value={item.title}
                  placeholder="Title"
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="border p-1 rounded w-full"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={item.date}
                  placeholder="Date"
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  className="border p-1 rounded w-full"
                  required
                />
              </td>
              <td className="border p-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  required
                />
              </td>
              <td className="border p-2 text-center">
                {item.image_path ? (

                  <img
  src={
    previewImg
      ? previewImg
      : item?.image_path
        ? UrlParser(item.image_path)
        : "/placeholder-image.jpg"
  }
  // alt={faculty?.name || "Faculty"}
  className="w-32 h-32 rounded border object-cover"
/>
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </td>
              <td className="border p-2 text-center">
                <button className="text-red-700" onClick={() => handleDelete(index)}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add New Row */}
      <div className="mt-3 flex justify-start">
        <button className="nss-btn nss-btn-add flex items-center gap-1" onClick={handleAddNew}>
          <PlusCircle size={18} /> Add New
        </button>
      </div>
    </div>
  );

  return (
    <div className="carouselnss-container relative">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      {/* Heading */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="events-title uppercase text-brwn dark:text-drkt">Events</h2>
        {!editing ? (
          <button className="nss-btn nss-btn-edit flex items-center gap-1" onClick={handleEdit}>
            <Edit2 size={18} /> Edit
          </button>
        ) : (
          <button className="nss-btn nss-btn-cancel flex items-center gap-1" onClick={handleCancel}>
            <XCircle size={18} /> Cancel
          </button>
        )}
      </div>

      {/* Content */}
      {isPreviewing ? (
        renderSwiper()
      ) : editing ? (
        renderEditTable()
      ) : (
        renderSwiper()
      )}

      {/* Action Buttons */}
      {editing && !isPreviewing && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            className={`nss-btn nss-btn-request ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handlePreviewClick}
            disabled={!hasChanges}
          >
            <FaEye size={16} />Preview
          </button>

        </div>
      )}
<div className="nss-req">      {isPreviewing && (
        <div className="absolute bottom-4 right-4 flex gap-2 ">
          <button className="nss-btn nss-btn-edit" onClick={handleBackToEdit}>
            Back to Edit
          </button>
          <button
            className="nss-btn nss-btn-request flex items-center gap-1"
            onClick={handleRequestClick}
          >
            <FaPaperPlane size={16} /> Request Changes
          </button>
        </div>
      )}</div>


      {/* Final Request Popup */}
      {showPopup && (
        <div className="popup">
          <div className="bg-white p-6 rounded w-11/12 md:w-1/2">
            <h3 className="flex items-center gap-2">Final Request for the Changes</h3>
            <p className="text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            <table className="border w-full mb-4">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Slide</th>
                  <th>Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((ch, i) => (
                  <tr key={i}>
                    <td>{ch.action}</td>
                    <td>
                      {Array.isArray(ch.section) 
                        ? ch.section.map((s, idx) => <span key={idx}>{s.title}</span>) 
                        : ch.section?.title}
                    </td>
                    <td>
                      <button className="nss-btn btn-undo flex items-center gap-1" onClick={() => handleUndo(i)}>
                        <FaRegCircleLeft /> Undo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
              <button
                className={`nss-btn nss-btn-request flex items-center gap-1 ${changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleFinalRequest}
                disabled={changes.length === 0}
              >
                <FaPaperPlane size={16} /> Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselNSS;