import React, { useState, useEffect } from 'react';
import './sideButton.css';
import { FaPencilAlt } from 'react-icons/fa';

const AdminSideButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showApplyBtn, setShowApplyBtn] = useState(true);
  const [showEnquireBtn, setShowEnquireBtn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem("userSession"));
    if (session && session.routes && session.routes.includes("/")) {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (showPopup) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = "https://widgets.in6.nopaperforms.com/emwgts.js";
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showPopup]);

  return (
    <>
      {/* Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={() => setShowAdminPanel(true)}
          className="fixed top-[160px] right-0 z-[100] px-3 py-2 bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt p-3 rounded-full shadow-lg transition-all"
          title="Edit Side Buttons"
        >
          <FaPencilAlt size={20} />
        </button>
      )}

      {/* Admin Configuration Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
          <div className="bg-prim dark:bg-drkp rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text dark:text-drkt">Side Buttons</h2>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-2xl hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Apply Button Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <label className="text-lg font-semibold text-text dark:text-drkt">
                  Apply Button
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showApplyBtn}
                    onChange={(e) => setShowApplyBtn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secd dark:peer-checked:bg-drks hover:peer-checked:bg-[#800000]"></div>
                </label>
              </div>

              {/* Enquire Button Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <label className="text-lg font-semibold text-text dark:text-drkt">
                  Enquire Button
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEnquireBtn}
                    onChange={(e) => setShowEnquireBtn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-secd dark:peer-checked:bg-drks hover:peer-checked:bg-[#800000]"></div>
                </label>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Button */}
      {showApplyBtn && (
        <a href="https://admission.velammal.edu.in/" target="_blank" rel="noopener noreferrer" className="appluBtn appluBtn_right vertcalview-1 no-underline">
          APPLY NOW
        </a>
      )}

      {/* Enquire Button */}
      {showEnquireBtn && (
        <button id="enquireNowBtn" className="enquire-now-btns vertcalview" onClick={() => setShowPopup(true)}>
          Enquire Now !
        </button>
      )}

      {/* Enquiry Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-container mr-[20px] md:mr-[40px]">
            <div className="popup-form bg-prim dark:bg-drkp overflow-y-hidden" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn bg-prim dark:bg-drkb dark:text-drks" onClick={() => setShowPopup(false)}>×</button>
              <h3>Enquiry Form</h3>
              
              <div
                className="npf_wgts"
                data-height="600px"
                data-w="d02ddb01842d3a68af775b7317d66f21"
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSideButton;