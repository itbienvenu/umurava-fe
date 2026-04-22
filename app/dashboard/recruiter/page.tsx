'use client'

import { Briefcase, ClipboardText, Star, CheckCircle, ChartLineUp } from "@phosphor-icons/react";

export default function RecruiterDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102C26] mb-6">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Jobs", value: "0", icon: <Briefcase size={32} weight="duotone" className="text-[#102C26]" /> },
          { label: "Pending Applications", value: "0", icon: <ClipboardText size={32} weight="duotone" className="text-amber-600" /> },
          { label: "Shortlisted", value: "0", icon: <Star size={32} weight="duotone" className="text-yellow-500" /> },
          { label: "Hired", value: "0", icon: <CheckCircle size={32} weight="duotone" className="text-green-600" /> },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex items-center gap-4"
          >
            {s.icon}
            <div>
              <p className="text-3xl font-bold text-[#102C26]">{s.value}</p>
              <p className="text-sm text-[#6b8f85]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6">
        <h2 className="text-lg font-semibold text-[#102C26] mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 text-[#6b8f85]">
          <ChartLineUp size={48} weight="duotone" className="mb-3 opacity-30" />
          <p className="text-sm">No recent activity. Start by creating a job post!</p>
        </div>
      </div>
    </div>
  );
}
