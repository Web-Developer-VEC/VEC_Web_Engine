import React, { useEffect, useState } from "react";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaUserEdit } from "react-icons/fa";
import { Pencil, Trash2, Plus, Send, Repeat } from "lucide-react";

const AdminCoe = ({ toggle, theme }) => {
  const [coeData, setCoeData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [actionType, setActionType] = useState(""); // "add" | "edit" | "replace"
  const [editIndex, setEditIndex] = useState({ section: null, member: null });
  const [newMember, setNewMember] = useState({
    image_path: "",
    name: "",
    qualification: "",
    position: "",
  });

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  // Fetch COE Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post("/api/main-backend/exam", { type: "COE" });
        setCoeData(res.data.data || []);
      } catch (err) {
        console.error("Error fetching COE data", err);
        if (err.response?.data?.status === 429) {
          navigate("/ratelimit", { state: { msg: err.response.data.message } });
        }
      }
    };
    fetchData();
  }, [navigate]);

const openPopup = (type, sectionIdx, memberIdx = null, existing = null) => {
  setActionType(type);
  setEditIndex({ section: sectionIdx, member: memberIdx });

  if (type === "edit") {
    // keep old values for editing
    setNewMember(existing || { image_path: "", name: "", qualification: "", position: "" });
  } else if (type === "replace" || type === "add") {
    // clear fields for replace or add
    setNewMember({ image_path: "", name: "", qualification: "", position: "" });
  }

  setShowPopup(true);
};
  // Save in popup
  const handleSave = () => {
    
    if(!newMember.image_path || !newMember.name || !newMember.position || !newMember.qualification){
      alert("Submit will all input field");
      return;
    }
    setCoeData((prev) => {
      const updated = [...prev];
      const { section, member } = editIndex;

      if (actionType === "replace") {
        updated[section].members[member] = { ...newMember };
      } else if (actionType === "edit") {
        updated[section].members[member] = { ...newMember };
      } else if (actionType === "add") {
        updated[section].members.push({ ...newMember }); // append (not queue)
      }
      return updated;
    });
    setShowPopup(false);
    setActionType("");
  };

  const handleDelete = (sectionIdx, memberIdx) => {
    setCoeData((prev) => {
      const updated = [...prev];
      updated[sectionIdx].members = updated[sectionIdx].members.filter(
        (_, i) => i !== memberIdx
      );
      return updated;
    });
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
    console.log("Final submitted data:", coeData);
    setIsDone(false);
    setIsEditing(false);
    // 👉 send to backend
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="Office of Controller of Examinations"
        subHeaderText="COE"
      />

      <div className="py-10 px-4 md:px-20 bg-prim dark:bg-drkp font-[Poppins]">
        {/* 🔼 Top Edit Button */}
        {!isEditing && !isDone && (
          <div className="flex justify-end pr-8">
            <button
              className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
              onClick={() => setIsEditing(true)}
            >
              <FaUserEdit className="mr-2" /> Edit
            </button>
          </div>
        )}

        {coeData.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                      dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                      w-full md:w-fit mx-auto shadow-md rounded-lg mb-10 p-6 md:p-10"
          >
            <h2 className="text-2xl font-bold text-[#800000] text-center mb-6">
              {section.category}
            </h2>

            <div className="flex flex-wrap justify-center gap-6">
              {section.members.map((member, memberIdx) => (
                <div
                  key={memberIdx}
                  className="relative flex bg-prim dark:bg-text border-2 border-yellow-500 
                            rounded-xl p-4 gap-4 items-start w-[430px]"
                >
                  <img
                    src={UrlParser(member.image_path)}
                    alt={member.name}
                    className="w-[100px] h-[120px] object-cover rounded"
                  />
                  <div>
                    <p className="font-bold text-[18px]">{member.name}</p>
                    <p className="text-sm">{member.qualification}</p>
                    <p className="text-sm">{member.position}</p>
                  </div>

                  {/* Buttons */}
                  {isEditing && (
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      {sectionIdx < 3 ? (
                        <>
                          <button
                            className="bg-green-500 text-black px-2 py-2 rounded hover:bg-yellow-600"
                            onClick={() =>
                              openPopup(
                                "replace",
                                sectionIdx,
                                memberIdx,
                                member
                              )
                            }
                          >
                            <Repeat size={16} />
                          </button>
                          <button
                            className="bg-secd px-2 py-2 rounded hover:bg-gray-200"
                            onClick={() =>
                              openPopup("edit", sectionIdx, memberIdx, member)
                            }
                          >
                            <Pencil size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-secd px-2 py-2 rounded hover:bg-gray-200"
                            onClick={() =>
                              openPopup("edit", sectionIdx, memberIdx, member)
                            }
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                            onClick={() => handleDelete(sectionIdx, memberIdx)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add button for faculties only */}
              {isEditing && sectionIdx >= 3 && (
                <button
                  className="bg-gray-100 h-40 w-40 flex justify-center items-center 
                            border border-black rounded-md hover:bg-gray-200"
                  onClick={() => openPopup("add", sectionIdx)}
                >
                  <Plus className="mr-2" /> Add
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 🔽 Bottom Buttons */}
        <div className="flex gap-4 justify-end pr-8 mt-4">
          {isEditing ? (
            <button
              className="flex items-center border-4 border-secd px-3 py-2 rounded-lg"
              onClick={handleDone}
            >
              Done
            </button>
          ) : isDone ? (
            <>
              <button
                className="flex items-center bg-secd px-3 py-2 rounded"
                onClick={handleBackToEdit}
              >
                Back to Edit
              </button>
              <button
                className="flex items-center bg-green-500 px-3 py-2 rounded text-white"
                onClick={handleRequest}
              >
                <Send className="mr-2" /> Request
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* 🔽 Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2147483647]">
          <div className="bg-white p-6 rounded-xl w-[420px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {actionType === "replace"
                ? "Replace Member"
                : actionType === "edit"
                ? "Edit Member"
                : "Add New Member"}
            </h2>

            {["image_path", "name", "qualification", "position"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={`Enter ${field}`}
                value={newMember[field]}
                onChange={(e) =>
                  setNewMember({ ...newMember, [field]: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
              />
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleSave}

              >
                {actionType === "replace"
                  ? "Replace"
                  : actionType === "edit"
                  ? "Update"
                  : "Submit"}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
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

export default AdminCoe;
