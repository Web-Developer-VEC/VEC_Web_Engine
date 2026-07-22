import { motion } from "framer-motion";
import { Plus, Pencil, Save, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  if (!path) return "";
  return path.startsWith("http") || path.startsWith("blob:")
    ? path
    : `${BASE_URL}${path}`;
};

const LIBFaculty = ({ faculty }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [tempList, setTempList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    if (Array.isArray(faculty)) {
      const normalized = faculty.map((f, index) => ({
        ...f,
        _uid: f._id || f.id || `srv_${index}`,
        image: f.image_path,
      }));

      setFacultyList(normalized);
      setOriginalList(JSON.parse(JSON.stringify(normalized)));
    }
  }, [faculty]);

  const handleChange = (index, field, value) => {
    setTempList((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
    setHasChanges(true);
  };

  const handleImageChange = (index, file) => {
    if (!file) return;

    const imagePath = `/static/images/library/faculty/${file.name}`;

    setTempList((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              image: URL.createObjectURL(file), // preview
              image_path: imagePath, // backend path
              imageFile: file, // 🔥 REQUIRED
            }
          : f,
      ),
    );

    setHasChanges(true);
  };

  const handleEdit = () => {
    setTempList(JSON.parse(JSON.stringify(facultyList)));
    setIsEditing(true);
    setHasChanges(false);
  };
  const handleSave = () => {
    for (let f of tempList) {
      if (
        !f.name?.trim() ||
        !f.educational_qualification?.trim() ||
        !f.designation?.trim() ||
        (!f.image && !f.image_path && !f.imageFile)
      ) {
        toast.error("Please enter all fields");
        return;
      }
    }
    setFacultyList([...tempList]);
    setIsEditing(false);
    setShowRequestBtn(true);
    setHasChanges(false);
    setSelectedForDelete([]);
  };
  const buildFacultyPayload = ({ action, newData, oldData }) => {
    if (action === "Added") {
      return {
        collectionName: "library",
        collection_type: "Faculty_Staff",
        action: "insert",
        title: "Add faculty info",
        meta_data: {
          name: newData.name,
          designation: newData.designation,
          educational_qualification: newData.educational_qualification,
          image_path: newData.image_path || "",
        },
      };
    }

    if (action === "Edited") {
      return {
        collectionName: "library",
        collection_type: "Faculty_Staff",
        action: "update",
        title: "Update faculty info",

        // ✅ ONLY NEW DATA
        meta_data: {
          name: newData.name,
          designation: newData.designation,
          educational_qualification: newData.educational_qualification,
          image_path: newData.image_path || "",
        },

        // ✅ REAL ORIGINAL DATA
        original_data: {
          name: oldData.name,
          designation: oldData.designation,
          educational_qualification: oldData.educational_qualification,
          image_path: oldData.image_path || "",
        },
      };
    }

    if (action === "Deleted") {
      return {
        collectionName: "library",
        collection_type: "Faculty_Staff",
        action: "delete",
        title: "Delete faculty info",
        meta_data: {
          name: newData.name,
        },
      };
    }

    return null;
  };

  const handleCancel = () => {
    setTempList(JSON.parse(JSON.stringify(facultyList)));
    setIsEditing(false);
    setHasChanges(false);
    setSelectedForDelete([]);
  };

  const handleAddNewBox = () => {
    const newBox = {
      _uid: `new_${Date.now()}`, // ✅ TEMP ID
      name: "",
      educational_qualification: "",
      designation: "",
      image: "",
      image_path: "",
    };

    setTempList((prev) => [...prev, newBox]);
    setHasChanges(true);
  };

  const handleRequestConfirm = async () => {
    const changes = getChanges();

    if (!changes.length) {
      toast.warn("No changes to submit");
      return;
    }

    // 1️⃣ BUILD PAYLOAD FIRST
    const payload = changes
      .map((change) =>
        buildFacultyPayload({
          action: change.action,
          newData: change.data,
          oldData: change.oldData,
        }),
      )
      .filter(Boolean);

    // 2️⃣ COLLECT IMAGE FILES AFTER PAYLOAD
    const files = changes
      .map((change) => change.data?.imageFile)
      .filter(Boolean);

    console.log("PAYLOAD:", payload);
    console.log("FILES:", files);

    // 3️⃣ SEND TO BACKEND
    await sendRequest(payload, files);

    setShowRequestModal(false);
    setShowRequestBtn(false);
  };

  const handleDiscardChanges = () => {
    toast.info("Changes discarded");
    setFacultyList(originalList);
    setShowRequestBtn(false);
  };

  const getChanges = () => {
    const changes = [];

    // 🟢 ADDED
    facultyList.forEach((f) => {
      if (!originalList.find((o) => o._uid === f._uid)) {
        changes.push({ action: "Added", data: f });
      }
    });

    // 🔴 DELETED
    originalList.forEach((o) => {
      if (!facultyList.find((f) => f._uid === o._uid)) {
        changes.push({ action: "Deleted", data: o });
      }
    });

    // 🔵 EDITED
    facultyList.forEach((f) => {
      const old = originalList.find((o) => o._uid === f._uid);
      if (old && JSON.stringify(f) !== JSON.stringify(old)) {
        changes.push({ action: "Edited", data: f, oldData: old });
      }
    });

    return changes;
  };

  // ✅ New function to revert individual changes
const handleRevertChange = (change) => {
  if (change.action === "Added") {
    // Remove newly added faculty
    setFacultyList((prev) =>
      prev.filter((f) => f._uid !== change.data._uid)
    );
  } else if (change.action === "Deleted") {
    // Restore deleted faculty
    const original = originalList.find(
      (o) => o._uid === change.data._uid
    );

    if (original) {
      setFacultyList((prev) => [...prev, original]);
    }
  } else if (change.action === "Edited") {
    // Restore original values
    const original = originalList.find(
      (o) => o._uid === change.data._uid
    );

    if (original) {
      setFacultyList((prev) =>
        prev.map((f) =>
          f._uid === original._uid ? original : f
        )
      );
    }
  }
};

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {Array.isArray(facultyList) ? (
        <div className="relative py-16 px-6 font-[Poppins]">
          {/* Header */}
          <div className="flex items-center justify-center mb-4 relative">
            <h2 className="text-4xl font-bold text-accn dark:text-drkt text-center w-full">
              Staff
            </h2>
            <div className="absolute right-4 flex gap-3">
              {!isEditing && (
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-md bg-[#FDCC03] text-text shadow-md hover:bg-[#800000] transition hover:text-prim"
                  onClick={handleEdit}
                >
                  <Pencil size={18} /> Edit
                </button>
              )}
            </div>
          </div>

          {/* Faculty Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(isEditing ? tempList : facultyList).map((fac, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform bg-[#d9d9d9]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] hover:scale-105 border-2 p-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {isEditing && (
                  <input
                    type="checkbox"
                    className="absolute top-2 right-2 w-5 h-5"
                    checked={selectedForDelete.includes(fac)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForDelete((prev) => [...prev, fac]);
                      } else {
                        setSelectedForDelete((prev) =>
                          prev.filter((f) => f !== fac),
                        );
                      }
                    }}
                  />
                )}

                <div className="flex flex-col items-center">
                  <img
                    src={UrlParser(fac.image || fac.image_path)}
                    alt={fac.name}
                    className="w-[55%] mt-4 h-44 m-auto object-cover filter brightness-90 rounded-xl"
                  />
                  {isEditing && (
                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-upload-${index}`}
                        className="hidden"
                        onChange={(e) =>
                          handleImageChange(index, e.target.files[0])
                        }
                      />
                      <label
                        htmlFor={`file-upload-${index}`}
                        className="px-6 py-2 text-text rounded-md shadow-md cursor-pointer 
                        bg-[#fdcc03] transition hover:bg-[#800000] hover:text-prim"
                      >
                        {fac.image_path || fac.image
                          ? "Replace Image"
                          : "Upload Image"}
                      </label>
                    </div>
                  )}
                </div>

                <div className="p-6 text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={fac.name}
                      placeholder="Name"
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                      className="text-[18px] font-bold text-center border-b border-gray-400 focus:outline-none bg-transparent placeholder:text-left"
                    />
                  ) : (
                    <h3 className="text-[18px] font-bold">{fac.name}</h3>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={fac.educational_qualification}
                      placeholder="Educational Qualification"
                      onChange={(e) =>
                        handleChange(
                          index,
                          "educational_qualification",
                          e.target.value,
                        )
                      }
                      className="mt-2 text-center border-b border-gray-400 focus:outline-none bg-transparent placeholder:text-left"
                    />
                  ) : (
                    <p className="mt-2 text-brwn dark:text-drka">
                      {fac.educational_qualification}
                    </p>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={fac.designation}
                      placeholder="Designation"
                      onChange={(e) =>
                        handleChange(index, "designation", e.target.value)
                      }
                      className="text-accn dark:text-drka font-semibold mt-2 text-center border-b border-gray-400 focus:outline-none bg-transparent placeholder:text-left"
                    />
                  ) : (
                    <p className="text-accn dark:text-drka font-semibold mt-2">
                      {fac.designation}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {isEditing && (
              <motion.div
                className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform 
                bg-[#d9d9d9] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                hover:scale-105 border-2 flex items-center justify-center cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={handleAddNewBox}
              >
                <Plus size={50} className="text-gray-600" />
              </motion.div>
            )}
          </div>

          {isEditing && selectedForDelete.length > 0 && (
            <div className="w-full flex justify-center mt-6">
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="px-8 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
              >
                Delete Selected ({selectedForDelete.length})
              </button>
            </div>
          )}

          {isEditing && (
            <div className="w-full flex justify-end mt-6 gap-4">
              <button
                className="px-6 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                onClick={handleCancel}
              >
                Cancel
              </button>
              {hasChanges && (
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-md bg-[#fdcc03] text-text shadow-md hover:bg-[#800000] transition hover:text-prim"
                  onClick={handleSave}
                >
                  Save
                </button>
              )}
            </div>
          )}

          {showRequestBtn && !isEditing && (
            <div className="w-full flex justify-end mt-6 gap-4">
              <button
                className="px-6 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </button>
              <button
                className="flex items-center gap-2 px-6 py-2 bg-[#fdcc03] text-text rounded-lg shadow-md hover:bg-[#800000] transition hover:text-prim"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={18} /> Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative text-center"
          >
            <h3 className="text-xl font-bold mb-4 text-black-600">
              Confirm Delete
            </h3>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedForDelete.length}</span>{" "}
              selected faculty member(s)?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setTempList((prev) =>
                    prev.filter((f) => !selectedForDelete.includes(f)),
                  );
                  setSelectedForDelete([]);
                  setShowBulkDeleteConfirm(false);
                  setHasChanges(true);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-6 py-2 bg-gray-400 text-white rounded-md shadow hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved will go live.
            </p>

            <div className="max-h-[250px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                     <th className="border p-2 text-center w-[70px]">
                          Undo
                      </th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change, idx) => (
                    <tr key={idx} className="border-t">
                      {/* Action */}
                      <td
                        className={`py-1 ${
                          change.action === "Added"
                            ? "text-green-600"
                            : change.action === "Deleted"
                              ? "text-red-600"
                              : "text-blue-600"
                        }`}
                      >
                        {change.action}
                      </td>

                      {/* Section */}
                      <td className="py-1">
                        {change.section || "Library Faculty"}
                      </td>

                      {/* Faculty Name + X button */}
                      <td className="py-1 text-[12px]">
                        <div className="flex items-center justify-center gap-2">
                          <span>{change.data?.name || "Unnamed Faculty"}</span>
                          
                        </div>
                      </td>
                      <td className="py-1 text-[12px]">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRevertChange(change)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                disabled={loading}
                className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
              >
                {loading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LIBFaculty;
