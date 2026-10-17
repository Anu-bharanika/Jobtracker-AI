export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'archived';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type ExperienceLevel = 'intern' | 'entry' | 'mid' | 'senior' | 'lead';

export interface InterviewRound {
  id: string;
  roundName: string; // e.g., 'Recruiter Screen', 'Technical / Coding', 'System Design / ML Architecture', 'Hiring Manager'
  scheduledAt?: string; // ISO date string
  completed: boolean;
  notes?: string;
  interviewer?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  location: string;
  workMode: WorkMode;
  salaryRange?: string;
  url?: string;
  appliedDate?: string;
  status: ApplicationStatus;
  matchScore: number; // 0 - 100
  experienceLevel: ExperienceLevel;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  recruiterName?: string;
  recruiterEmail?: string;
  linkedInUrl?: string;
  linkedGitHubRepo?: string; // e.g. "github.com/alex-chen/llm-rag-agent"
  notes: string;
  interviewRounds: InterviewRound[];
  nextFollowUpDate?: string;
  source: 'manual' | 'url_ingest' | 'linkedin' | 'github' | 'email';
  createdAt: string;
  updatedAt: string;
  history: {
    id: string;
    date: string;
    fromStatus?: ApplicationStatus;
    toStatus: ApplicationStatus;
    note: string;
  }[];
}

export interface CandidateProfile {
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  targetRole?: string;
  headline: string; // e.g., "M.S. Data Science & AI @ Stanford | ML Researcher"
  bio?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  education: {
    institution: string;
    degree: string;
    field: string;
    gradYear: string;
    gpa?: string;
  }[];
  skills: {
    category: string; // "Core ML & Modeling", "Deep Learning & LLMs", "Data Engineering & Systems", "Languages & Tools"
    items: string[];
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    id: string;
    title: string;
    techStack: string[];
    description: string;
    githubUrl?: string;
    bullets: string[];
  }[];
  rawResumeText: string;
  lastUpdated: string;
}

export interface IngestedEmail {
  id: string;
  sender: string;
  subject: string;
  date: string;
  bodySnippet: string;
  detectedCompany: string;
  detectedStatus: ApplicationStatus;
  confidence: number; // 0 - 100
  extractedDetails: {
    actionRequired?: string;
    interviewDate?: string;
    recruiterName?: string;
  };
  linkedApplicationId?: string;
  isProcessed: boolean;
}

export interface LinkedInContact {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  outreachStatus: 'not_contacted' | 'connected' | 'inmail_sent' | 'replied' | 'referral_agreed';
  lastInteractionDate?: string;
  notes?: string;
}

export interface GitHubRepoSync {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  url: string;
  pushedAt: string;
  readinessScore: number; // 0-100 based on README, tests, docs
}

export interface AppNotification {
  id: string;
  type: 'follow_up' | 'interview_reminder' | 'status_update' | 'email_ingested';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  applicationId?: string;
  actionPayload?: {
    type: 'draft_email' | 'view_job' | 'schedule';
    suggestedEmail?: {
      to: string;
      subject: string;
      body: string;
    };
  };
}
