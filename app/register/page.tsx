'use client'

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { API_BASE_URL } from "@/lib/api-config";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useAuthRedirect();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"applicant" | "recruiter">("applicant");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "recruiter") setRole("recruiter");
    else setRole("applicant");
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          const errs: Record<string, string> = {};
          for (const err of data.errors) {
            errs[err.field] = err.message;
          }
          setFieldErrors(errs);
        } else {
          setError(data.message || "Something went wrong.");
        }
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE] font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-[#e8d0b0]">
        <Link href="/" className="text-[#102C26] font-bold text-xl tracking-tight">
          🍎 AppleOfEve
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-[#e8d0b0]">
          <h1 className="text-3xl font-bold text-[#102C26] mb-2">Create an account</h1>
          <p className="text-[#6b8f85] text-sm mb-8">
            Join AppleOfEve and find your next opportunity
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium text-[#102C26]">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Uwimana"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-[#102C26]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-[#102C26]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#102C26]">I am a</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("applicant")}
                  className={`flex-1 py-3 rounded-full text-sm font-medium border-2 transition-colors ${
                    role === "applicant"
                      ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]"
                      : "border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26]"
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`flex-1 py-3 rounded-full text-sm font-medium border-2 transition-colors ${
                    role === "recruiter"
                      ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]"
                      : "border-[#e8d0b0] text-[#6b8f85] hover:border-[#102C26] hover:text-[#102C26]"
                  }`}
                >
                  Recruiter
                </button>
              </div>
              {fieldErrors.role && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.role}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#102C26] text-[#F7E7CE] py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b8f85] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#102C26] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
