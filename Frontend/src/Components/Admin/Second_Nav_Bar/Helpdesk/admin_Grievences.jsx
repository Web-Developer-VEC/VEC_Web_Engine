import React, { useEffect, useState } from "react";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import axios from "axios";
import { SaveAll, SquarePen, CircleX, Send, Pencil, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin_Grievences.css";

const AdminGrievanceForm = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");
  const [contact_number, setContactNumber] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [query_about, setQueryAbout] = useState("");
  const [loading, setLoading] = useState(false);
  const [gredit, setgrEdit] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  // States for admin functionality
  const [grievanceData, setGrievanceData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [grData, setGrData] = useState(null);

  // Online/offline detection
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

  // Fetch grievance data
  useEffect(() => {
    const fetchGrievanceData = async () => {
      try {
        const res = await axios.post("/api/main-backend/help_desk", {
          type: "Help desk",
        });
        const data = res.data.data;
        setGrievanceData(data);
        setEditableData(data); // Initialize editableData with fetched data
        setGrData(data); // Save original data for comparison
      } catch (err) {
        console.error("Error fetching grievance table:", err);
      }
    };
    fetchGrievanceData();
  }, []);
const handleDiscardChanges = () => {
  setEditableData(grievanceData);   // Restore from original fetched data
  setChangeList([]);                // Clear change list
  setSavedOnce(false);              // Reset saved state
  setgrEdit(false);                 // Exit edit mode
  toast.info("All changes discarded. Original data restored.");
};
const handleCancel = () => {
  setEditableData([...editableData]); // Keep the current saved data
  setChangeList([]);                  // Clear pending edits
  setgrEdit(false);                   // Exit edit mode
  toast.info("Edit cancelled. Kept last saved changes.");
};
  // Check if data is loaded before accessing its properties
  const section =
    grievanceData?.find((item) => item.category === "section & level")
      ?.content || [];
  const level1 =
    grievanceData?.find((item) => item.category === "level1")?.content || {};
  const level2 =
    grievanceData?.find((item) => item.category === "level2")?.content || {};
  const level3 =
    grievanceData?.find((item) => item.category === "level3")?.content || {};
  const level4 =
    grievanceData?.find((item) => item.category === "level4")?.content || {};
  const level5 =
    grievanceData?.find((item) => item.category === "level5")?.content || [];
  const another =
    grievanceData?.find((item) => item.category === "another")?.content || [];

  // Functions for public form
  function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  const phoneCheck = (value) => {
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(value)) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }
    return true;
  };

  const emailCheck = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      alert("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha.toString()) {
      alert("Incorrect CAPTCHA, please try again.");
      setCaptcha(generateCaptcha());
      return;
    }

    if (contact_number && !phoneCheck(contact_number)) return;
    if (email && !emailCheck(email)) return;

    try {
      setLoading(true);
      const response = await fetch("/api/main-backend/get_grievance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          contact_number,
          query_about,
          category,
          content,
          original_captcha: captcha.toString(),
          entered_captcha: userCaptcha.toString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        alert("Email sent successfully");
      } else {
        setMessage(`Error: ${data.error || data.message}`);
        alert(data.message);
      }
    } catch (error) {
      setMessage("Error connecting to the server");
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setContent("");
      setEmail("");
      setUserCaptcha("");
      setName("");
      setContactNumber("");
      setQueryAbout("");
      setCategory("");
      setCaptcha(generateCaptcha());
    }
  };

  // Admin functions
  const handleEditChange = (category, field, value, index = null) => {
    const newData = editableData.map((item) => {
      if (item.category === category) {
        let newContent;
        if (Array.isArray(item.content)) {
          newContent = [...item.content];
          if (index !== null) {
            newContent[index] = value;
          }
        } else {
          newContent = { ...item.content, [field]: value };
        }
        return { ...item, content: newContent };
      }
      return item;
    });
    setEditableData(newData);
  };

  const handleSaveClick = () => {
    if (!validateMandatoryFields()) {
    toast.error("All fields are mandatory!");
    return;    }                 
    setSavedOnce(true);
    const changes = [];

    editableData.forEach((editableItem) => {
      const originalItem = grievanceData.find(
        (item) => item.category === editableItem.category
      );

      if (originalItem) {
        const originalContent = originalItem.content;
        const editableContent = editableItem.content;

        // Check for changes in content
        if (JSON.stringify(editableContent) !== JSON.stringify(originalContent)) {
          let action = "";
          let details = {};

          if (Array.isArray(editableContent)) {
            action = ` ${editableItem.category}`;
            details = { from: originalContent, to: editableContent };
          } else {
            const changedFields = Object.keys(editableContent).filter(
              (key) => editableContent[key] !== originalContent[key]
            );

            if (changedFields.length > 0) {
              action = ` ${editableItem.category}`;
              details = changedFields.reduce((acc, field) => {
                acc[field] = {
                  from: originalContent[field],
                  to: editableContent[field],
                };
                return acc;
              }, {});
            }
          }

          if (action) {
            changes.push({
              category: editableItem.category,
              action,
              details,
              originalContent: originalContent, // Store the entire original content for undo
            });
          }
        }
      }
    });

    setChangeList(changes);
    setgrEdit(false);
    toast.success("Changes saved locally! Click 'Request changes' to submit.");
  };
  const validateMandatoryFields = () => {
  for (let item of editableData) {
    if (Array.isArray(item.content)) {
      for (let val of item.content) {
        if (!val || val.toString().trim() === "") return false;
      }
    } else {
      for (let key in item.content) {
        if (!item.content[key] || item.content[key].toString().trim() === "")
          return false;
      }
    }
  }
  return true;
};


  const handleUndoChange = (idx) => {
    const newList = [...changeList];
    const undoneChange = newList.splice(idx, 1)[0]; // Use splice to remove and get the item
    setChangeList(newList);

    // Revert the editable data to its state before the change
    setEditableData((prevData) => {
      return prevData.map((item) => {
        if (item.category === undoneChange.category) {
          // Use the stored original content to revert
          return { ...item, content: undoneChange.originalContent };
        }
        return item;
      });
    });
  };

  const handleFinalRequest = async () => {
    if (changeList.length === 0) {
      toast.error("No changes to submit!");
      return;
    }
    try {
      await axios.post("/api/admin/request-changes", {
        changes: changeList,
        data: editableData,
      });
      toast.success("Request submitted for approval!");
      setChangeList([]);
      setShowPopup(false);
      setSavedOnce(false);
      // Reset the original data to the new saved data
      setGrievanceData(editableData);
    } catch (err) {
      toast.error("Failed to submit request!");
    }
  };

  // Loading states
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  if (!grievanceData || !editableData || grievanceData.length === 0) {
    return <p>Loading grievance table...</p>;
  }

  // Helper functions to get content from editableData
  const getEditableContent = (category) => {
    return editableData?.find((item) => item.category === category)?.content;
  };

  const editableSection = getEditableContent("section & level") || [];
  const editableLevel1 = getEditableContent("level1") || {};
  const editableLevel2 = getEditableContent("level2") || {};
  const editableLevel3 = getEditableContent("level3") || {};
  const editableLevel4 = getEditableContent("level4") || {};
  const editableLevel5 = getEditableContent("level5") || [];
  const editableAnother = getEditableContent("another") || [];

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Grievances_Banner.webp"
        headerText="Help Desk"
        subHeaderText="Raise your concerns here"
      />

      <div className="flex justify-center p-6 font-[poppins]">
        <div className="bg-prim dark:bg-drkts py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            {/* Left side */}
            <div className="flex flex-col items-start justify-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brwn dark:text-drkt leading-tight">
                Have a Query or Grievance?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                We value your feedback and concerns. Please fill in your details and our team will reach out to you shortly.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-prim dark:bg-drkp shadow-xl rounded-3xl px-8 py-10 space-y-6 border-t-8 border-brwn dark:border-drks"
            >
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Contact Number</label>
                <input
                  type="number"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  onChange={(e) => setContactNumber(e.target.value)}
                  value={contact_number}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Query About</label>
                  <select
                    className="p-3 rounded-lg border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none bg-prim dark:bg-drkp text-text dark:text-prim appearance-none"
                    onChange={(e) => setQueryAbout(e.target.value)}
                    value={query_about}
                    required
                  >
                    <option>Select Query About</option>
                    <option>Admission</option>
                    <option>Hostel</option>
                    <option>Department</option>
                    <option>Controller of Examination</option>
                    <option>Others</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Category</label>
                  <select
                    className="p-3 rounded-lg border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none bg-prim dark:bg-drkp text-text dark:text-prim appearance-none"
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                    required
                  >
                    <option value="">Select category</option>
                    <option>Alumni</option>
                    <option>Student</option>
                    <option>Parent</option>
                    <option>Industry Partner</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Your Message</label>
                <textarea
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-prim dark:bg-drkts rounded-lg py-3 text-center font-extrabold text-xl tracking-widest text-[#800000]">{captcha}</div>
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  placeholder="Enter Captcha"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] text-white"}`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grievance Table */}
      <div className="p-6">
        <h2 className="text-center text-xl font-bold text-[#800000] dark:text-drkt mb-4">
          Grievance Contact Levels
        </h2>

        <div className="admin-controls-gr flex justify-end mb-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mr-20"
            onClick={() => { setgrEdit(!gredit);
              setSavedOnce(false); // Reset saved status on edit/cancel
              setChangeList([]); // Clear pending changes
              setEditableData(grievanceData);  }}
          >
            <Pencil size={16} /> Edit
          </button>
        </div>

        <div className="overflow-x-auto">
        {grievanceData && grievanceData.length > 0 ? (
          <table className="w-full border border-gray-300 text-center">
            <thead className="bg-[#808080] text-white">
              <tr>
                <th className="p-2 border">Section & Level</th>
                {section.map((header, idx) => (
                  <th key={idx} className="p-2 border">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Level 1 */}
              <tr>
                <td className="p-2 border">Level 1</td>
                <td colSpan={editableSection.length} className="p-2 border text-center">
                  {gredit ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editableLevel1.Administrative_Officer}
                        onChange={(e) => handleEditChange("level1", "Administrative_Officer", e.target.value)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full"
                        placeholder="Administrative Officer"
                        required
                      />
                      <input
                        type="text"
                        value={editableLevel1.ph}
                        onChange={(e) => handleEditChange("level1", "ph", e.target.value)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full"
                        placeholder="Phone Number"
                        required
                      />
                      <input
                        type="text"
                        value={editableLevel1.email_id}
                        onChange={(e) => handleEditChange("level1", "email_id", e.target.value)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full"
                        placeholder="Email ID"
                      />
                      <input
                        type="text"
                        value={editableLevel1.Online_Help_desk}
                        onChange={(e) => handleEditChange("level1", "Online_Help_desk", e.target.value)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full"
                        placeholder="Online Help Desk"
                      />
                    </div>
                  ) : (
                    <>
                      <span>{editableLevel1.Administrative_Officer}</span><br />
                      <span>ph: {editableLevel1.ph || "-"}</span><br />
                      <a href={`mailto:${editableLevel1.email_id}`} className="dark:text-drka">
                        Email ID: {editableLevel1.email_id || "-"}
                      </a>
                      <span>, Online Help desk: </span>
                      <a href={`https://${editableLevel1.Online_Help_desk}`} className="dark:text-drka">
                        {editableLevel1.Online_Help_desk || "-"}
                      </a>
                    </>
                  )}
                </td>
              </tr>

              {/* Levels 2, 3, 4 */}
              {[
                { level: "level2", data: editableLevel2 },
                { level: "level3", data: editableLevel3 },
                { level: "level4", data: editableLevel4 },
              ].map((levelItem, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">Level {idx + 2}</td>
                  {editableSection.map((sec, i) => {
                    const key = sec.toLowerCase().replace(/\s|&/g, "");
                    return (
                      <td key={i} className="p-2 border">
                        {gredit ? (
                          <input
                            type="text"
                            value={levelItem.data[key] || ""}
                            onChange={(e) => handleEditChange(levelItem.level, key, e.target.value)}
                            className="w-full text-center bg-transparent border-b-2 border-gray-300 focus:border-[#800000]"
                          />
                        ) : (
                          levelItem.data[key] || "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Level 5 */}
              {editableLevel5 && (
                <tr>
                  <td className="p-2 border">Level 5</td>
                  <td colSpan={editableSection.length} className="p-2 border">
                    {gredit ? (
                      <textarea
                        value={editableLevel5[0] || ""}
                        onChange={(e) => handleEditChange("level5", null, e.target.value, 0)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full resize-y"
                        rows="2"
                      />
                    ) : (
                      editableLevel5[0]
                    )}
                  </td>
                </tr>
              )}

              {/* Another section */}
              {editableAnother && editableAnother.length > 0 && (
                <tr>
                  <td className="p-3 border" colSpan={Math.ceil(editableSection.length / 2) + 1}>
                    {gredit ? (
                      <textarea
                        value={editableAnother[0] || ""}
                        onChange={(e) => handleEditChange("another", null, e.target.value, 0)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full resize-y"
                        rows="2"
                      />
                    ) : (
                      editableAnother[0]
                    )}
                  </td>
                  <td colSpan={Math.floor(editableSection.length / 2)} className="p-3 border">
                    {gredit ? (
                      <textarea
                        value={editableAnother[1] || ""}
                        onChange={(e) => handleEditChange("another", null, e.target.value, 1)}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] w-full resize-y"
                        rows="2"
                      />
                    ) : (
                      editableAnother[1]
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p>Loading grievance table...</p>
        )}
      </div>

             {gredit && (
                <div className="flex justify-end gap-2 mt-4">
                  <button 
                    className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleSaveClick(true)} 
                    className="px-4 py-1 bg-[#800000] text-white rounded"
                  >
                    Save
                  </button>
                </div>
              )}
             {!gredit && savedOnce && (
                    <div className="flex justify-end gap-3 mt-6 mb-4">
                      <button 
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                        onClick={handleDiscardChanges}
                      >
                        Discard Changes
                      </button>
                      <button 
                        className="px-4 py-2 bg-yellow-400 text-black rounded flex items-center gap-2" 
                        onClick={() => setShowPopup(true)}
                      >
                        <Send size={16} /> Request
                      </button>
                    </div>
                  )}
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>

            {/* Modal */}
            {showPopup && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[750px] max-h-[80vh] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4">Final Request for the Changes</h2>
                  <p className="text-red-600 mb-4">
                    <span className="font-medium">Note:</span> Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
                  </p>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="border p-2">Action</th>
                        <th className="border p-2">Section</th>
                        <th className="p-2 border">changes</th>
                        <th className="border p-2">Undo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeList.length === 0 ? (
                        <tr>
                          <td className="p-2" colSpan={3}>No pending changes.</td>
                        </tr>
                      ) : (
                        changeList.map((req, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2 border">Edited</td>
                            <td className="p-2 border capitalize">Help Desk</td>
                            <td className="p-2 border">
                              {req.action}
                            </td>
                            <td className="p-2 py-2 border">
                              <button className="" onClick={() => handleUndoChange(idx)}>
                                <X size={16} className="text-red-500 hover:text-red-700" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowPopup(false)}>Cancel</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                onClick={handleFinalRequest}
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

export default AdminGrievanceForm;