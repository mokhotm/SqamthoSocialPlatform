import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb',
});

async function main() {
  console.log('Running migrations...');
  try {
    const migrationFiles = await fs.readdir('./migrations');
    const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      console.log(`Running migration ${file}...`);
      const sql = await fs.readFile(path.join('./migrations', file), 'utf8');
      await pool.query(sql);
    }

    console.log('Migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
