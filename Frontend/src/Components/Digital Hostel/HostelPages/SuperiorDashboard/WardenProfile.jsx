import React, { useEffect, useState } from "react";
import { X, Edit, Power, Trash2 } from 'lucide-react';
import './WardenProfile.css';
import axios from "axios";
import showSweetAlert from "../Alert";
import Swal from "sweetalert2";

const WardenProfile = () => {
  const [wardens, setWardens] = useState([]);
  const [selectedWarden, setSelectedWarden] = useState(null);
  const [editedWarden, setEditedWarden] = useState(null); // State for edited warden
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalOpenDelete, setconfirmModalOpenDelete] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState(null);
  const [reallocationWardens, setReallocationWardens] = useState([]);
  const [primaryYears, setPrimaryYears] = useState([]);
  const [selectedReallocations, setSelectedReallocations] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWarden, setNewWarden] = useState({
    name: "",
    phone_number: "",
    inCharge: "",
    primaryWarden: [],
    photo: null,
    password: "",
    joinedDate: "",
  });
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const yearToAlphabet = {
    '1': 'First Year',
    '2': 'Second Year',
    '3': 'Third Year',
    '4': 'Fourth Year',
    'MBA 1': 'MBA First Year',
    'MBA 2': 'MBA Second Year',
    'PG1': 'Postgraduate First Year',
    'PG2': 'Postgraduate Second Year'
  };

  // Fetch warden details
  useEffect(() => {
    const fetchWardens = async () => {
      try {
        const response = await axios.get("/api/fetch_warden_details");
        const fetchedWardens = response.data.wardens;

        const formattedWardens = fetchedWardens.map((warden) => ({
          id: warden.unique_id,
          name: warden.warden_name,
          img: warden.image_path,
          wardenFor: warden.primary_year.map((year) => yearToAlphabet[year]).join(", "),
          inCharge: warden.gender === "Male" ? "Boys" : "Girls",
          date: warden.joined_date,
          isActive: warden.active,
          phone_number: warden.phone_number,
          primaryYears: warden.primary_year
        }));  

        setWardens(formattedWardens);
      } catch (err) {
        console.error("Error fetching warden data", err);
      }
    };

    fetchWardens();
  }, []);

  const toggleStatus = async (id) => {

    const warden = wardens.find(w => w.id === id);

    if (!warden) return;
  
    const newStatus = warden.isActive; 
    
    if (newStatus) {
      for (const year of primaryYears) {
        try {
          await axios.post("/api/warden_inactive_status_handling", {
            warden_name: selectedReallocations[year],
            inactive_warden_id: id,
            year: parseInt(year),
          });
        } catch (error) {
          console.error(`Failed to update status for year ${year}:`, error);
        }
      }
    } else {
      try {
        await axios.post('/api/warden_active_status_handling', {
          warden_id: id
        })
      } catch (error) {
        console.error("Error activating the warden",error);
      }
    }
    window.location.reload();
  };

  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedWarden(prev => ({
          ...prev,
          img: reader.result, // For preview
          file: file // Store actual file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedWarden(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReallocationChange = (year, wardenName) => {
    setSelectedReallocations(prev => ({
      ...prev,
      [year]: wardenName // Update the selected warden for the specific year
    }));
  };

  const handleNewWardenChange = (e) => {
    const { name, value } = e.target;
    setNewWarden((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewWardenImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewWarden((prev) => ({
          ...prev,
          photo: reader.result, // For preview
          file: file, // Store actual file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWardenSubmit = async (e) => {
    e.preventDefault();

    const primaryYearArray = newWarden.primaryWarden.map(year => parseInt(year, 10));

    const formData = new FormData();
    formData.append("name", newWarden.name);
    formData.append("phone_number", newWarden.phone_number);
    formData.append("gender", newWarden.inCharge === "Boys" ? "Male" : "Female");
    formData.append("primary_year", JSON.stringify(primaryYearArray ));
    formData.append("password", newWarden.password); // Add password
    formData.append("category", "assistant"); // Assuming category is always "assistant"
    formData.append("joined_date", newWarden.joinedDate); // Add joined date

    if (newWarden.file) {
        formData.append("wardenImage", newWarden.file);
    }

    try {
        const token = localStorage.getItem("authToken");
        const response = await axios.post("/api/add_warden", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 201) {
          Swal.fire({
            title: "Successful",
            text: "Warden Added Successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
              Swal.close();
            },
          });
            setIsAddModalOpen(false);
            setNewWarden({
                name: "",
                phone_number: "",
                inCharge: "",
                primaryWarden: [],
                photo: null,
                password: "",
                joinedDate: "",
            });
            // Optionally, refresh the warden list
            window.location.reload();
        } else {
            alert("Failed to add warden.");
        }
    } catch (error) {
        console.error("Error adding warden", error);
        alert("An error occurred while adding the warden.");
    }
};

  // delete a warden
  const handleDelete = async (registration_number) => {
    console.log(pendingToggleId);
    
    try {
      const response = await fetch("/api/delete_student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ registration_number , type: "warden" }), 
      });
  
      if (response.ok) {
        showSweetAlert("Success!", "Warden data deleted successfully.", "success");
      } else {
        showSweetAlert("Error","Error Deleting The Warden try Again Later",'error');

      }
    } catch (error) {
      console.error("❌ Error deleting warden:", error);
      alert("Error deleting warden. Try again.");
    }
    window.location.reload();
  };

  // Save edited warden details
  const handleSave = async () => {
    if (!editedWarden || !selectedWarden) return;
  
    const updateFields = {};
  
    // Compare edited fields with original fields
    if (editedWarden.name !== selectedWarden.name) {
      updateFields.warden_name = editedWarden.name;
    }
    if (editedWarden.phone_number !== selectedWarden.phone_number) {
      updateFields.phone_number = editedWarden.phone_number;
    }
    if (editedWarden.inCharge !== selectedWarden.inCharge) {
      updateFields.gender = editedWarden.inCharge === "Boys" ? "Male" : "Female";
    }
    if (editedWarden.primaryWarden !== selectedWarden.primaryYears) {
      updateFields.primary_year = editedWarden.primaryWarden; // Send the updated primary years
    }
      
    // Handle file upload
    if (editedWarden.file) {
      updateFields.file = editedWarden.file; // Append the file to updateFields
    }
  
    if (Object.keys(updateFields).length === 0) {
      alert("No changes detected.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("unique_id", selectedWarden.id);
  
      // Append updated fields to formData
      Object.keys(updateFields).forEach(key => {
        if (key === "primary_year" || key === "secondary_year") {
          formData.append(key, JSON.stringify(updateFields[key]));
        } else if (key === "file") {
          formData.append("wardenImage", updateFields.file); // Append the file to FormData
        } else {
          formData.append(key, updateFields[key]);
        }
      });
  
      const token = localStorage.getItem("authToken");
      const response = await axios.post("/api/update_warden_by_superior", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        // alert("Warden details updated successfully!");
        showSweetAlert("Success","Warden Details Updated Successfully","success");
        window.location.reload(); // Refresh to show updated details
      } else {
        // alert("Failed to update warden details.");
        showSweetAlert("Error","Failed to Update The warden Profile","error")
      }
    } catch (error) {
      console.error("Error updating warden details", error);
      showSweetAlert('Error','An error occurred while updating the warden details.','error');
    }
  
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleToggle = async (wardenId) => {
    try {
      const response = await axios.post("/api/fetch_warden_details_reallocation", {
        target_warden_id: wardenId
      });
      setReallocationWardens(response.data.warden_names);
      setPrimaryYears(response.data.primary_years);
    } catch (error) {
      console.error("Error fetching reallocation wardens", error);
    }
  }

  // Open modal and set selected warden
  const openModal = (warden, event) => {
    if (!event.target.closest('.toggle-container')) {
      setSelectedWarden(warden);
      setEditedWarden({
        ...warden,
        primaryWarden: warden.primaryYears || [], // Initialize with primary years
      });
      setIsModalOpen(true);
      setIsEditing(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWarden(null);
    setEditedWarden(null); // Reset editedWarden
    setIsEditing(false);
  };


  return (
    <div className="warden-container">
      <div className="add-buttons">
        <button className="add-warden" onClick={() => setIsAddModalOpen(true)}>
        Add New Warden
        </button>
      </div>
      <div className="wardens-grid">
        {wardens?.map(warden => (
          <div
            key={warden.id}
            className={`hos-warden-card ${warden.inCharge.toLowerCase()}`}
            onClick={(e) => {openModal(warden, e); setPendingToggleId(warden.id);}}
          >
            <div className="warden-content">
              <div className="warden-image-wrapper">
                <img src={UrlParser(warden.img)} alt={warden.name} className="warden-image" />
              </div>
              <div className="warden-info">
                <h3 className="warden-name">{warden.name}</h3>
                <p className="warden-detail">
                  <span className="label">Warden For:</span> {warden.wardenFor}
                </p>
                <p className="warden-detail">
                  <span className="label">In Charge:</span> {warden.inCharge}
                </p>
                <p className="warden-detail">
                  <span className="label">Joined Date:</span> {warden.date}
                </p>
              </div>
              <div className="toggle-container" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`toggle-button ${warden.isActive ? 'active' : ''}`}
                  onClick={() => {
                    setPendingToggleId(warden.id);
                    setConfirmModalOpen(true);
                    handleToggle(warden.id)
                  }}
                >
                  <Power className="toggle-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Warden</h2>
            <form onSubmit={handleAddWardenSubmit}>
              {/* Name */}
              <div className="form-row">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newWarden.name || ""}
                  onChange={handleNewWardenChange}
                  required
                />
              </div>

              {/* Photo */}
              <div className="form-row">
                <label>Photo:</label>
                <input
                  type="file"
                  name="wardenImage"
                  accept="image/*"
                  onChange={handleNewWardenImageChange}
                  className="no-border photo"
                />
              </div>

              {/* Joined Date */}
              <div className="form-row">
                <label>Joined Date:</label>
                <input
                  type="date"
                  name="joinedDate"
                  value={newWarden.joinedDate || ""}
                  onChange={handleNewWardenChange}
                  className="no-border"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-row">
                <label>Phone Number:</label>
                <input
                  type="number"
                  name="phone_number"
                  value={newWarden.phone_number || ""}
                  onChange={handleNewWardenChange}
                  required
                />
              </div>

              {/* Warden For */}
              <div className="form-row">
                <label>Warden For:</label>
                <div className="checkbox-container no-border">
                  {["1", "2", "3", "4", "MBA 1", "MBA 2", "PG1", "PG2"].map((option) => (
                    <div key={option} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="primaryWarden"
                        value={option}
                        checked={newWarden.primaryWarden?.includes(option)}
                        onChange={(e) => {
                          const selectedYear = e.target.value;
                          setNewWarden((prev) => ({
                            ...prev,
                            primaryWarden: prev.primaryWarden?.includes(selectedYear)
                              ? prev.primaryWarden.filter((y) => y !== selectedYear) // Remove if already selected
                              : [...(prev.primaryWarden || []), selectedYear], // Add if not selected
                          }));
                        }}
                      />
                      <label>{yearToAlphabet[option] || option}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Charge */}
              <div className="form-row">
                <label>In Charge:</label>
                <select
                  name="inCharge"
                  value={newWarden.inCharge || ""}
                  onChange={handleNewWardenChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>

              {/* Password */}
              <div className="form-row">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={newWarden.password || ""}
                  onChange={handleNewWardenChange}
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedWarden && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {!isEditing ? (
              <>
                <div className="modal-header">
                  <button className="icon-button edit" onClick={() => setIsEditing(true)}>
                    <Edit size={20} />
                  </button>
                  <button className="icon-button close" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="warden-profile">
                    <img src={UrlParser(selectedWarden.img)} alt={selectedWarden.name} className="profile-image" />
                    <h2 className="profile-name">{selectedWarden.name}</h2>
                    <div className="profile-">
                      <p className="text-left"><span className="label">Warden For:</span> {selectedWarden.wardenFor}</p>
                      <p className="text-left"><span className="label">In Charge:</span> {selectedWarden.inCharge}</p>
                      <p className="text-left"><span className="label">Joined Date:</span> {selectedWarden.date}</p>
                      <p className="text-left"><span className="label">Status:</span> {selectedWarden.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    <button className="delete-button" onClick={() => setconfirmModalOpenDelete(true)}>
                    <Trash2 className="superior-icon" /> Remove Warden
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="edit-form">
                <h2>Edit Warden Profile</h2>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editedWarden?.name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={editedWarden?.phone_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row">
                  <label>Select Primary Years:</label>
                  <div className="checkbox-container no-border">
                    {["1", "2", "3", "4", "MBA 1", "MBA 2", "PG1", "PG2"].map((option) => (
                      <div key={option} className="checkbox-item">
                        <input
                          type="checkbox"
                          name="primaryWarden"
                          value={option}
                          checked={editedWarden?.primaryWarden?.includes(option)} // Reflect current state
                          onChange={(e) => {
                            const selectedYear = e.target.value;
                            setEditedWarden((prev) => {
                              const updatedYears = prev.primaryWarden?.includes(selectedYear)
                                ? prev.primaryWarden.filter((y) => y !== selectedYear) // Remove if already selected
                                : [...(prev.primaryWarden || []), selectedYear]; // Add if not selected
                              return { ...prev, primaryWarden: updatedYears };
                            });
                          }}
                        />
                        <label>{yearToAlphabet[option] || option}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Photo:</label>
                  <input
                    type="file"
                    name="wardenImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </div>
                <div className="form-actions">
                  <button className="cancel-button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="save-button" onClick={handleSave}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmModalOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Action</h3>
            <p>Are you sure you want to {wardens.find(w => w.id === pendingToggleId)?.isActive ? 'deactivate' : 'activate'} this warden?</p>
            {wardens.find(w => w.id === pendingToggleId)?.isActive && (
              <>
                {primaryYears?.map((year, index) => (
                  <div key={index} className="status-year-dropdown">
                    <label className="warden-pri-years">{yearToAlphabet[year]}</label>
                    <select
                      value={selectedReallocations[year] || ""}
                      onChange={(e) => handleReallocationChange(year, e.target.value)}
                      className="warden-status-select"
                    >
                      <option value="" className="warden-status-select">Select Warden</option>
                      {reallocationWardens?.map(warden => (
                        <option key={warden} value={warden} className="warden-status-select">{warden}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}
            <div className="confirm-actions">
              <button className="confirm-button" onClick={() => toggleStatus(pendingToggleId)}>
                Confirm
              </button>
              <button className="cancel-button" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModalOpenDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Action</h3>
            <p>Are you sure you want to {wardens.find(w => w.id === pendingToggleId)?.name} ?</p>
            {console.log("IID",pendingToggleId)
            }
            <div className="confirm-actions">
              <button className="confirm-button" onClick={() => handleDelete(pendingToggleId)}>
                Confirm
              </button>
              <button className="cancel-button" onClick={() => setconfirmModalOpenDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenProfile;