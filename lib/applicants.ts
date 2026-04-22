import { authFetch } from "./auth";
import { CVUploadResponse, SavedApplicantProfile, ApplicantProfile } from "../types/applicant";
import { ApiError } from "./apiError";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: SavedApplicantProfile;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
}

export async function uploadCV(file: File): Promise<CVUploadResponse> {
  const formData = new FormData();
  formData.append("cv", file);

  const res = await authFetch(`${BASE}/api/v1/applicants/upload-cv`, {
    method: "POST",
    body: formData,
  });

  return await ApiError.handle(res) as CVUploadResponse;
}

export async function saveProfile(profile: Partial<ApplicantProfile>): Promise<ProfileResponse> {
  const res = await authFetch(`${BASE}/api/v1/applicants/save-profile`, {
    method: "POST",
    body: JSON.stringify(profile),
  });

  return await ApiError.handle(res) as ProfileResponse;
}

export async function getApplicantProfile(): Promise<ProfileResponse> {
  const res = await authFetch(`${BASE}/api/v1/applicants/profile`);
  return await ApiError.handle(res) as ProfileResponse;
}

export async function patchApplicantProfile(updates: Partial<ApplicantProfile>): Promise<ProfileUpdateResponse> {
  const res = await authFetch(`${BASE}/api/v1/applicants/profile`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return await ApiError.handle(res) as ProfileUpdateResponse;
}
