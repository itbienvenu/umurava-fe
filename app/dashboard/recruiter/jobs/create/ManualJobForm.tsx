'use client'

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";

interface Skill {
  name: string;
  category: string;
  required: boolean;
  weight: number;
  level: string;
}

export default function ManualJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    employment_type: "full_time",
    seniority_level: "mid",
    company: {
      name: "",
      location: {
        city: "",
        country: "Rwanda"
      }
    },
    description: {
      raw: "",
      summary: ""
    },
    requirements: {
      experience: {
        min_years: 1,
        max_years: null as number | null,
        roles: [] as string[]
      },
      education: [
        {
          level: "bachelor",
          fields: [] as string[]
        }
      ]
    },
    domain: {
      primary: "",
      secondary: [] as string[]
    },
    skills: [] as Skill[],
    soft_skills: [] as { name: string; weight: number }[],
    resources: [] as { name: string; required: boolean }[],
    responsibilities: [] as string[],
    languages: ["English"] as string[],
    travel_required: false,
    scoring_config: {
      weights: {
        skills: 0.4,
        experience: 0.25,
        education: 0.15,
        resources: 0.1,
        soft_skills: 0.1
      },
      rules: {
        required_skills_must_match: true,
        min_experience_required: true
      }
    }
  });

  const [newItem, setNewItem] = useState({
    skill: {
      name: "",
      category: "programming_language",
      required: true,
      weight: 0.1,
      level: "intermediate"
    },
    softSkill: { name: "", weight: 0.05 },
    resource: { name: "", required: true },
    responsibility: "",
    secondaryDomain: "",
    role: "",
    language: ""
  });

  function addItem(type: keyof typeof newItem) {
    if (type === "skill") {
      if (!newItem.skill.name.trim()) return;
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newItem.skill] }));
      setNewItem({ ...newItem, skill: { ...newItem.skill, name: "" } });
    } else if (type === "softSkill") {
      if (!newItem.softSkill.name.trim()) return;
      setFormData(prev => ({ ...prev, soft_skills: [...prev.soft_skills, newItem.softSkill] }));
      setNewItem({ ...newItem, softSkill: { ...newItem.softSkill, name: "" } });
    } else if (type === "resource") {
      if (!newItem.resource.name.trim()) return;
      setFormData(prev => ({ ...prev, resources: [...prev.resources, newItem.resource] }));
      setNewItem({ ...newItem, resource: { ...newItem.resource, name: "" } });
    } else if (type === "responsibility") {
      if (!newItem.responsibility.trim()) return;
      setFormData(prev => ({ ...prev, responsibilities: [...prev.responsibilities, newItem.responsibility] }));
      setNewItem({ ...newItem, responsibility: "" });
    } else if (type === "secondaryDomain") {
      if (!newItem.secondaryDomain.trim()) return;
      setFormData(prev => ({ ...prev, domain: { ...prev.domain, secondary: [...prev.domain.secondary, newItem.secondaryDomain] } }));
      setNewItem({ ...newItem, secondaryDomain: "" });
    } else if (type === "role") {
      if (!newItem.role.trim()) return;
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          experience: {
            ...prev.requirements.experience,
            roles: [...prev.requirements.experience.roles, newItem.role]
          }
        }
      }));
      setNewItem({ ...newItem, role: "" });
    } else if (type === "language") {
      if (!newItem.language.trim()) return;
      setFormData(prev => ({ ...prev, languages: [...prev.languages, newItem.language] }));
      setNewItem({ ...newItem, language: "" });
    }
  }

  function removeItem(collection: any[], index: number, path: string) {
    const updated = collection.filter((_, i) => i !== index);
    const keys = path.split('.');

    setFormData(prev => {
      const newState = structuredClone(prev);
      const keys = path.split('.');
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = updated;
      return newState;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/jobs/manual-entry`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );
      const data = await ApiError.handle(res) as { data: { _id?: string; insertedId?: string } };
      const jobId = data.data._id || data.data.insertedId;

      if (jobId) {
        router.push(`/dashboard/recruiter/jobs/${jobId}`);
      } else {
        throw new Error("API did not return a job ID.");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-[#e8d0b0] rounded-xl px-4 py-2.5 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent transition-all";
  const labelClass = "block text-xs font-semibold text-[#102C26] uppercase tracking-wider mb-1.5";
  const sectionClass = "bg-white rounded-2xl border border-[#e8d0b0] p-6 shadow-sm";
  const pillClass = "bg-[#102C26] text-[#F7E7CE] px-3 py-1.5 rounded-full text-xs flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-20">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl sticky top-0 z-10 shadow-sm">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">📋</span>
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Job Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior React Developer"
              className={inputClass}
            />
            {fieldErrors["/title"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["/title"]}</p>}
          </div>

          <div>
            <label className={labelClass}>Employment Type</label>
            <select
              value={formData.employment_type}
              onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
              className={inputClass}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Seniority Level</label>
            <select
              value={formData.seniority_level}
              onChange={e => setFormData({ ...formData, seniority_level: e.target.value })}
              className={inputClass}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Travel & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">✈️</span>
            Travel & Language
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-[#F7E7CE]/10 p-3 rounded-xl border border-[#e8d0b0]">
              <input
                type="checkbox"
                id="travel_required"
                checked={formData.travel_required}
                onChange={e => setFormData({ ...formData, travel_required: e.target.checked })}
                className="w-5 h-5 accent-[#102C26] cursor-pointer"
              />
              <label htmlFor="travel_required" className="text-sm font-bold text-[#102C26] cursor-pointer">
                Travel Required?
              </label>
            </div>
            <div>
              <label className={labelClass}>Languages</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.languages.map((l) => (
                  <span key={l} className={pillClass}>
                    {l} <button type="button" onClick={() => removeItem(formData.languages, formData.languages.indexOf(l), "languages")}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.language}
                  onChange={e => setNewItem({ ...newItem, language: e.target.value })}
                  placeholder="e.g. French"
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('language'))}
                />
                <button type="button" onClick={() => addItem('language')} className="bg-[#102C26] text-white px-4 rounded-xl">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company & Domain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">🏢</span>
            Company
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                required
                type="text"
                value={formData.company.name}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                placeholder="TechCorp"
                className={inputClass}
              />
              {fieldErrors["/company/name"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["/company/name"]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input
                  required
                  type="text"
                  value={formData.company.location.city}
                  onChange={e => setFormData({ ...formData, company: { ...formData.company, location: { ...formData.company.location, city: e.target.value } } })}
                  placeholder="Kigali"
                  className={inputClass}
                />
                {fieldErrors["/company/location/city"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["/company/location/city"]}</p>}
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  required
                  type="text"
                  value={formData.company.location.country}
                  onChange={e => setFormData({ ...formData, company: { ...formData.company, location: { ...formData.company.location, country: e.target.value } } })}
                  placeholder="Rwanda"
                  className={inputClass}
                />
                {fieldErrors["/company/location/country"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["/company/location/country"]}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">🌐</span>
            Domain
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Primary Domain</label>
              <input
                required
                type="text"
                value={formData.domain.primary}
                onChange={e => setFormData({ ...formData, domain: { ...formData.domain, primary: e.target.value } })}
                placeholder="e.g. Technology"
                className={inputClass}
              />
              {fieldErrors["/domain/primary"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["/domain/primary"]}</p>}
            </div>
            <div>
              <label className={labelClass}>Secondary Domains</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.domain.secondary.map((d) => (
                  <span key={d} className={pillClass}>
                    {d} <button type="button" onClick={() => removeItem(formData.domain.secondary, formData.domain.secondary.indexOf(d), "domain.secondary")}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.secondaryDomain}
                  onChange={e => setNewItem({ ...newItem, secondaryDomain: e.target.value })}
                  placeholder="e.g. AI"
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('secondaryDomain'))}
                />
                <button type="button" onClick={() => addItem('secondaryDomain')} className="bg-[#102C26] text-white px-4 rounded-xl">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">🎓</span>
          Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-[#102C26] mb-4">Experience</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Min Years</label>
                <input
                  type="number"
                  value={formData.requirements.experience.min_years}
                  onChange={e => {
                    const val = e.target.value ? parseInt(e.target.value) : 0;
                    setFormData({ ...formData, requirements: { ...formData.requirements, experience: { ...formData.requirements.experience, min_years: isNaN(val) ? 0 : Math.max(0, val) } } });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Years</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={formData.requirements.experience.max_years ?? ""}
                  onChange={e => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setFormData({ ...formData, requirements: { ...formData.requirements, experience: { ...formData.requirements.experience, max_years: (val === null || isNaN(val)) ? null : Math.max(0, val) } } });
                  }}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Target Roles</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.requirements.experience.roles.map((r) => (
                  <span key={r} className={pillClass}>
                    {r} <button type="button" onClick={() => removeItem(formData.requirements.experience.roles, formData.requirements.experience.roles.indexOf(r), "requirements.experience.roles")}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.role}
                  onChange={e => setNewItem({ ...newItem, role: e.target.value })}
                  placeholder="e.g. Backend Engineer"
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('role'))}
                />
                <button type="button" onClick={() => addItem('role')} className="bg-[#102C26] text-white px-4 rounded-xl">+</button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#102C26] mb-4">Education</h3>
            {formData.requirements.education.map((edu, idx) => (
              <div key={idx} className="space-y-4">
                <label className={labelClass}>Minimum Level</label>
                <select
                  value={edu.level}
                  onChange={e => {
                    setFormData(prev => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        education: prev.requirements.education.map((edu, i) =>
                          i === idx ? { ...edu, level: e.target.value } : edu
                        )
                      }
                    }));
                  }}
                  className={inputClass}
                >
                  <option value="high_school">High School</option>
                  <option value="bachelor">Bachelor&apos;s Degree</option>
                  <option value="master">Master&apos;s Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills, Soft Skills, Resources */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">🛠️</span>
          Hard & Soft Skills
        </h2>

        <div className="space-y-8">
          {/* Hard Skills */}
          <div>
            <label className={labelClass}>Hard Skills</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {formData.skills.map((skill) => (
                <div key={skill.name} className="bg-[#F7E7CE]/20 border border-[#e8d0b0] p-3 rounded-xl flex flex-col gap-1 relative group">
                  <span className="font-bold text-sm text-[#102C26]">{skill.name}</span>
                  <span className="text-[10px] text-[#6b8f85] uppercase tracking-tighter">{skill.category.replaceAll('_', ' ')} • {skill.level}</span>
                  <button type="button" onClick={() => removeItem(formData.skills, formData.skills.indexOf(skill), "skills")} className="absolute top-2 right-2 text-[#102C26] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>

            <div className="bg-[#F7E7CE]/40 p-5 rounded-2xl border border-dashed border-[#e8d0b0]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Skill Name (e.g. Python)"
                    value={newItem.skill.name}
                    onChange={e => setNewItem({ ...newItem, skill: { ...newItem.skill, name: e.target.value } })}
                    className={inputClass}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('skill'))}
                  />
                </div>
                <select
                  value={newItem.skill.level}
                  onChange={e => setNewItem({ ...newItem, skill: { ...newItem.skill, level: e.target.value } })}
                  className={inputClass}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => addItem('skill')}
                  className="bg-[#102C26] text-[#F7E7CE] text-xs font-bold rounded-xl hover:bg-[#1a4a3a]"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Soft Skills */}
            <div>
              <label className={labelClass}>Soft Skills</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.soft_skills.map((s) => (
                  <span key={s.name} className={pillClass}>
                    {s.name} <button type="button" onClick={() => removeItem(formData.soft_skills, formData.soft_skills.indexOf(s), "soft_skills")}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.softSkill.name}
                  onChange={e => setNewItem({ ...newItem, softSkill: { ...newItem.softSkill, name: e.target.value } })}
                  placeholder="e.g. Communication"
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('softSkill'))}
                />
                <button type="button" onClick={() => addItem('softSkill')} className="bg-[#102C26] text-white px-4 rounded-xl">+</button>
              </div>
            </div>

            {/* Resources */}
            <div>
              <label className={labelClass}>Required Resources</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.resources.map((r) => (
                  <span key={r.name} className={pillClass}>
                    {r.name} <button type="button" onClick={() => removeItem(formData.resources, formData.resources.indexOf(r), "resources")}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.resource.name}
                  onChange={e => setNewItem({ ...newItem, resource: { ...newItem.resource, name: e.target.value } })}
                  placeholder="e.g. Laptop, Git"
                  className={inputClass}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('resource'))}
                />
                <button type="button" onClick={() => addItem('resource')} className="bg-[#102C26] text-white px-4 rounded-xl">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Responsibilities */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold text-[#102C26] mb-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-xl shadow-inner">📜</span>
          Details & Duties
        </h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Full Description (Raw Text)</label>
            <textarea
              required
              rows={6}
              value={formData.description.raw}
              onChange={e => setFormData({ ...formData, description: { ...formData.description, raw: e.target.value } })}
              placeholder="Paste the full job description here..."
              className={inputClass + " resize-none"}
            />
          </div>
          <div>
            <label className={labelClass}>Short Summary</label>
            <textarea
              required
              rows={2}
              value={formData.description.summary}
              onChange={e => setFormData({ ...formData, description: { ...formData.description, summary: e.target.value } })}
              placeholder="A one-sentence summary of the role..."
              className={inputClass + " resize-none"}
            />
          </div>
          <div>
            <label className={labelClass}>Responsibilities</label>
            <ul className="space-y-2 mb-4">
              {formData.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-[#102C26] bg-[#F7E7CE]/10 p-2 rounded-lg">
                  <span className="mt-1">✅</span>
                  <span className="flex-1">{r}</span>
                  <button type="button" onClick={() => removeItem(formData.responsibilities, formData.responsibilities.indexOf(r), "responsibilities")} className="text-red-400 hover:text-red-600">✕</button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.responsibility}
                onChange={e => setNewItem({ ...newItem, responsibility: e.target.value })}
                placeholder="Add a responsibility..."
                className={inputClass}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('responsibility'))}
              />
              <button type="button" onClick={() => addItem('responsibility')} className="bg-[#102C26] text-white px-4 rounded-xl">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-[#e8d0b0] md:left-64 z-20">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#102C26] text-[#F7E7CE] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#1a4a3a] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block text-xl font-thin">⟳</span>
                Creating Draft...
              </>
            ) : (
              <>
                <span>🚀</span>
                Create Job Manually
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
