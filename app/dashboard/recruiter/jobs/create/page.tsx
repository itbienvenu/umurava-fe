'use client'

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth";

interface ParsedJob {
  acknowledged: boolean;
  insertedId: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedJob | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setParsed(null);
    setLoading(true);

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs`,
        {
          method: "POST",
          body: JSON.stringify({ description }),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create job.");
        return;
      }

      // Redirect straight to the job detail page
      router.push(`/dashboard/recruiter/jobs/${data.data.insertedId}`);
    } catch {
      setError("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoToJob() {
    if (parsed) router.push(`/dashboard/recruiter/jobs/${parsed.insertedId}`);
  }

  function handleGoToJobs() {
    router.push("/dashboard/recruiter/jobs");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#102C26] mb-2">Create Job</h1>
      <p className="text-[#6b8f85] text-sm mb-8">
        Paste your job description — our AI will extract and structure it automatically.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-3">
          <label className="text-sm font-medium text-[#102C26]">Job Description</label>
          <textarea
            required
            rows={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`We are looking for a mid-level Software Tools Engineer at Zipline Kigali. Must have 3+ years Python experience, SQL, and REST API development. Nice to have: Docker, CI/CD. Bachelor's in Computer Science preferred.`}
            className="border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent resize-none"
          />
          <p className="text-xs text-[#6b8f85]">
            Include role, seniority, required skills, experience, education, and location for best results.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || description.trim().length < 20}
          className="bg-[#102C26] text-[#F7E7CE] py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block">⟳</span>
              AI is parsing your description...
            </>
          ) : (
            "✨ Parse & Create Job"
          )}
        </button>
      </form>
    </div>
  );
}
