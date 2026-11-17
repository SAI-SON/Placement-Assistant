/**
 * PostgreSQL Database Entity Types for Placement Assistant
 */

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  avatar_url?: string | null;
  role: string;
  target_role?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  bio?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PasswordResetRecord {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface ResumeAnalysisRecord {
  id: number;
  user_id?: number | null;
  file_name: string;
  score: number;
  summary: string;
  what_we_loved: string[];
  whats_holding_you_back: string[];
  improvements: Array<{
    title: string;
    whatsWrong: string;
    howToFix: string;
  }>;
  raw_result?: any;
  created_at: Date;
}

export interface LearningSuggestionRecord {
  id: number;
  resume_analysis_id: number | null;
  resume_score: number;
  areas_to_improve: string;
  video_suggestions: string[];
  created_at: Date;
}

export interface InterviewSessionRecord {
  id: number;
  user_id?: number | null;
  session_id: string;
  job_description: string;
  questions: Array<{
    questionNumber: number;
    question: string;
  }>;
  overall_score: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface InterviewEvaluationRecord {
  id: number;
  session_id: string;
  question_index: number;
  question: string;
  user_answer: string;
  score: number;
  what_you_did_well: string;
  how_to_improve: string;
  created_at: Date;
}

export interface ChatMessageRecord {
  id: number;
  user_id?: number | null;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
}

export interface SavedResumeRecord {
  id: number;
  user_id?: number | null;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  form_data: any;
  text_resume: string;
  formatted_markdown: string;
  suggestions: string[];
  created_at: Date;
}

export interface CachedNewsRecord {
  id: number;
  cache_key: string;
  state: string;
  district: string;
  articles: any[];
  created_at: Date;
  expires_at: Date;
}

export interface CachedYouTubeRecord {
  id: number;
  topic: string;
  videos: any[];
  created_at: Date;
  expires_at: Date;
}
