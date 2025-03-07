import React, { useState, useEffect } from 'react';
import { Send, Info, Check } from 'lucide-react';
import './Studentprofile.css';

function Studentprofile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [formData, setFormData] = useState(null);
  const [initialFormData, setInitialFormData] = useState(formData);
  const [changedFields, setChangedFields] = useState({});

  // Fetch profile data from the backend when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/fetch_student_profile');
        const data = await response.json();
        
        if (response.ok) {
          setFormData(data);
          setInitialFormData(data);

          if (data.edit_status === null) {  // ✅ "Pending" (case-sensitive fix)
            setIsWaitingApproval(true);
            setPendingChanges(data.changes || []); // ✅ Directly store the pending changes
          } else {
            setIsWaitingApproval(false);
            setPendingChanges([]);
          }
          
        } else {
          console.error('Failed to fetch profile:', data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setInitialFormData(formData); //Not in GPT
    setHasChanges(false);
    setChangedFields({});
  };

  const handleRequestChange = async () => {
    let changes = {};
    let foodTypeChanged = false;
    let profileChanged = false;
  
    // Identify what has changed
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialFormData[key]) {
        changes[key] = formData[key];
  
        if (key === "foodType") {
          foodTypeChanged = true; // Food type changed
        } else {
          profileChanged = true; // Other profile fields changed
        }
      }
    });
  
    setChangedFields(changes);
    setIsWaitingApproval(true);
    setIsEditing(false);
    setFormData(initialFormData);
  
    try {
      // Send request for food type change
      if (foodTypeChanged) {
        const foodTypeResponse = await fetch("/api/change_food_type", {
          method: "POST",
          credentials: "include", // Needed for session authentication
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admissionNumber: formData.admin_number, // Assuming this is required
            foodType: formData.foodtype,
          }),
        });
  
        if (!foodTypeResponse.ok) {
          const errorData = await foodTypeResponse.json();
          console.error("Food change request failed:", errorData.message);
        } else {
          console.log("Food change request successful.");
        }
      }
  
      // Send request for other profile updates
      if (profileChanged) {
        const profileResponse = await fetch("/api/request_profile_update", {
          method: "POST",
          credentials: "include", // Needed for session authentication
          headers: {
            "Content-Type": "application/json", 
          },
          body: JSON.stringify({
            phone_number_student: formData.phone_number_student,
            phone_number_parent: formData.phone_number_parent,
            name: formData.name,
          }),
        });
  
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          console.error("Profile update request failed:", errorData.message);
        } else {
          console.log("Profile update request successful.");
        }
      }
   
      if (foodTypeChanged || profileChanged) {
        setIsApproved(true);
        setIsWaitingApproval(true);
      }
    } catch (error) {
      console.error("Error requesting change:", error);
    }
    window.location.reload();
  };
  
  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    setHasChanges(true);
  };

  return (
    <div className="student-container">
      {/* Main Content */}
      <div className="student-main">
        <div className="student-form-container">
          <h2 className="student-title">Profile Details</h2>

          <div className="student-profile-section">
            <div className="student-photo-section">
              <img
                src={formData?.profile_photo_path}
                alt={formData?.name}
                className="student-profile-photo"
              />
            </div>

            <div className="student-primary-details">
              <div className="student-form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData?.name}
                  onChange={handleInputChange}
                  disabled={!isEditing || isWaitingApproval}
                  className="student-input"
                />
              </div>

              <div className="student-form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData?.room_number}
                  onChange={handleInputChange}
                  disabled={true}
                  className="student-input"
                />
              </div>

              <div className="student-form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData?.department}
                  onChange={handleInputChange}
                  disabled={true}
                  className="student-input"
                />
              </div>
            </div>
          </div>

          <div className="student-secondary-details">
            <div className="student-form-group">
              <label>Year</label>
              <input
                type="text"
                name="year"
                value={formData?.year}
                onChange={handleInputChange}
                disabled={true}
                className="student-input"
              />
            </div>

            <div className="student-form-group">
              <label>Admission Number</label>
              <input
                type="text"
                name="admissionNumber"
                value={formData?.admin_number}
                onChange={handleInputChange}
                disabled={true}
                className="student-input"
              />
            </div>

            <div className="student-form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData?.city}
                onChange={handleInputChange}
                disabled={true}
                className="student-input"
              />
            </div>

            <div className="student-mobile-numbers">
              <div className="student-form-group">
                <label>Student Mobile</label>
                <input
                  type="tel"
                  name="phone_number_student"
                  value={formData?.phone_number_student}
                  onChange={handleInputChange}
                  disabled={!isEditing || isWaitingApproval}
                  className="student-input"
                />
              </div>

              <div className="student-form-group">
                <label>Parent Mobile</label>
                <input
                  type="tel"
                  name="phone_number_parent"
                  value={formData?.phone_number_parent}
                  onChange={handleInputChange}
                  disabled={!isEditing || isWaitingApproval}
                  className="student-input"
                />
              </div>
            </div>

            <div className="student-food-type">
              <label>Food Type</label>
              <select
                name="foodType"
                // value={formData?.foodtype}
                onChange={handleInputChange}
                disabled={!isEditing || isWaitingApproval}
                className="student-input"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          {isWaitingApproval && pendingChanges && pendingChanges.length > 0 && (
          <div className="student-pending-changes">
            <h3>Pending Changes</h3>
            <div className="pending-changes-grid">
              {pendingChanges.map((change, index) => {
                // Splitting based on ": " to extract field name and new value
                const [field, value] = change.split(/:\s(.+)/); 

                return (
                  <div key={index} className="pending-change-item">
                    <div className="pending-field">{field?.replace(/_/g, " ") || "Unknown Field"}</div>
                    <div className="pending-new-value">{value || "No Value"}</div>
                  </div>
                );
              })}
    </div>
  </div>
)}




<div className="student-actions">
            {isEditing ? (
              <button
                onClick={handleRequestChange}
                disabled={!hasChanges}
                className="student-button-group student-request-button"
              >
                Request Change <Send />
              </button>
            ) : (
              <button
                onClick={handleEdit}
                disabled={isWaitingApproval}
                className="student-button-group student-edit-button"
              >
                Edit Profile <Info />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studentprofile;
