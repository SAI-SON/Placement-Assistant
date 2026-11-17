import { pool, initDatabase } from '../src/config/db';
import dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  console.log('====================================================');
  console.log('   Placement Assistant — PostgreSQL Database Verification');
  console.log('====================================================');

  await initDatabase();
  const client = await pool.connect();

  try {
    const userCount = await client.query('SELECT COUNT(*) AS count FROM users');
    const resumeCount = await client.query('SELECT COUNT(*) AS count FROM resume_analyses');
    const interviewCount = await client.query('SELECT COUNT(*) AS count FROM interview_sessions');
    const resumeBuilderCount = await client.query('SELECT COUNT(*) AS count FROM saved_resumes');

    console.log('📊 Current Live PostgreSQL Records (Real Data Only):');
    console.log(`   - Users registered          : ${userCount.rows[0].count}`);
    console.log(`   - Resumes uploaded & parsed : ${resumeCount.rows[0].count}`);
    console.log(`   - Mock interviews conducted : ${interviewCount.rows[0].count}`);
    console.log(`   - Resumes built in builder  : ${resumeBuilderCount.rows[0].count}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Database verification error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
