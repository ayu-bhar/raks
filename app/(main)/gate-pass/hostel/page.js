"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, Home, CalendarRange, CheckCircle, Loader2, 
  Clock, Navigation, AlertTriangle 
} from "lucide-react";

// Ensure this path matches your firebase config file location
import { db, auth } from "@/lib/firebase"; 
import { 
  collection, query, where, getDocs, updateDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// If you don't have this component, remove the <CampusGuard> wrapper in the return statement
import CampusGuard from "@/components/auth/CampusGuard"; 
import StudentGuard from "@/components/auth/StudentGuard";

export default function HostelDashboard() {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [application, setApplication] = useState(null);

  // --- 1. FETCH ACTIVE STATUS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check for ANY active status: processing, approved, or currently away
          const q = query(
            collection(db, "leave_applications"),
            where("uid", "==", currentUser.uid),
            where("status", "in", ["processing", "approved", "out_of_campus"]) 
          );
          
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            // Found an active application
            const docData = snapshot.docs[0].data();
            setApplication({ id: snapshot.docs[0].id, ...docData });
          } else {
            // No active application
            setApplication(null);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setPageLoading(false);
        }
      } else {
        router.push("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // --- 2. ACTION: LEAVE HOSTEL (Log Exit Time) ---
  const handleLeaveHostel = async () => {
    if (!application) return;
    if (!confirm("Are you physically leaving the campus gate now?")) return;
    
    setActionLoading(true);
    try {
      const appRef = doc(db, "leave_applications", application.id);
      
      // Update DB: Set status to 'out_of_campus' and record the specific timestamp
      await updateDoc(appRef, {
        status: "out_of_campus",
        actualExitTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update Local State instantly for better UX
      setApplication(prev => ({ ...prev, status: "out_of_campus" }));
      alert("Exit logged successfully. Have a safe trip!");
    } catch (error) {
      console.error("Exit Log Error:", error);
      alert("Failed to log exit. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- 3. ACTION: RETURN HOSTEL (Log Return Time & Close) ---
  const handleReturnHostel = async () => {
    if (!application) return;
    if (!confirm("Are you back inside the hostel? This will close your gate pass.")) return;
    
    setActionLoading(true);
    try {
      const appRef = doc(db, "leave_applications", application.id);
      
      // Update DB: Set status to 'completed' and record return timestamp
      await updateDoc(appRef, {
        status: "completed",
        actualReturnTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Clear Local State (Removes the card from view)
      setApplication(null);
      alert("Welcome back! Your return has been logged.");
    } catch (error) {
      console.error("Return Log Error:", error);
      alert("Failed to log return. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <StudentGuard>
    <CampusGuard> 
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Hostel Dashboard</h1>
          <p className="text-center text-gray-500 mb-8">Manage your entry and exit</p>

          {/* STATE 1: NO ACTIVE APPLICATION */}
          {!application && (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarRange className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">You are in the Hostel</h2>
              <p className="text-gray-500 mb-6">No active leave application found.</p>
              <Link 
                href="/gate-pass/application" 
                className="block w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Apply for Gate Pass
              </Link>
            </div>
          )}

          {/* STATE 2: PROCESSING (Wait) */}
          {application && application.status === 'processing' && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-yellow-400">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-50 rounded-full">
                   <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Request Pending</h2>
                  <p className="text-sm text-gray-500">Warden approval required.</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                 Leave Dates: <strong>{application.departureDate}</strong> to <strong>{application.returnDate}</strong>
              </div>
              <button disabled className="w-full mt-4 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed">
                Waiting for Approval...
              </button>
            </div>
          )}

          {/* STATE 3: APPROVED (Shows "Leave Hostel" Option) */}
          {application && application.status === 'approved' && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Approved</h2>
                  <p className="text-sm text-gray-500">You are allowed to leave.</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl mb-6 text-green-800 text-sm flex gap-3 items-start">
                 <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                 <p>Only click the button below when you are physically leaving the campus gate.</p>
              </div>

              <button 
                onClick={handleLeaveHostel}
                disabled={actionLoading}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                {actionLoading ? <Loader2 className="animate-spin"/> : <LogOut className="w-5 h-5"/>}
                Leave Hostel (Log Exit)
              </button>
            </div>
          )}

          {/* STATE 4: OUT OF CAMPUS (Shows "Return" Option) */}
          {application && application.status === 'out_of_campus' && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-50 rounded-full">
                  <Navigation className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-indigo-900">Out of Campus</h2>
                  <p className="text-sm text-gray-500">Status: Currently Away</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Exit Recorded</p>
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                   <CheckCircle className="w-4 h-4" /> Exit Log Created
                </div>
              </div>
              
              <button 
                onClick={handleReturnHostel}
                disabled={actionLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {actionLoading ? <Loader2 className="animate-spin"/> : <Home className="w-5 h-5"/>}
                Mark Return (Update Log)
              </button>
            </div>
          )}

        </div>
      </div>
    </CampusGuard>
    </StudentGuard>
  );
}