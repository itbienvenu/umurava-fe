'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearTokens } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearTokens();
    router.push("/login");
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-[#102C26] mb-6">Account</h1>

      <div className="bg-white rounded-2xl border border-[#e8d0b0] p-6 flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#102C26] flex items-center justify-center text-[#F7E7CE] text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? ""}
          </div>
          <div>
            <p className="font-semibold text-[#102C26]">{user?.name}</p>
            <p className="text-sm text-[#6b8f85]">{user?.email}</p>
            <span className="text-xs bg-[#102C26]/10 text-[#102C26] px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full border-2 border-red-300 text-red-500 py-3 rounded-full font-medium hover:bg-red-50 transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  );
}
