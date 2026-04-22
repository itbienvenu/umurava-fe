'use client'

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import { 
  MagnifyingGlass, 
  CircleNotch, 
  CheckCircle, 
  WarningCircle, 
  Lightbulb, 
  CaretDown, 
  CaretUp,
  Trophy,
  User,
  ChartBar,
  Sparkle,
  TrendUp
} from "@phosphor-icons/react";

interface Job {
  _id: string;
  title: string;
  metadata?: { status: string };
}

interface ScreeningResult {
  rank: number;
  final_score: number;
  dimension_breakdown?: Record<string, number>;
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
  screened_at?: string;
  ai_unavailable?: boolean;
}

interface ScreenedCandidate {
  application_id: string;
  applicant_id: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  screening_result: ScreeningResult;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-green-100 text-green-700" :
    score >= 50 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-600";
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${color}`}>
      {score.toFixed(1)}%
    </span>
  );
}

export default function ScreeningPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [screening, setScreening] = useState(false);
  const [results, setResults] = useState<ScreenedCandidate[] | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [screened, setScreened] = useState(false);

  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/my-jobs`)
      .then((r) => ApiError.handle(r))
      .then((data) => {
        const list = (data as { data: Job[] }).data ?? [];
        setJobs(list);
        const first = list.find((j) => j.metadata?.status === "published") ?? list[0];
        if (first) setSelectedJobId(first._id);
      })
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Reset results when job changes
  useEffect(() => {
    setResults(null);
    setScreened(false);
    setError("");
  }, [selectedJobId]);

  async function handleRunScreening() {
    if (!selectedJobId) return;
    setScreening(true);
    setError("");
    setResults(null);

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/${selectedJobId}/screen`,
        { method: "POST" }
      );
      const data = await ApiError.handle(res) as { data: ScreenedCandidate[] };
      setResults(data.data ?? []);
      setScreened(true);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setScreening(false);
    }
  }

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102C26] mb-2">Screening</h1>
      <p className="text-[#6b8f85] text-sm mb-6">
        Run AI screening to evaluate and rank all eligible applicants for a job.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <WarningCircle size={18} />
          {error}
        </div>
      )}

      {/* Job picker + trigger */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 mb-6">
        <label className="text-sm font-medium text-[#102C26] mb-2 block">Select Job to Screen</label>

        {loadingJobs ? (
          <div className="flex items-center gap-2 text-sm text-[#6b8f85]">
            <CircleNotch size={16} className="animate-spin" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-[#6b8f85]">No jobs found. Create and publish a job first.</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26]"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} — {j.metadata?.status ?? "draft"}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunScreening}
              disabled={screening || !selectedJobId}
              className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 justify-center shrink-0"
            >
              {screening ? (
                <>
                  <CircleNotch size={18} className="animate-spin" />
                  AI Screening...
                </>
              ) : (
                <>
                  <MagnifyingGlass size={18} weight="bold" />
                  Run Screening
                </>
              )}
            </button>
          </div>
        )}

        {/* Info note */}
        <p className="text-xs text-[#6b8f85] mt-3">
          Screens all <strong>pending</strong> and <strong>reviewed</strong> applications.
          Re-running overwrites previous results.
        </p>
      </div>

      {/* Results */}
      {screened && results !== null && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#102C26]">
              Shortlist — {selectedJob?.title}
            </h2>
            <span className="text-sm text-[#6b8f85]">
              {results.length} candidate{results.length !== 1 ? "s" : ""} ranked
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center justify-center py-16 text-[#6b8f85] text-center">
              <MagnifyingGlass size={48} weight="duotone" className="mb-4 opacity-30" />
              <p className="text-sm">No eligible applications found for this job.</p>
              <p className="text-xs mt-1">Applications must be in pending or reviewed status.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((candidate) => {
                const sr = candidate.screening_result;
                const isExpanded = expandedId === candidate.application_id;
                const name = [candidate.first_name, candidate.last_name].filter(Boolean).join(" ")
                  || `Applicant #${candidate.applicant_id.slice(-6)}`;

                return (
                  <div key={candidate.application_id}
                    className="bg-white rounded-2xl border border-[#e8d0b0] overflow-hidden">

                    {/* Candidate row */}
                    <div className="flex items-center gap-4 p-5">
                      {/* Rank badge */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                        sr.rank === 1 ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/20" :
                        sr.rank === 2 ? "bg-gray-100 text-gray-600" :
                        sr.rank === 3 ? "bg-orange-100 text-orange-600" :
                        "bg-[#F7E7CE] text-[#102C26]"
                      }`}>
                        {sr.rank === 1 ? <Trophy size={18} weight="fill" /> : `#${sr.rank}`}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-[#102C26] text-sm">{name}</p>
                          <ScoreBadge score={sr.final_score} />
                        </div>
                        {candidate.headline && (
                          <p className="text-xs text-[#6b8f85] truncate">{candidate.headline}</p>
                        )}
                      </div>

                      {/* Score bar */}
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                        <div className="w-32 h-2 bg-[#e8d0b0] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sr.final_score >= 75 ? "bg-green-500" :
                              sr.final_score >= 50 ? "bg-amber-400" : "bg-red-400"
                            }`}
                            style={{ width: `${Math.min(sr.final_score, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#6b8f85]">{sr.final_score.toFixed(1)} / 100</span>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : candidate.application_id)}
                        className="text-xs text-[#6b8f85] hover:text-[#102C26] px-3 py-1.5 rounded-lg hover:bg-[#F7E7CE] transition-colors shrink-0 flex items-center gap-1"
                      >
                        {isExpanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                      </button>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="border-t border-[#e8d0b0] p-5 flex flex-col gap-4 bg-[#fdfaf6]">

                        {/* Dimension breakdown */}
                        {sr.dimension_breakdown && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <ChartBar size={16} weight="duotone" className="text-[#102C26]" />
                              <p className="text-xs font-semibold text-[#102C26]">Score Breakdown</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {Object.entries(sr.dimension_breakdown).map(([key, val]) => (
                                <div key={key} className="flex flex-col items-center bg-white rounded-xl border border-[#e8d0b0] p-2.5">
                                  <span className="text-base font-bold text-[#102C26]">
                                    {Math.round((val as number) * 100)}%
                                  </span>
                                  <span className="text-xs text-[#6b8f85] capitalize mt-0.5">
                                    {key.replace("_", " ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths & gaps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          <div className="bg-white border border-[#e8d0b0]/50 rounded-xl px-4 py-3 flex items-start gap-3">
                            <Lightbulb size={18} weight="fill" className="text-amber-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-[#102C26] mb-0.5">AI Recommendation</p>
                              <p className="text-xs text-[#6b8f85] leading-relaxed">{sr.recommendation}</p>
                            </div>
                          </div>
                        )}

                        {sr.screened_at && (
                          <p className="text-xs text-[#6b8f85]">
                            Screened {new Date(sr.screened_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
