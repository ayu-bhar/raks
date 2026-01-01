"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/utils/getUser";

const Card = ({ postid, userid, imgUrl, title, description, upvotes, downVotes }) => {
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const data = await getUser(userid);
      if (mounted) setAuthor(data);
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [userid]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">

      {/* Image */}
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={title}
          className="w-full h-48 object-cover bg-gray-100"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          No image
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-2">
        <p className="text-xs text-gray-500">
          Published by <span className="font-medium">{author?.name ?? "Anonymous"}</span>
        </p>

        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

        <p className="text-sm text-gray-700 line-clamp-3">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <button className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium hover:cursor-pointer">
          👍 {upvotes}
        </button>

        <button className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium hover:cursor-pointer">
          👎 {downVotes}
        </button>
      </div>
    </div>
  );
};

export default Card;

