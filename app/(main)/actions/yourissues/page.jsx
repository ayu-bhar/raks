"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import StudentGuard from "@/components/auth/StudentGuard";
import { ArrowLeft, Loader2 } from "lucide-react"; // Import Icons

export default function YourIssuesPage() {
  const router = useRouter();
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading your issues...</p>
      </div>
    );
  }

  return (
    <StudentGuard>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Issues</h1>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">You haven’t posted any issues yet.</p>
              <button 
                onClick={() => router.push('/actions/addissues')}
                className="mt-4 text-blue-600 font-semibold hover:underline"
              >
                Report an Issue
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {post.imageUrl && (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{post.title}</h2>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          post.status === "resolved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {post.status ? post.status.toUpperCase() : "PENDING"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                      {post.description}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex gap-4 text-sm font-medium text-gray-500">
                        <span className="flex items-center gap-1">
                          👍 {post.upvotes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          👎 {post.downvotes || 0}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
                          onClick={() => router.push(`/report/edit/${post.id}`)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-500 text-sm font-semibold hover:text-red-600 transition-colors"
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
          )}
        </div>
      </div>
    </StudentGuard>
  );
}