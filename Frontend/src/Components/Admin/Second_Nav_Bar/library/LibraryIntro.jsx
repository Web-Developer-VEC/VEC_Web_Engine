import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";
import { ArrowDown } from "lucide-react"; 
import { ToastContainer, toast } from "react-toastify"; // ✅ Toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Toast CSS

const LibraryIntro = ({ about }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  // ✅ State
  const [isEditing, setIsEditing] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // ✅ Sync with about data whenever it changes
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

  // ✅ Detect if any changes
  const isChanged =
    JSON.stringify(formData) !== JSON.stringify(originalData);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Confirm request
  const handleRequestConfirm = () => {
    console.log("Final request submitted with data:", formData);
    setShowRequestModal(false);
    setShowRequest(false);
    toast.success("✅ Final request submitted for admin approval!", {
      position: "bottom-right",
      autoClose: 3000,
    });
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
              className="bg-[#FDCC03] text-black  px-4 py-2 rounded-lg shadow-md hover:bg-[#e6b800] transition"
              onClick={() => {
                setIsEditing(true);
                toast.info("✏️ Editing mode enabled");
              }}
            >
              Edit
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
              , it is a spacious, well-ventilated space. Our library houses
              over{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="no_of_books"
                  value={formData.no_of_books}
                  onChange={handleChange}
                  className="border p-1 rounded w-24 bg-gray-200"
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
                />
              ) : (
                <span className="font-semibold text-text dark:text-drkt">
                  {formData.no_of_online_journals} online journals
                </span>
              )}
              . The library follows the Universal Decimal Classification
              Scheme and operates on an Open Access System.
            </p>
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <img
              src={UrlParser(
                "/static/images/library/library_images/Library+front+pic.webp"
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
                className="w-full border rounded p-2 bg-gray-200"
                rows={7}
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
                className="w-full border rounded p-2 bg-gray-200"
                rows={7}
              />
            ) : (
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed text-justify">
                {formData.mission}
              </p>
            )}

            {/* ✅ Buttons go here now */}
            {!isEditing && showRequest && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowRequestModal(true);
                    toast.info("📩 Request review before final submission");
                  }}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg shadow"
                >
                  Request
                </button>
              </div>
            )}

            {isEditing && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-500 transition"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(originalData); // reset
                    toast.warn("❌ Changes discarded");
                  }}
                >
                  Cancel
                </button>
                {isChanged && (
                  <button
                    className="bg-[#FDcc03] text-black px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition"
                    onClick={() => {
                      console.log("Updated Data:", formData);
                      setIsEditing(false);
                      setShowRequest(true);
                      toast.success("💾 Changes saved. Submit request to confirm.");
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

      {/* ✅ Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[530px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt">
                <thead>
                  <tr>
                    <th className="py-1">Action</th>
                    <th className="py-1">Section</th>
                    <th className="py-1 text-center">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 text-blue-600">✎ Edited</td>
                    <td className="py-1">Library Intro</td>
                    <td className="py-1 text-[12px] flex flex-col items-center">
                      Previous Data <ArrowDown /> Updated Data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  toast.warn("❌ Final request cancelled");
                }}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestConfirm}
                className="px-4 py-2 rounded bg-[#FDCC03] hover:bg-yellow-500 text-black"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast container */}
      <ToastContainer position="bottom-right" autoClose={2000} />
    </>
  );
};

export default LibraryIntro;
