"use client";

import Link from "next/link";
import { LogOut, LogIn, MapPin, ArrowRight, ShieldCheck } from "lucide-react";

export default function GatePassPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* --- Header Section --- */}
      <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4 max-w-2xl mx-auto">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-sm border border-gray-100 backdrop-blur-sm bg-opacity-80">
          <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500"></span>
          </span>
          <span className="text-xs md:text-sm font-medium text-gray-600 tracking-wide uppercase">System Online</span>
        </div>

        {/* Title with Responsive Font Size */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 leading-tight">
          Campus Gate Pass
        </h1>
        
        <p className="text-sm md:text-base text-gray-500 px-4">
          Secure entry and exit management. Please enable GPS for validation.
        </p>
      </div>

      {/* --- Main Action Grid --- */}
      {/* grid-cols-1 for mobile, md:grid-cols-2 for tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl">

        {/* 🔴 CARD 1: LEAVE CAMPUS */}
        <Link 
          href="/gate-pass/leave-selection" 
          className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-95 md:active:scale-100 md:hover:-translate-y-2 border border-white/50 overflow-hidden flex flex-col justify-between min-h-[200px] md:min-h-[300px]"
        >
          {/* Hover Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Icon Box */}
            <div className="inline-flex p-3 md:p-4 bg-orange-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 group-hover:bg-orange-100 transition-colors">
              <LogOut className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">
              Leave Campus
            </h2>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
              Market visits, home leave, or errands. 
              <br className="hidden md:block"/>Generate your digital exit pass.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex items-center text-orange-600 font-semibold text-sm md:text-base group-hover:gap-2 transition-all">
            <span>Proceed to Exit</span>
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>


        {/* 🟢 CARD 2: ENTER CAMPUS */}
        <button 
          onClick={() => alert("Validating Location...\nSuccess! Welcome back.")}
          className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-95 md:active:scale-100 md:hover:-translate-y-2 border border-white/50 overflow-hidden text-left flex flex-col justify-between min-h-[200px] md:min-h-[300px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex p-3 md:p-4 bg-teal-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 group-hover:bg-teal-100 transition-colors">
              <LogIn className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
              Enter Campus
            </h2>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
              Returning inside? Mark your arrival to 
              <br className="hidden md:block"/>close your active pass instantly.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex items-center text-teal-600 font-semibold text-sm md:text-base group-hover:gap-2 transition-all">
            <span>Mark Entry</span>
            <ShieldCheck className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
          </div>
        </button>

      </div>

      {/* --- Footer Info --- */}
      <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-400 text-xs md:text-sm text-center">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 md:w-4 md:h-4" />
          <span>Location active</span>
        </div>
        <span className="hidden md:inline">•</span>
        <span>Only works within campus Wi-Fi range</span>
      </div>

    </div>
  );
}