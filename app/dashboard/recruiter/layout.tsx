'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, clearTokens, hasRole } from "@/lib/auth";

const NAV = [
  {
    label: "Dashboard",
    href: "/dashboard/recruiter",
    icon: "▦",
  },
  {
    label: "Jobs",
    icon: "💼",
    children: [
      { label: "My Jobs", href: "/dashboard/recruiter/jobs" },
      { label: "Create Job", href: "/dashboard/recruiter/jobs/create" },
    ],
  },
  {
    label: "Applications",
    href: "/dashboard/recruiter/applications",
    icon: "📋",
  },
  {
    label: "Screening",
    icon: "🔍",
    children: [
      { label: "Run Screening", href: "/dashboard/recruiter/screening" },
      { label: "Shortlist", href: "/dashboard/recruiter/screening/shortlist" },
    ],
  },
  {
    label: "Company Profile",
    href: "/dashboard/recruiter/profile",
    icon: "🏢",
  },
  {
    label: "Account",
    href: "/dashboard/recruiter/account",
    icon: "👤",
  },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!hasRole(u, "recruiter")) { router.replace("/login"); return; }
    setUser(u);

    // Auto-open group if current path matches a child
    for (const item of NAV) {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        setOpenGroup(item.label);
      }
    }
  }, [pathname, router]);

  function handleLogout() {
    clearTokens();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="h-screen flex bg-[#F7E7CE] font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 top-0 left-0 h-full w-64 bg-[#102C26] text-[#F7E7CE] flex flex-col transition-transform duration-200 shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#1a4a3a]">
          <Link href="/dashboard/recruiter" className="font-bold text-lg tracking-tight">
            🍎 AppleOfEve
          </Link>
          <p className="text-xs text-[#6b8f85] mt-0.5">Recruiter Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map((item) => {
            const isActive = item.href
              ? pathname === item.href
              : item.children?.some((c) => pathname.startsWith(c.href));
            const isOpen = openGroup === item.label;

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors
                      ${isActive ? "bg-[#F7E7CE]/10 text-[#F7E7CE]" : "text-[#a8c5be] hover:bg-[#F7E7CE]/10 hover:text-[#F7E7CE]"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      {item.label}
                    </span>
                    <span className={`text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                  </button>
                  {isOpen && (
                    <div className="ml-8 mb-1 flex flex-col gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors
                            ${pathname === child.href || pathname.startsWith(child.href + "/")
                              ? "bg-[#F7E7CE]/15 text-[#F7E7CE] font-medium"
                              : "text-[#a8c5be] hover:bg-[#F7E7CE]/10 hover:text-[#F7E7CE]"}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors
                  ${isActive
                    ? "bg-[#F7E7CE]/15 text-[#F7E7CE]"
                    : "text-[#a8c5be] hover:bg-[#F7E7CE]/10 hover:text-[#F7E7CE]"}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-[#1a4a3a]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#F7E7CE]/20 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-[#6b8f85] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm border border-[#F7E7CE]/30 py-1.5 rounded-full hover:bg-[#F7E7CE]/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#102C26] text-[#F7E7CE] shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-xl">☰</button>
          <span className="font-bold">🍎 AppleOfEve</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
