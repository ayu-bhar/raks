"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  ChevronDown, 
  Building, 
  Store, 
  Menu, 
  X,
  Home // Imported Home icon
} from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              CampusConnect
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Added Home Link */}
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>

            <Link href="/club_events" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Events
            </Link>
            
            {/* Gate Pass Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors focus:outline-none py-2">
                Gate Pass
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 overflow-hidden">
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

          {/* --- LOGIN BUTTON (Desktop) --- */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Login
            </Link>
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-6 space-y-2">
            
            {/* Added Home Link for Mobile */}
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4" /> Home
            </Link>

            <Link 
              href="/club_events" 
              className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Events
            </Link>
            
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gate Pass</p>
              <Link 
                href="/gate-pass/hostel" 
                className="flex items-center gap-2 py-2 pl-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building className="w-4 h-4" /> Hostel
              </Link>
              <Link 
                href="/gate-pass/market" 
                className="flex items-center gap-2 py-2 pl-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Store className="w-4 h-4" /> Market
              </Link>
            </div>

            <Link 
              href="/report/dashboard/student" 
              className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link 
              href="/auth/login"
              className="block w-full text-center mt-4 px-5 py-3 rounded-xl text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}