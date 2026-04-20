'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearTokens } from "@/lib/auth";

export default function ApplicantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (u.role !== "applicant") { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  function handleLogout() {
    clearTokens();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE] font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-4 bg-[#102C26] text-[#F7E7CE]">
        <span className="font-bold text-xl tracking-tight">🍎 AppleOfEve</span>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">Hi, {user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm border border-[#F7E7CE] px-4 py-1.5 rounded-full hover:bg-[#1a4a3a] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-10 py-10">
        {/* Welcome banner */}
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 mb-8">
          <h1 className="text-2xl font-bold text-[#102C26] mb-1">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-[#6b8f85] text-sm">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Applications Sent", value: "0" },
            { label: "Interviews Scheduled", value: "0" },
            { label: "Offers Received", value: "0" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-1"
            >
              <span className="text-3xl font-bold text-[#102C26]">{s.value}</span>
              <span className="text-sm text-[#6b8f85]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Recent activity placeholder */}
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8">
          <h2 className="text-lg font-semibold text-[#102C26] mb-4">Recent Applications</h2>
          <div className="flex flex-col items-center justify-center py-12 text-[#6b8f85]">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-sm">No applications yet. Start exploring jobs!</p>
            <button className="mt-4 bg-[#102C26] text-[#F7E7CE] px-6 py-2 rounded-full text-sm font-medium hover:bg-[#1a4a3a] transition-colors">
              Browse Jobs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
