/**
 * DATABASE MIGRATION RUNNER
 * 
 * Creates AI configuration tables using raw SQL that matches schema-pg.ts exactly.
 * This runs on server startup before any routes are registered.
 */

import postgres from "postgres";

// SQL that matches the exact Drizzle schema from schema-pg.ts
const MIGRATION_SQL = `
-- Create enums first (with IF NOT EXISTS logic using DO blocks)
DO $$ BEGIN
  CREATE TYPE ai_model_provider AS ENUM ('together', 'openai', 'ollama', 'anthropic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_config_status AS ENUM ('active', 'inactive', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE knowledge_base_type AS ENUM ('competency_framework', 'psychometric_methodology', 'assessment_rubric', 'question_template', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE assessment_framework_type AS ENUM ('big_five', 'hogan', 'disc', 'mbti', 'eq', 'shl', 'gallup', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type_advanced AS ENUM (
    'mcq', 'true_false', 'likert', 'rating_scale', 'scenario', 'forced_choice', 
    'ranking', 'matching', 'fill_blank', 'short_answer', 'essay', 'open_ended',
    'situational_judgment', 'ipsative_pair', 'ipsative_quad', 'semantic_differential',
    'behavioral_anchor', 'conditional_reasoning', 'case_study', 'video_response'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE assessment_category AS ENUM ('psychometric', 'competency', 'cognitive', 'skills', 'behavioral', 'leadership', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AI Configurations Table (matches aiConfigurations in schema-pg.ts)
CREATE TABLE IF NOT EXISTS ai_configurations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  config_type VARCHAR(100) NOT NULL,
  model_provider ai_model_provider NOT NULL DEFAULT 'together',
  model_name VARCHAR(255) NOT NULL,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  top_p NUMERIC(3,2) DEFAULT 0.9,
  system_prompt TEXT NOT NULL,
  context_instructions TEXT,
  output_format TEXT,
  quality_threshold INTEGER DEFAULT 7,
  diversity_weight NUMERIC(3,2) DEFAULT 0.5,
  difficulty_calibration TEXT,
  status ai_config_status NOT NULL DEFAULT 'active',
  is_default BOOLEAN DEFAULT false,
  created_by INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Knowledge Base Table (matches knowledgeBase in schema-pg.ts)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  knowledge_type knowledge_base_type NOT NULL,
  category VARCHAR(100),
  content TEXT NOT NULL,
  structured_data JSON,
  embedding TEXT,
  source VARCHAR(255),
  version VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  status ai_config_status NOT NULL DEFAULT 'active',
  priority INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_by INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Assessment Frameworks Config Table (matches assessmentFrameworks in schema-pg.ts)
CREATE TABLE IF NOT EXISTS assessment_frameworks_config (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  framework_type assessment_framework_type NOT NULL,
  category assessment_category NOT NULL,
  description TEXT,
  methodology TEXT,
  dimensions JSON,
  scoring_rules JSON,
  normative_data JSON,
  question_types JSON,
  ai_config_id INTEGER,
  prompt_template TEXT,
  example_questions TEXT,
  validity_indicators JSON,
  reliability_metrics JSON,
  anti_faking_measures JSON,
  status ai_config_status NOT NULL DEFAULT 'active',
  is_built_in BOOLEAN DEFAULT false,
  created_by INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Question Templates Table (matches questionTemplates in schema-pg.ts)
CREATE TABLE IF NOT EXISTS question_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  question_type question_type_advanced NOT NULL,
  category assessment_category NOT NULL,
  template_text TEXT NOT NULL,
  options_template JSON,
  scoring_template JSON,
  instructions TEXT,
  examples TEXT,
  constraints JSON,
  difficulty VARCHAR(50),
  estimated_time INTEGER,
  tags JSON,
  status ai_config_status NOT NULL DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  created_by INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Assessment Builder Table (matches assessmentBuilder in schema-pg.ts)
CREATE TABLE IF NOT EXISTS assessment_builder (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL,
  category assessment_category NOT NULL,
  description TEXT,
  instructions TEXT,
  framework_id INTEGER,
  ai_config_id INTEGER,
  sections JSON,
  total_duration INTEGER,
  section_time_limits JSON,
  total_questions INTEGER NOT NULL,
  question_distribution JSON,
  randomization JSON,
  proctor_settings JSON,
  scoring_method VARCHAR(50),
  passing_score INTEGER,
  weighting_scheme JSON,
  show_results BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT false,
  generate_report BOOLEAN DEFAULT true,
  available_from TIMESTAMP,
  available_until TIMESTAMP,
  max_attempts INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_by INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Generated Questions Bank Table (matches generatedQuestionsBank in schema-pg.ts)
CREATE TABLE IF NOT EXISTS generated_questions_bank (
  id SERIAL PRIMARY KEY,
  question_type question_type_advanced NOT NULL,
  question_text TEXT NOT NULL,
  scenario TEXT,
  instructions TEXT,
  options JSON,
  correct_answer TEXT,
  explanation TEXT,
  scoring_key JSON,
  category assessment_category NOT NULL,
  framework_id INTEGER,
  dimension VARCHAR(100),
  subdimension VARCHAR(100),
  trait_measured VARCHAR(100),
  difficulty VARCHAR(50),
  estimated_time INTEGER,
  points INTEGER DEFAULT 1,
  tags JSON,
  ai_config_id INTEGER,
  generation_prompt TEXT,
  model_used VARCHAR(255),
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  quality_score INTEGER,
  review_status VARCHAR(50) DEFAULT 'pending',
  reviewed_by INTEGER,
  review_notes TEXT,
  is_validity_check BOOLEAN DEFAULT false,
  is_reverse_coded BOOLEAN DEFAULT false,
  paired_with_id INTEGER,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'available',
  created_by INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
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
  user_id INTEGER,
  tenant_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_configurations_config_type ON ai_configurations(config_type);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_status ON ai_configurations(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_knowledge_type ON knowledge_base(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_config_code ON assessment_frameworks_config(code);
CREATE INDEX IF NOT EXISTS idx_question_templates_question_type ON question_templates(question_type);
CREATE INDEX IF NOT EXISTS idx_assessment_builder_category ON assessment_builder(category);
CREATE INDEX IF NOT EXISTS idx_generated_questions_bank_category ON generated_questions_bank(category);
CREATE INDEX IF NOT EXISTS idx_generated_questions_bank_question_type ON generated_questions_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_config_id ON ai_generation_logs(config_id);
`;

