-- =============================================================================
-- Placement Assistant - PostgreSQL Database Schema
-- Database Name: Placement
-- =============================================================================

-- 0. User Accounts Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  target_role VARCHAR(128) DEFAULT 'Full-Stack Developer',
  phone VARCHAR(64),
  location VARCHAR(255),
  linkedin VARCHAR(255),
  github VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS target_role VARCHAR(128) DEFAULT 'Full-Stack Developer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

-- 0b. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets (user_id);

-- 1. Resume Analyses & Scoring Table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) DEFAULT 'uploaded_resume.pdf',
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  summary TEXT NOT NULL,
  what_we_loved JSONB DEFAULT '[]'::jsonb,
  whats_holding_you_back JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  raw_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses (created_at DESC);

-- 2. Personalized Learning Suggestions Table
CREATE TABLE IF NOT EXISTS learning_suggestions (
  id SERIAL PRIMARY KEY,
  resume_analysis_id INTEGER REFERENCES resume_analyses(id) ON DELETE SET NULL,
  resume_score INTEGER,
  areas_to_improve TEXT,
  video_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mock Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(128) UNIQUE NOT NULL,
  job_description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_score INTEGER DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_session_id ON interview_sessions (session_id);

-- 4. Mock Interview Answer Evaluations Table
CREATE TABLE IF NOT EXISTS interview_evaluations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(128) REFERENCES interview_sessions(session_id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  what_you_did_well TEXT,
  how_to_improve TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI Career Coach Chat History Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(128) DEFAULT 'default_session',
  role VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (session_id, created_at ASC);

-- 6. Saved Resumes from AI Resume Builder
CREATE TABLE IF NOT EXISTS saved_resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(64),
  location VARCHAR(255),
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  form_data JSONB,
  text_resume TEXT,
  formatted_markdown TEXT,
  suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cached Job Market Telemetry Table
CREATE TABLE IF NOT EXISTS cached_news (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  state VARCHAR(128) NOT NULL,
  district VARCHAR(128) NOT NULL,
  articles JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 8. Cached YouTube Learning Searches Table
CREATE TABLE IF NOT EXISTS cached_youtube (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(255) UNIQUE NOT NULL,
  videos JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
