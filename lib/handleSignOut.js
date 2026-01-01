import { signOut } from "firebase/auth";
import { useRouter } from "next/router"
import { sign } from "node:crypto";
import { auth } from "./firebase";



const handleSignOut = async() => {
  const router = useRouter();
  try{
    await signOut(auth);
    router.push("/");

  }catch(error){
    console.log("Error signing out: ", error);
  }
}

export default handleSignOut
