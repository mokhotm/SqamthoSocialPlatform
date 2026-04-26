import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema.js';

const pool = new Pool({
  user: 'sqamtho',
  password: '$qamth0#2025', 
  host: 'localhost',
  port: 5432,
  database: 'sqamthodb',
  ssl: false
});

export const db = drizzle(pool, { schema });
