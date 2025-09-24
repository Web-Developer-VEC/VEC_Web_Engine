import React, { useEffect, useState } from 'react';
import axios from "axios";
import './AdminPlacementTeam.css';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import { useNavigate } from "react-router";
import { Trash2 } from 'lucide-react';
import { Pencil, Send, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PersonDetail({ person, isEditable, onChange }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  if (!person) return null;

  const hasImage = !!(person.image_path || person.photo_file);

  return (
    <div className={`person-detail left dark:bg-drkts new-card-wrap`} style={{ position: 'relative' }}>
      <div className="person-image-wrap new-image-wrap">
        <img src={UrlParser(person.image_path)} alt={person?.name} className="person-image" />
        {isEditable && (
          <div className="new-upload-below">
            <label className="new-upload-label bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
              {hasImage ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onChange('photo_file', e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>

      <div className="person-content">
        {isEditable ? (
          <>
            <input
              className="person-input"
              value={person.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Name"
            />
            <input
              className="person-input"
              value={person.designation || ''}
              onChange={(e) => onChange('designation', e.target.value)}
              placeholder="Designation"
            />
            <textarea
              className="person-textarea"
              rows={4}
              value={person.content || ''}
              onChange={(e) => onChange('content', e.target.value)}
              placeholder="Description / Content"
            />
          </>
        ) : (
          <>
            <h3 className='placement-head'>{person?.name}</h3>
            <p className="text-accn dark:text-drka text-[24px]">{person?.designation}</p>
            <p>{person?.content}</p>
          </>
        )}
      </div>
    </div>
  );
}

function PersonMemberDetail({ person, isImageLeft, isEditable, onChange, checked, onCheck }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  const hasImage = !!(person.image_path || person.photo_file);

  return (
    <div
      className={`person-detail ${isImageLeft ? 'left' : 'right'} dark:bg-drkts new-card-wrap`}
      style={{ position: 'relative' }}
    >
      {isEditable && (
        <input
          type="checkbox"
          className="new-top-checkbox"
          checked={!!checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label={`select ${person?.name || 'member'}`}
        />
      )}

      <div className="new-image-wrap">
        <img src={UrlParser(person.image_path)} alt={person?.name} className="person-image-mem" />
        {isEditable && (
          <div className="new-upload-below">
            <label className="new-upload-label bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
              {hasImage ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onChange('photo_file', e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>

      <div className="person-content-mem">
        {isEditable ? (
          <>
            <div className="flex items-center justify-between">
              <input
                className="w-[100%] p-1 rounded border"
                value={person.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Name"
              />
            </div>
            <input
              className="w-full mt-2 p-1 rounded border"
              value={person.designation || ''}
              onChange={(e) => onChange('designation', e.target.value)}
              placeholder="Designation"
            />
          </>
        ) : (
          <>
            <h3 className='placement-member-head'>{person?.name}</h3>
            <p className="text-accn dark:text-drka ">{person?.designation}</p>
          </>
        )}
      </div>
    </div>
  );
}

export const AdminPlacementTeam = ({ toggle, theme }) => {
  // saved (server) version:
  const [placementTeam, setPlacementTeam] = useState([]);
  // current in-editor draft (when editMode true):
  const [draftTeam, setDraftTeam] = useState([]);
  // saved-by-user draft that is pending approval (when user clicks Save)
  const [pendingDraft, setPendingDraft] = useState(null);

  // snapshot of the draft when entering edit mode — used so Cancel reverts only session edits
  const [initialDraft, setInitialDraft] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false); // true when pendingDraft exists
  const [selectedItems, setSelectedItems] = useState([]); // indexes of selected members in draftTeam.slice(1)
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  // returns whether the draft differs from current saved placementTeam (unsaved edits vs server)
  const hasServerDiff = (d = draftTeam) => JSON.stringify(placementTeam) !== JSON.stringify(d);

  // returns whether the draft differs from initialDraft (i.e., session unsaved changes)
  const hasSessionChanges = () => {
    if (!initialDraft) return false;
    return JSON.stringify(initialDraft) !== JSON.stringify(draftTeam);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/placement`, { type: "placement_team" });
        const data = response.data.data || [];
        setPlacementTeam(data.map(x => ({ ...x })));
        setDraftTeam(data.map(x => ({ ...x })));
        setPendingDraft(null);
        setPendingChanges(false);
        setInitialDraft(null);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error?.message);
        if (error?.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error?.response?.data?.message } });
        }
        setIsLoading(false);
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

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  // ---------- Editable handlers ----------
  const enterEdit = () => {
    setEditMode(true);
    // choose base: pendingDraft (if user previously saved) else placementTeam
    const base = pendingDraft ? pendingDraft : placementTeam;
    const snapshot = (base || []).map(x => ({ ...x }));
    setInitialDraft(snapshot); // snapshot of state at edit-session start
    setDraftTeam(snapshot.map(x => ({ ...x })));
  };

  const exitEdit = () => {
    // revert unsaved edits only — now we revert to initialDraft (session start)
    if (initialDraft) {
      setDraftTeam(initialDraft.map(x => ({ ...x })));
    } else {
      setDraftTeam((placementTeam || []).map(x => ({ ...x })));
    }
    setSelectedItems([]);
    setEditMode(false);
    setInitialDraft(null);
  };

  const handleFieldChange = (idx, field, value) => {
    setDraftTeam(prev => {
      const copy = prev.map(x => ({ ...x }));
      if (!copy[idx]) copy[idx] = {};
      if (field === 'photo_file') {
        copy[idx].photo_file = value;
        try {
          copy[idx].image_path = URL.createObjectURL(value);
        } catch (e) {
          console.warn('object url failed', e);
        }
      } else {
        copy[idx][field] = value;
      }
      return copy;
    });
  };

  const handleSave = async () => {
    setPendingDraft(draftTeam.map(x => ({ ...x })));
    setPendingChanges(true);
    setEditMode(false);
    setSelectedItems([]);
    setInitialDraft(null);
  };

  const handleDiscardAll = () => {
    setPendingDraft(null);
    setDraftTeam((placementTeam || []).map(x => ({ ...x })));
    setPendingChanges(false);
    setSelectedItems([]);
    setEditMode(false);
    setInitialDraft(null);
    toast.error("All changes discarded.");
  };

  const handleCancel = () => {
    if (hasSessionChanges()) {
      setDraftTeam(initialDraft.map(x => ({ ...x })));
      setEditMode(false);
      setSelectedItems([]);
      setInitialDraft(null);
    } else {
      setEditMode(false);
      setInitialDraft(null);
    }
  };

  const toggleSelectItem = (memberIndex, checked) => {
    setSelectedItems(prev => {
      const copy = new Set(prev);
      if (checked) copy.add(memberIndex);
      else copy.delete(memberIndex);
      return Array.from(copy);
    });
  };

  const confirmMultiDelete = () => {
    setShowMultiDeleteConfirm(false);
    // selectedItems correspond to indexes inside draftTeam.slice(1)
    setDraftTeam(prev => prev.filter((_, idx) => !(idx >= 1 && selectedItems.includes(idx - 1))));
    setSelectedItems([]);
  };

  // Add a new blank member at the end
  const handleAddNewMember = () => {
    setDraftTeam(prev => [
      ...prev,
      { name: "", designation: "", image_path: "", content: "" }
    ]);
  };

  const getChanges = (baseDraft = pendingDraft) => {
    const changes = [];
    const orig = placementTeam || [];
    const draf = (baseDraft || []);

    const maxLen = Math.max(orig.length, draf.length);
    for (let i = 0; i < maxLen; i++) {
      const o = orig[i];
      const d = draf[i];
      if (o && !d) {
        changes.push({ action: 'Deleted', section: 'Placement Team', data: o, index: i });
      } else if (!o && d) {
        changes.push({ action: 'Added', section: 'Placement Team', data: d, index: i });
      } else if (o && d && JSON.stringify(o) !== JSON.stringify(d)) {
        changes.push({ action: 'Modified', section: 'Placement Team', data: d, index: i });
      }
    }
    return changes;
  };

  const handleRevertChange = (change) => {
    setPendingDraft(prevPending => {
      const working = (prevPending || []).map(x => ({ ...x }));
      if (!prevPending) {
        setDraftTeam(prev => {
          const copy = prev.map(x => ({ ...x }));
          if (change.action === 'Added') {
            copy.splice(change.index, 1);
            return copy;
          } else if (change.action === 'Modified') {
            copy[change.index] = { ...(placementTeam[change.index] || {}) };
            return copy;
          } else if (change.action === 'Deleted') {
            copy.splice(change.index, 0, (placementTeam[change.index] || {}));
            return copy;
          }
          return prev;
        });
        return null;
      }

      if (change.action === 'Added') {
        working.splice(change.index, 1);
      } else if (change.action === 'Modified') {
        working[change.index] = { ...(placementTeam[change.index] || {}) };
      } else if (change.action === 'Deleted') {
        working.splice(change.index, 0, { ...(placementTeam[change.index] || {}) });
      }
      setDraftTeam(working.map(x => ({ ...x })));
      return working;
    });
  };

  const handleRequestConfirm = async () => {
    try {
      setShowRequestModal(false);
      toast.success("Request submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    }
  };

  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Team"
        subHeaderText="Connecting talent with opportunity through strategic partnerships and career support services." />

      <div className='place-container pb-60 pt-10'>
        <div className="Placement-App" style={{ marginTop: '30px', position: 'relative' }}>

          {/* Edit button top-right (visible when not editing) */}
          {!editMode && (
            <div style={{ position: 'absolute', right: 12, top: -50, zIndex: 50 }}>
              <button
                onClick={enterEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdcc03] text-text rounded hover:bg-[#800000] hover:text-prim"
                aria-label="Enter edit mode"
              >
                <Pencil size={16} />
                <span>Edit</span>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
              <LoadComp txt={""} />
            </div>
          ) : (
            <>
              {/* Main person */}
              <PersonDetail
                person={draftTeam[0] || { name: "", designation: "", content: "", image_path: "" }}
                isEditable={editMode}
                onChange={(field, value) => handleFieldChange(0, field, value)}
              />

              {/* Members list */}
              <div className="placement-members">
                {draftTeam.slice(1).map((person, index) => (
                  // use stable key based on index to avoid remount when name changes
                  <PersonMemberDetail
                    key={`member-${index}`}
                    person={person}
                    isImageLeft={index % 2 === 0}
                    isEditable={editMode}
                    onChange={(field, value) => handleFieldChange(index + 1, field, value)}
                    checked={selectedItems.includes(index)}
                    onCheck={(checked) => toggleSelectItem(index, checked)}
                  />
                ))}

                {/* ADD NEW MEMBER CARD centered and same size */}
                {editMode && (
                  <div
                    className="person-detail centered-card dark:bg-drkts new-card-wrap flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    style={{ position: 'relative', minHeight: '220px', minWidth: '300px', margin: '20px auto' }}
                    onClick={handleAddNewMember}
                    aria-label="Add new member"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Plus size={26} />
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-delete center bottom (visible only while editing and items selected) */}
              {editMode && selectedItems.length > 0 && (
                <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 z-40">
                  <button
                    onClick={() => setShowMultiDeleteConfirm(true)}
                    className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete ({selectedItems.length})
                  </button>
                </div>
              )}

              {/* Bottom right action buttons */}
              <div style={{ position: 'absolute', right: 20, bottom: -40, display: 'flex', gap: 8, zIndex: 60 }}>
                {/* CANCEL (left) - visible in edit mode */}
                {editMode && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}

                {/* SAVE (right) - visible only while editing and there are unsaved session changes */}
                {editMode && hasSessionChanges() && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                  >
                    Save
                  </button>
                )}

                {/* After saving (not editing) show Discard & Request */}
                {!editMode && pendingChanges && (
                  <>
                    <button
                      onClick={handleDiscardAll}
                      className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-[#fdcc03] text-text hover:bg-[#800000] hover:text-prim"
                    >
                      <Send size={16}/>
                      Request
                    </button>
                  </>
                )}
              </div>

              {/* Multi-delete Confirmation Modal */}
              {showMultiDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
                  <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[420px]">
                    <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
                    <p className="mb-4">Are you sure you want to delete {selectedItems.length} selected item</p>
                    <div className="flex justify-end gap-2 mt-[20px]">
                      <button
                        onClick={() => setShowMultiDeleteConfirm(false)}
                        className="px-4 py-2 rounded bg-gray-400 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmMultiDelete}
                        className="px-4 py-2 rounded bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Request Modal (shows changes from pendingDraft) */}
              {showRequestModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                  <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[600px]">
                    <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                      Request
                    </h2>
                    <p className="text-sm text-red-500 mb-4">
                      Note: Your changes will stay pending until approved by the superior admin.
                      Once approved they will go live.
                    </p>

                    <div className="max-h-[250px] overflow-y-auto mb-4">
                      <table className="w-full text-center text-text dark:text-drkt border">
                        <thead>
                          <tr className="bg-gray-200 dark:bg-drka">
                            <th className="py-1">Action</th>
                            <th className="py-1">Section</th>
                            <th className="py-1 text-center">Changes</th>
                            <th className="py-1">Undo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getChanges(pendingDraft).map((change, idx) => (
                            <tr key={idx} className="border-t">
                              <td
                                className={`py-1 ${
                                  change.action === "Added"
                                    ? "text-green-600"
                                    : change.action === "Deleted"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {change.action}
                              </td>
                              <td className="py-1">Placement Team</td>
                              <td className="py-1 text-[12px]">
                                <div className="flex items-center justify-center gap-2">
                                  <span>{change.data?.name || "Unnamed"}</span>
                                </div>
                              </td>
                              <td><button
                                    onClick={() => handleRevertChange(change)}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                  >
                                    ✕
                                  </button></td>
                            </tr>
                          ))}
                          {getChanges(pendingDraft).length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-3 text-sm">No pending changes.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowRequestModal(false)}
                        className="px-4 py-2 rounded bg-gray-400 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequestConfirm}
                        className="px-4 py-2 rounded bg-[#fdcc03] dark:drks hover:bg-[#800000] text-text hover:text-prim"
                      >
                        Final Request
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default AdminPlacementTeam;
