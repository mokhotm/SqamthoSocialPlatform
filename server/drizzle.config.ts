import type { Config } from 'drizzle-kit';

export default {
  schema: '../shared/schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb',
  },
} satisfies Config;
