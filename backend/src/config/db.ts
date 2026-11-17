import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let rawConnectionString = process.env.DATABASE_URL || 'postgresql://postgres:saison@2005@localhost:5432/Placement';

// Auto-clean Neon pooler URLs for robust DDL transaction support
if (rawConnectionString.includes('-pooler.') && rawConnectionString.includes('neon.tech')) {
  rawConnectionString = rawConnectionString.replace('-pooler.', '.');
}

const connectionString = rawConnectionString;

const isProductionOrCloud =
  process.env.NODE_ENV === 'production' ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('supabase.co') ||
  connectionString.includes('render.com') ||
  connectionString.includes('railway.app') ||
  connectionString.includes('aivencloud.com');

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: isProductionOrCloud ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  // console.debug('[PostgreSQL Query]', { text: text.slice(0, 80), duration: `${duration}ms`, rows: res.rowCount });
  return res;
}

export async function initDatabase(): Promise<void> {
  console.log('[PostgreSQL] Initializing database schema...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. Users Table (Authentication)
    await client.query(`
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
    `);

    // 0b. Password Reset Tokens Table
    await client.query(`
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
    `);

    // 1. Resume Analyses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resume_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        file_name VARCHAR(255) DEFAULT 'uploaded_resume.pdf',
        score INTEGER NOT NULL,
        summary TEXT NOT NULL,
        what_we_loved JSONB DEFAULT '[]'::jsonb,
        whats_holding_you_back JSONB DEFAULT '[]'::jsonb,
        improvements JSONB DEFAULT '[]'::jsonb,
        raw_result JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 2. Learning Suggestions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS learning_suggestions (
        id SERIAL PRIMARY KEY,
        resume_analysis_id INTEGER REFERENCES resume_analyses(id) ON DELETE SET NULL,
        resume_score INTEGER,
        areas_to_improve TEXT,
        video_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Interview Sessions Table
    await client.query(`
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
      ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 4. Interview Evaluations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_evaluations (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(128) REFERENCES interview_sessions(session_id) ON DELETE CASCADE,
        question_index INTEGER NOT NULL,
        question TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        score INTEGER NOT NULL,
        what_you_did_well TEXT,
        how_to_improve TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. AI Coach Chat Messages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(128) DEFAULT 'default_session',
        role VARCHAR(32) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 6. Saved Resumes from Resume Generator
    await client.query(`
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
      ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 7. Cached Job News Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cached_news (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        state VARCHAR(128) NOT NULL,
        district VARCHAR(128) NOT NULL,
        articles JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);

    // 8. Cached YouTube Searches Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cached_youtube (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(255) UNIQUE NOT NULL,
        videos JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Database tables initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
}
