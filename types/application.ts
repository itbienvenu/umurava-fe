import { Job } from "./job";

export interface ScreeningResult {
  final_score: number;
  rank: number;
  dimension_breakdown: Record<string, number>;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  screened_at: string;
}

export interface Application {
  _id: string;
  applicantId: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  job: Job;
  screening_result?: ScreeningResult;
}

export interface ApplicationResponse {
  success: boolean;
  message?: string;
  data: Application;
}

export interface ApplicationsResponse {
  success: boolean;
  message?: string;
  data: Application[];
}
