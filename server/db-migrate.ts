/**
 * DATABASE MIGRATION RUNNER
 * 
 * This module runs SQL migrations on server startup to ensure
 * all database tables are created/updated.
 */

import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("[Migration] No DATABASE_URL configured, skipping migrations");
    return;
  }

  console.log("[Migration] Running database migrations...");
  
  try {
    const sql = postgres(databaseUrl);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, "../../drizzle/migrations");
    
    if (!fs.existsSync(migrationsDir)) {
      console.log("[Migration] No migrations directory found, skipping");
      await sql.end();
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");
      
      console.log(`[Migration] Running: ${file}`);
      
      try {
        await sql.unsafe(sqlContent);
        console.log(`[Migration] ✅ ${file} completed`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes("already exists") || 
            error.message?.includes("duplicate") ||
            error.code === "42P07" || // relation already exists
            error.code === "42710") { // object already exists
          console.log(`[Migration] ⏭️  ${file} - already applied`);
        } else {
          console.error(`[Migration] ❌ ${file} failed:`, error.message);
        }
      }
    }

    await sql.end();
    console.log("[Migration] All migrations complete");
  } catch (error) {
    console.error("[Migration] Failed to connect to database:", error);
  }
}
