import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";
import { Pencil, Send, Save } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const LibraryIntro = ({ about }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { sendRequest, loading, error } = useAdminRequest();
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [editBackup, setEditBackup] = useState(null);

  useEffect(() => {
    if (about?.[0]) {
      const freshData = {
        vision: about[0]?.vision || "",
        mission: about[0]?.mission || "",
        Area: about[0]?.Area || "",
        no_of_books: about[0]?.no_of_books || "",
        no_of_titles: about[0]?.no_of_titles || "",
        no_of_journals: about[0]?.no_of_journals || "",
        no_of_online_journals: about[0]?.no_of_online_journals || "",
      };
      setFormData(freshData);
      setOriginalData(freshData);
    }
  }, [about]);

  const isChanged = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const buildLibraryPayload = ({
    action,
    formData,
    originalData,
    generalInstructions,
  }) => {
    const original = {... originalData, general_instructions: generalInstructions || []};
    const meta = {... formData, general_instructions: generalInstructions || []};

    // 🔵 UPDATE

    return {
      collectionName: "library",
      collection_type: "about_the_library",
      action: "update",
      title: "update about library",
      meta_data: meta,
      original_data: original
    };
  };

  const SECTION_FIELD_MAP = {
    "About Library": [
      "Area",
      "no_of_books",
      "no_of_titles",
      "no_of_journals",
      "no_of_online_journals",
    ],
    Vision: ["vision"],
    Mission: ["mission"],
  };

  const handleRevertSection = (sectionLabel) => {
    if (!originalData) return;

    const fields = SECTION_FIELD_MAP[sectionLabel];

    setFormData((prev) => {
      const updated = { ...prev };
      fields.forEach((field) => {
        updated[field] = originalData[field];
      });
      return updated;
    });
  };

  const changeList = React.useMemo(() => {
    if (!formData || !originalData) return [];

    return Object.entries(SECTION_FIELD_MAP)
      .filter(([_, fields]) =>
        fields.some((field) => formData[field] !== originalData[field]),
      )
      .map(([sectionName]) => ({
        action: "edit",
        section: "library-about",
        label: sectionName,
      }));
  }, [formData, originalData]);
  const hasLibraryChanges = changeList.length > 0;

  const handleRequestConfirm = async () => {
    // Validate required fields before submission
    if (!validateRequiredFields()) {
      return;
    }

    let action = "update";

    // If originalData is missing → INSERT
    if (!originalData) {
      action = "insert";
    }

    const payload = buildLibraryPayload({
      action,
      formData,
      originalData,
      generalInstructions: about?.[0]?.general_instructions,
    });

    if (!payload) {
      toast.warn("No changes to submit");
      return;
    }

    console.log("📦 Final Library Payload:", payload);

    try {
      // 🔥 THIS WAS MISSING
      const result = await sendRequest([payload]);

      if (result) {
        setShowRequestModal(false);
        setShowRequest(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiscardConfirm = () => {
    setFormData(originalData);
    setShowRequest(false);
    setIsEditing(false);
    setShowDiscardModal(false);
    toast.info("Changes discarded");
  };

  const validateRequiredFields = () => {
    const requiredFields = [
      "vision",
      "mission",
      "Area",
      "no_of_books",
      "no_of_titles",
      "no_of_journals",
      "no_of_online_journals",
    ];

    const emptyFields = [];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        emptyFields.push(field.split("_").join(" ")); 
      }
    });

    if (emptyFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${emptyFields.join(", ")}`
      );
      return false;
    }

    return true;
  };

  if (!about || !formData) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-wrap items-center justify-start px-3 sm:px-5 md:px-10 py-6 sm:py-10 font-[Poppins]">
        {/* Edit Button */}
        <div className="w-full flex justify-end p-4 space-x-3">
          {!isEditing && (
            <button
              className="bg-[#FDCC03] text-text flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:bg-[#800000] transition hover:text-prim"
              onClick={() => {
                setEditBackup(formData);
                setIsEditing(true);
              }}
            >
              <Pencil size={18} /> Edit
            </button>
          )}
        </div>

        {/* ========= Main Content ========= */}
        <div className="max-w-7xl self-start basis-full w-full rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* Text Content */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-brwn dark:text-drkt font-extrabold">
              ABOUT THE LIBRARY
            </h1>

            <p className="text-sm sm:text-base text-justify md:text-lg leading-relaxed">
              The college library is located in the Bill Gates Block, spanning
              the Ground and First floors. With a total area of{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="Area"
                  value={formData.Area}
                  onChange={handleChange}
                  className="border p-1 rounded w-24 bg-gray-200"
                />
              ) : (
                <span className="font-semibold text-text dark:text-drkt">
                  {formData.Area}
                </span>
              )}
              , it is a spacious, well-ventilated space. Our library houses over{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="no_of_books"
                  value={formData.no_of_books}
                  onChange={handleChange}
                  className="border p-1 rounded w-24 bg-gray-200"
                  required
                />
              ) : (
                <span className="font-semibold text-text dark:text-drkt">
                  {formData.no_of_books}
                </span>
              )}{" "}
              books and{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="no_of_titles"
                  value={formData.no_of_titles}
                  onChange={handleChange}
                  className="border p-1 rounded w-24 bg-gray-200"
                  required
                />
              ) : (
                <span className="font-semibold text-text dark:text-drkt">
                  {formData.no_of_titles} titles
                </span>
              )}{" "}
              across various disciplines.
            </p>

            <p className="text-sm sm:text-base text-justify md:text-lg leading-relaxed">
              Additionally, we offer access to{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="no_of_journals"
                  value={formData.no_of_journals}
                  onChange={handleChange}
                  className="border p-1 rounded w-24 bg-gray-200"
                  required
                />
              ) : (
                <span className="font-semibold text-text dark:text-drkt">
                  {formData.no_of_journals} Journals
                </span>
              )}{" "}
              and over{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="no_of_online_journals"
                  value={formData.no_of_online_journals}
                  onChange={handleChange}
                  className="border p-1 rounded w-24 bg-gray-200"
                  required
                />
              ) : (
                <span className="font-semibold text-text dark:text-drkt">
                  {formData.no_of_online_journals} online journals
                </span>
              )}
              . The library follows the Universal Decimal Classification Scheme
              and operates on an Open Access System.
            </p>
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <img
              src={UrlParser(
                "/static/images/library/library_images/Library+front+pic.webp",
              )}
              className="w-full h-64 sm:h-80 md:h-full object-cover"
              alt="Library"
            />
          </div>
        </div>

        {/* ========= Vision & Mission ========= */}
        <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center mt-[45px] w-full">
          <div className="lg:basis-[49%] border-l-4 p-4 border-secd dark:border-drks rounded-xl w-full bg-prim dark:bg-drkb">
            <p className="text-[#800000] text-[20px] font-semibold mb-3 font-poppins border-b-[2px] border-secd inline-block pb-1">
              Vision
            </p>
            {isEditing ? (
              <textarea
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                className="w-full border p-2 rounded bg-gray-200 text-sm sm:text-base"
                rows={7}
                required
              />
            ) : (
              <p className="text-sm sm:text-base text-black-800 leading-relaxed text-justify">
                {formData.vision}
              </p>
            )}
          </div>

          <div className="lg:basis-[49%] border-l-4 p-4 border-secd dark:border-drks rounded-xl w-full bg-prim dark:bg-drkb">
            <p className="text-[#800000] text-[20px] font-semibold mb-3 font-poppins border-b-[2px] border-secd inline-block pb-1">
              Mission
            </p>
            {isEditing ? (
              <textarea
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                className="w-full border p-2 rounded bg-gray-200 text-sm sm:text-base"
                rows={7}
                required
              />
            ) : (
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed text-justify">
                {formData.mission}
              </p>
            )}

            {/* ✅ Buttons */}
            {!isEditing && showRequest && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowDiscardModal(true)}
                  className="bg-gray-400 hover:bg-gray-500 text-prim px-4 py-2 rounded-lg shadow transition"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-[#FDCC03] hover:bg-[#800000] text-text flex items-center gap-2 px-4 py-2 rounded-lg shadow transition hover:text-prim"
                >
                  <Send size={18} /> Request
                </button>
              </div>
            )}

            {isEditing && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="bg-gray-400 text-prim px-4 py-2 rounded-lg shadow-md hover:bg-gray-500 transition"
                  onClick={() => {
                    setFormData(editBackup);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                {isChanged && (
                  <button
                    className="bg-[#FDcc03] text-text flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:bg-[#800000] transition hover:text-prim"
                    onClick={() => {
                      if (validateRequiredFields()) {
                        setIsEditing(false);
                        setShowRequest(true);
                      }
                    }}
                  >
                     Save
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========= General Instructions (STATIC) ========= */}
        <div className="h-auto py-10 px-4 sm:px-6 flex flex-col items-center text-center w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accn dark:text-drkt mb-6 sm:mb-10">
            GENERAL INSTRUCTIONS
          </h2>

          <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {about[0]?.general_instructions?.map((instruction, index) => (
              <motion.div
                key={index}
                className="relative dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-lg shadow-md sm:shadow-lg p-4 sm:p-6 flex items-center transition-all duration-500"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#800000] text-white font-bold rounded-full text-sm sm:text-lg">
                    {index + 1}
                  </span>
                  <p className="text-sm sm:text-base md:text-lg text-left">
                    {instruction}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[650px]">
            <h2 className="text-lg font-semibold mb-2 dark:text-drkt">
              Final Request
            </h2>

            <p className="text-red-600 text-sm mb-4">
              <span className="font-medium">Note:</span> Your changes will stay
              pending until approved by the superior admin.
            </p>

            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Changes</th>
                  <th className="border p-2">Undo</th>
                </tr>
              </thead>

              <tbody>
                {changeList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4">
                      No pending changes
                    </td>
                  </tr>
                ) : (
                  changeList.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 text-blue-600 capitalize">
                        {item.action}
                      </td>

                      <td className="p-2">{item.section}</td>

                      <td className="p-2 font-medium">{item.label}</td>

                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRevertSection(item.label)}
                          className="text-red-600 hover:text-red-800"
                          title="Undo all library changes"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestConfirm}
                disabled={loading || !hasLibraryChanges}
                className="px-4 py-2 bg-[#FDCC03] hover:bg-[#800000] text-text hover:text-prim rounded-md"
              >
                {loading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Discard Changes?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to discard all unsaved changes? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded bg-gray-400 text-prim"
              >
                No
              </button>
              <button
                onClick={handleDiscardConfirm}
                className="px-4 py-2 rounded bg-red-600 text-prim"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </>
  );
};

export default LibraryIntro;
