"use client";
import React from "react";

export default function MyIssueCard({
  post,
  onEdit,
  onDelete,
}) {
  const { imageUrl, title, description, upvotes, downvotes, status } = post;

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-md bg-white">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        {/* Title + Status */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>

          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              status === "resolved"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{description}</p>

        {/* Votes */}
        <div className="flex gap-3 mb-3">
          <span className="bg-green-200 text-green-900 px-3 py-1 rounded text-sm font-semibold">
            👍 {upvotes}
          </span>
          <span className="bg-red-200 text-red-900 px-3 py-1 rounded text-sm font-semibold">
            👎 {downvotes}
          </span>
        </div>

        {/* Actions */}
        {status !== "resolved" && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-100 text-blue-800 py-1 rounded hover:bg-blue-200 text-sm"
            >
              ✏️ Edit
            </button>

            <button
              onClick={onDelete}
              className="flex-1 bg-red-100 text-red-800 py-1 rounded hover:bg-red-200 text-sm"
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
