import React, { useState, useEffect, useMemo } from "react";
import "./infrastructure.css";
import LoadComp from "../../../LoadComp";
import { Pencil, Plus, Send, X, Trash2 } from "lucide-react";
import { useAdminRequest } from "../../../../hooks/useAdminRequest";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Infrastructure = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) =>
    path?.startsWith("http") || path?.startsWith("blob:") ? path : `${BASE_URL}${path}`;

  const infrastructure_images = useMemo(() => {
    return (
      data.find(item => item.category === "infrastructure_images")
        ?.content || []
    );
  }, [data]);

  const attachUids = (images) =>
    images.map((image, index) => ({
      ...image,
      _uid: image._uid || `${image.image_path || "img"}::${index}`
    }));

  const [deptId, setDeptId] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [mode, setMode] = useState("view");
  // view | edit | review
  const [dirty, setDirty] = useState(false);
  const [snapshot, setSnapshot] = useState([]);
  const [images, setImages] = useState([]);
  const [newCardData, setNewCardData] = useState({ image_name: "", image_path: "" });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const { sendRequest, loading, error } = useAdminRequest();
  const [editMode, setEditMode] = useState(false);
  const [postSaveMode, setPostSaveMode] = useState(false);
  const [secondEditMode, setSecondEditMode] = useState(false);

  const [secondEditHasChanges, setSecondEditHasChanges] = useState(false);

  const [editedImages, setEditedImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);

  const [savedChanges, setSavedChanges] = useState(null);

  const [hasChanges, setHasChanges] = useState(false);

  const deptMap = {
    "001": "AIDS_001",
    "002": "AUTO_002",
    "003": "CHEMISTRY_003",
    "004": "CIVIL_004",
    "005": "CSE_005",
    "006": "CSECS_006",
    "007": "EEE_007",
    "008": "EIE_008",
    "009": "ECE_009",
    "010": "ENGLISH_010",
    "011": "IT_011",
    "012": "MATHS_012",
    "013": "MECH_013",
    "014": "TAMIL_014",
    "015": "PHYSICS_015",
    "016": "MECSE_016",
    "017": "MBA_017",
    "018": "PS_018"
  };

  useEffect(() => {
    const bannerData = data?.find((item) => item.category === "banner_name_and_image")?.content?.[0];
    if (bannerData?.dept_id) {
      setDeptId(bannerData.dept_id);
    }
  }, [data]);

  useEffect(() => {
    console.log("SYNC EFFECT RUNNING");

    if (mode !== "view") return;

    const synced = attachUids(infrastructure_images);

    setImages(synced);
    setSnapshot(structuredClone(synced));

  }, [infrastructure_images, mode]);

  const handleCardClick = (index) => {
    if (!editMode && !secondEditMode) setSelectedCard(selectedCard === index ? null : index);
  };

  const toggleCardSelection = (index) => {
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter(i => i !== index));
    } else {
      setSelectedCards([...selectedCards, index]);
    }
  };

  const handleDeleteSelected = () => {
    const updated = images.filter((_, i) => !selectedCards.includes(i));
    setImages(updated);
    setSelectedCards([]);
    if (editMode) setHasChanges(true);
    if (secondEditMode) setSecondEditHasChanges(true);
  };

  const getActionType = (card) => {
    const original = snapshot.find(
      (image) => image._uid === card._uid
    );

    if (!original) return "Insert";

    if (
      original.image_name !== card.image_name ||
      original.image_path !== card.image_path
    ) {
      return "Update";
    }

    return null;
  };

  const handleEditClick = () => {
    if (postSaveMode) {
      // Second edit session after save
      setSecondEditMode(true);
      setSecondEditHasChanges(false);
    } else {
      // First edit session
      setEditMode(true);
      setSnapshot(structuredClone(images));
      setHasChanges(false);
    }
  };

  const handleCancel = () => {

    setImages(structuredClone(snapshot));

    setEditMode(false);
    setSecondEditMode(false);
    setPostSaveMode(false);

    setHasChanges(false);
    setSecondEditHasChanges(false);

    setSelectedCards([]);

    setNewCardData({
      image_name: "",
      image_path: ""
    });

  };

  const handleSave = () => {  
    setDirty(false);
    setEditMode(false);
    setSecondEditMode(false);
    setPostSaveMode(true);
    setHasChanges(false);
    setSecondEditHasChanges(false);
    setSelectedCards([]);
    setNewCardData({
      image_name: "",
      image_path: ""
    });
  };

  const handleDiscard = () => {
    setEditedImages(originalImages.map((image) => ({ ...image })));
    setSavedChanges(null);
    setPostSaveMode(false);
    setSelectedCards([]);
  };

  const handleRequest = () => {
    // Final submission
    console.log("Final Request submitted:", editedImages);

    // Reset all modes
    setEditMode(false);
    setSecondEditMode(false);
    setPostSaveMode(false);
    setHasChanges(false);
    setSecondEditHasChanges(false);
    setSavedChanges([...editedImages]); // store final changes
    setNewCardData({ image_name: "", image_path: "" });
    setShowRequestModal(false);
  };
  const handleReplace = (index, file) => {
    if (!file) return;
    const updated = [...images];
    updated[index] = {
      ...updated[index],
      image_path: URL.createObjectURL(file),
      newFile: file,
    };
    setImages(updated);
    if (editMode) setHasChanges(true);
    if (secondEditMode) setSecondEditHasChanges(true);
  };

  const handleNewImageSelect = (file) => {
    if (!file) return;
    setNewCardData({ ...newCardData, image_path: URL.createObjectURL(file), newFile: file });
    if (editMode) setHasChanges(true);
    if (secondEditMode) setSecondEditHasChanges(true);
  };

  const handleAddNewCard = () => {
    if (!newCardData.image_name || !newCardData.image_path) return;
    const newCard = {
      ...newCardData,
      _uid: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };
    setImages([...images, newCard]);
    setNewCardData({ image_name: "", image_path: "" });
    if (editMode) setHasChanges(true);
    if (secondEditMode) setSecondEditHasChanges(true);
  };

  const undoChange = (card, index) => {
    const original = snapshot.find(
      image => image._uid === card._uid
    );

    if (original) {
      // Existing card → revert values
      const updated = [...images];
      updated[index] = original;
      setImages(updated);
    } else {
      // New card → remove it entirely
      const updated = images.filter((_, i) => i !== index);
      setImages(updated);
    }

    if (editMode) setHasChanges(true);
    if (secondEditMode) setSecondEditHasChanges(true);
  };

  const buildPayload = () => {
    const payload = [];
    const collectionName = deptMap[deptId] || "UNKNOWN";

    // Helper function to get proper image path
    const getImagePath = (image) => {
      if (!image.image_path) return "";

      // If it's a blob URL (newly uploaded file), generate the static path
      if (image.image_path.startsWith("blob:") && image.newFile) {
        // Extract filename from the file object
        const fileName = image.newFile.name;
        return `/static/images/infrastructure/${deptId}/${fileName}`;
      }

      // Otherwise, use the existing path from database
      return image.image_path;
    };

    const originalById = new Map(snapshot.map((image) => [image._uid, image]));
    const currentById = new Map(images.map((image) => [image._uid, image]));
    // Check each edited image
    images.forEach((editedImage) => {
      const originalImage = originalById.get(editedImage._uid);

      if (!originalImage) {
        // NEW CARD - Insert action
        if (editedImage.image_name && editedImage.image_path) {
          payload.push({
            collectionName,
            collection_type: "infrastructure",
            action: "insert",
            title: `Insert Infrastructure Image`,
            category: "infrastructure_images",
            meta_data: {
              image_name: editedImage.image_name,
              image_path: getImagePath(editedImage)
            },
            original_data: null
          });
        }
      } else {
        // EXISTING CARD - Check if anything changed
        const hasNameChange = editedImage.image_name !== originalImage.image_name;
        const hasImageChange = editedImage.image_path !== originalImage.image_path;

        if (hasNameChange || hasImageChange) {
          payload.push({
            collectionName,
            collection_type: "infrastructure",
            action: "update",
            title: `Update Infrastructure Image`,
            category: "infrastructure_images",
            meta_data: {
              image_name: editedImage.image_name,
              image_path: getImagePath(editedImage)
            },
            original_data: {
              image_name: originalImage.image_name,
              image_path: originalImage.image_path
            }
          });
        }
      }
    });

    // Check for deleted cards
    snapshot.forEach((originalImage) => {
      if (!currentById.has(originalImage._uid)) {
        // DELETED CARD - Delete action
        payload.push({
          collectionName,
          collection_type: "infrastructure",
          action: "delete",
          title: `Delete Infrastructure Image`,
          category: "infrastructure_images",
          meta_data: {
            image_name: originalImage.image_name,
            image_path: getImagePath(originalImage)
          },
          original_data: null
        });
      }
    });

    return payload;
  };

  const handleRequestConfirm = async () => {
    const payload = buildPayload();

    if (payload.length === 0) {
      alert("No changes to submit!");
      return;
    }

    // Collect files from editedImages
    const files = [];
    images.forEach((image) => {
      if (image.image_path && image.image_path.startsWith("blob:") && image.newFile) {
        files.push(image.newFile);
      }
    });

    console.log(payload, files);


    const result = await sendRequest(payload, files.length > 0 ? files : null);

    if (result) {
      setShowRequestModal(false);
      setEditMode(false);
      setSecondEditMode(false);
      setPostSaveMode(false);
      setHasChanges(false);
      setSecondEditHasChanges(false);
      setSavedChanges([...editedImages]);
      setNewCardData({ image_name: "", image_path: "" });
    }
  };

  return (
    <div className="relative -top-6">
      {images ? (
        <>
          {/* Top Edit Button */}
          {(!editMode && !secondEditMode) && (
            <button
              className="absolute top-6 right-8 flex items-center gap-2 px-4 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
              onClick={handleEditClick}
            >
              <Pencil size={16} /> Edit
            </button>
          )}

          <section className="infra mt-10">
            <h1 className="infra-head text-accn dark:text-drkt font-bold border-x-4 border-[#FFD700] rounded-md dark:border-drks">
              Infrastructure
            </h1>
          </section>

          <main className="page-content flex flex-wrap gap-6">
            {images.map((card, index) => (
              <div key={card._uid} className="flex flex-col items-center relative">
                {(editMode || secondEditMode) && (
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(index)}
                    onChange={() => toggleCardSelection(index)}
                    className="absolute top-2 left-2 w-5 h-5 z-10 cursor-pointer"
                  />
                )}
                {/* <div
                  className={`card_infa ${selectedCard === index ? "active" : ""}`}
                  style={{
                    backgroundImage: card.image_path ? `url(${UrlParser(card.image_path)})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="content">
                    {(editMode || secondEditMode) ? (
                      <input
                        type="text"
                        className="infra_title bg-black/50 text-white px-2 py-1 rounded border-0"
                        value={card.image_name}
                        onChange={(e) => {
                          const updated = [...editedImages];
                          updated[index] = { ...updated[index], image_name: e.target.value };
                          setEditedImages(updated);
                          if (editMode) setHasChanges(true);
                          if (secondEditMode) setSecondEditHasChanges(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h1 className="infra_title">{card.image_name}</h1>
                    )}
                  </div>
                </div> */}

                <div
                  className={`
        card_infa
        ${selectedCard === index ? "active" : ""}
        ${(editMode || secondEditMode) ? "editing" : ""}
    `}
                >

                  <img
                    src={UrlParser(card.image_path)}
                    className="infra-image"
                    alt={card.image_name}
                  />

                  <div className="overlay" />

                  <div className="content">

                    {(editMode || secondEditMode) ? (

                      <input
                        onFocus={() => console.log("FOCUS", index)}
                        onBlur={() => console.log("BLUR", index)}
                        type="text"
                        disabled={false} readOnly={false}
                        className="infra-title-input"
                        value={card.image_name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          console.log("Typing...", e.target.value);

                          const updated = [...images];

                          updated[index] = {
                            ...updated[index],
                            image_name: e.target.value,
                          };

                          setImages(updated);

                          if (editMode) {
                            setHasChanges(true);
                          }

                          if (secondEditMode) {
                            setSecondEditHasChanges(true);
                          }
                        }}
                      />

                    ) : (

                      <h1 className="infra_title">
                        {card.image_name}
                      </h1>

                    )}

                  </div>

                </div>

                {(editMode || secondEditMode) && (
                  <>
                    <input
                      type="file"
                      id={`file-${index}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleReplace(index, e.target.files[0])}
                    />
                    <button
                      className="mt-2 px-3 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
                      onClick={() => document.getElementById(`file-${index}`).click()}
                    >
                      Replace
                    </button>
                  </>
                )}
              </div>
            ))}

            {(editMode || secondEditMode) && (
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400"
                  style={{
                    width: "200px",
                    height: "200px",
                    backgroundColor: "#f9f9f9",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundImage: newCardData.image_path
                      ? `url(${newCardData.image_path})`
                      : "none",
                  }}
                  onClick={() => document.getElementById("new-file-input").click()}
                >
                  {!newCardData.image_path && <Plus size={40} className="text-gray-600" />}
                </div>

                <input
                  type="file"
                  id="new-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleNewImageSelect(e.target.files[0])}
                />

                {newCardData.image_path && (
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="mt-2 px-2 py-1 border rounded w-48 text-center"
                    value={newCardData.image_name}
                    onChange={(e) =>
                      setNewCardData({ ...newCardData, image_name: e.target.value })
                    }
                  />
                )}

                {newCardData.image_path && (
                  <button
                    className="mt-2 px-3 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] transition hover:text-prim"
                    onClick={handleAddNewCard}
                  >
                    Add
                  </button>
                )}
              </div>
            )}
          </main>

          {/* Delete Selected Button */}
          {(editMode || secondEditMode) && selectedCards.length > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 flex justify-center">
              <button
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2"
                onClick={handleDeleteSelected}
              >
                <Trash2 size={18} /> Delete Selected ({selectedCards.length})
              </button>
            </div>
          )}

          {/* Bottom Buttons */}
          <div className="absolute -bottom-8 right-8 flex gap-4">
            {(editMode || secondEditMode) && (
              <>
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                {editMode && hasChanges && (
                  <button
                    className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}

                {secondEditMode && secondEditHasChanges && (
                  <button
                    className="px-4 py-2 bg-[#fdcc03] text-black rounded hover:bg-[#800000] hover:text-white transition"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {postSaveMode && !secondEditMode && (
              <>
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600 transition"
                  onClick={handleDiscard}
                >
                  Discard
                </button>
                <button
                  className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] transition flex items-center gap-2 hover:text-prim"
                  onClick={() => setShowRequestModal(true)}
                >
                  <Send size={16} /> Request
                </button>
              </>
            )}
          </div>

          {/* Request Modal */}
          {showRequestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
              <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Request Changes</h2>
                <p className="text-sm text-red-500 mb-4">
                  Note: Your changes will stay pending until approved by the superior admin.
                </p>

                <table className="w-full border border-gray-300 text-sm text-center">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Section</th>
                      <th className="border p-2">Changes</th>
                      <th className="border p-2">Undo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const currentById = new Map(images.map((image) => [image._uid, image]));
                      const deletedItems = snapshot.filter(
                        (image) => !currentById.has(image._uid)
                      );

                      return (
                        <>
                          {images.map((card, index) => {
                            const actionType = getActionType(card);
                            if (actionType) {
                              const actionColor = actionType === "Insert" ? "text-green-600" : "text-blue-600";
                              return (
                                <tr key={`edit-${card._uid || index}`}>
                                  <td className={`border p-2 ${actionColor}`}>{actionType}</td>
                                  <td className="border p-2">Infrastructure</td>
                                  <td className="border p-2">{card.image_name || "New Card"}</td>
                                  <td className="border p-2">
                                    <button
                                      onClick={() => undoChange(card, index)}
                                      className="p-1 rounded hover:bg-gray-100"
                                      title="Revert this change"
                                    >
                                      <X size={16} className="text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })}
                          {deletedItems.map((card, index) => (
                            <tr key={`del-${card._uid || index}`}>
                              <td className="border p-2 text-red-600">Delete</td>
                              <td className="border p-2">Infrastructure</td>
                              <td className="border p-2">{card.image_name || "Deleted Card"}</td>
                              <td className="border p-2">
                                <button
                                  onClick={() => {
                                    setImages([...images, card]);
                                    if (editMode) setHasChanges(true);
                                    if (secondEditMode) setSecondEditHasChanges(true);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="Restore this item"
                                >
                                  <X size={16} className="text-red-500" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })()}
                  </tbody>
                </table>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestConfirm}
                    className={`px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] transition flex items-center gap-2 hover:text-prim ${loading ? 'cursor-progress' : ''}`}
                    disabled={loading}
                  >
                    <Send size={16} /> {loading ? "Processing..." : "Confirm Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp />
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Infrastructure;
