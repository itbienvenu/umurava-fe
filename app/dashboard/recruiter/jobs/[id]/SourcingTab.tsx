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

type SourcingMode = "csv" | "cv";

export default function SourcingTab({ jobId }: SourcingTabProps) {
  const [mode, setMode] = useState<SourcingMode>("cv");
  
  // CSV States
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [skipInvalid, setSkipInvalid] = useState(true);
  
  // CV States
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  
  // Global States
  const [isUploading, setIsUploading] = useState(false);
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
      setHeaders([]);
    }
  };

  const handleCvFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    
    if (pdfs.length < files.length) {
      setError("Only PDF files are allowed for CV sourcing.");
    } else {
      setError("");
    }
    
    setCvFiles(prev => [...prev, ...pdfs]);
    setResult(null);
  };

  const removeCvFile = (index: number) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (mode === "csv") {
      await handleCsvImport();
    } else {
      await handleCvBatchUpload();
    }
  };

  const handleCsvImport = async () => {
    if (!file) return;

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
      formData.append("file", file);

      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sourcing/bulk-import`, {
        method: "POST",
        body: formData,
      });

      const data = await ApiError.handle(res) as any;
      setResult({ type: 'csv', ...data.data });
    } catch (err: any) {
      setError(err.message || "Failed to import candidates");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCvBatchUpload = async () => {
    if (cvFiles.length === 0) {
      setError("Please select at least one CV to upload.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      cvFiles.forEach(f => {
        formData.append("cvs", f);
      });

      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sourcing/batch-upload-cvs`, {
        method: "POST",
        body: formData,
      });

      // Backend returns 202 Accepted immediately
      const data = await ApiError.handle(res) as any;
      setResult({ 
        type: 'cv', 
        message: data.message || "Batch upload started successfully!",
        count: cvFiles.length 
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload CVs");
    } finally {
      setIsUploading(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl shadow-sm">✓</div>
          <div>
            <h2 className="text-xl font-bold text-[#102C26]">{result.type === 'csv' ? 'Import Completed' : 'Upload Successful'}</h2>
            <p className="text-sm text-[#6b8f85]">
              {result.type === 'csv' 
                ? `Processed ${result.total} rows from ${file?.name}`
                : `Successfully queued ${result.count} CVs for background processing.`
              }
            </p>
          </div>
        </div>

        {result.type === 'csv' ? (
          <>
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

            {result.results?.length > 0 && (
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
                    {result.results.slice(0, 20).map((r: any, i: number) => (
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
                            <span className="text-green-600">ID: ...{r.applicantId?.slice(-6)}</span>
                          ) : (
                            <span className="text-red-500">{r.error?.message}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#f0f9f6] p-6 rounded-2xl border border-green-100 mb-8">
            <h3 className="font-bold text-[#102C26] mb-2">What happens next?</h3>
            <ul className="space-y-3 text-sm text-[#4a6b63]">
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Our AI is currently reading and parsing each PDF to extract skills and experience.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Candidates will appear in the <b>Applications</b> tab with a <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">Pending</span> status.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Once parsing is complete (usually 30-60 seconds), their profiles will be fully updated.</span>
              </li>
            </ul>
          </div>
        )}

        <button
          onClick={() => { 
            setFile(null); 
            setCvFiles([]);
            setResult(null); 
            setMapping({}); 
          }}
          className="w-full bg-[#102C26] text-[#F7E7CE] py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          {result.type === 'csv' ? 'Import More Candidates' : 'Upload More CVs'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-[#F7E7CE]/20 rounded-2xl border border-[#e8d0b0] w-fit">
        <button
          onClick={() => { setMode("cv"); setError(""); }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === "cv" ? "bg-[#102C26] text-[#F7E7CE] shadow-md" : "text-[#6b8f85] hover:text-[#102C26]"}`}
        >
          📄 Batch CV Upload
        </button>
        <button
          onClick={() => { setMode("csv"); setError(""); }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === "csv" ? "bg-[#102C26] text-[#F7E7CE] shadow-md" : "text-[#6b8f85] hover:text-[#102C26]"}`}
        >
          📊 CSV/Excel Import
        </button>
      </div>

      {mode === "cv" ? (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#102C26]"></div>
          <h2 className="text-lg font-bold text-[#102C26] mb-1">AI-Powered CV Sourcing</h2>
          <p className="text-sm text-[#6b8f85] mb-8">Upload multiple PDF resumes. Our AI will automatically extract candidate details and add them to this job.</p>

          <div className="border-2 border-dashed border-[#e8d0b0] rounded-2xl p-10 flex flex-col items-center justify-center bg-[#F7E7CE]/5 hover:bg-[#F7E7CE]/15 transition-all cursor-pointer relative group">
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleCvFilesChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="w-20 h-20 bg-white rounded-3xl shadow-md flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">
              📂
            </div>
            <p className="font-bold text-[#102C26] text-lg">Drop CVs here or click to browse</p>
            <p className="text-xs text-[#6b8f85] mt-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">Multiple PDF files supported (Max 10MB each)</p>
          </div>

          {cvFiles.length > 0 && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#102C26] flex items-center gap-2">
                  Selected Files
                  <span className="bg-[#102C26] text-[#F7E7CE] text-[10px] px-2 py-0.5 rounded-full">{cvFiles.length}</span>
                </h3>
                <button 
                  onClick={() => setCvFiles([])}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cvFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#F7E7CE]/10 border border-[#e8d0b0] rounded-xl hover:bg-white transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xl">📄</span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-[#102C26] truncate">{f.name}</p>
                        <p className="text-[10px] text-[#6b8f85]">{(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeCvFile(i)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleCvBatchUpload}
                  disabled={isUploading}
                  className="w-full bg-[#102C26] text-[#F7E7CE] py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isUploading ? (
                    <>
                      <span className="w-5 h-5 border-3 border-[#F7E7CE]/30 border-t-[#F7E7CE] rounded-full animate-spin"></span>
                      <span>Uploading & Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start AI Sourcing</span>
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#6b8f85] mt-4 uppercase tracking-widest font-bold">
                  ⚡ Powered by Gemini AI Integration
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <h2 className="text-lg font-bold text-[#102C26] mb-1">Bulk Candidate Import</h2>
          <p className="text-sm text-[#6b8f85] mb-8">Upload a spreadsheet to populate your candidate pipeline from external sources.</p>

          <div className="border-2 border-dashed border-[#e8d0b0] rounded-2xl p-10 flex flex-col items-center justify-center bg-[#F7E7CE]/5 hover:bg-[#F7E7CE]/15 transition-all cursor-pointer relative group">
            <input
              type="file"
              accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="w-20 h-20 bg-white rounded-3xl shadow-md flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
            <p className="font-bold text-[#102C26] text-lg">{file ? file.name : "Select Spreadsheet"}</p>
            <p className="text-xs text-[#6b8f85] mt-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">{file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV or Excel files up to 10MB"}</p>
          </div>

          {file && (
            <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-[#102C26]">Step 2: Map Columns</h3>
                  <p className="text-xs text-[#6b8f85]">Match your file columns to our system fields.</p>
                </div>
                {headers.length > 0 && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Headers Detected</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
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
                        className="border border-[#e8d0b0] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26] transition-shadow shadow-sm"
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter column name..."
                        value={mapping[field.id] || ""}
                        onChange={(e) => setMapping(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="border border-[#e8d0b0] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26] transition-shadow shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={skipInvalid}
                    onChange={(e) => setSkipInvalid(e.target.checked)}
                    className="w-5 h-5 rounded-md border-[#e8d0b0] text-[#102C26] focus:ring-[#102C26] accent-[#102C26]"
                  />
                  <span className="text-sm font-medium text-[#102C26] group-hover:opacity-80">Skip invalid rows</span>
                </label>

                <button
                  onClick={handleCsvImport}
                  disabled={isUploading}
                  className="bg-[#102C26] text-[#F7E7CE] px-10 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 min-w-[180px] justify-center"
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#F7E7CE]/30 border-t-[#F7E7CE] rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : "Start Import"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold">Heads up!</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
