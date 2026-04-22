export interface Skill {
  name: string;
  level: string;
  years_of_experience: number;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Experience {
  company: string;
  role: string;
  start_date: string;
  work_type: string;
  end_date: string | null;
  location: string;
  description: string;
  technologies: string[];
  is_current: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  major: string;
  location: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string | null;
  start_date: string;
  end_date: string | null;
}

export interface ApplicantProfile {
  first_name: string;
  last_name: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  gender: string;
  nationality: string;
  date_of_birth: string;
  profile_picture: string | null;
  skills: Skill[];
  languages: Language[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  availability: {
    status: string;
    type: string;
    start_date: string;
  };
  social_links: {
    linkedin: string | null;
    github: string | null;
    twitter: string | null;
  };
  preferences: {
    job_type: string;
    work_mode: string[];
    expected_salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  area_of_expertise: {
    name: string;
    experience_years: number;
  }[];
}

export interface SavedApplicantProfile {
  _id: string;
  userId: string;
  cvUrl: string;
  profile: ApplicantProfile;
  createdAt: string;
  updatedAt: string;
}

export interface CVUploadResponse {
  success: boolean;
  message: string;
  data: {
    cvUrl: string;
    profile: ApplicantProfile;
  };
}
