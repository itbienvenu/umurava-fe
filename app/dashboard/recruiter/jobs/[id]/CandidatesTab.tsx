'use client'

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import { API_BASE_URL } from "@/lib/api-config";
import {
  ClipboardText,
  CheckCircle,
  WarningCircle,
  Lightbulb,
  CaretDown,
  CaretUp,
  CircleNotch,
  User,
  ChartBar,
  Sparkle,
  Star,
  X,
  IdentificationBadge,
  EnvelopeSimple,
  MapPin,
  Briefcase,
  GraduationCap,
  Certificate,
  ProjectorScreen,
  Clock,
  Link,
  CurrencyDollar,
  Brain,
  Globe,
  GenderIntersex,
  Calendar,
  MagnifyingGlass
} from "@phosphor-icons/react";

interface Application {
  _id: string;
  applicantId: string;
  jobId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  profile?: any;
  screening_result?: {
    rank?: number;
    final_score?: number;
    dimension_breakdown?: Record<string, number>;
    strengths?: string[];
    gaps?: string[];
    recommendation?: string;
    screened_at?: string;
    ai_unavailable?: boolean;
  };
}

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"] as const;
type AppStatus = typeof STATUSES[number];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  reviewed: "bg-blue-100 text-blue-700",
  shortlisted: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-600",
  hired: "bg-green-100 text-green-700",
};

interface CandidatesTabProps {
  jobId: string;
  filterStatus?: AppStatus | "all";
}

