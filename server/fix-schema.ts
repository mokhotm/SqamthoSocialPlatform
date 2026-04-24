import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb'
});

async function fixSchema() {
  const client = await pool.connect();
  try {
    // Check if email column exists
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `);

    if (result.rows.length === 0) {
      console.log('Adding email column to users table...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT 'user@example.com'
      `);
      console.log('Email column added successfully');
    } else {
      console.log('Email column already exists');
    }

    // Check table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nCurrent users table structure:');
    console.table(tableInfo.rows);

  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchema().catch(console.error);
