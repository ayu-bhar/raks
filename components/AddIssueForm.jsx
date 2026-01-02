"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Building, Map, UploadCloud, X, Loader2, AlertCircle 
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { uploadImageWithProgress } from "@/utils/upLoadImage";

export default function AddIssueForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "hostel"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Status: idle | uploading | submitting | success | error
  const [status, setStatus] = useState("idle"); 
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => setMounted(true), []);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // --- SIZE CHECK START ---
      const maxSizeInBytes = 1.5 * 1024 * 1024; // 1.5 MB
      
      if (file.size > maxSizeInBytes) {
        alert("File size is too large! Max limit is 1.5 MB.");
        
        // Reset the file input so they can try again
        if (fileInputRef.current) fileInputRef.current.value = "";
        return; 
      }
      // --- SIZE CHECK END ---

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadProgress(0);
      setErrorMessage(""); 
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!auth.currentUser) {
      setErrorMessage("You must be logged in to submit.");
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Please fill in the title and description.");
      return;
    }

    try {
      let imageUrl = "";

      // 1. Upload Image Phase
      if (imageFile) {
        setStatus("uploading");
        imageUrl = await uploadImageWithProgress(imageFile, setUploadProgress);
      }

      // 2. Firestore Phase
      setStatus("submitting");
      
      // IMPORTANT: Changed collection to "posts" to match your Dashboard
      await addDoc(collection(db, "posts"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        imageUrl: imageUrl || null, // Handle no image case
        status: "pending",
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0
      });

      setStatus("success");
      setTimeout(() => router.push("/report/dashboard/student"), 1500);

    } catch (error) {
      console.error("Submission Error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to submit issue. Please try again.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">Report an Issue</h2>
        <p className="text-sm text-gray-500 mt-1">Help us maintain the facilities.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Error Message Banner */}
        {status === "error" && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Category Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Where is the issue?</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleCategoryChange("hostel")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                formData.category === "hostel"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Building className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Hostel</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("campus")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                formData.category === "campus"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Map className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Campus</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Attachment</label>
          
          {!imagePreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">Click to upload image</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              
              {status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                  <span className="text-white font-bold mb-2">Uploading {uploadProgress}%</span>
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'idle' || status === 'error' ? (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'uploading' || status === 'submitting' || status === 'success'}
          className={`
            w-full py-4 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all
            ${status === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}
            ${(status === 'uploading' || status === 'submitting') ? 'opacity-70 cursor-not-allowed' : ''}
            ${status === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          `}
        >
          {status === 'uploading' && <><Loader2 className="animate-spin" /> Uploading Image...</>}
          {status === 'submitting' && <><Loader2 className="animate-spin" /> Submitting Issue...</>}
          {status === 'success' && "Submitted Successfully!"}
          {status === 'error' && "Retry Submission"}
          {status === 'idle' && "Submit Issue"}
        </button>

      </form>
    </div>
  );
}