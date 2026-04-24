// Direct SQL fix for password column
import pg from 'pg';

const { Pool } = pg;

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb";

console.log('Connecting to database to fix password column...');

const pool = new Pool({
  connectionString: databaseUrl,
});

async function fixPasswordColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding password column to users table if it does not exist...');
    
    // First check if the column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('Password column does not exist, adding it now...');
      
      // Add the password column
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN password TEXT NOT NULL DEFAULT 'changeme'
      `);
      
      console.log('Password column added successfully');
    } else {
      console.log('Password column already exists, no action needed');
    }
  } catch (error) {
    console.error('Error fixing password column:', error);
  } finally {
    client.release();
    console.log('Database connection closed');
    process.exit(0);
  }
}

fixPasswordColumn();
