"use client";

import Link from "next/link";
import Image from "next/image";
import { clubs } from "@/data/clubs"; // Importing the data file you created
import { ArrowRight, Users, Sparkles } from "lucide-react";

export default function ClubsListingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      
      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          Explore Our <span className="text-blue-600">Student Clubs</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Find your community, develop new skills, and make memories. Join a club that matches your passion.
        </p>
      </div>

      {/* --- Clubs Grid --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clubs.map((club) => (
          <Link 
            key={club.id} 
            href={`/club/${club.id}`}
            className="group block h-full"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
              
              {/* Image Section */}
              <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                {/* Fallback image logic or real image */}
                <Image 
                  src={club.image} 
                  alt={club.name} 
                  fill 
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Badge (Optional) */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                  <Users className="w-3 h-3" /> Community
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Active Club
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {club.name}
                </h3>
                
                <p className="text-gray-500 line-clamp-3 mb-6 flex-1">
                  {club.description}
                </p>

                {/* Footer / Action */}
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Fake avatars to show "community" feel */}
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200" />
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-300" />
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-[10px] font-bold text-white">
                      +50
                    </div>
                  </div>
                  
                  <span className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    View Details <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}