"use client";

import { useState, Suspense } from "react"; // 1. Import Suspense
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; // 2. Import useSearchParams
import { 
  LayoutDashboard, 
  DoorOpen, 
  Building2, 
  Map, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck,
  Loader2, 
  Building2Icon,
  FileTextIcon
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// --- 3. Separate Sidebar Component ---
// We move the sidebar logic here so we can wrap it in Suspense
function AdminSidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Now safe to use
  const currentTab = searchParams.get("tab");
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Gate Management", href: "/admin/gate", icon: DoorOpen },
    { name: "Hostel Reports", href: "/admin/reports?tab=hostel", icon: Building2 },
    { name: "Campus Reports", href: "/admin/reports?tab=campus", icon: Map },
    { name: "Hostel Approvels", href: "/admin/hostel-pass",icon : FileTextIcon}
  ];

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white 
        transform transition-transform duration-200 ease-in-out 
        md:translate-x-0 md:static md:inset-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 justify-between">
        <div className="flex items-center">
          <ShieldCheck className="w-8 h-8 text-blue-500 mr-2" />
          <span className="text-xl font-bold tracking-wide">AdminPortal</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="md:hidden text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          // --- HIGHLIGHT LOGIC ---
          let isActive = false;

          if (item.href === "/admin") {
            // Exact match for Dashboard
            isActive = pathname === "/admin";
          } else if (item.href.includes("?tab=")) {
            // Logic for Report Tabs
            const [path, query] = item.href.split("?");
            const targetTab = new URLSearchParams(query).get("tab");
            // Active if path matches AND tab matches
            isActive = pathname === path && currentTab === targetTab;
          } else {
            // General match for other pages (e.g. Gate)
            isActive = pathname.startsWith(item.href);
          }

          const Icon = item.icon; 

          return (
            <Link
              key={item.name} // Use name as key since hrefs might duplicate base path
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// --- 4. Main AdminLayout ---
export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Wrapped in Suspense to handle useSearchParams safely */}
      <Suspense fallback={
        <div className="w-64 bg-slate-900 hidden md:flex items-center justify-center">
          <Loader2 className="animate-spin text-white" />
        </div>
      }>
        <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </Suspense>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
              Administrator Console
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Chief Warden</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}
    </div>
  );
}