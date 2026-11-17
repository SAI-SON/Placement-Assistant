export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication Interfaces
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  target_role?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  target_role?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AnalyzeResumeRequest {
  resumeDataUri: string;
  fileName?: string;
}

export interface LearningSuggestionsRequest {
  resumeScore: number;
  areasToImprove: string;
  resumeAnalysisId?: number;
}

export interface GenerateQuestionsRequest {
  resumeDataUri: string;
  jobDescription: string;
}

export interface EvaluateAnswerRequest {
  question: string;
  answer: string;
  resumeDataUri?: string;
  jobDescription?: string;
  sessionId?: string;
  questionIndex?: number;
}

export interface CoachChatRequest {
  query: string;
  sessionId?: string;
}

export interface GenerateResumeRequest {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name: string;
    description: string;
    tech?: string;
    link?: string;
  }>;
  templateId?: string;
}

export interface NewsQueryParams {
  state?: string;
  district?: string;
  category?: string;
}

export interface YoutubeQueryParams {
  topic: string;
  maxResults?: number;
}
