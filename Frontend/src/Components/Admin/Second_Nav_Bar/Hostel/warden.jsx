import { useEffect, useState } from "react";
import "./warden.css";
import LoadComp from "../../LoadComp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Warden({ hostelData }) {
  const [chief, setChief] = useState(null);
  const [chiefDeputy, setChiefDeputy] = useState(null);
  const [boysWardens, setBoysWardens] = useState([]);
  const [girlsWardens, setGirlsWardens] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isPageView, setIsPageView] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [currentWardenType, setCurrentWardenType] = useState("");
  const [changes, setChanges] = useState({
    modified: [],
    added: [],
    deleted: []
  });

  const [newWarden, setNewWarden] = useState({
    warden_name: "",
    designation: "",
    phone_number: "",
    image: null
  });

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (hostelData?.length > 0) {
      const wardenData = hostelData.find(item => item.category === "warden");
      const maleWardenData = hostelData.find(item => item.category === "male_warden");
      const femaleWardenData = hostelData.find(item => item.category === "female_warden");

      if (wardenData?.members?.length) {
        setChief(wardenData.members[0] || null);
        setChiefDeputy(wardenData.members[1] || null);
      }

      setBoysWardens(maleWardenData?.members || []);
      setGirlsWardens(femaleWardenData?.members || []);
      
      setOriginalData({
        chief: wardenData?.members[0] || null,
        chiefDeputy: wardenData?.members[1] || null,
        boysWardens: maleWardenData?.members || [],
        girlsWardens: femaleWardenData?.members || []
      });
    }
  }, [hostelData]);

  useEffect(() => {
    if (!originalData) return;
    
    // Create a more robust comparison that doesn't rely on array order
    const hasChiefChanged = chief && originalData.chief 
      ? JSON.stringify(chief) !== JSON.stringify(originalData.chief)
      : chief !== originalData.chief;
      
    const hasChiefDeputyChanged = chiefDeputy && originalData.chiefDeputy 
      ? JSON.stringify(chiefDeputy) !== JSON.stringify(originalData.chiefDeputy)
      : chiefDeputy !== originalData.chiefDeputy;
    
    // Compare arrays by content rather than order
    const compareArrays = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return true;
      
      const arr1Str = arr1.map(item => JSON.stringify(item)).sort().join('|');
      const arr2Str = arr2.map(item => JSON.stringify(item)).sort().join('|');
      
      return arr1Str !== arr2Str;
    };
    
    const hasBoysWardensChanged = compareArrays(boysWardens, originalData.boysWardens);
    const hasGirlsWardensChanged = compareArrays(girlsWardens, originalData.girlsWardens);
    
    const hasDataChanged = 
      hasChiefChanged ||
      hasChiefDeputyChanged ||
      hasBoysWardensChanged ||
      hasGirlsWardensChanged;
    
    setHasChanges(hasDataChanged);
  }, [chief, chiefDeputy, boysWardens, girlsWardens, originalData]);

  const handlePhoneInput = (e) => {
    // Allow only digits and limit to 10 characters
    return e.target.value.replace(/\D/g, '').slice(0, 10);
  };

  const handleEdit = (type, index, field, value) => {
    switch (type) {
      case 'chief':
        setChief({ ...chief, [field]: value });
        break;
      case 'chiefDeputy':
        setChiefDeputy({ ...chiefDeputy, [field]: value });
        break;
      case 'boysWardens':
        const updatedBoys = [...boysWardens];
        updatedBoys[index] = { ...updatedBoys[index], [field]: value };
        setBoysWardens(updatedBoys);
        break;
      case 'girlsWardens':
        const updatedGirls = [...girlsWardens];
        updatedGirls[index] = { ...updatedGirls[index], [field]: value };
        setGirlsWardens(updatedGirls);
        break;
      default:
        break;
    }
  };

  const handleImageUpload = (type, index, file) => {
    if (!file) return;
    
    const imageUrl = URL.createObjectURL(file);
    
    switch (type) {
      case 'chief':
        setChief({ ...chief, image_path: imageUrl });
        break;
      case 'chiefDeputy':
        setChiefDeputy({ ...chiefDeputy, image_path: imageUrl });
        break;
      case 'boysWardens':
        const updatedBoys = [...boysWardens];
        updatedBoys[index] = { ...updatedBoys[index], image_path: imageUrl };
        setBoysWardens(updatedBoys);
        break;
      case 'girlsWardens':
        const updatedGirls = [...girlsWardens];
        updatedGirls[index] = { ...updatedGirls[index], image_path: imageUrl };
        setGirlsWardens(updatedGirls);
        break;
      default:
        break;
    }
  };

  const handleDelete = (type, index) => {
    if (type === 'boysWardens') {
      const updatedBoys = [...boysWardens];
      updatedBoys.splice(index, 1);
      setBoysWardens(updatedBoys);
      toast.info("Boys warden deleted");
    } else if (type === 'girlsWardens') {
      const updatedGirls = [...girlsWardens];
      updatedGirls.splice(index, 1);
      setGirlsWardens(updatedGirls);
      toast.info("Girls warden deleted");
    }
  };

  const handleAddWarden = () => {
    if (!newWarden.warden_name.trim() || !newWarden.designation.trim() || !newWarden.phone_number || !newWarden.image) {
      toast.error("Please fill all fields");
      return;
    }

    if (newWarden.phone_number.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    const newWardenData = {
      warden_name: newWarden.warden_name.trim(),
      designation: newWarden.designation.trim(),
      phone_number: newWarden.phone_number,
      image_path: URL.createObjectURL(newWarden.image)
    };

    if (currentWardenType === 'boysWardens') {
      setBoysWardens([...boysWardens, newWardenData]);
    } else if (currentWardenType === 'girlsWardens') {
      setGirlsWardens([...girlsWardens, newWardenData]);
    }

    toast.success("New warden added successfully!");
    setShowAddModal(false);
    setNewWarden({
      warden_name: "",
      designation: "",
      phone_number: "",
      image: null
    });
  };

  const analyzeChanges = () => {
    if (!originalData) return;
    
    const changesDetected = {
      modified: [],
      added: [],
      deleted: []
    };
    
    // Check for modified chief warden
    if (JSON.stringify(chief) !== JSON.stringify(originalData.chief)) {
      changesDetected.modified.push(`Chief Warden: ${chief?.warden_name}`);
    }
    
    // Check for modified deputy chief warden
    if (JSON.stringify(chiefDeputy) !== JSON.stringify(originalData.chiefDeputy)) {
      changesDetected.modified.push(`Deputy Chief Warden: ${chiefDeputy?.warden_name}`);
    }
    
    // Check for boys wardens changes
    const originalBoysMap = new Map(originalData.boysWardens.map((w, i) => [i, w]));
    const currentBoysMap = new Map(boysWardens.map((w, i) => [i, w]));
    
    // Check for modifications
    boysWardens.forEach((warden, index) => {
      if (index < originalData.boysWardens.length) {
        const originalWarden = originalData.boysWardens[index];
        if (JSON.stringify(warden) !== JSON.stringify(originalWarden)) {
          changesDetected.modified.push(`Boys Warden: ${warden.warden_name}`);
        }
      }
    });
    
    // Check for added boys wardens
    if (boysWardens.length > originalData.boysWardens.length) {
      for (let i = originalData.boysWardens.length; i < boysWardens.length; i++) {
        changesDetected.added.push(`Boys Warden: ${boysWardens[i].warden_name}`);
      }
    }
    
    // Check for deleted boys wardens
    if (boysWardens.length < originalData.boysWardens.length) {
      const originalNames = originalData.boysWardens.map(w => w.warden_name);
      const currentNames = boysWardens.map(w => w.warden_name);
      
      originalNames.forEach(name => {
        if (!currentNames.includes(name)) {
          changesDetected.deleted.push(`Boys Warden: ${name}`);
        }
      });
    }
    
    // Check for girls wardens changes
    const originalGirlsMap = new Map(originalData.girlsWardens.map((w, i) => [i, w]));
    const currentGirlsMap = new Map(girlsWardens.map((w, i) => [i, w]));
    
    // Check for modifications
    girlsWardens.forEach((warden, index) => {
      if (index < originalData.girlsWardens.length) {
        const originalWarden = originalData.girlsWardens[index];
        if (JSON.stringify(warden) !== JSON.stringify(originalWarden)) {
          changesDetected.modified.push(`Girls Warden: ${warden.warden_name}`);
        }
      }
    });
    
    // Check for added girls wardens
    if (girlsWardens.length > originalData.girlsWardens.length) {
      for (let i = originalData.girlsWardens.length; i < girlsWardens.length; i++) {
        changesDetected.added.push(`Girls Warden: ${girlsWardens[i].warden_name}`);
      }
    }
    
    // Check for deleted girls wardens
    if (girlsWardens.length < originalData.girlsWardens.length) {
      const originalNames = originalData.girlsWardens.map(w => w.warden_name);
      const currentNames = girlsWardens.map(w => w.warden_name);
      
      originalNames.forEach(name => {
        if (!currentNames.includes(name)) {
          changesDetected.deleted.push(`Girls Warden: ${name}`);
        }
      });
    }
    
    if (changesDetected.modified.length > 0 || 
        changesDetected.added.length > 0 || 
        changesDetected.deleted.length > 0) {
      setChanges(changesDetected);
      setShowRequestModal(true);
    } else {
      toast.info("No changes detected");
    }
  };

  const handleRequestConfirm = () => {
    console.log("Saving warden data:", { chief, chiefDeputy, boysWardens, girlsWardens });
    toast.success("Request submitted successfully!");
    setEditMode(false);
    setIsPageView(false);
    setShowRequestModal(false);
    setOriginalData({ chief, chiefDeputy, boysWardens, girlsWardens });
    setHasChanges(false);
    // Reset changes tracking
    setChanges({ modified: [], added: [], deleted: [] });
  };

  const cancelChanges = () => {
    setChief(originalData.chief);
    setChiefDeputy(originalData.chiefDeputy);
    setBoysWardens(originalData.boysWardens);
    setGirlsWardens(originalData.girlsWardens);
    setEditMode(false);
    setIsPageView(false);
    setChanges({ modified: [], added: [], deleted: [] });
    setHasChanges(false);
    toast.info("Changes have been reverted");
  };

  const togglePageView = () => {
    setIsPageView(!isPageView);
    if (isPageView) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  };

  const openAddModal = (wardenType) => {
    setCurrentWardenType(wardenType);
    setShowAddModal(true);
  };

  const EmptyCardWithAddButton = ({ wardenType }) => {
    return (
      <div className="warden-card-flex empty-card">
        <button 
          className="warden-add-empty-btn"
          onClick={() => openAddModal(wardenType)}
        >
          + Add {wardenType === 'boysWardens' ? 'Boys' : 'Girls'} Warden
        </button>
      </div>
    );
  };

  const WardenCard = ({ warden, type, index, isEditable }) => {
    if (!warden) return null;

    // Check if this is Dr. SATISH KUMAR S
    const isSatishKumar = warden.warden_name && warden.warden_name.toLowerCase().includes("satish kumar");

    return (
      <div className="warden-card-flex">
        <div className="warden-image-container">
          <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
          {isEditable && (
            <label className="warden-image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(type, index, e.target.files[0])}
                className="hidden"
              />
              📤
            </label>
          )}
        </div>
        <div className="warden-info-ed">
          {isEditable ? (
            <>
                <input
                  type="text"
                  value={warden.warden_name || ""}
                  onChange={(e) => handleEdit(type, index, "warden_name", e.target.value)}
                  className="warden-edit-input"
                  placeholder="Warden Name"
                />
              <input
                type="text"
                value={warden.designation || ""}
                onChange={(e) => handleEdit(type, index, "designation", e.target.value)}
                className="warden-edit-input"
                placeholder="Designation"
              />
              {/* Don't show phone number field for Dr. SATISH KUMAR S */}
              {!isSatishKumar && (
                <input
                  type="text"
                  value={warden.phone_number || ""}
                  onChange={(e) => {
                    const phoneValue = handlePhoneInput(e);
                    handleEdit(type, index, "phone_number", phoneValue);
                  }}
                  className="warden-edit-input"
                  placeholder="Phone Number"
                  maxLength="10"
                />
              )}
              {(type === 'boysWardens' || type === 'girlsWardens') && (
                <button
                  className="warden-delete-btn"
                  onClick={() => handleDelete(type, index)}
                >
                  🗑️ Delete
                </button>
              )}
            </>
          ) : (
            <>
              <p>{warden.warden_name}</p>
              <p>{warden.designation}</p>
              {/* Don't show phone number for Dr. SATISH KUMAR S */}
              {warden.phone_number && !isSatishKumar && <a href={`tel:${warden.phone_number}`}>{warden.phone_number}</a>}
            </>
          )}
        </div>
      </div>
    );
  };

  if (!chief || !chiefDeputy || boysWardens.length === 0 || girlsWardens.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <div className="warden-top-buttons">
        {!editMode && !isPageView && (
          <button className="warden-edit-btn mt-3 mr-5" onClick={() => setEditMode(true)}>
            ✎ Edit
          </button>
        )}
        {editMode && !isPageView && (
          <>
            <button
              className="warden-cancel-btn mt-3 mr-5"
              onClick={cancelChanges}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <h2 className="warden-heading1 text-brwn text-3xl font-bold dark:text-drkt mt-10 font-[poppins]">Wardens</h2>

      <div className="warden-top-column font-[poppins]">
        <WardenCard warden={chief} type="chief" index={0} isEditable={editMode && !isPageView} />
        <WardenCard warden={chiefDeputy} type="chiefDeputy" index={0} isEditable={editMode && !isPageView} />
      </div>

      {/* Boys Wardens */}
      <div className="warden-section-header">
        <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 font-[poppins]">
          Boys Warden
        </h2>
      </div>
      <div className="warden-row font-[poppins]">
        {boysWardens.map((warden, index) => (
          <WardenCard 
            key={index} 
            warden={warden} 
            type="boysWardens" 
            index={index} 
            isEditable={editMode && !isPageView} 
          />
        ))}
        {editMode && !isPageView && (
          <EmptyCardWithAddButton wardenType="boysWardens" />
        )}
      </div>

      {/* Girls Wardens */}
      <div className="warden-section-header">
        <h2 className="warden-section-title text-brwn dark:text-drkt mt-10">
          Girls Warden
        </h2>
      </div>
      <div className="warden-row font-[poppins]">
        {girlsWardens.map((warden, index) => (
          <WardenCard 
            key={index} 
            warden={warden} 
            type="girlsWardens" 
            index={index} 
            isEditable={editMode && !isPageView} 
          />
        ))}
        {editMode && !isPageView && (
          <EmptyCardWithAddButton wardenType="girlsWardens" />
        )}
      </div>

      {isPageView && (
        <div className="warden-request-button-container">
          <button className="warden-request-btn-1 mr-5" onClick={analyzeChanges}>Request</button>
        </div>
      )}

      {hasChanges && (
        <div className="warden-page-view-button-container">
          {!isPageView ? (
            <button className="warden-page-view-btn mb-2" onClick={togglePageView}>
              Save
            </button>
          ) : (
            <button className="warden-exit-page-view-btn mb-2" onClick={togglePageView}>
              Back To Edit
            </button>
          )}
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />

      {showAddModal && (
        <div className="warden-modal-overlay">
          <div className="warden-modal">
            <h2>Add {currentWardenType === 'boysWardens' ? 'Boys' : 'Girls'} Warden</h2>
            <div className="warden-modal-input-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewWarden({...newWarden, image: e.target.files[0]})}
              />
            </div>
            <div className="warden-modal-input-group">
              <label>Warden Name:</label>
              <input
                type="text"
                placeholder="Warden Name"
                value={newWarden.warden_name}
                onChange={(e) => setNewWarden({...newWarden, warden_name: e.target.value})}
              />
            </div>
            <div className="warden-modal-input-group">
              <label>Designation:</label>
              <input
                type="text"
                placeholder="Designation"
                value={newWarden.designation}
                onChange={(e) => setNewWarden({...newWarden, designation: e.target.value})}
              />
            </div>
            <div className="warden-modal-input-group">
              <label>Phone Number:</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={newWarden.phone_number}
                onChange={(e) => {
                  const phoneValue = handlePhoneInput(e);
                  setNewWarden({...newWarden, phone_number: phoneValue});
                }}
                maxLength="10"
              />
            </div>
            <div className="warden-modal-actions">
              <button onClick={handleAddWarden}>Add</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="warden-request-modal-overlay">
          <div className="warden-request-modal">
            <h2 className="warden-request-title">Final Request for the Changes</h2>
            <p className="warden-request-note">
              Note: Your changes will stay pending until approved by the superior
              admin. Once approved, they will be applied automatically to the live site.
            </p>
            <div className="warden-request-table">
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
                      <td>Wardens</td>
                      <td>{change}</td>
                    </tr>
                  ))}
                  {changes.deleted.length > 0 && changes.deleted.map((change, index) => (
                    <tr key={`deleted-${index}`}>
                      <td>🗑️ Deleted</td>
                      <td>Wardens</td>
                      <td>{change}</td>
                    </tr>
                  ))}
                  {changes.modified.length > 0 && changes.modified.map((change, index) => (
                    <tr key={`modified-${index}`}>
                      <td>✎ Edited</td>
                      <td>Wardens</td>
                      <td>{change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="warden-modal-actions">
              <button onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button onClick={handleRequestConfirm}>Final Request</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}