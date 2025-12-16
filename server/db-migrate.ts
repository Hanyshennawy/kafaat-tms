/**
 * DATABASE MIGRATION RUNNER
 * 
 * This module runs SQL migrations on server startup to ensure
 * all database tables are created/updated.
 * 
 * SQL is inlined because esbuild bundles to dist/ and file system paths don't work.
 */

import postgres from "postgres";

// Inline migration SQL - this gets bundled properly by esbuild
const AI_TABLES_MIGRATION = `
-- AI CONFIGURATION AND ASSESSMENT BUILDER TABLES MIGRATION

-- Question category enum for AI-generated questions
DO $$ BEGIN
  CREATE TYPE question_category_enum AS ENUM ('psychometric', 'competency', 'cognitive', 'skills', 'behavioral', 'leadership', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AI question type enum
DO $$ BEGIN
  CREATE TYPE ai_question_type_enum AS ENUM (
    'mcq', 'true_false', 'likert', 'likert_frequency', 'semantic_differential',
    'forced_choice', 'ranking', 'situational_judgment', 'scenario', 'ipsative',
    'conditional_reasoning', 'integrity_check', 'behavioral_anchor',
    'text_completion', 'pattern_matching', 'matrix_completion',
    'numerical_reasoning', 'verbal_reasoning', 'abstract_reasoning', 'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AI Configurations Table
CREATE TABLE IF NOT EXISTS ai_configurations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  config_type VARCHAR(100) NOT NULL,
  model_provider VARCHAR(50) NOT NULL DEFAULT 'together',
  model_name VARCHAR(255) NOT NULL DEFAULT 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  top_p NUMERIC(3,2) DEFAULT 0.9,
  system_prompt TEXT NOT NULL,
  context_instructions TEXT,
  output_format TEXT,
  quality_threshold INTEGER DEFAULT 7,
  is_default BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  tenant_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source_type VARCHAR(50),
  source_url TEXT,
  embedding_vector TEXT,
  tags JSONB,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  tenant_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Frameworks Table
CREATE TABLE IF NOT EXISTS assessment_frameworks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  dimensions JSONB,
  methodology TEXT,
  scoring_model JSONB,
  norm_data JSONB,
  validity_metrics JSONB,
  is_built_in BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  version VARCHAR(50) DEFAULT '1.0',
  tenant_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Question Templates Table
CREATE TABLE IF NOT EXISTS question_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  question_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  template_text TEXT NOT NULL,
  options_template JSONB,
  scoring_template JSONB,
  instructions TEXT,
  examples TEXT,
  constraints JSONB,
  difficulty VARCHAR(50),
  estimated_time INTEGER,
  tags JSONB,
  usage_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  tenant_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated Questions Bank Table
CREATE TABLE IF NOT EXISTS generated_questions_bank (
  id SERIAL PRIMARY KEY,
  question_type VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  scenario TEXT,
  instructions TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  scoring_key JSONB,
  category VARCHAR(100) NOT NULL,
  framework_id INTEGER,
  dimension VARCHAR(255),
  subdimension VARCHAR(255),
  trait_measured VARCHAR(255),
  difficulty VARCHAR(50) DEFAULT 'intermediate',
  estimated_time INTEGER DEFAULT 60,
  points INTEGER DEFAULT 1,
  tags JSONB,
  quality_score INTEGER,
  is_validity_check BOOLEAN DEFAULT false,
  is_reverse_coded BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'available',
  ai_generated BOOLEAN DEFAULT true,
  generation_config_id INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Generation Logs Table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id SERIAL PRIMARY KEY,
  request_type VARCHAR(100) NOT NULL,
  config_id INTEGER,
  prompt_used TEXT,
  response_content TEXT,
  questions_generated INTEGER DEFAULT 0,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  model_used VARCHAR(255),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  tenant_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Builder Table
CREATE TABLE IF NOT EXISTS assessment_builder (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  instructions TEXT,
  framework_id INTEGER,
  ai_config_id INTEGER,
  sections JSONB,
  total_duration INTEGER,
  section_time_limits JSONB,
  total_questions INTEGER NOT NULL,
  question_distribution JSONB,
  randomization JSONB,
  proctor_settings JSONB,
  scoring_method VARCHAR(100),
  passing_score INTEGER,
  weighting_scheme JSONB,
  show_results BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT false,
  generate_report BOOLEAN DEFAULT true,
  available_from TIMESTAMP,
  available_until TIMESTAMP,
  max_attempts INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  tenant_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Question Links Table
CREATE TABLE IF NOT EXISTS assessment_question_links (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  section_index INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  custom_points INTEGER,
  custom_time_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_configurations_type ON ai_configurations(config_type);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_status ON ai_configurations(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_status ON knowledge_base(status);
CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_code ON assessment_frameworks(code);
CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_category ON assessment_frameworks(category);
CREATE INDEX IF NOT EXISTS idx_question_templates_type ON question_templates(question_type);
CREATE INDEX IF NOT EXISTS idx_question_templates_category ON question_templates(category);
CREATE INDEX IF NOT EXISTS idx_generated_questions_bank_category ON generated_questions_bank(category);
CREATE INDEX IF NOT EXISTS idx_generated_questions_bank_type ON generated_questions_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_generated_questions_bank_status ON generated_questions_bank(status);
CREATE INDEX IF NOT EXISTS idx_assessment_builder_category ON assessment_builder(category);
CREATE INDEX IF NOT EXISTS idx_assessment_builder_status ON assessment_builder(status);
CREATE INDEX IF NOT EXISTS idx_assessment_question_links_assessment ON assessment_question_links(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_question_links_question ON assessment_question_links(question_id);
`;

