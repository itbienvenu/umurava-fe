export default function RecruiterDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102C26] mb-6">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Jobs", value: "0", icon: "💼" },
          { label: "Pending Applications", value: "0", icon: "📋" },
          { label: "Shortlisted", value: "0", icon: "⭐" },
          { label: "Hired", value: "0", icon: "✅" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex items-center gap-4"
          >
            <span className="text-3xl">{s.icon}</span>
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
          <span className="text-4xl mb-3">📊</span>
          <p className="text-sm">No recent activity. Start by creating a job post!</p>
        </div>
      </div>
    </div>
  );
}
