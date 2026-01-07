"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { db, auth } from "@/lib/firebase"; 
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import StudentGuard from "@/components/auth/StudentGuard";

export default function GatePassApplication() {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentName: "", 
    email: "", 
    phoneNumber: "", 
    parentPhone: "",
    hostelName: "", 
    roomNumber: "", 
    reason: "", 
    departureDate: "", 
    returnDate: ""
  });

  // --- 1. CHECK ELIGIBILITY & AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      
      setUser(currentUser);
      setFormData(prev => ({ 
        ...prev, 
        studentName: currentUser.displayName || "", 
        email: currentUser.email || "" 
      }));

      // Check if they already have an active pass
      try {
        const q = query(
          collection(db, "leave_applications"),
          where("uid", "==", currentUser.uid),
          where("status", "in", ["processing", "approved", "out_of_campus"])
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          alert("You already have an active application. Redirecting to dashboard...");
          router.push("/gate-pass/hostel"); // Redirect to dashboard
        } else {
          setPageLoading(false); // Only show form if no active application
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setPageLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // --- 2. HANDLE SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Basic Validation
    if (new Date(formData.returnDate) < new Date(formData.departureDate)) {
        return alert("Return date cannot be before departure date");
    }
    if (formData.phoneNumber.length < 10) return alert("Please enter a valid phone number");

    setIsSubmitting(true);
    
    try {
      // Create new document in Firestore
      await addDoc(collection(db, "leave_applications"), {
        uid: user.uid,
        ...formData,
        status: "processing", // Initial status
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Redirect to Dashboard immediately after success
      router.push("/gate-pass/hostel"); 
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <StudentGuard>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-start pt-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b pb-4">
          <Link href="/gate-pass/hostel" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-600"/>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Application</h1>
            <p className="text-sm text-gray-500">Request a new gate pass</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Details */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Student Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.studentName} 
                onChange={e => setFormData({...formData, studentName: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Hostel</label>
              <select 
                required 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.hostelName} 
                onChange={e => setFormData({...formData, hostelName: e.target.value})}
              >
                <option value="">Select Hostel</option>
                <option value="Kautilya">Kautilya</option>
                <option value="Brahmputra">Brahmputra</option>
                <option value="Kamini">Kamini</option>
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-gray-700">Room No</label>
               <input 
                 type="text" 
                 required 
                 className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.roomNumber} 
                 onChange={e => setFormData({...formData, roomNumber: e.target.value})} 
               />
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-gray-700">My Phone</label>
               <input 
                 type="tel" 
                 required 
                 maxLength={10} 
                 className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.phoneNumber} 
                 onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
               />
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-gray-700">Parent Phone</label>
               <input 
                 type="tel" 
                 required 
                 maxLength={10} 
                 className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.parentPhone} 
                 onChange={e => setFormData({...formData, parentPhone: e.target.value})} 
               />
            </div>

            {/* Trip Details */}
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Leaving Date</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.departureDate} 
                  onChange={e => setFormData({...formData, departureDate: e.target.value})} 
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Return Date</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.returnDate} 
                  onChange={e => setFormData({...formData, returnDate: e.target.value})} 
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Reason</label>
                <textarea 
                  required 
                  rows="3" 
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})} 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? <Loader2 className="animate-spin"/> : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
    </StudentGuard>
  );
}