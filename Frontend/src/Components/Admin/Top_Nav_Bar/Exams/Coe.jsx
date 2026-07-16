import React, { useEffect, useMemo, useState } from "react";
import Banner from "../../Banner";
import axios from "axios";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Send, X, Plus } from "lucide-react";
import { useAdminRequest } from "../../../hooks/useAdminRequest"; // <-- adjust path if needed

// NOTE: memberKey based on name/position/image_path causes "delete + insert" when you edit those fields,
// because the key changes. Use a stable key per member instead.
const memberKey = (m) =>
  m?.client_id ||
  m?._id ||
  m?.id ||
  `${(m?.name || "").trim()}|${(m?.position || "").trim()}|${(m?.image_path || "").trim()}`;

const deepClone = (x) => JSON.parse(JSON.stringify(x || null));

const sanitizeMember = (m) => {
  if (!m) return null;
  const { newImageFile, imagePreview, client_id, ...rest } = m; // keep client_id out of payload
  return rest;
};

// When user uploads a new image, we set image_path to a "virtual" path that contains file.name.
// This is important because useAdminRequest matches uploaded files by file name found in meta_data.
const buildVirtualImagePath = (file) => {
  // Any folder name is fine; only file name matters for matching.
  return `/static/images/coe/${file.name}`;
};

