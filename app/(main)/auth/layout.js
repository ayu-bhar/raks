"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. User is signed in, fetch their role
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || "public";

            // 2. Redirect based on role
            if (role === "admin" ) {
              router.replace("/admin");
            } else if (role === "student" || role === "club-admin") {
              router.replace("/report/dashboard/student");
            } else {
              router.replace("/"); // Public/Guest goes to Home
            }
          } else {
            // Edge case: User in Auth but not in Firestore
            router.replace("/");
          }
        } catch (error) {
          console.error("Role check failed:", error);
          // Safety fallback
          setLoading(false);
        }
      } else {
        // 3. User is NOT signed in -> Show the Auth Pages (Login/Signup)
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Checking session...</p>
      </div>
    );
  }

  // Render Login/Signup forms only if not logged in
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}