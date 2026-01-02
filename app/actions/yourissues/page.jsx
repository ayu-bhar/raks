"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";

export default function YourIssuesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "posts"),
        where("createdBy", "==", user.uid)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this issue?")) return;

    await deleteDoc(doc(db, "posts", id));
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your issues…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">My Issues</h1>

      {posts.length === 0 && (
        <p className="text-gray-500">You haven’t posted any issues yet.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {post.imageUrl && (
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={400}
                height={200}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">{post.title}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    post.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {post.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {post.description}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-sm">
                  <span className="text-green-700 font-semibold">
                    👍 {post.upvotes}
                  </span>
                  <span className="text-red-700 font-semibold">
                    👎 {post.downvotes}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => alert("Edit coming soon")}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-600 text-sm hover:underline"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
