"use client";
import StudentGuard from "@/components/auth/StudentGuard";
import AddIssueForm from "@/components/AddIssueForm";

export default function AddIssuesPage() {
  return (
    <StudentGuard>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Issue</h1>
          <p className="text-gray-500">Submit a new maintenance request or report a problem.</p>
        </div>
        
        <AddIssueForm />
        
      </div>
    </div>
    </StudentGuard>
  );
}