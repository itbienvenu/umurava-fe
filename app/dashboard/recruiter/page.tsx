'use client'

import { useEffect, useState } from "react";
import { getRecruiterAnalytics } from "@/lib/recruiters";
import { Briefcase, ClipboardText, Star, CheckCircle, ChartLineUp, CircleNotch, Dot } from "@phosphor-icons/react";

export default function RecruiterDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await getRecruiterAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircleNotch size={48} className="animate-spin text-[#102C26]" />
      </div>
    );
  }

  const stats = [
    { label: "Total Jobs", value: analytics?.totalJobs || 0, icon: <Briefcase size={32} weight="duotone" className="text-[#102C26]" /> },
    { label: "Pending Applications", value: analytics?.pending || 0, icon: <ClipboardText size={32} weight="duotone" className="text-amber-600" /> },
    { label: "Shortlisted", value: analytics?.shortlisted || 0, icon: <Star size={32} weight="duotone" className="text-yellow-500" /> },
    { label: "Hired", value: analytics?.hired || 0, icon: <CheckCircle size={32} weight="duotone" className="text-green-600" /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102C26] mb-6">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F7E7CE]/30 flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-[#102C26]">{s.value}</p>
              <p className="text-xs font-medium text-[#6b8f85] uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#102C26] mb-4">Recent Activity</h2>
        {analytics?.history && analytics.history.length > 0 ? (
          <div className="space-y-4">
            {analytics.history.map((job: any) => (
              <div key={job._id} className="flex items-center justify-between p-4 bg-[#fcf8f2] rounded-xl border border-[#e8d0b0]/50 hover:border-[#102C26]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Briefcase size={20} className="text-[#102C26]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#102C26]">{job.title}</p>
                    <div className="flex items-center gap-2 text-xs text-[#6b8f85]">
                      <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                      <Dot size={16} />
                      <span className="capitalize">{job.metadata?.status || 'Active'}</span>
                    </div>
                  </div>
                </div>
                <button 
                   onClick={() => window.location.href = `/dashboard/recruiter/jobs/${job._id}`}
                   className="text-[#102C26] hover:bg-[#102C26] hover:text-white px-4 py-1.5 rounded-full text-xs font-bold border border-[#102C26] transition-all"
                >
                  View Job
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b8f85]">
            <ChartLineUp size={48} weight="duotone" className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No recent activity. Start by creating a job post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
