'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getTokens } from "@/lib/auth";

/**
 * Redirects already-logged-in users away from public pages (landing, login, register).
 * Call this at the top of any page that should not be visible when authenticated.
 */
export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getTokens();
    const user = getUser();

    if (accessToken && user) {
      if (user.role === "recruiter") {
        router.replace("/dashboard/recruiter");
      } else {
        router.replace("/dashboard/applicant");
      }
    }
  }, [router]);
}
