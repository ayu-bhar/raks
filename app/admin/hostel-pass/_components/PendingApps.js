"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, Calendar, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function PendingApps() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  // 1. Fetch 'processing' applications
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "leave_applications"),
        where("status", "==", "processing")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // 2. Handle Approve/Reject
  const handleDecision = async (id, status) => {
    if(!confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await updateDoc(doc(db, "leave_applications", id), { status });
      // Remove from local list to avoid refetching
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      alert("Error updating status");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600"/></div>;

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Check className="w-12 h-12 mx-auto mb-4 text-green-200" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm">No pending approvals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((req) => (
        <div key={req.id} className="border border-gray-100 rounded-xl p-5 bg-gray-50 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900">{req.studentName}</h3>
              <p className="text-xs text-gray-500 uppercase">{req.hostelName} • {req.roomNumber}</p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">PENDING</span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{req.departureDate} <span className="text-gray-400">to</span> {req.returnDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{req.parentPhone} (Parent)</span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200 mt-2 text-xs italic">
              "{req.reason}"
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleDecision(req.id, "rejected")}
              className="flex-1 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> Reject
            </button>
            <button 
              onClick={() => handleDecision(req.id, "approved")}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}