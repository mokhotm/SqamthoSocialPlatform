import pg from 'pg';
import { readFile } from 'fs/promises';
import { join } from 'path';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb',
});

async function main() {
  try {
    console.log('Running migration...');
    const sql = await readFile(join(process.cwd(), 'migrations', '0008_add_conversations.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

main();
