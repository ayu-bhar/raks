"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase"; 
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create User (Email & Password)
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Redirect immediately to the profile completion page
      router.push("/finish-signup"); 
      
    } catch (err) {
      console.error(err);
      let msg = "Registration failed.";
      if (err.code === "auth/email-already-in-use") msg = "Email already registered.";
      if (err.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        <div className="p-8 pb-0 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Set up your credentials</p>
        </div>

        <div className="p-8 pt-6">
          {error && <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm">⚠️ {error}</div>}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
              </div>
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
              </div>
              <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 z-10">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-70 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next Step <ArrowRight className="ml-2 w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account? <Link href="/login" className="ml-2 font-semibold text-blue-600 hover:text-blue-500">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}