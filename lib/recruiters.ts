import { authFetch } from "./auth";
import { ApiError } from "./apiError";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getRecruiterAnalytics(): Promise<{ success: boolean; data: any }> {
  const res = await authFetch(`${BASE}/api/v1/recruiters/analytics`);
  return await ApiError.handle(res) as { success: boolean; data: any };
}
