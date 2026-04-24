'use client'

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveTokens, saveUser } from "@/lib/auth";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { API_BASE_URL } from "@/lib/api-config";

export default function LoginPage() {
  const router = useRouter();
  useAuthRedirect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong.");
        return;
      }

      const { accessToken, refreshToken, user } = data.data;
      saveTokens(accessToken, refreshToken);
      saveUser(user);

      // Redirect based on role
      if (user.role === "recruiter") {
        router.push("/dashboard/recruiter");
      } else {
        router.push("/dashboard/applicant");
      }
    } catch {
      setError("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE] font-sans">
      <header className="flex items-center justify-between px-10 py-4 border-b border-[#e8d0b0]">
        <Link href="/" className="text-[#102C26] font-bold text-xl tracking-tight">
          🍎 AppleOfEve
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-[#e8d0b0]">
          <h1 className="text-3xl font-bold text-[#102C26] mb-2">Welcome back</h1>
          <p className="text-[#6b8f85] text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-[#102C26]">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
                className="border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-[#102C26]">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-[#e8d0b0] rounded-lg px-4 py-3 text-sm text-[#102C26] bg-white placeholder-[#8aada6] focus:outline-none focus:ring-2 focus:ring-[#102C26] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#102C26] text-[#F7E7CE] py-3 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b8f85] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#102C26] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
