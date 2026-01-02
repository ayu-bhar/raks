"use client";

import React from "react";
import AdminIssueCard from "./AdminIssueCard";
import { Inbox } from "lucide-react";

export default function IssueList({ issues, category }) {
  // 1. Filter by Category (Hostel vs Campus)
  const filteredIssues = issues.filter(
    (issue) => issue.category === category && issue.status !== 'resolved'
  );

  // 2. Sort by Popularity Score (Upvotes - Downvotes)
  // Higher score appears first
  const sortedIssues = filteredIssues.sort((a, b) => {
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    return scoreB - scoreA;
  });

  if (sortedIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
        <p className="text-gray-500 max-w-sm mt-1">
          No pending issues found for {category}. Great job keeping the campus maintained.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedIssues.map((issue) => (
        <AdminIssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}