const ensureClientIds = (sections) => {
  const copy = deepClone(sections) || [];
  copy.forEach((sec, sIdx) => {
    if (!Array.isArray(sec.members)) sec.members = [];
    sec.members.forEach((m, mIdx) => {
      if (!m.client_id) {
        // stable across edits for the lifetime of the loaded data
        m.client_id = `coe_${sIdx}_${mIdx}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      }
    });
  });
  return copy;
};

// Diff generator for COE sections:
// Produces payload docs + files array that aligns with meta_data.image_path
const buildCoePayloadAndFiles = (originalSections, currentSections) => {
  const payload = [];
  const files = [];

  const originalByCategory = new Map();
  (originalSections || []).forEach((sec) => {
    originalByCategory.set(sec.category, sec);
  });

  (currentSections || []).forEach((sec) => {
    const origSec = originalByCategory.get(sec.category);

    const origMembers = origSec?.members || [];
    const curMembers = sec.members || [];

    const origMap = new Map(origMembers.map((m) => [memberKey(m), m]));
    const curMap = new Map(curMembers.map((m) => [memberKey(m), m]));

    // INSERT: exists now, not before
    for (const [k, curM] of curMap.entries()) {
      if (!origMap.has(k)) {
        const meta = sanitizeMember(curM);

        // if a new image file exists, set image_path to virtual path (with filename) and collect file
        if (curM?.newImageFile) {
          meta.image_path = buildVirtualImagePath(curM.newImageFile);
          files.push(curM.newImageFile);
        }

        payload.push({
          collectionName: "exams",
          collection_type: "COE",
          action: "insert",
          title: "insert",
          category: sec.category,
          meta_data: meta,
        });
      }
    }

    // DELETE: existed before, not now
    for (const [k, origM] of origMap.entries()) {
      if (!curMap.has(k)) {
        payload.push({
          collectionName: "exams",
          collection_type: "COE",
          action: "delete",
          title: "delete",
          category: sec.category,
          meta_data: sanitizeMember(origM),
        });
      }
    }

    // UPDATE: exists in both, but changed fields (including image)
    for (const [k, curM] of curMap.entries()) {
      if (!origMap.has(k)) continue;

      const origM = origMap.get(k);

      const curClean = sanitizeMember(curM);
      const origClean = sanitizeMember(origM);

      // detect changes
      const changed =
        (curClean?.name || "") !== (origClean?.name || "") ||
        (curClean?.qualification || "") !== (origClean?.qualification || "") ||
        (curClean?.position || "") !== (origClean?.position || "") ||
        // image change can be either a new upload OR changed image_path
        !!curM?.newImageFile ||
        (curClean?.image_path || "") !== (origClean?.image_path || "");

      if (!changed) continue;

      // if new image file, force meta_data.image_path to include file name for matching
      const meta = { ...curClean };
      if (curM?.newImageFile) {
        meta.image_path = buildVirtualImagePath(curM.newImageFile);
        files.push(curM.newImageFile);
      }

      payload.push({
        collectionName: "exams",
        collection_type: "COE",
        action: "update",
        title: "update",
        category: sec.category,
        meta_data: meta,
        original_data: origClean,
      });
    }
  });

  return { payload, files };
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const AdminCoe = ({ toggle, theme }) => {
  const [coeData, setCoeData] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [requestMode, setRequestMode] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // purely for showing in your request modal table (optional)
  const [changes, setChanges] = useState([]);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const { sendRequest, loading: requestLoading } = useAdminRequest();

  const UrlParser = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/main-backend/exam", {
          type: "COE",
        });
        const data = response.data.data;

        // IMPORTANT: assign stable client_id keys once, so edits don't look like deletes
        const withIds = ensureClientIds(data);

        setCoeData(withIds);
        setOriginalData(deepClone(withIds));
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
  }, [navigate]);

  const handleAddStaff = (sectionIndex) => {
    const updated = [...coeData];

    const newMember = {
      client_id: `coe_new_${sectionIndex}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: "",
      qualification: "",
      position: "",
      image_path: "",
      newImageFile: null,
      imagePreview: null,
    };

    updated[sectionIndex].members.push(newMember);
    setCoeData(updated);
    setHasChanges(true);

    setChanges((prev) => [
      ...prev,
      {
        action: "Added",
        section: updated[sectionIndex].category,
        sIdx: sectionIndex,
        mKey: newMember.client_id,
        name: "New Staff",
      },
    ]);
  };

  const handleFieldChange = (sIdx, mIdx, field, value) => {
    const updated = [...coeData];
    updated[sIdx].members[mIdx][field] = value;
    setCoeData(updated);
    setHasChanges(true);

    const memberName = updated[sIdx].members[mIdx].name;
    const key = memberKey(updated[sIdx].members[mIdx]);

    setChanges((prev) => {
      const existing = prev.find((c) => c.sIdx === sIdx && c.mKey === key);

      return [
        ...prev.filter((c) => !(c.sIdx === sIdx && c.mKey === key)),
        {
          action: existing?.action === "Added" ? "Added" : "Edited",
          section: updated[sIdx].category,
          sIdx,
          mKey: key,
          name: memberName || "(Unnamed)",
        },
      ];
    });
  };

  const handleImageUpload = (sIdx, mIdx, file) => {
    if (!file) return;
    const updated = [...coeData];

    updated[sIdx].members[mIdx].newImageFile = file;
    updated[sIdx].members[mIdx].imagePreview = URL.createObjectURL(file);

    // Set image_path to virtual path so file name is present in meta_data for matching
    updated[sIdx].members[mIdx].image_path = buildVirtualImagePath(file);

    setCoeData(updated);
    setHasChanges(true);

    const memberName = updated[sIdx].members[mIdx].name;
    const key = memberKey(updated[sIdx].members[mIdx]);

    setChanges((prev) => {
      const existing = prev.find((c) => c.sIdx === sIdx && c.mKey === key);

      return [
        ...prev.filter((c) => !(c.sIdx === sIdx && c.mKey === key)),
        {
          action: existing?.action === "Added" ? "Added" : "Image Changed",
          section: updated[sIdx].category,
          sIdx,
          mKey: key,
          name: memberName || "(Unnamed)",
        },
      ];
    });
  };

  const handleCheckboxChange = (sIdx, mIdx) => {
    const key = memberKey(coeData?.[sIdx]?.members?.[mIdx]);
    if (!key) return;
    setSelectedMembers((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key],
    );
  };

  const handleDeleteConfirmed = () => {
    const deletedChanges = [];
    const updated = (coeData || []).map((section, sIdx) => {
      const kept = [];
      (section.members || []).forEach((m, mIdx) => {
        const k = memberKey(m);
        if (selectedMembers.includes(k)) {
          deletedChanges.push({
            action: "Deleted",
            section: section.category,
            sIdx,
            mKey: k,
            name: m?.name || "(Unnamed)",
          });
        } else {
          kept.push(m);
        }
      });
      return { ...section, members: kept };
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
    const updated = deepClone(coeData);

    const sIdx = change.sIdx;
    const sec = updated?.[sIdx];
    if (!sec) return;

    const curIdx = sec.members.findIndex((m) => memberKey(m) === change.mKey);

    if (change.action === "Added") {
      if (curIdx !== -1) sec.members.splice(curIdx, 1);
    }

    if (change.action === "Image Changed" || change.action === "Edited") {
      const originalMember = originalData?.[sIdx]?.members?.find(
        (m) => memberKey(m) === change.mKey,
      );
      if (originalMember && curIdx !== -1)
        sec.members[curIdx] = deepClone(originalMember);
    }

    if (change.action === "Deleted") {
      const originalMember = originalData?.[sIdx]?.members?.find(
        (m) => memberKey(m) === change.mKey,
      );
      if (originalMember) {
        // insert back (best-effort) at end
        sec.members.push(deepClone(originalMember));
      }
    }

    setCoeData(updated);
    setChanges((prev) =>
      prev.filter(
        (c) =>
          !(
            c.sIdx === change.sIdx &&
            c.mKey === change.mKey &&
            c.action === change.action
          ),
      ),
    );
  };

  const handleCancel = () => {
    setCoeData(deepClone(originalData));
    setIsEditing(false);
    setHasChanges(false);
    setSelectedMembers([]);
    setChanges([]);
  };

  const handleDiscardChanges = () => {
    const resetData = deepClone(originalData);
    resetData?.forEach((section) =>
      section.members.forEach((member) => {
        delete member.newImageFile;
        delete member.imagePreview;
      }),
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

  // Build payload preview for the modal (optional; also used for sending)
  const requestBuild = useMemo(() => {
    if (!originalData || !coeData) return { payload: [], files: [] };
    return buildCoePayloadAndFiles(originalData, coeData);
  }, [originalData, coeData]);

  // helper to convert tracked `changes` -> request modal rows (newGallery style)
  const requestRows = useMemo(() => {
    return (changes || []).map((c, idx) => ({
      action:
        c.action === "Added"
          ? "insert"
          : c.action === "Deleted"
            ? "delete"
            : "update",
      category: c.section,
      files: c.action === "Image Changed" ? [1] : [],
      links: [],
      _idx: idx,
      _raw: c,
    }));
  }, [changes]);

  // Auto-close request modal and return to original page (Edit button visible) when no changes left
  useEffect(() => {
    if (!showRequestModal) return;

    if (requestRows.length === 0) {
      setShowRequestModal(false);
      setRequestMode(false);
      setIsEditing(false);
      setSelectedMembers([]);
      setHasChanges(false);
      setChanges([]);
    }
  }, [showRequestModal, requestRows.length]);

  const handleFinalRequest = async () => {
    const { payload, files } = requestBuild;

    if (!payload.length) {
      // nothing to send; just close
      setShowRequestModal(false);
      setRequestMode(false);
      setIsEditing(false);
      setSelectedMembers([]);
      setChanges([]);
      setHasChanges(false);
      return;
    }

    const res = await sendRequest(payload, files);
    if (!res?.success) return;

    // After successful submit, treat current as new original
    setOriginalData(deepClone(coeData));

    setShowRequestModal(false);
    setRequestMode(false);
    setIsEditing(false);
    setSelectedMembers([]);
    setChanges([]);
    setHasChanges(false);
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
      />
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="office of controller of examinations"
        subHeaderText="COE"
      />

      <div className="relative py-10 px-4 md:px-20 bg-prim dark:bg-drkp justify-center font-[Poppins]">
        {!isEditing && !requestMode && (
          <button
            className="absolute top-6 right-8 flex items-center gap-2 px-4 py-1 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim transition"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} /> Edit
          </button>
        )}

        {/* First section */}
        {coeData && coeData.length > 0 && (
          <div className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] w-full md:w-fit ml-auto mr-auto shadow-md rounded-lg mb-10 p-6 md:p-10">
            <h2 className="text-2xl font-bold text-[#800000] dark:text-drkt text-center mb-6">
              {coeData[0].category}
            </h2>

            {coeData[0].members.map((member, index) => (
              <div
                key={memberKey(member) || index}
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
                          handleImageUpload(0, index, e.target.files?.[0])
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
                            e.target.value,
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
                            e.target.value,
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

        {/* Middle two sections */}
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
                    key={memberKey(member) || index}
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
                                e.target.files?.[0],
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
                                e.target.value,
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
                                e.target.value,
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
                                e.target.value,
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
                const key = memberKey(member) || `${sIdx + 3}-${mIdx}`;
                return (
                  <div
                    key={key}
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
                      {member.imagePreview || member.image_path ? (
                        <img
                          src={
                            member.imagePreview
                              ? member.imagePreview
                              : UrlParser(member.image_path)
                          }
                          alt={member.name}
                          className="w-[80px] h-[100px] object-cover rounded"
                        />
                      ) : (
                        <div className="w-[80px] h-[100px] flex items-center justify-center border-2 border-dashed border-gray-400 rounded text-xs text-gray-500 text-center">
                          No Image
                        </div>
                      )}

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
                                e.target.files?.[0],
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
                            {member.image_path || member.imagePreview
                              ? "Replace"
                              : "Upload"}
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 justify-center">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 3,
                                mIdx,
                                "name",
                                e.target.value,
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-[250px]"
                          />
                          <input
                            type="text"
                            placeholder="Qualification"
                            value={member.qualification}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 3,
                                mIdx,
                                "qualification",
                                e.target.value,
                              )
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                          <input
                            type="text"
                            placeholder="Designation"
                            value={member.position}
                            onChange={(e) =>
                              handleFieldChange(
                                sIdx + 3,
                                mIdx,
                                "position",
                                e.target.value,
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

                          {member.qualification && (
                            <p className="text-sm text-brwn dark:text-drka">
                              {member.qualification}
                            </p>
                          )}

                          {member.position && (
                            <p className="text-sm text-brwn dark:text-drka">
                              {member.position}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {isEditing && (
                <div
                  onClick={() => handleAddStaff(sIdx + 3)}
                  className="flex items-center justify-center w-full sm:w-[90%] md:w-[45%] lg:w-[430px] border-2 border-dashed border-yellow-500 rounded-xl p-6 cursor-pointer hover:bg-yellow-50 dark:hover:bg-drkp transition"
                >
                  <div className="flex flex-col items-center gap-2 text-yellow-600">
                    <Plus size={32} />
                    <span className="font-semibold">Add Staff</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Buttons */}
        {isEditing && (
          <div className="flex flex-col items-center gap-4 mt-6">
            {selectedMembers.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete Selected
              </button>
            )}

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

        {/* Request Modal (your provided modal) */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
              <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                Final Request for the Changes
              </h2>
              <p className="text-sm text-red-500 mb-4">
                Note: Your changes will stay pending until approved by the
                superior admin. Once approved, they will be applied
                automatically to the live site.
              </p>

              <div className="max-h-[200px] overflow-y-auto mb-4">
                {requestRows.length > 0 ? (
                  <table className="w-full text-left text-text dark:text-drkt">
                    <thead>
                      <tr>
                        <th className="py-1">Action</th>
                        <th className="py-1">Section</th>
                        <th className="py-1">Changes</th>
                        <th className="py-1">Undo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestRows.map((g, i) => (
                        <tr key={i}>
                          <td className="py-1">
                            {g.action === "insert" && (
                              <span className="text-green-600">+ Added</span>
                            )}
                            {g.action === "update" && (
                              <span className="text-blue-600">✎ Edited</span>
                            )}
                            {g.action === "delete" && (
                              <span className="text-red-600">– Deleted</span>
                            )}
                          </td>
                          <td className="py-1">{g.category}</td>
                          <td className="py-1">
                            {g.files.length} images
                            {g.links.length > 0
                              ? `, ${g.links.length} links`
                              : ""}
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                const raw = g._raw;

                                // Remove this change from list
                                setChanges((prev) =>
                                  prev.filter((_, idx) => idx !== g._idx),
                                );

                                // Apply undo
                                undoChange(raw);
                              }}
                            >
                              <X />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400">No gallery changes found.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className={`px-4 py-2 rounded bg-gray-400 text-white ${requestLoading ? "cursor-not-allowed" : ""}`}
                  disabled={requestLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalRequest}
                  className={`px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt ${requestLoading ? "cursor-progress" : "hover:bg-[#800000]"}`}
                  disabled={requestLoading}
                >
                  {requestLoading ? "Processing..." : "Final Request"}
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
