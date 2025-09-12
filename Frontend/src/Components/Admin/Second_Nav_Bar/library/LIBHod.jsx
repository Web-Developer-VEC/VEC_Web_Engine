import LoadComp from "../../LoadComp";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil } from "lucide-react";

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
  const [showDiscardModal, setShowDiscardModal] = useState(false); // ✅ new discard confirmation modal

  const [changes, setChanges] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({ ...data?.[0] });
  const [originalData, setOriginalData] = useState({ ...data?.[0] });

  useEffect(() => {
    if (data?.[0]) {
      setFormData(data[0]);
      setOriginalData(data[0]);
    }
  }, [data]);

  // ✅ detect changes live
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

  // ✅ Discard changes & reset UI
  const handleDiscardChanges = () => {
    setFormData({ ...originalData }); // revert to original values
    setIsEditing(false);              
    setShowRequest(false);            
    setShowDiscardModal(false); // close modal
    toast.info("Changes discarded");
  };

  // ✅ Confirm request & reset UI
  const handleRequestConfirm = () => {
    console.log("Final request submitted with data:", formData);
    setOriginalData({ ...formData }); // commit changes
    setShowRequestModal(false);
    setShowRequest(false); 
    setIsEditing(false);   
    toast.success("Request submitted successfully!");
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <article className="relative flex flex-col gap-4 bg-prim dark:bg-drkp shadow-xl p-6 rounded-xl items-center text-center font-[Poppins]">
      {/* Toast container */}
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* ✅ Edit Button */}
      {!isEditing && !showRequest && (
        <div className="absolute top-7 right-10">
          <button
            onClick={() => {
              setIsEditing(true);
              setFormData({ ...data?.[0] });
            }}
            className="flex items-center gap-2 px-4 py-2 
                       bg-[#FDCC03] text-black font-medium 
                       rounded-xl shadow-md 
                       hover:bg-yellow-500 hover:shadow-lg 
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
              src={UrlParser(formData?.image_path)}
            />

            {/* ✅ Upload Button styled with label */}
            <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer mt-2">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    setFormData((prev) => ({ ...prev, image_path: previewUrl }));
                  }
                }}
              />
            </label>
          </>
        ) : (
          <img
            className="w-auto h-60 rounded-lg"
            alt="Library HoD"
            src={UrlParser(formData?.image_path)}
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
                onClick={() => setShowDiscardModal(true)} // ✅ open confirm modal
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
                    if (!formData?.education_qualification?.trim())
                      missing.push("Educational Qualification");
                    if (!formData?.message?.trim()) missing.push("Message");
                    if (!formData?.image_path?.trim()) missing.push("Image");

                    if (missing.length > 0) {
                      toast.error(
                        `⚠️ Please fill the following field(s): ${missing.join(", ")}`
                      );
                      return;
                    }

                    const diff = detectChanges();
                    setChanges(diff);
                    setIsEditing(false);
                    setShowRequest(true);
                  }}
                  className="px-4 py-2 bg-[#FDCC03] text-black rounded-lg shadow hover:bg-yellow-500 transition"
                >
                  Save
                </button>
              )}
            </>
          ) : (
            showRequest && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowDiscardModal(true)} // ✅ open confirm modal
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg shadow font-medium transition"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-[#FDCC03] hover:bg-yellow-500 text-black px-4 py-2 rounded-lg shadow font-medium transition"
                >
                  Request
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
              Are you sure you want to discard all your changes? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                No, Keep Editing
              </button>
              <button
                onClick={handleDiscardChanges}
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
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[650px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            <table className="w-full text-center text-sm text-text dark:text-drkt border">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="py-2 border">Action</th>
                  <th className="py-2 border">Section</th>
                </tr>
              </thead>
              <tbody>
                {changes.length > 0 && (
                  <tr className="border">
                    <td className="py-2 text-blue-600 font-semibold">Edited</td>
                    <td className="py-2">Library HoD</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black "
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

export default LIBHod;
