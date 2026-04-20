'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getTokens, hasRole } from "@/lib/auth";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getTokens();
    const user = getUser();

    if (accessToken && user) {
      if (hasRole(user, "recruiter")) {
        router.replace("/dashboard/recruiter");
      } else {
        router.replace("/dashboard/applicant");
      }
    }
  }, [router]);
}
