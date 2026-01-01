'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { uploadImageAndGetURL } from '@/utils/upLoadImage';
import { useRouter } from 'next/navigation';

export default function AddIssuesPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Upload image → get URL
      const imageUrl = await uploadImageAndGetURL(
        formData.image,
        user.uid
      );

      // 2️⃣ Create Firestore document
      await addDoc(collection(db, "posts"), {
        title: formData.title,
        description: formData.description,
        imageUrl,
        createdBy: user.uid,
        status: "pending",
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
      });

      alert("Issue submitted successfully ✅");

      // Reset form
      setFormData({
        image: null,
        title: '',
        description: '',
      });
      router.push('/report/dashboard/student');

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
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
