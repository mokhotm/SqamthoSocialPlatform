import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb',
});

async function main() {
  try {
    const result = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`);
    console.log(result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
