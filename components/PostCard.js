'use client'

import React, { useState } from 'react';
import './PostCard.css';

const PostCard = ({ poster, title, description, image, initialUpvotes=0, initialDownvotes=0}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);

  const handleUpvote = () => setUpvotes(upvotes + 1);
  const handleDownvote = () => setDownvotes(downvotes + 1);

  return (
    <div className="post-card">
      <div className="post-header">
        <h3 className="poster-name">{poster}</h3>
      </div>
      
      <div className="post-content">
        <h2 className="post-title">{title}</h2>
        <p className="post-description">{description}</p>
        {image && <img src={image} alt={title} className="post-image" />}
      </div>

      <div className="post-footer">
        <button className="vote-btn upvote-btn" onClick={handleUpvote}>
          👍 {upvotes}
        </button>
        <button className="vote-btn downvote-btn" onClick={handleDownvote}>
          👎 {downvotes}
        </button>
      </div>
    </div>
  );
};

export default PostCard;