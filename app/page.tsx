'use client'

import Link from "next/link";
import { useAuthRedirect } from "@/lib/useAuthRedirect";

export default function Home() {
  useAuthRedirect();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE] font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-[#e8d0b0]">
        <div className="flex items-center gap-2">
          <span className="text-[#102C26] font-bold text-xl tracking-tight">
            🍎 AppleOfEve
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#6b8f85]">
          <a href="#" className="hover:text-[#102C26] transition-colors">About Us</a>
          <a href="#" className="hover:text-[#102C26] transition-colors">Contact Us</a>
          <a href="#" className="hover:text-[#102C26] transition-colors">FAQs</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#102C26] font-medium hover:underline"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#102C26] text-[#F7E7CE] px-4 py-2 rounded-full font-medium hover:bg-[#1a4a3a] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6 py-24">
        {/* Wave background */}
        <div className="absolute inset-0 -z-10">
          <svg
            viewBox="0 0 1440 560"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {[...Array(8)].map((_, i) => (
              <path
                key={i}
                d={`M0,${200 + i * 30} C360,${160 + i * 20} 720,${260 + i * 20} 1440,${200 + i * 30}`}
                fill="none"
                stroke="#102C26"
                strokeWidth="1"
                opacity={0.08 + i * 0.02}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <path
                key={`b${i}`}
                d={`M0,${300 + i * 25} C480,${340 + i * 15} 960,${240 + i * 15} 1440,${300 + i * 25}`}
                fill="none"
                stroke="#102C26"
                strokeWidth="1"
                opacity={0.06 + i * 0.02}
              />
            ))}
          </svg>
        </div>

        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[#102C26] leading-tight mb-4">
            Connecting top talent with the right employers
          </h1>
          <p className="text-[#6b8f85] text-base mb-8">
            your ideal opportunity is just a click away!
            <br />
            Looking for a job or talent?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register?role=applicant"
              className="px-8 py-3 bg-[#102C26] text-[#F7E7CE] rounded-full font-medium hover:bg-[#1a4a3a] transition-colors"
            >
              Job Seeker
            </Link>
            <Link
              href="/register?role=recruiter"
              className="px-8 py-3 border-2 border-[#102C26] text-[#102C26] rounded-full font-medium hover:bg-[#e8d0b0] transition-colors"
            >
              Recruiter
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-10 py-4 border-t border-[#e8d0b0] text-sm text-[#6b8f85]">
        <div className="flex items-center gap-2">
          <span className="text-[#102C26] font-medium">Download the App</span>
          <span>🍎</span>
          <span>▶</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[#102C26]">Terms &amp; Conditions</a>
          <span>|</span>
          {["f", "in", "tw", "sc", "x", "li"].map((s) => (
            <a
              key={s}
              href="#"
              className="w-7 h-7 rounded-full border border-[#6b8f85] flex items-center justify-center text-xs hover:border-[#102C26] hover:text-[#102C26] transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
