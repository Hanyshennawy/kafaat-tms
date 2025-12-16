/**
 * DATABASE MIGRATION RUNNER
 * 
 * Uses drizzle-kit push to sync schema with database on server startup.
 * This ensures all tables defined in schema-pg.ts are created.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("[Migration] No DATABASE_URL configured, skipping migrations");
    return;
  }

  console.log("[Migration] 🚀 Running drizzle-kit push to sync database schema...");
  
  return new Promise((resolve) => {
    // Run drizzle-kit push with auto-accept
    const child = spawn("npx", ["drizzle-kit", "push", "--force"], {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: ["ignore", "pipe", "pipe"],
      shell: true
    });
    
    let stdout = "";
    let stderr = "";
    
    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    
    child.on("close", (code) => {
      if (code === 0) {
        console.log("[Migration] ✅ Database schema synced successfully");
        if (stdout.includes("No changes")) {
          console.log("[Migration] ⏭️  Schema already up to date");
        }
      } else {
        console.error("[Migration] ⚠️  drizzle-kit push exited with code:", code);
        if (stderr) {
          console.error("[Migration] Error output:", stderr.slice(0, 500));
        }
        // Don't fail startup, just log the error
        console.log("[Migration] Continuing server startup...");
      }
      resolve();
    });
    
    child.on("error", (error) => {
      console.error("[Migration] ❌ Failed to run drizzle-kit:", error.message);
      // Don't fail startup
      resolve();
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      console.log("[Migration] ⚠️  Migration timeout, continuing startup...");
      child.kill();
      resolve();
    }, 60000);
  });
}
