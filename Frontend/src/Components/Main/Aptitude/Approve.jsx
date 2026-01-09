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
  
  const [examData, setExamData] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [startExamLoading, setStartExamLoading] = useState(false);
  const [violations, setViolations] = useState({})

  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth < 1024) {
        setStatus('invalid_device');
      } else if (localStorage.getItem('exam_status') === 'blocked') {
        setStatus('blocked');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (!student) {
      navigate('/QA/qaexam', { replace: true });
    }
  }, [student]);

  // ---------------- FULLSCREEN ENFORCEMENT WITH WARNING ----------------
  useEffect(() => {
    const enterFullscreenOnce = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
      document.removeEventListener("click", enterFullscreenOnce);
    };

    document.addEventListener("click", enterFullscreenOnce);

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
    if (!/^[A-Z0-9]{6}$/.test(secretCode)) {
      setCodeError("Code must be 6 alphanumeric characters");
      return;
    }

    try {
      setCodeLoading(true);
      const response = await axios.post("/api/main-backend/validate-exam-code", { 
        code: secretCode,
      });

      if (response.data.success) {
        setCodeVerified(true);
        setExamData(response.data.examDetails);
        localStorage.setItem("exam_data", JSON.stringify(response.data.examDetails));
        setCodeError("");
        
        Swal.fire({
          title: "Code Verified",
          text: "The code has been verified successfully.",
          icon: "success",
          confirmButtonText: "OK",
          timer: 2000, // ✅ Added auto-close
        });
      } else {
        setCodeError("Invalid secret code");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to verify code";
      
      Swal.fire({
        title: "Error Verifying Code",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
      
      if (errorMessage === "Session expired or not logged in") {
        navigate("/QA/qaexam", { replace: true });
      }
      
      console.error("Error verifying code:", error);
    } finally {
      setCodeLoading(false);
    }
  };

  const startExam = async () => {
    // ✅ Validation check before starting
    if (!accepted || !codeVerified) {
      Swal.fire({
        title: "Cannot Start Exam",
        text: "Please verify the exam code and accept the terms before proceeding.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setStartExamLoading(true);
      
      const response = await axios.post("/api/main-backend/qa/session/start-exam", {
        scheduleId: examData.scheduleId,
        examId: examData.examId
      });

      if (response.data.success) {
        setStatus('active');
        
        // ✅ Enter fullscreen before navigation
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.warn("Fullscreen request failed:", err);
          // Still allow navigation even if fullscreen fails
        }

        // ✅ Navigate to questions page
        navigate("/QA/questions", {
          state: {
            exam: examData,
            student,
            sessionId: response.data.sessionId,
            violations: response.data.violations
          },
          replace: true // ✅ Prevent going back to instruction page
        });
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to start exam";
      
      Swal.fire({
        title: "Error Starting Exam",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });

      // ✅ Handle specific error cases
      if (errorMessage.includes("Session expired") || errorMessage.includes("not logged in")) {
        navigate("/QA/qaexam", { replace: true });
      }
    } finally {
      setStartExamLoading(false);
    }
  };

  // INVALID DEVICE POPUP
  if (status === "invalid_device") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4 z-50">
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
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4 z-50">
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
              <li><span className="bullet">✗</span> Do not switch tabs or minimize the window.</li>
              <li><span className="bullet">✗</span> Do not use mobile phones or calculators.</li>
              <li><span className="bullet">✗</span> Do not take screenshots.</li>
              <li><span className="bullet">✗</span> Do not seek help from anyone.</li>
            </ul>
          </div>
        </div>

        {/* Warning note */}
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
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                if (!codeVerified) {
                  setSecretCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                  setCodeError("");
                }
              }}
              disabled={codeLoading} // ✅ Disable during loading
            />

            <button
              className={`verify-btn ${codeVerified ? "verified" : ""} ${codeLoading ? "cursor-progress opacity-70" : ""}`}
              onClick={verifyCode}
              disabled={codeVerified || codeLoading || secretCode.length !== 6} // ✅ Better validation
            >
              {codeLoading ? "Verifying..." : codeVerified ? "Verified ✓" : "Verify Code"}
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
              disabled={!codeVerified} // ✅ Only enable after code verification
            />
            <label htmlFor="agree" className="checkbox-label">
              I have read, understood, and agree to all the instructions above
            </label>
            
            <button
              className={`next-btn ${
                (accepted && codeVerified && !startExamLoading) ? "active" : "disabled"
              } ${startExamLoading ? "cursor-progress opacity-70" : ""}`}
              disabled={!accepted || !codeVerified || startExamLoading}
              onClick={startExam} // ✅ FIXED - Properly calls the function
              aria-label="Proceed to test"
            >
              {startExamLoading ? "Starting Exam..." : "Proceed to Assessment"}
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Timer info */}
        <div className="timer-info">
          <small>Note: Timer starts immediately after you proceed</small>
        </div>
      </div>
    </div>
  );
}