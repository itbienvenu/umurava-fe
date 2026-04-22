'use client'

import { useState, useEffect, FormEvent } from "react";
import { authFetch, getTokens } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";
import { 
  Buildings, 
  MapPin, 
  ShareNetwork, 
  FloppyDisk, 
  CircleNotch, 
  CheckCircle, 
  WarningCircle,
  Globe,
  Link,
  TwitterLogo,
  LinkedinLogo
} from "@phosphor-icons/react";

interface ProfileForm {
  company_name: string;
  industry: string;
  website: string;
  bio: string;
  company_logo: string;
  address: string;
  city: string;
  country: string;
  linkedin: string;
  twitter: string;
}

const empty: ProfileForm = {
  company_name: "", industry: "", website: "", bio: "",
  company_logo: "", address: "", city: "", country: "",
  linkedin: "", twitter: "",
};

export default function CompanyProfilePage() {
  const [form, setForm] = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load existing profile
  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      setFetching(false);
      return;
    }
    setError("");
    authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/recruiters/profile`)
      .then((r) => ApiError.handle(r))
      .then((data) => {
        const p = (data as any).data?.profile;
        if (p) {
          setForm({
            company_name: p.company_name ?? "",
            industry: p.industry ?? "",
            website: p.website ?? "",
            bio: p.bio ?? "",
            company_logo: p.company_logo ?? "",
            address: p.location?.address ?? "",
            city: p.location?.city ?? "",
            country: p.location?.country ?? "",
            linkedin: p.social_links?.linkedin ?? "",
            twitter: p.social_links?.twitter ?? "",
          });
        }
      })
      .catch((err: ApiError) => {
        setError(err.message || "Failed to load profile.");
      })
      .finally(() => setFetching(false));
  }, []);

  function set(field: keyof ProfileForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => {
      const n = { ...e };
      delete n[field];
      // Also clear nested error keys
      if (["city", "country", "address"].includes(field)) delete n[`location.${field}`];
      if (["linkedin", "twitter"].includes(field)) delete n[`social_links.${field}`];
      return n;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setFieldErrors({});
    setLoading(true);

    const body = {
      company_name: form.company_name,
      industry: form.industry,
      website: form.website,
      bio: form.bio,
      company_logo: form.company_logo,
      location: { address: form.address, city: form.city, country: form.country },
      social_links: { linkedin: form.linkedin, twitter: form.twitter },
    };

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/recruiters/profile`,
        { method: "POST", body: JSON.stringify(body) }
      );
      await ApiError.handle(res);
      setSuccess("Company profile saved successfully!");
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.fieldErrors).length > 0) setFieldErrors(err.fieldErrors);
        else setError(err.message);
      } else {
        setError("Internal server error.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent w-full";
  const labelClass = "text-sm font-medium text-[#102C26] mb-1 block";

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#6b8f85]">
        <CircleNotch size={48} className="animate-spin mb-4" />
        <p className="text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#102C26] mb-2">Company Profile</h1>
      <p className="text-[#6b8f85] text-sm mb-8">
        Set up your company profile before posting jobs.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <WarningCircle size={18} />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* Company info */}
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-[#102C26] flex items-center gap-2">
            <Buildings size={20} weight="duotone" />
            Company Info
          </h2>

          <div>
            <label className={labelClass}>Company Name *</label>
            <input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)}
              placeholder="Zipline Rwanda" className={inputClass} />
            {fieldErrors["company_name"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["company_name"]}</p>}
          </div>

          <div>
            <label className={labelClass}>Industry *</label>
            <input required value={form.industry} onChange={(e) => set("industry", e.target.value)}
              placeholder="Healthcare Logistics" className={inputClass} />
            {fieldErrors["industry"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["industry"]}</p>}
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)}
              placeholder="https://yourcompany.com" className={inputClass} />
            {fieldErrors["website"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["website"]}</p>}
          </div>

          <div>
            <label className={labelClass}>Company Logo URL</label>
            <input type="url" value={form.company_logo} onChange={(e) => set("company_logo", e.target.value)}
              placeholder="https://cdn.example.com/logo.png" className={inputClass} />
            {fieldErrors["company_logo"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["company_logo"]}</p>}
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell candidates about your company..."
              className={inputClass + " resize-none"} />
            {fieldErrors["bio"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["bio"]}</p>}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-[#102C26] flex items-center gap-2">
            <MapPin size={20} weight="duotone" />
            Location
          </h2>

          <div>
            <label className={labelClass}>Address</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)}
              placeholder="KG 123 St" className={inputClass} />
            {fieldErrors["location.address"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["location.address"]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                placeholder="Kigali" className={inputClass} />
              {fieldErrors["location.city"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["location.city"]}</p>}
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <input required value={form.country} onChange={(e) => set("country", e.target.value)}
                placeholder="Rwanda" className={inputClass} />
              {fieldErrors["location.country"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["location.country"]}</p>}
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-[#102C26] flex items-center gap-2">
            <ShareNetwork size={20} weight="duotone" />
            Social Links
          </h2>

          <div>
            <label className={labelClass}>LinkedIn</label>
            <input type="url" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany" className={inputClass} />
            {fieldErrors["social_links.linkedin"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["social_links.linkedin"]}</p>}
          </div>

          <div>
            <label className={labelClass}>Twitter / X</label>
            <input type="url" value={form.twitter} onChange={(e) => set("twitter", e.target.value)}
              placeholder="https://twitter.com/yourcompany" className={inputClass} />
            {fieldErrors["social_links.twitter"] && <p className="text-red-500 text-xs mt-1">{fieldErrors["social_links.twitter"]}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#102C26] text-[#F7E7CE] py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          {loading ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
