'use client'

import { useState, useEffect } from "react";
import { getMyApplications } from "@/lib/applications";
import Link from "next/link";

const STATUSES = ["all", "pending", "reviewed", "shortlisted", "rejected", "hired"];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState("all");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        const res = await getMyApplications();
        if (res.success) {
          setApplications(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const filteredApplications = filter === "all" 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#102C26]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102C26]">My Applications</h1>
          <p className="text-[#6b8f85] text-sm">Track the status of your job applications.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                ${filter === status 
                  ? "bg-[#102C26] text-[#F7E7CE]" 
                  : "bg-white text-[#6b8f85] border border-[#e8d0b0] hover:border-[#102C26] hover:text-[#102C26]"}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm italic border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <div key={app._id} className="bg-white rounded-2xl border border-[#e8d0b0] p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#F7E7CE] rounded-2xl flex items-center justify-center text-2xl shrink-0">🏢</div>
                <div>
                  <h3 className="font-bold text-[#102C26] text-lg">{app.job.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                    <p className="text-sm font-medium text-[#4a635c]">{app.job.company.name}</p>
                    <span className="text-[#e8d0b0] md:block hidden">•</span>
                    <p className="text-xs text-[#6b8f85] uppercase tracking-wider font-bold">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {/* AI Score (if available) */}
                {app.screening_result && (
                  <div className="flex flex-col items-center md:items-end p-2 px-4 rounded-xl bg-[#fcf8f2] border border-[#e8d0b0]/50">
                    <span className="text-[10px] text-[#6b8f85] uppercase font-bold tracking-widest">Resonance Matching</span>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-[#102C26]">{Math.round(app.screening_result.final_score)}%</span>
                       <span className="text-[10px] bg-[#102C26] text-[#F7E7CE] px-1.5 py-0.5 rounded font-bold">RANK #{app.screening_result.rank}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#fcf8f2]">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                    ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      app.status === 'hired' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      app.status === 'shortlisted' ? 'bg-[#102C26] text-[#F7E7CE]' :
                      'bg-blue-100 text-blue-700'}`}
                  >
                    {app.status}
                  </span>
                  <Link 
                    href={`/dashboard/applicant/applications/${app._id}`}
                    className="text-[#102C26] hover:underline text-sm font-bold whitespace-nowrap"
                  >
                    View Result →
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-[#e8d0b0] p-16 flex flex-col items-center justify-center text-[#6b8f85] text-center shadow-sm">
            <div className="text-5xl mb-6 grayscale opacity-50">📂</div>
            <h3 className="text-xl font-bold text-[#102C26]">No applications found</h3>
            <p className="text-sm mt-2 mb-8 max-w-xs mx-auto">
              {filter === 'all' 
                ? "You haven't applied to any jobs yet. Your journey starts with a single application!" 
                : `You don't have any applications currently marked as "${filter}".`}
            </p>
            <Link 
              href="/dashboard/applicant/jobs"
              className="bg-[#102C26] text-[#F7E7CE] px-10 py-3 rounded-full text-sm font-bold hover:bg-[#1a4a3a] transition-all hover:scale-[1.02]"
            >
              Discover Available Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
