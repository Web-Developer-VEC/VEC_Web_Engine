import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Send, X, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './pedagogy.css';

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

const Pedagogy = ({ data = [] }) => {
  const [activeYear, setActiveYear] = useState(null);
  const [tempData, setTempData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedYears, setSelectedYears] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editingYearIndex, setEditingYearIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPedagogy, setNewPedagogy] = useState({ 
    name: "", 
    pdf_path: "", 
    link: "" 
  });
  
const [addingYear, setAddingYear] = useState(false);      // show input box or not
const [newYearInput, setNewYearInput] = useState("");     // input for new year


// helper checks
const isPdf = (path) => {
  if (!path) return false;
  return path.endsWith(".pdf") || path.startsWith("/static/pdfs/") || path.startsWith("blob:");
};

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") || path?.startsWith('blob') ? path : `${BASE_URL}${path}`;
  };
  const isLink = (path) => path?.startsWith("http");

  // Load initial data
  useEffect(() => {
    if (data && data.length > 0) {
      const pedagogyCategory = data.find(item => item.category === "Pedagogy Initiatives");
      const formattedData = pedagogyCategory ? deepCopy(pedagogyCategory.content) : [];
      
      setTempData(formattedData);
      setOriginalData(deepCopy(formattedData));
    }
  }, [data]);

  const handleYearClick = (year) => {
    setActiveYear(activeYear === year ? null : year);
  };

  const handlePdfClick = (pdfPath) => {
    if (pdfPath) {
      window.open(UrlParser(pdfPath), "_blank");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
    setIsDirty(false);
    setSelectedItems(new Set());
    setSelectedYears(new Set());
  };

const handleCancel = () => {
  if (pendingData) {
    // If there's a saved draft, restore it
    setTempData(deepCopy(pendingData));
    toast.info("Cancelled edits. Draft preserved!");
  } else {
    // Otherwise, revert to original data
    setTempData(deepCopy(originalData));
    toast.info("Cancelled. Reverted to original data!");
  }

  // Reset editing state
  setIsEditing(false);
  setIsDirty(false);
  setEditIndex(null);
  setEditingYearIndex(null);
  setShowAddModal(false);
  setShowDeleteModal(false);
  setShowRequestModal(false);

  // Clear selected items/years
  setSelectedItems(new Set());
  setSelectedYears(new Set());

  // Reset new pedagogy form
  setNewPedagogy({ name: "", pdf_path: "", link: "" });

  // Update saved flag based on whether there was a draft
  setIsSaved(!!pendingData);

  // Clear active year selection
  setActiveYear(null);
};


const handleSave = () => {
  if (!isDirty) {
    toast.info("No changes to save!");
    return;
  }

  // Check all years
  const invalidItem = tempData.some(year => 
    year.content.length === 0 || // Added: year must have at least one item
    year.content.some(item => !item.name?.trim() || (!item.pdf_path?.trim() && !item.link?.trim()))
  );
  
  if (invalidItem) {
    toast.error("Please fill all fields for every item before saving!");
    return;
  }

  // Save draft
  setPendingData(deepCopy(tempData));
  setIsSaved(true);
  setIsEditing(false);
  setIsDirty(false);
  setSelectedItems(new Set());
  setSelectedYears(new Set());
  setEditIndex(null);
  setShowAddModal(false);
  setNewPedagogy({ name: "", pdf_path: "", link: "" });
  toast.success("Changes saved as draft!");
};


const handleDiscard = () => {
  // Reset all temp and pending data to original
  setTempData(deepCopy(originalData));
  setPendingData(null);

  // Reset all UI states
  setIsSaved(false);
  setIsDirty(false);
  setIsEditing(false);
  setEditIndex(null);
  setEditingYearIndex(null);
  setShowAddModal(false);
  setShowDeleteModal(false);
  setShowRequestModal(false);

  // Clear selected items/years
  setSelectedItems(new Set());
  setSelectedYears(new Set());

  // Reset new pedagogy form
  setNewPedagogy({ name: "", pdf_path: "", link: "" });

  // Clear active year
  setActiveYear(null);

  toast.info("All changes discarded! Reverted to original data.");
};


  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequestConfirm = () => {
    if (!pendingData) return;
    setOriginalData(deepCopy(pendingData));
    setTempData(deepCopy(pendingData));
    setPendingData(null);
    setIsSaved(false);
    setShowRequestModal(false);
    toast.success("Final request submitted!");
  };

  const handleChange = (yearIndex, itemIndex, field, value) => {
    const updated = deepCopy(tempData);
    updated[yearIndex].content[itemIndex][field] = value;
    setTempData(updated);
    setIsDirty(true);
  };

const handleYearChange = (yearIndex, newYear) => {
  const updated = [...tempData];

  // Only capitalize if not empty
  updated[yearIndex].year = newYear ? newYear.charAt(0).toUpperCase() + newYear.slice(1) : "";
  
  setTempData(updated);

  // Update activeYear if editing current active year
  if (yearIndex === editingYearIndex) {
    setActiveYear(updated[yearIndex].year);
  }
  setIsDirty(true);
};



// const handleAddYear = () => {
//   const updated = [...tempData, { year: "", content: [] }]; // start empty
//   setTempData(updated);

//   const newIndex = updated.length - 1;
//   setEditingYearIndex(newIndex); // automatically start editing
//   setActiveYear(""); // empty activeYear
//   setIsDirty(true);
// };

const handleAddYear = () => {
  if (!newYearInput.trim()) {
    toast.error("Please enter a valid year!");
    return;
  }

  // Add new year with input value
  const updated = [...tempData, { year: newYearInput, content: [] }];

  setTempData(updated);
  setActiveYear(newYearInput);                  // set new year as active
  setEditingYearIndex(updated.length - 1);      // start editing this year
  setIsDirty(true);

  // Reset input state
  setNewYearInput("");
  setAddingYear(false);
};




const handleAddOrUpdatePedagogy = () => {
  if (!activeYear) {
    toast.error("Please select a year first!");
    return;
  }

  // Validation (must have name + either file or url)
  if (
    !newPedagogy.name?.trim() ||
    (!newPedagogy.pdf_file && !newPedagogy.pdf_url)
  ) {
    toast.error("Please fill all required fields!");
    return;
  }

  const yearIndex = tempData.findIndex((item) => item.year === activeYear);
  if (yearIndex === -1) return;

  const updated = deepCopy(tempData);

  if (editIndex !== null) {
    // Update existing item
    updated[yearIndex].content[editIndex] = {
      ...newPedagogy,
      // if a file exists, store just its name or a temp URL (avoid raw File object in state if persisting to DB)
      pdf_path: newPedagogy.pdf_file
        ? URL.createObjectURL(newPedagogy.pdf_file)
        : newPedagogy.pdf_url,
    };
    toast.success("Pedagogy item updated!");
  } else {
    // Add new item
    updated[yearIndex].content.push({
      ...newPedagogy,
      pdf_path: newPedagogy.pdf_file
        ? URL.createObjectURL(newPedagogy.pdf_file)
        : newPedagogy.pdf_url,
    });
    toast.success("Pedagogy item added!");
  }

  setTempData(updated);
  setIsDirty(true);
  setEditIndex(null);
  setShowAddModal(false);
  setNewPedagogy({ name: "", pdf_file: null, pdf_url: "" }); // reset properly
};


  const handleEditItem = (yearIndex, itemIndex) => {
    const item = tempData[yearIndex].content[itemIndex];
    setNewPedagogy({ ...item });
    setEditIndex(itemIndex);
    setShowAddModal(true);
  };

  const handleDeleteItems = () => {
    const updated = deepCopy(tempData);
    
    // Delete selected items
    selectedItems.forEach(key => {
      const [yearIndex, itemIndex] = key.split('-').map(Number);
      updated[yearIndex].content.splice(itemIndex, 1);
    });
    
    // Delete selected years
    const yearsToDelete = Array.from(selectedYears).map(Number).sort((a, b) => b - a);
    yearsToDelete.forEach(yearIndex => {
      updated.splice(yearIndex, 1);
    });
    
    setTempData(updated);
    setSelectedItems(new Set());
    setSelectedYears(new Set());
    setShowDeleteModal(false);
    setIsDirty(true);
    
    if (selectedYears.size > 0) {
      setActiveYear(null);
    }
    
    toast.info("Selected items deleted!");
  };

const toggleSelectItem = (yearIndex, itemIndex) => {
  const key = `${yearIndex}-${itemIndex}`;
  const updatedItems = new Set(selectedItems);
  if (updatedItems.has(key)) {
    updatedItems.delete(key);
  } else {
    updatedItems.add(key);

    // If selecting a newsletter, remove the year checkbox selection for this year
    if (selectedYears.has(yearIndex)) {
      const updatedYears = new Set(selectedYears);
      updatedYears.delete(yearIndex);
      setSelectedYears(updatedYears);
    }
  }
  setSelectedItems(updatedItems);
};


const toggleSelectYear = (yearIndex, e) => {
  e.stopPropagation(); // Prevent year toggle when clicking checkbox
  const updatedYears = new Set(selectedYears);
  if (updatedYears.has(yearIndex)) {
    updatedYears.delete(yearIndex);
  } else {
    updatedYears.add(yearIndex);

    // Deselect all newsletters under this year when selecting year
    const updatedItems = new Set(selectedItems);
    tempData[yearIndex].content.forEach((_, idx) => {
      const key = `${yearIndex}-${idx}`;
      updatedItems.delete(key);
    });
    setSelectedItems(updatedItems);

    // Close active year
    setActiveYear(null);
  }
  setSelectedYears(updatedYears);
};

console.log("Ajay",tempData);



const getChanges = () => {
  if (!pendingData || !originalData) return [];
  const changes = [];

  // -----------------------------
  // Year additions & deletions
  // -----------------------------
  const originalYears = originalData.map(y => y.year);
  const pendingYears = pendingData.map(y => y.year);

  originalYears.forEach(year => {
    if (!pendingYears.includes(year)) {
      changes.push({ action: "Deleted", section: "Year", changes: year });
    }
  });

  pendingYears.forEach(year => {
    if (!originalYears.includes(year)) {
      changes.push({ action: "Added", section: "Year", changes: year });
    }
  });

  // -----------------------------
  // Year rename (content same but year label changed)
  // -----------------------------
  originalData.forEach(originalYear => {
    const pendingYearWithSameContent = pendingData.find(pendingYear => {
      return (
        JSON.stringify(originalYear.content) === JSON.stringify(pendingYear.content) &&
        originalYear.year !== pendingYear.year
      );
    });

    if (pendingYearWithSameContent) {
      changes.push({
        action: "Edited",
        section: "Year",
        changes: pendingYearWithSameContent.year, // ✅ Just show new year name
      });

      // Remove false add/delete entries for this rename
      const delIdx = changes.findIndex(
        c => c.action === "Deleted" && c.changes === originalYear.year
      );
      const addIdx = changes.findIndex(
        c => c.action === "Added" && c.changes === pendingYearWithSameContent.year
      );
      if (delIdx !== -1) changes.splice(delIdx, 1);
      if (addIdx !== -1) changes.splice(addIdx, 1);
    }
  });

  // -----------------------------
  // Item-level changes
  // -----------------------------
// -----------------------------
// Item-level changes
// -----------------------------
pendingData.forEach(pendingYear => {
  const originalYear = originalData.find(y => y.year === pendingYear.year);
  if (!originalYear) return; // Already handled in "Added Year"

  // Loop through original items
  originalYear.content.forEach(originalItem => {
    const matchingPending = pendingYear.content.find(
      p => p.pdf_path === originalItem.pdf_path && p.link === originalItem.link
    );

    if (!matchingPending) {
      // Maybe name changed → detect edit instead of add+delete
      const possibleRename = pendingYear.content.find(
        p =>
          (p.pdf_path === originalItem.pdf_path || p.link === originalItem.link) &&
          p.name !== originalItem.name
      );

      if (possibleRename) {
        changes.push({
          action: "Edited",
          section: pendingYear.year,
          changes: originalItem.name
        });
      } else {
        // Fully deleted
        changes.push({
          action: "Deleted",
          section: pendingYear.year,
          changes: originalItem.name
        });
      }
    }
  });

  // Check for new items (added only if not just rename)
  pendingYear.content.forEach(pendingItem => {
    const existsInOriginal = originalYear.content.find(
      o =>
        o.name === pendingItem.name &&
        o.pdf_path === pendingItem.pdf_path &&
        o.link === pendingItem.link
    );

    if (!existsInOriginal) {
      const wasRename = originalYear.content.find(
        o =>
          (o.pdf_path === pendingItem.pdf_path || o.link === pendingItem.link) &&
          o.name !== pendingItem.name
      );
      if (!wasRename) {
        changes.push({
          action: "Added",
          section: pendingYear.year,
          changes: pendingItem.name
        });
      }
    }
  });
});


  return changes;
};



const handleRevertChange = (change) => {
  let updated = deepCopy(pendingData);

  if (change.action === "Added") {
    if (change.section === "Year") {
      // Remove the added year
      updated = updated.filter(year => year.year !== change.changes);
    } else {
      // Remove the added item
      const yearIndex = updated.findIndex(y => y.year === change.section);
      if (yearIndex !== -1) {
        updated[yearIndex].content = updated[yearIndex].content.filter(
          item => item.name !== change.changes
        );
      }
    }
  } else if (change.action === "Deleted") {
    if (change.section === "Year") {
      // Restore deleted year from originalData
      const deletedYear = originalData.find(y => y.year === change.changes);
      if (deletedYear) {
        updated.push(deepCopy(deletedYear));
      }
    } else {
      // Restore deleted item from originalData
      const originalYear = originalData.find(y => y.year === change.section);
      const deletedItem = originalYear?.content.find(item => item.name === change.changes);
      
      if (deletedItem) {
        const yearIndex = updated.findIndex(y => y.year === change.section);
        if (yearIndex !== -1) {
          updated[yearIndex].content.push(deepCopy(deletedItem));
        } else {
          // If the year doesn't exist in updated data, recreate it with the deleted item
          updated.push({
            year: change.section,
            content: [deepCopy(deletedItem)]
          });
        }
      }
    }
  } else if (change.action === "Edited") {
    if (change.section === "Year") {
      // Revert year name change: "Old Year Name → New Year Name"
      const [oldYearName, newYearName] = change.changes.split(" → ");
      
      const yearIndex = updated.findIndex(y => y.year === newYearName);
      if (yearIndex !== -1) {
        // Restore the original year name
        updated[yearIndex].year = oldYearName;
        
        // Also restore the original year content if it exists in originalData
        const originalYear = originalData.find(y => y.year === oldYearName);
        if (originalYear) {
          updated[yearIndex].content = deepCopy(originalYear.content);
        }
      }
    } else {
      // Handle item edits: "Old Item Name → New Item Name"
      if (change.changes.includes(" → ")) {
        const [oldName, newName] = change.changes.split(" → ");
        
        // Find the item with the new name and revert to old name
        const yearIndex = updated.findIndex(y => y.year === change.section);
        if (yearIndex !== -1) {
          const itemIndex = updated[yearIndex].content.findIndex(item => item.name === newName);
          if (itemIndex !== -1) {
            // Find the original item to restore all properties
            const originalYear = originalData.find(y => y.year === change.section);
            const originalItem = originalYear?.content.find(item => item.name === oldName);
            
            if (originalItem) {
              // Completely restore the original item
              updated[yearIndex].content[itemIndex] = deepCopy(originalItem);
            } else {
              // Just revert the name if original not found
              updated[yearIndex].content[itemIndex].name = oldName;
            }
          }
        }
      }
    }
  }

  setPendingData(updated);
};

  const changes = getChanges();

  if (!data || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        {/* Loader component would go here */}
      </div>
    );
  }

  const cancelAddYear = () => {
  setAddingYear(false);
  setNewYearInput("");
};


  const activeContent = activeYear 
    ? tempData.find(item => item.year === activeYear)?.content || []
    : [];

  return (
    <>
      <div className="p-6 mt-4 pb-10 font-[poppins] relative">
        <ToastContainer position="bottom-right" autoClose={2000} />

        {/* Header with Edit Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-brwn dark:text-drkt">
            
          </h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
            >
              <Pencil size={18} /> Edit
            </button>
          )}
        </div>

        {/* Year buttons */}
{/* Year buttons */}
<div className="flex flex-wrap justify-center gap-6 mb-6">
  {tempData.map((yearItem, yearIndex) => (
    <div key={yearIndex} className="relative flex items-center justify-center">
      {isEditing && (
        <div className="absolute -top-3 -right-3 z-10">
          <input
            type="checkbox"
            checked={selectedYears.has(yearIndex)}
            disabled={tempData[yearIndex].content.some((_, idx) =>
              selectedItems.has(`${yearIndex}-${idx}`)
            )} // disable if any newsletter is selected
            onChange={(e) => toggleSelectYear(yearIndex, e)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (selectedYears.size > 0) return; // block click if any checkbox is selected
          handleYearClick(yearItem.year);
        }}
        className={`px-6 py-3 font-semibold rounded-xl transition-all hover:text-prim
          ${
            activeYear === yearItem.year
              ? "bg-[#800000] text-prim"
              : "bg-[#fdcc03] text-text"
          }
          hover:bg-[#800000] hover:text-white`}
      >
        {yearItem.year}
      </button>
    </div>
  ))}

  {/* Add Year Button */}
  {isEditing && !addingYear && (
    <button
      onClick={() => setAddingYear(true)}
      className="flex items-center gap-2 px-6 py-3 bg-secd text-text-700 font-semibold rounded-xl hover:bg-brwn hover:text-prim transition-colors duration-200"
    >
      <Plus size={18} />
      <span>Add New</span>
    </button>
  )}

  {/* Input for Adding Year */}
{addingYear && (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={newYearInput}
      onChange={(e) => setNewYearInput(e.target.value.toUpperCase())} // force caps
      placeholder="Enter title"
      className="px-2 py-1 border rounded uppercase" // CSS ensures text shows as uppercase
    />
    <button
      onClick={handleAddYear}
      className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded"
    >
      Add
    </button>
    <button
      onClick={cancelAddYear}
      className="bg-gray-400 text-white px-3 py-1 rounded"
    >
      Cancel
    </button>
  </div>
)}

</div>


        {/* Year Content */}
{activeYear && (
  <div className="mb-6">
{/* <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
  {editingYearIndex !== null ? (
    <input
      type="text"
      value={tempData[editingYearIndex]?.year || ""}
      placeholder="Enter year name"
      onChange={(e) => {
        const updated = [...tempData];
        updated[editingYearIndex].year = e.target.value; // keep whatever user types
        setTempData(updated);

        // Keep activeYear in sync even if empty
        setActiveYear(updated[editingYearIndex].year || ""); 
        setIsDirty(true);
      }}
      onBlur={() => {
        const updated = [...tempData];
        // Provide a fallback if completely empty
        if (!updated[editingYearIndex].year.trim()) {
          updated[editingYearIndex].year = "NEW YEAR";
        }
        setTempData(updated);
        setActiveYear(updated[editingYearIndex].year); // update activeYear
        setEditingYearIndex(null);
      }}
      className="px-2 py-1 border rounded text-center"
      autoFocus
    />
  ) : (
    <>
      {activeYear || "NEW YEAR"}
      {isEditing && (
        <button
          onClick={() => {
            const idx = tempData.findIndex((y) => y.year === activeYear);
            setEditingYearIndex(idx);
          }}
          className="ml-2 text-gray-600 hover:text-blue-600"
        >
          <Pencil size={18} />
        </button>
      )}
    </>
  )}
</h3> */}


            
            {/* PDF Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-8 place-items-center">
              {activeContent.map((pdfItem, itemIndex) => {
                const yearIndex = tempData.findIndex(item => item.year === activeYear);
                const key = `${yearIndex}-${itemIndex}`;
                
                return (
                  <div
                    key={itemIndex}
                    className="relative"
                    onClick={() => {
                      if (isEditing) {
                        handleEditItem(yearIndex, itemIndex);
                      }
                    }}
                  >
                    {isEditing && (
                      <input
                        type="checkbox"
                        checked={selectedItems.has(key)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelectItem(yearIndex, itemIndex)}
                        className="absolute top-2 right-2 h-4 w-4 z-10"
                      />
                    )}

                    <button
                      onClick={(e) => {
                        if (!isEditing) {
                          handlePdfClick(pdfItem.pdf_path || pdfItem.link);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      className="w-[300px] pdgbtn h-[70px] py-2 px-5 rounded-md bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim transition-all text-center flex items-center justify-center text-sm"
                    >
                      {isEditing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(yearIndex, itemIndex);
                          }}
                          className="w-full bg-transparent text-center border-none focus:outline-none cursor-pointer"
                        >
                          {pdfItem.name}
                        </button>
                      ) : (
                        pdfItem.name
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Add New Item Button */}
              {isEditing && activeYear && (
                <div 
                  className="w-[300px] h-[70px] border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500"
                  onClick={() => {
                    setEditIndex(null);
                    setNewPedagogy({ name: "", pdf_path: "", link: "" });
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} className="text-gray-500 mr-2" />
                  <span className="text-gray-500">Add Item</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Pedagogy Modal */}
{showAddModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-text bg-opacity-50">
    <div className="bg-prim dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
      {/* Close Button */}
      <button
        onClick={() => {
          setShowAddModal(false);
          setEditIndex(null);
          setNewPedagogy({ name: "", pdf_path: "", link: "" });
        }}
        className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
      >
        ✕
      </button>

      {/* Title */}
      <h3 className="font-semibold mb-4 text-lg">
        {editIndex !== null ? "Update Pedagogy Item" : "Add New Pedagogy Item"}
      </h3>

      {/* Input for Name */}
      <input
        type="text"
        value={newPedagogy.name}
        onChange={(e) =>
          setNewPedagogy({
            ...newPedagogy,
            name:
              e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1),
          })
        }
        placeholder="Item Name"
        className="w-full p-3 border border-gray-300 rounded mb-4 dark:bg-gray-800 dark:border-gray-600 dark:text-prim"
      />

      {/* File or Link */}
<div className="flex flex-col gap-4 mb-4">
  {/* PDF Upload */}
  <div>
    <div className="flex items-center gap-2 mb-2">
      <input
        type="file"
        accept="application/pdf"
        id="pdfUpload"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) {
            setNewPedagogy({
              ...newPedagogy,
              pdf_file: e.target.files[0], // set file
              pdf_url: "", // clear URL
            });
          }
        }}
        disabled={!!newPedagogy.pdf_url} // disable if URL exists
      />
      <button
        onClick={() => document.getElementById("pdfUpload").click()}
        className={`px-4 py-2 rounded ${
          newPedagogy.pdf_url
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
        }`}
        disabled={!!newPedagogy.pdf_url}
      >
        {newPedagogy.pdf_file ? "Replace PDF" : "Upload PDF"}
      </button>

      {/* Preview + Delete */}
      {(newPedagogy.pdf_file || newPedagogy.pdf_url) && (
        <div className="flex items-center gap-3">
          <a
            href={
              newPedagogy.pdf_file
                ? URL.createObjectURL(newPedagogy.pdf_file)
                : newPedagogy.pdf_url
            }
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Eye size={20} className="text-blue-500" />
          </a>

          <button
            onClick={() =>
              setNewPedagogy({
                ...newPedagogy,
                pdf_file: null,
                pdf_url: "",
              })
            }
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
  </div>

  {/* URL Input */}
  <div>
    <p className="text-sm text-gray-600 mb-1">Or enter URL:</p>
    <input
      type="text"
      value={newPedagogy.pdf_url}
      onChange={(e) =>
        setNewPedagogy({
          ...newPedagogy,
          pdf_url: e.target.value,
          pdf_file: null, // clear file if URL entered
        })
      }
      placeholder="https://example.com/file.pdf"
      className="w-full p-3 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-prim"
      disabled={!!newPedagogy.pdf_file} // disable if file exists
    />
  </div>
</div>







      {/* Buttons */}
      <div className="flex gap-3">


        <button
          onClick={() => {
            setShowAddModal(false);
            setEditIndex(null);
            setNewPedagogy({ name: "", pdf_path: "", link: "" });
          }}
          className="px-4 py-2 bg-gray-400 text-prim rounded"
        >
          Cancel
        </button>

<button
  onClick={handleAddOrUpdatePedagogy}
  className="flex-1 py-2 bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={
    !newPedagogy.name?.trim() || // must have title
    (!newPedagogy.pdf_file && !newPedagogy.pdf_url) || // must have file OR url
    (editIndex !== null &&
      JSON.stringify({
        ...newPedagogy,
        pdf_file: null, // ignore file object reference for comparison
      }) ===
        JSON.stringify({
          ...(
            tempData.find((y) => y.year === activeYear)?.content[editIndex] || {}
          ),
          pdf_file: null,
        }))
  }
>
  {editIndex !== null ? "Update Item" : "Add Item"}
</button>


      </div>
    </div>
  </div>
)}


        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-between items-center mt-8">
            {/* Centered Delete Button */}
            <div className="flex-1 flex justify-center">
              {(selectedItems.size > 0 || selectedYears.size > 0) && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-prim rounded hover:bg-red-600"
                >
                  <Trash2 size={18} /> Delete Selected ({selectedItems.size + selectedYears.size})
                </button>
              )}
            </div>

            {/* Right Side Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-prim rounded hover:bg-gray-500"
              >
                Cancel
              </button>

              {isDirty && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        {isSaved && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 bg-gray-400 text-prim rounded hover:bg-gray-500"
            >
              Discard Changes
            </button>
            
            {changes.length > 0 && (
              <button
                onClick={handleRequest}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
              >
                <Send size={18} /> Request
              </button>
            )}
          </div>
        )}

        {/* Final Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-text/70 flex items-center justify-center z-[1000]">
            <div className="bg-prim p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Final Request</h2>
              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the superior admin.
              </p>
              
              {changes.length > 0 ? (
                <table className="w-full text-center text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Section</th>
                      <th className="border p-2">Changes</th>
                      <th className="border p-2">Revert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((ch, i) => (
                      <tr key={i}>
                        <td className="border p-2 text-blue-600">{ch.action}</td>
                        <td className="border p-2">{ch.section}</td>
                        <td className="border p-2">{ch.changes}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => handleRevertChange(ch)}
                          >
                            <X size={20} className="text-red-600"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No changes detected.</p>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-gray-400 text-prim rounded"
                >
                  Cancel
                </button>
                
                {changes.length > 0 && (
                  <button
                    onClick={handleFinalRequestConfirm}
                    className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                  >
                    Final Request
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
            <div className="bg-prim p-6 rounded-lg shadow-lg border w-[90%] max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedItems.size + selectedYears.size} selected item{selectedItems.size + selectedYears.size > 1 ? 's' : ''}?
                {selectedYears.size > 0 && ` This includes ${selectedYears.size} year${selectedYears.size > 1 ? 's' : ''} and all their content.`}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteItems}
                  className="px-4 py-2 bg-red-600 text-prim rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Pedagogy;