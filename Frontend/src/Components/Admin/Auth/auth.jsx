"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { Book, BookOpen } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#fdcc03]/5 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mt-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-[#fdcc03] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <BookOpen/>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">College Admin Portal</h1>
          <p className="text-slate-600">
            {isLogin ? "Welcome back! Please sign in to continue." : "Create your admin account to get started."}
          </p>
        </div>

        {/* Auth Form div */}
        <div className="p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-slide-in-right">
          {/* Toggle buttons */}
          <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
            <button
              variant={isLogin ? "default" : "ghost"}
              className={`flex-1 transition-all duration-300 ${
                isLogin
                  ? "bg-[#fdcc03] text-black shadow-md hover:bg-[#800000] focus:bg-[#800000]"
                  : "text-slate-600 hover:text-slate-800 hover:bg-[#800000] hover:text-white focus:bg-[#800000] focus:text-white"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              variant={!isLogin ? "default" : "ghost"}
              className={`flex-1 transition-all duration-300 ${
                !isLogin
                  ? "bg-[#fdcc03] text-black shadow-md hover:bg-[#800000] focus:bg-[#800000]"
                  : "text-slate-600 hover:text-slate-800 hover:bg-[#800000] hover:text-white focus:bg-[#800000] focus:text-white"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          <div className="transition-all duration-500 ease-in-out">{isLogin ? <LoginForm /> : <SignupForm />}</div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500 animate-fade-in-up">
          <p>© 2024 College Admin Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
