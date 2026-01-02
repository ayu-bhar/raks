"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Building, ArrowUpRight, ShoppingBag, 
  CheckCircle2, Loader2, Bell 
} from "lucide-react";
import { db } from "@/lib/firebase"; 
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    pending: 0,
    outside: 0,
    approved: 0,
    marketOut: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // --- 1. DEFINE REFERENCES ---
        const hostelRef = collection(db, "leave_applications");
        const marketRef = collection(db, "gate_passes");

        // --- 2. PARALLEL QUERIES ---
        
        // A. Hostel Query (Existing Logic)
        const hostelQuery = query(
            hostelRef, 
            where("status", "in", ["processing", "approved", "out_of_campus"])
        );

        // B. Market Query (New Logic: Status is 'out')
        const marketQuery = query(
            marketRef,
            where("status", "==", "out")
        );

        // C. Fetch Activity (Hostel Only for now)
        const activityQuery = query(
            hostelRef,
            orderBy("createdAt", "desc"),
            limit(3)
        );

        // Execute all queries in parallel
        const [hostelSnap, marketSnap, activitySnap] = await Promise.all([
            getDocs(hostelQuery),
            getDocs(marketQuery),
            getDocs(activityQuery)
        ]);

        // --- 3. CALCULATE METRICS ---
        
        // Hostel Stats
        let hostelPending = 0;
        let hostelApproved = 0;
        let hostelOutside = 0;

        hostelSnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'processing') hostelPending++;
            if (data.status === 'approved') hostelApproved++;
            if (data.status === 'out_of_campus') hostelOutside++;
        });

        // Market Stats (Total docs in snapshot = Total currently out)
        const marketOutside = marketSnap.size;

        // Update State
        setStats({
          pending: hostelPending,
          approved: hostelApproved,
          marketOut: marketOutside, // Specific count for Market
          outside: hostelOutside + marketOutside // Total students away
        });

        // Process Recent Activity
        const recentData = activitySnap.docs.map(doc => ({
           id: doc.id, 
           ...doc.data()
        }));
        setRecentActivity(recentData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently";
    // Check if it's a Firestore Timestamp or Date string
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 60000); 
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff/60)} hours ago`;
    return `${Math.floor(diff/1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time campus statistics.</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: HOSTEL READY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">Ready</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.approved}</h3>
          <p className="text-sm text-gray-500 font-medium">Hostel Departures</p>
        </div>

        {/* Card 2: TOTAL OUTSIDE (Hostel + Market) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-lg">Total Away</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.outside}</h3>
          <p className="text-sm text-gray-500 font-medium">Students Off Campus</p>
        </div>

        {/* Card 3: PENDING APPROVALS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.pending}</h3>
          <p className="text-sm text-gray-500 font-medium">Hostel Requests</p>
        </div>

        {/* Card 4: MARKET OUTSIDERS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">Active</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.marketOut}</h3>
          <p className="text-sm text-gray-500 font-medium">Out for Market</p>
        </div>

      </div>

      {/* --- QUICK ACTIONS & RECENT ACTIVITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Link 
              href="/admin/gate" 
              className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verify Gate Pass</h3>
                  <p className="text-xs text-gray-500">Scan QR or enter ID</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link 
              href="/admin/hostel-pass" 
              className="p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hostel Reports</h3>
                  <p className="text-xs text-gray-500">Review attendance</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
            </Link>

          </div>
        </div>

        {/* Recent Activity Feed (1/3 width) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             <Bell className="w-5 h-5 text-gray-400" /> Recent Requests
          </h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
               <p className="text-sm text-gray-400 italic">No recent activity.</p>
            ) : (
                recentActivity.map((item) => (
                    <div key={item.id} className="flex gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 
                            ${item.status === 'processing' ? 'bg-purple-500' : 
                              item.status === 'out_of_campus' ? 'bg-orange-500' : 'bg-green-500'}`} 
                        />
                        <div>
                        <p className="text-sm font-medium text-gray-800">
                            {item.studentName} <span className="text-gray-400 font-normal">({item.status})</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {item.hostelName || "Campus"} • {getTimeAgo(item.createdAt)}
                        </p>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}