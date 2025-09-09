import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./hostelfacilities.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HostelFacilities({ hostelData }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return encodeURI(path?.startsWith("http") ? path : `${BASE_URL}${path}`);
  };

  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loadedImages, setLoadedImages] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isPageView, setIsPageView] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [deletedFacilities, setDeletedFacilities] = useState([]);
  const [changes, setChanges] = useState({
    modified: [],
    added: [],
    deleted: []
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null
  });

  useEffect(() => {
    if (hostelData) {
      setFacilitiesData(hostelData);
      // Add unique IDs to each facility for proper tracking
      const dataWithIds = hostelData.map((item, index) => ({
        ...item,
        id: item.id || index // Use existing ID or create one
      }));
      setFacilitiesData(dataWithIds);
      setOriginalData(JSON.parse(JSON.stringify(dataWithIds)));
    }
  }, [hostelData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setExpandedId(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check for changes
  useEffect(() => {
    if (!originalData) return;
    
    // Compare current data with original data
    const hasDataChanged = 
      JSON.stringify(facilitiesData) !== JSON.stringify(originalData) || 
      deletedFacilities.length > 0;
    
    setHasChanges(hasDataChanged);
  }, [facilitiesData, originalData, deletedFacilities]);

  const handleExpand = (id) => {
    if (isMobile) {
      setExpandedId(expandedId === id ? null : id);
    }
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpload = () => {
    if (!formData.title || !formData.description || !formData.image) {
      toast.error("Please fill all fields");
      return;
    }

    const newFacility = {
      id: Date.now(), // Temporary ID
      title: formData.title,
      description: formData.description,
      image_path: URL.createObjectURL(formData.image)
    };

    setFacilitiesData([...facilitiesData, newFacility]);
    // toast.success("New facility added successfully!");
    setShowPopup(false);
    setFormData({ title: "", description: "", image: null });
  };

  const handleDelete = (index) => {
    const facilityToDelete = facilitiesData[index];
    const updatedData = [...facilitiesData];
    updatedData.splice(index, 1);
    setFacilitiesData(updatedData);
    setDeletedFacilities([...deletedFacilities, facilityToDelete]);
    toast.info(`"${facilityToDelete.title}" deleted`);
  };

  const handleEdit = (index, field, value) => {
    const updatedData = [...facilitiesData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    setFacilitiesData(updatedData);
  };

  const analyzeChanges = () => {
    if (!originalData) return;
    
    const changesDetected = {
      modified: [],
      added: [],
      deleted: []
    };
    
    // Check for added facilities (facilities that exist in current data but not in original)
    facilitiesData.forEach(facility => {
      const isNew = !originalData.some(original => original.id === facility.id);
      if (isNew) {
        changesDetected.added.push(`"${facility.title}"`);
      }
    });
    
    // Check for deleted facilities
    if (deletedFacilities.length > 0) {
      deletedFacilities.forEach(facility => {
        changesDetected.deleted.push(`"${facility.title}"`);
      });
    }
    
    // Check for modified facilities (facilities that exist in both but have different values)
    facilitiesData.forEach(facility => {
      const originalFacility = originalData.find(orig => orig.id === facility.id);
      if (originalFacility) {
        // Check if title or description has changed
        const titleChanged = facility.title !== originalFacility.title;
        const descriptionChanged = facility.description !== originalFacility.description;
        
        if (titleChanged || descriptionChanged) {
          let changeDescription = "";
          if (titleChanged && descriptionChanged) {
            changeDescription = `"${originalFacility.title}" → "${facility.title}" (title & description)`;
          } else if (titleChanged) {
            changeDescription = `"${originalFacility.title}" → "${facility.title}" (title)`;
          } else if (descriptionChanged) {
            changeDescription = `"${facility.title}" (description)`;
          }
          changesDetected.modified.push(changeDescription);
        }
      }
    });
    
    // Only show popup if there are actual changes
    const hasRealChanges = 
      changesDetected.modified.length > 0 || 
      changesDetected.added.length > 0 || 
      changesDetected.deleted.length > 0;
    
    if (hasRealChanges) {
      setChanges(changesDetected);
      setShowRequestModal(true);
    } else {
      toast.info("No changes detected");
    }
  };

  const handleRequestConfirm = () => {
    console.log("Saving data:", facilitiesData);
    toast.success("Request submitted successfully!");
    setEditMode(false);
    setIsPageView(false);
    setShowRequestModal(false);
    setOriginalData(JSON.parse(JSON.stringify(facilitiesData)));
    setDeletedFacilities([]);
    setHasChanges(false);
  };

  const cancelChanges = () => {
    setFacilitiesData(JSON.parse(JSON.stringify(originalData)));
    setEditMode(false);
    setIsPageView(false);
    setChanges({ modified: [], added: [], deleted: [] });
    setDeletedFacilities([]);
    setHasChanges(false);
    toast.info("Changes have been reverted");
  };

  const togglePageView = () => {
    setIsPageView(!isPageView);
    // When exiting page view, go back to edit mode
    if (isPageView) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  };

  return (
    <>
      {facilitiesData && facilitiesData.length > 0 ? (
        <div className="hos-facility">
          {/* Top Right Buttons */}
          <div className="hos-top-buttons">
            {!editMode && !isPageView && (
              <button className="hos-edit-btn mr-5" onClick={() => setEditMode(true)}>
                ✎ Edit
              </button>
            )}
            {editMode && !isPageView && (
              <>
                <button
                  className="hos-cancel-btn mr-5"
                  onClick={cancelChanges}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <motion.h2
            className="hos-hostel-head"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Facilities
          </motion.h2>

          <div className="hos-facilities-wrapper">
            <motion.div className="hos-hostal-fac-container">
              {facilitiesData?.map((facility, index) => (
                <motion.div
                  key={facility.id || index}
                  className={`hos-hostel-fac-item ${
                    isMobile && expandedId === index ? "hos-expanded" : ""
                  }`}
                >
                  <div
                    className="hos-image-container"
                    onClick={() => handleExpand(index)}
                  >
                    {/* Delete icon (only in edit mode) */}
                    {editMode && !isPageView && (
                      <button
                        className="hos-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(index);
                        }}
                      >
                        ×
                      </button>
                    )}
                    <div
                      className="hos-loading-placeholder"
                      style={{ opacity: loadedImages[index] ? 0 : 1 }}
                    />
                    <img
                      className="hos-facility-image"
                      src={UrlParser(facility.image_path)}
                      alt={facility.title}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </div>

                  <div className="hos-text-content">
                    {editMode && !isPageView ? (
                      <>
                        <input
                          type="text"
                          value={facility.title}
                          onChange={(e) => handleEdit(index, "title", e.target.value)}
                          className="hos-edit-input"
                        />
                        <textarea
                          value={facility.description}
                          onChange={(e) => handleEdit(index, "description", e.target.value)}
                          className="hos-edit-textarea"
                        />
                      </>
                    ) : (
                      <>
                        <h2>{facility.title}</h2>
                        <p>{facility.description}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Extra Box for Adding New Facility */}
              {editMode && !isPageView && (
                <div
                  className="hos-hostel-fac-item hos-add-box"
                  onClick={() => setShowPopup(true)}
                >
                  <div className="hos-plus-icon">+</div>
                  <p>Add New</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Request Button in Page View mode */}
          {isPageView && (
            <div className="hos-request-button-container">
              <button className="hos-request-btn " onClick={analyzeChanges}>Request</button>
            </div>
          )}

         
          {hasChanges && (
            <div className="hos-page-view-button-container">
              {!isPageView ? (
                <button className="hos-page-view-btn" onClick={togglePageView}>
                  save
                </button>
              ) : (
                <button className="hos-exit-page-view-btn-1" onClick={togglePageView}>
                  Back To Edit
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="hos-loading-container">
          <LoadComp />
        </div>
      )}

      {/* Add Facility Popup Modal */}
      {showPopup && (
        <div className="hos-modal-overlay">
          <div className="hos-modal">
            <h2>Add Facility</h2>
            <input
              type="file"
              name="image"
              onChange={handleFormChange}
              accept="image/*"
            />
            <input
              type="text"
              name="title"
              placeholder="Enter Title"
              value={formData.title}
              onChange={handleFormChange}
            />
            <textarea
              name="description"
              placeholder="Enter Description"
              value={formData.description}
              onChange={handleFormChange}
            />
            <div className="hos-modal-actions">
              <button onClick={handleUpload}>Upload</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="hos-request-modal-overlay">
          <div className="hos-request-modal">
            <h2 className="hos-request-title">Final Request for the Changes</h2>
            <p className="hos-request-note">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live site.
            </p>
            <div className="hos-request-table">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Section</th>
                    <th>Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.added.length > 0 && changes.added.map((change, index) => (
                    <tr key={`added-${index}`}>
                      <td>➕ Added</td>
                      <td>Facilities</td>
                      <td>{change}</td>
                    </tr>
                  ))}
                  {changes.deleted.length > 0 && changes.deleted.map((change, index) => (
                    <tr key={`deleted-${index}`}>
                      <td>🗑️ Deleted</td>
                      <td>Facilities</td>
                      <td>{change}</td>
                    </tr>
                  ))}
                  {changes.modified.length > 0 && changes.modified.map((change, index) => (
                    <tr key={`modified-${index}`}>
                      <td>✎ Edited</td>
                      <td>Facilities</td>
                      <td>{change}</td>
                    </tr>
                  ))}
                  {changes.added.length === 0 && changes.deleted.length === 0 && changes.modified.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{textAlign: 'center'}}>No changes detected</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="hos-modal-actions">
              <button onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button onClick={handleRequestConfirm}>Final Request</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}