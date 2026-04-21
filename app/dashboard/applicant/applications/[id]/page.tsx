'use client'

import { useState, useEffect, use } from "react";
import { getApplicationById } from "@/lib/applications";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await getApplicationById(id);
        if (res.success) {
          setApplication(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load application details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#102C26]"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 shadow-sm">
        <div className="bg-white border border-[#e8d0b0] p-12 rounded-3xl text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#102C26] mb-2">Application Not Found</h2>
          <p className="text-[#6b8f85] mb-8">{error || "The application you are looking for does not exist."}</p>
          <Link href="/dashboard/applicant/applications" className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full font-bold">
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const { screening_result } = application;
  const breakdown = screening_result?.dimension_breakdown || {};

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header / Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/dashboard/applicant/applications" className="text-[#6b8f85] hover:text-[#102C26] transition-colors">Applications</Link>
        <span className="text-[#e8d0b0]">/</span>
        <span className="text-[#102C26] font-medium">{application.job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Resonance & AI Result */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Score Section */}
          <section className="bg-white rounded-[2rem] border border-[#e8d0b0] p-8 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                    ${application.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      application.status === 'hired' ? 'bg-green-100 text-green-700' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      application.status === 'shortlisted' ? 'bg-[#102C26] text-[#F7E7CE]' :
                      'bg-blue-100 text-blue-700'}`}
                  >
                    {application.status}
                </span>
             </div>

             <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="relative w-48 h-48 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" stroke="#fcf8f2" strokeWidth="8"
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" stroke="#102C26" strokeWidth="8"
                      strokeDasharray={`${Math.round(screening_result?.final_score * 2.82)}, 282`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-[#102C26]">{Math.round(screening_result?.final_score)}%</span>
                    <span className="text-[10px] font-bold text-[#6b8f85] uppercase tracking-widest">Match Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h1 className="text-3xl font-black text-[#102C26]">{application.job.title}</h1>
                  <p className="text-[#6b8f85] font-medium">{application.job.company.name} • Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
                  <div className="inline-block bg-[#102C26] text-[#F7E7CE] px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                    Ranked #{screening_result?.rank}
                  </div>
                  <p className="text-sm text-[#4a635c] italic opacity-80 mt-4 leading-relaxed">
                    "{screening_result?.recommendation}"
                  </p>
                </div>
             </div>
          </section>

          {/* AI Breakdown */}
          <section className="bg-white rounded-[2rem] border border-[#e8d0b0] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#102C26] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#F7E7CE] flex items-center justify-center text-sm">📊</span>
              Dimensions Breakdown
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(breakdown).map(([key, value]: [string, any]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#102C26] font-medium capitalize">{key.replace('_', ' ')}</span>
                    <span className="font-bold text-[#102C26]">{Math.round(value * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#fcf8f2] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#102C26] h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="bg-green-50/50 rounded-[2rem] border border-green-100 p-8 shadow-sm">
                <h3 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">💪</span>
                  Key Strengths
                </h3>
                <ul className="space-y-4">
                  {screening_result?.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-green-900 leading-relaxed font-medium">
                      <span className="text-green-500 mt-1">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
             </section>

             <section className="bg-red-50/50 rounded-[2rem] border border-red-100 p-8 shadow-sm">
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">🔍</span>
                   Identified Gaps
                </h3>
                <ul className="space-y-4">
                  {screening_result?.gaps?.map((g: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-red-900 leading-relaxed font-medium">
                      <span className="text-red-500 mt-1">!</span>
                      {g}
                    </li>
                  ))}
                </ul>
             </section>
          </div>
        </div>

        {/* Right Column: Original Job Info & Cover Letter */}
        <div className="space-y-8">
           <section className="bg-[#102C26] rounded-[2rem] p-8 text-[#F7E7CE] shadow-xl">
              <h2 className="text-lg font-bold mb-6 italic underline decoration-[#F7E7CE]/30 underline-offset-8">Cover Letter Snapshot</h2>
              <p className="text-sm leading-relaxed opacity-90 font-light whitespace-pre-wrap">
                {application.coverLetter || "You did not include a cover letter with this application."}
              </p>
           </section>

           <section className="bg-white rounded-[2rem] border border-[#e8d0b0] p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#102C26] mb-6">Original Job Posting</h2>
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#F7E7CE] rounded-xl flex items-center justify-center text-xl shrink-0">🏢</div>
                    <div>
                       <p className="font-bold text-[#102C26] leading-tight">{application.job.title}</p>
                       <p className="text-xs text-[#6b8f85] mt-1">{application.job.seniority_level.toUpperCase()} • {application.job.employment_type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                 </div>
                 <p className="text-sm text-[#6b8f85] leading-relaxed line-clamp-3">
                    {application.job.description.summary}
                 </p>
                 <Link 
                    href={`/dashboard/applicant/jobs/${application.job._id}`}
                    className="block text-center border border-[#102C26] text-[#102C26] py-3 rounded-full text-sm font-bold hover:bg-[#102C26] hover:text-[#F7E7CE] transition-all"
                 >
                    View Original Job
                 </Link>
              </div>
           </section>
        </div>

      </div>
    </div>
  );
}
