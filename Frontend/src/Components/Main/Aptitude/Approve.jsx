import { useEffect, useState } from "react";
import "./Approve.css";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

export default function InstructionPage() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [secretCode, setSecretCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState("");
  const location = useLocation();
  const student = location.state?.student;
  const token = location.state?.token;
  const [examData, setExamData] = useState(null);

  useEffect(() => {
    const checkDevice = () => {
      // Logic: If screen width is less than 1024px, it's likely a mobile or tablet
      if (window.innerWidth < 1024) {
        setStatus('invalid_device');
      } else if (localStorage.getItem('exam_status') === 'blocked') {
        setStatus('blocked');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice); // Re-check if window is resized
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (!student || !token) {
      navigate('/QA/qaexam', { replace: true });
    }
  }, [student, token]);

  // ---------------- FULLSCREEN ENFORCEMENT WITH WARNING ----------------
  useEffect(() => {
    // Enter fullscreen on first user interaction
    const enterFullscreenOnce = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
      document.removeEventListener("click", enterFullscreenOnce);
    };

    document.addEventListener("click", enterFullscreenOnce);

    // Warn & re-enter fullscreen if exited
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        Swal.fire({
          title: "Fullscreen Required",
          text: "Please stay in fullscreen mode to continue the examination process.",
          icon: "warning",
          confirmButtonText: "Return to Fullscreen",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          document.documentElement.requestFullscreen().catch(() => { });
        });
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("click", enterFullscreenOnce);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const verifyCode = async () => {
    if (!/^[a-zA-Z0-9]{6}$/.test(secretCode)) {
      setCodeError("Code must be 6 alphanumeric characters");
      return;
    }

    try {
      const responce = await axios.post("/api/main-backend/validate-exam-code", { 
        code: secretCode, 
        registerNo: student.registerno,
        token 
      });

      if (responce.data.success) {
        setCodeVerified(true);
        setExamData(responce.data.examDetails);
        localStorage.setItem("exam_data", JSON.stringify(responce.data.examDetails));
        setCodeError("");
        Swal.fire({
          title: "Code Verified",
          text: "The code has been verified successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        setCodeError("Invalid secret code");
      }
    } catch (error) {
      Swal.fire({
        title: "Error Verifying Code",
        text: error.response.data.message,
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error verifying code:", error);
    }
  };

  const startExam = () => {
    setStatus('active');
    document.documentElement.requestFullscreen().catch(() => {
      alert("Fullscreen is required. Please use a Chrome browser on Desktop.");
    });
  };

  // INVALID DEVICE POPUP
  if (status === "invalid_device") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white shadow-xl rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-3">⚠ DESKTOP REQUIRED</h2>
          <p>This exam cannot be taken on a Mobile or Tablet device.</p>
          <p className="mb-6">
            Please use a <b>Laptop or Desktop</b> with minimum width 1024px.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // BLOCKED POPUP
  if (status === "blocked") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white shadow-xl rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-3">⛔ ACCESS BLOCKED</h2>
          <p>Your access to this exam has been blocked.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inst-page">
      <div className="inst-box">
        <div className="header-section">
          <h1 className="inst-title">Assessment Instructions</h1>
          <p className="inst-subtitle">Please read all instructions carefully before starting your test</p>

          {/* Progress indicator */}
          <div className="progress-indicator">
            <div className="progress-step active">Instructions</div>

          </div>
        </div>

        {/* DO & DON'T Section */}
        <div className="split-container">
          {/* DO Section */}
          <div className="do-box card-hover">
            <div className="section-header">
              <CheckCircle className="icon" color="#28a745" size={24} />
              <h2 className="section-title">Things to Do</h2>
            </div>
            <ul className="list">
              <li><span className="bullet">✓</span> Stay connected to stable internet</li>
              <li><span className="bullet">✓</span> Read each question carefully</li>
              <li><span className="bullet">✓</span> Submit answers before timer ends</li>
              <li><span className="bullet">✓</span> Attempt all questions (compulsory)</li>
            </ul>
          </div>

          {/* DON'T Section */}
          <div className="dont-box card-hover">
            <div className="section-header">
              <XCircle className="icon" color="#dc3545" size={24} />
              <h2 className="section-title">Things to Avoid</h2>
            </div>
            <ul className="list">
              <li><span className="bullet">✗</span>Do not switch tabs or minimize the window.</li>
              <li><span className="bullet">✗</span>Do not use mobile phones or calculators.</li>
              <li><span className="bullet">✗</span>Do not take screenshots.</li>
              <li><span className="bullet">✗</span>Do not seek help from anyone.</li>
            </ul>
          </div>
        </div>

        {/* Warning note with icon */}
        <div className="note-box">
          <AlertCircle size={20} />
          <p>
            <strong>Important:</strong> This is a monitored test. Any violation will lead to immediate
            termination of the exam attempt.
          </p>
        </div>

        {/* Secret Code Verification */}
        <div className="code-box">
          <h3 className="code-title">Enter Examination Secret Code</h3>

          <div className="code-input-wrapper">
            <input
              type="text"
              maxLength="6"
              value={secretCode}
              readOnly={codeVerified}
              placeholder="XXXXXX"
              className={`code-input ${codeVerified ? "locked" : ""}`}
              onChange={(e) => {
                if (!codeVerified) {
                  setSecretCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""));
                  setCodeError("");
                }
              }}
            />

            <button
              className={`verify-btn ${codeVerified ? "verified" : ""}`}
              onClick={verifyCode}
              disabled={codeVerified}
            >
              {codeVerified ? "Verified ✓" : "Verify Code"}
            </button>
          </div>

          {codeError && <p className="code-error">{codeError}</p>}
        </div>

        {/* Checkbox Confirmation */}
        <div className="checkbox-area">
          <div className="checkbox-wrapper">
            <input
              id="agree"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="styled-checkbox"
            />
            <label htmlFor="agree" className="checkbox-label">
              I have read, understood, and agree to all the instructions above
            </label>
            <button
              className={`next-btn ${accepted && codeVerified ? "active" : "disabled"}`}
              disabled={!accepted && !codeVerified}
              onClick={() => {
                startExam();
                navigate("/QA/questions", {
                  state: {
                    exam: examData,
                    student,
                    token
                  },
                });
              }}
              aria-label="Proceed to test"
            >
              Proceed to Assessment
              <span className="btn-arrow">→</span>
            </button>

          </div>
        </div>


        {/* Button with loading state consideration */}

        {/* Optional timer info */}
        <div className="timer-info">
          <small>Note: Timer starts immediately after you proceed</small>
        </div>
      </div>
    </div>
  );
}