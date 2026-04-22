'use client'

import { useState } from "react";
import { authFetch } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";

interface SourcingTabProps {
  jobId: string;
}

const SYSTEM_FIELDS = [
  { id: "first_name", label: "First Name", required: true },
  { id: "last_name", label: "Last Name", required: true },
  { id: "email", label: "Email Address", required: true },
  { id: "headline", label: "Professional Headline", required: true },
  { id: "location", label: "Location (City, Country)", required: true },
  { id: "resume_url", label: "Resume/CV URL", required: false },
  { id: "bio", label: "Professional Bio", required: false },
  { id: "linkedin", label: "LinkedIn URL", required: false },
  { id: "github", label: "GitHub URL", required: false },
  { id: "portfolio", label: "Personal Portfolio URL", required: false },
];

export default function SourcingTab({ jobId }: SourcingTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setResult(null);

    // If it's a CSV, try to extract headers simple way
    if (selectedFile.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const firstLine = text.split("\n")[0];
        if (firstLine) {
          const detectedHeaders = firstLine.split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
          setHeaders(detectedHeaders);

          // Auto-mapping attempt
          const newMapping: Record<string, string> = {};
          SYSTEM_FIELDS.forEach(field => {
            const match = detectedHeaders.find(h =>
              h.toLowerCase() === field.label.toLowerCase() ||
              h.toLowerCase().replace(/[^a-z]/g, "") === field.id.replace(/[^a-z]/g, "")
            );
            if (match) newMapping[field.id] = match;
          });
          setMapping(newMapping);
        }
      };
      reader.readAsText(selectedFile.slice(0, 5000)); // Read first 5KB
    } else {
      // For Excel, we can't easily parse headers without a library
      // But we can still allow manual entry of column names if headers aren't detected
      setHeaders([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    // Validate required mappings
    const missing = SYSTEM_FIELDS.filter(f => f.required && !mapping[f.id]);
    if (missing.length > 0) {
      setError(`Please map required fields: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("columnMappingJson", JSON.stringify(mapping));
      formData.append("skipInvalidRows", String(skipInvalid));
      // Append file last to ensure fields are parsed first by busboy/multer
      formData.append("file", file);

      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sourcing/bulk-import`, {
        method: "POST",
        body: formData,
      });

      const data = await ApiError.handle(res) as any;
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to import candidates");
    } finally {
      setIsUploading(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">✓</div>
          <div>
            <h2 className="text-xl font-bold text-[#102C26]">Import Completed</h2>
            <p className="text-sm text-[#6b8f85]">Processed {result.total} rows from {file?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#f0f9f6] p-4 rounded-xl border border-green-100">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Imported</p>
            <p className="text-2xl font-bold text-green-700">{result.imported}</p>
          </div>
          <div className="bg-[#fff8f0] p-4 rounded-xl border border-amber-100">
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Failed</p>
            <p className="text-2xl font-bold text-amber-700">{result.failed}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Rows</p>
            <p className="text-2xl font-bold text-gray-600">{result.total}</p>
          </div>
        </div>

        {result.results.length > 0 && (
          <div className="overflow-hidden border border-[#e8d0b0] rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7E7CE]/30 text-[#102C26] font-medium">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8d0b0]">
                {result.results.map((r: any, i: number) => (
                  <tr key={i} className={r.success ? "bg-white" : "bg-red-50/30"}>
                    <td className="px-4 py-3 text-gray-500">{r.row_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#102C26]">{r.first_name} {r.last_name}</p>
                      <p className="text-xs text-gray-400">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.success ? (
                        <span className="text-green-600">ID: ...{r.applicantId?.substring(r.applicantId.length - 6)}</span>
                      ) : (
                        <span className="text-red-500">{r.error?.message}</span>
                      )}
                    </td>
                  </tr>
                )).slice(0, 20)}
                {result.results.length > 20 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-400 italic">
                      Showing first 20 results...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => { setFile(null); setResult(null); setMapping({}); }}
          className="mt-8 w-full bg-[#102C26] text-[#F7E7CE] py-3 rounded-full font-medium"
        >
          Import More Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6">
        <h2 className="text-lg font-bold text-[#102C26] mb-1">Bulk Candidate Import</h2>
        <p className="text-sm text-[#6b8f85] mb-6">Upload a spreadsheet to populate your candidate pipeline from external sources.</p>

        <div className="border-2 border-dashed border-[#e8d0b0] rounded-2xl p-8 flex flex-col items-center justify-center bg-[#F7E7CE]/10 hover:bg-[#F7E7CE]/20 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-4">
            {file ? "📄" : "📤"}
          </div>
          <p className="font-semibold text-[#102C26]">{file ? file.name : "Select Spreadsheet"}</p>
          <p className="text-xs text-[#6b8f85] mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV or Excel files up to 10MB"}</p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      {file && (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#102C26]">Step 2: Map Columns</h3>
            {headers.length > 0 && <span className="text-[10px] bg-[#102C26]/10 text-[#102C26] px-2 py-0.5 rounded-full font-bold uppercase">Headers Detected</span>}
          </div>
          <p className="text-xs text-[#6b8f85] mb-6">Tell us which columns in your file match our system fields.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {SYSTEM_FIELDS.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#102C26] flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {headers.length > 0 ? (
                  <select
                    value={mapping[field.id] || ""}
                    onChange={(e) => setMapping(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="border border-[#e8d0b0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#102C26]"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter exactly as in file header..."
                    value={mapping[field.id] || ""}
                    onChange={(e) => setMapping(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="border border-[#e8d0b0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#102C26]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={skipInvalid}
                onChange={(e) => setSkipInvalid(e.target.checked)}
                className="w-4 h-4 accent-[#102C26]"
              />
              <span className="text-sm text-[#102C26] group-hover:opacity-80">Skip invalid rows</span>
            </label>

            <button
              onClick={handleImport}
              disabled={isUploading}
              className="bg-[#102C26] text-[#F7E7CE] px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 min-w-[160px] justify-center"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#F7E7CE]/30 border-t-[#F7E7CE] rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : "Start Import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
