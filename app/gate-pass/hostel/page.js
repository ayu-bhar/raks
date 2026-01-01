"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogIn, CalendarRange, MapPin, ArrowRight, Home, 
  CalendarDays, CheckCircle, Loader2, Clock, AlertTriangle, QrCode 
} from "lucide-react";
import CampusGuard from "@/components/auth/CampusGuard";

// --- FIREBASE IMPORTS ---
import { db, auth } from "@/lib/firebase"; 
import { 
  collection, query, where, getDocs, updateDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function HostelLeavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);

  // --- 1. FETCH STATUS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkApplicationStatus(currentUser.uid);
      } else {
        router.push("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const checkApplicationStatus = async (uid) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "leave_applications"),
        where("uid", "==", uid),
        where("status", "in", ["processing", "approved"]) 
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setApplication({ id: snapshot.docs[0].id, ...data });
      } else {
        setApplication(null);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. LOGIC CHECKS ---
  
  // Can the user physically leave yet? (Start Date <= Today)
  const isLeaveStarted = () => {
    if (!application) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(application.departureDate);
    start.setHours(0,0,0,0);
    return today >= start;
  };

  // --- 3. HANDLE RETURN (EARLY OR ON TIME) ---
  const handleMarkReturn = async () => {
    // Confirmation
    if (!confirm("Confirming your return will close this gate pass. Proceed?")) return;
    
    setActionLoading(true);
    try {
      const appRef = doc(db, "leave_applications", application.id);
      
      // We update the status to 'completed'
      // We also record the ACTUAL return time
      await updateDoc(appRef, {
        status: "completed",
        actualReturnTime: serverTimestamp(),
        earlyReturn: true // Optional flag for analytics
      });

      setApplication(null); // Reset UI
      alert("Welcome back! Your application has been closed successfully.");
    } catch (error) {
      console.error("Error marking return:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <CampusGuard>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-10 space-y-3 md:space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-sm border border-purple-100 backdrop-blur-sm bg-opacity-80">
          <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${application ? 'bg-green-400' : 'bg-indigo-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 ${application ? 'bg-green-500' : 'bg-indigo-500'}`}></span>
          </span>
          <span className="text-xs md:text-sm font-medium text-gray-600 tracking-wide uppercase">
            {application ? "Active Application" : "Hostel Leave Portal"}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-purple-600 leading-tight">
          {application ? "Current Status" : "Hostel Gate Pass"}
        </h1>
      </div>

      <div className="w-full max-w-xl">

        {/* --- 1. NO ACTIVE APPLICATION --- */}
        {!application && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-white/50 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CalendarRange className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Plan a Trip?</h2>
            <p className="text-gray-500 mb-8">
              Submit a new request to get approval from the warden.
            </p>
            <Link 
              href="/gate-pass/application"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              Apply for Leave <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* --- 2. PROCESSING --- */}
        {application && application.status === 'processing' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-yellow-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400" />
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Pending Approval</h2>
                <p className="text-sm text-gray-500">Warden is reviewing your request.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
               <div className="flex justify-between text-sm"><span className="text-gray-500">From:</span> <span className="font-semibold">{application.departureDate}</span></div>
               <div className="flex justify-between text-sm"><span className="text-gray-500">To:</span> <span className="font-semibold">{application.returnDate}</span></div>
            </div>
          </div>
        )}

        {/* --- 3. APPROVED (EXIT & RETURN FLOW) --- */}
        {application && application.status === 'approved' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Approved</h2>
                <p className="text-sm text-gray-500">Gate Pass ID: {application.id.slice(0,6).toUpperCase()}</p>
              </div>
            </div>

            {/* EXIT LOGIC: Only show QR if date is reached */}
            {isLeaveStarted() ? (
              <div className="space-y-4">
                <Link 
                  href="/gate-pass/qr-code" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  Show Gate Pass QR
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 text-orange-800 rounded-xl flex items-start gap-3 border border-orange-100">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Wait for your date!</p>
                  <p>Valid from: <strong>{application.departureDate}</strong></p>
                </div>
              </div>
            )}

            {/* RETURN LOGIC: Show as long as leave has started */}
            {/* This button appears anytime AFTER the start date, allowing Early Return */}
            {isLeaveStarted() && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                 <div className="flex items-center justify-between mb-4">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Back in Hostel?</p>
                   <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                     Accepting Early Returns
                   </span>
                 </div>
                 
                 <button 
                    onClick={handleMarkReturn}
                    disabled={actionLoading}
                    className="w-full group bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin w-4 h-4"/> 
                    ) : (
                      <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    Mark Return & Close Application
                 </button>
                 <p className="text-[10px] text-center text-gray-400 mt-2">
                   * This will close your current application and allow you to apply for a new one.
                 </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </CampusGuard>
  );
}