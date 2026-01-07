"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { checkLocation, checkNetwork } from "@/lib/hardware-check";
import { Loader2, ShieldAlert, WifiOff, MapPinOff } from "lucide-react";

export default function CampusGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, authorized, denied
  const [denialReason, setDenialReason] = useState("");
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // 1. Check Auth & Role
        const currentUser = auth.currentUser;
        if (!currentUser) {
          // Wait a bit for Firebase to restore session
          const user = await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (u) => {
              unsubscribe();
              resolve(u);
            });
          });

          if (!user) {
            router.push("/auth/login");
            return;
          }
          
          // Check Role in Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists() || !(userDoc.data().role === "student"||userDoc.data().role ==="club-admin")) {
            setDenialReason("Access Restricted: Students Only.");
            setIcon(<ShieldAlert className="w-12 h-12 text-red-500" />);
            setStatus("denied");
            return;
          }
        }

        // 2. Check Network (Wi-Fi)
        try {
          await checkNetwork();
        } catch (e) {
          setDenialReason("You must be connected to Campus Wi-Fi.");
          setIcon(<WifiOff className="w-12 h-12 text-orange-500" />);
          setStatus("denied");
          return;
        }

        // 3. Check Location (GPS)
        try {
          await checkLocation();
        } catch (e) {
          setDenialReason(e.toString()); // e.g., "You are 500m away..."
          setIcon(<MapPinOff className="w-12 h-12 text-red-500" />);
          setStatus("denied");
          return;
        }

        // All checks passed
        setStatus("authorized");

      } catch (err) {
        setDenialReason("Verification Error: " + err.message);
        setStatus("denied");
      }
    };

    verifyUser();
  }, [router]);

  // --- RENDER STATES ---

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Verifying Campus Credentials...</p>
        <p className="text-xs text-gray-400 mt-2">Checking GPS & Wi-Fi</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full flex flex-col items-center">
          <div className="mb-4 bg-red-50 p-4 rounded-full">
            {icon || <ShieldAlert className="w-12 h-12 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{denialReason}</p>
          <button 
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // If authorized, render the actual page content
  return <>{children}</>;
}