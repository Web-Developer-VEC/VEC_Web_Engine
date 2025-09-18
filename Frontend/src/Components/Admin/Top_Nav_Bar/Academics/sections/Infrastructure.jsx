import React, { useState } from "react";
import "./infrastructure.css";
import LoadComp from "../../../LoadComp";
import { Pencil, Plus, Send, X } from "lucide-react";

const Infrastructure = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) =>
    path?.startsWith("http") || path?.startsWith("blob:") ? path : `${BASE_URL}${path}`;

  const infrastructure_images =
    data?.find((item) => item.category === "infrastructure_images")?.content || [];

  const [selectedCard, setSelectedCard] = useState(null);
  const [editMode, setEditMode] = useState(false); // first edit session
  const [postSaveMode, setPostSaveMode] = useState(false); // after first save
  const [secondEditMode, setSecondEditMode] = useState(false); // second edit session
  const [secondEditHasChanges, setSecondEditHasChanges] = useState(false); // changes during second edit
  const [editedImages, setEditedImages] = useState(infrastructure_images);
  const [originalImages, setOriginalImages] = useState(infrastructure_images);
  const [savedChanges, setSavedChanges] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newCardData, setNewCardData] = useState({ image_name: "", image_path: "" });
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleCardClick = (index) => {
    if (!editMode && !secondEditMode) setSelectedCard(selectedCard === index ? null : index);
  };

  const handleEditClick = () => {
    if (postSaveMode) {
      // Second edit session after save
      setSecondEditMode(true);
      setSecondEditHasChanges(false);
    } else {
      // First edit session
      setEditMode(true);
      setOriginalImages(editedImages);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    if (secondEditMode) {
      // Cancel during second edit → restore post-save buttons
      setSecondEditMode(false);
      setSecondEditHasChanges(false);
      setEditedImages(savedChanges); // restore last saved state
    } else {
      // Cancel during first edit → discard unsaved changes
      setEditedImages(originalImages);
      setEditMode(false);
      setHasChanges(false);
    }
    setNewCardData({ image_name: "", image_path: "" });
  };

  const handleSave = () => {
    if (secondEditMode) {
      // Save changes in second edit session
      setSavedChanges([...editedImages]);
      setSecondEditMode(false);
      setSecondEditHasChanges(false);
      setPostSaveMode(true);
    } else {
      // Save during first edit session
      setSavedChanges([...editedImages]);
      setEditMode(false);
      setHasChanges(false);
      setPostSaveMode(true); // show Edit + Discard/Request
    }
    setNewCardData({ image_name: "", image_path: "" });
  };

  const handleDiscard = () => {
    setEditedImages(originalImages);
    setSavedChanges(null);
    setPostSaveMode(false);
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
    const newImages = [...editedImages];
    newImages[index] = {
      ...newImages[index],
      image_path: URL.createObjectURL(file),
      newFile: file,
    };
    setEditedImages(newImages);
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
    setEditedImages([...editedImages, newCardData]);
    setNewCardData({ image_name: "", image_path: "" });
    if (editMode) setHasChanges(true);
    if (secondEditMode) setSecondEditHasChanges(true);
  };

  const undoChange = (index) => {
  const original = originalImages[index];

  if (original) {
    // Existing card → revert values
    const updated = [...editedImages];
    updated[index] = original;
    setEditedImages(updated);
  } else {
    // New card → remove it entirely
    const updated = editedImages.filter((_, i) => i !== index);
    setEditedImages(updated);
  }

  if (editMode) setHasChanges(true);
  if (secondEditMode) setSecondEditHasChanges(true);
};


  return (
    <div className="relative -top-6">
      {editedImages ? (
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
            {editedImages.map((card, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`card_infa ${selectedCard === index ? "active" : ""}`}
                  style={{
                    backgroundImage: card.image_path ? `url(${UrlParser(card.image_path)})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="content">
                    <h1 className="infra_title">{card.image_name}</h1>
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
                    {editedImages.map((card, index) => {
                      const original = originalImages[index] || { image_name: "", image_path: "" };
                      if (
                        card.image_name !== original.image_name ||
                        card.image_path !== original.image_path
                      ) {
                        return (
                          <tr key={index}>
                            <td className="border p-2 text-blue-600">Edited</td>
                            <td className="border p-2">Infrastructure</td>
                            <td className="border p-2">{card.image_name || "New Card"}</td>
                            <td className="border p-2">
                            <button
                              onClick={() => undoChange(index)}
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
                    onClick={handleRequest} // final submission
                    className="px-4 py-2 rounded bg-[#fdcc03] text-white hover:bg-[#800000] flex items-center gap-2"
                  >
                     Confirm Request
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
    </div>
  );
};

export default Infrastructure;
