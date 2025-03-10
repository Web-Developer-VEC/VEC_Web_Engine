import React, { useState, useEffect, useRef } from "react";
import Scanner from "react-qr-barcode-scanner";
import { X, Printer, MapPin, Phone } from 'lucide-react';
import "./SecurityCheckout.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function SecurityCheckout() {
  const [showScanner, setShowScanner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [scannedUrl, setScannedUrl] = useState("");
  const streamRef = useRef(null);
  const [passDetails, setPassDetails] = useState(null);
  const [passId, setPassId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const navigate = useNavigate();

  const handleLogout = async ()=>{

    try {
      const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include", 
      });

      const data = await response.json();

      if (response.ok) {

        Swal.fire({
          title: "Log out",
          text: data.message,
          icon: "success",
          timer: 2000, 
          showConfirmButton: false,
          willClose: () => {
            Swal.close();
            navigate(data.redirect);
          },
        });
      } else {
          console.error("Error During Logout");
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }

  const yearToAlphabet = {
    '1': 'First Year', 
    '2': 'Second Year',
    '3': 'Third Year',
    '4': 'Fourth Year' 
  };

  const passTypeParse = {
    'od': 'ON Duty',
    'staypass': 'Stay Pass',
    "outpass": 'Out Pass',
    'leave': 'Leave'
  }

  // Request Camera Permission (Handles HTTP Restriction)
  const requestCameraPermission = async () => {
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.protocol !== "http:"
    ) {
      alert("Camera access is blocked on HTTP. Please use HTTPS or localhost.");
      return false;
    }

    try {
      console.log("I am in");
      
      const permissionStatus = await navigator.permissions.query({ name: "camera" });

      if (permissionStatus.state === "denied") {
        alert("Camera access is blocked in site settings. Please allow it manually.");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Rear camera on mobile
      });
      streamRef.current = stream;
      console.log("Camera access granted.");
      return true;
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please allow camera access to scan QR codes.");
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera(); // Stop camera when component unmounts
  }, []);

  const startScanner = async () => {
    const permissionGranted = await requestCameraPermission();
    if (permissionGranted) {
      setShowScanner(true);
    }
  };
  const fetchPassDetails = async (passId) => {
    try {
      const response = await fetch("/api/fetch_pass_details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pass_unique_id: passId }),
        credentials: "include", // Important for session cookies
      });

      const data = await response.json();
      if (response.ok) {
        setPassDetails(data);
      } else {
        alert(data.message || "Error fetching pass details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch pass details");
    }
  };

  const handleScan = async (data) => {
    if (data) {
      const scannedText = data.text;
      setScannedUrl(scannedText);

      // Fetch pass details from backend
      await fetchPassDetails(scannedText);
      setPassId(scannedText);
      setShowScanner(false);
      setShowPopup(true);
      stopCamera();
    }
  };

  const handleError = (err) => {
    console.error("QR Code Scan Error:", err);
  };

  const handlePassAction = async (action) => {
    if (!passDetails) return;
    const endpoint = action === "accept" ? "/api/security_accept" : "/api/security_decline";

    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pass_id: passDetails.pass_id }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setShowPopup(false);
        setPassDetails(null);
      } else {
        alert(data.error || "Error processing request");
      }
    } catch (error) {
      console.error("Action error:", error);
      alert("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  // Handle print action
  const handlePrint = () => {
    if (!modalRef.current) return;
  
    // Clone the modal content
    const printContents = modalRef.current.cloneNode(true);
  
    // Remove action buttons
    const actionButtons = printContents.querySelector('.action-buttons');
    if (actionButtons) {
      actionButtons.remove();
    }
  
    // Remove remarks textarea if it has no content
    const remarksTextarea = printContents.querySelector('.remarks-section textarea');
    if (remarksTextarea && !remarksTextarea.value.trim()) {
      const remarksSection = printContents.querySelector('.remarks-section');
      if (remarksSection) {
        remarksSection.remove();
      }
    }
  
    // Create a hidden iframe
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    document.body.appendChild(printIframe);
  
    // Inject the cloned content into the iframe
    printIframe.contentDocument.body.appendChild(printContents);
  
    // Add print-specific styles to the iframe
    const printStyles = `
      @media print {
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #000;
          background: #fff;
        }
        .close-button,
        .action-buttons,
        .security-login-overlay {
          display: none !important;
        }
        .modal-card {
          width: 100%;
          height: auto;
          box-shadow: none;
          border: none;
          padding: 20px;
          margin: 0;
        }
        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .profile-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-right: 15px;
        }
        .profile-info h2 {
          font-size: 18px;
          margin: 0;
          color: #000;
        }
        .profile-info p {
          font-size: 14px;
          margin: 5px 0 0;
          color: #555;
        }
        .quick-info {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #000;
        }
        .info-item svg {
          display: none;
        }
        .pass-details {
          margin-bottom: 20px;
        }
        .time-details {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
        }
        .time-details .label {
          font-size: 12px;
          color: #777;
          margin-bottom: 5px;
        }
        .time-details .value {
          font-size: 14px;
          color: #000;
        }
        .reason-details {
          margin-bottom: 20px;
        }
        .reason-details .label {
          font-size: 12px;
          color: #777;
          margin-bottom: 5px;
        }
        .reason-details .value {
          font-size: 14px;
          color: #000;
        }
        .status-badges {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .status-badge {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          text-align: center;
          flex: 1;
        }
        .status-badge.approved {
          background-color: #e8f5e9;
        }
        .status-badge.pending {
          background-color: #fff3e0;
        }
        .badge-label {
          font-size: 12px;
          color: #777;
          margin-bottom: 5px;
        }
        .badge-value {
          font-size: 14px;
          color: #000;
        }
        .remarks-section {
          margin-bottom: 20px;
        }
        .remarks-section label {
          font-size: 12px;
          color: #777;
          margin-bottom: 5px;
        }
        .remarks-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          color: #000;
          background: #fff;
        }
        a {
          color: #000;
          text-decoration: none;
        }
      }
    `;
  
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    printIframe.contentDocument.head.appendChild(styleElement);
  
    // Trigger the print dialog
    printIframe.contentWindow.print();
  
    // Clean up the iframe after printing
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
  
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: "N/A", time: "N/A" }; // Handle missing values
  
    const dateObj = new Date(dateTime);
    
    return {
      date: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), // Example: "21 February 2025"
      time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) // Example: "09:00 AM"
    };
  };
  

  return (
    <>
      <div className="security-logout">
        <button className="security-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="security-login-container">
        <h1 className="security-login-heading">Security Login</h1>

        {/* QR Code Scan Button */}
        <button className="security-login-scan-button" onClick={startScanner}>
          Scan QR Code
        </button>

        {/* QR Code Scanner */}
        {showScanner && (
          <>
            <div className="security-login-scanner-container">
              <Scanner
                onUpdate={(err, result) => {
                  if (result) handleScan(result);
                  else handleError(err);
                }}
                constraints={{
                  video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                  },
                }}
                videoStyle={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  playsInline: true, // Ensures video works on iOS Safari
                }}
              />
            </div>

            {/* Cancel Button */}
            <button
              className="security-login-cancel-button"
              onClick={() => {
                setShowScanner(false);
                stopCamera();
              }}
            >
              Cancel
            </button>
          </>
        )}
      {showPopup && <div className="security-login-overlay"></div>}

        {/* Popup Card */}
        {/* Popup Card */}
        {showPopup && passDetails && (
      <div className="modal-overlay">
        <div className="modal-card" ref={modalRef}>
          <button
            onClick={() => setShowPopup(false)}  // Close popup when clicked
            className="close-button"
          >
            <X size={20} />
          </button>

          {/* Header with compact profile */}
          <div className="profile-header">
            <img
              src={UrlParser(passDetails.profile_image)}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-info">
              <h2>{passDetails.name}</h2>
              <p>{passDetails.dept} • {yearToAlphabet[passDetails.year]}</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="quick-info">
            <div className="info-item">
              <MapPin size={16} />
              <span>{passDetails.room_no}</span>
            </div>
            <div className="info-item">
              <Phone size={16} />
              <span><a href={`tel:${passDetails.mobile_number}`} className="no-underline">{passDetails.mobile_number}</a></span>
            </div>
          </div>

          {/* Pass Details */}
          <div className="pass-details">
            <div className="time-details">
              <div>
                <p className="label">From</p>
                <p className="value">{formatDateTime(passDetails.from).date} at {formatDateTime(passDetails.from).time}</p>
              </div>
              <div> 
                <p className="label">To</p>
                <p className="value">{formatDateTime(passDetails.to).date} at {formatDateTime(passDetails.to).time}</p>
              </div>
            </div>

            <div className="reason-details">
              <p className="label">Pass Type</p>
              <p className="value">{passTypeParse[passDetails.passtype]}</p>
            </div>

            <div className="reason-details">
              <p className="label">Place & Reason</p>
              <p className="value">{passDetails.place_to_visit} / {passDetails.reason_type}</p><br></br>
              {passDetails.reason_for_visit !== "" && (
                <>
                  <p className="label">Description</p>
                  <p>{passDetails.reason_for_visit}</p>
                </>
              )}
            </div>

            {/* Status Badges */}
            <div className="status-badges">
              <div className={`status-badge ${passDetails.parent_approval ? "approved" : "pending"}`}>
                <p className="badge-label">Parent Approval</p>
                <p className="badge-value">{passDetails.parent_approval ? "Accepted" : "Pending"}</p>
              </div>
              {passDetails.superior_wardern_approval === null ? (
                <div className={`status-badge ${passDetails.wardern_approval ? "approved" : "pending"}`}>
                  <p className="badge-label">Warden Approval</p>
                  <p className="badge-value">{passDetails.wardern_approval ? "Approved" : "Pending"}</p>
                </div>
              ) : (
                <div className={`status-badge ${passDetails.superior_wardern_approval ? "approved" : "pending"}`}>
                  <p className="badge-label">Superior Warden Approval</p>
                  <p className="badge-value">{passDetails.superior_wardern_approval ? "Approved" : "Pending"}</p>
                </div>
              )}
            </div>

            {/* Remarks */}
            {passDetails.comment !== null && (
              <div className="remarks-section">
                <label>Warden Notes</label>
                {/* <textarea rows={2} placeholder="Add your remarks here..." /> */}
                <p>{passDetails.comment}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {passDetails.exit_time !== null ? (
                <button className="accept-button" onClick={() => {
                  handlePassAction("accept");
                  setShowPopup(false);
                }}>
                  Re Entry Confirmed
                </button>
              ) : (
                <>
                <button className="reject-button" onClick={() => handlePassAction("decline")}>
                  Reject
                </button>
                <button className="accept-button" onClick={() => handlePassAction("accept")}>
                  Accept
                </button>
                <button className="print-button" onClick={handlePrint}>
                  <Printer size={16} />
                </button>           
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
      </div>
    </>   
  );
}