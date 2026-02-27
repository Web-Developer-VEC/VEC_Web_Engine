"use client"

import { useState } from "react"
import { LoginForm } from "./QPLogin"
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">VEC College Question Paper Generater Portal</h1>
          <p className="text-slate-600">
            {isLogin ? "Welcome back! Please sign in to continue." : "Create your admin account to get started."}
          </p>
        </div>

        {/* Auth Form div */}
        <div className="p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-slide-in-right">

          {/* Forms */}
          <div className="transition-all duration-500 ease-in-out">{<LoginForm />}</div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500 animate-fade-in-up">
          <p>© 2025 VEC College Admin Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
