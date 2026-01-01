import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";


export const getImageURL = async (file, folder = "uploads", uid = "guest") => {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const storageRef = ref(
    storage,
    `${folder}/${uid}/${fileName}`
  );

  // Upload image
  await uploadBytes(storageRef, file);

  // Get public URL
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};
