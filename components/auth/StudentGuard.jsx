"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, ShieldAlert, GraduationCap } from "lucide-react";

export default function StudentGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in -> Redirect to Login
        router.push("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists() && (userDoc.data().role === "student"||userDoc.data().role=="club-admin")) {
          // User IS Student -> Allow Access
          setAuthorized(true);
        } else {
          // User exists but NOT a student -> Trigger Popup
          setShowError(true);
        }
      } catch (error) {
        console.error("Student check failed:", error);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Verifying Student Access...</p>
      </div>
    );
  }

  // 2. Access Denied Popup
  if (showError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-300">
          
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Area Only</h2>
          <p className="text-gray-500 text-sm mb-6">
            You do not have the required permissions to view this dashboard. This area is restricted to registered students.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push("/")}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Go Back Home
            </button>
            
            <button 
              onClick={() => router.push("/auth/login")}
              className="w-full py-3 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              Switch Account
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3. Authorized Content
  if (authorized) {
    return <>{children}</>;
  }

  return null;
}