import { defineConfig } from "drizzle-kit";

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb"; // URL-encoded '#' in password

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
