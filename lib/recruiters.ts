import { authFetch } from "./auth";
import { ApiError } from "./apiError";

import { API_BASE_URL } from "./api-config";

const BASE = API_BASE_URL;

export async function getRecruiterAnalytics(): Promise<{ success: boolean; data: any }> {
  const res = await authFetch(`${BASE}/api/v1/recruiters/analytics`);
  return await ApiError.handle(res) as { success: boolean; data: any };
}
