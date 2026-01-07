"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // Imported auth
import { onAuthStateChanged } from "firebase/auth"; // Imported auth listener
import { Calendar, MapPin, ExternalLink, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Imported Link
import StudentGuard from "@/components/auth/StudentGuard";

export default function ClubEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClubAdmin, setIsClubAdmin] = useState(false); // State for permission

  // 1. Check User Role
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check if role is 'club-admin' (or 'admin' for superusers)
            if (userData.role === "club-admin" || userData.role === "admin") {
              setIsClubAdmin(true);
            }
          }
        } catch (error) {
          console.error("Error verifying role:", error);
        }
      } else {
        setIsClubAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch Events (Existing Logic)
  useEffect(() => {
    const q = query(collection(db, "club_events"), orderBy("eventDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8"/>
      </div>
    );
  }

  return (
    <StudentGuard>
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section with Conditional Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          
          {isClubAdmin && (
            <Link 
              href="/admin/club-events/add" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </Link>
          )}
        </div>
        
        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No upcoming events scheduled.</p>
            {isClubAdmin && <p className="text-sm text-blue-600 mt-1">Time to create one!</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full">
                <div className="relative h-48 w-full bg-gray-200">
                  {event.imageUrl ? (
                    <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{event.description}</p>
                  
                  <a 
                    href={event.registrationLink} 
                    target="_blank"
                    className="mt-auto w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    Register Now <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </StudentGuard>
  );
}