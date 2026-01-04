"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { uploadImageWithProgress } from "@/utils/upLoadImage";
import { 
  Loader2, CalendarPlus, Link as LinkIcon, Image as ImageIcon, 
  Type, AlignLeft, Calendar, ExternalLink, X 
} from "lucide-react";
import Image from "next/image";

export default function AddEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    registrationLink: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("You must be logged in to post.");
    if (!imageFile) return alert("Please upload an event poster.");

    setLoading(true);
    try {
      console.log("Starting upload...");
      
      // 1. Upload Image
      const imageUrl = await uploadImageWithProgress(imageFile, setUploadProgress);
      console.log("Image uploaded:", imageUrl);

      // 2. Save to Firestore
      await addDoc(collection(db, "club_events"), {
        ...formData,
        imageUrl,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });

      alert("Event Published Successfully!");
      router.push("/club_events");
      
    } catch (error) {
      console.error("Full Error:", error);
      // This will tell you EXACTLY what is wrong in the browser alert
      alert(`Error: ${error.message}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <CalendarPlus className="w-6 h-6" />
            </div>
            Create New Event
          </h1>
          <p className="text-gray-500 mt-2 ml-14">
            Publish a new event to the campus feed. Changes will be live immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: THE FORM */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Event Title</label>
                <div className="relative group">
                  <Type className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    required
                    type="text" 
                    // ADDED: text-gray-900
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
                    placeholder="e.g. Annual Tech Hackathon 2024"
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
              </div>

              {/* Date & Link Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Event Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      required
                      type="date" 
                      // ADDED: text-gray-900
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
                      onChange={e => setFormData({...formData, eventDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Registration URL</label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      required
                      type="url" 
                      // ADDED: text-gray-900
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
                      placeholder="https://forms.google..."
                      onChange={e => setFormData({...formData, registrationLink: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <div className="relative group">
                  <AlignLeft className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <textarea 
                    required
                    rows="5"
                    // ADDED: text-gray-900
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 focus:bg-white resize-none placeholder:text-gray-400"
                    placeholder="Describe the event details, venue, and agenda..."
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Event Poster</label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click to upload poster</p>
                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                    <div className="h-48 w-full relative bg-gray-100">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {uploadProgress > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                         <span className="text-white font-bold text-lg mb-2">{uploadProgress}%</span>
                         <div className="w-1/2 bg-white/20 rounded-full h-1.5">
                            <div className="bg-white h-full rounded-full transition-all" style={{width: `${uploadProgress}%`}} />
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" /> Publishing...</>
                  ) : (
                    "Publish Event"
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW */}
          <div className="hidden lg:block space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 ml-1">Live Preview</h3>
            
            {/* The Preview Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col max-w-sm mx-auto sticky top-8">
              <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center text-gray-300">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">No image yet</span>
                  </div>
                )}
                
                {formData.eventDate && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm text-gray-900">
                    {new Date(formData.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1 min-h-[200px]">
                <h3 className={`font-bold text-lg mb-2 ${formData.title ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                  {formData.title || "Event Title Here"}
                </h3>
                
                <p className={`text-sm line-clamp-3 mb-6 flex-1 ${formData.description ? 'text-gray-500' : 'text-gray-300 italic'}`}>
                  {formData.description || "Event description will appear here..."}
                </p>
                
                <button 
                  disabled
                  className="mt-auto w-full py-2.5 bg-blue-600/10 text-blue-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-default"
                >
                  Register Now <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
               <p className="text-xs text-gray-400">
                 This is how the card will appear on the student dashboard.
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}