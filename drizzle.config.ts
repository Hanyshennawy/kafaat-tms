import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Add SSL for external connections (Render requires SSL)
const isExternalConnection = connectionString.includes('.render.com') || 
                             connectionString.includes('.postgres.database.azure.com');
const dbUrl = isExternalConnection && !connectionString.includes('sslmode=') 
  ? `${connectionString}?sslmode=require` 
  : connectionString;

export default defineConfig({
  schema: "./drizzle/schema-pg.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
