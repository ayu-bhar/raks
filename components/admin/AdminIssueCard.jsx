"use client";

import React, { useState } from "react";
import { 
  ThumbsUp, ThumbsDown, CheckCircle, Clock, MapPin, Building 
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminIssueCard({ issue }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(issue.status);

  // Calculate Popularity Score
  const score = (issue.upvotes || 0) - (issue.downvotes || 0);

  const handleResolve = async () => {
    if (!confirm("Mark this issue as resolved?")) return;
    
    setIsUpdating(true);
    try {
      const issueRef = doc(db, "posts", issue.id); // Using 'posts' collection as per previous steps
      await updateDoc(issueRef, {
        status: "resolved",
        resolvedAt: new Date().toISOString() // Optional: Track when it was fixed
      });
      setStatus("resolved");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "resolved") return null; // Option A: Hide resolved issues immediately
  // Or remove the line above if you want to keep showing them but visually changed

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      
      {/* Image Section */}
      <div className="h-48 w-full bg-gray-100 relative">
        {issue.imageUrl ? (
          <img 
            src={issue.imageUrl} 
            alt={issue.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        {/* Score Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1">
          {score > 0 ? <ThumbsUp className="w-3 h-3 text-green-600" /> : <ThumbsDown className="w-3 h-3 text-red-500" />}
          <span className={score > 0 ? "text-green-700" : "text-red-700"}>
            Score: {score}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-2">{issue.title}</h3>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
          {issue.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-6">
           <span className="flex items-center gap-1">
             {issue.category === 'hostel' ? <Building className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
             {issue.category?.toUpperCase() || "GENERAL"}
           </span>
           <span>•</span>
           <span>
             {issue.createdAt?.toDate ? issue.createdAt.toDate().toLocaleDateString() : "Recent"}
           </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleResolve}
          disabled={isUpdating}
          className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Updating..." : (
            <>
              <CheckCircle className="w-4 h-4" /> Mark Resolved
            </>
          )}
        </button>
      </div>
    </div>
  );
}