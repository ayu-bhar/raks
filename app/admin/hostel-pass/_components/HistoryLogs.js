"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export default function HistoryLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetch Completed or Rejected applications
        const q = query(
          collection(db, "leave_applications"),
          where("status", "in", ["completed", "rejected"]),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Helper to format Firestore Timestamp (e.g., "Jan 12, 10:30 PM")
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    // Check if it's a Firestore Timestamp (has toDate method)
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    }
    return timestamp; // Fallback if it's already a string
  };

  // Helper to check if they returned Late (Actual Return > Planned Return)
  const isLate = (plannedDateStr, actualTimestamp) => {
    if (!plannedDateStr || !actualTimestamp) return false;
    
    // Parse planned date (usually YYYY-MM-DD string)
    const planned = new Date(plannedDateStr);
    planned.setHours(23, 59, 59); // Set to end of that day

    // Parse actual timestamp
    const actual = actualTimestamp.toDate ? actualTimestamp.toDate() : new Date(actualTimestamp);

    return actual > planned;
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400"/></div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-gray-50/50">
            <th className="py-3 px-4">Student</th>
            <th className="py-3 px-4">Exit Log</th>
            <th className="py-3 px-4">Planned Return</th>
            <th className="py-3 px-4">Actual Return</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {logs.map((log) => {
            const wasLate = isLate(log.returnDate, log.actualReturnTime);

            return (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* 1. Student Info */}
                <td className="py-4 px-4">
                  <p className="font-bold text-gray-900">{log.studentName}</p>
                  <p className="text-xs text-gray-500">{log.hostelName}</p>
                </td>

                {/* 2. Actual Exit Time */}
                <td className="py-4 px-4">
                  <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {formatDateTime(log.actualExitTime)}
                  </span>
                </td>

                {/* 3. Planned Return Date (From Application) */}
                <td className="py-4 px-4">
                  <span className="text-gray-900 font-medium">
                    {log.returnDate || "-"}
                  </span>
                </td>

                {/* 4. Actual Return Log (Real Swipe Time) */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs px-2 py-1 rounded border ${
                      wasLate 
                        ? "bg-red-50 text-red-700 border-red-100" 
                        : "bg-green-50 text-green-700 border-green-100"
                    }`}>
                      {formatDateTime(log.actualReturnTime)}
                    </span>
                    
                    {wasLate && (
                      <div className="group relative">
                        <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Returned Late
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 5. Status Badge */}
                <td className="py-4 px-4">
                  {log.status === 'rejected' ? (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">
                      REJECTED
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-600">
                      COMPLETED
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
          
          {logs.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-center text-gray-400">
                No history logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}