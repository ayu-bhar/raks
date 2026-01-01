import React from 'react'
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getImageURL } from "@/lib/getImageURL";
import { auth } from "@/lib/firebase";

const FileInput = () => {


const handleSubmit = async () => {
  let imageUrl = "";

  if (imageFile) {
    imageUrl = await getImageURL(
      imageFile,
      "issues",
      auth.currentUser.uid
    );
  }

  await addDoc(collection(db, "issues"), {
    title,
    description,
    imageUrl,
    status: "pending",
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file"/>
        <button type='submit'>Upload</button>
      </form>
    </div>
  )
}

export default FileInput
