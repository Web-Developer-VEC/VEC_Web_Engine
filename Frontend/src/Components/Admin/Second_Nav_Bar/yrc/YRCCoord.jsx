import React, { useState, useEffect, useRef } from "react";
// import "./NSSCoordinators.css";
import LoadComp from "../../LoadComp";
import { Trash2, PlusCircle, XCircle, Edit2 } from "lucide-react";
import { FaPaperPlane, FaUpload, FaRegCircleLeft, FaEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useBlockNavigation from "../useBlockNavigation";
const YRCCoord = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || "";
  const parseUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  const originalsRef = useRef({ faculty: null, students: [] });

  const [faculty, setFaculty] = useState(null);
  const [students, setStudents] = useState([]);
  const [changes, setChanges] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  useBlockNavigation(changes);
  const genId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data) && data.length >= 2) {
      const fac = data[0]?.members?.[0] ?? null;
      const studs = Array.isArray(data[1]?.members) ? data[1].members : [];

      originalsRef.current.faculty = fac ? JSON.parse(JSON.stringify(fac)) : null;
      originalsRef.current.students = JSON.parse(JSON.stringify(studs));

      setFaculty(fac ? { ...fac } : null);
      setStudents(studs.map((s) => ({ ...s })));
    } else {
      originalsRef.current.faculty = null;
      originalsRef.current.students = [];
      setFaculty(null);
      setStudents([]);
    }
    setChanges([]);
    setShowPopup(false);
    setEditing(false);
    setIsPreviewing(false);
  }, [data]);

  const hasChanges = changes.length > 0;

  const handlePreviewClick = () => {
    setIsPreviewing(true);
  };

  const handleBackToEdit = () => {
    setIsPreviewing(false);
  };

  const handleRequestClick = () => {
    if (changes.length === 0) {
      toast.info("No changes to request");
      return;
    }
    setShowPopup(true);
  };

  // Cancel edits
  const handleCancel = () => {
    toast.info("Changes canceled");
    setFaculty(
      originalsRef.current.faculty ? { ...originalsRef.current.faculty } : null
    );
    setStudents(originalsRef.current.students.map((s) => ({ ...s })));
    setChanges([]);
    setEditing(false);
    setIsPreviewing(false);
  };

  // Faculty field change
  const handleChangeFaculty = (key, value) => {
    if (!faculty) return;
    const old = { ...faculty };
    const updated = { ...faculty, [key]: value };
    setFaculty(updated);

    setChanges((prev) => {
      const found = prev.find(
        (c) => c.target === "faculty" && c.action === "edited"
      );
      if (found) {
        return prev.map((c) =>
          c.target === "faculty" ? { ...c, new: updated } : c
        );
      }
      return [
        ...prev,
        { id: genId(), action: "edited", target: "faculty", old, new: updated },
      ];
    });
  };

  // Student field change
  const handleChangeStudent = (index, key, value) => {
    const updated = students.map((s, i) =>
      i === index ? { ...s, [key]: value } : s
    );
    const old = { ...(students[index] || {}) };
    setStudents(updated);

    setChanges((prev) => {
      const found = prev.find(
        (c) => c.target === "student" && c.index === index
      );

      if (found) {
        // If it was added, just update the "added" record
        if (found.action === "added") {
          return prev.map((c) =>
            c.index === index ? { ...c, new: updated[index] } : c
          );
        }
        // If edited, update existing edit record
        if (found.action === "edited") {
          return prev.map((c) =>
            c.index === index ? { ...c, new: updated[index] } : c
          );
        }
      }

      // Otherwise add a new "edited" change
      return [
        ...prev,
        {
          id: genId(),
          action: "edited",
          target: "student",
          index,
          old,
          new: updated[index],
        },
      ];
    });
  };

  // File upload
  const handleFileChange = (index, file, isFaculty = false) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (isFaculty) {
      handleChangeFaculty("image_path", previewUrl);
    } else {
      handleChangeStudent(index, "image_path", previewUrl);
    }
  };

  // Add student
  const handleAddStudent = () => {
    const newStudent = { name: "", designation: "", image_path: "" };
    setStudents((prev) => [...prev, newStudent]);
    setChanges((prev) => [
      ...prev,
      {
        id: genId(),
        action: "added",
        target: "student",
        index: students.length,
        new: newStudent,
      },
    ]);
  };

  

  // Delete student
  const handleDeleteStudent = (index) => {
    const deleted = students[index];
    setStudents((prev) => prev.filter((_, i) => i !== index));

    setChanges((prev) => [
      ...prev,
      {
        id: genId(),
        action: "deleted",
        target: "student",
        index,
        old: deleted,
      },
    ]);
  };
