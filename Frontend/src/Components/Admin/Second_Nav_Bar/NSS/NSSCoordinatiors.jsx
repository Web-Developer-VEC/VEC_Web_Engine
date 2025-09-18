// Components/Second_Nav_Bar/NSS/Coordinators.jsx
import React, { useState, useEffect, useRef } from "react";
import "./NSSCoordinators.css";
import LoadComp from "../../LoadComp";
import { Trash2, PlusCircle, XCircle, Edit2 } from "lucide-react";
import { FaPaperPlane, FaUpload, FaRegCircleLeft, FaEye } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Coordinators = ({ data }) => {
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
  const [errors, setErrors] = useState({});

  // ---------------- Faculty Preview ----------------
  const [previewImg, setPreviewImg] = useState(null); // single preview (faculty)

  const handleFacultyPreviewChange = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImg(url); // set only one preview
      handleChangeFaculty("image_path", url);
    }
  };

  // ---------------- Students Preview ----------------
  const [previewImgs, setPreviewImgs] = useState({}); // multiple previews (students)

  const handleStudentPreviewChange = (index, file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImgs((prev) => ({ ...prev, [index]: url })); // update per student
      handleChangeStudent(index, "image_path", url);
    }
  };

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
    setPreviewImg(null);
    setPreviewImgs({});
  }, [data]);

  const hasChanges = changes.length > 0;

