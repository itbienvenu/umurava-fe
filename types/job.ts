export interface Job {
  _id: string;
  title: string;
  employment_type: string;
  seniority_level: string;
  company: {
    name: string;
    location: {
      city: string;
      country: string;
    };
  };
  description: {
    raw: string;
    summary: string;
  };
  requirements: {
    experience: {
      min_years: number;
      max_years: number | null;
      roles: string[];
    };
    education: {
      level: string;
      fields: string[];
    }[];
    certifications: string[];
  };
  skills: {
    name: string;
    category: string;
    required: boolean;
    level: string;
  }[];
  soft_skills: {
    name: string;
  }[];
  resources: {
    name: string;
    required: boolean;
  }[];
  domain: {
    primary: string;
    secondary: string[];
  };
  responsibilities: string[];
  languages: string[];
  travel_required: boolean;
  metadata: {
    status: string;
    created_at: string;
    updated_at: string;
    source: string;
  };
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
}

export interface SingleJobResponse {
  success: boolean;
  data: Job;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}
