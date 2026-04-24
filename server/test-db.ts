import pg from 'pg';
const { Pool } = pg;

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb";

async function testConnection() {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    console.log('Attempting to connect to PostgreSQL...');
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    const result = await client.query('SELECT * FROM users LIMIT 1');
    console.log('Found users:', result.rows);
    
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
