'use client'

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import { 
  ClipboardText, 
  CheckCircle, 
  WarningCircle, 
  Lightbulb, 
  CaretDown, 
  CaretUp, 
  CircleNotch,
  User,
  ChartBar,
  Sparkle,
  MagnifyingGlass
} from "@phosphor-icons/react";

interface Job {
  _id: string;
  title: string;
  metadata?: { status: string };
}

interface Application {
  _id: string;
  applicantId: string;
  jobId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  screening_result?: {
    rank?: number;
    final_score?: number;
    dimension_breakdown?: Record<string, number>;
    strengths?: string[];
    gaps?: string[];
    recommendation?: string;
    screened_at?: string;
    ai_unavailable?: boolean;
  };
  job?: {
    title?: string;
    seniority_level?: string;
    employment_type?: string;
  };
}

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"] as const;
type AppStatus = typeof STATUSES[number];

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-gray-100 text-gray-600",
  reviewed:    "bg-blue-100 text-blue-700",
  shortlisted: "bg-purple-100 text-purple-700",
  rejected:    "bg-red-100 text-red-600",
  hired:       "bg-green-100 text-green-700",
};

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");

  // Load recruiter's jobs for the picker
  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/my-jobs`)
      .then((r) => ApiError.handle(r))
      .then((data) => {
        const list = (data as { data: Job[] }).data ?? [];
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0]._id);
      })
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Load applications when job changes
  useEffect(() => {
    if (!selectedJobId) return;
    setLoadingApps(true);
    setApplications([]);
    setError("");
    setExpandedId(null);
    setStatusFilter("all");

    authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/applications/job/${selectedJobId}`)
      .then((r) => ApiError.handle(r))
      .then((data) => setApplications((data as { data: Application[] }).data ?? []))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoadingApps(false));
  }, [selectedJobId]);

  async function handleStatusUpdate(appId: string, newStatus: AppStatus) {
    setUpdatingId(appId);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/applications/${appId}/status`,
        { method: "PATCH", body: JSON.stringify({ status: newStatus }) }
      );
      await ApiError.handle(res);
      setApplications((prev) =>
        prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = statusFilter === "all"
    ? applications
    : applications.filter((a) => a.status === statusFilter);

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102C26] mb-6">Applications</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <WarningCircle size={18} />
          {error}
        </div>
      )}

      {/* Job picker */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-5 mb-5">
        <label className="text-sm font-medium text-[#102C26] mb-2 block">Select Job</label>
        {loadingJobs ? (
          <div className="flex items-center gap-2 text-sm text-[#6b8f85]">
            <CircleNotch size={16} className="animate-spin" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-[#6b8f85]">No jobs found. Create a job first.</p>
        ) : (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26] w-full"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} — {j.metadata?.status ?? "draft"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats bar */}
      {applications.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {(["all", ...STATUSES] as const).map((s) => {
            const count = s === "all" ? applications.length : applications.filter((a) => a.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]"
                    : "bg-white border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26]"
                }`}
              >
                <span className="text-lg font-bold">{count}</span>
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* Applications list */}
      {loadingApps ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#6b8f85]">
          <CircleNotch size={48} className="animate-spin mb-4" />
          <p className="text-sm">Loading applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center justify-center py-16 text-[#6b8f85] text-center">
          <ClipboardText size={48} weight="duotone" className="mb-4 opacity-30" />
          <p className="text-sm">
            {applications.length === 0
              ? `No applications yet for "${selectedJob?.title}".`
              : `No ${statusFilter} applications matching your criteria.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => {
            const isExpanded = expandedId === app._id;
            const sr = app.screening_result;

            return (
              <div key={app._id} className="bg-white rounded-2xl border border-[#e8d0b0] overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#102C26]/10 flex items-center justify-center text-[#102C26] shrink-0">
                      <User size={20} weight="bold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#102C26] truncate">
                        Applicant #{app.applicantId.slice(-6)}
                      </p>
                      <p className="text-xs text-[#6b8f85]">
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-US')}
                        {sr?.final_score !== undefined && (
                          <span className="ml-2 font-medium text-[#102C26]">
                            · Score: {sr.final_score.toFixed(1)}%
                          </span>
                        )}
                        {sr?.rank !== undefined && (
                          <span className="ml-1 text-purple-600 font-medium">· Rank #{sr.rank}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}>
                      {app.status}
                    </span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app._id)}
                      className="text-xs text-[#6b8f85] hover:text-[#102C26] px-3 py-1.5 rounded-lg hover:bg-[#F7E7CE] transition-colors flex items-center gap-1.5"
                    >
                      {isExpanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                      {isExpanded ? "Less" : "More"}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-[#e8d0b0] p-5 flex flex-col gap-4">

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ClipboardText size={16} weight="duotone" className="text-[#102C26]" />
                          <p className="text-xs font-semibold text-[#102C26]">Cover Letter</p>
                        </div>
                        <p className="text-sm text-[#6b8f85] leading-relaxed bg-[#F7E7CE]/50 rounded-lg p-3">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Screening result */}
                    {sr && !sr.ai_unavailable && (
                      <div className="border-t border-[#e8d0b0]/50 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ChartBar size={18} weight="duotone" className="text-[#102C26]" />
                          <p className="text-xs font-semibold text-[#102C26]">AI Screening Insight</p>
                        </div>

                        {/* Score breakdown */}
                        {sr.dimension_breakdown && (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                            {Object.entries(sr.dimension_breakdown).map(([key, val]) => (
                              <div key={key} className="flex flex-col items-center bg-[#F7E7CE] rounded-xl p-2.5">
                                <span className="text-base font-bold text-[#102C26]">
                                  {Math.round((val as number) * 100)}%
                                </span>
                                <span className="text-xs text-[#6b8f85] capitalize mt-0.5">
                                  {key.replace("_", " ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Strengths & gaps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {sr.strengths && sr.strengths.length > 0 && (
                            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                              <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1.5">
                                <Sparkle size={14} weight="fill" />
                                Key Strengths
                              </p>
                              <ul className="text-xs text-green-700 space-y-1.5 list-none">
                                {sr.strengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle size={14} weight="bold" className="mt-0.5 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {sr.gaps && sr.gaps.length > 0 && (
                            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                              <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1.5">
                                <MagnifyingGlass size={14} weight="fill" />
                                Identified Gaps
                              </p>
                              <ul className="text-xs text-red-600 space-y-1.5 list-none">
                                {sr.gaps.map((g, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <WarningCircle size={14} weight="bold" className="mt-0.5 shrink-0" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Recommendation */}
                        {sr.recommendation && (
                          <div className="flex items-start gap-3 bg-[#F7E7CE]/50 rounded-xl p-3 border border-[#e8d0b0]/30 italic">
                            <Lightbulb size={18} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-[#6b8f85]">{sr.recommendation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status update */}
                    <div>
                      <p className="text-xs font-semibold text-[#102C26] mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            disabled={app.status === s || updatingId === app._id}
                            onClick={() => handleStatusUpdate(app._id, s)}
                            className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition-all uppercase tracking-wider disabled:cursor-not-allowed ${
                              app.status === s
                                ? `${STATUS_STYLES[s]} border-transparent shadow-sm`
                                : "border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26] disabled:opacity-40"
                            }`}
                          >
                            {updatingId === app._id && app.status !== s ? (
                              <CircleNotch size={10} className="animate-spin" />
                            ) : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
