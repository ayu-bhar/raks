"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, FileText, CheckCircle2, 
  Loader2, AlertCircle, Phone, User, Mail, Clock, 
  Building, MapPin, Hash 
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { db, auth } from "@/lib/firebase"; 
import { 
  collection, addDoc, query, where, getDocs, serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function GatePassApplication() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);

  // Form State - Updated with new fields
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phoneNumber: "",
    parentPhone: "",    // New Field
    hostelName: "",     // New Field
    roomNumber: "",     // New Field
    reason: "",
    departureDate: "",
    returnDate: "",
  });

  // --- 1. AUTH & PRE-FILL DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
      } else {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          studentName: currentUser.displayName || "",
          email: currentUser.email || ""
        }));
        checkExistingApplication(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // --- 2. CHECK EXISTING APPLICATION ---
  const checkExistingApplication = async (uid) => {
    try {
      const q = query(
        collection(db, "leave_applications"),
        where("uid", "==", uid),
        where("status", "in", ["processing", "approved"]) 
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setActiveApplication({ id: querySnapshot.docs[0].id, ...docData });
      } else {
        setActiveApplication(null);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. HANDLE SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validations
    if (formData.phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit student mobile number.");
      return;
    }
    if (formData.parentPhone.length < 10) {
      alert("Please enter a valid 10-digit parent mobile number.");
      return;
    }
    if (!formData.hostelName) {
      alert("Please select your hostel.");
      return;
    }
    if (new Date(formData.returnDate) < new Date(formData.departureDate)) {
      alert("Return date cannot be before departure date");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Construct payload
      const newApplication = {
        uid: user.uid,
        studentName: formData.studentName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        parentPhone: formData.parentPhone, // New
        hostelName: formData.hostelName,   // New
        roomNumber: formData.roomNumber,   // New
        reason: formData.reason,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        status: "processing",
        createdAt: serverTimestamp(),
      };

      // 2. Write to Firestore
      const docRef = await addDoc(collection(db, "leave_applications"), newApplication);

      // 3. Update UI
      setActiveApplication({
        id: docRef.id,
        ...newApplication,
        status: "processing"
      });

    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/gate-pass" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Leave Application</h1>
        </div>

        {/* --- VIEW: EXISTING APPLICATION --- */}
        {activeApplication ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`p-6 border-b ${activeApplication.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-3">
                {activeApplication.status === 'approved' ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <Clock className="w-8 h-8 text-yellow-600" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {activeApplication.status === 'approved' ? 'Approved' : 'Under Process'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {activeApplication.status === 'approved' ? 'You can now leave.' : 'Waiting for warden approval.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Details Summary */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                 <div>
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Student</span>
                    <span className="font-medium text-gray-800">{activeApplication.studentName}</span>
                 </div>
                 <div>
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Room</span>
                    <span className="font-medium text-gray-800">
                      {activeApplication.hostelName} - {activeApplication.roomNumber}
                    </span>
                 </div>
                 <div>
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Your Phone</span>
                    <span className="font-medium text-gray-800">{activeApplication.phoneNumber}</span>
                 </div>
                 <div>
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Parent Phone</span>
                    <span className="font-medium text-gray-800">{activeApplication.parentPhone}</span>
                 </div>
              </div>

              {/* Trip Details Summary */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm border border-gray-100">
                 <div>
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Leaving</span>
                    <span className="font-medium text-blue-600">{activeApplication.departureDate}</span>
                 </div>
                 <div>
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Returning</span>
                    <span className="font-medium text-blue-600">{activeApplication.returnDate}</span>
                 </div>
              </div>

              {activeApplication.status === 'approved' && (
                <Link href="/gate-pass/qr-code" className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  View QR Code
                </Link>
              )}
            </div>
          </div>
        ) : (
          
          /* --- VIEW: NEW FORM --- */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Personal Info */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Student Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name (Auto-filled) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.studentName}
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    />
                  </div>

                  {/* Hostel Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel Name</label>
                    <div className="relative">
                      <Building className="absolute top-3.5 left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                        value={formData.hostelName}
                        onChange={(e) => setFormData({...formData, hostelName: e.target.value})}
                      >
                        <option value="">Select Hostel</option>
                        <option value="Kautilya">Kautilya</option>
                        <option value="Brahmputra">Brahmputra</option>
                        <option value="Kamini">Kamini</option>
                      </select>
                    </div>
                  </div>

                  {/* Room Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Number</label>
                    <div className="relative">
                      <Hash className="absolute top-3.5 left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. C2A"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({...formData, roomNumber: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Info */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" /> Contact Info
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Student Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">My Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({...formData, phoneNumber: val});
                      }}
                    />
                  </div>

                  {/* Parent Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent's Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.parentPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({...formData, parentPhone: val});
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Trip Info */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Trip Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Leaving Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Date</label>
                    <input
                      type="date"
                      required
                      min={formData.departureDate || new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Leave</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Details about your trip..."
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}