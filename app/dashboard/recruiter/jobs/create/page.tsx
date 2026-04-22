'use client'

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import ManualJobForm from "./ManualJobForm";

type Mode = "ai" | "manual";

export default function CreateJobPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("ai");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAiSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs`,
        {
          method: "POST",
          body: JSON.stringify({ description }),
        }
      );
      const data = await ApiError.handle(res) as { data: { insertedId: string } };
      router.push(`/dashboard/recruiter/jobs/${data.data.insertedId}`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#102C26] mb-2">Create New Job</h1>
        <p className="text-[#6b8f85] text-sm">
          Select your preferred method to create a job posting.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-[#F7E7CE] border border-[#e8d0b0] p-1 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setMode("ai")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "ai"
              ? "bg-[#102C26] text-[#F7E7CE] shadow-sm"
              : "text-[#102C26] hover:bg-[#102C26]/5"
          }`}
        >
          ✨ AI Parsing
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "manual"
              ? "bg-[#102C26] text-[#F7E7CE] shadow-sm"
              : "text-[#102C26] hover:bg-[#102C26]/5"
          }`}
        >
          📝 Manual Entry
        </button>
      </div>

      {mode === "ai" ? (
        <div className="max-w-3xl">
          <form onSubmit={handleAiSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-3 shadow-sm">
              <label className="text-xs font-semibold text-[#102C26] uppercase tracking-wider">Job Description</label>
              <textarea
                required
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Paste your job description here. e.g.: We are looking for a mid-level Software Tools Engineer at Zipline Kigali...`}
                className="border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent resize-none h-64"
              />
              <p className="text-xs text-[#6b8f85]">
                Our AI will automatically extract title, skills, experience, and other details to create a structured job post.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || description.trim().length < 20}
              className="bg-[#102C26] text-[#F7E7CE] py-4 rounded-full font-bold text-lg hover:bg-[#1a4a3a] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">⟳</span>
                  Scanning Description...
                </>
              ) : (
                "✨ Parse & Create Job"
              )}
            </button>
          </form>
        </div>
      ) : (
        <ManualJobForm />
      )}
    </div>
  );
}
