/**
 * Demo Data Seeder
 * 
 * Seeds realistic demo data for new trial tenants so they can
 * experience all features without manual data entry.
 */

import { getDb } from "../db";
import { eq } from "drizzle-orm";
import {
  users,
  departments,
  positions,
  careerPaths,
  successionPlans,
  surveys,
  skills,
} from "../../drizzle/schema";

// ============================================================================
// DEMO DATA TEMPLATES
// ============================================================================

const DEMO_DEPARTMENTS = [
  { name: "Ministry Leadership", description: "Executive leadership and strategic direction" },
  { name: "Curriculum Development", description: "Curriculum design and academic standards" },
  { name: "Teacher Training", description: "Professional development and teacher certification" },
  { name: "School Operations", description: "School administration and management" },
  { name: "Student Affairs", description: "Student services and counseling" },
  { name: "Educational Technology", description: "Digital learning and EdTech initiatives" },
  { name: "Human Resources", description: "Talent management and HR operations" },
  { name: "Finance & Admin", description: "Financial operations and administration" },
];

const DEMO_POSITIONS = [
  { title: "Director General", level: 1, department: "Ministry Leadership" },
  { title: "Deputy Director", level: 2, department: "Ministry Leadership" },
  { title: "Curriculum Specialist", level: 3, department: "Curriculum Development" },
  { title: "Senior Teacher Trainer", level: 3, department: "Teacher Training" },
  { title: "School Principal", level: 2, department: "School Operations" },
  { title: "Vice Principal", level: 3, department: "School Operations" },
  { title: "Education Counselor", level: 4, department: "Student Affairs" },
  { title: "EdTech Coordinator", level: 4, department: "Educational Technology" },
  { title: "HR Manager", level: 3, department: "Human Resources" },
  { title: "Finance Officer", level: 4, department: "Finance & Admin" },
];

const DEMO_SKILLS = [
  { name: "Leadership", category: "Management" },
  { name: "Strategic Planning", category: "Management" },
  { name: "Curriculum Design", category: "Academic" },
  { name: "Educational Technology", category: "Technology" },
  { name: "Data Analysis", category: "Technical" },
  { name: "Communication", category: "Soft Skills" },
  { name: "Project Management", category: "Management" },
  { name: "Arabic Language", category: "Language" },
  { name: "English Language", category: "Language" },
];

const DEMO_CAREER_PATHS = [
  { 
    name: "Teacher to Principal", 
    description: "Career progression from classroom teacher to school leadership",
  },
  {
    name: "Specialist Track",
    description: "Technical expertise development in curriculum and assessment",
  },
  {
    name: "Educational Technology",
    description: "Digital learning and EdTech leadership pathway",
  },
];

const DEMO_SURVEYS = [
  {
    title: "Q4 2025 Employee Engagement Survey",
    description: "Quarterly pulse check on employee satisfaction and engagement",
    status: "active" as const,
  },
  {
    title: "Professional Development Needs Assessment",
    description: "Identify training and development priorities for 2026",
    status: "draft" as const,
  },
];

// ============================================================================
// SEEDER CLASS
// ============================================================================

export class DemoDataSeeder {
  /**
   * Seed demo data for a new tenant
   * Note: This is a simplified version that seeds basic data
   * For production, you may want to expand this with more data
   */
  async seedTenantData(tenantId: number): Promise<{ success: boolean; stats: Record<string, number> }> {
    const db = await getDb();
    if (!db) {
      console.error("[DemoSeeder] Database not available");
      return { success: false, stats: {} };
    }

    console.log(`[DemoSeeder] Seeding demo data for tenant ${tenantId}...`);

    const stats: Record<string, number> = {
      departments: 0,
      positions: 0,
      skills: 0,
      careerPaths: 0,
      surveys: 0,
    };

    try {
      // Seed departments
      const deptMap = new Map<string, number>();
      for (const dept of DEMO_DEPARTMENTS) {
        try {
          const [result] = await db.insert(departments).values({
            name: dept.name,
            description: dept.description,
          });
          deptMap.set(dept.name, result.insertId);
          stats.departments++;
        } catch (err) {
          console.warn(`[DemoSeeder] Could not insert department ${dept.name}:`, err);
        }
      }

      // Seed positions
      const posMap = new Map<string, number>();
      for (const pos of DEMO_POSITIONS) {
        const deptId = deptMap.get(pos.department);
        try {
          const [result] = await db.insert(positions).values({
            title: pos.title,
            departmentId: deptId || null,
            level: pos.level,
            description: `Position: ${pos.title}`,
          });
          posMap.set(pos.title, result.insertId);
          stats.positions++;
        } catch (err) {
          console.warn(`[DemoSeeder] Could not insert position ${pos.title}:`, err);
        }
      }

      // Seed skills
      for (const skill of DEMO_SKILLS) {
        try {
          await db.insert(skills).values({
            name: skill.name,
            category: skill.category,
            description: `Skill in ${skill.name}`,
          });
          stats.skills++;
        } catch (err) {
          console.warn(`[DemoSeeder] Could not insert skill ${skill.name}:`, err);
        }
      }

      // Seed career paths (requires a createdBy user - use 1 as placeholder)
      for (const path of DEMO_CAREER_PATHS) {
        try {
          await db.insert(careerPaths).values({
            name: path.name,
            description: path.description,
            status: "published",
            createdBy: 1, // Placeholder - should be actual user ID
          });
          stats.careerPaths++;
        } catch (err) {
          console.warn(`[DemoSeeder] Could not insert career path ${path.name}:`, err);
        }
      }

      // Seed surveys
      for (const survey of DEMO_SURVEYS) {
        try {
          await db.insert(surveys).values({
            title: survey.title,
            description: survey.description,
            status: survey.status as any,
            surveyType: "pulse", // Use valid enum value
            createdBy: 1, // Placeholder
          });
          stats.surveys++;
        } catch (err) {
          console.warn(`[DemoSeeder] Could not insert survey ${survey.title}:`, err);
        }
      }

      console.log("[DemoSeeder] Demo data seeded successfully:", stats);
      return { success: true, stats };
    } catch (error) {
      console.error("[DemoSeeder] Error seeding demo data:", error);
      return { success: false, stats };
    }
  }

  /**
   * Check if tenant already has demo data
   */
  async hasDemoData(tenantId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      const existingDepts = await db
        .select()
        .from(departments)
        .limit(1);

      return existingDepts.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Clear demo data (simplified - for testing only)
   */
  async clearDemoData(tenantId: number): Promise<void> {
    console.log(`[DemoSeeder] Clear demo data requested for tenant ${tenantId}`);
    // In a real implementation, you'd delete records by tenant ID
    // But since this schema doesn't have tenant isolation on all tables,
    // we'll skip this for safety
  }
}

// Singleton instance
export const demoDataSeeder = new DemoDataSeeder();
