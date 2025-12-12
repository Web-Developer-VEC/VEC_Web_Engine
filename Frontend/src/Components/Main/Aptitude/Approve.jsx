import { useState } from "react";
import "./Approve.css";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstructionPage() {
  const [accepted, setAccepted] = useState(false);
  const primary = "#821d34";
  const secondary = "#a83552";
  const navigate = useNavigate();

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
          className={`next-btn ${accepted ? "active" : "disabled"}`}
          disabled={!accepted}
          onClick={() => navigate("/QA/questions")}
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