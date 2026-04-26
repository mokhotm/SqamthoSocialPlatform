import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const pool = new Pool({ // Export the pool
  user: 'sqamtho',
  password: '$qamth0#2025', // Passwords with special chars are better defined explicitly
  host: 'localhost',
  port: 5432,
  database: 'sqamthodb',
  ssl: false // Explicitly disable SSL for local connections
});

export const db = drizzle(pool);
