// Migration to add password column to users table
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Running migration: Adding password column to users table');
  
  try {
    // Check if password column already exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);
    
    if (Array.isArray(checkResult) && checkResult.length === 0) {
      console.log('Password column does not exist, adding it now...');
      
      // Add the password column
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN password TEXT NOT NULL DEFAULT 'changeme'
      `);
      
      console.log('Password column added successfully');
    } else {
      console.log('Password column already exists, skipping migration');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
