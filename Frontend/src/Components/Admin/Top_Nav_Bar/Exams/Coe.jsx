import React, { useEffect, useState } from "react";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { Pencil, Send, X } from "lucide-react";

const AdminCoe = ({ toggle, theme }) => {
  const [coeData, setCoeData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [requestMode, setRequestMode] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changes, setChanges] = useState([]);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "COE",
        });
        const data = response.data.data;
        setCoeData(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      } catch (error) {
        console.error("Error fetching coe data", error);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, []);

  const handleFieldChange = (sIdx, mIdx, field, value) => {
    const updated = [...coeData];
    updated[sIdx].members[mIdx][field] = value;
    setCoeData(updated);
    setHasChanges(true);

    const memberName = updated[sIdx].members[mIdx].name;
    setChanges((prev) => [
      ...prev.filter((c) => c.sIdx !== sIdx || c.mIdx !== mIdx),
      {
        action: "Edited",
        section: coeData[sIdx].category,
        sIdx,
        mIdx,
        name: memberName,
      },
    ]);
  };

  const handleImageUpload = (sIdx, mIdx, file) => {
    const updated = [...coeData];
    updated[sIdx].members[mIdx].newImageFile = file;
    updated[sIdx].members[mIdx].imagePreview = URL.createObjectURL(file);
    setCoeData(updated);
    setHasChanges(true);

    const memberName = updated[sIdx].members[mIdx].name;
    setChanges((prev) => [
      ...prev.filter((c) => c.sIdx !== sIdx || c.mIdx !== mIdx),
      {
        action: "Image Changed",
        section: coeData[sIdx].category,
        sIdx,
        mIdx,
        name: memberName,
      },
    ]);
  };

  const handleCheckboxChange = (sIdx, mIdx) => {
    const key = `${sIdx}-${mIdx}`;
    setSelectedMembers((prev) =>
      prev.includes(key)
        ? prev.filter((id) => id !== key)
        : [...prev, key]
    );
  };

  const handleDeleteConfirmed = () => {
    const updated = coeData.map((section, sIdx) => ({
      ...section,
      members: section.members.filter(
        (_m, mIdx) => !selectedMembers.includes(`${sIdx}-${mIdx}`)
      ),
    }));

    // Track deleted members
    const deletedChanges = selectedMembers.map((key) => {
      const [sIdxStr, mIdxStr] = key.split("-");
      const s = parseInt(sIdxStr);
      const m = parseInt(mIdxStr);
      const memberName = coeData[s].members[m].name;
      return {
        action: "Deleted",
        section: coeData[s].category,
        sIdx: s,
        mIdx: m,
        name: memberName,
      };
    });
    setChanges((prev) => [...prev, ...deletedChanges]);

    setCoeData(updated);
    setSelectedMembers([]);
    setShowDeleteModal(false);
    setHasChanges(true);
  };

  const handleLocalSave = () => {
    setIsEditing(false);
    setHasChanges(false);
    setRequestMode(true);
  };

  const undoChange = (change) => {
    const updated = [...coeData];

    if (change.action === "Image Changed") {
      delete updated[change.sIdx].members[change.mIdx].newImageFile;
      delete updated[change.sIdx].members[change.mIdx].imagePreview;
    }

    if (change.action === "Edited") {
      const originalMember = originalData[change.sIdx].members[change.mIdx];
      updated[change.sIdx].members[change.mIdx] = { ...originalMember };
    }

    if (change.action === "Deleted") {
      const originalMember = originalData[change.sIdx].members[change.mIdx];
      updated[change.sIdx].members.splice(change.mIdx, 0, originalMember);
    }

    setCoeData(updated);
    setChanges((prev) =>
      prev.filter(
        (c) =>
          !(
            c.sIdx === change.sIdx &&
            c.mIdx === change.mIdx &&
            c.action === change.action
          )
      )
    );
  };

  const handleCancel = () => {
    setCoeData(JSON.parse(JSON.stringify(originalData)));
    setIsEditing(false);
    setHasChanges(false);
    setSelectedMembers([]);
  };

  const handleDiscardChanges = () => {
    const resetData = JSON.parse(JSON.stringify(originalData));
    resetData.forEach((section) =>
      section.members.forEach((member) => {
        delete member.newImageFile;
        delete member.imagePreview;
      })
    );
    setCoeData(resetData);
    setIsEditing(false);
    setRequestMode(false);
    setSelectedMembers([]);
    setHasChanges(false);
    setChanges([]);
  };

  const handleRequest = () => {
    setShowRequestModal(true);
  };

  const handleFinalRequest = () => {
  // Save current coeData as the new original
  setOriginalData(JSON.parse(JSON.stringify(coeData))); 
  setShowRequestModal(false);   // close modal
  setRequestMode(false);        // exit request mode
  setIsEditing(false);          // edit button reappears
  setSelectedMembers([]);       // clear selections
  setChanges([]);               // clear change tracking
  setHasChanges(false);         // reset changes flag
};


  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="office of controller of examinations"
        subHeaderText="COE"
      />

      <div className="relative py-10 px-4 md:px-20 bg-prim dark:bg-drkp justify-center font-[Poppins]">
        {/* Edit button */}
        {!isEditing && !requestMode && (
          <button
            className="absolute top-6 right-8 flex items-center gap-2 px-4 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} /> Edit
          </button>
        )}

        {/* First section (no checkboxes) */}
        {coeData && coeData.length > 0 && (
          <div className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-fit ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10">
            <h2 className="text-2xl font-bold text-[#800000] dark:text-drkt text-center mb-6">
              {coeData[0].category}
            </h2>
            {coeData[0].members.map((member, index) => (
              <div
                key={index}
                className="relative flex bg-prim dark:bg-text md:w-[430px] border-[2px] border-yellow-500 rounded-xl p-4 gap-4 items-start mx-auto"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={
                      member.imagePreview
                        ? member.imagePreview
                        : UrlParser(member.image_path)
                    }
                    alt={member.name}
                    className="w-[100px] h-[120px] object-cover rounded"
                  />
                  {isEditing && (
                    <>
                      <input
                        id={`file-0-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(0, index, e.target.files[0])
                        }
                      />
                      <button
                        className="mt-2 px-3 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
                        onClick={() =>
                          document.getElementById(`file-0-${index}`).click()
                        }
                      >
                        Replace
                      </button>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          handleFieldChange(0, index, "name", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm w-[250px]"
                      />
                      <input
                        type="text"
                        value={member.qualification}
                        onChange={(e) =>
                          handleFieldChange(
                            0,
                            index,
                            "qualification",
                            e.target.value
                          )
                        }
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                      <input
                        type="text"
                        value={member.position}
                        onChange={(e) =>
                          handleFieldChange(
                            0,
                            index,
                            "position",
                            e.target.value
                          )
                        }
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-sm md:text-[18px] text-text dark:text-drkt">
                        {member.name}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.qualification}
                      </p>
                      <p className="text-sm text-brwn dark:text-drka">
                        {member.position}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Middle two sections (no checkboxes) */}
        {coeData && coeData.length > 2 && (
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {coeData.slice(1, 3).map((section, sIdx) => (
              <div
                key={sIdx + 1}
                className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-[48%] max-w-[520px] shadow-md rounded-lg p-6 md:p-8"
              >
                <h2 className="text-xl font-bold text-[#800000] dark:text-drkt text-center mb-4 whitespace-nowrap">
                  {section.category}
                </h2>
                {section.members.map((member, index) => (
                  <div
                    key={index}
                    className="relative flex bg-prim dark:bg-text border-2 border-yellow-500 rounded-xl p-4 gap-4 items-start"
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          member.imagePreview
                            ? member.imagePreview
                            : UrlParser(member.image_path)
                        }
                        alt={member.name}
                        className="w-[100px] h-[120px] object-cover rounded"
                      />
                      {isEditing && (
                        <>
                          <input
                            id={`file-${sIdx + 1}-${index}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                sIdx + 1,
                                index,
                                e.target.files[0]
                              )
                            }
                          />
                          <button
                            className="mt-2 px-3 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
                            onClick={() =>
                              document
                                .getElementById(`file-${sIdx + 1}-${index}`)
                                .click()
                            }
                          >
                            Replace
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 1,
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-[250px]"
                          />
                          <input
                            type="text"
                            value={member.qualification}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 1,
                                index,
                                "qualification",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 1,
                                index,
                                "position",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-sm md:text-[18px] text-text dark:text-drkt">
                            {member.name}
                          </p>
                          <p className="text-sm text-brwn dark:text-drka">
                            {member.qualification}
                          </p>
                          <p className="text-sm text-brwn dark:text-drka">
                            {member.position}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Remaining sections (checkboxes allowed) */}
        {coeData?.slice(3).map((section, sIdx) => (
          <div
            key={sIdx + 3}
            className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-fit ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10"
          >
            <h2 className="text-2xl font-bold text-[#800000] dark:text-drkt text-center mb-6">
              {section.category}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 px-2 md:px-0">
              {section.members.map((member, mIdx) => {
                const key = `${sIdx + 3}-${mIdx}`;
                return (
                  <div
                    key={mIdx}
                    className="relative flex bg-prim dark:bg-text w-full sm:w-[90%] md:w-[45%] lg:w-[430px] border-2 border-yellow-500 rounded-xl p-3 sm:p-4 gap-3"
                  >
                    {isEditing && (
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(key)}
                        onChange={() => handleCheckboxChange(sIdx + 3, mIdx)}
                        className="absolute top-2 right-2 w-5 h-5"
                      />
                    )}
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          member.imagePreview
                            ? member.imagePreview
                            : UrlParser(member.image_path)
                        }
                        alt={member.name}
                        className="w-[80px] h-[100px] object-cover rounded"
                      />
                      {isEditing && (
                        <>
                          <input
                            id={`file-${sIdx + 3}-${mIdx}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                sIdx + 3,
                                mIdx,
                                e.target.files[0]
                              )
                            }
                          />
                          <button
                            className="mt-2 px-3 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
                            onClick={() =>
                              document
                                .getElementById(`file-${sIdx + 3}-${mIdx}`)
                                .click()
                            }
                          >
                            Replace
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 justify-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 3,
                                mIdx,
                                "name",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-[250px]"
                          />
                          <input
                            type="text"
                            value={member.qualification}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 3,
                                mIdx,
                                "qualification",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 3,
                                mIdx,
                                "position",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-[15px] sm:text-[16px] md:text-[18px] text-text dark:text-drkt">
                            {member.name}
                          </p>
                          <p className="text-sm text-brwn dark:text-drka">
                            {member.qualification}
                          </p>
                          <p className="text-sm text-brwn dark:text-drka">
                            {member.position}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Buttons */}
        {isEditing && (
          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="flex justify-end w-full gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              {hasChanges && (
                <button
                  onClick={handleLocalSave}
                  className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] transition hover:text-prim"
                >
                  Save
                </button>
              )}
            </div>

            {selectedMembers.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete Selected
              </button>
            )}
          </div>
        )}

        {/* Request Mode Buttons */}
        {requestMode && (
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Discard Changes
            </button>
            <button
              onClick={handleRequest}
              className="px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] transition flex items-center gap-2 hover:text-prim"
            >
              <Send size={16} /> Request
            </button>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-drkp p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h2 className="text-lg font-bold mb-4 text-drkt">
                Confirm Delete
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the selected faculty members?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-drkt">Request </h2>
              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the superior admin.Once approved will go on live.
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
                  {changes.map((change, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-blue-600">{change.action}</td>
                      <td className="border p-2">{change.section}</td>
                      <td className="border p-2">{change.name}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => undoChange(change)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Revert this change"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  onClick={handleFinalRequest}
                  className="px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] flex items-center gap-2 hover:text-prim"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCoe;