const validateCarouselData = () => {
    if (faculty) {
      if (!faculty.name || !faculty.designation || !faculty.image_path) {
        return false;
      }
    } else {
      return false;
    }
    for (let student of students) {
      if (!student.name || !student.designation || !student.image_path) {
        return false;
      }
    }
    return true;
  }

  // Undo
  const handleUndo = (i) => {
    const change = changes[i];
    if (!change) return;

    if (change.action === "added") {
      setStudents((prev) => prev.filter((_, idx) => idx !== change.index));
    } else if (change.action === "deleted") {
      setStudents((prev) => {
        const copy = [...prev];
        copy.splice(change.index, 0, change.old);
        return copy;
      });
    } else if (change.action === "edited") {
      if (change.target === "faculty") {
        setFaculty(change.old);
      } else {
        setStudents((prev) => {
          const copy = [...prev];
          copy[change.index] = change.old;
          return copy;
        });
      }
    }

    setChanges((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleFinalRequest = () => {
    if (changes.length === 0) {
      toast.error("No changes to submit");
      return;
    }
    toast.success("Final request submitted!");
    setShowPopup(false);
    setEditing(false);
    setIsPreviewing(false);
    setChanges([]);
    originalsRef.current.faculty = faculty ? { ...faculty } : null;
    originalsRef.current.students = students.map((s) => ({ ...s }));
  };

  if (!faculty || !Array.isArray(students)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const editingvalues = () => (
    <>
      {/* Faculty */}
      <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">
        FACULTY COORDINATOR
      </h2>
      <div className="nss-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4 p-4">
        <div className="flex-shrink-0 relative">
          <img
            src={faculty?.image_path ? parseUrl(faculty.image_path) : "/placeholder-image.jpg"}
            alt={faculty?.name || "Faculty"}
            className="w-32 h-32 rounded border object-cover"
          />
          {editing && (
            <label className="mt-2 cursor-pointer flex items-center justify-center gap-2 text-blue-500">
              <FaUpload size={16} /> Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(null, e.target.files?.[0], true)
                }
              />
            </label>
          )}
        </div>
        <div className="text-center md:text-left w-full">
          {editing ? (
            <>
              <input
                type="text"
                value={faculty?.name || ""}
                onChange={(e) => handleChangeFaculty("name", e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="Faculty Name"
              />
              <input
                type="text"
                value={faculty?.designation || ""}
                onChange={(e) =>
                  handleChangeFaculty("designation", e.target.value)
                }
                className="border p-2 rounded w-full"
                placeholder="Designation"
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold">{faculty?.name}</h3>
              <p className="text-sm">{faculty?.designation}</p>
            </>
          )}
        </div>
      </div>

      {/* Students */}
      <h2 className="text-xl md:text-2xl font-bold text-center mt-6 text-brwn dark:text-drkt">
        STUDENT COORDINATORS
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {students.map((member, index) => (
          <div
            key={index}
            className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center relative"
          >
            {/* Student Image */}
            <div className="relative w-24 h-24 mb-3">
              <img
                src={member?.image_path ? parseUrl(member.image_path) : "/placeholder-image.jpg"}
                alt={member?.name || "Student"}
                className="w-24 h-24 border rounded object-cover"
              />
            </div>

            {/* Upload button only in edit mode */}
            {editing && (
              <div className="mb-3">
                <label className="cursor-pointer flex items-center justify-center gap-2 text-blue-500">
                  <FaUpload size={16} /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(index, e.target.files?.[0], false)}
                  />
                </label>
              </div>
            )}

            {/* Name + Designation */}
            {editing ? (
              <>
                <input
                  type="text"
                  value={member?.name || ""}
                  onChange={(e) => handleChangeStudent(index, "name", e.target.value)}
                  className="border p-1 mb-2 w-full"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={member?.designation || ""}
                  onChange={(e) => handleChangeStudent(index, "designation", e.target.value)}
                  className="border p-1 w-full"
                  placeholder="Designation"
                />
                <button
                  onClick={() => handleDeleteStudent(index)}
                  className="text-red-500 mt-2 flex items-center justify-center"
                >
                  <Trash2 className="mr-1" size={16} /> Delete
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{member?.name}</h3>
                <p className="text-sm text-brwn dark:text-drka">{member?.designation}</p>
              </>
            )}
          </div>
        ))}
        
        {editing && (
          <div
            onClick={handleAddStudent}
            className="border-2 border-dashed border-gray-400 rounded-xl flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <PlusCircle size={40} className="text-gray-500 mb-2" />
            <span className="text-gray-500">Add Student</span>
          </div>
        )}
      </div>
    </>
  );

  const cooredi = () => (
    <>
      {/* Faculty */}
      <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">
        FACULTY COORDINATOR
      </h2>
      <div className="nss-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4 p-4">
        <div className="flex-shrink-0">
          <img
            src={faculty?.image_path ? parseUrl(faculty.image_path) : "/placeholder-image.jpg"}
            alt={faculty?.name || "Faculty"}
            className="w-32 h-32 rounded border object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold">{faculty?.name}</h3>
          <p className="text-sm">{faculty?.designation}</p>
        </div>
      </div>

      {/* Students */}
      <h2 className="text-xl md:text-2xl font-bold text-center mt-6 text-brwn dark:text-drkt">
        STUDENT COORDINATORS
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {students.map((member, index) => (
          <div
            key={index}
            className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center"
          >
            <img
              src={member?.image_path ? parseUrl(member.image_path) : "/placeholder-image.jpg"}
              alt={member?.name || "Student"}
              className="w-24 h-24 border rounded object-cover mb-3"
            />
            <h3 className="text-lg font-semibold">{member?.name}</h3>
            <p className="text-sm text-brwn dark:text-drka">{member?.designation}</p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="p-6 relative">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      {/* Top buttons */}
      <div className="flex justify-end gap-2 mb-4">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="nss-btn nss-btn-edit flex items-center gap-2"
          >
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="nss-btn nss-btn-cancel flex items-center gap-2"
          >
            <XCircle size={14} /> Cancel
          </button>
        )}
      </div>

      {/* Content */}
      {isPreviewing ? (
        cooredi()
      ) : editing ? (
        editingvalues()
      ) : (
        cooredi()
      )}
<div className="pt-9">      {/* Action Buttons */}
      {editing && !isPreviewing && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            className={`nss-btn nss-btn-request ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}
             onClick={() => {
                if (validateCarouselData()) {
                  setIsPreviewing(true);
                } else {
                  toast.error("Please fill all required fields before previewing.");
                }
              }}
            disabled={!hasChanges}
          >
           
            <FaEye size={16} /> Preview
          </button>
        </div>
      )}
      
      <div className="nss-req">
        {isPreviewing && (
          <div className="absolute bottom-4 right-4 flex gap-2 ">
            <button className="nss-btn nss-btn-edit" onClick={handleBackToEdit}>
              Back to Edit
            </button>
            <button
              className="nss-btn nss-btn-request flex items-center gap-1"
              onClick={handleRequestClick}
            >
              <FaPaperPlane size={16} /> Request Changes
            </button>
          </div>
        )}
      </div></div>


      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] md:w-[600px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">
              Final Request for the Changes
            </h3>
            <div className="max-h-64 overflow-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Target</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((ch, i) => (
                    <tr key={ch.id} className="border-t">
                      <td className="py-2">{ch.action.charAt(0).toUpperCase() + ch.action.slice(1)}</td>
                      <td>{ch.target.charAt(0).toUpperCase() + ch.target.slice(1)}</td>
                      <td>{ch.new?.name ?? ch.old?.name ?? "-"}</td>
                      <td>
                        <button
                          onClick={() => handleUndo(i)}
                          className="px-3 py-1 rounded bg-yellow-400 text-black font-medium hover:bg-yellow-500 flex items-center gap-1"
                        >
                          <FaRegCircleLeft /> Undo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-red-600 mb-4">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the
              live site.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="nss-btn nss-btn-request flex items-center gap-1"
                onClick={handleFinalRequest}
              >
                <FaPaperPlane size={16} /> Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YRCCoord;