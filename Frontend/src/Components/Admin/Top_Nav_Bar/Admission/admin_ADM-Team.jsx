import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../../hooks/useAdminRequest";

const AdminADMteam = ({ theme, toggle }) => {
  const [admissionteamData, setAdmissionteamData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [teamCardEdit, setTeamCardEdit] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showRequestButtons, setShowRequestButtons] = useState(false);
  const [changeList, setChangeList] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { sendRequest, loading, error } = useAdminRequest();
  const [imageFiles, setImageFiles] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // new ref: committedRef holds the *last saved* state (deep clone of admissionteamData at Save)
  const committedRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL || "";
  const navigate = useNavigate();

  const UrlParser = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  // helper deep clone (JSON-safe)
  const deepClone = (v) => JSON.parse(JSON.stringify(v));

  // compute diff between original array and committed array (by id)
  const computeDiff = (originalArr = [], committedArr = []) => {
    const result = [];
    const origMap = new Map(originalArr.map((o) => [o.id, o]));
    const commMap = new Map(committedArr.map((c) => [c.id, c]));

    // additions & edits
    for (const [id, commItem] of commMap.entries()) {
      const origItem = origMap.get(id);
      if (!origItem) {
        result.push({
          type: "added",
          section: commItem.name || "New Team Member",
          fields: {},
          data: commItem,
        });
        continue;
      }

      // compare fields
      const editedFields = {};
      ["name", "designation", "image_path"].forEach((field) => {
        const a = origItem[field] ?? "";
        const b = commItem[field] ?? "";
        if (String(a) !== String(b)) {
          editedFields[field] = { before: a, after: b };
        }
      });

      if (Object.keys(editedFields).length > 0) {
        result.push({
          type: "edited",
          section: commItem.name || "Team Member",
          fields: editedFields,
          data: commItem,
        });
      }
    }

    // deletions
    for (const [id, origItem] of origMap.entries()) {
      if (!commMap.has(id)) {
        result.push({
          type: "deleted",
          section: origItem.name,
          fields: {},
          data: origItem,
        });
      }
    }

    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/admission`, {
          type: "admission_team",
        });
        const raw = response.data.data || [];
        const dataWithIds = raw.map((item) => ({ ...item, id: item.id || generateId() }));

        setAdmissionteamData(deepClone(dataWithIds));
        setOriginalData(deepClone(dataWithIds));
        // committedRef initially equals original fetched data (no local saves yet)
        committedRef.current = deepClone(dataWithIds);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
        if (error.response?.data?.status === 429) {
          navigate("/ratelimit", {
            state: { msg: error.response.data.message },
          });
        }
      }
    };
    fetchData();
  }, [navigate]);

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

  // trackChange now compares against **committedRef.current** (last saved),
  // so nested edits are transient relative to the last save
  const trackChange = (index, field, value) => {
    setAdmissionteamData((prev) => {
      const updated = [...prev];
      if (field === "name") value = value.toUpperCase();

      updated[index] = { ...updated[index], [field]: value };
      const item = updated[index];

      // baseline is last saved state (committedRef) or originalData if no commit yet
      const baselineArr = committedRef.current ?? originalData;
      const baselineItem = baselineArr.find((b) => b.id === item.id) || {};

      // if item is flagged as new, update added change entry if present (or keep transient)
      if (item.isNew) {
        setChangeList((prevChanges) => {
          // find an existing "added" for the same id; update it
          const idx = prevChanges.findIndex((c) => c.type === "added" && c.data?.id === item.id);
          if (idx >= 0) {
            const copy = [...prevChanges];
            copy[idx] = { ...copy[idx], data: item };
            return copy;
          }
          // else, keep whatever existing pending changeList is (we do not push here)
          return prevChanges;
        });
        return updated;
      }

      // compute edited fields vs baseline (last saved)
      const editedFields = {};
      ["name", "designation", "image_path", "imageFile"].forEach((key) => {
        const before = baselineItem[key] ?? "";
        const after = item[key] ?? "";
        // for File objects, we compare by presence/reference
        if (key === "imageFile") {
          if (
            (baselineItem.imageFile && !item.imageFile) ||
            (!baselineItem.imageFile && item.imageFile) ||
            (baselineItem.imageFile && item.imageFile && baselineItem.imageFile !== item.imageFile)
          ) {
            editedFields[key] = { before: baselineItem.image_path ?? "", after: item.image_path ?? "" };
          }
        } else {
          if (String(before) !== String(after)) {
            editedFields[key] = { before: before || "", after: after || "" };
          }
        }
      });

      setChangeList((prevChanges) => {
        // if nothing changed relative to baseline, remove any existing 'edited' entry for this item
        const existingIndex = prevChanges.findIndex((c) => c.type === "edited" && c.data?.id === item.id);
        if (Object.keys(editedFields).length === 0) {
          return existingIndex >= 0 ? prevChanges.filter((_, i) => i !== existingIndex) : prevChanges;
        }

        const newChange = {
          type: "edited",
          section: item.name || "Team Member",
          fields: editedFields,
          data: item,
        };

        if (existingIndex >= 0) {
          const copy = [...prevChanges];
          copy[existingIndex] = newChange;
          return copy;
        }
        return [...prevChanges, newChange];
      });

      return updated;
    });
  };

  const buildAdmissionTeamPayload = ({ action, newData, oldData, deleteImageOnly = false }) => {
    if (action === "insert") {
      return {
        collectionName: "admissions",
        collection_type: "admission_team",
        action: "insert",
        title: "Insert single admission team member",
        meta_data: {
          name: newData.name,
          designation: newData.designation,
          image_path: newData.image_path || "",
        },
        admin: { status: "pending" },
      };
    }

    if (action === "update") {
      return {
        collectionName: "admissions",
        collection_type: "admission_team",
        action: "update",
        title: "Update Admission Team Member",
        meta_data: {
          name: newData.name,
          designation: newData.designation,
          image_path: newData.image_path || "",
        },
        original_data: {
          name: oldData.name,
          designation: oldData.designation,
          image_path: oldData.image_path || "",
        },
        admin: { status: "pending" },
      };
    }

    if (action === "delete" && deleteImageOnly) {
      return {
        collectionName: "admissions",
        collection_type: "admission_team",
        action: "delete",
        title: "Delete photo_path for admission team member",
        meta_data: {
          name: newData.name,
          image_path: newData.image_path,
        },
        admin: { status: "pending" },
      };
    }

    if (action === "delete") {
      return {
        collectionName: "admissions",
        collection_type: "admission_team",
        action: "delete",
        title: "Delete admission team member",
        meta_data: {
          name: newData.name,
        },
        admin: { status: "pending" },
      };
    }

    return null;
  };

  const handleSelect = (id, isChecked) => {
    setSelectedItems((prev) => (isChecked ? [...prev, id] : prev.filter((itemId) => itemId !== id)));
  };

  const addNewCard = () => {
    const newMember = {
      id: generateId(),
      name: "",
      designation: "",
      image_path: "",
      isNew: true,
    };

    setAdmissionteamData((prev) => [...prev, newMember]);

    setChangeList((prev) => [
      ...prev,
      {
        type: "added",
        section: "New Team Member",
        fields: {},
        data: newMember,
      },
    ]);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.info("No team member selected.");
      return;
    }
    const deletedItems = admissionteamData.filter((item) => selectedItems.includes(item.id));
    setAdmissionteamData((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setChangeList((prev) => {
      let updated = [...prev];

      deletedItems.forEach((d) => {
        if (d.isNew) {
          // remove earlier 'added' transient change
          updated = updated.filter((c) => !(c.data?.id === d.id && c.type === "added"));
          return;
        }

        // remove any existing 'edited' for this id
        updated = updated.filter((c) => !(c.data?.id === d.id && c.type === "edited"));

        updated.push({
          type: "deleted",
          section: d.name,
          fields: {},
          data: d,
        });
      });

      return updated;
    });

    setSelectedItems([]);
  };

  const revertField = (changeIdx) => {
    setChangeList((prevChanges) => {
      const change = prevChanges[changeIdx];
      if (!change) return prevChanges;

      if (change.type === "added") {
        setAdmissionteamData((prev) => prev.filter((f) => f.id !== change.data.id));
        return prevChanges.filter((_, i) => i !== changeIdx);
      }

      if (change.type === "deleted") {
        setAdmissionteamData((prev) => [...prev, change.data]);
        return prevChanges.filter((_, i) => i !== changeIdx);
      }

      if (change.type === "edited") {
        // Revert fields back to committedRef (last saved) if available; otherwise originalData
        const baselineArr = committedRef.current ?? originalData;
        setAdmissionteamData((prev) => {
          const updated = [...prev];
          const idxF = updated.findIndex((f) => f.id === change.data.id);
          const baseline = baselineArr.find((b) => b.id === change.data.id) || {};
          if (idxF >= 0) {
            Object.keys(change.fields).forEach((field) => {
              updated[idxF][field] = baseline[field] ?? "";
            });
          }
          return updated;
        });
        return prevChanges.filter((_, i) => i !== changeIdx);
      }

      return prevChanges;
    });
  };

  const handleSave = () => {
    const invalid = admissionteamData.some((f) => !f.name?.trim() || !f.designation?.trim());

    if (invalid) {
      toast.error("Name and designation are required");
      return;
    }

    // When saving, commit the current UI data as the last saved state
    committedRef.current = deepClone(admissionteamData);

    // Collect any saved image files from admissionteamData and store in committedRef.savedFiles
    const savedFiles = {};
    admissionteamData.forEach((item) => {
      if (item.imageFile) {
        savedFiles[item.id] = item.imageFile;
      }
    });
    committedRef.current.savedFiles = savedFiles;

    // Build the persistent changeList as diff between originalData (fetched) and new committed data
    const pending = computeDiff(originalData, committedRef.current);
    setChangeList(pending);

    setShowRequestButtons(true);
    setTeamCardEdit(false);

    toast.success("Changes saved locally.");
  };

  const handleDiscard = () => {
    // Restore everything to original fetched state
    setAdmissionteamData(deepClone(originalData));
    setSelectedItems([]);
    setChangeList([]);
    setImagePreviews({});
    setShowRequestButtons(false);
    setTeamCardEdit(false);

    // committedRef resets to originalData as well
    committedRef.current = deepClone(originalData);

    toast.info("All changes discarded, back to original data.");
  };

  const handleRequestConfirm = async () => {
    try {
      // make sure changeList is computed relative to originalData
      if (!changeList || changeList.length === 0) {
        toast.warn("No changes to submit");
        return;
      }

      const requests = [];
      const files = [];

      // use committedRef.current.savedFiles for files if present
      const savedFiles = (committedRef.current && committedRef.current.savedFiles) || {};

      changeList.forEach((change) => {
        const current = (committedRef.current || []).find((m) => m.id === change.data.id) || admissionteamData.find((m) => m.id === change.data.id);
        const original = originalData.find((o) => o.id === change.data.id);

        if (change.type === "added") {
          requests.push(
            buildAdmissionTeamPayload({
              action: "insert",
              newData: current,
            })
          );

          // if file was saved for this id, attach it
          if (savedFiles[change.data.id]) {
            files.push(savedFiles[change.data.id]);
          } else if (current?.imageFile) {
            files.push(current.imageFile);
          }
        }

        if (change.type === "edited") {
          requests.push(
            buildAdmissionTeamPayload({
              action: "update",
              newData: current,
              oldData: original || {},
            })
          );

          if (savedFiles[change.data.id]) {
            files.push(savedFiles[change.data.id]);
          } else if (current?.imageFile) {
            files.push(current.imageFile);
          }
        }

        if (change.type === "deleted") {
          requests.push(
            buildAdmissionTeamPayload({
              action: "delete",
              newData: change.data,
            })
          );
        }
      });

      console.log("🚀 REQUESTS:", requests);
      console.log("📂 FILES:", files);

      await sendRequest(requests, files);

      toast.success("Request submitted successfully!");

      // Update originalData to the committed state (since admin will review)
      setOriginalData(deepClone(committedRef.current || admissionteamData));
      // reset change tracking
      setChangeList([]);
      setShowRequestModal(false);
      setShowRequestButtons(false);
      setTeamCardEdit(false);
    } catch (err) {
      console.error("❌ REQUEST FAILED:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  };

  const hasUnsavedChanges = useMemo(() => changeList.length > 0, [changeList]);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  const firstTwoCards = admissionteamData.slice(0, 1);
  const remainingCards = admissionteamData.slice(1);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/administrationbanner.webp"
        headerText="Admission team"
        subHeaderText="Driving organizational excellence through strategic leadership and seamless coordination."
      />

      <div className="flex justify-end mb-4">
        {!teamCardEdit && (
          <button
            onClick={() => {
              setTeamCardEdit(true);
              setShowRequestButtons(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg mt-4 mr-10"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <LoadComp txt="" />
        </div>
      ) : (
        <div className="regulation-container flex flex-col items-center">
          <div className="flex justify-center gap-6 mb-6 flex-wrap">
            {firstTwoCards.map((member, index) => (
              <TeamCard
                key={member.id}
                member={member}
                index={index}
                teamCardEdit={teamCardEdit}
                selectedItems={selectedItems}
                handleSelect={handleSelect}
                trackChange={trackChange}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                setImageFiles={setImageFiles}
                UrlParser={UrlParser}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {remainingCards.map((member, index) => (
              <TeamCard
                key={member.id}
                member={member}
                index={index + 1}
                teamCardEdit={teamCardEdit}
                selectedItems={selectedItems}
                handleSelect={handleSelect}
                trackChange={trackChange}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                setImageFiles={setImageFiles}
                UrlParser={UrlParser}
              />
            ))}

            {teamCardEdit && (
              <div
                className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 w-60 bg-prim shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={addNewCard}
              >
                <Plus className="text-gray-500" />
                <span className="mt-2 text-gray-500">Add New Member</span>
              </div>
            )}
          </div>

          {teamCardEdit && selectedItems.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} /> Delete Selected
              </button>
            </div>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
              <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[420px] shadow-lg">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                  Confirm Delete
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to delete the selected team member
                  {selectedItems.length > 1 ? "s" : ""}?
                </p>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => {
                      handleDeleteSelected();
                      setShowDeleteModal(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {teamCardEdit && !showRequestButtons && (
            <div className="mt-4 flex justify-end gap-3 w-full mr-14 mb-14">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  // Cancel should revert to last saved state committedRef.current (not originalData)
                  const committed = committedRef.current ?? originalData;
                  setAdmissionteamData(deepClone(committed));
                  setSelectedItems([]);
                  // after nested cancel we should keep pending changeList as before save (transient),
                  // but now restore changeList and showRequestButtons from committed baseline
                  const pending = computeDiff(originalData, committedRef.current ?? committed);
                  setChangeList(pending);
                  setShowRequestButtons(pending.length > 0);
                  // clear transient image previews (they will be recreated if committed saved files exist)
                  setImagePreviews({});
                  setTeamCardEdit(false);
                }}
              >
                Cancel
              </button>
              {hasUnsavedChanges && (
                <button className="flex items-center gap-2 px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-lg" onClick={handleSave}>
                  Save
                </button>
              )}
            </div>
          )}

          {showRequestModal && (
            <RequestModal
              changeList={changeList}
              revertField={revertField}
              handleRequestConfirm={handleRequestConfirm}
              closeModal={() => setShowRequestModal(false)}
              loading={loading}
            />
          )}

          {showRequestButtons && (
            <div className="flex justify-end w-full gap-3 mt-4 mr-12 mb-12">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={handleDiscard}>
                Discard changes
              </button>
              <button className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded flex items-center gap-2" onClick={() => setShowRequestModal(true)}>
                Request
              </button>
            </div>
          )}
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

const TeamCard = ({ member, index, teamCardEdit, selectedItems, handleSelect, trackChange, imagePreviews, setImagePreviews, setImageFiles, UrlParser }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews((prev) => ({
      ...prev,
      [member.id]: previewUrl,
    }));

    const imagePath = `/static/images/admission_team/${file.name}`;

    // We update both image_path (string) and imageFile (File object) on the item
    trackChange(index, "image_path", imagePath);
    trackChange(index, "imageFile", file);
  };

  return (
    <div className="relative border-2 border-secd dark:border-drks rounded-md flex flex-col items-center p-4 w-60 bg-prim dark:bg-drkp shadow hover:shadow-lg transition-shadow">
      <img src={imagePreviews[member.id] || UrlParser(member.image_path)} alt={member.name} className="rounded-md w-36 h-44 object-cover mb-2" />
      {teamCardEdit ? (
        <>
          <label className="bg-secd text-text hover:bg-brwn hover:text-prim px-3 py-1 rounded cursor-pointer mb-2">
            <span>{member.image_path ? "Replace" : "Upload"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <input type="text" value={member.name} placeholder="Name" className="w-full border p-2 rounded mb-2" onChange={(e) => trackChange(index, "name", e.target.value)} />
          <input type="text" value={member.designation} placeholder="Designation" className="w-full border p-2 rounded mb-2" onChange={(e) => trackChange(index, "designation", e.target.value)} />
          <div className="absolute top-2 right-2">
            <input type="checkbox" checked={selectedItems.includes(member.id)} onChange={(e) => handleSelect(member.id, e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-brwn dark:text-drkt text-center text-[18px]">{member.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{member.designation}</p>
        </>
      )}
    </div>
  );
};

const RequestModal = ({ changeList, revertField, handleRequestConfirm, closeModal, loading }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
    <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Request Changes</h2>
      <p className="text-red-600 mb-4">
        <span className="font-medium">Note:</span> Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 border">Action</th>
            <th className="text-left p-2 border">Section</th>
            <th className="text-left p-2 border">Changes</th>
            <th className="text-left p-2 border">Undo</th>
          </tr>
        </thead>
        <tbody>
          {changeList.map((c, idx) => (
            <tr key={idx} className="border-b">
              <td className="border p-2">
                <span className="capitalize ml-1">{c.type}</span>
              </td>
              <td className="p-2 border">Admin-team</td>
              <td className="p-2 border">{c.section}</td>
              <td className="p-2 border">
                <button className="p-1 rounded hover:bg-gray-100" onClick={() => revertField(idx)}>
                  <X />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end gap-3 mt-4">
        <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={closeModal}>
          Cancel
        </button>
        <button disabled={loading} className={`px-4 py-2 rounded bg-secd dark:drks text-text hover:text-drkt ${loading ? "cursor-progress" : "hover:bg-[#800000]"}`} onClick={handleRequestConfirm}>
          {loading ? "Processing..." : "Final Request"}
        </button>
      </div>
    </div>
  </div>
);

export default AdminADMteam;