import React, { useState, useEffect } from 'react';
import LoadComp from '../../LoadComp';
import '../sports/admin_Sportshod.css';
import {
  SquarePen,
  Plus,
  CircleX,
  Edit3,
  Trash2,
  Send,
  PlusCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
import { input } from 'framer-motion/m';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};
const Sportsfaculties = ({ data: initialData }) => {
  const [editFac, setEditFac] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});

  const { sendRequest, loading, error } = useAdminRequest();
  console.log("Ajay", changeList);


  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  useEffect(() => {
    const dataWithIds = (initialData || []).map((item) => ({
      ...item,
      id: item.id || generateId(),
    }));
    setFacultyData(dataWithIds);
    setOriginalData(dataWithIds);
  }, [initialData]);

  const handleSelect = (id, isChecked) => {
    setSelectedItems((prev) =>
      isChecked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };
  const trackChange = (index, field, value) => {
  setFacultyData(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value };
    const faculty = updated[index];

    const original = originalData.find(o => o.id === faculty.id);

    setChangeList(prevChanges => {
      let newChanges = [...prevChanges];

      // 🟢 IF NEW FACULTY → update added entry
      if (faculty.isNew) {
        const existingIndex = newChanges.findIndex(
          c => c.type === "added" && c.data.id === faculty.id
        );

        if (existingIndex >= 0) {
          newChanges[existingIndex] = {
            ...newChanges[existingIndex],
            section: faculty.name || "New Faculty",
            data: faculty
          };
        }

        return newChanges;
      }

      // 🔵 EXISTING FACULTY EDIT
      const editedFields = {};

      ["name", "qualification", "designation", "image_path"].forEach(key => {
        if (faculty[key] !== original?.[key]) {
          editedFields[key] = {
            before: original?.[key] || "",
            after: faculty[key] || ""
          };
        }
      });

      const existingIndex = newChanges.findIndex(
        c => c.type === "edited" && c.data.id === faculty.id
      );

      if (Object.keys(editedFields).length === 0) {
        if (existingIndex >= 0) {
          return newChanges.filter((_, i) => i !== existingIndex);
        }
        return newChanges;
      }

      const newChange = {
        type: "edited",
        section: faculty.name || "Faculty",
        fields: editedFields,
        data: faculty
      };

      if (existingIndex >= 0) {
        newChanges[existingIndex] = newChange;
        return newChanges;
      }

      return [...newChanges, newChange];
    });

    return updated;
  });
};




  const handleFacultyImageChange = (e, index, facultyId) => {
    const file = e.target.files[0];
    if (!file) return;

    // UI preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, [facultyId]: previewUrl }));

    const finalPath = `/static/images/sports/faculty/${file.name}`;

    // 🧠 1) Update facultyData with file
    setFacultyData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        image_path: finalPath,
        image_file: file
      };
      return updated;
    });

    // 🧠 2) ALSO inject file into changeList immediately
    setChangeList(prev => {
  return prev.map(change => {
    if (change.data.id === facultyId) {
      return {
        ...change,
        data: {
          ...change.data,
          image_path: finalPath,
          image_file: file
        }
      };
    }
    return change;
  });
});


    // 🧠 3) Track path change
    trackChange(index, "image_path", finalPath);
  };



  const getFacultyAction = (id) => {
    const change = changeList.find(c => c.data.id === id);
    return change?.type || null;  // "added" | "edited" | "deleted" | null
  };

  const handleSave = () => {
    const invalid = facultyData.some(
      (f) => !f.name || !f.qualification || !f.designation || !f.image_path
    );
    if (invalid) {
      toast.error("All fields are mandatory.");
      return;
    }
    // setOriginalData(facultyData);
    toast.success("Changes saved! You can request or discard now.");
    setShowRequestButtons(true);
    setEditFac(false);
  };

  const handleCancelEdit = () => {
    setFacultyData(originalData);
    setSelectedItems([]);
    setChangeList([]);
    setImagePreviews({});
    setEditFac(false)
    toast.info("Current edits cancelled, reverted to last saved data.");
  };

  const handleDiscard = () => {
    setFacultyData([...originalData]);
    setSelectedItems([]);
    setShowRequestButtons(false);
    setChangeList([]);
    setImagePreviews({});
    setEditFac(false);
    setShowDiscardModal(false);
    toast.info("All changes discarded, back to original data.");
  };

  const addNewCard = () => {
    const newFaculty = {
      id: generateId(),
      name: "",
      qualification: "",
      designation: "",
      image_path: "",
      isNew: true,
    };
    setFacultyData((prev) => [...prev, newFaculty]);
    setChangeList((prev) => [
      ...prev,
      { type: "added", section: newFaculty.name || "new Faculty", fields: {}, data: newFaculty },
    ]);
  };

  const handleDeleteSelected = () => {
    const locked = selectedItems.filter(id => {
      const action = getFacultyAction(id);
      return action === "added" || action === "edited";
    });

    if (locked.length) {
      toast.error("Finish editing selected faculties before deleting.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.info("No faculty selected.");
      return;
    }
    const deletedItems = facultyData.filter((item) =>
      selectedItems.includes(item.id)
    );
    setFacultyData((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
    );
    setChangeList((prev) => [
      ...prev,
      ...deletedItems.map((d) => ({ type: "deleted", section: d.name, fields: {}, data: d })),
    ]);
    setSelectedItems([]);
    setShowDeleteModal(false);
    toast.success("Selected faculties deleted.");
  };

  const revertField = (changeIdx) => {
    setChangeList((prevChanges) => {
      const change = prevChanges[changeIdx];
      if (!change) return prevChanges;

      let nextChanges = [...prevChanges];

      if (change.type === "added") {
        const id = change.data.id;

        setFacultyData((prev) => prev.filter((f) => f.id !== id));

        setImagePreviews(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        nextChanges = prevChanges.filter((_, i) => i !== changeIdx);
      }

      else if (change.type === "deleted") {
        setFacultyData((prev) => [...prev, change.data]);
        nextChanges = prevChanges.filter((_, i) => i !== changeIdx);
      }

      else if (change.type === "edited") {
        const id = change.data.id;

        setFacultyData((prev) => {
          const updated = [...prev];
          const idxF = updated.findIndex((f) => f.id === id);
          if (idxF >= 0) {
            const original = originalData.find(o => o.id === id);
            if (original) {
              updated[idxF] = { ...original };
            }
          }
          return updated;
        });

        setImagePreviews(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        nextChanges = prevChanges.filter((_, i) => i !== changeIdx);
      }

      // 🧠 If after undo there are NO changes left → exit request mode
      if (nextChanges.length === 0) {
        setShowRequestModal(false);    // close request popup
        setShowRequestButtons(false);  // hide request/discard buttons
        setEditFac(false);             // back to normal view (Edit button shows)
        toast.info("All changes reverted.");
      }

      return nextChanges;
    });
  };


  const handleRequestConfirm = async () => {

    if (!changeList.length) {
      toast.info("No changes to submit.");
      return;
    }

    // 1️⃣ Build payload
    const payload = changeList.map(change => {

      const faculty = change.data;
      const originalFaculty = originalData.find(o => o.id === faculty.id);

      if (change.type === "added") {
        return {
          collectionName: "sports",
          collection_type: "faculty",
          action: "insert",
          title: "Insertion of Faculty Member",
          meta_data: {
            name: faculty.name,
            qualification: faculty.qualification,
            designation: faculty.designation,
            image_path: faculty.image_path
          },
          original_data: null
        };
      }

      if (change.type === "edited") {
        return {
          collectionName: "sports",
          collection_type: "faculty",
          action: "update",
          title: "Updation of Faculty Member",
          meta_data: {
            name: faculty.name,
            qualification: faculty.qualification,
            designation: faculty.designation,
            image_path: faculty.image_path
          },
          original_data: {
            name: originalFaculty?.name,
            qualification: originalFaculty?.qualification,
            designation: originalFaculty?.designation,
            image_path: originalFaculty?.image_path
          }
        };
      }

      if (change.type === "deleted") {
        return {
          collectionName: "sports",
          collection_type: "faculty",
          action: "delete",
          title: "Deletion of Faculty Member",
          meta_data: {
            name: faculty.name,
            qualification: faculty.qualification,
            designation: faculty.designation,
            image_path: faculty.image_path
          },
          original_data: null
        };
      }

    }).filter(Boolean);

    // 2️⃣ Collect files (if any image is File)
    const filesToUpload = [];

    changeList.forEach(change => {
      if (change.data.image_file) {
        filesToUpload.push(change.data.image_file);
      }
    });



    console.log("🚀 Sending payload:", payload);
    console.log("filesToUpload:", filesToUpload);
    // 3️⃣ Send request
    try {
      const result = await sendRequest(payload, filesToUpload);

      if (result) {
        console.log("REQUEST SUBMITTED", payload);
        toast.success("Final request submitted");

        setShowRequestModal(false);
        setChangeList([]);
        setShowRequestButtons(false);
        setEditFac(false);
      }
    } catch (err) {
      console.error("Request failed:", err);
      toast.error("Request submission failed");
    }
  };


  return (
    <section className="px-4 py-6 flex flex-col">
      {/* Top Controls */}
      <div className="flex justify-end mb-2">
        {!editFac && (
          <button
            onClick={() => { setEditFac(true); setShowRequestButtons(false); }}
            className="flex items-center gap-2 px-4 py-2 mr-3 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      <h2 className="text-center text-3xl font-bold mb-8">Sports Faculties</h2>

      {/* Faculty Cards */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {facultyData.map((faculty, index) => (
            <div
              key={faculty.id}
              className="bg-white rounded-xl shadow-lg p-4 text-center max-w-[300px] relative"
            >
              <img
                src={imagePreviews[faculty.id] || UrlParser(faculty.image_path)}
                alt={faculty.name}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              {editFac ? (
                <>
                  <div className="mb-2">
                    <label className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer">
                      <span>{faculty.image_path ? "Replace" : "Upload"}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFacultyImageChange(e, index, faculty.id)}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={faculty.name}
                    placeholder="Name"
                    className="w-full border p-2 rounded mb-2"
                    onChange={(e) => trackChange(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    value={faculty.qualification}
                    placeholder="Qualification"
                    className="w-full border p-2 rounded mb-2"
                    onChange={(e) => trackChange(index, "qualification", e.target.value)}
                  />
                  <input
                    type="text"
                    value={faculty.designation}
                    placeholder="Designation"
                    className="w-full border p-2 rounded"
                    onChange={(e) => trackChange(index, "designation", e.target.value)}
                  />
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      disabled={["added", "edited"].includes(getFacultyAction(faculty.id))}
                      checked={selectedItems.includes(faculty.id)}
                      onChange={(e) => handleSelect(faculty.id, e.target.checked)}
                      className="w-5 h-5 accent-blue-500 cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{faculty.name}</h3>
                  <p>{faculty.qualification}</p>
                  <p>{faculty.designation}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Card */}
      {editFac && (
        <div
          className="border-2 border-dashed border-gray-400 flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-4 max-w-[500px] h-[300px] mt-6 mx-auto cursor-pointer hover:bg-gray-100"
          onClick={addNewCard}
        >
          <Plus className="text-gray-500" />
          <span className="mt-2 text-gray-500">Add New Faculty</span>
        </div>
      )}

      {/* Delete Selected */}
      {editFac && selectedItems.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} /> Delete Selected
          </button>
        </div>
      )}
      {editFac && !showRequestButtons && (
        <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded"
            onClick={handleCancelEdit}
          >
            Cancel
          </button>

          {changeList.length > 0 && (   // 👈 ONLY show Save if there are changes
            <button
              className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
      )}



      {/* Request / Discard */}
      {showRequestButtons && (
        <div className="flex justify-end gap-3 mt-6 mb-4 mr-12">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => setShowDiscardModal(true)}   // 👈 open popup
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
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Discard Changes?</h2>
            <p className="text-sm text-gray-600 dark:text-drkt mb-6">
              Are you sure you want to discard all your changes? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDiscard();          // 👈 actually discard
                  setShowDiscardModal(false);
                }}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px]">
            <h2 className="font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete selected faculties?</p>
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
      {/* Request Changes Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Request Changes</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved, they will go live.
            </p>

            {/* Changes Table */}
            <table className="w-full border border-gray-300 text-sm text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>
              <tbody>
                {changeList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">
                      No changes to request.
                    </td>
                  </tr>
                ) : (
                  changeList.map((change, idx) => (
                    <tr key={idx}>
                      <td className={`border p-2 font-semibold ${change.type === "added" ? "text-green-600" : change.type === "deleted" ? "text-red-600" : "text-blue-600"}`}>
                        {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                      </td>
                      <td className="border p-2">Sports Faculty</td>
                      <td className='border'>{change.data.name || change.section}</td>
                      <td className='border'>
                        <button
                          onClick={() => revertField(idx)}
                          className="p-1 rounded hover:bg-gray-100"
                          title={change.type === "added" ? "Remove" : "Revert all"}
                        >
                          <X />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim"
                disabled={changeList.length === 0}
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </section>
  );
};
const SportsHOD = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [changes, setChanges] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({ ...data?.[0] });
  const [originalData, setOriginalData] = useState({ ...data?.[0] });
  const { sendRequest, loading, error } = useAdminRequest();
  const [hodPreview, setHodPreview] = useState(null);
  const [hodImageFile, setHodImageFile] = useState(null);


  useEffect(() => {
    if (data?.[0]) {
      setFormData(data[0]);
      setOriginalData(data[0]);
    }
  }, [data]);

  // ✅ Detect changes
  useEffect(() => {
    if (!originalData || !formData) {
      setHasChanges(false);
      return;
    }
    const diff = Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );
    setHasChanges(diff);
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const detectChanges = () => {
    const diff = [];
    if (!originalData) return diff;

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key]) {
        diff.push({
          field: key,
          oldValue: originalData[key],
          newValue: formData[key],
        });
      }
    });
    return diff;
  };

  const handleDiscardChanges = () => {
    setFormData({ ...originalData });

    // 🔥 Ensure preview + file are cleared
    setHodPreview(null);
    setHodImageFile(null);

    setIsEditing(false);
    setShowRequest(false);
    setHasChanges(false);
    setShowRequestModal(false);
    setShowDiscardModal(false);

    toast.info("Changes discarded");
  };



  const handleHodImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    console.log("Preview URL:", previewUrl); // 🔎 must log blob:...

    setHodPreview(previewUrl);

    const finalPath = `/static/images/sports/hod/${file.name}`;

    setFormData(prev => ({
      ...prev,
      image_path: finalPath,
      image_file: file
    }));

    setHodImageFile(file);
    setHasChanges(true);
  };


  const handleRequestConfirm = async () => {

    const payload = {
      collectionName: "sports",
      collection_type: "hod",
      action: "update",
      title: "Updation of HOD",

      meta_data: {
        name: formData.name,
        designation: formData.designation,
        qualification: formData.qualification,
        message: formData.message,
        image_path: formData.image_path
      },

      original_data: {
        name: originalData.name,
        designation: originalData.designation,
        qualification: originalData.qualification,
        message: originalData.message,
        image_path: originalData.image_path
      }
    };
    const filesToUpload = [];
    if (hodImageFile) {
      filesToUpload.push(hodImageFile);
    }
    console.log("Final Sports HOD request submitted with payload:", payload);
    console.log("filesToUpload:", filesToUpload);

    try {
      const result = await sendRequest([payload], filesToUpload);


      if (result) {
        console.log("INTRAMURAL REQUEST SUBMITTED", payload);
        toast.success("Final request submitted");

        setShowRequestModal(false);
        setShowRequest(false);
        setIsEditing(false);
        setHasChanges(false);
        ;
      }
    } catch (err) {
      console.error("Request failed:", err);
      toast.error("Request submission failed");
    }
  };


  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <article className="relative flex flex-col gap-4 bg-prim dark:bg-drkp shadow-xl p-6 rounded-xl items-center text-center font-[Poppins] mt-6">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Edit Button */}
      {!isEditing && (showRequest || !isEditing) && (
        <div className="absolute top-1 right-10">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 mt-2 bg-secd text-text hover:bg-brwn hover:text-prim  rounded-xl shadow-md "
          >
            <Pencil size={18} />
            <span>Edit</span>
          </button>
        </div>
      )}

      {/* Image */}
      <div className="w-full md:w-1/8 flex flex-col justify-center items-center gap-2">
        <img
          className="w-auto h-60 rounded-lg"
          alt="Sports HoD"
          src={hodPreview || UrlParser(formData?.image_path)}
        />

        {isEditing && (
          <label className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer mt-2">
            <span>Replace</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHodImageChange}
            />
          </label>
        )}
      </div>


      {/* Editable Info */}
      <div className="flex flex-col px-4 w-full">
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={formData?.name || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value.toUpperCase(),
              }))
            }
            className="text-2xl font-semibold border p-1 rounded mb-2 w-full uppercase"
          />
        ) : (
          <h2 className="text-2xl font-semibold">
            {formData?.name?.toUpperCase()}
          </h2>
        )}
        {isEditing ? (
          <input
            type="text"
            value={formData?.designation || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                designation: e.target.value,
              }))
            }
            className="text-2xl font-semibold border p-1 rounded mb-2 w-full"
          />
        ) : (
          <p className="text-2xl font-semibold mb-2">{formData?.designation}</p>
        )}
        {isEditing ? (
          <input
            type="text"
            name="qualification"
            value={formData?.qualification}
            onChange={handleChange}
            className="text-md border p-1 rounded mb-2 w-full"
          />
        ) : (
          <p className="text-md mb-2 text-brwn dark:text-drka">
            {formData?.qualification}
          </p>
        )}

        {isEditing ? (
          <textarea
            name="message"
            value={formData?.message}
            onChange={handleChange}
            rows={5}
            className="text-xl border p-2 rounded w-full"
          />
        ) : (
          <p className="text-xl sm:text-justify text-justify">
            {formData?.message}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setShowDiscardModal(true)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
              >
                Cancel
              </button>

              {hasChanges && (
                <button
                  onClick={() => {
                    let missing = [];
                    if (!formData?.name?.trim()) missing.push("Name");
                    if (!formData?.designation?.trim()) missing.push("Designation");
                    if (!formData?.qualification?.trim())
                      missing.push("Qualification");
                    if (!formData?.message?.trim()) missing.push("Message");
                    if (!formData?.image_path?.trim()) missing.push("Image");

                    if (missing.length > 0) {
                      toast.error(
                        `⚠ Please fill the following field(s): ${missing.join(", ")}`
                      );
                      return;
                    }

                    const diff = detectChanges();
                    setChanges(diff);
                    setIsEditing(false);
                    setShowRequest(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg"
                >
                  <span>Save</span>
                </button>
              )}
            </>
          ) : (
            showRequest && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowDiscardModal(true)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg shadow font-medium transition"
                >
                  Discard Changes
                </button>

                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex items-center gap-2 bg-[#FDCC03] hover:bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-md font-medium transition"
                >
                  <Send size={18} />
                  <span>Request</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Discard Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Discard Changes?</h2>
            <p className="text-sm text-gray-600 dark:text-drkt mb-6">
              Are you sure you want to discard all your changes? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                cancel
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
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
                  <th className="py-2 border">Changes</th>
                </tr>
              </thead>
              <tbody>
                {changes
                  .filter(change => change.field !== "image_file") // 🔥 REMOVE
                  .map((change, index) => (
                    <tr key={index} className="border text-center">
                      <td className="py-2 text-blue-600 font-semibold">Edited</td>
                      <td className="py-2">Sports HoD</td>
                      <td className="py-2 flex items-center justify-center gap-2">
                        <span className="px-2 py-1 bg-yellow-100 text-black rounded-md">
                          {change.field === "name" ? "Name" :
                            change.field === "designation" ? "Designation" :
                              change.field === "qualification" ? "Qualification" :
                                change.field === "message" ? "Message" :
                                  change.field === "image_path" ? "Image" :
                                    change.field === "image_file" ? null :
                                      change.field}
                        </span>
                        <button
                          onClick={() => {
                            // Revert field value
                            setFormData((prev) => ({
                              ...prev,
                              [change.field]: originalData[change.field],
                            }));

                            // If undoing image, clear preview + file
                            if (change.field === "image_path") {
                              setHodPreview(null);
                              setHodImageFile(null);
                            }

                            // Update changes list and auto-exit if empty
                            setChanges((prev) => {
                              const next = prev.filter((_, i) => i !== index);

                              if (next.length === 0) {
                                // 🔥 No more pending changes → exit request mode
                                setShowRequestModal(false);
                                setShowRequest(false);
                                setIsEditing(false);
                                setHasChanges(false);
                                toast.info("All changes reverted.");
                              }

                              return next;
                            });
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
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black font-medium"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

// ✅ Export both properly
export { Sportsfaculties, SportsHOD };