// Default AI configurations to insert
const DEFAULT_DATA_SQL = `
-- Insert default psychometric AI config if not exists
INSERT INTO ai_configurations (name, config_type, model_provider, model_name, temperature, max_tokens, system_prompt, is_default, status)
SELECT 
  'Psychometric Question Generation',
  'psychometric_generation',
  'together',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  0.7,
  8192,
  'You are an expert psychometrician with deep knowledge of personality assessment, cognitive testing, and behavioral measurement. You specialize in creating high-quality assessment items based on established frameworks like Big Five (OCEAN), Hogan HPI, DISC, and SHL OPQ32. Your questions must be professionally crafted with proper scoring keys, anti-faking measures, and cultural sensitivity for UAE education context. Always return valid JSON.',
  true,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE config_type = 'psychometric_generation');

-- Insert default competency AI config if not exists
INSERT INTO ai_configurations (name, config_type, model_provider, model_name, temperature, max_tokens, system_prompt, is_default, status)
SELECT 
  'Competency Assessment Generation',
  'competency_generation',
  'together',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  0.7,
  8192,
  'You are an expert in competency-based assessment for educators, specializing in the UAE National Educators Competency Framework. You create behaviorally-anchored assessment items that measure teaching competencies across domains like Professional Knowledge, Professional Practice, and Professional Engagement. Your questions include real classroom scenarios and are aligned with UAE MOE standards. Always return valid JSON.',
  true,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE config_type = 'competency_generation');

-- Insert Big Five framework if not exists
INSERT INTO assessment_frameworks_config (name, code, framework_type, category, description, methodology, is_built_in, status, dimensions)
SELECT 
  'Big Five Personality Model (OCEAN)',
  'big_five',
  'big_five',
  'psychometric',
  'The Big Five personality traits model measures five broad dimensions of personality.',
  'Uses normative scoring with comparison to population norms.',
  true,
  'active',
  '[{"code": "O", "name": "Openness", "description": "Openness to experience"},{"code": "C", "name": "Conscientiousness", "description": "Self-discipline and organization"},{"code": "E", "name": "Extraversion", "description": "Social energy and assertiveness"},{"code": "A", "name": "Agreeableness", "description": "Cooperation and trust"},{"code": "N", "name": "Neuroticism", "description": "Emotional stability"}]'::json
WHERE NOT EXISTS (SELECT 1 FROM assessment_frameworks_config WHERE code = 'big_five');
`;

export async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("[Migration] No DATABASE_URL configured, skipping migrations");
    return;
  }

  console.log("[Migration] 🚀 Running database migrations...");
  
  try {
    // Add SSL for Render connections
    const isExternalConnection = databaseUrl.includes('.render.com') || 
                                  databaseUrl.includes('.postgres.database.azure.com');
    const dbUrl = isExternalConnection && !databaseUrl.includes('sslmode=') 
      ? databaseUrl + (databaseUrl.includes('?') ? '&sslmode=require' : '?sslmode=require')
      : databaseUrl;
    
    const sql = postgres(dbUrl);
    
    // Run table creation
    console.log("[Migration] Creating AI configuration tables...");
    await sql.unsafe(MIGRATION_SQL);
    console.log("[Migration] ✅ Tables created successfully");
    
    // Insert default data
    console.log("[Migration] Inserting default configurations...");
    await sql.unsafe(DEFAULT_DATA_SQL);
    console.log("[Migration] ✅ Default data inserted");
    
    await sql.end();
    console.log("[Migration] ✅ All migrations completed successfully");
    
  } catch (error: any) {
    // Handle "already exists" errors gracefully
    if (error.message?.includes("already exists") || 
        error.code === "42P07" || 
        error.code === "42710") {
      console.log("[Migration] ⏭️  Tables already exist, skipping");
    } else {
      console.error("[Migration] ⚠️  Migration error:", error.message);
      // Don't throw - let server continue
    }
  }
}
