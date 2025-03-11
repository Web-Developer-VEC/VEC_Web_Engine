import React, { useState } from "react";
import "./forget-password.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Set New Password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  console.log(otp);
  

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session handling
        body: JSON.stringify( { warden_id: email } )
      });

      if (!response.ok) {
        console.log("error",response.error);
        throw new Error("Failed to send OTP. Please try again.");
        
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      console.log(data.message);
      
      setStep(2); // Move to OTP validation step
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/otp_validation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session handling
        body: JSON.stringify({ otp: otp }),
      });

      if (!response.ok) {
        throw new Error("Invalid OTP or OTP expired.");
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setStep(3); // Move to set new password step
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/set_new_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session handling
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password. Please try again.");
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setStep(4); // Move to success step
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {step === 1 && (
          <>
            <div className="forgot-password-header">
              <h1>Forgot Password</h1>
              <p>Enter your User ID, and we will send you an OTP to reset your password.</p>
            </div>

            <form className="forgot-password-form" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="email" className="f-label">User ID</label>
                <input
                  id="email"
                  type="text-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your user ID"
                  required
                  className="u-input"
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <div id="email-error" className="error-message" aria-live="polite">
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="forgot-password-header">
              <h1>Verify OTP</h1>
              <p>Enter the OTP sent to your registered phone number.</p>
            </div>

            <form className="forgot-password-form" onSubmit={handleValidateOtp}>
              <div className="form-group">
                <label htmlFor="otp" className="f-label">OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                  className="o-input"
                  aria-invalid={!!error}
                  aria-describedby={error ? "otp-error" : undefined}
                />
                {error && (
                  <div id="otp-error" className="error-message" aria-live="polite">
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Validating OTP..." : "Validate OTP"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="forgot-password-header">
              <h1>Set New Password</h1>
              <p>Enter a new password for your account.</p>
            </div>

            <form className="forgot-password-form" onSubmit={handleSetNewPassword}>
              <div className="form-group">
                <label htmlFor="newPassword" className="f-label">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="pass-input"
                  aria-invalid={!!error}
                  aria-describedby={error ? "password-error" : undefined}
                />
                {error && (
                  <div id="password-error" className="error-message" aria-live="polite">
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Password..." : "Set New Password"}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="success-message" aria-live="polite">
            <div className="success-icon">✓</div>
            <h2>Password Updated Successfully</h2>
            <p>Your password has been updated. You can now log in with your new password.</p>
            <p className="small-text">
              <a href="/login">Back to login</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}