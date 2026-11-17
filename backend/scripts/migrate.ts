import { pool, initDatabase } from '../src/config/db';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const isReset = process.argv.includes('--reset');

  console.log('====================================================');
  console.log('   Placement Assistant — PostgreSQL Database Migration');
  console.log('====================================================');
  console.log(`Database URL: ${process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@')}`);
  console.log(`Mode: ${isReset ? 'RESET (Drop & Recreate)' : 'SAFE (Create IF NOT EXISTS)'}`);
  console.log('----------------------------------------------------');

  const client = await pool.connect();
  try {
    if (isReset) {
      console.log('⚠️  Dropping all existing application tables...');
      await client.query(`
        DROP TABLE IF EXISTS password_resets CASCADE;
        DROP TABLE IF EXISTS interview_evaluations CASCADE;
        DROP TABLE IF EXISTS interview_sessions CASCADE;
        DROP TABLE IF EXISTS learning_suggestions CASCADE;
        DROP TABLE IF EXISTS resume_analyses CASCADE;
        DROP TABLE IF EXISTS chat_messages CASCADE;
        DROP TABLE IF EXISTS saved_resumes CASCADE;
        DROP TABLE IF EXISTS cached_news CASCADE;
        DROP TABLE IF EXISTS cached_youtube CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      console.log('✓ All application tables dropped successfully.');
    }

    console.log('⏳ Running schema migrations...');
    await initDatabase();

    // Inspect table row counts
    const tables = [
      'users',
      'password_resets',
      'resume_analyses',
      'learning_suggestions',
      'interview_sessions',
      'interview_evaluations',
      'chat_messages',
      'saved_resumes',
      'cached_news',
      'cached_youtube',
    ];

    console.log('\n📊 Database Status / Table Row Counts:');
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) AS count FROM ${table}`);
        console.log(`   - ${table.padEnd(24)} : ${res.rows[0].count} rows`);
      } catch (err: any) {
        console.log(`   - ${table.padEnd(24)} : error (${err.message})`);
      }
    }

    console.log('\n✅ Database migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
