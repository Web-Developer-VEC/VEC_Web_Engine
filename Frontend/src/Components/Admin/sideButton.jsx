import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './sideButton.css';
import { FaCheckCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { Send, X, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ⚠️ Adjust this import path to wherever useAdminRequest actually lives in your project
// (it's the same hook AdminConsultancy.jsx uses)
import { useAdminRequest } from '../hooks/useAdminRequest';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Maps our internal keys to human-readable labels + backend field names
const FIELD_META = {
  apply: { section: 'Apply Button', metaKey: 'apply_button' },
  enquire: { section: 'Enquire Button', metaKey: 'enquire_button' },
};

const DEFAULT_BUTTONS = { apply: true, enquire: true };

// -------------------- Pure helpers (exported for reuse / testing) --------------------

// Compares draft vs live state and returns a human-readable diff for the request table
export const buildChanges = (draft, live) => {
  const items = [];
  Object.keys(FIELD_META).forEach((key) => {
    if (draft[key] !== live[key]) {
      items.push({
        key,
        section: FIELD_META[key].section,
        action: draft[key] ? 'Enable' : 'Disable',
        change: draft[key]
          ? `Show ${FIELD_META[key].section}`
          : `Hide ${FIELD_META[key].section}`,
      });
    }
  });
  return items;
};

// Builds the exact payload shape your backend / admin-approval dashboard expects
export const buildPayload = (draft, live) => ({
  collectionName: 'landing_page_details',
  collection_type: 'side_buttons',
  action: 'update',
  title: 'update in side buttons',
  meta_data: {
    apply_button: draft.apply,
    enquire_button: draft.enquire,
  },
  original_data: {
    apply_button: live.apply,
    enquire_button: live.enquire,
  },
});

const AdminSideButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showRequestCard, setShowRequestCard] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const navigate = useNavigate();

  const { sendRequest, loading: submitting } = useAdminRequest();

  // Same admin check pattern as before
  const [isAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const session = JSON.parse(sessionStorage.getItem('userSession'));
      return !!session?.routes?.includes('/');
    } catch {
      return false;
    }
  });

  const [liveButtons, setLiveButtons] = useState(DEFAULT_BUTTONS);
  const [draftButtons, setDraftButtons] = useState(DEFAULT_BUTTONS);
  // Keeps the very first fetched value so "Discard All" can always fall back to it,
  // even after an optimistic update has changed liveButtons.
  const originalRef = useRef(DEFAULT_BUTTONS);

  // -------------------- Fetch current state from backend --------------------
  useEffect(() => {
    let isMounted = true;

    const fetchSideButtons = async () => {
      try {
        const res = await axios.post(
          `/api/main-backend/landing_page_data`,
          {
            type: "side_buttons",
          }
        );

        const doc = res.data?.data?.[0] || {};
        const meta = doc.meta_data || doc;

        const buttons = {
          apply: meta.apply_button,
          enquire: meta.enquire_button,
        };

        setLiveButtons(buttons);
        setDraftButtons(buttons);
        originalRef.current = buttons;
      } catch (error) {
        console.error("Error fetching thhe landing page Data", error);
        if (error.response && error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } })
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchSideButtons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically load the enquiry widget script only when the popup opens
  useEffect(() => {
    if (!showPopup) return undefined;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://widgets.in6.nopaperforms.com/emwgts.js';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [showPopup]);

  const changes = buildChanges(draftButtons, liveButtons);
  const hasDraftChanges = changes.length > 0;
  const visibleButtons = showAdminPanel ? draftButtons : liveButtons;

  const toggleDraftButton = (key) => {
    setDraftButtons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCancel = () => {
    setDraftButtons(liveButtons);
    setShowAdminPanel(false);
  };

  const handleUndoChange = (key) => {
    setDraftButtons((prev) => ({ ...prev, [key]: liveButtons[key] }));
    toast.info('Change reverted');
  };

  const handleDiscardAll = () => {
    setDraftButtons(liveButtons);
    setShowRequestCard(false);
    setShowAdminPanel(false);
    toast.info('Changes discarded');
  };
  // -------------------- Submit request to backend / approval dashboard --------------------
  const handleFinalRequest = async () => {
    if (!hasDraftChanges) return;

    const payload = buildPayload(draftButtons, liveButtons);

    try {
      const result = await sendRequest([payload], []);

      if (result) {
        setShowRequestCard(false);
        setShowAdminPanel(false);
      }
    } catch (err) {
      console.error('Failed to submit side button request', err);
      toast.error('Failed to submit request');
    }
  };

  if (loadingData) return null;

  return (
    <>
      {isAdmin && !showAdminPanel && !showRequestCard && (
        <button
          type="button"
          onClick={() => setShowAdminPanel(true)}
          className="admin-edit-button"
          title="Edit Side Buttons"
          aria-label="Edit Side Buttons"
        >
          <FaPencilAlt size={14} />
        </button>
      )}

      {showAdminPanel && (
        <div className="admin-panel-overlay" onClick={() => setShowAdminPanel(false)}>
          <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-panel-header">
              <h2>Side Buttons</h2>
              <button
                type="button"
                onClick={() => setShowAdminPanel(false)}
                className="admin-panel-close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {fetchError && (
              <p className="admin-fetch-warning">
                Couldn&apos;t load the saved settings — showing defaults. Changes will still
                submit normally.
              </p>
            )}

            <div className="admin-square-box">
              <div className="toggle-row">
                <div>
                  <p>Apply Button</p>
                  <span>{draftButtons.apply ? 'Visible on page' : 'Hidden from page'}</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={draftButtons.apply}
                    onChange={() => toggleDraftButton('apply')}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <p>Enquire Button</p>
                  <span>{draftButtons.enquire ? 'Visible on page' : 'Hidden from page'}</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={draftButtons.enquire}
                    onChange={() => toggleDraftButton('enquire')}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="panel-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-request"
                  disabled={!hasDraftChanges}
                  onClick={() => setShowRequestCard(true)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {visibleButtons.apply && (
        <a
          href="https://admission.velammal.edu.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="appluBtn appluBtn_right vertcalview no-underline"
        >
          APPLY NOW
        </a>
      )}

      {visibleButtons.enquire && (
        <button
          id="enquireNowBtn"
          type="button"
          className="enquire-now-btns vertcalview"
          onClick={() => setShowPopup(true)}
        >
          Enquire Now !
        </button>
      )}

      {showRequestCard && (
        <div className="request-overlay" onClick={() => setShowRequestCard(false)}>
          <div className="request-card" onClick={(e) => e.stopPropagation()}>
            <h2>Request</h2>
            <p className="request-note">
              Your changes will stay pending until approved by the superior admin.
              <br />
              Once approved, they&apos;ll go live.
            </p>

            <div className="request-table-wrap">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Section</th>
                    <th>Change</th>
                    <th>Undo</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((item) => (
                    <tr key={item.key}>
                      <td>
                        <span className={item.action === 'Disable' ? 'danger-text' : 'success-text'}>
                          {item.action === 'Disable' ? (
                            <FaTrashAlt size={13} />
                          ) : (
                            <FaCheckCircle size={14} />
                          )}
                          <span>{item.action}</span>
                        </span>
                      </td>
                      <td>{item.section}</td>
                      <td>{item.change}</td>
                      <td>
                        <button
                          type="button"
                          className="undo-btn"
                          onClick={() => handleUndoChange(item.key)}
                          aria-label={`Undo ${item.section}`}
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                  {changes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-row">
                        No changes left to submit
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="request-footer">
              <button type="button" className="btn-discard" onClick={handleDiscardAll}>
                Discard All
              </button>
              <button
                type="button"
                className="btn-final"
                onClick={handleFinalRequest}
                disabled={!hasDraftChanges || submitting}
              >
                {submitting ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                {submitting ? 'Sending…' : 'Final Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-container">
            <div className="popup-form" onClick={(event) => event.stopPropagation()}>
              <button className="close-btn" type="button" onClick={() => setShowPopup(false)}>
                &times;
              </button>
              <h3>Enquiry Form</h3>

              <div
                className="npf_wgts"
                data-height="600px"
                data-w="d02ddb01842d3a68af775b7317d66f21"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSideButton;