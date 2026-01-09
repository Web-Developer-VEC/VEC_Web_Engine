import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    role: "coe", // default
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const endpoint =
        formData.role === "coe"
          ? "/api/main-backend/coelogin"
          : "/api/main-backend/stafflogin"

      const payload =
        formData.role === "coe"
          ? { username: formData.identifier, password: formData.password }
          : { email: formData.identifier, password: formData.password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      sessionStorage.clear();

      // store token/session
      sessionStorage.setItem(
        "userSession",
        JSON.stringify({
          token: data.token,
          role: data.role,
          session: data.session
        })
      )

      setSuccess("Login successful! Redirecting...")

      let redirectPath;

      if (formData.role === "coe") {
        redirectPath = "/qp";
      } else if (data.role === "staff") {
        redirectPath = "/scheduled-exam";
      } else if (data.role === "admin") {
        redirectPath = "/staff-dashboard";
      } else {
        redirectPath = "/login"
      }

      setTimeout(() => navigate(redirectPath), 500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-slate-700 font-medium">Login As</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="h-12 border-slate-300 w-full"
        >
          <option value="coe">COE</option>
          <option value="staff">QA Admin</option>
        </select>
      </div>
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-slate-700 font-medium">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            id="email"
            name="identifier"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="pl-10 h-12 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300 w-full"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-slate-700 font-medium">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300 w-full"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#800000] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <button type="button" className="text-sm text-[#fdcc03] hover:text-[#800000] transition-colors font-medium">
          Forgot your password?
        </button>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-[#fdcc03] hover:bg-[#800000] focus:bg-[#800000] text-black hover:text-white focus:text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? "Signing in..." : "Sign In to Admin Portal"}
      </button>

      {/* Feedback messages */}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      {/* Additional Options */}
      <div className="text-center text-sm text-slate-500">
        <p>Need help accessing your account?</p>
        <button type="button" className="text-[#fdcc03] hover:text-[#800000] transition-colors font-medium">
          Contact WebOps Support
        </button>
      </div>
    </form>
  )
}