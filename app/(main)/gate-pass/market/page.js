"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, LogIn, MapPin, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import CampusGuard from "@/components/auth/CampusGuard";

// --- FIREBASE IMPORTS ---
import { db, auth } from "@/lib/firebase";
import { 
  collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import StudentGuard from "@/components/auth/StudentGuard";

export default function MarketLeavePage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // User Data State
  const [user, setUser] = useState(null);       // Auth Object
  const [userData, setUserData] = useState(null); // Firestore "users" document
  
  // Status State
  const [currentStatus, setCurrentStatus] = useState("in"); 
  const [activePassId, setActivePassId] = useState(null);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Run checks in parallel
        await Promise.all([
          fetchUserProfile(currentUser.uid),
          checkActiveMarketPass(currentUser.uid)
        ]);
      } 
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. FETCH USER PROFILE (Matches your DB structure) ---
  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        // Store the exact fields from your collection
        setUserData({
          name: data.name,             // "Ayush"
          rollNumber: data.rollNumber, // "200200"
          phone: data.phone,           // "1234567890"
          email: data.email,           // "ayushb..."
          role: data.role
        });
      } else {
        console.warn("User profile not found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // --- 3. CHECK STATUS ---
  const checkActiveMarketPass = async (uid) => {
    try {
      const q = query(
        collection(db, "gate_passes"),
        where("uid", "==", uid),
        where("type", "==", "market"),
        where("status", "==", "out")
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setCurrentStatus("out");
        setActivePassId(snapshot.docs[0].id);
      } else {
        setCurrentStatus("in");
        setActivePassId(null);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  // --- 4. HANDLE LEAVING (Push to DB) ---
  const handleLeaveCampus = async () => {
    if (!user) return;
    
    // 1. Get Clean Data
    const studentName = userData?.name || user.displayName || "Unknown Student";
    const rollNo = userData?.rollNumber || "N/A";
    const phoneNo = userData?.phone || "N/A"; // Matches your DB field "phone"

    // 2. Validation
    if (rollNo === "N/A" || phoneNo === "N/A") {
        if(!confirm("Your Roll No or Phone is missing in your profile. Proceed anyway?")) return;
    } else {
        if(!confirm(`Confirm exit for: ${studentName} (${rollNo})?`)) return;
    }

    setActionLoading(true);
    try {
      // 3. Create Gate Pass Document
      const docRef = await addDoc(collection(db, "gate_passes"), {
        uid: user.uid,
        name: studentName,      // "Ayush"
        rollNumber: rollNo,     // "200200"
        phone: phoneNo,         // "1234567890"
        email: user.email,
        type: "market",
        status: "out",
        leaveTime: serverTimestamp(),
        returnTime: null,
        createdAt: serverTimestamp()
      });

      setActivePassId(docRef.id);
      setCurrentStatus("out");
      alert("Exit recorded successfully.");

    } catch (error) {
      console.error("Error recording exit:", error);
      alert("Failed to record exit.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- 5. HANDLE ENTERING ---
  const handleEnterCampus = async () => {
    if (!activePassId) return;

    if(!confirm("Are you back inside the campus?")) return;

    setActionLoading(true);
    try {
      const passRef = doc(db, "gate_passes", activePassId);

      await updateDoc(passRef, {
        status: "returned",
        returnTime: serverTimestamp()
      });

      setCurrentStatus("in");
      setActivePassId(null);
      alert("Entry recorded. Welcome back!");

    } catch (error) {
      console.error("Error recording entry:", error);
      alert("Failed to update entry.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <StudentGuard>
    <CampusGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4 max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-sm border border-gray-100 backdrop-blur-sm bg-opacity-80`}>
            {loading ? (
               <Loader2 className="w-4 h-4 animate-spin text-gray-500"/>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStatus === 'in' ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 ${currentStatus === 'in' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                </span>
                <span className="text-xs md:text-sm font-medium text-gray-600 tracking-wide uppercase">
                  {currentStatus === 'in' ? "You are on Campus" : "You are Outside"}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 leading-tight">
            Market Gate Pass
          </h1>
          
          <p className="text-sm md:text-base text-gray-500 px-4">
             {userData ? `Welcome, ${userData.name}` : "Digital Entry/Exit System"}
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-lg">
          {loading ? (
             <div className="bg-white rounded-3xl p-12 shadow-xl flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Syncing Profile...</p>
             </div>
          ) : (
            <>
              {currentStatus === 'in' && (
                <button 
                  onClick={handleLeaveCampus}
                  disabled={actionLoading}
                  className="w-full group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-95 md:active:scale-100 md:hover:-translate-y-2 border border-white/50 overflow-hidden text-left flex flex-col justify-between min-h-[250px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="inline-flex p-3 md:p-4 bg-orange-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 group-hover:bg-orange-100 transition-colors">
                      <LogOut className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">Leave Campus</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">Heading to the market? Click here to generate your exit pass.</p>
                  </div>
                  <div className="relative z-10 mt-6 flex items-center text-orange-600 font-semibold group-hover:gap-2 transition-all">
                    <span>{actionLoading ? "Processing..." : "Tap to Exit"}</span>
                    {!actionLoading && <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />}
                  </div>
                </button>
              )}

              {currentStatus === 'out' && (
                <button 
                  onClick={handleEnterCampus}
                  disabled={actionLoading}
                  className="w-full group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-95 md:active:scale-100 md:hover:-translate-y-2 border border-white/50 overflow-hidden text-left flex flex-col justify-between min-h-[250px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="inline-flex p-3 md:p-4 bg-teal-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 group-hover:bg-teal-100 transition-colors">
                      <LogIn className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">Enter Campus</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">Back from the market? Click here to mark your return.</p>
                  </div>
                  <div className="relative z-10 mt-6 flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
                    <span>{actionLoading ? "Updating..." : "Tap to Enter"}</span>
                    {!actionLoading && <ShieldCheck className="ml-2 w-5 h-5 transition-transform group-hover:scale-110" />}
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </CampusGuard>
    </StudentGuard>
  );
}