"use client";

import { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { uploadImageWithProgress } from "@/utils/upLoadImage";

export default function EditIssueForm({ postId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "hostel",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");

  // 🔹 Load existing post
  useEffect(() => {
    const loadPost = async () => {
      const ref = doc(db, "posts", postId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Post not found");
        router.push("/report/dashboard/student");
        return;
      }

      const data = snap.data();
      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
      });
      setImagePreview(data.imageUrl || null);
      setLoading(false);
    };

    loadPost();
  }, [postId, router]);

  if (loading) return <p className="p-6">Loading issue…</p>;

  // 🔹 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    let imageUrl = imagePreview;

    if (imageFile) {
      imageUrl = await uploadImageWithProgress(imageFile, () => {});
    }

    await updateDoc(doc(db, "posts", postId), {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrl,
      updatedAt: serverTimestamp(),
    });

    router.push("/report/dashboard/student");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded-xl">
      <h2 className="text-xl font-bold text-black">Edit Issue</h2>

      

      <input
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <textarea
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Issue
      </button>
    </form>
  );
}
