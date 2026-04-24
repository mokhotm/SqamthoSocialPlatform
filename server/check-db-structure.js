// Check database structure
import pg from 'pg';

const { Pool } = pg;

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb";

console.log('Connecting to database to check structure...');

const pool = new Pool({
  connectionString: databaseUrl,
});

async function checkDatabaseStructure() {
  const client = await pool.connect();
  
  try {
    console.log('Checking users table structure...');
    
    // Check users table columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    columnsResult.rows.forEach(column => {
      console.log(`- ${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable}, default: ${column.column_default})`);
    });
    
    // Check if there are any users in the table
    const usersResult = await client.query(`
      SELECT id, username, display_name, email 
      FROM users 
      LIMIT 5
    `);
    
    console.log(`\nFound ${usersResult.rows.length} users in the database:`);
    usersResult.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Display Name: ${user.display_name}, Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  } finally {
    client.release();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

checkDatabaseStructure();
