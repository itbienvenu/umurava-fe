'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import { 
  Plus, 
  Briefcase, 
  PencilSimple, 
  Eye, 
  Trash, 
  CircleNotch,
  WarningCircle
} from "@phosphor-icons/react";

interface Job {
  _id: string;
  title: string;
  employment_type?: string;
  seniority_level?: string;
  company?: { name: string; location?: { city?: string; country?: string } };
  skills?: { name: string; required: boolean }[];
  metadata?: { status: string; created_at: string };
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-amber-100 text-amber-700",
  archived:  "bg-gray-100 text-gray-500",
};

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");

  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/my-jobs`)
      .then((r) => ApiError.handle(r))
      .then((data) => setJobs((data as { data: Job[] }).data ?? []))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setFetching(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeletingId(id);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/${id}`,
        { method: "DELETE" }
      );
      await ApiError.handle(res);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.metadata?.status === filter);

  if (fetching) return (
    <div className="flex flex-col items-center justify-center py-24 text-[#6b8f85]">
      <CircleNotch size={48} className="animate-spin mb-4" />
      <p className="text-sm">Loading jobs...</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#102C26]">My Jobs</h1>
        <Link
          href="/dashboard/recruiter/jobs/create"
          className="bg-[#102C26] text-[#F7E7CE] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1a4a3a] transition-colors flex items-center gap-2"
        >
          <Plus size={18} weight="bold" />
          Create Job
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <WarningCircle size={18} />
          {error}
        </div>
      )}

      {/* Filter tabs */}
      {jobs.length > 0 && (
        <div className="flex gap-2 mb-5">
          {(["all", "published", "draft", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                filter === f
                  ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]"
                  : "border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26]"
              }`}
            >
              {f} {f === "all" ? `(${jobs.length})` : `(${jobs.filter((j) => j.metadata?.status === f).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center justify-center py-16 text-[#6b8f85] text-center">
          <Briefcase size={48} weight="duotone" className="mb-4 opacity-30" />
          <p className="text-sm mb-6 max-w-[240px]">
            {filter === "all" ? "No jobs posted yet. Start reaching top talent today!" : `No ${filter} jobs found in your repository.`}
          </p>
          {filter === "all" && (
            <Link
              href="/dashboard/recruiter/jobs/create"
              className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full text-sm font-bold hover:bg-[#1a4a3a] transition-all flex items-center gap-2"
            >
              <Plus size={18} weight="bold" />
              Post Your First Job
            </Link>
          )}
        </div>
      )}

      {/* Jobs list */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-2xl border border-[#e8d0b0] p-5 flex items-start justify-between gap-4"
            >
              {/* Left: job info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="font-semibold text-[#102C26] text-base">{job.title}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    STATUS_STYLES[job.metadata?.status ?? "draft"] ?? STATUS_STYLES.draft
                  }`}>
                    {job.metadata?.status ?? "draft"}
                  </span>
                </div>

                {job.company && (
                  <p className="text-sm text-[#6b8f85] mb-2">
                    {job.company.name}
                    {job.company.location?.city && ` · ${job.company.location.city}`}
                    {job.company.location?.country && `, ${job.company.location.country}`}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-2">
                  {job.employment_type && (
                    <Tag label={job.employment_type.replace("_", " ")} />
                  )}
                  {job.seniority_level && (
                    <Tag label={job.seniority_level} />
                  )}
                  {job.skills?.filter((s) => s.required).slice(0, 3).map((s) => (
                    <Tag key={s.name} label={s.name} dark />
                  ))}
                </div>

                {job.metadata?.created_at && (
                  <p className="text-xs text-[#6b8f85]">
                    Created {new Date(job.metadata.created_at).toLocaleDateString('en-US')}
                  </p>
                )}
              </div>

              {/* Right: actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href={`/dashboard/recruiter/jobs/${job._id}`}
                  className="text-xs bg-[#102C26] text-[#F7E7CE] px-4 py-2 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <PencilSimple size={14} />
                  Edit
                </Link>
                <button
                  onClick={() => router.push(`/dashboard/recruiter/jobs/${job._id}?tab=applications`)}
                  className="text-xs border border-[#e8d0b0] text-[#102C26] px-4 py-2 rounded-full font-medium hover:border-[#102C26] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  disabled={deletingId === job._id}
                  className="text-xs border border-red-200 text-red-500 px-4 py-2 rounded-full font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deletingId === job._id ? (
                    <CircleNotch size={14} className="animate-spin" />
                  ) : (
                    <Trash size={14} />
                  )}
                  {deletingId === job._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tag({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize border ${
      dark
        ? "bg-[#102C26]/10 text-[#102C26] border-[#102C26]/20"
        : "bg-[#F7E7CE] text-[#6b8f85] border-[#e8d0b0]"
    }`}>
      {label}
    </span>
  );
}
