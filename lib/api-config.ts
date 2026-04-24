export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    refresh: `${API_BASE_URL}/api/v1/auth/refresh`,
  },
  applicants: {
    uploadCv: `${API_BASE_URL}/api/v1/applicants/upload-cv`,
    saveProfile: `${API_BASE_URL}/api/v1/applicants/save-profile`,
    profile: `${API_BASE_URL}/api/v1/applicants/profile`,
    analytics: `${API_BASE_URL}/api/v1/applicants/analytics`,
  },
  recruiters: {
    analytics: `${API_BASE_URL}/api/v1/recruiters/analytics`,
  },
  jobs: {
    base: `${API_BASE_URL}/api/v1/jobs`,
  },
  applications: {
    base: `${API_BASE_URL}/api/v1/applications`,
  },
};
