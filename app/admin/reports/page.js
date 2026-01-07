"use client";

import { useState, useEffect, Suspense } from "react"; // 1. Add Suspense
import { useSearchParams } from "next/navigation";     // 2. Add useSearchParams
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import AdminGuard from "@/components/auth/AdminGuard";
import { db } from "@/lib/firebase";
import { 
  Building2, 
  Map, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import IssueList from "@/components/admin/IssueList";

// --- Sub-component for the main logic ---
function ReportsContent() {
  const searchParams = useSearchParams(); // 3. Hook is called here
  
  // 4. Safe initialization
  const initialTab = searchParams.get("tab") === "campus" ? "campus" : "hostel";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL changes (clicking sidebar links)
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && (tabFromUrl === "hostel" || tabFromUrl === "campus")) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Real-time Data Fetching
  useEffect(() => {
    const q = query(
      collection(db, "posts"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <AdminGuard>
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Issue Tracker</h1>
        <p className="text-gray-500 mt-1">
          Prioritized list of maintenance requests based on student votes.
        </p>
      </div>

      {/* Custom Tab Switcher */}
      <div className="flex p-1 bg-white border border-gray-200 rounded-xl w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("hostel")}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === "hostel" 
              ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }
          `}
        >
          <Building2 className="w-4 h-4" />
          Hostel Area
        </button>
        
        <button
          onClick={() => setActiveTab("campus")}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === "campus" 
              ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }
          `}
        >
          <Map className="w-4 h-4" />
          Campus Grounds
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-6 min-h-[500px]">
        {/* Banner for Critical Issues */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-orange-50 text-orange-800 rounded-xl border border-orange-100">
           <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
           <div className="text-sm">
             <p className="font-bold">Priority Sorting Active</p>
             <p className="opacity-90">Issues are automatically sorted. The most upvoted (critical) problems appear first.</p>
           </div>
        </div>

        {/* The List Logic */}
        <IssueList issues={issues} category={activeTab} />
      </div>

    </div>
    </AdminGuard>
  );
}

// --- 5. Main Export wrapped in Suspense ---
export default function AdminReportsPage() {
  return (
    <AdminGuard>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <ReportsContent />
    </Suspense>
    </AdminGuard>
  );
}