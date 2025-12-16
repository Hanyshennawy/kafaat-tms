/**
 * ADVANCED PSYCHOMETRIC ASSESSMENT SERVICE
 * 
 * Implements research-backed techniques from leading assessment providers:
 * - SHL (Situational Judgment Tests)
 * - Hogan (Personality Inventory with anti-faking measures)
 * - Gallup (Strengths-based assessment)
 * - Predictive Index (Behavioral assessment)
 * 
 * Key Advanced Techniques:
 * 1. FORCED-CHOICE (IPSATIVE) QUESTIONS - Prevents social desirability bias
 * 2. SITUATIONAL JUDGMENT TESTS (SJT) - Realistic workplace scenarios
 * 3. REVERSE-CODED ITEMS - Detects random/careless responding
 * 4. RESPONSE TIME TRACKING - Identifies coached/manipulated responses
 * 5. CONSISTENCY CHECKS - Cross-validates responses across similar items
 * 6. IMPRESSION MANAGEMENT DETECTION - Identifies "faking good"
 * 7. ANCHORED BEHAVIORAL SCALES - Clear behavioral indicators
 */

export interface AdvancedQuestion {
  id: string;
  type: 'ipsative_pair' | 'ipsative_quad' | 'situational_judgment' | 'behavioral_anchor' | 
        'ranking' | 'semantic_differential' | 'conditional_reasoning' | 'integrity_check';
  dimension: string;
  subdimension?: string;
  text: string;
  scenario?: string;
  instructions?: string;
  options: AdvancedOption[];
  // Anti-faking measures
  isValidityCheck?: boolean;
  isPairedWith?: string; // ID of consistency check question
  isReverseCoded?: boolean;
  expectedResponseTime?: { min: number; max: number }; // in seconds
  // Scoring metadata
  scoringKey: ScoringKey;
  weight: number;
  difficultyLevel: 'basic' | 'standard' | 'advanced';
}

export interface AdvancedOption {
  id: string;
  text: string;
  traits: { trait: string; score: number }[]; // Multi-trait scoring
  socialDesirability: 'high' | 'medium' | 'low' | 'neutral';
  behavioralAnchor?: string;
}

export interface ScoringKey {
  method: 'ipsative' | 'normative' | 'criterion' | 'competency';
  traitWeights: Record<string, number>;
  reverseCoding?: boolean;
  validityIndicators?: string[];
}

// ============================================================================
// ADVANCED QUESTION TYPES - RESEARCH-BASED
// ============================================================================

/**
 * IPSATIVE (FORCED-CHOICE) QUESTIONS
 * 
 * Based on: Hogan HPI, SHL OPQ32
 * Purpose: Eliminates social desirability bias by forcing choice between 
 *          equally desirable (or undesirable) options
 */
