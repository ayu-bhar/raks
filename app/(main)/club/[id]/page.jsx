import { notFound } from "next/navigation";
import { clubs } from "@/data/clubs";
import { 
  Globe, Instagram, Linkedin, Youtube, Trophy, Mail 
} from "lucide-react";
import Image from "next/image";

// 1. Remove "use client" (This should be a Server Component)
// 2. Make the function async
export default async function ClubDetailsPage({ params }) {
  
  // 3. Await the params (Required in Next.js 15+)
  const { id } = await params;

  // 4. Find the club using the awaited ID
  const club = clubs.find((c) => c.id === id);

  if (!club) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Banner / Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 sm:h-48 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-md">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden bg-gray-100">
              <Image 
                src={club.image} 
                alt={club.name} 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
              <p className="text-gray-500 mt-1">{club.description}</p>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {club.social.instagram && <a href={club.social.instagram} target="_blank" className="p-2 bg-gray-100 rounded-full hover:bg-pink-100 hover:text-pink-600 transition"><Instagram className="w-5 h-5"/></a>}
              {club.social.linkedin && <a href={club.social.linkedin} target="_blank" className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-700 transition"><Linkedin className="w-5 h-5"/></a>}
              {club.website && <a href={club.website} target="_blank" className="p-2 bg-gray-100 rounded-full hover:bg-green-100 hover:text-green-600 transition"><Globe className="w-5 h-5"/></a>}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Leadership</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {club.president.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{club.president}</p>
                    <p className="text-xs text-gray-500">President</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
                <a href={`mailto:${club.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                  <Mail className="w-4 h-4" /> {club.email}
                </a>
              </div>
            </div>

            {/* Achievements Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Key Achievements</h3>
              <ul className="space-y-3">
                {club.achievements.map((ach, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-gray-700 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}