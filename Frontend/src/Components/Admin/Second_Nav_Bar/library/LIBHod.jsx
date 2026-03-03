import LoadComp from "../../LoadComp";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Save, Send } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${BASE_URL}${path}`;
};

const LIBHod = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  const [formData, setFormData] = useState({ ...data?.[0] });
  const [originalData, setOriginalData] = useState({ ...data?.[0] });
  const [editBackup, setEditBackup] = useState(null); // ✅ backup for current edit session
  const [hodPic, setHodPic] = useState(null);
  console.log("Hod Pic", hodPic);
  const [changeList, setChangeList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);


  useEffect(() => {
    if (data?.[0]) {
      const clone = JSON.parse(JSON.stringify(data[0]));
      setFormData(clone);
      setOriginalData(clone);
    }
  }, [data]);

  // ✅ detect if changed compared to original
  const isImageChanged = hodPic !== null;

  const isChanged =
    JSON.stringify(formData) !== JSON.stringify(originalData) ||
    isImageChanged;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ get changed fields
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

  // ✅ discard full changes (after Save, before Request)
  const handleDiscardConfirm = () => {
    setFormData(JSON.parse(JSON.stringify(originalData)));
    setHodPic(null);
    setImagePreview(null);
    setIsEditing(false);
    setShowRequest(false);
    setShowDiscardModal(false);
    setChangeList([]);
    toast.info("❌ Changes discarded");
  };

  // ✅ confirm final request
  const handleRequestConfirm = async () => {
    const changes = buildHodChangeList(formData, originalData);


    if (changes.length === 0) {
      toast.warn("No changes to submit");
      return;
    }

    const payload = {
      collectionName: "library",
      collection_type: "HOD",
      action: "update",
      title: "update in hod",

      original_data: {
        name: originalData.name,
        image_path: originalData.image_path,
        designation: originalData.designation,
        education_qualification: originalData.education_qualification,
        message: originalData.message,
      },

      meta_data: {
        name: formData.name,
        image_path: newImagePath,
        designation: formData.designation,
        education_qualification: formData.education_qualification,
        message: formData.message,
      },
    };

    console.log("📦 FINAL HOD PAYLOAD:", payload);

    try {
      await sendRequest(payload, hodPic);

      toast.success("✅ Request submitted successfully!");
      setShowRequestModal(false);
      setShowRequest(false);
      setIsEditing(false);
      setOriginalData(JSON.parse(JSON.stringify(formData))); // commit local state (deep clone)
      setHodPic(null);
      setImagePreview(null);
    } catch (err) {
      toast.error("❌ Failed to submit request");
    }
  };

  const buildHodChangeList = (formData, originalData) => {
    const fieldLabels = {
      name: "Name",
      designation: "Designation",
      education_qualification: "Education Qualification",
      message: "Message",
    };

    const changes = Object.keys(fieldLabels)
      .filter((key) => formData[key] !== originalData[key])
      .map((key) => ({
        key,
        action: "Edit",
        section: "Library HOD",
        label: fieldLabels[key],
        oldValue: originalData[key],
        newValue: formData[key],
      }));

    // ✅ manually detect image change
    if (hodPic) {
      changes.push({
        key: "image_path",
        action: "Edit",
        section: "Library HOD",
        label: "Profile Image",
        oldValue: originalData.image_path,
        newValue: hodPic.name,
      });
    }

    return changes;
  };

  const newImagePath = hodPic
    ? `/static/images/library/hod/${hodPic.name}`
    : originalData.image_path;

  useEffect(() => {
    if (showRequestModal && changeList.length === 0) {
      setShowRequestModal(false);
      setShowRequest(false);
      toast.info("All changes reverted");
    }
  }, [changeList]);

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

      {/* ✅ Edit Button */}
      {!isEditing && (
        <div className="absolute top-7 right-10">
          <button
            onClick={() => {
              setEditBackup(JSON.parse(JSON.stringify(formData))); // deep-copy backup
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 
                       bg-[#FDCC03] text-text font-medium 
                       rounded-xl shadow-md 
                       hover:bg-[#800000] hover:shadow-lg hover:text-prim
                       active:scale-95 transition-all duration-200"
          >
            <Pencil size={18} />
            <span>Edit</span>
          </button>
        </div>
      )}

      {/* ✅ Image */}
      <div className="w-full md:w-1/8 flex flex-col justify-center items-center gap-2">
        {isEditing ? (
          <>
            <img
              className="w-auto h-60 rounded-lg"
              alt="Library HoD"
              src={imagePreview || UrlParser(formData?.image_path)}
            />

            <label className="bg-[#FDCC03] text-text px-3 py-1 rounded cursor-pointer mt-2 hover:bg-[#800000] hover:text-prim">
              Replace
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const previewUrl = URL.createObjectURL(file);
                  setImagePreview(previewUrl);   // ✅ only for UI
                  setHodPic(file);               // ✅ actual file
                }}
              />
            </label>
          </>
        ) : (
          <img
            className="w-auto h-60 rounded-lg"
            alt="Library HoD"
            src={imagePreview || UrlParser(formData?.image_path)}
          />
        )}
      </div>

      {/* ✅ Editable Info */}
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
            name="designation"
            value={formData?.designation}
            onChange={handleChange}
            className="text-lg border p-1 rounded mb-2 w-full"
          />
        ) : (
          <p className="text-lg text-accn dark:text-drka mb-2">
            {formData?.designation}
          </p>
        )}

        {isEditing ? (
          <input
            type="text"
            name="education_qualification"
            value={formData?.education_qualification}
            onChange={handleChange}
            className="text-md border p-1 rounded mb-2 w-full"
          />
        ) : (
          <p className="text-md mb-2 text-brwn dark:text-drka">
            {formData?.education_qualification}
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

        {/* ✅ Bottom Buttons */}
        <div className="mt-4 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setFormData(editBackup ? JSON.parse(JSON.stringify(editBackup)) : JSON.parse(JSON.stringify(originalData)));
                  setHodPic(null);
                  setImagePreview(null);
                  setIsEditing(false);
                  toast.info("Changes reverted");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
              >
                Cancel
              </button>

              {isChanged && (
                <button
                  onClick={() => {
                    const changes = buildHodChangeList(formData, originalData);

                    if (changes.length === 0) {
                      toast.warn("No changes detected");
                      return;
                    }

                    setChangeList(changes); // 🔒 freeze changes
                    setIsEditing(false);
                    setShowRequest(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FDCC03] text-text rounded-lg shadow-md hover:bg-[#800000] transition hover:text-prim"
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
                  className="flex items-center gap-2 bg-[#FDCC03] hover:bg-[#800000] text-text px-4 py-2 rounded-lg shadow-md font-medium transition hover:text-prim"
                >
                  <Send size={18} />
                  <span>Request</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ✅ Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Discard Changes?</h2>
            <p className="text-sm text-gray-600 dark:text-drkt mb-6">
              Are you sure you want to discard all your changes? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                No, Keep Editing
              </button>
              <button
                onClick={handleDiscardConfirm}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <h2 className="text-xl font-bold mb-2">Final Request</h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will remain pending until approved by the
              superior admin.
            </p>

            {/* Table */}
            <table className="w-full text-sm border">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-2 border">Action</th>
                  <th className="p-2 border">Section</th>
                  <th className="p-2 border">Changes</th>
                  <th className="p-2 border">Undo</th>
                </tr>
              </thead>

              <tbody>
                {changeList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No pending changes
                    </td>
                  </tr>
                ) : (
                  changeList.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 border text-blue-600 font-semibold text-center">
                        {item.action}
                      </td>

                      <td className="p-2 border text-center">{item.section}</td>

                      <td className="p-2 border text-center font-medium">
                        {item.label}
                      </td>

                      <td className="p-2 border text-center">
                        <button
                          className="text-red-500 hover:text-red-700 text-lg"
                          onClick={() => {
                            // 🔹 revert form data
                            setFormData((prev) => ({
                              ...prev,
                              [item.key]: originalData[item.key],
                            }));

                            // 🔹 remove from table
                            setChangeList((prev) =>
                              prev.filter((change) => change.key !== item.key),
                            );
                          }}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestConfirm}
                disabled={changeList.length === 0}
                className={`px-4 py-2 rounded flex items-center gap-2
            ${changeList.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#FDCC03] hover:bg-[#800000] text-text hover:text-white"
                  }`}
              >
                <Send size={16} /> Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default LIBHod;
