'use client'

import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { getApplicantAnalytics } from "@/lib/applicants";
import { getPublishedJobs } from "@/lib/jobs";
import { Job } from "@/types/job";
import { HandWaving, ClipboardText, ArrowRight, CircleNotch, Briefcase, Calendar, Buildings, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import Link from "next/link";

export default function ApplicantDashboard() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);

    async function fetchData() {
      try {
        const [anaRes, jobsRes] = await Promise.all([
          getApplicantAnalytics(),
          getPublishedJobs()
        ]);
        
        if (anaRes.success) setAnalytics(anaRes.data);
        if (jobsRes.success) setJobs(jobsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user || loading) {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
          <CircleNotch size={48} className="animate-spin text-[#102C26]" />
        </div>
      );
    }
    return null;
  }

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    (job.company?.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  ).slice(0, 6); // Show top 6 on dashboard

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-[#102C26] rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#F7E7CE] flex items-center gap-3">
              Hello, {user.name.split(' ')[0]} <HandWaving size={36} weight="duotone" className="text-amber-500 animate-bounce" />
            </h1>
            <p className="text-[#a8c5be] text-sm max-w-md">
              Ready for your next challenge? We found some opportunities that match your profile.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex flex-col items-center">
                <span className="text-2xl font-bold text-[#F7E7CE]">{analytics?.totalApplications || 0}</span>
                <span className="text-[10px] uppercase font-bold text-[#a8c5be] tracking-widest">Applications</span>
             </div>
             <div className="bg-[#F7E7CE] px-6 py-4 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-bold text-[#102C26]">{jobs.length}</span>
                <span className="text-[10px] uppercase font-bold text-[#102C26]/60 tracking-widest">New Jobs</span>
             </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F7E7CE]/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Jobs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#102C26]">Available Opportunities</h2>
            <Link href="/dashboard/applicant/jobs" className="text-xs font-bold text-[#102C26] flex items-center gap-1 hover:underline">
              Browse All Jobs <ArrowRight size={14} />
            </Link>
          </div>

          {/* Search Bar on Dashboard */}
          <div className="relative group">
            <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b8f85] group-focus-within:text-[#102C26] transition-colors" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#e8d0b0] rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-2xl border border-[#e8d0b0] p-5 hover:shadow-lg transition-all group border-b-4 border-b-transparent hover:border-b-[#102C26]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-[#fcf8f2] rounded-xl flex items-center justify-center group-hover:bg-[#F7E7CE] transition-colors">
                      <Buildings size={20} className="text-[#102C26]" />
                    </div>
                    <span className="bg-[#102C26]/5 text-[#102C26] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">
                      {job.employment_type.replaceAll('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-[#102C26] text-base mb-1 line-clamp-1">{job.title}</h3>
                  <p className="text-[#6b8f85] text-xs mb-4 flex items-center gap-1">
                    <MapPin size={12} />
                    {job.company?.name ?? 'Company Hidden'} • {job.company?.location?.city ?? 'Remote'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#fcf8f2]">
                    <span className="text-[10px] font-bold text-[#6b8f85] uppercase">
                      {job.seniority_level.replace('_', ' ')}
                    </span>
                    <Link 
                      href={`/dashboard/applicant/jobs/${job._id}`}
                      className="text-[#102C26] text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      Apply Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e8d0b0] border-dashed">
                <p className="text-sm text-[#6b8f85]">No matching jobs found at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Stats / Recent activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#102C26]">My Status</h2>
          
          <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <ClipboardText size={24} weight="duotone" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#102C26]">Active Applications</p>
                <p className="text-xs text-[#6b8f85]">{analytics?.totalApplications || 0} applications sent</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-[#6b8f85] uppercase tracking-wider">Recent Activity</p>
              {analytics?.recentApplications?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentApplications.slice(0, 3).map((app: any) => (
                    <div key={app._id} className="flex items-center gap-3 p-2 hover:bg-[#fcf8f2] rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#e8d0b0] flex items-center justify-center shrink-0">
                        <Briefcase size={16} className="text-[#102C26]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#102C26] truncate">{app.job?.title}</p>
                        <span className={`text-[9px] font-bold uppercase ${app.status === 'shortlisted' ? 'text-green-600' : 'text-amber-600'}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6b8f85] italic">No recent applications found.</p>
              )}
            </div>

            <Link 
              href="/dashboard/applicant/applications"
              className="w-full bg-[#102C26] text-[#F7E7CE] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1a4a3a] transition-all"
            >
              Manage Applications
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#102C26] to-[#1a4a3a] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold mb-2">Build your profile</h3>
               <p className="text-xs text-[#a8c5be] mb-4">A complete profile increases your chances of being noticed by recruiters.</p>
               <Link href="/dashboard/applicant/profile" className="text-xs font-bold bg-[#F7E7CE] text-[#102C26] px-4 py-2 rounded-lg inline-block shadow-md">
                 Update Profile
               </Link>
             </div>
             <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
