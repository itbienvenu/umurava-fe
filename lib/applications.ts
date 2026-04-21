import { authFetch } from "./auth";
import { ApiError } from "./apiError";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApplicationSubmission {
  coverLetter?: string;
}

export async function submitApplication(jobId: string, data: ApplicationSubmission): Promise<{ success: boolean; message: string; data: any }> {
  const res = await authFetch(`${BASE}/api/v1/applications/${jobId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return await ApiError.handle(res) as { success: boolean; message: string; data: any };
}

export async function getMyApplications(): Promise<{ success: boolean; data: any[] }> {
  const res = await authFetch(`${BASE}/api/v1/applications/my`);
  return await ApiError.handle(res) as { success: boolean; data: any[] };
}

export async function getApplicationById(id: string): Promise<{ success: boolean; data: any }> {
  const res = await authFetch(`${BASE}/api/v1/applications/${id}`);
  return await ApiError.handle(res) as { success: boolean; data: any };
}
