import { useState, useEffect } from "react"
import { Mail, Lock, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Username, 2: OTP, 3: New Password
  const [username, setUsername] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const navigate = useNavigate()

  // Timer countdown effect
  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await axios.post("/api/admin-backend/forget-pass", {
        email: username,
      })

      // Start countdown timer immediately
      setCanResend(false)
      setResendTimer(30)

      setSuccess(res.data.message || "OTP sent to your email!")
      setTimeout(() => {
        setStep(2)
        setSuccess("")
      }, 500)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(0, 1)
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }

    // Auto-submit when all 4 digits are entered
    if (newOtp.every((digit) => digit !== "") && index === 3) {
      handleVerifyOTP(newOtp.join(""))
    }
  }

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData?.getData("text") || ""
    const digits = pasted.replace(/\D/g, "").slice(0, 4)

    if (!digits) return

    e.preventDefault()

    const newOtp = ["", "", "", ""]
    digits.split("").forEach((digit, index) => {
      newOtp[index] = digit
    })
    setOtp(newOtp)

    const lastIndex = Math.min(digits.length, 4) - 1
    if (lastIndex >= 0) {
      document.getElementById(`otp-${lastIndex}`)?.focus()
    }

    if (digits.length === 4) {
      setTimeout(() => {
        handleVerifyOTP(digits)
      }, 1000)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (otpCode) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await axios.post("/api/admin-backend/otp-validation", {
        email: username,
        otp: otpCode || otp.join(""),
      })
      setSuccess(res.data.message || "OTP verified successfully!")
      setTimeout(() => {
        setStep(3)
        setSuccess("")
      }, 500)
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
      setOtp(["", "", "", ""])
      document.getElementById("otp-0")?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!")
      setLoading(false)
      return
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      setError("Password must be between 8 and 12 characters long!")
      setLoading(false)
      return
    }

    try {
      const res = await axios.post("/api/admin-backend/reset-pass", {
        email: username,
        newPassword,
        confirmPassword,
      })
      setSuccess(res.data.message || "Password reset successful! Redirecting...")
      setTimeout(() => {
        navigate("/")
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-600 hover:text-[#800000] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </button>

      {/* Step 1: Request OTP */}
      {step === 1 && (
        <form onSubmit={handleRequestOTP} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
            <p className="text-slate-600 text-sm">
              Please enter your registered email address to receive a one-time password (OTP) to reset your password.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                placeholder="admin@velammal.edu.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12 w-full border border-slate-300 rounded-lg focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#fdcc03] hover:bg-[#800000] text-black hover:text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#fdcc03] rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter OTP</h2>
            <p className="text-slate-600 text-sm">
              We've sent a 4-digit code to <strong>{username}</strong>
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onPaste={handleOtpPaste}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={loading}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#800000]" />
              Verifying OTP...
            </div>
          )}

          <button
            type="button"
            onClick={() => handleRequestOTP({ preventDefault: () => { } })}
            disabled={!canResend || loading}
            className="text-[#800000] hover:underline text-sm mx-auto block disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {!canResend
              ? `Resend OTP in ${resendTimer}s`
              : "Didn't receive OTP? Resend"}
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
        </div>
      )}

      {/* Step 3: Reset Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
            <p className="text-slate-600 text-sm">Enter your new password below.</p>
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 font-medium">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="pl-10 pr-10 h-12 w-full border border-slate-300 rounded-lg focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (newPassword && e.target.value) {
                    setPasswordMatch(newPassword === e.target.value)
                  } else {
                    setPasswordMatch(true)
                  }
                }}
                autoComplete="new-password"
                className={`pl-10 pr-10 h-12 w-full border rounded-lg focus:ring-2 focus:ring-[#fdcc03]/20 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${confirmPassword && !passwordMatch
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-[#fdcc03]"
                  }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && !passwordMatch && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> Passwords do not match
              </p>
            )}
            {confirmPassword && passwordMatch && confirmPassword.length >= 6 && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <span>✓</span> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordMatch}
            className="w-full h-12 bg-[#fdcc03] hover:bg-[#800000] text-black hover:text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
        </form>
      )}
    </div>
  )
}
