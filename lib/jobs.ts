import { authFetch } from "./auth";
import { JobsResponse, SingleJobResponse } from "../types/job";
import { ApiError } from "./apiError";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getPublishedJobs(): Promise<JobsResponse> {
  const res = await authFetch(`${BASE}/api/v1/jobs`);
  return await ApiError.handle(res) as JobsResponse;
}

export async function getJobById(id: string): Promise<SingleJobResponse> {
  const res = await authFetch(`${BASE}/api/v1/jobs/${id}`);
  return await ApiError.handle(res) as SingleJobResponse;
}
