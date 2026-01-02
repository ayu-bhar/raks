"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, CheckCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ActiveLeaves() {
  const [loading, setLoading] = useState(true);
  const [activeLeaves, setActiveLeaves] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Approved (Not left yet) AND Out Of Campus (Left)
        const q = query(
          collection(db, "leave_applications"),
          where("status", "in", ["approved", "out_of_campus"])
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActiveLeaves(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to format Timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return timestamp.toDate().toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
            <th className="py-3 px-4">Student</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Planned Dates</th>
            <th className="py-3 px-4 text-indigo-600">Actual Exit Log</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {activeLeaves.map((leave) => (
            <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4">
                <p className="font-bold text-gray-900">{leave.studentName}</p>
                <p className="text-xs text-gray-500">{leave.hostelName} • {leave.roomNumber}</p>
              </td>
              <td className="py-4 px-4">
                {leave.status === 'out_of_campus' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    <MapPin className="w-3 h-3" /> OUTSIDE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" /> APPROVED
                  </span>
                )}
              </td>
              <td className="py-4 px-4 text-gray-600">
                {leave.departureDate} <br/> <span className="text-xs text-gray-400">to {leave.returnDate}</span>
              </td>
              <td className="py-4 px-4 font-mono text-xs">
                {leave.actualExitTime ? (
                  <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded">
                    {formatTime(leave.actualExitTime)}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Not left yet</span>
                )}
              </td>
              <td className="py-4 px-4">
                 {/* Admins could force close here if needed, but keeping it simple for now */}
                 <span className="text-xs text-gray-400">Tracking...</span>
              </td>
            </tr>
          ))}
          {activeLeaves.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-center text-gray-400">No active students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}