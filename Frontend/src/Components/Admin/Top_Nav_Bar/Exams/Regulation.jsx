import React, { useEffect, useState } from "react";
import "./Regulation.css";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { FaUserEdit } from "react-icons/fa";
import { Plus, Send, Trash, Pencil, Trash2 } from "lucide-react";

const AdminREGULATION = ({ theme, toggle }) => {
  const [regulationdata, setRegulationData] = useState([]); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setLoading] = useState(true);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newLinks, setNewLinks] = useState([
    { name: "UG - B.E / B.Tech", pdf_path: "" },
    { name: "PG - ME", pdf_path: "" },
    { name: "PG - MBA", pdf_path: "" },
  ]);

  // For editing existing entry
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handleDone = () => {
    setIsDone(true);
    setIsEditing(false);
  };

  const handleBackToEdit = () => {
    setIsDone(false);
    setIsEditing(true);
  };

  const handleRequest = () => {
    console.log("Final submitted data:", regulationdata);
    setIsDone(false);
    setIsEditing(false);
    // 👉 send `regulationdata` to backend using axios
  };

  const handleDeleteRegulation = (index) => {
    setRegulationData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNew = () => {
    setIsEditingItem(false);
    setNewYear("");
    setNewLinks([
      { name: "UG - B.E / B.Tech", pdf_path: "" },
      { name: "PG - ME", pdf_path: "" },
      { name: "PG - MBA", pdf_path: "" },
    ]);
    setShowPopup(true);
  };

  const handleEditRegulation = (index) => {
    const item = regulationdata[index];
    setIsEditingItem(true);
    setEditIndex(index);
    setNewYear(item.year);
    setNewLinks(item.links.map((l) => ({ ...l })));
    setShowPopup(true);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "regulation",
        });

        setRegulationData(response.data.data || []); 
        setLoading(false);
      } catch (error) {
        console.error("Error Fetching Regulation data");
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
        setLoading(true);
      }
    };
    fetchData();
  }, [navigate]);

  // Online/offline
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

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Regulations"
        subHeaderText="Establishing clear guidelines to foster transparency, compliance, and organizational integrity."
      />

      {isLoading ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (
        <div className="regulation-container mt-10">
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

          <h1 className="title text-brwn dark:text-drkt">Regulations</h1>
          {/* Regulations list */}
          <div className="regulation-grid">
            {regulationdata?.map((reg, index) => (
              <div key={index} className="regulation-card relative">
                {/* Delete + Edit buttons */}
                {isEditing && (
                  <div className="absolute bottom-0 flex gap-2 mt-4 pt-4">
                    <button
                      className="text-text  bg-secd px-2 py-2 rounded "
                      onClick={() => handleEditRegulation(index)}
                    >
                     <Pencil /> 
                    </button>
                    <button
                      className="text-prim bg-red-700 px-2 py-2 rounded "
                      onClick={() => handleDeleteRegulation(index)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                )}

                <h2 className="regulation-year text-brwn dark:text-drkt text-md border-b-2 pb-2 w-fit border-[#fdcc03] dark:border-drks">
                  Regulation {reg.year}
                </h2>

                <ul className="regulation-list mt-2">
                  {reg.links.map((link, idx) => (
                    <li key={idx}>
                      {link?.pdf_path ? (
                        <a
                          href={UrlParser(link?.pdf_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-drkt font-[Poppins] hover:underline text-blue-600"
                        >
                          {link?.name}
                        </a>
                      ) : (
                        <span className="text-text dark:text-drkt font-[Poppins]">
                          {link?.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {isEditing && (
              <button
                className="bg-gray-100 my-auto ml-20 h-40 w-40 p-6 flex justify-center items-center border border-black rounded-md hover:bg-gray-200"
                onClick={handleAddNew}
              >
                <Plus className="mr-2" /> Add New
              </button>
            )}
          </div>

          {/* 🔽 Bottom Action Buttons */}
          <div className="flex gap-4 justify-end items-start pr-8 my-8 mr-10">
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

      {/* 🔽 Popup for Add/Edit Regulation */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[420px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEditingItem ? "Edit Regulation" : "Add New Regulation"}
            </h2>

            {/* Year Input */}
            <input
              type="text"
              placeholder="Enter Regulation Year (e.g., 2024)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />

            {/* Links Input */}
            {newLinks.map((link, idx) => (
              <div key={idx} className="mb-2">
                <label className="text-sm font-medium block mb-1">
                  {link.name}
                </label>
                <input
                  type="text"
                  placeholder="Enter PDF Path"
                  value={link.pdf_path}
                  onChange={(e) => {
                    const updated = [...newLinks];
                    updated[idx].pdf_path = e.target.value;
                    setNewLinks(updated);
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                  if (isEditingItem && editIndex !== null) {
                    // update existing
                    setRegulationData((prev) => {
                      const updated = [...prev];
                      updated[editIndex] = { year: newYear, links: newLinks };
                      return updated;
                    });
                  } else {
                    // add new
                    setRegulationData((prev) => [
                      { year: newYear, links: newLinks },
                      ...prev,
                    ]);
                  }

                  setShowPopup(false);
                  setNewYear("");
                  setNewLinks([
                    { name: "UG - B.E / B.Tech", pdf_path: "" },
                    { name: "PG - ME", pdf_path: "" },
                    { name: "PG - MBA", pdf_path: "" },
                  ]);
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

export default AdminREGULATION;
