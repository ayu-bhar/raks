"use client";

import { useState } from "react";
import { Clock, Users, History, Building2 } from "lucide-react";
import PendingApps from "./_components/PendingApps";
import ActiveLeaves from "./_components/ActiveLeaves";
import HistoryLogs from "./_components/HistoryLogs";
import AdminGuard from "@/components/auth/AdminGuard";
export default function HostelReportPage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-8 h-8 text-indigo-600" />
              Hostel Warden Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage approvals and track student entry/exit logs.</p>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <nav className="flex space-x-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
                ${activeTab === "pending" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <Clock className="w-4 h-4" /> Pending Approvals
            </button>

            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
                ${activeTab === "active" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <Users className="w-4 h-4" /> Currently Active
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
                ${activeTab === "history" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <History className="w-4 h-4" /> History Logs
            </button>
          </nav>
        </div>

        {/* --- DYNAMIC COMPONENT --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] p-6">
          {activeTab === "pending" && <PendingApps />}
          {activeTab === "active" && <ActiveLeaves />}
          {activeTab === "history" && <HistoryLogs />}
        </div>

      </div>
    </div>
    </AdminGuard>
  );
}