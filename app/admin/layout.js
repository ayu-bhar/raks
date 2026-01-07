"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  FileTextIcon,
  CalendarPlus, // <--- 1. FIXED: Imported CalendarPlus
  Lock
} from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore"; 

// --- 1. Sidebar Component ---
function AdminSidebar({ isSidebarOpen, setIsSidebarOpen, role }) { // <--- 2. FIXED: Added 'role' prop
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();

  const allNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin"] }, // Added club-admin access to dashboard if needed
    { name: "Gate Management", href: "/admin/gate", icon: DoorOpen, roles: ["admin"] },
    { name: "Hostel Reports", href: "/admin/reports?tab=hostel", icon: Building2, roles: ["admin"] },
    { name: "Campus Reports", href: "/admin/reports?tab=campus", icon: Map, roles: ["admin"] },
    { name: "Hostel Approvals", href: "/admin/hostel-pass", icon: FileTextIcon, roles: ["admin"] },
    { name: "Add Event", href: "/admin/club-events/add", icon: CalendarPlus, roles: ["admin", "club-admin"] }
  ];

  // Filter items based on the user's role
  const navItems = allNavItems.filter(item => item.roles.includes(role));

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

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          let isActive = false;
          if (item.href === "/admin") {
            isActive = pathname === "/admin";
          } else if (item.href.includes("?tab=")) {
            const [path, query] = item.href.split("?");
            const targetTab = new URLSearchParams(query).get("tab");
            isActive = pathname === path && currentTab === targetTab;
          } else {
            isActive = pathname.startsWith(item.href);
          }

          const Icon = item.icon; 

          return (
            <Link
              key={item.name}
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

// --- 2. Main AdminLayout ---
export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole , setUserRole] = useState("");
  
  // State for logic
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Not logged in -> Redirect
        router.push("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // --- SECURITY CHECK ---
          if (userData.role === "admin" || userData.role === "club-admin") {
            setAdminName(userData.name || "Admin");
            setIsAuthorized(true);
            
            // Set role state correctly
            if(userData.role === "admin"){
              setUserRole("admin");
            } else {
              setUserRole("club-admin");
            }
          } else {
            // Logged in but NOT an admin
            alert("Access Denied: You do not have admin privileges.");
            router.push("/"); // Send to student home
          }
        } else {
          // No user data found
          router.push("/");
        }
      } catch (error) {
        console.error("Authorization Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 1. Show Loader while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // 2. If not authorized, return null
  if (!isAuthorized) {
    return null; 
  }

  // 3. Render Admin Layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <Suspense fallback={
        <div className="w-64 bg-slate-900 hidden md:flex items-center justify-center">
          <Loader2 className="animate-spin text-white" />
        </div>
      }>
        <AdminSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          role={userRole} // Passing role to sidebar
        />
      </Suspense>

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
              <p className="text-sm font-bold text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-500">{userRole === 'admin' ? "Chief Warden" : "Club Admin"}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Render Children */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}
    </div>
  );
}