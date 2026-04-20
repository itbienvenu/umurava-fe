'use client'

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";

interface Skill { name: string; category: string; required: boolean; level: string; weight: number }
interface Education { level: string; fields: string[] }

interface Job {
  _id: string;
  title: string;
  employment_type: string;
  seniority_level: string;
  company?: { name: string; location?: { city?: string; country?: string } };
  description?: { raw?: string; summary?: string };
  requirements?: {
    experience?: { min_years?: number; max_years?: number | null; roles?: string[] };
    education?: Education[];
  };
  skills?: Skill[];
  responsibilities?: string[];
  languages?: string[];
  metadata?: { status: string; created_at?: string; updated_at?: string };
  scoring_config?: {
    weights: { skills: number; experience: number; education: number; resources: number; soft_skills: number };
  };
}

type Status = "draft" | "published" | "archived";
const TABS = ["Details", "Applications", "Shortlist"] as const;
type Tab = typeof TABS[number];

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-amber-100 text-amber-700",
  archived:  "bg-gray-100 text-gray-500",
};

const INPUT_CLASS = "border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent w-full disabled:bg-[#f5f5f5] disabled:text-[#aaa] disabled:cursor-not-allowed";
const LABEL_CLASS = "text-sm font-medium text-[#102C26] mb-1 block";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const defaultTab = initialTab && TABS.map(t => t.toLowerCase()).includes(initialTab.toLowerCase())
    ? TABS.find(t => t.toLowerCase() === initialTab.toLowerCase()) as Tab
    : "Details";

  const [job, setJob] = useState<Job | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("tab") !== activeTab.toLowerCase()) {
      params.set("tab", activeTab.toLowerCase());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, pathname, router, searchParams]);

  // Editable fields
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [minYears, setMinYears] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [languages, setLanguages] = useState("");

  // Action states
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null); // "publish"|"unpublish"|"archive"
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  function notify(text: string, type: "success" | "error" = "success") {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  }

  function populateForm(j: Job) {
    setTitle(j.title ?? "");
    setSummary(j.description?.summary ?? "");
    setEmploymentType(j.employment_type ?? "");
    setSeniorityLevel(j.seniority_level ?? "");
    setMinYears(String(j.requirements?.experience?.min_years ?? ""));
    setResponsibilities((j.responsibilities ?? []).join("\n"));
    setLanguages((j.languages ?? []).join(", "));
  }

  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/recruiter/${id}`)
      .then((r) => ApiError.handle(r))
      .then((data) => {
        const j = (data as { data: Job }).data;
        setJob(j);
        populateForm(j);
      })
      .catch((err: ApiError) => setFetchError(err.message))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSave() {
    setSaving(true); setMsg("");
    try {
      const body = {
        title,
        employment_type: employmentType,
        seniority_level: seniorityLevel,
        description: { summary },
        requirements: { experience: { min_years: Number(minYears) } },
        responsibilities: responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
        languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      };
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/${id}`,
        { method: "PATCH", body: JSON.stringify(body) }
      );
      await ApiError.handle(res);
      setJob((prev) => prev ? { ...prev, ...body } : prev);
      notify("Changes saved successfully.");
    } catch (err) {
      notify((err as ApiError).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(action: "publish" | "unpublish" | "archive" | "unarchive") {
    setActioning(action); setMsg("");
    const statusMap: Record<string, Status> = {
      publish: "published", unpublish: "draft", archive: "archived", unarchive: "draft",
    };
    const msgMap: Record<string, string> = {
      publish: "Job is now live!",
      unpublish: "Job moved back to draft. You can now edit it.",
      archive: "Job archived.",
      unarchive: "Job restored to draft.",
    };

    // Dedicated endpoints — fall back to PATCH /:id with metadata.status if 404
    const tryEndpoint = async (url: string) => {
      const res = await authFetch(url, { method: "PATCH" });
      if (res.status === 404) {
        // Backend route not yet implemented — use generic update
        const fallback = await authFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/${id}`,
          { method: "PATCH", body: JSON.stringify({ metadata: { status: statusMap[action] } }) }
        );
        return ApiError.handle(fallback);
      }
      return ApiError.handle(res);
    };

    try {
      await tryEndpoint(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/${id}/${action}`);
      setJob((prev) => prev ? { ...prev, metadata: { ...(prev.metadata ?? {}), status: statusMap[action] } } : prev);
      notify(msgMap[action]);
    } catch (err) {
      notify((err as ApiError).message, "error");
    } finally {
      setActioning(null);
    }
  }



  if (fetching) return <div className="flex items-center justify-center py-24 text-[#6b8f85]">Loading job...</div>;
  if (fetchError) return <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{fetchError}</div>;
  if (!job) return null;

  const status = (job.metadata?.status ?? "draft") as Status;
  const isPublished = status === "published";
  const isArchived = status === "archived";
  const canEdit = status === "draft";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="text-xs text-[#6b8f85] hover:text-[#102C26] mb-2 flex items-center gap-1"
          >
            ← Back to Jobs
          </button>
          <h1 className="text-2xl font-bold text-[#102C26]">{job.title}</h1>
          {job.company && (
            <p className="text-[#6b8f85] text-sm mt-0.5">
              {job.company.name}
              {job.company.location?.city && ` · ${job.company.location.city}`}
              {job.company.location?.country && `, ${job.company.location.country}`}
            </p>
          )}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize shrink-0 ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8d0b0] mb-6">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab ? "border-[#102C26] text-[#102C26]" : "border-transparent text-[#6b8f85] hover:text-[#102C26]"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === "Details" && (
        <div className="flex flex-col gap-5">

          {/* Global message */}
          {msg && (
            <div className={`text-sm px-4 py-3 rounded-lg border ${
              msgType === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}>{msg}</div>
          )}

          {/* Published lock banner */}
          {isPublished && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg flex items-center justify-between gap-4">
              <span>🔒 This job is live. Unpublish it first to make edits.</span>
              <button
                onClick={() => handleStatusChange("unpublish")}
                disabled={actioning === "unpublish"}
                className="shrink-0 text-xs bg-amber-700 text-white px-4 py-1.5 rounded-full hover:bg-amber-800 transition-colors disabled:opacity-60"
              >
                {actioning === "unpublish" ? "..." : "Unpublish"}
              </button>
            </div>
          )}

          {/* Archived banner */}
          {isArchived && (
            <div className="bg-gray-50 border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-lg">
              📦 This job is archived and not visible to applicants.
            </div>
          )}

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-[#102C26]">Basic Info</h2>
            <div>
              <label className={LABEL_CLASS}>Job Title</label>
              <input disabled={!canEdit} value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Employment Type</label>
                <select disabled={!canEdit} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={INPUT_CLASS}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Seniority Level</label>
                <select disabled={!canEdit} value={seniorityLevel} onChange={(e) => setSeniorityLevel(e.target.value)} className={INPUT_CLASS}>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Min. Years of Experience</label>
              <input disabled={!canEdit} type="number" min={0} value={minYears} onChange={(e) => setMinYears(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Languages</label>
              <input disabled={!canEdit} value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, French" className={INPUT_CLASS} />
              <p className="text-xs text-[#6b8f85] mt-1">Comma separated</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-[#102C26]">Description</h2>
            <div>
              <label className={LABEL_CLASS}>Summary</label>
              <textarea disabled={!canEdit} rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} className={INPUT_CLASS + " resize-none"} />
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-[#102C26]">Responsibilities</h2>
            <div>
              <label className={LABEL_CLASS}>One per line</label>
              <textarea disabled={!canEdit} rows={5} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)}
                placeholder={"Build annotation tools\nWrite unit tests\nCollaborate with ML team"}
                className={INPUT_CLASS + " resize-none"} />
            </div>
          </div>

          {/* Skills (read-only) */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6">
              <h2 className="font-semibold text-[#102C26] mb-3">Skills <span className="text-xs font-normal text-[#6b8f85]">(AI extracted)</span></h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <div key={s.name} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    s.required ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]" : "bg-white text-[#102C26] border-[#e8d0b0]"
                  }`}>
                    {s.name}<span className="opacity-60">· {Math.round(s.weight * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scoring weights (read-only) */}
          {job.scoring_config?.weights && (
            <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6">
              <h2 className="font-semibold text-[#102C26] mb-3">Scoring Weights <span className="text-xs font-normal text-[#6b8f85]">(AI configured)</span></h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(job.scoring_config.weights).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center bg-[#F7E7CE] rounded-xl p-3">
                    <span className="text-lg font-bold text-[#102C26]">{Math.round((val as number) * 100)}%</span>
                    <span className="text-xs text-[#6b8f85] capitalize mt-0.5">{key.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Save — only when draft */}
            {canEdit && (
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#102C26] text-[#F7E7CE] py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors disabled:opacity-60 text-sm">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}

            {/* Publish — only when draft */}
            {canEdit && (
              <button onClick={() => handleStatusChange("publish")} disabled={actioning === "publish"}
                className="flex-1 bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-60 text-sm">
                {actioning === "publish" ? "Publishing..." : "🚀 Publish Job"}
              </button>
            )}

            {/* Unpublish — only when published */}
            {isPublished && (
              <button onClick={() => handleStatusChange("unpublish")} disabled={actioning === "unpublish"}
                className="flex-1 border-2 border-amber-500 text-amber-600 py-3 rounded-full font-medium hover:bg-amber-50 transition-colors disabled:opacity-60 text-sm">
                {actioning === "unpublish" ? "..." : "Unpublish"}
              </button>
            )}

            {/* Archive — when draft or published (not already archived) */}
            {!isArchived && (
              <button onClick={() => handleStatusChange("archive")} disabled={actioning === "archive"}
                className="px-6 py-3 border-2 border-gray-300 text-gray-500 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 text-sm">
                {actioning === "archive" ? "..." : "Archive"}
              </button>
            )}

            {/* Unarchive — only when archived */}
            {isArchived && (
              <button onClick={() => handleStatusChange("unarchive")} disabled={actioning === "unarchive"}
                className="flex-1 border-2 border-[#102C26] text-[#102C26] py-3 rounded-full font-medium hover:bg-[#e8d0b0] transition-colors disabled:opacity-60 text-sm">
                {actioning === "unarchive" ? "..." : "↩ Unarchive"}
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "Applications" && (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center justify-center py-16 text-[#6b8f85]">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-sm">No applications yet for this job.</p>
        </div>
      )}

      {activeTab === "Shortlist" && (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 flex flex-col items-center justify-center py-16 text-[#6b8f85]">
          <span className="text-4xl mb-3">⭐</span>
          <p className="text-sm">Run screening first to see the shortlist.</p>
        </div>
      )}
    </div>
  );
}
