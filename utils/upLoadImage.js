
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export const uploadImageAndGetURL = async (file, uid) => {
  if (!file) return null;

  const imageRef = ref(
    storage,
    `issues/${uid}/${Date.now()}-${file.name}`
  );

  await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(imageRef);

  return downloadURL;
};
