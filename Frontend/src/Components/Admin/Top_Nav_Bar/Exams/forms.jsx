import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaUserEdit } from "react-icons/fa";
import { Plus, Send, Trash, Pencil } from "lucide-react";

const AdminForms = ({ theme, toggle }) => {
  const studentTailRef = useRef(null);
  const [studentResources, setStudentResources] = useState([]);
  const [facultyResources, setFacultyResources] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  // Admin UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editType, setEditType] = useState("student"); // student | faculty
  const [newName, setNewName] = useState("");
  const [newLink, setNewLink] = useState("");

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  // ✅ Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const response = await axios.post(`/api/main-backend/exam`, {
          type: "all_forms",
        });

        const data = response?.data?.data;
        if (data) {
          const students = data?.find((item) => item.category == "student")?.content || [];
          const faculty = data?.find((item) => item.category == "faculty")?.content || [];

          const formattedStudentResources = (students || []).map(
            (name, index) => ({
              name: name?.name,
              url: UrlParser(name?.pdf_path || "#"),
            })
          );

          const formattedFacultyResources = (faculty || []).map(
            (name, index) => ({
              name: name?.name,
              url: UrlParser(name?.pdf_path || "#"),
            })
          );

          setStudentResources(formattedStudentResources);
          setFacultyResources(formattedFacultyResources);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        if (error?.response?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
          return;
        }

        setErrorMsg("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ✅ Online/Offline Handling
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 🔽 Actions
  const handleDone = () => {
    setIsDone(true);
    setIsEditing(false);
  };

  const handleBackToEdit = () => {
    setIsDone(false);
    setIsEditing(true);
  };

  const handleRequest = () => {
    console.log("Final submitted data:", { studentResources, facultyResources });
    setIsDone(false);
    setIsEditing(false);
    // 👉 Send data to backend here
  };

  const handleDelete = (type, index) => {
    if (type === "student") {
      setStudentResources((prev) => prev.filter((_, i) => i !== index));
    } else {
      setFacultyResources((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleEdit = (type, index) => {
    const item = type === "student" ? studentResources[index] : facultyResources[index];
    setIsEditingItem(true);
    setEditIndex(index);
    setEditType(type);
    setNewName(item.name);
    setNewLink(item.url);
    setShowPopup(true);
  };

  const handleAddNew = (type) => {
    
    setIsEditingItem(false);
    setEditType(type);
    setNewName("");
    setNewLink("");
    setShowPopup(true);
  };

  // ✅ Handle Offline
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  // ✅ Render Resource Links
  const renderResourceLinks = (resources, type) =>
    resources.length > 0 ? (
      resources.map((resource, index) => (
        <div key={index} className="resource-item relative dark:bg-drkts font-[Poppins]">
          <div className="form-content dark:bg-drkts">
            <div className="form-regulation bg-[#f8f9fa] dark:bg-black flex justify-between items-center">
              <div className="w-[65%]">
                <p className="text-text dark:text-drkt break-words whitespace-normal sm:text-left text-center text-sm">
                  {resource.name || "Untitled Document"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="text-text bg-secd rounded-xl px-2 py-2 "
                      onClick={() => handleEdit(type, index)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-prim bg-red-700 rounded-xl px-2 py-2 "
                      onClick={() => handleDelete(type, index)}
                    >
                      <Trash size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    className="form-button view-button bg-secd text-text dark:bg-drks dark:text-drkt
                      hover:bg-accn hover:text-prim dark:hover:bg-drka"
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 dark:text-gray-400 text-sm">No resources available</p>
    );

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Downloads"
        subHeaderText="Streamlining processes with easy access to forms, empowering smooth academic and administrative workflows."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt="Loading resources..." />
        </div>
      ) : errorMsg ? (
        <div className="h-screen flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
          {errorMsg}
        </div>
      ) : (
        <div className="mt-10 px-4">
          {/* 🔼 Top Edit Button */}
          {!isEditing && !isDone && (
            <div className="flex justify-end pr-8 my-0 mr-10">
              <button
                className="flex items-center bg-secd px-3 py-2 rounded text-text"
                onClick={() => setIsEditing(true)}
              >
                <FaUserEdit className="mr-2" /> Edit
              </button>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 py-2 sm:py-4">
            {/* Student Resources */}
            <div className="tail student-tail dark:bg-black" ref={studentTailRef}>
              <div className="tail-content flex flex-col h-full">
                <h2 className="font-[24px] font-bold mb-2 text-brwn dark:text-drkt">
                  Student Resources
                </h2>
                <div className="flex-grow overflow-y-auto overflow-x-hidden pr-2 h-full dark:bg-drkts">
                  {renderResourceLinks(studentResources, "student")}
                  {isEditing && (
                    <button
                      className="bg-green-500 mt-4 h-8 text-prim  w-fit px-[4px] py-[4px] flex ml-auto mr-4 justify-center items-center border border-black rounded-md "
                      onClick={() => handleAddNew("student")}
                    >
                      <Plus className="mr-2" /> Add New
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Faculty Resources */}
            <div className="tail faculty-tail dark:bg-black">
              <div className="tail-content flex flex-col h-full">
                <h2 className="font-bold mb-2 text-brwn dark:text-drkt">Faculty Resources</h2>
                <div className="download-links-container overflow-y-auto overflow-x-hidden dark:bg-drkts">
                  {renderResourceLinks(facultyResources, "faculty")}
                  {isEditing && (
                    <button
                      className="bg-green-500 mt-4 h-8 w-fit text-prim  px-[4px] py-[4px] flex ml-auto mr-4 justify-center items-center border border-black rounded-md "
                      onClick={() => handleAddNew("faculty")}
                    >
                      <Plus className="mr-2" /> Add New
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🔽 Bottom Action Buttons */}
          <div className="flex gap-4 justify-end pr-8 my-8 mr-10">
            {isEditing ? (
              <button
                className="flex items-center border-4 border-secd hover:bg-gray-300 hover:border-brwn text-text px-3 py-2 rounded-lg"
                onClick={handleDone}
              >
                <FaUserEdit className="mr-2" /> Done
              </button>
            ) : isDone ? (
              <>
                <button
                  className="flex items-center text-text border border-secd px-3 py-2 rounded"
                  onClick={handleBackToEdit}
                >
                  Back to Edit
                </button>
                <button
                  className="flex items-center bg-green-500 text-text hover:text-prim hover:bg-green-600 px-3 py-2 rounded"
                  onClick={handleRequest}
                >
                  <Send className="mr-2" />
                  Request
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* 🔽 Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[420px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEditingItem ? "Edit Resource" : "Add New Resource"}
            </h2>

            <input
              type="text"
              placeholder="Enter Resource Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />
          
            <input
              type="text"
              placeholder="Enter PDF Path"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                  if(!newName || !newLink){
                    alert("update with all details");
                    return;
                  }
                  if (isEditingItem && editIndex !== null) {
                    if (editType === "student") {
                      setStudentResources((prev) => {
                        const updated = [...prev];
                        updated[editIndex] = { name: newName, url: newLink };
                        return updated;
                      });
                    } else {
                      setFacultyResources((prev) => {
                        const updated = [...prev];
                        updated[editIndex] = { name: newName, url: newLink };
                        return updated;
                      });
                    }
                  } else {
                    if (editType === "student") {
                      setStudentResources((prev) => [
                        ...prev,
                        { name: newName, url: newLink },
                      ]);
                    } else {
                      setFacultyResources((prev) => [
                        ...prev,
                        { name: newName, url: newLink },
                      ]);
                    }
                  }
                  
                  setShowPopup(false);
                  setNewName("");
                  setNewLink("");
                  setIsEditingItem(false);
                  setEditIndex(null);
                }}
              >
                {isEditingItem ? "Update" : "Submit"}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminForms;
