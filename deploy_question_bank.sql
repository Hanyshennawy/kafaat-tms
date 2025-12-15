CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_bank_id INT,
  question_text TEXT NOT NULL,
  question_context TEXT,
  question_type ENUM('multiple_choice','true_false','short_answer','essay','scenario') NOT NULL,
  difficulty_level ENUM('basic','intermediate','advanced','expert') NOT NULL,
  points INT DEFAULT 1 NOT NULL,
  explanation TEXT,
  tags TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE NOT NULL,
  ai_generation_prompt TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE NOT NULL,
  option_order INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  license_application_id INT,
  question_bank_id INT,
  exam_type ENUM('initial','renewal','upgrade','remedial') NOT NULL,
  total_questions INT NOT NULL,
  total_points INT NOT NULL,
  passing_score INT NOT NULL,
  duration INT NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  is_adaptive BOOLEAN DEFAULT FALSE NOT NULL,
  shuffle_questions BOOLEAN DEFAULT TRUE NOT NULL,
  shuffle_options BOOLEAN DEFAULT TRUE NOT NULL,
  max_attempts INT DEFAULT 3 NOT NULL,
  status ENUM('draft','published','archived') DEFAULT 'draft' NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  question_order INT NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  candidate_id INT NOT NULL,
  attempt_number INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  status ENUM('in_progress','submitted','graded','expired') DEFAULT 'in_progress' NOT NULL,
  score INT,
  percentage INT,
  passed BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_id INT,
  answer_text TEXT,
  is_correct BOOLEAN,
  points_earned INT,
  time_spent INT,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  candidate_id INT NOT NULL,
  exam_id INT NOT NULL,
  total_questions INT NOT NULL,
  questions_answered INT NOT NULL,
  correct_answers INT NOT NULL,
  incorrect_answers INT NOT NULL,
  skipped_questions INT NOT NULL,
  total_points INT NOT NULL,
  points_earned INT NOT NULL,
  percentage INT NOT NULL,
  passed BOOLEAN NOT NULL,
  grade VARCHAR(10),
  time_spent INT,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
