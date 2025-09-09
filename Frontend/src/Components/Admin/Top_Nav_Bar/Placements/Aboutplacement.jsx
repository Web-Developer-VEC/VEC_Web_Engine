import React, { useEffect, useState } from "react";
import "./AdminAboutplacement.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminAboutplacement = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [placementData, setPlacementData] = useState(null);
  const [editing, setEditing] = useState({});
  const [editedData, setEditedData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showRequestButton, setShowRequestButton] = useState(false);
  const [changes, setChanges] = useState([]);
  const [isEditable, setIsEditable] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post("/api/main-backend/placement", {
          type: "about_placement",
        });
        const data = responce.data.data;
        setPlacementData(data);
        setEditedData(data);
      } catch (error) {
        console.error("error fetching Placement Data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, []);

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

  // Function to detect changes
  useEffect(() => {
    if (placementData && editedData) {
      const detectedChanges = [];
      
      Object.keys(editedData).forEach(field => {
        const oldValue = placementData[field];
        const newValue = editedData[field];
        
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          // Determine if it's a deletion or modification
          const isDeleted = newValue === "" || 
                           (Array.isArray(newValue) && newValue.length === 0) ||
                           (Array.isArray(newValue) && newValue.every(item => item === ""));
          
          detectedChanges.push({
            field,
            oldValue,
            newValue,
            type: isDeleted ? "Deleted" : "Modified"
          });
        }
      });
      
      setChanges(detectedChanges);
    }
  }, [editedData, placementData]);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  const toggleEdit = (fields) => {
    if (!isEditable) return;
    
    setEditing((prev) => {
      const isEditing = fields.some((f) => prev[f]);
      const newState = { ...prev };

      fields.forEach((f) => {
        newState[f] = !isEditing;
      });

      if (!isEditing) {
        // start editing
      } else {
        // cancel → reset data
        setEditedData((prevData) => {
          const resetData = { ...prevData };
          fields.forEach((f) => {
            resetData[f] = Array.isArray(placementData[f])
              ? [...placementData[f]]
              : placementData[f];
          });
          return resetData;
        });
      }
      return newState;
    });
  };

  const handleChange = (field, value, index = null) => {
    if (!isEditable) return;
    
    setEditedData((prev) => {
      if (field === "phone") {
        return {
          ...prev,
          phone: value
            .replace("📞Phone:", "")
            .trim()
            .split("/")
            .map((num) => num.trim()),
        };
      }
      if (field === "email") {
        return { 
          ...prev, 
          email: value.replace("✉️Email:", "").trim().split("/").map((email) => email.trim()) 
        };
      }
      if (Array.isArray(prev[field])) {
        const updated = [...prev[field]];
        updated[index] = value;
        return { ...prev, [field]: updated };
      }
      return { ...prev, [field]: value };
    });
  };

  const hasChanges = changes.length > 0;

  const handlePageView = () => {
    // Exit editable state but keep edit buttons visible
    setIsEditable(false);
    setEditing({});
    
    // Show Request button
    setShowRequestButton(true);
  };

  const handleExitPageView = () => {
    // Return to edit mode
    setIsEditable(true);
    
    // Hide Request button
    setShowRequestButton(false);
  };

  const handleRequest = () => {
    setShowPopup(true);
  };

  const cancelSingleChange = (field) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: Array.isArray(placementData[field])
        ? [...placementData[field]]
        : placementData[field],
    }));
    toast.info("Change has been reverted");
  };

  const confirmRequest = () => {
    setShowPopup(false);
    toast.success("Request submitted successfully!");
  };

  const formatFieldName = (field) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderEditable = (field, text, index = null) => (
    <p
      key={index ?? field}
      contentEditable={isEditable && editing[field]}
      suppressContentEditableWarning={true}
      className={`AP-card-text font-[poppins] ${
        editing[field] ? "editable-active" : ""
      } ${!isEditable ? "non-editable" : ""}`}
      onBlur={(e) => handleChange(field, e.currentTarget.innerText, index)}
    >
      {text}
    </p>
  );

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Department"
        subHeaderText="Empowering students' career success by connecting talent with industry leaders and opportunities."
      />

      <div className="AP-main-container">
        {/* Training & Placement */}
        <section className="AP-grid-TPD">
          <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks relative">
            <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">
              Training & Placement Department
            </h2>
            <div>
              {editedData?.Training_Placement_Department?.map((line, i) =>
                renderEditable("Training_Placement_Department", line, i)
              )}
            </div>
            {isEditable && (
              <button
                className="edit-btn absolute top-2 right-4"
                onClick={() => toggleEdit(["Training_Placement_Department"])}
              >
                {editing["Training_Placement_Department"] ? "Cancel" : "Edit"}
              </button>
            )}
          </div>
        </section>

        <section className="AP-grid-VMC">
          {/* Vision and Mission Section */}
          <section className="AP-grid-VM">
            <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks relative">
              <h2 className="AP-card-title font-[poppins] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">
                Our Vision
              </h2>
              {renderEditable("Our_Vision", editedData?.Our_Vision)}
              {isEditable && (
                <button
                  className="edit-btn absolute top-2 right-4"
                  onClick={() => toggleEdit(["Our_Vision"])}
                >
                  {editing["Our_Vision"] ? "Cancel" : "Edit"}
                </button>
              )}
            </div>

            <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks relative">
              <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 font-[poppins] border-secd dark:border-drks">
                Our Mission
              </h2>
              {renderEditable("Our_Mission", editedData?.Our_Mission)}
              {isEditable && (
                <button
                  className="edit-btn absolute top-2 right-4"
                  onClick={() => toggleEdit(["Our_Mission"])}
                >
                  {editing["Our_Mission"] ? "Cancel" : "Edit"}
                </button>
              )}
            </div>
          </section>

          {/* Contact Section */}
          <section className="AP-grid-CPC font-[poppins]">
            <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks relative">
              <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd font-[poppins] dark:border-drks">
                Contact Placement Cell
              </h2>
              <br />
              <h3 className="AP-contact-name font-[poppins] ">
                Head of Placement and Training
              </h3>
              <br />
              {renderEditable("email", `✉️Email: ${editedData?.email}`)}
              {renderEditable("phone", `📞Phone: ${editedData?.phone?.join(" / ")}`)}
              {isEditable && (
                <button
                  className="edit-btn absolute top-2 right-4"
                  onClick={() => toggleEdit(["email", "phone"])}
                >
                  {editing["email"] || editing["phone"] ? "Cancel" : "Edit"}
                </button>
              )}
            </div>
          </section>
        </section>

        <div className="button-container">
          {/* Page View button is always visible */}
          {isEditable && (
            <button className="page-view-btn" onClick={handlePageView}>
              Page View
            </button>
          )}
          
          {!isEditable && (
            <button className="exit-page-view-btn" onClick={handleExitPageView}>
              Exit Page View
            </button>
          )}
          
          {showRequestButton && (
            <button className="request-btn" onClick={handleRequest}>
              Request
            </button>
          )}
        </div>
      </div>

      {/* Popup for Request button */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Review Changes</h3>
            <p className="note-pop">Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.</p>
            
            {changes.length > 0 ? (
              <div className="changes-horizontal-list">
                {changes.map((change, index) => (
                  <div key={index} className="change-item-horizontal">
                    <span className="change-topic">{formatFieldName(change.field)}</span>
                    <span className={`change-type ${change.type.toLowerCase()}`}>
                      {change.type}
                    </span>
                    <button 
                      className="del-bt-horizontal"
                      onClick={() => cancelSingleChange(change.field)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No changes to display.</p>
            )}
            
            <div className="popup-actions">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={confirmRequest}>Send Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Toastify Container */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default AdminAboutplacement;