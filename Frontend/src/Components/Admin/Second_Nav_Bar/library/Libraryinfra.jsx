import React from "react";
import {motion} from "framer-motion";
import { Plus, X, Pencil,ArrowDown,Trash2,Save } from "lucide-react";
import {Tilt} from "react-tilt";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";
import {useState, useEffect} from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import LIBMemb from "./LIBMemb"; // Adjust path if needed
import LIBFacl from "./LIBFacl";
import LIBHod from "./LIBHod";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Object3D } from "three";

const LibrarySections = ({data, lib}) => {

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
    
const LIBFea = ({ data }) => {
  const [rows, setRows] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [showRequestButton, setShowRequestButton] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState(null);

  useEffect(() => {
    if (Array.isArray(data)) {
      setRows(data);
    }
  }, [data]);

  const handleEdit = (idx) => {
    setEditRow(idx);
    setEditedValues(rows[idx]);
  };

  const handleSave = (idx) => {
    if (!editedValues.name || !editedValues.url) {
      toast.warning("⚠️ All fields are required!");
      return;
    }
    const oldRow = rows[idx];
    const updated = [...rows];
    updated[idx] = editedValues;
    setRows(updated);
    setEditRow(null);

    setChangeSummary({ old: oldRow, new: editedValues, index: idx + 1 });
    setShowRequestButton(true);
    toast.success("✅ Row updated!");
  };

  const handleChange = (e, field) => {
    setEditedValues({ ...editedValues, [field]: e.target.value });
  };

  const confirmDelete = () => {
    const updated = rows.filter((_, i) => i !== deleteIndex);
    setRows(updated);
    setDeleteIndex(null);
    toast.error("🗑️ Row deleted!");
  };

  const handleAddRow = () => {
    const newRow = { name: "", url: "" };
    setRows([...rows, newRow]);
    setEditRow(rows.length);
    setEditedValues(newRow);
    toast.info("➕ New row added (edit to save)");
  };

  const handleRequestConfirm = () => {
    console.log("Final Request Submitted:", changeSummary);
    setShowRequestModal(false);
    setShowRequestButton(false);
    toast.success("📩 Request submitted!");
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="block overflow-x-auto px-4 sm:px-8 py-10 font-[Poppins] relative">
      {rows.length > 0 && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#800000] text-center mb-8">
            Some of E-books Download Websites
          </h2>

          <div className="flex justify-center md:justify-start">
            <table className="lg:w-full w-[600px] mx-auto border border-gray-300 text-center text-sm relative">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">S. No</th>
                  <th className="border p-2">E-Book Source</th>
                  <th className="border p-2">Link</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{idx + 1}</td>
                    <td className="border p-2">
                      {editRow === idx ? (
                        <input
                          className="w-full p-2 rounded bg-gray-100 border"
                          value={editedValues.name}
                          onChange={(e) => handleChange(e, "name")}
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="border p-2">
                      {editRow === idx ? (
                        <input
                          className="w-full p-2 rounded bg-gray-100 border"
                          value={editedValues.url}
                          onChange={(e) => handleChange(e, "url")}
                        />
                      ) : (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {row.url}
                        </a>
                      )}
                    </td>
                    <td className="border p-2">
                      {editRow === idx ? (
                        <button
                          onClick={() => handleSave(idx)}
                          className="text-green-600"
                        >
                          <Save />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(idx)}
                            className="text-blue-600 mr-2"
                          >
                            <Pencil />
                          </button>
                          <button
                            onClick={() => setDeleteIndex(idx)}
                            className="text-red-600"
                          >
                            <Trash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="4" className="border p-2 text-center">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 mx-auto"
                    >
                      <Plus size={18} /> Add Row
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {showRequestButton && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
              >
                Request
              </button>
            </div>
          )}

          {deleteIndex !== null && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            bg-white p-6 rounded-lg shadow-lg border z-50 w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this row?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteIndex(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {showRequestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[530px]">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-drkt">
                  Final Request for the Changes
                </h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the superior admin. 
                  Once approved, they will be applied automatically to the live site.
                </p>
                {changeSummary && (
                  <div className="max-h-[200px] overflow-y-auto mb-4">
                    <table className="w-full text-center text-gray-800 dark:text-drkt text-sm">
                      <thead>
                        <tr>
                          <th className="py-1">Action</th>
                          <th className="py-1">Row</th>
                          <th className="py-1 text-center">Changes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1 text-blue-600">✎ Edited</td>
                          <td className="py-1">Row {changeSummary.index}</td>
                          <td className="py-1 text-[12px] flex flex-col items-center">
                            <span>{changeSummary.old.name} | {changeSummary.old.url}</span>
                            <ArrowDown className="my-1" />
                            <span>{changeSummary.new.name} | {changeSummary.new.url}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestConfirm}
                    className="px-4 py-2 rounded bg-[#800000] text-white hover:bg-[#a00000]"
                  >
                    Final Request
                  </button>
                </div>
              </div>
            </div>
          )}

          <ToastContainer position="bottom-right" autoClose={2000} />
        </>
      )}
    </div>
  );
};

function LIBInstr({ data }) {
  const [members, setMembers] = useState(data || []);
  const [originalMembers, setOriginalMembers] = useState(data || []);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // 🔹 Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Handle adding inline new member
  const handleAddInlineMember = () => {
    const newMember = { name: "", designation: "", isNew: true };
    setMembers([...members, newMember]);
    setHasChanges(true);
    setLastAction({
      type: "Added",
      section: "Library Advisory Committee",
      changes: "New member (unspecified)",
    });
  };

  const handleDelete = () => {
    if (memberToDelete === null) return;
    const deleted = members[memberToDelete];
    const updated = members.filter((_, i) => i !== memberToDelete);
    setMembers(updated);
    setShowDeleteConfirm(false);
    setHasChanges(true);
    setLastAction({
      type: "Deleted",
      section: "Library Advisory Committee",
      changes: `${deleted.name || "Unnamed"} - ${deleted.designation || ""}`,
    });
    toast.info("Member deleted");
    setMemberToDelete(null);
  };

  const handleEditChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
    setHasChanges(true);
    setLastAction({
      type: "Edited",
      section: "Library Advisory Committee",
      changes: `${updated[index].name} - ${updated[index].designation}`,
    });
  };

  const handleCancelEdit = () => {
    setMembers(originalMembers); // revert to backup
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSaveChanges = () => {
    setOriginalMembers(members); // commit changes
    setIsEditing(false);
    setHasChanges(false);
    setShowRequestBtn(true); // show request button
    toast.success("Changes saved, please submit request!");
  };

  const handleRequest = () => setShowRequestModal(true);

  const handleRequestConfirm = () => {
    setShowRequestModal(false);
    setShowRequestBtn(false);
    toast.success("Request submitted successfully!");
  };

  return (
    <>
      <div className="flex flex-col lg:px-0 mt-8 relative">
        {/* Top right buttons */}
        {!isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              setOriginalMembers([...members]); // backup before editing
            }}
            className="absolute top-0 right-3 px-4 py-2 rounded-lg bg-yellow-500 text-black shadow-lg hover:bg-yellow-400 transition"
          >
            Edit
          </button>
        ) : (
          <div className="absolute top-0 right-3 flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold shadow-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-black shadow-lg hover:bg-yellow-400 transition"
              >
                Save
              </button>
            )}
          </div>
        )}

        {/* Heading */}
        <p className="text-2xl font-poppins text-accn dark:text-drkt font-semibold mb-4">
          LIBRARY ADVISORY COMMITTEE MEMBERS
        </p>

        {/* Members list */}
        <div className="flex flex-wrap gap-4 justify-center">
          {members.map((adv, i) => (
            <div
              className={`relative md:basis-2/5 grow py-2 px-4 rounded-xl border border-transparent hover:border-l-4 border-secd dark:border-drks
                bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                transition-colors duration-300 ease-in`}
              key={i}
            >
              {/* Delete button (only in edit mode) */}
              {isEditing && (
                <button
                  onClick={() => {
                    setMemberToDelete(i);
                    setShowDeleteConfirm(true);
                  }}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {/* Editable fields */}
              {isEditing ? (
                <>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={adv.name}
                    onChange={(e) =>
                      handleEditChange(i, "name", e.target.value)
                    }
                    className="w-full mb-2 p-1 border rounded-md dark:bg-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Enter designation"
                    value={adv.designation}
                    onChange={(e) =>
                      handleEditChange(i, "designation", e.target.value)
                    }
                    className="w-full p-1 border rounded-md dark:bg-gray-800 text-sm"
                  />
                </>
              ) : (
                <>
                  <p className="text-xl font-poppi max-sm:text-base">
                    {adv.name}
                  </p>
                  <p className="text-sm text-accn dark:text-drka font-poppi max-sm:text-xs">
                    {adv.designation}
                  </p>
                </>
              )}
            </div>
          ))}

          {/* + Box appears only in Edit Mode (inline add) */}
          {isEditing && (
            <div
              onClick={handleAddInlineMember}
              className={`md:basis-2/5 grow py-2 px-4 rounded-xl flex items-center justify-center cursor-pointer
                border-2 border-dashed border-secd dark:border-drks
                bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                transition-colors duration-300 ease-in`}
            >
              <Plus size={32} className="text-accn dark:text-drka" />
            </div>
          )}
        </div>

        {/* Request button (appears only after Save) */}
        {showRequestBtn && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleRequest}
              className="px-6 py-2 rounded-lg bg-secd text-black hover:bg-opacity-90"
            >
              Request
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1000]">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {members[memberToDelete]?.name}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[530px]">
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
                  {lastAction && (
                    <tr>
                      <td className="py-1 text-blue-600">
                        {lastAction.type === "Added"
                          ? "➕ Added"
                          : lastAction.type === "Edited"
                          ? "✎ Edited"
                          : "❌ Deleted"}
                      </td>
                      <td className="py-1">{lastAction.section}</td>
                      <td className="py-1 text-[12px] flex flex-col items-center">
                        {lastAction.changes}
                        <ArrowDown className="w-4 h-4 my-1" />
                        (Pending Approval)
                      </td>
                    </tr>
                  )}
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
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}



    function LIBHigh({ data }) {
        if (!data || !Array.isArray(data)) return null;

        // separate normal sections and image gallery
        const normalSections = data.filter(sec => sec.category !== "Image_Gallery" || []);
        const imageGallery = data.find(sec => sec.category === "Image_Gallery" ||[]);

        return (
            <>
            {/* ✅ First div: Services, Facilities, E-Resources */}
<div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
  {data
    ?.filter(section => section.category !== "Image_Gallery")
    .map((section, index) => (
      <motion.div
        key={index}
        className="p-4 sm:p-6 md:p-8 rounded-2xl shadow-md sm:shadow-lg text-center dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                transition duration-500 hover:scale-105 hover:shadow-2xl hover:bg-[color-mix(in_srgb,theme(colors.secd),transparent_85%)]
                dark:hover:bg-[color-mix(in_srgb,theme(colors.drks),transparent_85%)]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-accn dark:text-drkt mb-4 sm:mb-6">
          {section.category}
        </h2>
        <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg">
          {Array.isArray(section.content) &&
            section.content.map((item, i) => (
              <motion.li
                key={i}
                className="flex items-center space-x-2 sm:space-x-3 hover:text-accn dark:hover:text-drkt transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-secd dark:bg-drks rounded-full"></span>
                <span className="text-start">
                  {typeof item === "string" ? item : item.name}
                </span>
              </motion.li>
            ))}
        </ul>
      </motion.div>
    ))}
</div>

{/* ✅ Second div: Library Highlights (Image_Gallery) */}
{Array.isArray(
  data?.find(section => section.category === "Image_Gallery")?.content
) &&
  data.find(section => section.category === "Image_Gallery").content.length >
    0 && (
    <div className="h-auto py-12 sm:py-16 px-4 sm:px-6">
      <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-accn dark:text-drkt uppercase tracking-wide mb-8 sm:mb-12">
        Library Highlights
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {data
          .find(section => section.category === "Image_Gallery")
          .content.map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              <Tilt
                options={{
                  max: 15,
                  scale: 1.05,
                  speed: 400,
                  glare: true,
                  "max-glare": 0.2,
                }}
                className="relative rounded-2xl shadow-lg overflow-hidden transition-all transform dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] group-hover:shadow-2xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={UrlParser(item.image)}
                    alt={item.title}
                    className="w-full h-56 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-10 transition-opacity"></div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-accn dark:text-drkt group-hover:text-secd dark:group-hover:text-drks transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 sm:mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Tilt>
            </motion.div>
          ))}
      </div>
    </div>
  )}

            </>
        );
    }

    function LIBMult() {
        return (
            <div className=" pt-16 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Images */}
                    <div className="relative group">
                        <motion.img
                            src={UrlParser("/static/images/library/library_images/Multimedia+Library+1.webp")}
                            alt="Multimedia Library"
                            className="w-full rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105"
                            initial={{opacity: 0, x: -50}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.8}}
                        />
                        <motion.img
                            src={UrlParser("/static/images/library/library_images/Multimedia+Library+2.webp")}
                            alt="Library Resources"
                            className="absolute bottom-[-30px] right-[-20px] w-2/3 rounded-xl shadow-xl border-4 border-white transition-transform duration-500 group-hover:rotate-3"
                            initial={{opacity: 0, x: 50}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.8, delay: 0.2}}
                        />
                    </div>

                    {/* Right Side - Text Content */}
                    <motion.div
                        className=""
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, delay: 0.3}}
                    >
                        <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-6">
                            MULTIMEDIA LIBRARY
                        </h2>
                        <p className="text-lg leading-relaxed text-justify">
                            A separate Multimedia Library is provided to utilize CD-ROMs,
                            Online Journals, and NPTEL courses. It offers internet browsing,
                            enabling students and faculty to access multidisciplinary video
                            learning materials.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-justify">
                            Our college is a proud member of <strong>DELNET</strong>,
                            promoting resource sharing among libraries. We provide access to
                            online journals like IEEE Transactions, ASME Proceedings, and more
                            for research activities.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-justify">
                            The <strong>National Digital Library of India</strong> integrates
                            global digital libraries under a single portal. It supports
                            academic disciplines in multiple languages, making knowledge
                            accessible for all.
                        </p>
                    </motion.div>
                </div>
            </div>
        )
    }

    function LIBArvl({data}) {
        return (
            <>
                {Array.isArray(data) && (
                    <div className="py-16 px-6">
                        <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-12 text-center">
                            NEW ARRIVALS
                        </h2>

                        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
                            {data?.map((section, index) => (
                                <motion.div
                                    key={index}
                                    className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform
                    dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] hover:scale-105"
                                    initial={{opacity: 0, y: 30}}
                                    whileInView={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5, delay: index * 0.1}}
                                    viewport={{once: true}}
                                >
                                    <div className="group relative">
                                        <img
                                            src={UrlParser(section.image)}
                                            alt={section.title}
                                            className="w-full h-60 object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                                        />
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0
                        group-hover:opacity-100 transition-all"
                                        >
                                            <h3 className="text-2xl text-black font-bold text-center px-4">
                                                {section.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <p className="leading-relaxed">{section.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )
    }
    
    function LIBResc({data}) {
        return (
            <>
                {Array.isArray(data) && (
  <div className="py-16 px-6">
    <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-12 text-center">
      Library Resources
    </h2>

    <div className="max-w-4xl mx-auto space-y-6">
      {data?.map((section, index) => (
        <div
          key={index}
          className="dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] rounded-2xl shadow-lg"
        >
          {/* Toggle button */}
          <button
            onClick={() => toggleSection(index)}
            className={`w-full flex justify-between items-center 
              text-base sm:text-lg px-6 py-4 font-semibold
              transition-all rounded-2xl text-white dark:text-drkp mb-4
              ${
                openSection === index
                  ? "bg-[#FDCC03] text-black dark:bg-drks"
                  : "bg-accn dark:bg-drks"
              }`}
          >
            <h2
              className={`${
                openSection === index ? "text-black" : "text-white"
              }`}
            >
              {section.category}
            </h2>
            {openSection === index ? (
              <FaChevronUp className="text-black" />
            ) : (
              <FaChevronDown />
            )}
          </button>

          {/* Collapsible content */}
          {openSection === index && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4"
            >
              {Array.isArray(section.content) ? (
                <ul className="list-disc marker:text-accn dark:marker:text-drka pl-6 space-y-2">
                  {section.content.map((item, idx) =>
                    typeof item === "string" ? (
                      <li key={idx} className="text-text dark:text-drka">
                        {item}
                      </li>
                    ) : (
                      <li key={idx}>
                        <a
                          href={item.link}
                          className="text-text dark:text-drka hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.name}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>{section.content}</p>
              )}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

            </>
        )
    }

    const Counter = ({ value }) => {
        const [count, setCount] = useState(0);
      
        useEffect(() => {
          let start = 0;
          const duration = 2000; // 2 seconds
          const increment = Math.ceil(value / (duration / 50));
      
          const counter = setInterval(() => {
            start += increment;
            if (start >= value) {
              setCount(value);
              clearInterval(counter);
            } else {
              setCount(start);
            }
          }, 50);
      
          return () => clearInterval(counter);
        }, [value]);
      
        return <span className="text-3xl font-semibold">{count.toLocaleString()}</span>;
      };
      
    
const LIBbookdetails = ({ data }) => {
  const stats = [
    { icon: "📘" },
    { icon: "👥" },
    { icon: "🏛" },
  ];

  const [bookData, setBookData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (data?.length > 0) {
      setBookData(data[0]);
      setOriginalData(data[0]);
    }
  }, [data]);

const handleChange = (key, value) => {
  setBookData((prev) => ({ ...prev, [key]: value }));

  if (value === "" || value === null) {
    toast.warning(`${key} cannot be empty`);
  } else {
    setHasChanges(true);
  }
};
  const handleEdit = () => {
    setIsEditing(true);
    setHasChanges(false);
    toast.info("Editing enabled");
  };

  const handleCancel = () => {
    setBookData(originalData);
    setIsEditing(false);
    setHasChanges(false);
    toast.warning("Changes reverted");
  };

const handleSave = () => {
  const hasEmpty = Object.entries(bookData).some(
    ([, value]) => value === "" || value === null
  );

  if (hasEmpty) {
    toast.error("Please fill all fields before saving");
    return;
  }

  setIsEditing(false);
  setOriginalData(bookData);
  setHasChanges(false);
  setShowRequestBtn(true);
  toast.success("Changes saved locally. Submit request to finalize.");
};

  const handleRequestConfirm = () => {
    console.log("Final request submitted with data:", bookData);
    setShowRequestModal(false);
    setShowRequestBtn(false);
    setOriginalData(bookData);
    toast.success("Final request submitted successfully!");
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {Object.keys(bookData).length > 0 ? (
        <div className="relative mt-12 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
          {/* ===== Top Right Buttons ===== */}
          <div className="absolute -top-12 right-4 flex gap-3">
            {!isEditing ? (
              <button
                className="px-4 py-2 rounded-md bg-[#FDCC03] text-black shadow-md hover:bg-[#e6b800] transition"
                onClick={handleEdit}
              >
                Edit
              </button>
            ) : (
              <>
                {hasChanges && (
                  <button
                    className="px-4 py-2 rounded-md bg-yellow-400 text-white shadow-md hover:bg-yellow-500 transition"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
                <button
                  className="px-4 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* ===== Book Details Grid ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(bookData).map(([key, value], index) => {
              const icons = stats[index] || {};
              return (
                <motion.div
                  key={index}
                  className="flex flex-col bg-prim dark:bg-text h-[16rem] justify-center items-center p-2 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
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
                  <p className="text-text dark:text-drkt text-lg mt-2">
                    {key}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* ===== Request Button ===== */}
          {showRequestBtn && !isEditing && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-8 py-3 bg-yellow-500 text-black rounded-lg shadow-md hover:bg-yellow-400 transition"
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

      {/* ===== Final Request Modal ===== */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[500px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Field</th>
                    <th className="py-1">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bookData).map(([key, value], idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-1">{key}</td>
                      <td className="py-1 font-semibold">{value}</td>
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
                className="px-4 py-2 rounded bg-[#800000] hover:bg-red-700 text-white"
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


    const LIBjournalsdetails = ({ data }) => {
  const stats = [
    { icon: "📚" },
    { icon: "🇮🇳" },
    { icon: "🌎" },
    { icon: "💻" },
  ];

  const [journalData, setJournalData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (data?.length > 0) {
      setJournalData(data[0]);
      setOriginalData(data[0]);
    }
  }, [data]);

const handleChange = (key, value) => {
  setJournalData((prev) => ({ ...prev, [key]: value }));

  if (value === "" || value === null) {
    toast.warning(`${key} cannot be empty`);
  } else {
    setHasChanges(true);
  }
};

  const handleEdit = () => {
    setIsEditing(true);
    setHasChanges(false);
    toast.info("Editing enabled");
  };

  const handleCancel = () => {
    setJournalData(originalData);
    setIsEditing(false);
    setHasChanges(false);
    toast.warning("Changes reverted");
  };

  const handleSave = () => {
  const hasEmpty = Object.entries(journalData).some(
    ([, value]) => value === "" || value === null
  );

  if (hasEmpty) {
    toast.error("Please fill all fields before saving");
    return;
  }

  setIsEditing(false);
  setOriginalData(journalData);
  setHasChanges(false);
  setShowRequestBtn(true);
  toast.success("Changes saved locally. Submit request to finalize.");
};


  const handleRequestConfirm = () => {
    console.log("Final request submitted with data:", journalData);
    setShowRequestModal(false);
    setShowRequestBtn(false);
    setOriginalData(journalData);
    toast.success("Final request submitted successfully!");
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      {Object.keys(journalData).length > 0 ? (
        <div className="relative mt-12 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
          {/* ===== Top Right Buttons ===== */}
          <div className="absolute -top-12 right-4 flex gap-3">
            {!isEditing ? (
              <button
                className="px-4 py-2 rounded-md bg-[#FDCC03] text-black shadow-md hover:bg-[#e6b800] transition"
                onClick={handleEdit}
              >
                Edit
              </button>
            ) : (
              <>
                {hasChanges && (
                  <button
                    className="px-4 py-2 rounded-md bg-yellow-400 text-black shadow-md hover:bg-yellow-500 transition"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
                <button
                  className="px-4 py-2 rounded-md bg-gray-400 text-white shadow-md hover:bg-gray-500 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* ===== Journals Details Grid ===== */}
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

          {/* ===== Request Button ===== */}
          {showRequestBtn && !isEditing && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-8 py-3 bg-yellow-500 text-black rounded-lg shadow-md hover:bg-yellow-400 transition"
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

      {/* ===== Final Request Modal ===== */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[500px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-center text-text dark:text-drkt border">
                <thead>
                  <tr className="bg-gray-200 dark:bg-drka">
                    <th className="py-1">Field</th>
                    <th className="py-1">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(journalData).map(([key, value], idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-1">{key}</td>
                      <td className="py-1 font-semibold">{value}</td>
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
                className="px-4 py-2 rounded bg-[#800000] hover:bg-red-700 text-white"
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

    //   const LIBnewspaperdetails = () => {
    //     const stats = [
    //       { label: "Total Newspapers", value: 325, icon: "📰" },
    //       { label: "Daily Newspapers", value: 120, icon: "📆" },
    //       { label: "Weekly Newspapers", value: 85, icon: "📅" },
    //       { label: "Monthly Newspapers", value: 60, icon: "🗞" },
    //       { label: "Archived Newspapers", value: 45, icon: "📂" },
    //       { label: "Digital Newspapers", value: 15, icon: "💻" }
    //     ];
      
    //     return (
    //         <>
    //             {stats ? (
    //                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-6 bg-prim dark:bg-drkp rounded-lg shadow-lg">
    //                     {stats?.map((stat, index) => (
    //                     <div key={index} className="flex flex-col items-center bg-prim dark:bg-text p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
    //                         <span className="text-5xl">{stat.icon}</span>
    //                         <Counter value={stat.value} />
    //                         <p className="text-text dark:text-prim text-lg mt-2">{stat.label}</p>
    //                     </div>
    //                     ))}
    //                 </div>
    //             ) : (
    //                 <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
    //                     <LoadComp />
    //                 </div>
    //             )}
    //         </>
    //     );
    //   };

    const [openSection, setOpenSection] = useState(null);
    const navData = {
        "Collection": {
            "Books": <LIBbookdetails data={data} />,
            "Journals": <LIBjournalsdetails data={data}/>
        },
        "HOD's message": <LIBHod/>,
        "Staff": <LIBFacl/>,
        "Services": <LIBHigh data={data}/>,
        "Advisory committee members": <LIBInstr data={data}/>,
        "Membership Details": <LIBMemb data={data}/>,
        "Downloads": <LIBFea data={data}/>,
        "Library Resources": <LIBResc data={data}/>,
        "Multimedia": <LIBMult/>,
        "Digital Library & E-Resources": <LIBArvl data={data}/>
    }

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    return (
        <>
            <div className="h-auto p-3 md:p-6 lg:p-10 space-y-8 md:space-y-12 lg:space-y-16">
                {(Array.isArray(lib)) ? navData[lib[0]][lib[1]] : navData[lib]}
            </div>
        </>
    );
};

export default LibrarySections;
