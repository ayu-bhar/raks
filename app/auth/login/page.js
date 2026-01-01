"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCred.user.uid;

      //Check role from Firestore
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User record not found");
      }

      const { role } = userSnap.data();

      //Redirect based on role
      if (role === "admin") {
        router.push("/report/dashboard/admin");
      } else if(role==="student"){
        router.push("/report/dashboard/student");
      }else{
        router.push(`/report/dashboard/guest`)
      }

    } catch (err) {
      console.error(err);

      let msg = "Failed to sign in";
      if (err.code === "auth/invalid-email") msg = "Invalid email";
      if (err.code === "auth/user-not-found") msg = "User not found";
      if (err.code === "auth/wrong-password") msg = "Wrong password";
      if (err.code === "auth/too-many-requests") msg = "Too many attempts";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            className="pl-10 w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="pl-10 pr-10 w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg flex justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Login"}
        </button>

        <p className="text-center text-sm">
          No account?
          <Link href="/auth/signup" className="ml-1 text-indigo-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