export const IPSATIVE_QUESTIONS: AdvancedQuestion[] = [
  // QUAD FORMAT - Choose Most and Least Like Me
  {
    id: 'IP001',
    type: 'ipsative_quad',
    dimension: 'Personality',
    text: 'Select which statement is MOST like you and which is LEAST like you',
    instructions: 'All four statements describe positive qualities. Choose based on your natural tendencies, not what you think is ideal.',
    options: [
      {
        id: 'a',
        text: 'I enjoy analyzing problems and finding logical solutions',
        traits: [{ trait: 'Openness', score: 4 }, { trait: 'Conscientiousness', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Approaches challenges analytically'
      },
      {
        id: 'b',
        text: 'I build rapport quickly and enjoy team collaboration',
        traits: [{ trait: 'Extraversion', score: 4 }, { trait: 'Agreeableness', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Initiates social connections naturally'
      },
      {
        id: 'c',
        text: 'I maintain composure under pressure and stay focused',
        traits: [{ trait: 'Emotional Stability', score: 4 }, { trait: 'Conscientiousness', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Remains calm in stressful situations'
      },
      {
        id: 'd',
        text: 'I adapt quickly to new situations and embrace change',
        traits: [{ trait: 'Openness', score: 4 }, { trait: 'Emotional Stability', score: 2 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Demonstrates flexibility and adaptability'
      }
    ],
    scoringKey: {
      method: 'ipsative',
      traitWeights: { 'Openness': 1, 'Conscientiousness': 1, 'Extraversion': 1, 'Agreeableness': 1, 'Emotional Stability': 1 }
    },
    weight: 2.0,
    difficultyLevel: 'standard'
  },
  {
    id: 'IP002',
    type: 'ipsative_quad',
    dimension: 'Work Style',
    text: 'In my professional approach, I typically:',
    instructions: 'Select which is MOST like you and which is LEAST like you',
    options: [
      {
        id: 'a',
        text: 'Focus on details and ensure accuracy in all work',
        traits: [{ trait: 'Conscientiousness', score: 5 }, { trait: 'Openness', score: 1 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Produces error-free, precise work'
      },
      {
        id: 'b',
        text: 'Take initiative and drive projects forward independently',
        traits: [{ trait: 'Conscientiousness', score: 3 }, { trait: 'Extraversion', score: 4 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Self-starts without waiting for direction'
      },
      {
        id: 'c',
        text: 'Support colleagues and ensure everyone feels included',
        traits: [{ trait: 'Agreeableness', score: 5 }, { trait: 'Extraversion', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Prioritizes team harmony and inclusion'
      },
      {
        id: 'd',
        text: 'Challenge conventional approaches and suggest innovations',
        traits: [{ trait: 'Openness', score: 5 }, { trait: 'Agreeableness', score: 1 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Questions status quo constructively'
      }
    ],
    scoringKey: {
      method: 'ipsative',
      traitWeights: { 'Openness': 1, 'Conscientiousness': 1, 'Extraversion': 1, 'Agreeableness': 1 }
    },
    weight: 2.0,
    difficultyLevel: 'standard'
  },
  // PAIR FORMAT - Choose between two options
  {
    id: 'IP003',
    type: 'ipsative_pair',
    dimension: 'Leadership Style',
    text: 'Which approach do you prefer when leading a team?',
    options: [
      {
        id: 'a',
        text: 'Setting clear expectations and holding team members accountable for results',
        traits: [{ trait: 'Task Orientation', score: 5 }, { trait: 'Relationship Orientation', score: 2 }],
        socialDesirability: 'neutral',
        behavioralAnchor: 'Results-focused leadership'
      },
      {
        id: 'b',
        text: 'Building strong relationships and supporting team development',
        traits: [{ trait: 'Relationship Orientation', score: 5 }, { trait: 'Task Orientation', score: 2 }],
        socialDesirability: 'neutral',
        behavioralAnchor: 'People-focused leadership'
      }
    ],
    scoringKey: {
      method: 'ipsative',
      traitWeights: { 'Task Orientation': 1, 'Relationship Orientation': 1 }
    },
    weight: 1.5,
    difficultyLevel: 'basic'
  }
];

/**
 * SITUATIONAL JUDGMENT TESTS (SJT)
 * 
 * Based on: SHL Situational Judgment Tests, McDaniel et al. research
 * Purpose: Measures practical judgment in realistic work scenarios
 * Technique: No obviously "correct" answer - all options are defensible
 */
export const SITUATIONAL_JUDGMENT_QUESTIONS: AdvancedQuestion[] = [
  {
    id: 'SJT001',
    type: 'situational_judgment',
    dimension: 'Professional Judgment',
    subdimension: 'Conflict Resolution',
    text: 'Rank these responses from MOST effective (1) to LEAST effective (4)',
    scenario: 'During a parent-teacher meeting, a parent becomes visibly upset and raises their voice, accusing you of unfairly grading their child. Other parents in the waiting area can hear the conversation.',
    options: [
      {
        id: 'a',
        text: 'Firmly but calmly explain that you cannot continue the meeting if they raise their voice, and offer to reschedule',
        traits: [{ trait: 'Assertiveness', score: 4 }, { trait: 'Emotional Regulation', score: 5 }],
        socialDesirability: 'high',
        behavioralAnchor: 'Sets boundaries while remaining professional'
      },
      {
        id: 'b',
        text: 'Acknowledge their frustration and suggest moving to a private room to discuss their concerns in detail',
        traits: [{ trait: 'Empathy', score: 5 }, { trait: 'Problem Solving', score: 4 }],
        socialDesirability: 'high',
        behavioralAnchor: 'De-escalates through empathy and privacy'
      },
      {
        id: 'c',
        text: 'Show them the grading rubric and examples of their child\'s work compared to higher-scoring submissions',
        traits: [{ trait: 'Evidence-Based', score: 4 }, { trait: 'Empathy', score: 2 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Uses evidence to address concerns'
      },
      {
        id: 'd',
        text: 'Apologize for any perceived unfairness and offer to review the grade with fresh eyes',
        traits: [{ trait: 'Agreeableness', score: 5 }, { trait: 'Integrity', score: 2 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Prioritizes relationship over principle'
      }
    ],
    scoringKey: {
      method: 'criterion',
      traitWeights: { 'Judgment': 2, 'Conflict Resolution': 2, 'Professional Behavior': 1 }
    },
    weight: 3.0,
    difficultyLevel: 'advanced'
  },
  {
    id: 'SJT002',
    type: 'situational_judgment',
    dimension: 'Ethical Reasoning',
    text: 'How would you respond to this situation?',
    scenario: 'You discover that a well-liked colleague has been inflating attendance records for students who frequently miss class. The colleague explains they\'re trying to help students avoid academic probation.',
    options: [
      {
        id: 'a',
        text: 'Report the issue immediately to administration, documenting what you observed',
        traits: [{ trait: 'Integrity', score: 5 }, { trait: 'Agreeableness', score: 1 }],
        socialDesirability: 'low',
        behavioralAnchor: 'Prioritizes institutional integrity'
      },
      {
        id: 'b',
        text: 'Speak privately with your colleague first, expressing your concerns and encouraging them to self-report',
        traits: [{ trait: 'Integrity', score: 4 }, { trait: 'Relationship', score: 4 }],
        socialDesirability: 'high',
        behavioralAnchor: 'Balances ethics with collegiality'
      },
      {
        id: 'c',
        text: 'Consult confidentially with a trusted senior colleague or mentor about how to proceed',
        traits: [{ trait: 'Prudence', score: 4 }, { trait: 'Integrity', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Seeks guidance before acting'
      },
      {
        id: 'd',
        text: 'Mind your own business - it\'s not your responsibility to police colleagues',
        traits: [{ trait: 'Integrity', score: 1 }, { trait: 'Self-Preservation', score: 5 }],
        socialDesirability: 'low',
        behavioralAnchor: 'Avoids involvement in ethical issues'
      }
    ],
    scoringKey: {
      method: 'criterion',
      traitWeights: { 'Integrity': 3, 'Professional Judgment': 2 }
    },
    weight: 3.0,
    difficultyLevel: 'advanced'
  },
  {
    id: 'SJT003',
    type: 'situational_judgment',
    dimension: 'Instructional Decision-Making',
    text: 'Rank these approaches from MOST to LEAST appropriate',
    scenario: 'You\'re halfway through a carefully planned lesson when you realize most students are confused and disengaged. You have 20 minutes remaining.',
    options: [
      {
        id: 'a',
        text: 'Stop and ask students directly what they\'re finding confusing, then adjust based on their feedback',
        traits: [{ trait: 'Adaptability', score: 5 }, { trait: 'Student-Centered', score: 5 }],
        socialDesirability: 'high',
        behavioralAnchor: 'Responsive to student needs in real-time'
      },
      {
        id: 'b',
        text: 'Continue with the lesson as planned - they\'ll understand better when they review the material later',
        traits: [{ trait: 'Persistence', score: 3 }, { trait: 'Adaptability', score: 1 }],
        socialDesirability: 'low',
        behavioralAnchor: 'Maintains original plan despite feedback'
      },
      {
        id: 'c',
        text: 'Pause and use a different approach - perhaps a video, demonstration, or pair discussion',
        traits: [{ trait: 'Adaptability', score: 5 }, { trait: 'Resourcefulness', score: 4 }],
        socialDesirability: 'high',
        behavioralAnchor: 'Shifts strategy to improve engagement'
      },
      {
        id: 'd',
        text: 'Assign the remaining content as homework and use class time for guided practice on earlier concepts',
        traits: [{ trait: 'Pragmatism', score: 4 }, { trait: 'Student-Centered', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Reorganizes to maximize learning time'
      }
    ],
    scoringKey: {
      method: 'criterion',
      traitWeights: { 'Instructional Adaptability': 2, 'Student Focus': 2 }
    },
    weight: 2.5,
    difficultyLevel: 'standard'
  }
];

/**
 * CONDITIONAL REASONING TESTS
 * 
 * Based on: James (1998) Conditional Reasoning methodology
 * Purpose: Measures implicit beliefs and motives through reasoning problems
 * Advantage: Very difficult to fake because correct answer isn't obvious
 */
export const CONDITIONAL_REASONING_QUESTIONS: AdvancedQuestion[] = [
  {
    id: 'CRT001',
    type: 'conditional_reasoning',
    dimension: 'Achievement Motivation',
    text: 'Which conclusion follows most logically from the information given?',
    scenario: 'Studies show that teachers who spend more time on lesson preparation have better student outcomes. However, Teacher A prepares less than average but still has excellent results.',
    options: [
      {
        id: 'a',
        text: 'Teacher A has exceptional natural talent that compensates for less preparation',
        traits: [{ trait: 'External Attribution', score: 4 }],
        socialDesirability: 'neutral'
      },
      {
        id: 'b',
        text: 'Teacher A likely works smarter, not harder, and has found efficient methods',
        traits: [{ trait: 'Achievement Orientation', score: 5 }],
        socialDesirability: 'neutral'
      },
      {
        id: 'c',
        text: 'The studies may not apply to all teachers and contexts',
        traits: [{ trait: 'Critical Thinking', score: 4 }],
        socialDesirability: 'neutral'
      },
      {
        id: 'd',
        text: 'Teacher A may be measuring success differently than the studies',
        traits: [{ trait: 'Critical Thinking', score: 3 }],
        socialDesirability: 'neutral'
      }
    ],
    scoringKey: {
      method: 'criterion',
      traitWeights: { 'Achievement Motivation': 1, 'Reasoning Style': 1 }
    },
    weight: 2.0,
    difficultyLevel: 'advanced'
  }
];

/**
 * INTEGRITY/VALIDITY CHECK QUESTIONS
 * 
 * Purpose: Detect response distortion, careless responding, and faking
 * Types: 
 * - Unlikely virtues (claiming perfection)
 * - Consistency pairs (same construct, different wording)
 * - Infrequent responses (rarely endorsed items)
 */
export const VALIDITY_CHECK_QUESTIONS: AdvancedQuestion[] = [
  // Unlikely Virtue - Tests for overly positive self-presentation
  {
    id: 'VAL001',
    type: 'integrity_check',
    dimension: 'Validity',
    text: 'How much do you agree with this statement?',
    scenario: 'I have never felt annoyed with a student, even briefly.',
    isValidityCheck: true,
    options: [
      { id: 'a', text: 'Strongly Disagree', traits: [{ trait: 'Honest Responding', score: 5 }], socialDesirability: 'low' },
      { id: 'b', text: 'Disagree', traits: [{ trait: 'Honest Responding', score: 4 }], socialDesirability: 'low' },
      { id: 'c', text: 'Neutral', traits: [{ trait: 'Honest Responding', score: 3 }], socialDesirability: 'medium' },
      { id: 'd', text: 'Agree', traits: [{ trait: 'Impression Management', score: 4 }], socialDesirability: 'high' },
      { id: 'e', text: 'Strongly Agree', traits: [{ trait: 'Impression Management', score: 5 }], socialDesirability: 'high' }
    ],
    scoringKey: {
      method: 'normative',
      traitWeights: { 'Validity': 1 },
      validityIndicators: ['Unlikely Virtue']
    },
    weight: 0.5,
    difficultyLevel: 'basic'
  },
  // Consistency Check Pair - First item
  {
    id: 'VAL002',
    type: 'integrity_check',
    dimension: 'Conscientiousness',
    text: 'I carefully plan my lessons well in advance.',
    isPairedWith: 'VAL003',
    options: [
      { id: 'a', text: 'Strongly Disagree', traits: [{ trait: 'Conscientiousness', score: 1 }], socialDesirability: 'low' },
      { id: 'b', text: 'Disagree', traits: [{ trait: 'Conscientiousness', score: 2 }], socialDesirability: 'low' },
      { id: 'c', text: 'Neutral', traits: [{ trait: 'Conscientiousness', score: 3 }], socialDesirability: 'medium' },
      { id: 'd', text: 'Agree', traits: [{ trait: 'Conscientiousness', score: 4 }], socialDesirability: 'high' },
      { id: 'e', text: 'Strongly Agree', traits: [{ trait: 'Conscientiousness', score: 5 }], socialDesirability: 'high' }
    ],
    scoringKey: {
      method: 'normative',
      traitWeights: { 'Conscientiousness': 1 }
    },
    weight: 1.0,
    difficultyLevel: 'basic'
  },
  // Consistency Check Pair - Second item (reverse wording)
  {
    id: 'VAL003',
    type: 'integrity_check',
    dimension: 'Conscientiousness',
    text: 'I often prepare my lessons at the last minute.',
    isPairedWith: 'VAL002',
    isReverseCoded: true,
    options: [
      { id: 'a', text: 'Strongly Disagree', traits: [{ trait: 'Conscientiousness', score: 5 }], socialDesirability: 'high' },
      { id: 'b', text: 'Disagree', traits: [{ trait: 'Conscientiousness', score: 4 }], socialDesirability: 'high' },
      { id: 'c', text: 'Neutral', traits: [{ trait: 'Conscientiousness', score: 3 }], socialDesirability: 'medium' },
      { id: 'd', text: 'Agree', traits: [{ trait: 'Conscientiousness', score: 2 }], socialDesirability: 'low' },
      { id: 'e', text: 'Strongly Agree', traits: [{ trait: 'Conscientiousness', score: 1 }], socialDesirability: 'low' }
    ],
    scoringKey: {
      method: 'normative',
      traitWeights: { 'Conscientiousness': 1 },
      reverseCoding: true
    },
    weight: 1.0,
    difficultyLevel: 'basic'
  }
];

/**
 * BEHAVIORAL ANCHORED RATING SCALE (BARS) QUESTIONS
 * 
 * Based on: Smith & Kendall (1963) methodology
 * Purpose: Provides clear behavioral examples for each rating level
 */
export const BEHAVIORAL_ANCHOR_QUESTIONS: AdvancedQuestion[] = [
  {
    id: 'BARS001',
    type: 'behavioral_anchor',
    dimension: 'Classroom Management',
    text: 'Select the statement that BEST describes your typical approach to classroom transitions:',
    options: [
      {
        id: 'a',
        text: 'I use consistent routines with clear signals; students transition independently within 1-2 minutes with minimal direction',
        traits: [{ trait: 'Classroom Management', score: 5 }],
        socialDesirability: 'high',
        behavioralAnchor: 'Expert: Seamless, student-led transitions'
      },
      {
        id: 'b',
        text: 'I have established routines; most transitions are smooth with occasional reminders needed',
        traits: [{ trait: 'Classroom Management', score: 4 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Proficient: Generally smooth transitions'
      },
      {
        id: 'c',
        text: 'I provide verbal instructions for each transition; some time is lost but students eventually comply',
        traits: [{ trait: 'Classroom Management', score: 3 }],
        socialDesirability: 'medium',
        behavioralAnchor: 'Developing: Adequate but inefficient transitions'
      },
      {
        id: 'd',
        text: 'Transitions are challenging; significant learning time is lost while getting students organized',
        traits: [{ trait: 'Classroom Management', score: 2 }],
        socialDesirability: 'low',
        behavioralAnchor: 'Novice: Transitions need improvement'
      }
    ],
    scoringKey: {
      method: 'competency',
      traitWeights: { 'Classroom Management': 1 }
    },
    weight: 2.0,
    difficultyLevel: 'standard'
  }
];

/**
 * SEMANTIC DIFFERENTIAL QUESTIONS
 * 
 * Purpose: Measures attitudes and perceptions on bipolar scales
 * Advantage: Reveals nuanced positions between extremes
 */
export const SEMANTIC_DIFFERENTIAL_QUESTIONS: AdvancedQuestion[] = [
  {
    id: 'SD001',
    type: 'semantic_differential',
    dimension: 'Teaching Philosophy',
    text: 'Position your teaching approach on each scale:',
    instructions: 'Mark the point on each scale that best represents your natural teaching style',
    options: [
      {
        id: 'scale1',
        text: 'Teacher-Directed ←――――→ Student-Directed',
        traits: [{ trait: 'Student Autonomy', score: 0 }], // Score depends on position
        socialDesirability: 'neutral'
      },
      {
        id: 'scale2',
        text: 'Content-Focused ←――――→ Process-Focused',
        traits: [{ trait: 'Process Orientation', score: 0 }],
        socialDesirability: 'neutral'
      },
      {
        id: 'scale3',
        text: 'Structured ←――――→ Flexible',
        traits: [{ trait: 'Adaptability', score: 0 }],
        socialDesirability: 'neutral'
      }
    ],
    scoringKey: {
      method: 'normative',
      traitWeights: { 'Teaching Style': 1 }
    },
    weight: 1.5,
    difficultyLevel: 'basic'
  }
];

// ============================================================================
// ADVANCED SCORING AND ANALYTICS
// ============================================================================

export interface AssessmentResult {
  respondentId: string;
  assessmentId: string;
  completedAt: Date;
  duration: number; // in seconds
  
  // Trait scores
  traitScores: Record<string, {
    raw: number;
    percentile: number;
    sten: number; // Standard ten score (1-10)
    interpretation: string;
  }>;
  
  // Validity indicators
  validityProfile: {
    overallValidity: 'valid' | 'questionable' | 'invalid';
    inconsistencyIndex: number; // 0-100, lower is better
    impressionManagementScore: number; // 0-100
    infrequencyScore: number; // 0-100
    averageResponseTime: number;
    suspiciousPatterns: string[];
  };
  
  // Response patterns
  responsePatterns: {
    extremeResponding: number; // % of extreme responses
    centralTendency: number; // % of middle responses
    acquiescence: number; // % agreement responses
  };
  
  // Competency profile
  competencyProfile: Record<string, {
    level: 'expert' | 'proficient' | 'developing' | 'novice';
    score: number;
    strengths: string[];
    developmentAreas: string[];
  }>;
}

export class AdvancedPsychometricService {
  /**
   * Calculate consistency between paired items
   */
  calculateConsistency(responses: Map<string, string>, pairedQuestions: AdvancedQuestion[]): number {
    let consistentPairs = 0;
    let totalPairs = 0;
    
    for (const question of pairedQuestions) {
      if (question.isPairedWith) {
        const response1 = responses.get(question.id);
        const response2 = responses.get(question.isPairedWith);
        
        if (response1 && response2) {
          totalPairs++;
          // Check if responses are logically consistent
          const score1 = this.getResponseScore(question, response1);
          const score2 = this.getResponseScore(
            pairedQuestions.find(q => q.id === question.isPairedWith)!,
            response2
          );
          
          // For reverse-coded items, scores should be inversely related
          const expectedDifference = question.isReverseCoded ? 0 : Math.abs(score1 + score2 - 6);
          if (expectedDifference <= 2) consistentPairs++;
        }
      }
    }
    
    return totalPairs > 0 ? (consistentPairs / totalPairs) * 100 : 100;
  }
  
  /**
   * Calculate impression management (faking good) score
   */
  calculateImpressionManagement(responses: Map<string, string>, validityQuestions: AdvancedQuestion[]): number {
    let imScore = 0;
    let count = 0;
    
    for (const question of validityQuestions.filter(q => q.isValidityCheck)) {
      const response = responses.get(question.id);
      if (response) {
        count++;
        const option = question.options.find(o => o.id === response);
        if (option?.socialDesirability === 'high' && option.traits[0]?.trait === 'Impression Management') {
          imScore += option.traits[0].score;
        }
      }
    }
    
    return count > 0 ? (imScore / count) * 20 : 0; // Normalize to 0-100
  }
  
  /**
   * Analyze response timing for suspicious patterns
   */
  analyzeResponseTiming(responseTimes: Map<string, number>, questions: AdvancedQuestion[]): string[] {
    const patterns: string[] = [];
    const times = Array.from(responseTimes.values());
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    // Too fast overall (likely not reading questions)
    if (avgTime < 3) {
      patterns.push('RAPID_RESPONDING: Average response time under 3 seconds');
    }
    
    // Too consistent timing (likely automated)
    const stdDev = Math.sqrt(times.reduce((sq, n) => sq + Math.pow(n - avgTime, 2), 0) / times.length);
    if (stdDev < 0.5 && times.length > 10) {
      patterns.push('UNIFORM_TIMING: Suspiciously consistent response times');
    }
    
    // Complex questions answered too quickly
    for (const question of questions.filter(q => q.difficultyLevel === 'advanced')) {
      const time = responseTimes.get(question.id);
      if (time && time < (question.expectedResponseTime?.min || 5)) {
        patterns.push(`INSUFFICIENT_TIME: Question ${question.id} answered in ${time}s (minimum expected: ${question.expectedResponseTime?.min || 5}s)`);
      }
    }
    
    return patterns;
  }
  
  /**
   * Get score from a response
   */
  private getResponseScore(question: AdvancedQuestion, responseId: string): number {
    const option = question.options.find(o => o.id === responseId);
    if (!option) return 3; // Middle score as default
    return option.traits[0]?.score || 3;
  }
  
  /**
   * Generate a comprehensive assessment with mixed question types
   */
  generateAdvancedAssessment(config: {
    assessmentType: 'personality' | 'leadership' | 'competency' | 'comprehensive';
    questionCount: number;
    includeValidityChecks: boolean;
    difficultyMix: { basic: number; standard: number; advanced: number };
  }): AdvancedQuestion[] {
    const questions: AdvancedQuestion[] = [];
    
    // Add ipsative questions (25% of total)
    const ipsativeCount = Math.floor(config.questionCount * 0.25);
    questions.push(...IPSATIVE_QUESTIONS.slice(0, ipsativeCount));
    
    // Add situational judgment tests (30% of total)
    const sjtCount = Math.floor(config.questionCount * 0.30);
    questions.push(...SITUATIONAL_JUDGMENT_QUESTIONS.slice(0, sjtCount));
    
    // Add behavioral anchor questions (25% of total)
    const barsCount = Math.floor(config.questionCount * 0.25);
    questions.push(...BEHAVIORAL_ANCHOR_QUESTIONS.slice(0, barsCount));
    
    // Add validity checks if requested (separate from count)
    if (config.includeValidityChecks) {
      questions.push(...VALIDITY_CHECK_QUESTIONS);
    }
    
    // Add conditional reasoning (remaining 20%)
    const crtCount = config.questionCount - questions.length + (config.includeValidityChecks ? VALIDITY_CHECK_QUESTIONS.length : 0);
    if (crtCount > 0) {
      questions.push(...CONDITIONAL_REASONING_QUESTIONS.slice(0, crtCount));
    }
    
    // Shuffle to avoid pattern recognition
    return this.shuffleQuestions(questions);
  }
  
  private shuffleQuestions(questions: AdvancedQuestion[]): AdvancedQuestion[] {
    // Keep validity check pairs together but shuffle overall
    const validityPairs = new Map<string, AdvancedQuestion[]>();
    const otherQuestions: AdvancedQuestion[] = [];
    
    for (const q of questions) {
      if (q.isPairedWith) {
        const pairKey = [q.id, q.isPairedWith].sort().join('-');
        if (!validityPairs.has(pairKey)) {
          validityPairs.set(pairKey, []);
        }
        validityPairs.get(pairKey)!.push(q);
      } else {
        otherQuestions.push(q);
      }
    }
    
    // Shuffle non-paired questions
    for (let i = otherQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherQuestions[i], otherQuestions[j]] = [otherQuestions[j], otherQuestions[i]];
    }
    
    // Insert paired questions at random positions (but keep pairs separated)
    const result = [...otherQuestions];
    const validityPairEntries = Array.from(validityPairs.entries());
    for (const [, pair] of validityPairEntries) {
      const pos1 = Math.floor(Math.random() * (result.length / 3));
      const pos2 = Math.floor(result.length * 0.7 + Math.random() * (result.length * 0.3));
      result.splice(pos1, 0, pair[0]);
      if (pair[1]) result.splice(pos2, 0, pair[1]);
    }
    
    return result;
  }
}

export const advancedPsychometricService = new AdvancedPsychometricService();