const DEFAULT_DATA_MIGRATION = `
-- Insert default AI configuration for psychometric questions
INSERT INTO ai_configurations (name, config_type, model_provider, model_name, temperature, max_tokens, system_prompt, is_default, status)
SELECT 
  'Psychometric Question Generation',
  'psychometric_generation',
  'together',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  0.7,
  8192,
  'You are an expert psychometrician with deep knowledge of personality assessment, cognitive testing, and behavioral measurement. You specialize in creating high-quality assessment items based on established frameworks like Big Five (OCEAN), Hogan HPI, DISC, and SHL OPQ32. Your questions must be professionally crafted with proper scoring keys, anti-faking measures, and cultural sensitivity for UAE education context.',
  true,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE config_type = 'psychometric_generation');

-- Insert default AI configuration for competency questions
INSERT INTO ai_configurations (name, config_type, model_provider, model_name, temperature, max_tokens, system_prompt, is_default, status)
SELECT 
  'Competency Assessment Generation',
  'competency_generation',
  'together',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  0.7,
  8192,
  'You are an expert in competency-based assessment for educators, specializing in the UAE National Educators Competency Framework. You create behaviorally-anchored assessment items that measure teaching competencies across domains like Professional Knowledge, Professional Practice, and Professional Engagement. Your questions include real classroom scenarios and are aligned with UAE MOE standards.',
  true,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE config_type = 'competency_generation');

-- Insert built-in Big Five framework
INSERT INTO assessment_frameworks (name, code, category, description, methodology, is_built_in, status, dimensions)
SELECT 
  'Big Five Personality Model (OCEAN)',
  'big_five',
  'psychometric',
  'The Big Five personality traits model, also known as OCEAN, is a widely accepted psychological framework for understanding human personality.',
  'Uses normative scoring with comparison to population norms. Measures five broad dimensions through behavioral indicators and self-report items.',
  true,
  'active',
  '[{"code": "O", "name": "Openness to Experience", "description": "Intellectual curiosity, creativity, and preference for novelty"},{"code": "C", "name": "Conscientiousness", "description": "Self-discipline, organization, and goal-directed behavior"},{"code": "E", "name": "Extraversion", "description": "Energy, positive emotions, and tendency to seek stimulation"},{"code": "A", "name": "Agreeableness", "description": "Tendency to be compassionate and cooperative"},{"code": "N", "name": "Neuroticism", "description": "Tendency to experience negative emotions"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM assessment_frameworks WHERE code = 'big_five');

-- Insert built-in Hogan HPI framework
INSERT INTO assessment_frameworks (name, code, category, description, methodology, is_built_in, status, dimensions)
SELECT 
  'Hogan Personality Inventory',
  'hogan',
  'psychometric',
  'The Hogan Personality Inventory (HPI) measures normal personality characteristics required for success in careers, relationships, education, and life.',
  'Criterion-referenced scoring focused on workplace performance prediction. Uses occupationally-relevant themes.',
  true,
  'active',
  '[{"code": "ADJ", "name": "Adjustment", "description": "Confidence, self-esteem, and composure under pressure"},{"code": "AMB", "name": "Ambition", "description": "Initiative, competitiveness, and desire for leadership roles"},{"code": "SOC", "name": "Sociability", "description": "Need for social interaction and preference for working with others"},{"code": "INT", "name": "Interpersonal Sensitivity", "description": "Perceptiveness and ability to maintain relationships"},{"code": "PRU", "name": "Prudence", "description": "Self-discipline, responsibility, and thoroughness"},{"code": "INQ", "name": "Inquisitive", "description": "Imagination, curiosity, and creative potential"},{"code": "LRN", "name": "Learning Approach", "description": "Enjoyment of learning and staying current"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM assessment_frameworks WHERE code = 'hogan');

-- Insert UAE National Educators Framework
INSERT INTO assessment_frameworks (name, code, category, description, methodology, is_built_in, status, dimensions)
SELECT 
  'UAE National Educators Competency Framework',
  'national_educators',
  'competency',
  'The UAE Ministry of Education framework for educator competencies, covering teaching and learning, student support, and professional growth.',
  'Uses criterion-referenced behavioral indicators with 5-point proficiency scales from Developing to Expert.',
  true,
  'active',
  '[{"code": "TL", "name": "Teaching & Learning", "description": "Lesson Planning, Instructional Delivery, Differentiation, Technology Integration"},{"code": "SS", "name": "Student Support", "description": "Classroom Management, Student Wellbeing, Parent Engagement, Special Needs"},{"code": "PG", "name": "Professional Growth", "description": "Continuous Learning, Collaboration, Innovation, Mentoring"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM assessment_frameworks WHERE code = 'national_educators');
`;

