"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { uploadImageWithProgress } from "@/utils/upLoadImage";
import { useRouter } from "next/navigation";

export default function AddIssuesPage() {
  const router = useRouter();
  console.log("Uploading as:", auth.currentUser?.uid);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🚀 Upload starts immediately
  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    setUploadProgress(0);
    const url = await uploadImageWithProgress(file, setUploadProgress);
    setImageUrl(url);
  } catch (err) {
    console.error(err);
    alert("Image upload failed");
  }
};


  // 🧾 Only saves Firestore data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageUrl) {
      alert("Please wait for image upload");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "posts"), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl,
        createdBy: auth.currentUser.uid,
        status: "pending",
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
      });

      router.push("/report/dashboard/student");
    } catch (err) {
      console.error(err);
      alert("Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Add Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Image upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-md"
          />
          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="w-full mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {uploadProgress < 100
                  ? `Uploading image… ${uploadProgress}%`
                  : "Image uploaded successfully ✅"}
              </p>
            </div>
          )}

          {/* Success */}
          {uploadProgress === 100 && (
            <p className="text-green-600 text-sm">Image uploaded ✓</p>
          )}

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title"
            required
            className="w-full border rounded-md p-2"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            rows="4"
            required
            className="w-full border rounded-md p-2"
          />

          <button
            type="submit"
            disabled={loading || uploadProgress < 100}
            className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
}
