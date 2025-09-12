import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadComp from "../../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  if (!path) return "";
  return path.startsWith("http") || path.startsWith("blob:")
    ? path
    : `${BASE_URL}${path}`;
};

const LIBFacl = ({ faculty }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [tempList, setTempList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (Array.isArray(faculty)) {
      setFacultyList(faculty);
      setOriginalList(faculty);
    }
  }, [faculty]);

  // update text field while editing
  const handleChange = (index, field, value) => {
    setTempList((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
    setHasChanges(true);
  };

  // handle image upload
  const handleImageChange = (index, file) => {
    const imageURL = URL.createObjectURL(file); // temporary preview
    setTempList((prev) =>
      prev.map((f, i) => (i === index ? { ...f, image: imageURL } : f))
    );
    setHasChanges(true);
  };

  const handleEdit = () => {
    setTempList(JSON.parse(JSON.stringify(facultyList))); // deep copy
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleSave = () => {
    // validation: no empty fields
    for (let f of tempList) {
      if (
        !f.name ||
        !f.educational_qualification ||
        !f.designation ||
        !f.image
      ) {
        toast.warning("All fields are required for every faculty!");
        return;
      }
    }
    setFacultyList(tempList);
    setIsEditing(false);
    setShowRequestBtn(true); // ✅ Show request button after save
    setHasChanges(false);
    toast.success("Changes saved successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasChanges(false);
    toast.info("Changes reverted");
  };

  const handleAddNewBox = () => {
    const newBox = {
      name: "",
      educational_qualification: "",
      designation: "",
      image: "",
    };
    setTempList((prev) => [...prev, newBox]);
    setHasChanges(true);
  };

  const handleDelete = (fac) => {
    setFacultyToDelete(fac);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setTempList((prev) => prev.filter((f) => f !== facultyToDelete));
    setShowDeleteConfirm(false);
    setFacultyToDelete(null);
    setHasChanges(true);
    toast.error("Faculty deleted");
  };

  const handleRequestConfirm = () => {
    console.log("Changes requested:", facultyList);
    toast.success("Request submitted successfully!"); // ✅ success toast
    setShowRequestBtn(false); // hide button after request
    setShowRequestModal(false);
    setOriginalList(facultyList); // reset baseline after request
  };

  // ✅ Compute changes for summary
  const getChanges = () => {
    const changes = [];

    // detect added
    facultyList.forEach((f) => {
      if (!originalList.find((o) => o.name === f.name)) {
        changes.push({ action: "Added", data: f });
      }
    });

    // detect deleted
    originalList.forEach((o) => {
      if (!facultyList.find((f) => f.name === o.name)) {
        changes.push({ action: "Deleted", data: o });
      }
    });

    // detect edited
    facultyList.forEach((f) => {
      const old = originalList.find((o) => o.name === f.name);
      if (old) {
        const fieldChanges = {};
        if (f.name !== old.name) {
          fieldChanges.name = { old: old.name, new: f.name };
        }
        if (f.educational_qualification !== old.educational_qualification) {
          fieldChanges.educational_qualification = {
            old: old.educational_qualification,
            new: f.educational_qualification,
          };
        }
        if (f.designation !== old.designation) {
          fieldChanges.designation = {
            old: old.designation,
            new: f.designation,
          };
        }
        if (f.image !== old.image) {
          fieldChanges.image = { old: old.image, new: f.image };
        }
        if (Object.keys(fieldChanges).length > 0) {
          changes.push({ action: "Edited", data: f, fields: fieldChanges });
        }
      }
    });

    return changes;
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {Array.isArray(facultyList) ? (
        <div className="relative py-16 px-6 font-[Poppins]">
          {/* Header with Edit / Save / Cancel */}
          <div className="flex items-center justify-center mb-4 relative">
            {/* Staff Heading */}
            <h2 className="text-4xl font-bold text-accn dark:text-drkt text-center w-full">
              Staff
            </h2>

            {/* Buttons on the right */}
            <div className="absolute right-0 flex gap-3">
              {!isEditing ? (
                <button
                  className="px-6 py-2 rounded-md bg-[#FDCC03] text-black shadow-md hover:bg-[#e6b800] transition"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              ) : (
                <>
                  {hasChanges && (
                    <button
                      className="px-6 py-2 rounded-md bg-yellow-500 text-black shadow-md hover:bg-yellow-400 transition"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  )}
                  <button
                    className="px-6 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
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
                {/* Delete Button (only in edit mode) */}
                {isEditing && (
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(fac)}
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <div className="flex flex-col items-center">
                  <img
                    src={UrlParser(fac?.image)}
                    alt={fac.name}
                    className="w-[55%] mt-4 h-44 m-auto object-cover filter brightness-90 rounded-xl"
                  />

                  {/* Image upload (only in edit mode) */}
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
                        className="px-6 py-2 bg-accn text-white rounded-md shadow-md cursor-pointer 
                        hover:bg-opacity-90 transition text-sm font-semibold"
                      >
                        Upload Image
                      </label>
                    </div>
                  )}
                </div>

                <div className="p-6 text-center">
                  {/* Name field */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={fac.name}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                      className="text-[18px] font-bold text-center border-b border-gray-400 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <h3 className="text-[18px] font-bold">{fac.name}</h3>
                  )}

                  {/* Qualification field */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={fac.educational_qualification}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "educational_qualification",
                          e.target.value
                        )
                      }
                      className="mt-2 text-center border-b border-gray-400 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <p className="mt-2 text-brwn dark:text-drka">
                      {fac.educational_qualification}
                    </p>
                  )}

                  {/* Designation field */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={fac.designation}
                      onChange={(e) =>
                        handleChange(index, "designation", e.target.value)
                      }
                      className="text-accn dark:text-drka font-semibold mt-2 text-center border-b border-gray-400 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <p className="text-accn dark:text-drka font-semibold mt-2">
                      {fac.designation}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* ➕ Add New Faculty Box (only in edit mode) */}
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

          {/* Request Button (appears only after Save) */}
          {showRequestBtn && !isEditing && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-8 py-3 bg-yellow-500 text-black  rounded-lg shadow-md hover:bg-yellow-400 transition"
                onClick={() => setShowRequestModal(true)}
              >
                Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && facultyToDelete && (
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
              <span className="font-semibold">{facultyToDelete.name}</span>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
            {/* Title */}
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            {/* Note */}
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live
              site.
            </p>

            {/* Summary */}
            <div className="max-h-[250px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {getChanges().map((change, idx) => (
                    <tr key={idx} className="border-t">
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
                      <td className="py-1">Library Faculty</td>
                      <td className="py-1 text-[12px] flex flex-col items-start gap-1">
                        {/* Added */}
                        {change.action === "Added" && (
                          <span>
                            New Faculty: <b>{change.data.name}</b>
                          </span>
                        )}

                        {/* Deleted */}
                        {change.action === "Deleted" && (
                          <span>
                            Removed Faculty: <b>{change.data.name}</b>
                          </span>
                        )}

                        {/* Edited */}
                        {change.action === "Edited" &&
                          Object.entries(change.fields).map(([field, val], i) => (
                            <span key={i}>
                              <b>{change.data.name}</b> → {field} changed:{" "}
                              <span className="line-through text-gray-500">
                                {val.old}
                              </span>{" "}
                              →{" "}
                              <span className="text-green-600">{val.new}</span>
                            </span>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LIBFacl;