export async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("[Migration] No DATABASE_URL configured, skipping migrations");
    return;
  }

  console.log("[Migration] 🚀 Running database migrations...");
  
  try {
    const sql = postgres(databaseUrl);
    
    // Run table creation migration
    console.log("[Migration] Creating AI tables...");
    try {
      await sql.unsafe(AI_TABLES_MIGRATION);
      console.log("[Migration] ✅ AI tables created successfully");
    } catch (error: any) {
      if (error.message?.includes("already exists") || 
          error.message?.includes("duplicate") ||
          error.code === "42P07" || 
          error.code === "42710") {
        console.log("[Migration] ⏭️  AI tables already exist");
      } else {
        console.error("[Migration] ❌ AI tables migration failed:", error.message);
      }
    }
    
    // Run default data migration
    console.log("[Migration] Inserting default data...");
    try {
      await sql.unsafe(DEFAULT_DATA_MIGRATION);
      console.log("[Migration] ✅ Default data inserted successfully");
    } catch (error: any) {
      if (error.message?.includes("already exists") || 
          error.message?.includes("duplicate")) {
        console.log("[Migration] ⏭️  Default data already exists");
      } else {
        console.error("[Migration] ❌ Default data migration failed:", error.message);
      }
    }

    await sql.end();
    console.log("[Migration] ✅ All migrations completed");
  } catch (error: any) {
    console.error("[Migration] ❌ Failed to run migrations:", error.message);
  }
}
