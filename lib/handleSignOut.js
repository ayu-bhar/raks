// lib/handleSignOut.js
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const handleSignOut = async (router) => {
  try {
    await signOut(auth);
    router.push("/auth/login");
  } catch (err) {
    console.error("Sign out failed:", err);
  }
};

export default handleSignOut;
