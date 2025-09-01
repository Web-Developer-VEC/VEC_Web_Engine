import { useState } from "react"
import { Eye, EyeOff, User, Mail, Lock, Phone, UserCheck } from "lucide-react"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
    phone_no: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Signup attempt:", formData)
    // Handle signup logic here
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-slate-700 font-medium">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className="pl-10 h-11 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300"
            required
          />
        </div>
      </div>

      {/* Role Field */}
      <div className="space-y-2">
        <label htmlFor="role" className="text-slate-700 font-medium">
          Role
        </label>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
          <select
            onChange={(e) => handleRoleChange(e.target.value)}
            required
            className="pl-10 h-11 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300"
          >
            <option value="" disabled selected>
              Select your role
            </option>
            <option value="admin">System Administrator</option>
            <option value="registrar">Registrar</option>
            <option value="dean">Dean</option>
            <option value="hod">Head of Department</option>
            <option value="faculty">Faculty Member</option>
            <option value="staff">Administrative Staff</option>
          </select>
        </div>
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
            name="email"
            type="email"
            placeholder="admin@college.edu"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 h-11 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300"
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
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10 h-11 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300"
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

      {/* Phone Number Field */}
      <div className="space-y-2">
        <label htmlFor="phone_no" className="text-slate-700 font-medium">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            id="phone_no"
            name="phone_no"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone_no}
            onChange={handleChange}
            className="pl-10 h-11 border-slate-300 focus:border-[#fdcc03] focus:ring-2 focus:ring-[#fdcc03]/20 transition-all duration-300"
            required
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full h-12 bg-[#fdcc03] hover:bg-[#800000] focus:bg-[#800000] text-black hover:text-white focus:text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6"
      >
        Create Admin Account
      </button>

      {/* Terms and Conditions */}
      <div className="text-center text-xs text-slate-500">
        <p>By creating an account, you agree to our</p>
        <button type="button" className="text-[#fdcc03] hover:text-[#800000] transition-colors font-medium">
          Terms of Service
        </button>
        {" and "}
        <button type="button" className="text-[#fdcc03] hover:text-[#800000] transition-colors font-medium">
          Privacy Policy
        </button>
      </div>
    </form>
  )
}
