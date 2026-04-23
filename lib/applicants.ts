import { authFetch, getTokens } from "./auth";
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

export async function uploadCV(file: File, onProgress?: (percent: number) => void): Promise<CVUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("cv", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onreadystatechange = async () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response as CVUploadResponse);
          } catch (err) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || "Upload failed"));
          } catch (err) {
            reject(new Error("Upload failed"));
          }
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.open("POST", `${BASE}/api/v1/applicants/upload-cv`);
    
    // Add auth header if token exists
    const { accessToken } = getTokens();
    if (accessToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }
    
    xhr.send(formData);
  });
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

export async function getApplicantAnalytics(): Promise<{ success: boolean; data: any }> {
  const res = await authFetch(`${BASE}/api/v1/applicants/analytics`);
  return await ApiError.handle(res) as { success: boolean; data: any };
}
