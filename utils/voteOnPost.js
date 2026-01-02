import {
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function voteOnPost(postId, userId, voteType) {
  const postRef = doc(db, "posts", postId);
  const voteRef = doc(db, "posts", postId, "votes", userId);

  await runTransaction(db, async (transaction) => {
    const postSnap = await transaction.get(postRef);
    if (!postSnap.exists()) throw "Post not found";

    const voteSnap = await transaction.get(voteRef);

    let { upvotes, downvotes } = postSnap.data();

    // 🟢 No previous vote
    if (!voteSnap.exists()) {
      transaction.set(voteRef, {
        vote: voteType,
        votedAt: serverTimestamp(),
      });

      if (voteType === "up") upvotes++;
      else downvotes++;
    }

    // 🔁 Vote exists → maybe switch
    else {
      const prevVote = voteSnap.data().vote;

      if (prevVote === voteType) {
        return; // ❌ Same vote → do nothing
      }

      // Switch vote
      if (prevVote === "up") {
        upvotes--;
        downvotes++;
      } else {
        downvotes--;
        upvotes++;
      }

      transaction.update(voteRef, {
        vote: voteType,
        votedAt: serverTimestamp(),
      });
    }

    transaction.update(postRef, { upvotes, downvotes });
  });
}
