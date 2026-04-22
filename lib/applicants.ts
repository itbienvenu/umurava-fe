import { authFetch } from "./auth";
import { CVUploadResponse, SavedApplicantProfile } from "../types/applicant";
import { ApiError } from "./apiError";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function uploadCV(file: File): Promise<CVUploadResponse> {
  const formData = new FormData();
  formData.append("cv", file);

  const res = await authFetch(`${BASE}/api/v1/applicants/upload-cv`, {
    method: "POST",
    body: formData,
  });

  return await ApiError.handle(res) as CVUploadResponse;
}

export async function saveProfile(profile: any): Promise<{ success: boolean; message: string; data: SavedApplicantProfile }> {
  const res = await authFetch(`${BASE}/api/v1/applicants/save-profile`, {
    method: "POST",
    body: JSON.stringify(profile),
  });

  return await ApiError.handle(res) as { success: boolean; message: string; data: SavedApplicantProfile };
}

export async function getApplicantProfile(): Promise<{ success: boolean; data: SavedApplicantProfile }> {
  const res = await authFetch(`${BASE}/api/v1/applicants/profile`);
  return await ApiError.handle(res) as { success: boolean; data: SavedApplicantProfile };
}

export async function patchApplicantProfile(updates: Record<string, any>): Promise<{ success: boolean; message: string }> {
  const res = await authFetch(`${BASE}/api/v1/applicants/profile`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return await ApiError.handle(res) as { success: boolean; message: string };
}
