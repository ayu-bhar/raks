"use client";

import { useParams } from "next/navigation";
import EditIssueForm from "@/components/EditIssueForm";

export default function EditIssuePage() {
  const { postId } = useParams();
  return <EditIssueForm postId={postId} />;
}