export default function CandidatesTab({ jobId, filterStatus = "all" }: CandidatesTabProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    authFetch(`${API_BASE_URL}/api/v1/applications/job/${jobId}`)
      .then((r) => ApiError.handle(r))
      .then((data) => setApplications((data as { data: Application[] }).data ?? []))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function handleStatusUpdate(appId: string, newStatus: AppStatus) {
    setUpdatingId(appId);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/v1/applications/${appId}/status`,
        { method: "PATCH", body: JSON.stringify({ status: newStatus }) }
      );
      await ApiError.handle(res);
      setApplications((prev) =>
        prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filterStatus === "all"
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#6b8f85]">
        <CircleNotch size={48} className="animate-spin mb-4" />
        <p className="text-sm">Loading candidates...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center justify-center py-16 text-[#6b8f85] text-center">
        {filterStatus === "shortlisted" ? (
          <Star size={48} weight="duotone" className="mb-4 opacity-30" />
        ) : (
          <ClipboardText size={48} weight="duotone" className="mb-4 opacity-30" />
        )}
        <p className="text-sm font-medium">
          {filterStatus === "all"
            ? "No applications yet for this job."
            : `No candidates currently in ${filterStatus} status.`}
        </p>
        {filterStatus === "shortlisted" && applications.length > 0 && (
          <p className="text-xs mt-2 text-[#8aada6]">Screen applications to move candidates to the shortlist.</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-2 flex items-center gap-2">
          <WarningCircle size={18} />
          {error}
        </div>
      )}

      {filtered.map((app) => {
        const isExpanded = expandedId === app._id;
        const sr = app.screening_result;

        return (
          <div key={app._id} className="bg-white rounded-2xl border border-[#e8d0b0] overflow-hidden hover:border-[#102C26]/30 transition-colors shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#102C26]/5 flex items-center justify-center text-[#102C26] shrink-0 border border-[#102C26]/10">
                  <User size={24} weight="duotone" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#102C26] truncate">
                      {app.first_name ? `${app.first_name} ${app.last_name}` : `Candidate #${app.applicantId.slice(-6).toUpperCase()}`}
                    </p>
                    <button
                      onClick={() => setSelectedProfile(app.profile || { first_name: app.first_name, last_name: app.last_name, headline: app.headline })}
                      className="text-[10px] bg-[#102C26]/5 text-[#102C26] px-2 py-0.5 rounded-md font-bold hover:bg-[#102C26]/10 transition-colors flex items-center gap-1"
                    >
                      <IdentificationBadge size={12} weight="bold" />
                      VIEW PROFILE
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-[#6b8f85] font-medium uppercase tracking-wider">
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {sr?.final_score !== undefined && (
                      <span className="flex items-center gap-1 bg-[#102C26] text-[#F7E7CE] text-[10px] px-2 py-0.5 rounded-full font-bold">
                        <Star size={10} weight="fill" className="text-amber-400" />
                        {sr.final_score.toFixed(0)}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending} border border-current opacity-80`}>
                  {app.status}
                </span>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F7E7CE]/30 text-[#102C26] hover:bg-[#F7E7CE] transition-all"
                >
                  {isExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-[#e8d0b0]/50 p-5 bg-[#F7E7CE]/5 flex flex-col gap-5 animate-in slide-in-from-top-2 duration-300">

                {/* Score breakdown if available */}
                {sr?.dimension_breakdown && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ChartBar size={16} weight="fill" className="text-[#102C26]" />
                      <p className="text-xs font-bold text-[#102C26] uppercase tracking-wider">Match Breakdown</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {Object.entries(sr.dimension_breakdown).map(([key, val]) => (
                        <div key={key} className="bg-white border border-[#e8d0b0] rounded-xl p-3 flex flex-col items-center shadow-sm">
                          <span className="text-base font-black text-[#102C26]">
                            {Math.round((val as number) * 100)}%
                          </span>
                          <span className="text-[10px] text-[#6b8f85] uppercase font-bold mt-1 text-center leading-tight">
                            {key.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover letter */}
                {app.coverLetter && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardText size={16} weight="fill" className="text-[#102C26]" />
                      <p className="text-xs font-bold text-[#102C26] uppercase tracking-wider">Cover Letter / Intro</p>
                    </div>
                    <div className="text-sm text-[#4a6b63] leading-relaxed bg-white border border-[#e8d0b0] rounded-xl p-4 shadow-sm whitespace-pre-wrap">
                      {app.coverLetter}
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {sr && !sr.ai_unavailable && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sr.strengths && sr.strengths.length > 0 && (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-green-700">
                          <Sparkle size={16} weight="fill" />
                          <p className="text-xs font-bold uppercase tracking-wider">Top Strengths</p>
                        </div>
                        <ul className="space-y-2">
                          {sr.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-green-800">
                              <CheckCircle size={14} weight="bold" className="mt-0.5 shrink-0 opacity-60" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {sr.gaps && sr.gaps.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-red-600">
                          <MagnifyingGlass size={16} weight="fill" />
                          <p className="text-xs font-bold uppercase tracking-wider">Identified Gaps</p>
                        </div>
                        <ul className="space-y-2">
                          {sr.gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-red-800">
                              <WarningCircle size={14} weight="bold" className="mt-0.5 shrink-0 opacity-60" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {sr?.recommendation && (
                  <div className="bg-[#102C26] text-[#F7E7CE] rounded-xl p-4 flex gap-3 shadow-lg">
                    <Lightbulb size={20} weight="fill" className="text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">AI Recommendation</p>
                      <p className="text-sm font-medium leading-relaxed">{sr.recommendation}</p>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div className="pt-4 border-t border-[#e8d0b0]">
                  <p className="text-[10px] font-bold text-[#102C26] uppercase tracking-widest mb-3">Update Candidate Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={app.status === s || updatingId === app._id}
                        onClick={() => handleStatusUpdate(app._id, s)}
                        className={`text-[10px] px-4 py-2 rounded-xl font-bold border transition-all uppercase tracking-wider disabled:cursor-not-allowed ${app.status === s
                          ? `${STATUS_STYLES[s]} border-transparent shadow-md scale-105`
                          : "bg-white border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26] hover:shadow-sm"
                          } disabled:opacity-40`}
                      >
                        {updatingId === app._id && app.status !== s ? (
                          <CircleNotch size={12} className="animate-spin" />
                        ) : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Profile Modal Overlay */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102C26]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#FDF8F0] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-[#e8d0b0] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="p-6 bg-white border-b border-[#e8d0b0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#102C26] flex items-center justify-center text-[#F7E7CE] shadow-lg">
                  <User size={32} weight="duotone" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#102C26]">
                    {selectedProfile.first_name} {selectedProfile.last_name}
                  </h2>
                  <p className="text-sm font-medium text-[#6b8f85]">{selectedProfile.headline || "Applicant Profile"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">

              {/* Top Row: Basic Info & Social */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#e8d0b0] shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-[#102C26]">
                      <IdentificationBadge size={20} weight="fill" />
                      <h3 className="text-xs font-black uppercase tracking-widest">About / Bio</h3>
                    </div>
                    <p className="text-sm text-[#4a6b63] leading-relaxed">
                      {selectedProfile.bio || "No biography provided."}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-[#6b8f85]" />
                        <span className="text-xs font-bold text-[#102C26]">{selectedProfile.location || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <EnvelopeSimple size={18} className="text-[#6b8f85]" />
                        <span className="text-xs font-bold text-[#102C26]">{selectedProfile.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <GenderIntersex size={18} className="text-[#6b8f85]" />
                        <span className="text-xs font-bold text-[#102C26] capitalize">{selectedProfile.gender || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe size={18} className="text-[#6b8f85]" />
                        <span className="text-xs font-bold text-[#102C26]">{selectedProfile.nationality || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-[#102C26] rounded-2xl p-5 text-[#F7E7CE] shadow-lg">
                    <div className="flex items-center gap-2 mb-4 opacity-70">
                      <Clock size={18} weight="fill" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Availability</h3>
                    </div>
                    <p className="text-sm font-bold mb-1">{selectedProfile.availability?.status || "Open to Opportunities"}</p>
                    <p className="text-xs opacity-60 mb-4">{selectedProfile.availability?.type || "Full-time"}</p>

                    <div className="flex flex-col gap-2 mt-2">
                      {selectedProfile.social_links?.linkedin && (
                        <a href={selectedProfile.social_links.linkedin} target="_blank" className="flex items-center gap-2 text-xs hover:text-white transition-colors">
                          <Link size={14} /> LinkedIn Profile
                        </a>
                      )}
                      {selectedProfile.social_links?.github && (
                        <a href={selectedProfile.social_links.github} target="_blank" className="flex items-center gap-2 text-xs hover:text-white transition-colors">
                          <Link size={14} /> GitHub Profile
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#e8d0b0] shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-[#102C26]">
                      <CurrencyDollar size={18} weight="fill" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Preferences</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-bold text-[#102C26]">{selectedProfile.preferences?.job_type || "Remote"}</p>
                      <p className="text-[10px] text-[#6b8f85]">Expected: {selectedProfile.preferences?.expected_salary?.min || 0} - {selectedProfile.preferences?.expected_salary?.max || 0} {selectedProfile.preferences?.expected_salary?.currency || "USD"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Expertise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-[#e8d0b0] shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[#102C26]">
                    <Brain size={20} weight="fill" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Skills & Languages</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProfile.skills?.map((s: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-[#102C26]/5 text-[#102C26] text-[10px] font-bold rounded-full border border-[#102C26]/10">
                        {s.name} • {s.level} ({s.years_of_experience}y)
                      </span>
                    )) || <p className="text-xs text-[#6b8f85]">No skills listed.</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.languages?.map((l: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                        {l.name} • {l.proficiency}
                      </span>
                    )) || <p className="text-xs text-[#6b8f85]">No languages listed.</p>}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e8d0b0] shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[#102C26]">
                    <Star size={20} weight="fill" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Areas of Expertise</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedProfile.area_of_expertise?.map((e: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-[#102C26]">{e.name}</span>
                        <span className="text-[10px] text-[#6b8f85] font-black uppercase">{e.experience_years} Years</span>
                      </div>
                    )) || <p className="text-xs text-[#6b8f85]">N/A</p>}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-[#102C26]">
                  <Briefcase size={20} weight="fill" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Professional Experience</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {selectedProfile.experience?.map((exp: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-[#e8d0b0] shadow-sm flex flex-col gap-2 relative overflow-hidden">
                      {exp.is_current && <span className="absolute top-0 right-0 bg-[#102C26] text-[#F7E7CE] text-[8px] px-3 py-1 font-black uppercase rounded-bl-xl">Current Role</span>}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-black text-[#102C26]">{exp.role}</h4>
                          <p className="text-xs font-bold text-[#6b8f85]">{exp.company} • {exp.location}</p>
                        </div>
                        <p className="text-[10px] font-black text-[#102C26] bg-[#F7E7CE] px-2 py-1 rounded-md">
                          {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                        </p>
                      </div>
                      <p className="text-xs text-[#4a6b63] mt-2 line-clamp-3">{exp.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.technologies?.map((t: string, i: number) => (
                          <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                  )) || <p className="text-xs text-[#6b8f85]">No experience listed.</p>}
                </div>
              </div>

              {/* Education & Certs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-[#102C26]">
                    <GraduationCap size={20} weight="fill" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Education</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {selectedProfile.education?.map((edu: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-2xl p-4 border border-[#e8d0b0] shadow-sm">
                        <h4 className="text-xs font-black text-[#102C26]">{edu.degree} in {edu.major}</h4>
                        <p className="text-[10px] font-bold text-[#6b8f85]">{edu.institution} • {edu.location}</p>
                        <p className="text-[9px] text-[#6b8f85] mt-1 italic">{edu.start_date} — {edu.end_date}</p>
                      </div>
                    )) || <p className="text-xs text-[#6b8f85]">N/A</p>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4 text-[#102C26]">
                    <Certificate size={20} weight="fill" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Certifications</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {selectedProfile.certifications?.map((cert: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-2xl p-4 border border-[#e8d0b0] shadow-sm flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-[#102C26]">{cert.name}</h4>
                          <p className="text-[10px] font-bold text-[#6b8f85]">{cert.issuer}</p>
                        </div>
                        <span className="text-[9px] font-black text-[#102C26] bg-gray-100 px-2 py-1 rounded-md">{cert.issue_date}</span>
                      </div>
                    )) || <p className="text-xs text-[#6b8f85]">N/A</p>}
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-[#102C26]">
                  <ProjectorScreen size={20} weight="fill" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Featured Projects</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProfile.projects?.map((proj: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-[#e8d0b0] shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-black text-[#102C26]">{proj.name}</h4>
                        {proj.link && (
                          <a href={proj.link} target="_blank" className="text-[#102C26] hover:text-[#6b8f85]">
                            <Link size={16} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-[#4a6b63]">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies?.map((t: string, i: number) => (
                          <span key={i} className="text-[9px] bg-[#102C26]/5 text-[#102C26] px-2 py-0.5 rounded-md font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                  )) || <p className="text-xs text-[#6b8f85]">No projects listed.</p>}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-[#e8d0b0] shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-8 py-3 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-black uppercase tracking-widest hover:bg-[#1a4a3a] transition-all shadow-lg"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
