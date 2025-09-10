import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faPlus, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import Banner from "../../../Banner";
import axios from "axios";
import "./Handbook.css";
import LoadComp from "../../../LoadComp";
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

/* ---------- Main Admin Handbook Page ---------- */
const AdminHandbook = ({ theme, toggle }) => {
  const [handBook, setHandbook] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changes, setChanges] = useState([]);
  const [saved, setSaved] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.post("/api/main-backend/administration", {
          type: "HandBook",
        });
        setHandbook(response.data.data);
      } catch (error) {
        console.error("Error fetching handbook data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
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

  const handleOpenPDF = (year, pdfUrl) => {
    if (pdfUrl && pdfUrl !== "#") {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
    setSaved(false);
  };

  const handleEdit = (item, index) => {
    setEditData({ ...item, index });
    setShowModal(true);
    setSaved(false);
  };

  const handleDelete = (index) => {
    setHandbook((prev) => prev.filter((_, i) => i !== index));
    setChanges((prev) => [...prev, { type: "Deleted", label: `Handbook ${index + 1}` }]);
    setSaved(false);
  };

  const handleSaveModal = (form) => {
    if (editData) {
      const updated = [...handBook];
      updated[editData.index] = form;
      setHandbook(updated);
      setChanges((prev) => [...prev, { type: "Updated", label: form.year, fields: ["year", "pdf_path"] }]);
    } else {
      setHandbook((prev) => [...prev, form]);
      setChanges((prev) => [...prev, { type: "Added", label: form.year }]);
    }
    setShowModal(false);
    setSaved(false);
  };

  const handleSaveAll = () => {
    setEditMode(false);
    setSaved(true);
  };

  const handleUndo = (c) => {
    setChanges((prev) => prev.filter((x) => x !== c));
  };

  const handleRequest = () => {
    console.log("Request submitted:", changes);
    setShowConfirmModal(false);
    setChanges([]);
    setSaved(false);
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

      {!editMode && (
        <div className="flex justify-end mt-3 px-6">
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 mr-5 font-poppi bg-yellow-400 text-black rounded hover:bg-yellow-500"
          >
            Edit
          </button>
        </div>
      )}

      {handBook ? (
        <div className="flex flex-col items-center my-px-1">
          <h2 className="text-[32px] font-semibold mb-8 text-brwn dark:text-drkt">
            Handbook
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-center items-center">
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

      {/* Confirm Request Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[520px] max-w-[92vw]">
            <h2 className="text-lg font-bold mb-4">Final Request for the Changes</h2>
            <p className="text-red-600 mb-4">
              <span className="font-semibold">Note:</span> Your changes will stay pending
              until approved by the superior admin. Once approved, they will be applied automatically.
            </p>

            <table className="w-full border-collapse mb-6 text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.length ? (
                  changes.map((c, idx) => (
                    <tr key={`${c.type}-${c.label}-${idx}`} className="border-b">
                      <td className="py-2">{c.type}</td>
                      <td className="py-2">{c.label}</td>
                      <td className="py-2">{c.type === "Updated" ? c.fields?.join(", ") : "—"}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleUndo(c)}
                          className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-1"
                          title="Undo this change"
                        >
                          <MdUndo /> Undo
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No changes detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="px-4 py-2 bg-yellow-400 text-black rounded flex items-center gap-2 hover:bg-yellow-500"
              >
                <FaPaperPlane /> Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-right buttons */}
      {editMode && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 mb-2 mr-10 bg-green-500 text-white font-[poppins] rounded flex items-center gap-2 hover:bg-green-600"
              >
                Save
              </button>
            </div>
          )}
          

      {!editMode && saved && changes.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-3 py-2 mb-3 mr-10 bg-yellow-400 text-black font-[poppins] rounded flex items-center gap-2 hover:bg-yellow-500"
          >
            <FaPaperPlane /> Request
          </button>
        </div>
      )}
    </>
  );
};

export default AdminHandbook;