const handlePreviewClick = () => {
  let newErrors = {};

  // Faculty validation
  if (!faculty?.name?.trim()) {
    newErrors.facultyName = "Required";
  }
  if (!faculty?.designation?.trim()) {
    newErrors.facultyDesignation = "Required";
  }
  if (!faculty?.image_path) {
    newErrors.facultyImage = "Faculty image is required";
  }

  // Students validation
  students.forEach((student, index) => {
    if (!student?.name?.trim()) {
      newErrors[`studentName_${index}`] = "Required";
    }
    if (!student?.designation?.trim()) {
      newErrors[`studentDesignation_${index}`] = "Required";
    }
    if (!student?.image_path) {
      newErrors[`studentImage_${index}`] = "Image required";
    }
  });

  setErrors(newErrors);

  // If errors exist, stop preview
  if (Object.keys(newErrors).length > 0) {
    toast.error("Please fill all required fields (including images) before previewing.");
    return;
  }

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

  const handleCancel = () => {
    toast.info("Changes canceled");
    setFaculty(
      originalsRef.current.faculty ? { ...originalsRef.current.faculty } : null
    );
    setStudents(originalsRef.current.students.map((s) => ({ ...s })));
    setChanges([]);
    setEditing(false);
    setIsPreviewing(false);
    setPreviewImg(null);
    setPreviewImgs({});
  };

  const handleChangeFaculty = (key, value) => {
    if (!faculty) return;
    const updated = { ...faculty, [key]: value };
    setFaculty(updated);

    const isOriginalUnchanged =
      originalsRef.current.faculty?.[key] === value &&
      !previewImg;

    if (isOriginalUnchanged) {
      setChanges((prev) =>
        prev.filter((c) => !(c.target === "faculty" && c.action === "edited"))
      );
    } else {
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
          {
            id: genId(),
            action: "edited",
            target: "faculty",
            old: faculty,
            new: updated,
          },
        ];
      });
    }
  };

  const handleChangeStudent = (index, key, value) => {
    const updatedStudents = students.map((s, i) =>
      i === index ? { ...s, [key]: value } : s
    );
    setStudents(updatedStudents);

    setChanges((prevChanges) => {
      const studentChangeIndex = prevChanges.findIndex(
        (c) => c.target === "student" && c.index === index
      );
      const originalStudent = originalsRef.current.students[index];

      const isOriginalUnchanged =
        originalStudent && originalStudent[key] === value;

      if (isOriginalUnchanged) {
        // If the change reverts to the original value, remove the change from the list
        const updated = prevChanges.filter((_, i) => i !== studentChangeIndex);
        return updated;
      }

      if (studentChangeIndex !== -1) {
        // Update an existing change
        return prevChanges.map((c, i) =>
          i === studentChangeIndex ? { ...c, new: updatedStudents[index] } : c
        );
      } else {
        // Add a new change
        return [
          ...prevChanges,
          {
            id: genId(),
            action: "edited",
            target: "student",
            index,
            old: students[index],
            new: updatedStudents[index],
          },
        ];
      }
    });
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
    const deletedStudent = students[index];
    setStudents((prev) => prev.filter((_, i) => i !== index));

    setChanges((prev) => {
      // Find and remove any changes related to this student
      const updatedChanges = prev.filter(
        (c) => !(c.target === "student" && c.index === index)
      );

      // Add a single "deleted" change for the student
      return [
        ...updatedChanges,
        {
          id: genId(),
          action: "deleted",
          target: "student",
          index,
          old: deletedStudent,
        },
      ];
    });
  };

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

  // MODIFICATION: Disables the "Request" button in the popup if no changes exist
  const handleFinalRequest = () => {
    if (changes.length === 0) {
      toast.error("No changes to submit");
      return;
    }
    // console.log("Submitting changes:", changes);
    toast.success("Final request submitted!");
    setShowPopup(false);
    setEditing(false);
    setIsPreviewing(false);
    setChanges([]);
    originalsRef.current.faculty = faculty ? { ...faculty } : null;
    originalsRef.current.students = students.map((s) => ({ ...s }));
    setPreviewImg(null);
    setPreviewImgs({});
  };

  if (!faculty || !Array.isArray(students)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  const editingvalues = () =>
    (
      <>
        {/* Faculty */}
        <h2 className="text-lg md:text-3xl font-bold text-center text-brwn dark:text-drkt mb-1">
          FACULTY COORDINATOR
        </h2>

        <div className="nss-member-card-1 dark:bg-text flex flex-col md:flex-row items-center gap-6 mt-4 p-4">
          <div className="flex-shrink-0 relative">
            <img
              src={
                previewImg
                  ? previewImg
                  : faculty?.image_path
                    ? parseUrl(faculty.image_path)
                    : "/placeholder-image.jpg"
              }
              alt={faculty?.name || "Faculty"}
              className="w-32 h-32 rounded border object-cover"
            />

            {editing && (
              <div className="flex flex-col items-center mt-2 gap-2">
                <label className="cursor-pointer flex items-center justify-center gap-2 text-blue-500">
                  <FaUpload size={16} /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFacultyPreviewChange(e.target.files?.[0])}
                  />
                </label>

                {previewImg && (
                  <button
                    onClick={() => window.open(previewImg, "_blank")}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <FaEye size={16} /> Preview
                  </button>
                )}
              </div>
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
                <p className="text-gray-600">{faculty?.designation}</p>
              </>
            )}
          </div>
        </div>

        {/* Students */}
        <h2 className="text-xl md:text-2xl font-bold text-center mt-6 text-brwn dark:text-drkt">
          STUDENT COORDINATORS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {students.map((member, index) => (
            <div
              key={index}
              className="dark:bg-text shadow-md rounded-xl p-4 flex flex-col items-center text-center relative"
            >
              {/* Student Image */}
              <div className="relative w-24 h-24 mb-3">
                <img
                  src={
                    previewImgs[index]
                      ? previewImgs[index]
                      : member?.image_path
                        ? parseUrl(member.image_path)
                        : "/placeholder-image.jpg"
                  }
                  alt={member?.name || "Student"}
                  className="w-24 h-24 border rounded object-cover"
                />

                {previewImgs[index] && (
                  <button
                    onClick={() => window.open(previewImgs[index], "_blank")}
                    className="absolute top-1 right-1 bg-white p-1 rounded-full shadow text-green-600 hover:text-green-800"
                  >
                    <FaEye size={14} />
                  </button>
                )}
              </div>

              {editing && (
                <div className="mb-3">
                  <label className="cursor-pointer flex items-center justify-center gap-2 text-blue-500">
                    <FaUpload size={16} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleStudentPreviewChange(index, e.target.files?.[0])}
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
  src={
    previewImg
      ? previewImg
      : faculty?.image_path
        ? parseUrl(faculty.image_path)
        : "/placeholder-image.jpg"
  }
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
  src={
    previewImgs[index]
      ? previewImgs[index]
      : member?.image_path
        ? parseUrl(member.image_path)
        : "/placeholder-image.jpg"
  }
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
      <div className="pt-9">
        {/* Action Buttons */}
        {editing && !isPreviewing && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              className={`nss-btn nss-btn-request ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handlePreviewClick}
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
        </div>
      </div>

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
                className={`nss-btn nss-btn-request flex items-center gap-1 ${changes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleFinalRequest}
                disabled={changes.length === 0}
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

export default Coordinators;