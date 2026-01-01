"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { Loader2, User, Phone, Hash, ArrowRight, MailCheck } from "lucide-react";

export default function FinishSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Controls the Popup
  const [error, setError] = useState("");

  // Form Data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [isStudent, setIsStudent] = useState(false);

  // 1. Check Auth Status on Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Only redirect if we are NOT currently showing the success popup
      // This prevents the redirect loop when we eventually sign out
      if (!currentUser && !showSuccessPopup) {
        router.push("/signup");
      } else if (currentUser) {
        setUser(currentUser);
        // Check Role
        if (currentUser.email && currentUser.email.toLowerCase().endsWith("@nitp.ac.in")) {
          setIsStudent(true);
        }
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, [router, showSuccessPopup]);

  const handleFinishProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 2. Save Profile
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        phone: phone,
        rollNumber: isStudent ? rollNumber : null,
        role: isStudent ? "student" : "public",
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      // 3. Send Verification Email
      await sendEmailVerification(user);

      // 4. Show Popup (User is still logged in here, preventing the redirect)
      setShowSuccessPopup(true);

    } catch (err) {
      console.error(err);
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle the "OK" Click
  const handlePopupOk = async () => {
    try {
      // Now we sign them out
      await signOut(auth);
      // And redirect to login
      router.push("/login");
    } catch (err) {
      console.error("Sign out error", err);
      // Even if sign out fails, force redirect
      router.push("/login");
    }
  };

  // --- LOADING STATE ---
  if (initializing) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      
      {/* === THE POPUP MODAL === */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your Inbox!</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{user?.email}</strong>.
              <br /><br />
              Please verify your email before logging in.
            </p>
            <button 
              onClick={handlePopupOk}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all active:scale-95"
            >
              OK, Go to Login
            </button>
          </div>
        </div>
      )}

      {/* === MAIN FORM === */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Complete Profile</h1>
        <p className="text-gray-500 mb-6">
          Role detected: <strong>{isStudent ? 'Student' : 'Guest'}</strong>
        </p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">⚠️ {error}</div>}
        
        <form onSubmit={handleFinishProfile} className="space-y-4">
           {/* Name */}
           <div className="relative group">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
           
           {/* Roll Number (Conditional) */}
           {isStudent && (
             <div className="relative group animate-in fade-in slide-in-from-top-2">
                <Hash className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                <input 
                  type="text" 
                  placeholder="Roll Number (e.g. CSE-21-05)" 
                  required 
                  value={rollNumber} 
                  onChange={e => setRollNumber(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-900" 
                />
             </div>
           )}
           
           {/* Phone */}
           <div className="relative group">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
           </div>

           <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center mt-4 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish & Verify <ArrowRight className="ml-2 w-5 h-5" /></>}
           </button>
        </form>
      </div>
    </div>
  );
}