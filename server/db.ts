import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const pool = new Pool({ // Export the pool
  connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb',
});

export const db = drizzle(pool);
