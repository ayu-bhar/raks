"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Loader2,
  User,
  Phone,
  Hash,
  ArrowRight,
  MailCheck,
} from "lucide-react";


// import user from "@/models/user";
// import user from "@/models/user";

export default function FinishSignupPage() {
  const router = useRouter();

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [isStudent, setIsStudent] = useState(false);

  // 🔹 Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser && !showSuccessPopup) {
        router.push("/auth/signup");
      } else if (currentUser) {
        setUser(currentUser);

        if (
          currentUser.email &&
          currentUser.email.toLowerCase().endsWith("@nitp.ac.in")
        ) {
          setIsStudent(true);
        }
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [router, showSuccessPopup]);

  // 🔹 Finish profile
  const handleFinishProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email: user.email,
        phone,
        rollNumber: isStudent ? rollNumber : null,
        role: isStudent ? "student" : "public",
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);

      setShowSuccessPopup(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Popup OK → logout → login
  const handlePopupOk = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      router.replace("/auth/login");
    }
  };

  // 🔹 Loader
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your Inbox!</h2>
            <p className="text-gray-600 mb-6">
              Verification email sent to <br />
              <strong>{user?.email}</strong>
            </p>
            <button
              onClick={handlePopupOk}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
            >
              OK, Go to Login
            </button>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Complete Profile</h1>
        <p className="text-gray-500 mb-6">
          Role detected: <strong>{isStudent ? "Student" : "Guest"}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleFinishProfile} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Roll Number */}
          {isStudent && (
            <div className="relative">
              <Hash className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
              <input
                type="text"
                placeholder="Roll Number"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Finish & Verify <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
