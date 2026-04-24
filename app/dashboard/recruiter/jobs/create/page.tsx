'use client'

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import ManualJobForm from "./ManualJobForm";
import { Sparkle, NotePencil, CircleNotch, WarningCircle } from "@phosphor-icons/react";

type Mode = "ai" | "manual";

export default function CreateJobPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("ai");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideating, setIdeating] = useState(false);
  const [error, setError] = useState("");

  async function handleIdeate() {
    if (!description.trim()) {
      setError("Please enter some rough notes first to ideate with AI.");
      return;
    }

    setError("");
    setIdeating(true);

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/generate-description`,
        {
          method: "POST",
          body: JSON.stringify({ description }),
        }
      );
      const data = await ApiError.handle(res) as { data: { full_description: string } };
      setDescription(data.data.full_description);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to generate description. Please try again.");
    } finally {
      setIdeating(false);
    }
  }

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
      const data = await ApiError.handle(res) as { data: { insertedId?: string; _id?: string } };
      const jobId = data.data.insertedId || data.data._id;
      
      if (jobId) {
        router.push(`/dashboard/recruiter/jobs/${jobId}`);
      } else {
        throw new Error("API did not return a job ID.");
      }
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
          type="button"
          onClick={() => setMode("ai")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === "ai"
              ? "bg-[#102C26] text-[#F7E7CE] shadow-sm"
              : "text-[#102C26] hover:bg-[#102C26]/5"
          }`}
        >
          <Sparkle size={18} weight={mode === "ai" ? "fill" : "regular"} />
          AI Parsing
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === "manual"
              ? "bg-[#102C26] text-[#F7E7CE] shadow-sm"
              : "text-[#102C26] hover:bg-[#102C26]/5"
          }`}
        >
          <NotePencil size={18} weight={mode === "manual" ? "fill" : "regular"} />
          Manual Entry
        </button>
      </div>

      {mode === "ai" ? (
        <div className="max-w-3xl">
          <form onSubmit={handleAiSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <WarningCircle size={18} />
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-3 shadow-sm relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#102C26] uppercase tracking-wider">Job Description</label>
                <button
                  type="button"
                  onClick={handleIdeate}
                  disabled={ideating || !description.trim()}
                  className="flex items-center gap-2 text-xs font-bold text-[#102C26] bg-[#F7E7CE] px-3 py-1.5 rounded-lg hover:bg-[#e8d0b0] transition-colors disabled:opacity-50"
                >
                  {ideating ? (
                    <CircleNotch size={14} className="animate-spin" />
                  ) : (
                    <Sparkle size={14} weight="fill" />
                  )}
                  Ideate with AI
                </button>
              </div>
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
                  <CircleNotch size={24} className="animate-spin" />
                  Scanning Description...
                </>
              ) : (
                <>
                  <Sparkle size={24} weight="fill" />
                  Parse & Create Job
                </>
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
