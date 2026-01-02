'use client'

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const PostCard = ({ 
  poster, 
  title, 
  description, 
  image, 
  initialUpvotes = 0, 
  initialDownvotes = 0,
  timestamp = "2 hours ago" // Added a default timestamp prop
}) => {
  const [votes, setVotes] = useState({ up: initialUpvotes, down: initialDownvotes });
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null

  // Improved Logic: Handles toggling votes
  const handleVote = (type) => {
    if (userVote === type) {
      // Remove vote
      setVotes(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setUserVote(null);
    } else {
      // Add new vote (and remove opposing vote if exists)
      setVotes(prev => ({
        up: type === 'up' ? prev.up + 1 : (userVote === 'up' ? prev.up - 1 : prev.up),
        down: type === 'down' ? prev.down + 1 : (userVote === 'down' ? prev.down - 1 : prev.down)
      }));
      setUserVote(type);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      
      {/* --- Header: User Info --- */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar Placeholder */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {poster.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{poster}</h3>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* --- Content --- */}
      <div className="px-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          {title}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* --- Image (Conditional) --- */}
      {image && (
        <div className="w-full h-64 sm:h-80 bg-gray-100 relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* --- Footer: Actions --- */}
      <div className="p-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
        
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <button 
            onClick={() => handleVote('up')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              userVote === 'up' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-current' : ''}`} />
            <span>{votes.up}</span>
          </button>

          {/* Downvote Button */}
          <button 
            onClick={() => handleVote('down')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              userVote === 'down' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
            <span>{votes.down}</span>
          </button>
        </div>

        {/* Social Actions (Visual only) */}
        <div className="flex items-center gap-4 text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-xs font-medium">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-xs font-medium">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PostCard;