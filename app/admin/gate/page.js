"use client";

import { useState, useEffect } from "react";
import { 
  Users, Search, Phone, Clock, ArrowRight, ArrowLeft, 
  History, AlertCircle, RefreshCw, Filter
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export default function AdminGatePage() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("live"); // 'live' or 'history'
  const [activeOutPasses, setActiveOutPasses] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const passesRef = collection(db, "gate_passes");

      // 1. Fetch "Currently Out"
      const outQuery = query(passesRef, where("status", "==", "out"));
      const outSnapshot = await getDocs(outQuery);
      const outData = outSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveOutPasses(outData);

      // 2. Fetch "History Logs" (Last 100 records for better context)
      const historyQuery = query(passesRef, orderBy("createdAt", "desc"), limit(100));
      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllLogs(historyData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPER: FORMAT DATE ---
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- IMPROVED SEARCH LOGIC ---
  const filteredLogs = allLogs.filter(log => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Safety checks: Ensure fields exist and convert to string for comparison
    const name = (log.name || "").toLowerCase();
    const roll = (log.rollNumber || "").toString().toLowerCase();
    
    // Check if term matches Name OR Roll Number
    return name.includes(term) || roll.includes(term);
  });

  return (
    <div className="space-y-6">
      
      {/* --- PAGE HEADER & STATS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gate Control</h1>
          <p className="text-gray-500 text-sm">Manage entries, exits, and view logs.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* --- SUB-NAVBAR (TABS) --- */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("live")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
              ${activeTab === "live" 
                ? "border-orange-500 text-orange-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
            `}
          >
            <Users className="w-4 h-4" />
            Live Status ({activeOutPasses.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
              ${activeTab === "history" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
            `}
          >
            <History className="w-4 h-4" />
            Log History
          </button>
        </nav>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[400px]">
        
        {/* === TAB 1: LIVE STATUS === */}
        {activeTab === "live" && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Currently Outside</h2>
                <p className="text-xs text-orange-600 font-medium">Students who have not returned yet.</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Left At</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Updating live data...</td></tr>
                  ) : activeOutPasses.length === 0 ? (
                     <tr>
                       <td colSpan="5" className="px-6 py-12 text-center">
                         <div className="flex flex-col items-center justify-center gap-2">
                           <div className="p-3 bg-green-50 rounded-full"><Users className="w-6 h-6 text-green-500"/></div>
                           <p className="text-gray-900 font-medium">All Clear!</p>
                           <p className="text-gray-400 text-xs">No students are currently outside the campus.</p>
                         </div>
                       </td>
                     </tr>
                  ) : (
                    activeOutPasses.map((pass) => (
                      <tr key={pass.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{pass.name}</td>
                        <td className="px-6 py-4 font-mono text-gray-600">{pass.rollNumber}</td>
                        <td className="px-6 py-4">
                           <a href={`tel:${pass.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                             <Phone className="w-3 h-3" /> {pass.phone || pass.phoneNumber}
                           </a>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-2 py-1 rounded w-fit">
                             <Clock className="w-3 h-3" /> {formatTime(pass.leaveTime)}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                             Out
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 2: HISTORY LOGS === */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-800">Master Logs</h2>
              
              {/* Enhanced Search Bar */}
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name or Roll No..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student Identity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Left Campus</th>
                    <th className="px-6 py-4 text-right">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No records found.</td></tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{log.name}</div>
                          <div className="text-xs text-gray-500 font-mono">Roll: {log.rollNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          {log.status === 'returned' || log.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                              Returned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 text-gray-600">
                              {formatTime(log.leaveTime)}
                              <ArrowRight className="w-4 h-4 text-orange-300" />
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           {log.returnTime ? (
                             <div className="flex items-center justify-end gap-2 text-gray-600">
                               <ArrowLeft className="w-4 h-4 text-green-300" />
                               {formatTime(log.returnTime)}
                             </div>
                           ) : (
                             <span className="text-gray-300 text-xs">--</span>
                           )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
               Showing recent 100 records
            </div>
          </div>
        )}

      </div>
    </div>
  );
}