'use client'

import { useState, useEffect } from "react";
import { getPublishedJobs } from "@/lib/jobs";
import { Job } from "@/types/job";
import Link from "next/link";
import { MagnifyingGlass, Buildings, Briefcase, ChartLineUp, MapPin, Info, CircleNotch } from "@phosphor-icons/react";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const response = await getPublishedJobs();
        if (response.success) {
          setJobs(response.data);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching jobs.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    (job.company?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    job.skills?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#102C26]">Available Jobs</h1>
        <p className="text-[#6b8f85] text-sm">Find your next career opportunity.</p>
      </header>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative group">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b8f85] group-focus-within:text-[#102C26] transition-colors" />
          <input
            type="text"
            placeholder="Search job titles, keywords, or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 md:w-40 bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] cursor-pointer">
            <option>Job Type</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Remote</option>
          </select>
          <select className="flex-1 md:w-40 bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] cursor-pointer">
            <option>Seniority</option>
            <option>Entry</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 relative">
          <Briefcase size={40} weight="duotone" className="animate-pulse text-[#102C26] opacity-20 absolute" />
          <CircleNotch size={56} className="animate-spin text-[#102C26]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <Info size={20} />
          {error}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#e8d0b0]">
          <p className="text-[#6b8f85]">No jobs found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl border border-[#e8d0b0] p-6 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F7E7CE] rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Buildings size={24} weight="duotone" className="text-[#102C26]" />
                </div>
                <span className="bg-[#102C26]/5 text-[#102C26] px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  {job.employment_type.replaceAll('_', ' ')}
                </span>
              </div>
              
              <h3 className="font-bold text-[#102C26] text-lg mb-1">{job.title}</h3>
              <p className="text-[#6b8f85] text-sm mb-4">
                {job.company?.name ?? 'Unknown Company'} • {job.company?.location?.city ?? 'Unknown City'}, {job.company?.location?.country ?? 'Unknown Country'}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills?.slice(0, 4).map(skill => (
                  <span key={skill.name} className="bg-white border border-[#e8d0b0] text-[#6b8f85] px-2.5 py-1 rounded-lg text-[10px] font-medium">
                    {skill.name}
                  </span>
                ))}
                {(job.skills?.length ?? 0) > 4 && (
                  <span className="text-[#6b8f85] text-[10px] font-medium self-center">+{job.skills!.length - 4} more</span>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#fcf8f2]">
                <span className="text-sm font-bold text-[#102C26]">
                  {job.seniority_level.replaceAll('_', ' ').toUpperCase()} LEVEL
                </span>
                <Link 
                  href={`/dashboard/applicant/jobs/${job._id}`}
                  className="bg-[#102C26] text-[#F7E7CE] px-6 py-2 rounded-full text-xs font-bold hover:bg-[#1a4a3a] transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

