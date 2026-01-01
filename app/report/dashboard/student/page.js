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
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Reported Issues</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No issues reported yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              postid={post.id}
              userid={post.createdBy}
              imgUrl={post.imageUrl}
              title={post.title}
              description={post.description}
              upvotes={post.upvotes}
              downVotes={post.downvotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

