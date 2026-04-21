'use client'

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";

interface Job { _id: string; title: string; metadata?: { status: string } }
interface ScreeningResult {
  rank: number; final_score: number;
  dimension_breakdown?: Record<string, number>;
  strengths?: string[]; gaps?: string[];
  recommendation?: string; screened_at?: string;
}
interface Candidate {
  application_id: string; applicant_id: string;
  first_name?: string; last_name?: string; headline?: string;
  screening_result: ScreeningResult;
}

export default function ShortlistPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [limit, setLimit] = useState<10 | 20>(10);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  useEffect(() => {
    setCandidates(null);
    setError("");
    setExpandedId(null);
  }, [selectedJobId, limit]);

  async function fetchShortlist() {
    if (!selectedJobId) return;
    setLoading(true); setError("");
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/${selectedJobId}/shortlist?limit=${limit}`
      );
      const data = await ApiError.handle(res) as { data: Candidate[] };
      setCandidates(data.data ?? []);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  const rankStyle = (rank: number) =>
    rank === 1 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
    rank === 2 ? "bg-gray-100 text-gray-600 border-gray-200" :
    rank === 3 ? "bg-orange-100 text-orange-600 border-orange-200" :
                 "bg-[#F7E7CE] text-[#102C26] border-[#e8d0b0]";

  const scoreColor = (s: number) =>
    s >= 75 ? "text-green-700 bg-green-100" :
    s >= 50 ? "text-amber-600 bg-amber-100" : "text-red-600 bg-red-100";

  const barColor = (s: number) =>
    s >= 75 ? "bg-green-500" : s >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102C26] mb-2">Shortlist</h1>
      <p className="text-[#6b8f85] text-sm mb-6">
        View the ranked shortlist from the last screening run.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-[#102C26] mb-1.5 block">Job</label>
          {loadingJobs ? (
            <p className="text-sm text-[#6b8f85]">Loading...</p>
          ) : (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26]"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} — {j.metadata?.status ?? "draft"}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#102C26] mb-1.5 block">Show top</label>
          <div className="flex gap-2">
            {([10, 20] as const).map((n) => (
              <button key={n} onClick={() => setLimit(n)}
                className={`px-5 py-3 rounded-lg text-sm font-medium border transition-colors ${
                  limit === n
                    ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]"
                    : "border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26]"
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={fetchShortlist}
          disabled={loading || !selectedJobId}
          className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading
            ? <><span className="animate-spin inline-block">⟳</span> Loading...</>
            : "⭐ Load Shortlist"}
        </button>
      </div>

      {/* Results */}
      {candidates !== null && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#102C26]">
              Top {limit} — {selectedJob?.title}
            </h2>
            <span className="text-sm text-[#6b8f85]">
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center py-16 text-[#6b8f85]">
              <span className="text-4xl mb-3">⭐</span>
              <p className="text-sm">No shortlist yet. Run screening first.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {candidates.map((c) => {
                const sr = c.screening_result;
                const isExpanded = expandedId === c.application_id;
                const name = [c.first_name, c.last_name].filter(Boolean).join(" ")
                  || `Applicant #${c.applicant_id.slice(-6)}`;

                return (
                  <div key={c.application_id}
                    className="bg-white rounded-2xl border border-[#e8d0b0] overflow-hidden">
                    <div className="flex items-center gap-4 p-5">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${rankStyle(sr.rank)}`}>
                        #{sr.rank}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-[#102C26] text-sm">{name}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${scoreColor(sr.final_score)}`}>
                            {sr.final_score.toFixed(1)}%
                          </span>
                        </div>
                        {c.headline && (
                          <p className="text-xs text-[#6b8f85] truncate mb-2">{c.headline}</p>
                        )}
                        {/* Score bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#e8d0b0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor(sr.final_score)}`}
                              style={{ width: `${Math.min(sr.final_score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.application_id)}
                        className="text-xs text-[#6b8f85] hover:text-[#102C26] px-2 py-1 rounded-lg hover:bg-[#F7E7CE] transition-colors shrink-0"
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#e8d0b0] p-5 flex flex-col gap-4 bg-[#fdfaf6]">
                        {/* Dimension breakdown */}
                        {sr.dimension_breakdown && (
                          <div>
                            <p className="text-xs font-semibold text-[#102C26] mb-2">Score Breakdown</p>
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
                            <div className="bg-green-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-green-700 mb-1">✅ Strengths</p>
                              <ul className="text-xs text-green-700 list-disc list-inside space-y-0.5">
                                {sr.strengths.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          )}
                          {sr.gaps && sr.gaps.length > 0 && (
                            <div className="bg-red-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Gaps</p>
                              <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                                {sr.gaps.map((g, i) => <li key={i}>{g}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Recommendation */}
                        {sr.recommendation && (
                          <div className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-3">
                            <p className="text-xs font-semibold text-[#102C26] mb-1">💡 AI Recommendation</p>
                            <p className="text-xs text-[#6b8f85] leading-relaxed">{sr.recommendation}</p>
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
        </>
      )}
    </div>
  );
}
