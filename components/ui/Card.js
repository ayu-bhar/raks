"use client";

import { auth } from "@/lib/firebase";
import { voteOnPost } from "@/utils/voteOnPost";

const Card = ({ postId, imgUrl, title, description, upvotes, downvotes }) => {
  const handleVote = async (type) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Login required");
      return;
    }

    try {
      await voteOnPost(postId, user.uid, type);
    } catch (err) {
      console.error(err);
      alert("Voting failed");
    }
  };

  return (
    <div className="max-w-sm rounded-lg shadow bg-white">
      <img
        src={imgUrl}
        alt={title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="px-4 pt-4 flex gap-2">
        <span className="text-green-600 text-sm font-medium">Hostel Issue</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleVote("up")}
            className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded hover:bg-green-200 text-green-800 font-semibold"
          >
            👍 <span>{upvotes}</span>
          </button>

          <button
            onClick={() => handleVote("down")}
            className="flex items-center gap-1 bg-red-100 px-3 py-1 rounded hover:bg-red-200 text-red-800 font-semibold"
          >
            👎 <span>{downvotes}</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default Card;
