import { motion } from "framer-motion";
import { Pencil, Save, Send } from "lucide-react";
import { useState, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const LIBjournalsdetails = ({ data }) => {
  const stats = [
    { icon: "📚" },
    { icon: "🇮🇳" },
    { icon: "🌎" },
    { icon: "💻" },
  ];

  const [journalData, setJournalData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [savedData, setSavedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  useEffect(() => {
    if (data?.length > 0) {
      const init = deepCopy(data[0]);
      setJournalData(init);
      setOriginalData(init);
      setSavedData(init);
    }
  }, [data]);
  const getChangedFields = (current, original) => {
    const changes = {};

    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key]) {
        changes[key] = current[key];
      }
    });

    return changes;
  };
  const getOriginalChangedFields = (current, original) => {
    const originalChanges = {};
    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key]) {
        originalChanges[key] = original[key];
      }
    });
    return originalChanges;
  };

  const handleChange = (key, value) => {
    setJournalData((prev) => {
      const next = deepCopy(prev);
      next[key] = value;
      return next;
    });

    if (value !== "" && value !== null) {
      setHasChanges(true);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setJournalData(deepCopy(savedData));
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSave = () => {
    // ✅ Validate all required fields
    const emptyFields = [];
    Object.entries(journalData).forEach(([key, value]) => {
      if (value === "" || value === null) {
        emptyFields.push(key);
      }
    });

    if (emptyFields.length > 0) {
      toast.error(`❌ Please fill all fields: ${emptyFields.join(", ")}`);
      return;
    }

    setSavedData(deepCopy(journalData));
    setIsEditing(false);
    setHasChanges(false);
    setShowRequestBtn(true);
  };

  const handleDiscard = () => {
    setJournalData(deepCopy(originalData));
    setShowRequestBtn(false);
    setHasChanges(false);
    setIsEditing(false);
    toast.info("Changes discarded");
  };
  const handleRequestConfirm = async () => {
    const metaData = getChangedFields(journalData, originalData);
    const originalMetaData = getOriginalChangedFields(
      journalData,
      originalData,
    );

    if (Object.keys(metaData).length === 0) {
      toast.error("No changes to submit");
      return;
    }

    const payload = {
      collectionName: "library",
      collection_type: "journal",
      action: "update",
      title: "Update journal stats",

      meta_data: metaData, // ✅ NEW DATA
      original_data: originalMetaData, // ✅ OLD DATA
    };

    console.log("📦 JOURNAL PAYLOAD:", payload);

    try {
      await sendRequest([payload]);

      setOriginalData(deepCopy(journalData));
      setSavedData(deepCopy(journalData));

      setShowRequestModal(false);
      setShowRequestBtn(false);

    } catch (err) {
      console.error(err);
    }
  };

  const handleRevertField = (key) => {
    setJournalData((prev) => {
      const next = deepCopy(prev);
      next[key] = originalData[key]; // revert to backend truth
      return next;
    });
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Details Section */}
      {Object.keys(journalData).length > 0 ? (
        <div className="relative mt-12 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
          {!isEditing && (
            <div className="absolute -top-12 right-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#FDCC03] text-text shadow-md hover:bg-[#800000] transition hover:text-prim"
                onClick={handleEdit}
              >
                <Pencil size={18} /> Edit
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 place-items-center gap-8">
            {Object.entries(journalData).map(([key, value], index) => {
              const icons = stats[index] || {};
              return (
                <motion.div
                  key={index}
                  className="flex flex-col w-[32rem] h-[14rem] justify-center items-center bg-prim dark:bg-text p-2 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <span className="text-5xl">{icons.icon}</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="mt-2 p-2 w-32 text-center rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
                    />
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                  <p className="text-text dark:text-prim text-lg mt-2">
                    {key}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Save + Cancel */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
               Save
            </button>
          )}
        </div>
      )}

      {/* Discard + Request */}
      {showRequestBtn && !isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Discard Changes
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Send size={18} /> Request
          </button>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[550px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved will go live.
            </p>
            <div className="max-h-[220px] overflow-y-auto mb-4">
              <table className="w-full text-sm text-center border border-gray-300 dark:text-drkt">
                <thead className="bg-gray-200 dark:bg-drka">
                  <tr>
                    <th className="border py-2">Action</th>
                    <th className="border py-2">Section</th>
                    <th className="border py-2">Changes</th>
                    <th className="border py-2 w-[70px]">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(journalData)
                    .filter(([key, value]) => value !== originalData[key])
                    .map(([key, value], idx) => (
                      <tr
                        key={idx}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="border py-2 font-semibold text-yellow-600">
                          Edited
                        </td>

                        <td className="border py-2">Journal Stats</td>

                        <td className="border py-2 font-semibold">
                          {key}: {originalData[key]} → {value}
                        </td>

                        <td className="border py-2">
                          <button
                            onClick={() => handleRevertField(key)}
                            className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            title="Undo change"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

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
                className="px-4 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
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

const LIBbookdetails = ({ data }) => {
  const stats = [{ icon: "📘" }, { icon: "👥" }, { icon: "🏛" }];

  const [bookData, setBookData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [savedData, setSavedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { sendRequest, loading, error } = useAdminRequest();
  useEffect(() => {
    if (data?.length > 0) {
      const init = deepCopy(data[0]);
      setBookData(init);
      setOriginalData(init);
      setSavedData(init);
    }
  }, [data]);

  const handleChange = (key, value) => {
    setBookData((prev) => {
      const next = deepCopy(prev);
      next[key] = value;
      return next;
    });

    if (value !== "" && value !== null) {
      setHasChanges(true);
    }
  };
  const getChangedFields = (current, original) => {
    const changes = {};
    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key]) {
        changes[key] = current[key];
      }
    });
    return changes;
  };

  const getOriginalChangedFields = (current, original) => {
    const originalChanges = {};
    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key]) {
        originalChanges[key] = original[key];
      }
    });
    return originalChanges;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setBookData(deepCopy(savedData));
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSave = () => {
    // ✅ Validate all required fields
    const emptyFields = [];
    Object.entries(bookData).forEach(([key, value]) => {
      if (value === "" || value === null) {
        emptyFields.push(key);
      }
    });

    if (emptyFields.length > 0) {
      toast.error(`❌ Please fill all fields: ${emptyFields.join(", ")}`);
      return;
    }

    setSavedData(deepCopy(bookData));
    setIsEditing(false);
    setHasChanges(false);
    setShowRequestBtn(true);
  };

  const handleDiscard = () => {
    setBookData(deepCopy(originalData));
    setShowRequestBtn(false);
    setHasChanges(false);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  const handleRequestConfirm = async () => {
    const metaData = getChangedFields(bookData, originalData);
    const originalMetaData = getOriginalChangedFields(bookData, originalData);

    if (Object.keys(metaData).length === 0) {
      toast.error("No changes to submit");
      return;
    }

    const payload = {
      collectionName: "library",
      collection_type: "books",
      action: "update", // ✅ FIXED
      title: "Update book stats",

      meta_data: metaData, // ✅ NEW DATA ONLY
      original_data: originalMetaData, // ✅ OLD DATA ONLY
    };

    console.log("📦 BOOK PAYLOAD:", payload);

    try {
      await sendRequest([payload]);

      setOriginalData(deepCopy(bookData));
      setSavedData(deepCopy(bookData));

      setShowRequestModal(false);
      setShowRequestBtn(false);

    } catch (err) {
      console.error(err);
    }
  };

  const handleRevertField = (key) => {
    setBookData((prev) => {
      const next = deepCopy(prev);
      next[key] = originalData[key]; // revert to backend truth
      return next;
    });
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Details Section */}
      {Object.keys(bookData).length > 0 ? (
        <div className="relative mt-12 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
          {!isEditing && (
            <div className="absolute -top-12 right-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#FDCC03] text-text shadow-md hover:bg-[#800000] transition hover:text-prim"
                onClick={handleEdit}
              >
                <Pencil size={18} /> Edit
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 place-items-center gap-8">
            {Object.entries(bookData).map(([key, value], index) => {
              const icons = stats[index] || {};
              return (
                <motion.div
                  key={index}
                  className="flex flex-col w-[32rem] h-[14rem] justify-center items-center bg-prim dark:bg-text p-2 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <span className="text-5xl">{icons.icon}</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="mt-2 p-2 w-32 text-center rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white focus:outline-none"
                    />
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                  <p className="text-text dark:text-prim text-lg mt-2">
                    {key}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      {/* Save + Cancel */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
            >
               Save
            </button>
          )}
        </div>
      )}

      {/* Discard + Request */}
      {showRequestBtn && !isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Discard Changes
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
          >
            <Send size={18} /> Request
          </button>
        </div>
      )}
      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[550px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Request
            </h2>

            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved will go live.
            </p>

            <div className="max-h-[220px] overflow-y-auto mb-4">
              <table className="w-full text-sm text-center border border-gray-300 dark:text-drkt">
                <thead className="bg-gray-200 dark:bg-drka">
                  <tr>
                    <th className="border py-2">Action</th>
                    <th className="border py-2">Section</th>
                    <th className="border py-2">Changes</th>
                    <th className="border py-2 w-[70px]">Undo</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(bookData)
                    .filter(([key, value]) => value !== originalData[key])
                    .map(([key, value], idx) => (
                      <tr
                        key={idx}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="border py-2 font-semibold text-yellow-600">
                          Edited
                        </td>

                        <td className="border py-2">Book Stats</td>

                        <td className="border py-2 font-semibold">
                          {key}: {originalData[key]} → {value}
                        </td>

                        <td className="border py-2">
                          <button
                            onClick={() => handleRevertField(key)}
                            className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            title="Undo change"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

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
                className="px-4 py-2 rounded bg-[#fdcc03] hover:bg-[#800000] text-text hover:text-prim"
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

export { LIBjournalsdetails, LIBbookdetails };