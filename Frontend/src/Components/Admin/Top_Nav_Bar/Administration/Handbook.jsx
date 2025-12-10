import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faPlus, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import Banner from "../../Banner";
import axios from "axios";
import "./Handbook.css";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaPaperPlane } from "react-icons/fa";
import { MdUndo } from "react-icons/md";
import { Pencil } from "lucide-react";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

/* ---------- Card Button ---------- */
const HandbookButton = ({ year, pdfspath, editable, onOpen, onEdit, onDelete }) => (
  <div className="relative flex flex-col items-center">
    <button
      onClick={() => onOpen(year, pdfspath)}
      className="flex items-center justify-center gap-2 px-6 py-4 
                 rounded-lg bg-prim dark:bg-drkb border-2 border-secd dark:border-drks text-text dark:text-prim text-lg font-medium
                 hover:bg-yellow-100 shadow-md transition-all duration-200 no-underline cursor-pointer w-48"
    >
      <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
      {year}
    </button>
    {editable && (
      <div className="absolute right-2 flex ">
        <button
          onClick={onEdit}
          className=" px-2 text-green-500 rounded-full"
        >
          <Pencil size={18}/>
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 rounded-full"
        >
          <FontAwesomeIcon icon={faTrash} size={18} />
        </button>
      </div>
    )}
  </div>
);

/* ---------- Add/Edit Modal ---------- */
const EditModal = ({ initialData, onClose, onSave }) => {
  const [form, setForm] = useState(initialData || { year: "", pdf_path: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2000]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[480px] max-w-[92vw]">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Edit Handbook" : "Add Handbook"}
        </h2>
        <div className="mb-4">
          <label className="block mb-2">Year</label>
          <input
            type="text"
            name="year"
            value={form.year}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter Year"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">PDF Link</label>
          <input
            type="text"
            name="pdf_path"
            value={form.pdf_path}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter PDF URL"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Confirm Cancel Modal ---------- */
const ConfirmCancelModal = ({ onCancelConfirm, onCancelAbort }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2000]">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px] max-w-[92vw]">
      <h2 className="text-lg font-bold mb-4">Discard Changes?</h2>
      <p className="mb-4">Are you sure you want to cancel and discard all unsaved changes made in this edit session?</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancelAbort}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          No, Keep Editing
        </button>
        <button
          onClick={onCancelConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Yes, Discard Changes
        </button>
      </div>
    </div>
  </div>
);

/* ---------- Main Admin Handbook Page ---------- */
const AdminHandbook = ({ theme, toggle }) => {
  const [handBook, setHandbook] = useState(null); // current visible
  const [originalHandbook, setOriginalHandbook] = useState(null); // snapshot before edit mode
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Track changes in current edit session
  const [editModeChanges, setEditModeChanges] = useState([]);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.post("/api/main-backend/administration", { type: "HandBook" });
        setHandbook(response.data.data);
        setOriginalHandbook(response.data.data); // initial data
      } catch (error) {
        console.error("Error fetching handbook data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: error.response.data.message } });
        }
      }
    };
    fetchdata();
  }, [navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Enter edit mode - snapshot originalHandbook
  const handleEditMode = () => {
    setOriginalHandbook(handBook);
    setEditMode(true);
    setEditModeChanges([]); // start fresh
  };

  // Track changes
  const addChange = (change) => {
    setEditModeChanges((prev) => [...prev, change]);
  };

  // Add
  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
  };

  // Edit
  const handleEdit = (item, index) => {
    setEditData({ ...item, index });
    setShowModal(true);
  };

  // Delete
  const handleDelete = (index) => {
    setHandbook((prev) => prev.filter((_, i) => i !== index));
    addChange({ type: "Deleted", label: `Handbook ${index + 1}`, index, prevItem: handBook[index] });
  };

  // Save modal (add/edit)
  const handleSaveModal = (form) => {
    if (editData) {
      const updated = [...handBook];
      updated[editData.index] = form;
      setHandbook(updated);
      addChange({ type: "Updated", label: form.year, index: editData.index, prevItem: handBook[editData.index], newItem: form });
    } else {
      setHandbook((prev) => [...prev, form]);
      addChange({ type: "Added", label: form.year, item: form });
    }
    setShowModal(false);
  };

  // Undo individual change (optional, could be implemented)
  // const handleUndo = (c) => { ... }

  // Save all: persist changes (simulate - could call API)
  const handleSaveAll = () => {
    setEditMode(false);
    setOriginalHandbook(handBook); // update baseline
    setEditModeChanges([]);
    // You can add API call here to persist changes
  };

  // Cancel: show confirm modal
  const handleCancelEdit = () => {
    setShowConfirmCancelModal(true);
  };

  // Confirm Cancel: revert to originalHandbook, discard current editModeChanges
  const handleConfirmCancel = () => {
    setHandbook(originalHandbook);
    setEditMode(false);
    setEditModeChanges([]);
    setShowConfirmCancelModal(false);
  };

  // Abort Cancel: just close modal, stay in edit mode
  const handleAbortCancel = () => {
    setShowConfirmCancelModal(false);
  };

  const handleOpenPDF = (year, pdfUrl) => {
    if (pdfUrl && pdfUrl !== "#") {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Handbook"
        subHeaderText="Comprehensive manual for students and staff"
      />

      {/* Edit Button - top right */}
      {!editMode && (
        <div className="flex justify-end mt-3 px-6">
          <button
            onClick={handleEditMode}
            className="px-4 py-2 mr-5 font-poppi bg-yellow-400 text-black rounded hover:bg-yellow-500"
          >
            Edit
          </button>
        </div>
      )}

      {handBook ? (
        <div className="flex flex-col items-center my-px-1">
          <h2 className="text-[32px] font-semibold mb-8 mt-5 text-brwn dark:text-drkt">
            Handbook
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 mb-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-center items-center">
            {handBook?.map((year, idx) => (
              <HandbookButton
                key={idx}
                year={year?.year}
                pdfspath={year?.pdf_path ? UrlParser(year?.pdf_path) : "#"}
                editable={editMode}
                onOpen={handleOpenPDF}
                onEdit={() => handleEdit(year, idx)}
                onDelete={() => handleDelete(idx)}
              />
            ))}
            {editMode && (
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-dashed border-secd dark:border-drks text-secd dark:text-drks text-lg font-medium hover:bg-yellow-50 shadow-md transition-all duration-200 w-48"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <EditModal
          initialData={editData}
          onClose={() => setShowModal(false)}
          onSave={handleSaveModal}
        />
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancelModal && (
        <ConfirmCancelModal
          onCancelConfirm={handleConfirmCancel}
          onCancelAbort={handleAbortCancel}
        />
      )}

      {/* Bottom-right buttons in edit mode */}
      {editMode && (
        <div className="fixed bottom-6 right-10 flex gap-3 z-[1000]">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-gray-400 text-white font-[poppins] rounded hover:bg-gray-500 shadow"
          >
            Cancel
          </button>
          {editModeChanges.length > 0 && (
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-secd text-white font-[poppins] rounded hover:bg-yellow-500 shadow"
            >
              Save
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default AdminHandbook;