'use client'

import { useState, useRef, useEffect } from "react";
import { uploadCV, saveProfile, getApplicantProfile } from "@/lib/applicants";
import { ApplicantProfile } from "@/types/applicant";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FileText, 
  CloudArrowUp,
  CheckCircle,
  WarningCircle,
  X,
  Plus,
  Trash,
  CircleNotch,
  Sparkle
} from "@phosphor-icons/react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({
    first_name: "",
    last_name: "",
    email: "",
    headline: "",
    bio: "",
    location: "",
    skills: [],
    experience: [],
    education: [],
    languages: [],
    social_links: { linkedin: "", github: "", twitter: "" }
  });

  // Local Form States for "Add New" sections
  const [newExperience, setNewExperience] = useState({
    role: "",
    company: "",
    location: "",
    start_date: "",
    end_date: ""
  });

  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    major: "",
    location: ""
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "Beginner"
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setPageLoading(true);
        const res = await getApplicantProfile();
        
        if (process.env.NODE_ENV === 'development') {
          console.log("Profile fetched successfully:", res.success);
        }
        
        if (res.success && res.data) {
          const profileData = res.data.profile;
          
          setProfile(prev => ({
            ...prev,
            ...profileData,
            // Ensure nested objects preserve defaults if missing in response
            social_links: {
              ...prev.social_links,
              ...(profileData.social_links || {})
            },
            availability: {
              ...(prev.availability || {}),
              ...(profileData.availability || {})
            },
            preferences: {
              ...(prev.preferences || {}),
              ...(profileData.preferences || {})
            }
          }));
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        // If 404, it just means no profile exists yet, which is fine.
        if (err.status !== 404) {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        setPageLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"uploading" | "processing" | "finalizing" | null>(null);

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadPhase("uploading");
      setUploadProgress(0);

      const res = await uploadCV(file, (percent) => {
        setUploadProgress(percent);
        if (percent === 100) {
          setUploadPhase("processing");
          // Fake progress for processing as backend doesn't provide it yet
          let p = 0;
          const interval = setInterval(() => {
            p += 5;
            if (p >= 90) {
              clearInterval(interval);
              setUploadPhase("finalizing");
            }
          }, 500);
        }
      });

      if (res.success) {
        setUploadProgress(100);
        setUploadPhase(null);
        const profileData = res.data.profile;
        setProfile(prev => ({ 
          ...prev, 
          ...profileData,
          social_links: {
            ...prev.social_links,
            ...(profileData.social_links || {})
          },
          availability: {
            ...(prev.availability || {}),
            ...(profileData.availability || {})
          },
          preferences: {
            ...(prev.preferences || {}),
            ...(profileData.preferences || {})
          }
        }));
        setSuccess("CV parsed successfully! Please review your details across the tabs.");
        setActiveTab("personal"); // Switch to review details
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload CV.");
      setUploadPhase(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await saveProfile(profile);
      if (res.success) {
        setSuccess("Profile saved successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const updateProfileField = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircleNotch size={48} className="animate-spin text-[#102C26]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#102C26]">My Profile</h1>
          <p className="text-[#6b8f85] text-sm">Manage your professional identity and resume.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || uploading}
          className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full text-sm font-bold hover:bg-[#1a4a3a] transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <WarningCircle size={20} />
            {error}
          </div>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
          <button onClick={() => setSuccess(null)}><X size={16} /></button>
        </div>
      )}

      {/* Profile Navigation */}
      <div className="flex gap-8 border-b border-[#e8d0b0] mb-8 overflow-x-auto">
        {[
          { id: "personal", label: "Personal", icon: <User size={18} /> },
          { id: "experience", label: "Experience", icon: <Briefcase size={18} /> },
          { id: "education", label: "Education", icon: <GraduationCap size={18} /> },
          { id: "skills", label: "Skills", icon: <Code size={18} /> },
          { id: "cv", label: "Resume / CV", icon: <FileText size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap
              ${activeTab === tab.id ? "text-[#102C26]" : "text-[#6b8f85] hover:text-[#102C26]"}`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#102C26]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 shadow-sm">
        
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  value={profile.first_name || ""}
                  onChange={(e) => updateProfileField("first_name", e.target.value)}
                  className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  value={profile.last_name || ""}
                  onChange={(e) => updateProfileField("last_name", e.target.value)}
                  className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => updateProfileField("email", e.target.value)}
                  className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
                />
              </div>
               <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">Headline</label>
                <input
                  type="text"
                  value={profile.headline || ""}
                  onChange={(e) => updateProfileField("headline", e.target.value)}
                  className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => updateProfileField("location", e.target.value)}
                  className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">Nationality</label>
                <input
                  type="text"
                  value={profile.nationality || ""}
                  onChange={(e) => updateProfileField("nationality", e.target.value)}
                  className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6b8f85] uppercase tracking-wider">Bio</label>
              <textarea
                rows={4}
                value={profile.bio || ""}
                onChange={(e) => updateProfileField("bio", e.target.value)}
                className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#102C26] transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#102C26]">Work Experience</h3>
            </div>

            {/* Add Experience Form */}
            <div className="bg-[#fcf8f2] border border-[#e8d0b0] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-[#102C26] uppercase italic">Add New Experience</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Job Title" 
                  value={newExperience.role}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Company" 
                  value={newExperience.company}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={newExperience.location}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Start (YYYY-MM)" 
                    value={newExperience.start_date}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                    className="flex-1 bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                  />
                  <input 
                    type="text" 
                    placeholder="End (or Present)" 
                    value={newExperience.end_date}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                    className="flex-1 bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!newExperience.role || !newExperience.company) return;
                  const expToAdd = { 
                    role: newExperience.role, 
                    company: newExperience.company, 
                    start_date: newExperience.start_date, 
                    end_date: newExperience.end_date === "Present" ? null : newExperience.end_date, 
                    location: newExperience.location, 
                    is_current: newExperience.end_date === "Present", 
                    technologies: [], 
                    description: "", 
                    work_type: "Full-time" 
                  };
                  updateProfileField("experience", [...(profile.experience || []), expToAdd]);
                  setNewExperience({ role: "", company: "", location: "", start_date: "", end_date: "" });
                }}
                className="w-full bg-[#102C26] text-[#F7E7CE] py-2 rounded-xl text-xs font-bold hover:scale-[1.01] transition-all"
              >
                Add Experience to List
              </button>
            </div>

            {/* List of Editable Experiences */}
            <div className="space-y-6 pt-4">
              {profile.experience?.map((exp, i) => (
                <div key={i} className="bg-white border border-[#e8d0b0] rounded-2xl p-6 relative group space-y-4">
                  <button 
                    onClick={() => {
                      const newExp = [...(profile.experience || [])];
                      newExp.splice(i, 1);
                      updateProfileField("experience", newExp);
                    }}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash size={14} />
                    Remove
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6b8f85] uppercase">Role / Title</label>
                      <input 
                        type="text" 
                        value={exp.role || ""} 
                        onChange={(e) => {
                          const newExp = [...(profile.experience || [])];
                          newExp[i].role = e.target.value;
                          updateProfileField("experience", newExp);
                        }}
                        className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-lg px-3 py-1.5 text-sm focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6b8f85] uppercase">Company</label>
                      <input 
                        type="text" 
                        value={exp.company || ""} 
                        onChange={(e) => {
                          const newExp = [...(profile.experience || [])];
                          newExp[i].company = e.target.value;
                          updateProfileField("experience", newExp);
                        }}
                        className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-lg px-3 py-1.5 text-sm focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6b8f85] uppercase">Start Date</label>
                      <input 
                        type="text" 
                        value={exp.start_date || ""} 
                        onChange={(e) => {
                          const newExp = [...(profile.experience || [])];
                          newExp[i].start_date = e.target.value;
                          updateProfileField("experience", newExp);
                        }}
                        placeholder="YYYY-MM"
                        className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-lg px-3 py-1.5 text-sm focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6b8f85] uppercase">End Date</label>
                      <input 
                        type="text" 
                        value={exp.end_date || (exp.is_current ? "Present" : "")} 
                        onChange={(e) => {
                          const newExp = [...(profile.experience || [])];
                          if (e.target.value === "Present") {
                            newExp[i].end_date = null;
                            newExp[i].is_current = true;
                          } else {
                            newExp[i].end_date = e.target.value;
                            newExp[i].is_current = false;
                          }
                          updateProfileField("experience", newExp);
                        }}
                        placeholder="YYYY-MM or Present"
                        className="w-full bg-[#fcf8f2] border border-[#e8d0b0] rounded-lg px-3 py-1.5 text-sm focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!profile.experience || profile.experience.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-[#6b8f85] border-2 border-dashed border-[#e8d0b0] rounded-xl pointer-events-none">
                  <Briefcase size={32} weight="duotone" className="mb-2 opacity-50" />
                  <p className="text-sm">No experience added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#102C26]">Education</h3>
            </div>

            {/* Add Education Form */}
            <div className="bg-[#fcf8f2] border border-[#e8d0b0] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-[#102C26] uppercase italic">Add New Education</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Institution (e.g. MIT)" 
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Degree (e.g. Bachelors)" 
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Major (e.g. CS)" 
                  value={newEducation.major}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, major: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={newEducation.location}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
              </div>
              <button 
                onClick={() => {
                  if (!newEducation.institution || !newEducation.degree) return;
                  const eduToAdd = { 
                    institution: newEducation.institution, 
                    degree: newEducation.degree, 
                    major: newEducation.major, 
                    location: newEducation.location, 
                    start_date: "", 
                    end_date: null, 
                    field_of_study: newEducation.major 
                  };
                  updateProfileField("education", [...(profile.education || []), eduToAdd]);
                  setNewEducation({ institution: "", degree: "", major: "", location: "" });
                }}
                className="w-full bg-[#102C26] text-[#F7E7CE] py-2 rounded-xl text-xs font-bold hover:scale-[1.01] transition-all"
              >
                Add Education to List
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {profile.education?.map((edu, i) => (
                <div key={i} className="bg-white border border-[#e8d0b0] rounded-2xl p-6 relative group">
                  <button 
                    onClick={() => {
                      const newEdu = [...(profile.education || [])];
                      newEdu.splice(i, 1);
                      updateProfileField("education", newEdu);
                    }}
                    className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                  <h4 className="font-bold text-[#102C26]">{edu.degree} in {edu.major}</h4>
                  <p className="text-sm text-[#6b8f85]">{edu.institution}, {edu.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-[#102C26]">Technical Skills</h3>
            
            {/* Add Skill Form */}
            <div className="bg-[#fcf8f2] border border-[#e8d0b0] rounded-2xl p-6 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-[10px] font-bold text-[#6b8f85] uppercase">Skill Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. React" 
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none" 
                />
              </div>
              <div className="w-40 space-y-2">
                <label className="text-[10px] font-bold text-[#6b8f85] uppercase">Level</label>
                <select 
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full bg-white border border-[#e8d0b0] rounded-xl px-4 py-2 text-sm focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  if (!newSkill.name) return;
                  const skillToAdd = { name: newSkill.name, level: newSkill.level, years_of_experience: 0 };
                  updateProfileField("skills", [...(profile.skills || []), skillToAdd]);
                  setNewSkill({ name: "", level: "Beginner" });
                }}
                className="bg-[#102C26] text-[#F7E7CE] px-8 py-2 rounded-xl text-sm font-bold h-[38px]"
              >
                Add Skill
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill, index) => (
                  <span key={index} className="bg-white border border-[#e8d0b0] text-[#102C26] px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-3 group">
                    <span className="font-bold">{skill.name}</span>
                    <span className="text-[10px] text-[#6b8f85] bg-[#fcf8f2] px-2 py-0.5 rounded-md uppercase">{skill.level}</span>
                    <button 
                      onClick={() => {
                        const newSkills = [...(profile.skills || [])];
                        newSkills.splice(index, 1);
                        updateProfileField("skills", newSkills);
                      }}
                      className="text-red-400 hover:text-red-600"
                    ><X size={14} weight="bold" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cv" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-[#102C26]">Resume / CV</h3>
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-6 hover:bg-[#F7E7CE]/10 transition-all cursor-pointer relative group overflow-hidden
                ${uploading ? "border-[#102C26] bg-[#F7E7CE]/5 cursor-default" : "border-[#e8d0b0] hover:border-[#102C26]"}
                ${isDragging ? "border-[#102C26] bg-[#F7E7CE]/20 scale-[1.01]" : ""}`}
            >
              {uploading ? (
                <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-in fade-in duration-500">
                  <div className="relative">
                    <CircleNotch size={80} className="animate-spin text-[#102C26] opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-[#102C26]">{uploadPhase === 'uploading' ? uploadProgress : '90'}%</span>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#102C26] capitalize">
                          {uploadPhase === 'uploading' ? 'Transferring File...' : uploadPhase === 'processing' ? 'AI is analyzing CV...' : 'Wrapping up...'}
                        </p>
                        <p className="text-[10px] text-[#6b8f85] font-medium uppercase tracking-widest italic">
                          {uploadPhase === 'uploading' ? 'Securely sending to our servers' : 'Extracting skills & experience'}
                        </p>
                      </div>
                      <Sparkle size={20} weight="fill" className="text-amber-500 animate-pulse" />
                    </div>
                    
                    <div className="w-full h-3 bg-[#102C26]/5 rounded-full overflow-hidden border border-[#102C26]/10 p-0.5">
                      <div 
                        className="h-full bg-[#102C26] rounded-full transition-all duration-500 relative"
                        style={{ width: `${uploadPhase === 'uploading' ? uploadProgress : 90}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-sm transition-all duration-300
                    ${isDragging ? "bg-[#102C26] text-[#F7E7CE] rotate-12 scale-110" : "bg-[#F7E7CE] text-[#102C26] group-hover:scale-110"}`}>
                    <FileText size={40} weight="duotone" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-[#102C26]">
                      {isDragging ? "Release to drop CV" : "Upload your Resume"}
                    </p>
                    <p className="text-sm text-[#6b8f85] max-w-[240px] mx-auto">
                      Drag and drop your PDF here or click to browse files
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] bg-[#102C26] text-[#F7E7CE] px-3 py-1 rounded-full font-bold uppercase tracking-widest">PDF Max 10MB</span>
                    </div>
                  </div>
                </>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden" 
                disabled={uploading}
              />
            </div>
            <p className="text-xs text-center text-[#6b8f85]">
              Using AI, we will automatically extract your details to fill your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

