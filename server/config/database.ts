import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';

const pool = new Pool({
  connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb',
});

export const db = drizzle(pool, { schema });
