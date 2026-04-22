import { authFetch } from "./auth";
import { ApiError } from "./apiError";
import { ApplicationResponse, ApplicationsResponse } from "@/types/application";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApplicationSubmission {
  coverLetter?: string;
}

export async function submitApplication(jobId: string, data: ApplicationSubmission): Promise<ApplicationResponse> {
  const res = await authFetch(`${BASE}/api/v1/applications/${jobId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return await ApiError.handle(res) as ApplicationResponse;
}

export async function getMyApplications(): Promise<ApplicationsResponse> {
  const res = await authFetch(`${BASE}/api/v1/applications/my`);
  return await ApiError.handle(res) as ApplicationsResponse;
}

export async function getApplicationById(id: string): Promise<ApplicationResponse> {
  const res = await authFetch(`${BASE}/api/v1/applications/${id}`);
  return await ApiError.handle(res) as ApplicationResponse;
}
