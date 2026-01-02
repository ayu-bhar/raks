"use client";
import React from "react";
import { ThumbsUp, ThumbsDown, Edit2, Trash2, CheckCircle, Clock } from "lucide-react";

export default function MyIssueCard({ post, onEdit, onDelete }) {
  const { imageUrl, title, description, upvotes, downvotes, status } = post;

  const isResolved = status === "resolved";

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      
      {/* Image Container with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge (Floating) */}
        <div className="absolute top-3 right-3">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isResolved
                ? "bg-green-500/90 text-white"
                : "bg-amber-400/90 text-white"
            }`}
          >
            {isResolved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {status}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-grow">
          {description}
        </p>

        {/* Footer: Votes & Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          
          {/* Vote Counts */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span>{upvotes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span>{downvotes}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isResolved && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit Issue"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Issue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}