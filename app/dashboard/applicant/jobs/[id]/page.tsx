'use client'

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getJobById } from "@/lib/jobs";
import { submitApplication } from "@/lib/applications";
import { Job } from "@/types/job";
import Link from "next/link";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Application States
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        const response = await getJobById(id);
        if (response.success) {
          setJob(response.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setApplicationError(null);
      const res = await submitApplication(id, { coverLetter });
      if (res.success) {
        setApplicationSuccess(true);
        setTimeout(() => {
          setShowApplyModal(false);
        }, 2000);
      }
    } catch (err: any) {
      setApplicationError(err.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#102C26]"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white border border-[#e8d0b0] p-12 rounded-3xl text-center shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#102C26] mb-2">Job Not Found</h2>
          <p className="text-[#6b8f85] mb-8">{error || "The job you are looking for does not exist or has been removed."}</p>
          <Link href="/dashboard/applicant/jobs" className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full font-bold hover:bg-[#1a4a3a] transition-colors">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header / Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/dashboard/applicant/jobs" className="text-[#6b8f85] hover:text-[#102C26] transition-colors">Jobs</Link>
        <span className="text-[#e8d0b0]">/</span>
        <span className="text-[#102C26] font-medium">{job.title}</span>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Section */}
          <section className="bg-white rounded-3xl border border-[#e8d0b0] p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-[#F7E7CE] rounded-2xl flex items-center justify-center text-3xl shrink-0">🏢</div>
                <div>
                  <h1 className="text-3xl font-bold text-[#102C26] mb-2">{job.title}</h1>
                  <p className="text-[#6b8f85] flex items-center gap-2">
                    <span className="font-bold text-[#102C26]">{job.company.name}</span>
                    <span>•</span>
                    <span>{job.company.location.city}, {job.company.location.country}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full font-bold hover:bg-[#1a4a3a] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Apply for this position
                </button>
                <p className="text-[10px] text-center text-[#6b8f85] uppercase tracking-wider font-bold">
                  Posted {new Date(job.metadata.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-[#fcf8f2]">
              <div className="bg-[#fcf8f2] px-4 py-2 rounded-xl text-xs font-semibold text-[#102C26]">
                💼 {job.employment_type.replace('_', ' ').toUpperCase()}
              </div>
              <div className="bg-[#fcf8f2] px-4 py-2 rounded-xl text-xs font-semibold text-[#102C26]">
                📈 {job.seniority_level.toUpperCase()} LEVEL
              </div>
              <div className="bg-[#fcf8f2] px-4 py-2 rounded-xl text-xs font-semibold text-[#102C26]">
                🌍 {job.travel_required ? 'TRAVEL REQUIRED' : 'NO TRAVEL'}
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white rounded-3xl border border-[#e8d0b0] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#102C26] mb-6">About the Role</h2>
            <div className="prose prose-slate max-w-none text-[#4a635c] leading-relaxed">
              <p className="mb-4">{job.description.summary}</p>
              <div className="whitespace-pre-wrap">{job.description.raw}</div>
            </div>
          </section>

          {/* Responsibilities */}
          {(job.responsibilities && job.responsibilities.length > 0) && (
            <section className="bg-white rounded-3xl border border-[#e8d0b0] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#102C26] mb-6">Key Responsibilities</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex gap-3 text-[#4a635c] text-sm">
                    <span className="text-[#102C26] mt-1">✓</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements */}
          <section className="bg-white rounded-3xl border border-[#e8d0b0] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#102C26] mb-8">Requirements</h2>
            
            <div className="space-y-8">
              {/* Experience */}
              <div>
                <h3 className="text-sm font-bold text-[#102C26] uppercase tracking-wider mb-4">Experience</h3>
                <div className="bg-[#fcf8f2] p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-[#4a635c]">Minimum Years Required</span>
                  <span className="font-bold text-[#102C26] text-lg">{job.requirements.experience.min_years}+ years</span>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-sm font-bold text-[#102C26] uppercase tracking-wider mb-4">Education</h3>
                <div className="space-y-2">
                  {job.requirements.education?.map((edu, i) => (
                    <div key={i} className="bg-[#fcf8f2] p-4 rounded-2xl">
                      <p className="font-bold text-[#102C26] capitalize">{edu.level}'s Degree</p>
                      <p className="text-xs text-[#6b8f85]">{edu.fields?.join(', ')}</p>
                    </div>
                  ))}
                  {(!job.requirements.education || job.requirements.education.length === 0) && (
                    <p className="text-sm text-[#6b8f85]">No specific education requirements listed.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Skills & Sidebar */}
        <div className="space-y-8">
          
          {/* Skills Required */}
          <section className="bg-white rounded-3xl border border-[#e8d0b0] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#102C26] mb-6">Technical Skills</h2>
            <div className="space-y-4">
              {job.skills?.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#102C26] font-medium">{skill.name}</span>
                    <span className="text-[10px] bg-[#102C26]/5 text-[#102C26] px-2 py-0.5 rounded-md font-bold">{skill.level.toUpperCase()}</span>
                  </div>
                  <div className="w-full bg-[#fcf8f2] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#102C26] h-full rounded-full transition-all duration-1000" 
                      style={{ width: skill.level === 'advanced' ? '90%' : skill.level === 'intermediate' ? '60%' : '30%' }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!job.skills || job.skills.length === 0) && <p className="text-sm text-[#6b8f85]">No technical skills listed.</p>}
            </div>
          </section>

          {/* Soft Skills */}
          <section className="bg-white rounded-3xl border border-[#e8d0b0] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#102C26] mb-6">Soft Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.soft_skills?.map((skill) => (
                <span key={skill.name} className="bg-[#fcf8f2] text-[#102C26] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#e8d0b0]/30">
                  {skill.name}
                </span>
              ))}
              {(!job.soft_skills || job.soft_skills.length === 0) && <p className="text-sm text-[#6b8f85]">No soft skills listed.</p>}
            </div>
          </section>

          {/* Meta Info Sidebar */}
           <section className="bg-[#102C26] rounded-3xl p-8 text-[#F7E7CE]">
            <h2 className="text-lg font-bold mb-6">Quick Overview</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-[#F7E7CE]/60 uppercase tracking-widest mb-1 italic">Role Primary Domain</p>
                <p className="font-bold text-lg capitalize">{job.domain.primary.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#F7E7CE]/60 uppercase tracking-widest mb-1 italic">Secondary Focus</p>
                <p className="text-sm">{job.domain.secondary?.join(', ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#F7E7CE]/60 uppercase tracking-widest mb-1 italic">Preferred Languages</p>
                <p className="text-sm">{job.languages?.join(', ') || 'English'}</p>
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-[#F7E7CE]/10">
              <p className="text-xs opacity-70 mb-4 font-light">Interested in this role? Start your resonance matching profile now.</p>
              <button 
                onClick={() => setShowApplyModal(true)}
                className="w-full bg-[#F7E7CE] text-[#102C26] py-3 rounded-full font-bold hover:bg-white transition-colors"
                disabled={applicationSuccess}
              >
                {applicationSuccess ? "Applied Successfully" : "Apply Now"}
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#102C26]">Apply for {job.title}</h2>
                <button onClick={() => setShowApplyModal(false)} className="text-[#6b8f85] hover:text-[#102C26] text-2xl">×</button>
              </div>

              {applicationSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">✓</div>
                  <h3 className="text-lg font-bold text-[#102C26] mb-2">Application Submitted!</h3>
                  <p className="text-sm text-[#6b8f85]">Our AI screening engine is now evaluating your profile. You can check the status in your dashboard.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-[#fcf8f2] p-4 rounded-2xl flex items-center gap-4">
                    <div className="text-2xl">📄</div>
                    <div className="text-xs text-[#6b8f85]">
                      Your saved CV will be automatically included with this application for AI screening.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#6b8f85] uppercase tracking-wider">Cover Letter (Optional)</label>
                    <textarea 
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you are a great fit for this role..."
                      className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl p-4 text-sm focus:outline-none focus:border-[#102C26] transition-colors h-40 resize-none font-sans"
                    />
                  </div>

                  {applicationError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100 italic">
                      {applicationError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 px-6 py-3 rounded-full text-sm font-bold text-[#102C26] border border-[#e8d0b0] hover:bg-[#fcf8f2] transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1 bg-[#102C26] text-[#F7E7CE] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#1a4a3a] transition-all disabled:opacity-50"
                    >
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
