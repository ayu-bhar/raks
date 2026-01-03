"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";

export default function StudentDashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Query: Fetch all posts sorted by newest first
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    // 2. Real-time Listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // 3. Filter: Exclude any post where status is "resolved"
        .filter((post) => post.status !== "resolved");

      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-500">Reported Issues</h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-lg">No active issues.</p>
          <p className="text-sm">Great! Everything seems to be working.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id} 
              postId={post.id}
              title={post.title}
              description={post.description}
              imgUrl={post.imageUrl}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}