"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  ChevronDown, 
  Building, 
  Store, 
  Menu, 
  X, 
  Home,
  LogOut,
  LayoutDashboard
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dbName, setDbName] = useState(""); 
  const router = useRouter();

  // --- 1. TRACK AUTH & FETCH DB PROFILE ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setDbName(userData.name || ""); 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setDbName(""); 
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. GET DISPLAY NAME HELPER ---
  const getUserName = () => {
    if (dbName) return dbName; 
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Student";
  };

  // --- 3. HANDLE LOGOUT WITH CONFIRMATION ---
  const handleLogout = async () => {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to log out?")) {
      return; // Stop here if user clicks "Cancel"
    }

    try {
      await signOut(auth);
      setDbName(""); 
      router.push("/auth/login");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              CampusConnect
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>

            <Link href="/club_events" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Club
            </Link>
            
            {/* Gate Pass Dropdown */}
            <div className="relative group h-16 flex items-center">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors focus:outline-none">
                Gate Pass
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>
              
              <div className="absolute top-full left-0 w-48 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-1 overflow-hidden ring-1 ring-black ring-opacity-5">
                  <Link href="/gate-pass/hostel" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                    <Building className="w-4 h-4" />
                    Hostel
                  </Link>
                  <Link href="/gate-pass/market" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                    <Store className="w-4 h-4" />
                    Market
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/report/dashboard/student" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
          </div>

          {/* --- DESKTOP AUTH SECTION --- */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">
                    {getUserName()}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wide">
                    Student
                  </p>
                </div>
                
                <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 ring-2 ring-white shadow-sm">
                   <span className="font-bold text-sm">
                     {getUserName().charAt(0).toUpperCase()}
                   </span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            
            {/* Mobile User Profile Header */}
            {user && (
              <div className="flex items-center gap-3 px-3 py-4 mb-4 bg-gray-50 rounded-xl border border-gray-100">
                 <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {getUserName().charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{getUserName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                 </div>
              </div>
            )}

            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5" /> Home
            </Link>
            
            {/* Gate Pass Section */}
            <div className="py-2">
              <div className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gate Pass System</div>
              <Link 
                href="/gate-pass/hostel" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> Hostel Pass
              </Link>
              <Link 
                href="/gate-pass/market" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> Market Pass
              </Link>
            </div>

            <Link 
              href="/report/dashboard/student" 
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>

            <div className="pt-4 border-t border-gray-100 mt-2">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              ) : (
                <Link 
                  href="/auth/login"
                  className="block w-full text-center px-5 py-3 rounded-xl text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}