/**
 * PROFESSIONAL PSYCHOMETRIC QUESTION BANK SERVICE
 * 
 * Implements SHL/Hogan/Gallup-style assessment questions with:
 * - Situational Judgment Tests (SJT)
 * - Forced-Choice assessments
 * - Behavioral scenario questions
 * - Cognitive ability tests
 * 
 * Features:
 * - Question usage tracking (questions removed after use)
 * - AI-powered question generation to replenish bank
 * - Quality scoring and validation
 * - Dimension-based organization
 */

import { eq, and, sql, asc, ne } from "drizzle-orm";
import { getDb } from "../db";
import { psychometricQuestions } from "../../drizzle/schema-pg";
import { aiRouterService } from "./ai-router.service";

// ============================================================================
// TYPES
// ============================================================================

export interface ProfessionalQuestion {
  id?: number;
  testType: string;
  questionText: string;
  questionType: 'scenario' | 'situational' | 'forced_choice' | 'multiple_choice' | 'likert';
  dimension: string;
  scenario?: string;
  options: QuestionOption[];
  traitMeasured?: string;
  isReverseCoded?: boolean;
  qualityScore?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: number;
}

// ============================================================================
// PROFESSIONAL QUESTION BANK - SHL/HOGAN STYLE
// ============================================================================

/**
 * Master question bank with professional-grade psychometric questions
 * Organized by assessment type and dimension
 */
export const PROFESSIONAL_QUESTION_BANK: Record<string, ProfessionalQuestion[]> = {
  // ==========================================================================
  // BIG FIVE PERSONALITY ASSESSMENT
  // ==========================================================================
  personality: [
    // OPENNESS TO EXPERIENCE
    {
      testType: 'personality',
      questionText: "How would you respond to this curriculum change?",
      questionType: 'scenario',
      dimension: 'Openness',
      scenario: "The Ministry of Education has mandated a complete overhaul of your subject curriculum, requiring you to learn new content areas and adopt unfamiliar teaching methodologies within one semester.",
      options: [
        { id: 'a', text: "Embrace the challenge enthusiastically and volunteer to pilot the new curriculum", value: 5 },
        { id: 'b', text: "Request professional development support and create a structured transition plan", value: 4 },
        { id: 'c', text: "Express concerns to administration while complying with the mandate", value: 3 },
        { id: 'd', text: "Focus on maintaining your current effective practices within the new framework", value: 2 },
      ],
      traitMeasured: 'Openness to Experience',
      qualityScore: 9,
    },
    {
      testType: 'personality',
      questionText: "When presented with a new educational technology platform:",
      questionType: 'forced_choice',
      dimension: 'Openness',
      options: [
        { id: 'a', text: "I immediately explore all features to discover creative applications for my classroom", value: 5 },
        { id: 'b', text: "I prefer to master the essential functions before exploring advanced features", value: 3 },
      ],
      traitMeasured: 'Openness to Experience',
      qualityScore: 8,
    },
    {
      testType: 'personality',
      questionText: "Select the response that best reflects your approach:",
      questionType: 'situational',
      dimension: 'Openness',
      scenario: "A colleague proposes an unconventional cross-curricular project that combines your subject with art and drama. It would require significant planning outside your comfort zone.",
      options: [
        { id: 'a', text: "Enthusiastically collaborate and take a leading role in the creative aspects", value: 5 },
        { id: 'b', text: "Agree to participate but focus on your subject expertise within the project", value: 4 },
        { id: 'c', text: "Suggest modifications that align more closely with traditional assessment requirements", value: 3 },
        { id: 'd', text: "Politely decline, citing curriculum coverage concerns", value: 1 },
      ],
      traitMeasured: 'Openness to Experience',
      qualityScore: 9,
    },

    // CONSCIENTIOUSNESS
    {
      testType: 'personality',
      questionText: "How do you typically handle assessment deadlines?",
      questionType: 'scenario',
      dimension: 'Conscientiousness',
      scenario: "End of term reports are due in one week. You have 120 students to assess, plus ongoing lesson planning and a parent conference scheduled.",
      options: [
        { id: 'a', text: "I've already started weeks ago with a detailed schedule - reports will be done early", value: 5 },
        { id: 'b', text: "I create a priority matrix and systematically work through each task", value: 4 },
        { id: 'c', text: "I focus on the most urgent task first and adjust as needed", value: 3 },
        { id: 'd', text: "I work best under pressure and will complete everything just before the deadline", value: 2 },
      ],
      traitMeasured: 'Conscientiousness',
      qualityScore: 9,
    },
    {
      testType: 'personality',
      questionText: "Regarding your lesson planning approach:",
      questionType: 'forced_choice',
      dimension: 'Conscientiousness',
      options: [
        { id: 'a', text: "I plan lessons weeks in advance with detailed objectives, resources, and contingencies", value: 5 },
        { id: 'b', text: "I prepare a flexible outline and adapt based on how the previous lesson went", value: 3 },
      ],
      traitMeasured: 'Conscientiousness',
      qualityScore: 8,
    },
    {
      testType: 'personality',
      questionText: "Your approach to this documentation requirement:",
      questionType: 'situational',
      dimension: 'Conscientiousness',
      scenario: "The school has introduced a new student progress tracking system requiring daily input of learning objectives, assessments, and behavioral observations for each class.",
      options: [
        { id: 'a', text: "Build it into your daily routine with a specific time slot after each lesson", value: 5 },
        { id: 'b', text: "Complete entries at the end of each day, reviewing your notes", value: 4 },
        { id: 'c', text: "Update the system a few times per week with aggregated information", value: 3 },
        { id: 'd', text: "Focus on teaching quality and update documentation when time permits", value: 2 },
      ],
      traitMeasured: 'Conscientiousness',
      qualityScore: 9,
    },

    // EXTRAVERSION
    {
      testType: 'personality',
      questionText: "During staff professional development days:",
      questionType: 'multiple_choice',
      dimension: 'Extraversion',
      options: [
        { id: 'a', text: "I actively facilitate discussions and energize the group with ideas", value: 5 },
        { id: 'b', text: "I contribute meaningfully when I have expertise to share", value: 4 },
        { id: 'c', text: "I listen attentively and take notes for later reflection", value: 3 },
        { id: 'd', text: "I prefer smaller breakout sessions to large group activities", value: 2 },
      ],
      traitMeasured: 'Extraversion',
      qualityScore: 8,
    },
    {
      testType: 'personality',
      questionText: "How would you handle this community engagement opportunity?",
      questionType: 'scenario',
      dimension: 'Extraversion',
      scenario: "The school is hosting an open day for prospective parents. You've been asked to present your subject area and answer questions from families.",
      options: [
        { id: 'a', text: "Create an interactive presentation and look forward to engaging with families", value: 5 },
        { id: 'b', text: "Prepare thoroughly and focus on communicating key information clearly", value: 4 },
        { id: 'c', text: "Prefer to support a colleague's presentation rather than lead", value: 2 },
        { id: 'd', text: "Suggest providing written materials instead of a live presentation", value: 1 },
      ],
      traitMeasured: 'Extraversion',
      qualityScore: 9,
    },
    {
      testType: 'personality',
      questionText: "When working on school-wide initiatives:",
      questionType: 'forced_choice',
      dimension: 'Extraversion',
      options: [
        { id: 'a', text: "I thrive on committee work and cross-departmental collaboration", value: 5 },
        { id: 'b', text: "I prefer to contribute my expertise to focused, smaller teams", value: 3 },
      ],
      traitMeasured: 'Extraversion',
      qualityScore: 8,
    },

    // AGREEABLENESS
    {
      testType: 'personality',
      questionText: "How would you navigate this conflict situation?",
      questionType: 'scenario',
      dimension: 'Agreeableness',
      scenario: "Two colleagues are in a heated disagreement about shared resource allocation. Both have approached you separately to support their position, and the tension is affecting department morale.",
      options: [
        { id: 'a', text: "Facilitate a mediation session focused on finding common ground and shared goals", value: 5 },
        { id: 'b', text: "Listen empathetically to both sides and encourage them to find their own resolution", value: 4 },
        { id: 'c', text: "Suggest they escalate to the department head to make an objective decision", value: 3 },
        { id: 'd', text: "Stay neutral and avoid involvement in interpersonal conflicts", value: 2 },
      ],
      traitMeasured: 'Agreeableness',
      qualityScore: 9,
    },
    {
      testType: 'personality',
      questionText: "When a student challenges your authority in class:",
      questionType: 'multiple_choice',
      dimension: 'Agreeableness',
      options: [
        { id: 'a', text: "I try to understand their perspective while maintaining classroom expectations", value: 5 },
        { id: 'b', text: "I address the behavior calmly and follow up privately to understand the cause", value: 4 },
        { id: 'c', text: "I apply consistent consequences as per school policy", value: 3 },
        { id: 'd', text: "I assert my authority clearly to maintain classroom order", value: 2 },
      ],
      traitMeasured: 'Agreeableness',
      qualityScore: 8,
    },
    {
      testType: 'personality',
      questionText: "Regarding feedback from observations:",
      questionType: 'forced_choice',
      dimension: 'Agreeableness',
      options: [
        { id: 'a', text: "I welcome all feedback as an opportunity for growth, even when I disagree", value: 5 },
        { id: 'b', text: "I evaluate feedback critically and implement suggestions I find valid", value: 3 },
      ],
      traitMeasured: 'Agreeableness',
      qualityScore: 8,
    },

    // EMOTIONAL STABILITY (NEUROTICISM - REVERSED)
    {
      testType: 'personality',
      questionText: "How do you respond to this high-pressure situation?",
      questionType: 'scenario',
      dimension: 'Emotional Stability',
      scenario: "You've just been informed that external inspectors will observe your class tomorrow. Your lesson plan needs significant revision, and you have a family commitment tonight.",
      options: [
        { id: 'a', text: "Calmly assess priorities, make targeted improvements, and trust your teaching ability", value: 5 },
        { id: 'b', text: "Reorganize your evening to allow focused preparation while managing stress", value: 4 },
        { id: 'c', text: "Feel anxious but push through to prepare as thoroughly as possible", value: 3 },
        { id: 'd', text: "Find the pressure overwhelming and struggle to focus on preparation", value: 1 },
      ],
      traitMeasured: 'Emotional Stability',
      qualityScore: 9,
    },
    {
      testType: 'personality',
      questionText: "After receiving critical feedback from an observation:",
      questionType: 'multiple_choice',
      dimension: 'Emotional Stability',
      options: [
        { id: 'a', text: "I process the feedback objectively and create an improvement plan", value: 5 },
        { id: 'b', text: "I initially feel disappointed but recover quickly to focus on growth areas", value: 4 },
        { id: 'c', text: "I need time to reflect before I can engage constructively with the feedback", value: 3 },
        { id: 'd', text: "I find critical feedback affects my confidence for several days", value: 2 },
      ],
      traitMeasured: 'Emotional Stability',
      qualityScore: 8,
    },
    {
      testType: 'personality',
      questionText: "When facing unexpected changes to your schedule:",
      questionType: 'forced_choice',
      dimension: 'Emotional Stability',
      options: [
        { id: 'a', text: "I adapt smoothly and see changes as part of the dynamic school environment", value: 5 },
        { id: 'b', text: "I feel frustrated initially but adjust my plans accordingly", value: 3 },
      ],
      traitMeasured: 'Emotional Stability',
      qualityScore: 8,
    },
  ],

  // ==========================================================================
  // EMOTIONAL INTELLIGENCE ASSESSMENT
  // ==========================================================================
  emotional_intelligence: [
    // SELF-AWARENESS
    {
      testType: 'emotional_intelligence',
      questionText: "Identify your most likely internal response:",
      questionType: 'scenario',
      dimension: 'Self-Awareness',
      scenario: "During a challenging parent meeting, you notice your heart rate increasing and your tone becoming defensive as the parent criticizes your teaching approach.",
      options: [
        { id: 'a', text: "I recognize my emotional response, pause, and consciously shift to active listening", value: 5 },
        { id: 'b', text: "I acknowledge my defensiveness and ask for a brief moment to collect my thoughts", value: 4 },
        { id: 'c', text: "I continue the conversation while internally managing my emotional response", value: 3 },
        { id: 'd', text: "I focus on responding to the parent's points rather than my emotional state", value: 2 },
      ],
      traitMeasured: 'Self-Awareness',
      qualityScore: 9,
    },
    {
      testType: 'emotional_intelligence',
      questionText: "When reflecting on your teaching practice:",
      questionType: 'forced_choice',
      dimension: 'Self-Awareness',
      options: [
        { id: 'a', text: "I regularly analyze my emotional triggers and their impact on my teaching", value: 5 },
        { id: 'b', text: "I focus primarily on pedagogical effectiveness rather than emotional dynamics", value: 2 },
      ],
      traitMeasured: 'Self-Awareness',
      qualityScore: 8,
    },
    {
      testType: 'emotional_intelligence',
      questionText: "How would you handle this recognition situation?",
      questionType: 'situational',
      dimension: 'Self-Awareness',
      scenario: "You receive unexpected public praise from the principal for a successful student project. Several colleagues who contributed significantly are not mentioned.",
      options: [
        { id: 'a', text: "Graciously accept while immediately acknowledging colleagues' contributions", value: 5 },
        { id: 'b', text: "Feel uncomfortable with the attention and redirect credit to the team", value: 4 },
        { id: 'c', text: "Accept the recognition and privately thank colleagues later", value: 3 },
        { id: 'd', text: "Enjoy the recognition as validation of your leadership on the project", value: 2 },
      ],
      traitMeasured: 'Self-Awareness',
      qualityScore: 9,
    },

    // SELF-REGULATION
    {
      testType: 'emotional_intelligence',
      questionText: "Choose your most likely response:",
      questionType: 'scenario',
      dimension: 'Self-Regulation',
      scenario: "A student makes a disrespectful comment about you in front of the entire class. Some students laugh. You feel anger rising.",
      options: [
        { id: 'a', text: "Pause, maintain composure, and address the behavior calmly but firmly after class", value: 5 },
        { id: 'b', text: "Use humor to defuse the situation while noting the need for a private conversation", value: 4 },
        { id: 'c', text: "Address the comment immediately with a measured but direct response", value: 3 },
        { id: 'd', text: "React strongly to establish that such behavior is unacceptable", value: 1 },
      ],
      traitMeasured: 'Self-Regulation',
      qualityScore: 9,
    },
    {
      testType: 'emotional_intelligence',
      questionText: "After a particularly frustrating day at school:",
      questionType: 'multiple_choice',
      dimension: 'Self-Regulation',
      options: [
        { id: 'a', text: "I have established routines that help me decompress before engaging with family", value: 5 },
        { id: 'b', text: "I briefly share my frustrations with a trusted person, then move on", value: 4 },
        { id: 'c', text: "I sometimes carry the frustration home but try to manage it", value: 3 },
        { id: 'd', text: "I find it difficult to separate work stress from my personal life", value: 2 },
      ],
      traitMeasured: 'Self-Regulation',
      qualityScore: 8,
    },

    // EMPATHY
    {
      testType: 'emotional_intelligence',
      questionText: "How would you approach this student concern?",
      questionType: 'scenario',
      dimension: 'Empathy',
      scenario: "A usually engaged student has become withdrawn over the past two weeks. Their academic performance is declining, and they avoid eye contact during lessons.",
      options: [
        { id: 'a', text: "Create a natural opportunity for a private conversation, showing genuine concern without pressure", value: 5 },
        { id: 'b', text: "Speak with the student's other teachers and counselor to gather perspectives", value: 4 },
        { id: 'c', text: "Send a note home to parents expressing your observations", value: 3 },
        { id: 'd', text: "Give them space while monitoring the situation from a distance", value: 2 },
      ],
      traitMeasured: 'Empathy',
      qualityScore: 9,
    },
    {
      testType: 'emotional_intelligence',
      questionText: "When a colleague seems unusually quiet during a department meeting:",
      questionType: 'forced_choice',
      dimension: 'Empathy',
      options: [
        { id: 'a', text: "I notice emotional cues and find an appropriate moment to check in privately", value: 5 },
        { id: 'b', text: "I focus on the meeting content and assume they'll share if they need support", value: 2 },
      ],
      traitMeasured: 'Empathy',
      qualityScore: 8,
    },

    // SOCIAL SKILLS
    {
      testType: 'emotional_intelligence',
      questionText: "How would you navigate this team dynamic?",
      questionType: 'scenario',
      dimension: 'Social Skills',
      scenario: "You're leading a curriculum development project. Two team members have stopped communicating directly with each other due to a disagreement, affecting progress.",
      options: [
        { id: 'a', text: "Address the tension directly by facilitating a structured conversation focused on shared goals", value: 5 },
        { id: 'b', text: "Restructure tasks so the two members can work independently while maintaining project cohesion", value: 4 },
        { id: 'c', text: "Speak with each person privately to understand the issue before deciding on an approach", value: 4 },
        { id: 'd', text: "Focus on task completion and let them manage their interpersonal issues", value: 2 },
      ],
      traitMeasured: 'Social Skills',
      qualityScore: 9,
    },
    {
      testType: 'emotional_intelligence',
      questionText: "Your approach to building relationships with new colleagues:",
      questionType: 'multiple_choice',
      dimension: 'Social Skills',
      options: [
        { id: 'a', text: "I proactively introduce myself and find ways to collaborate early", value: 5 },
        { id: 'b', text: "I'm friendly and open when opportunities for interaction arise", value: 4 },
        { id: 'c', text: "I let relationships develop naturally through work interactions", value: 3 },
        { id: 'd', text: "I focus on establishing myself in my role before building broader relationships", value: 2 },
      ],
      traitMeasured: 'Social Skills',
      qualityScore: 8,
    },

    // MOTIVATION
    {
      testType: 'emotional_intelligence',
      questionText: "What drives your continued professional growth?",
      questionType: 'scenario',
      dimension: 'Motivation',
      scenario: "After ten years of teaching, you've achieved a stable position with good results. There's no pressure to change, but professional development opportunities are available.",
      options: [
        { id: 'a', text: "I continuously seek growth because improving student outcomes is deeply fulfilling", value: 5 },
        { id: 'b', text: "I pursue development opportunities that align with my career aspirations", value: 4 },
        { id: 'c', text: "I engage in required professional development and occasional elective learning", value: 3 },
        { id: 'd', text: "I focus on refining my established practices rather than seeking new approaches", value: 2 },
      ],
      traitMeasured: 'Motivation',
      qualityScore: 9,
    },
    {
      testType: 'emotional_intelligence',
      questionText: "When facing setbacks in implementing a new teaching strategy:",
      questionType: 'forced_choice',
      dimension: 'Motivation',
      options: [
        { id: 'a', text: "I view setbacks as learning opportunities and persist with adjusted approaches", value: 5 },
        { id: 'b', text: "I evaluate whether the strategy is worth the effort and may return to proven methods", value: 2 },
      ],
      traitMeasured: 'Motivation',
      qualityScore: 8,
    },
  ],

  // ==========================================================================
  // LEADERSHIP ASSESSMENT
  // ==========================================================================
  leadership: [
    // VISION & STRATEGY
    {
      testType: 'leadership',
      questionText: "How would you approach this strategic challenge?",
      questionType: 'scenario',
      dimension: 'Vision & Strategy',
      scenario: "As newly appointed Head of Department, you discover student outcomes have plateaued for three years. Staff are comfortable with current practices, and resources are limited.",
      options: [
        { id: 'a', text: "Conduct a thorough analysis, then collaboratively develop a compelling improvement vision with clear milestones", value: 5 },
        { id: 'b', text: "Research best practices from high-performing departments and adapt them for your context", value: 4 },
        { id: 'c', text: "Identify quick wins to build momentum while planning longer-term changes", value: 4 },
        { id: 'd', text: "Implement a proven intervention program with clear expectations for staff", value: 3 },
      ],
      traitMeasured: 'Strategic Vision',
      qualityScore: 9,
    },
    {
      testType: 'leadership',
      questionText: "When communicating school-wide changes to your team:",
      questionType: 'multiple_choice',
      dimension: 'Vision & Strategy',
      options: [
        { id: 'a', text: "I connect changes to our shared purpose and help the team see their role in the bigger picture", value: 5 },
        { id: 'b', text: "I explain the rationale clearly and address questions and concerns thoroughly", value: 4 },
        { id: 'c', text: "I focus on practical implications and what the team needs to do differently", value: 3 },
        { id: 'd', text: "I relay information from administration and support implementation as required", value: 2 },
      ],
      traitMeasured: 'Strategic Communication',
      qualityScore: 8,
    },

    // TEAM DEVELOPMENT
    {
      testType: 'leadership',
      questionText: "How would you develop this team member?",
      questionType: 'scenario',
      dimension: 'Team Development',
      scenario: "A teacher in your department has excellent subject knowledge but consistently receives poor student feedback. They seem unaware of the issue and believe their teaching is effective.",
      options: [
        { id: 'a', text: "Create a supportive feedback process with specific examples, peer observation, and coaching", value: 5 },
        { id: 'b', text: "Share the feedback data directly and collaboratively create a development plan", value: 4 },
        { id: 'c', text: "Arrange for them to observe excellent practitioners and reflect on differences", value: 4 },
        { id: 'd', text: "Provide formal feedback through the appraisal process with improvement targets", value: 3 },
      ],
      traitMeasured: 'People Development',
      qualityScore: 9,
    },
    {
      testType: 'leadership',
      questionText: "Your approach to recognizing team achievements:",
      questionType: 'forced_choice',
      dimension: 'Team Development',
      options: [
        { id: 'a', text: "I actively look for opportunities to celebrate both individual and team successes", value: 5 },
        { id: 'b', text: "I acknowledge good work when I observe it but focus primarily on improvement areas", value: 2 },
      ],
      traitMeasured: 'Recognition',
      qualityScore: 8,
    },

    // DECISION MAKING
    {
      testType: 'leadership',
      questionText: "How would you handle this urgent decision?",
      questionType: 'scenario',
      dimension: 'Decision Making',
      scenario: "Two qualified teachers have applied for one promotional position in your department. Both have strong cases, and the decision will significantly impact team dynamics regardless of outcome.",
      options: [
        { id: 'a', text: "Use transparent criteria, gather diverse input, make a clear decision, and support both candidates through the outcome", value: 5 },
        { id: 'b', text: "Conduct thorough individual assessments and make the decision based on objective evidence", value: 4 },
        { id: 'c', text: "Seek guidance from HR and senior leadership to ensure process fairness", value: 3 },
        { id: 'd', text: "Defer to seniority or previous performance metrics to simplify the decision", value: 2 },
      ],
      traitMeasured: 'Decision Quality',
      qualityScore: 9,
    },
    {
      testType: 'leadership',
      questionText: "When facing decisions with incomplete information:",
      questionType: 'multiple_choice',
      dimension: 'Decision Making',
      options: [
        { id: 'a', text: "I make timely decisions based on available information and adjust as new data emerges", value: 5 },
        { id: 'b', text: "I gather as much information as possible within time constraints before deciding", value: 4 },
        { id: 'c', text: "I prefer to delay decisions until I have sufficient information for confidence", value: 3 },
        { id: 'd', text: "I consult extensively with others to share responsibility for uncertain decisions", value: 3 },
      ],
      traitMeasured: 'Decision Speed',
      qualityScore: 8,
    },

    // CHANGE MANAGEMENT
    {
      testType: 'leadership',
      questionText: "How would you lead this change initiative?",
      questionType: 'scenario',
      dimension: 'Change Management',
      scenario: "The school is transitioning to competency-based assessment. Many teachers are skeptical, citing increased workload. You're responsible for implementing this in your department.",
      options: [
        { id: 'a', text: "Acknowledge concerns, involve skeptics in planning, and provide extensive support during transition", value: 5 },
        { id: 'b', text: "Pilot with early adopters, showcase successes, and gradually bring others on board", value: 4 },
        { id: 'c', text: "Provide comprehensive training and clear timelines, addressing resistance as it emerges", value: 3 },
        { id: 'd', text: "Implement the mandate with clear expectations while offering support resources", value: 2 },
      ],
      traitMeasured: 'Change Leadership',
      qualityScore: 9,
    },
    {
      testType: 'leadership',
      questionText: "Your natural response to resistance during change:",
      questionType: 'forced_choice',
      dimension: 'Change Management',
      options: [
        { id: 'a', text: "I see resistance as valuable feedback and engage deeply with concerns", value: 5 },
        { id: 'b', text: "I focus on supporting willing adopters while managing resistance firmly", value: 3 },
      ],
      traitMeasured: 'Resistance Management',
      qualityScore: 8,
    },

    // ACCOUNTABILITY
    {
      testType: 'leadership',
      questionText: "How would you address this performance issue?",
      questionType: 'scenario',
      dimension: 'Accountability',
      scenario: "A teacher in your department consistently misses administrative deadlines despite multiple reminders. Their teaching is good, but their paperwork affects the whole department's compliance.",
      options: [
        { id: 'a', text: "Have a direct conversation about expectations, understand barriers, and create an accountability plan", value: 5 },
        { id: 'b', text: "Implement a checkpoint system with earlier internal deadlines and regular follow-up", value: 4 },
        { id: 'c', text: "Document the pattern formally and escalate to administration if it continues", value: 3 },
        { id: 'd', text: "Redistribute tasks to more reliable team members to ensure compliance", value: 2 },
      ],
      traitMeasured: 'Performance Accountability',
      qualityScore: 9,
    },
  ],

  // ==========================================================================
  // COGNITIVE ABILITY ASSESSMENT
  // ==========================================================================
  cognitive: [
    // VERBAL REASONING
    {
      testType: 'cognitive',
      questionText: "Based on the information provided, which conclusion is most logically valid?",
      questionType: 'multiple_choice',
      dimension: 'Verbal Reasoning',
      scenario: "All teachers who completed the Advanced Pedagogy certification demonstrated improved student outcomes. Ms. Rahman's students showed no improvement in outcomes this year.",
      options: [
        { id: 'a', text: "Ms. Rahman did not complete the Advanced Pedagogy certification", value: 5 },
        { id: 'b', text: "The certification program was not effective for Ms. Rahman", value: 1 },
        { id: 'c', text: "Ms. Rahman's students had other factors affecting their outcomes", value: 1 },
        { id: 'd', text: "Ms. Rahman may need additional support beyond certification", value: 1 },
      ],
      traitMeasured: 'Logical Deduction',
      qualityScore: 9,
    },
    {
      testType: 'cognitive',
      questionText: "Which statement can be reliably concluded from the data?",
      questionType: 'multiple_choice',
      dimension: 'Verbal Reasoning',
      scenario: "Research shows: (1) Schools with strong PLCs have higher teacher retention. (2) Higher teacher retention correlates with better student outcomes. (3) School X has weak PLCs but good student outcomes.",
      options: [
        { id: 'a', text: "School X likely has other factors contributing to positive student outcomes", value: 5 },
        { id: 'b', text: "The research findings are not valid", value: 1 },
        { id: 'c', text: "School X has high teacher retention despite weak PLCs", value: 1 },
        { id: 'd', text: "PLCs are not actually important for student outcomes", value: 1 },
      ],
      traitMeasured: 'Critical Analysis',
      qualityScore: 9,
    },
    {
      testType: 'cognitive',
      questionText: "Identify the most appropriate inference:",
      questionType: 'multiple_choice',
      dimension: 'Verbal Reasoning',
      scenario: "Ministry directive states: 'All secondary teachers must integrate digital literacy across subjects.' The Science department has not received specific digital literacy training.",
      options: [
        { id: 'a', text: "Science teachers must find ways to integrate digital literacy despite lack of specific training", value: 5 },
        { id: 'b', text: "Science teachers are exempt until they receive training", value: 1 },
        { id: 'c', text: "The directive does not apply to Science as it's not a digital subject", value: 1 },
        { id: 'd', text: "The Ministry should provide training before enforcing the directive", value: 1 },
      ],
      traitMeasured: 'Policy Interpretation',
      qualityScore: 8,
    },

    // NUMERICAL REASONING
    {
      testType: 'cognitive',
      questionText: "Calculate the correct answer based on the data:",
      questionType: 'multiple_choice',
      dimension: 'Numerical Reasoning',
      scenario: "A school's budget allocation formula: Base allocation of AED 500,000 + (AED 1,200 × student count) + (15% of base for each specialized program). The school has 420 students and 3 specialized programs.",
      options: [
        { id: 'a', text: "AED 1,229,000", value: 5 },
        { id: 'b', text: "AED 1,004,000", value: 1 },
        { id: 'c', text: "AED 1,279,000", value: 1 },
        { id: 'd', text: "AED 1,129,000", value: 1 },
      ],
      traitMeasured: 'Mathematical Computation',
      qualityScore: 9,
    },
    {
      testType: 'cognitive',
      questionText: "Determine the percentage change:",
      questionType: 'multiple_choice',
      dimension: 'Numerical Reasoning',
      scenario: "Grade 9 Math pass rate: 2022: 68%, 2023: 74%, 2024: 82%. What is the average annual percentage point increase?",
      options: [
        { id: 'a', text: "7 percentage points", value: 5 },
        { id: 'b', text: "14 percentage points", value: 1 },
        { id: 'c', text: "10.3%", value: 1 },
        { id: 'd', text: "6 percentage points", value: 1 },
      ],
      traitMeasured: 'Data Interpretation',
      qualityScore: 9,
    },
    {
      testType: 'cognitive',
      questionText: "Based on the trend data, what is the most reasonable projection?",
      questionType: 'multiple_choice',
      dimension: 'Numerical Reasoning',
      scenario: "School enrollment: 2021: 800, 2022: 880, 2023: 968, 2024: 1,065. The growth pattern is consistent.",
      options: [
        { id: 'a', text: "Approximately 1,172 students in 2025 (10% growth rate)", value: 5 },
        { id: 'b', text: "Approximately 1,165 students in 2025", value: 1 },
        { id: 'c', text: "Approximately 1,200 students in 2025", value: 1 },
        { id: 'd', text: "Approximately 1,130 students in 2025", value: 1 },
      ],
      traitMeasured: 'Trend Analysis',
      qualityScore: 9,
    },

    // ABSTRACT REASONING
    {
      testType: 'cognitive',
      questionText: "Identify the pattern and select the next element:",
      questionType: 'multiple_choice',
      dimension: 'Abstract Reasoning',
      scenario: "Sequence: 2, 6, 12, 20, 30, ?",
      options: [
        { id: 'a', text: "42", value: 5 },
        { id: 'b', text: "40", value: 1 },
        { id: 'c', text: "44", value: 1 },
        { id: 'd', text: "36", value: 1 },
      ],
      traitMeasured: 'Pattern Recognition',
      qualityScore: 9,
    },
    {
      testType: 'cognitive',
      questionText: "What is the underlying relationship?",
      questionType: 'multiple_choice',
      dimension: 'Abstract Reasoning',
      scenario: "In a school's house system: Red House always beats Blue House. Blue House always beats Green House. Yellow House has never competed against Red House. Yellow House beat Blue House.",
      options: [
        { id: 'a', text: "The outcome of Yellow vs. Red cannot be determined from the information given", value: 5 },
        { id: 'b', text: "Yellow House would beat Red House", value: 1 },
        { id: 'c', text: "Red House would beat Yellow House", value: 1 },
        { id: 'd', text: "Yellow and Red are equally matched", value: 1 },
      ],
      traitMeasured: 'Logical Relationships',
      qualityScore: 9,
    },
    {
      testType: 'cognitive',
      questionText: "Which rule governs this sequence?",
      questionType: 'multiple_choice',
      dimension: 'Abstract Reasoning',
      scenario: "Consider the sequence: A1, C2, F4, J7, ?",
      options: [
        { id: 'a', text: "O11", value: 5 },
        { id: 'b', text: "N10", value: 1 },
        { id: 'c', text: "P12", value: 1 },
        { id: 'd', text: "O10", value: 1 },
      ],
      traitMeasured: 'Complex Pattern Recognition',
      qualityScore: 9,
    },
  ],

  // ==========================================================================
  // TEACHING STYLE ASSESSMENT
  // ==========================================================================
  teaching_style: [
    // DIRECT INSTRUCTION
    {
      testType: 'teaching_style',
      questionText: "Select the approach that best matches your natural teaching style:",
      questionType: 'scenario',
      dimension: 'Direct Instruction',
      scenario: "You're introducing a complex grammar concept to Grade 7 students. You have 45 minutes and access to digital presentation tools, worksheets, and collaborative activity options.",
      options: [
        { id: 'a', text: "Begin with explicit instruction, model examples, then guided practice before independent work", value: 5 },
        { id: 'b', text: "Present a problem that requires the grammar concept, guiding students to discover the rule", value: 3 },
        { id: 'c', text: "Have students work in groups to analyze examples and formulate rules together", value: 2 },
        { id: 'd', text: "Provide multiple learning stations and let students choose their learning path", value: 1 },
      ],
      traitMeasured: 'Instructional Approach',
      qualityScore: 9,
    },
    {
      testType: 'teaching_style',
      questionText: "Your preference for lesson structure:",
      questionType: 'forced_choice',
      dimension: 'Direct Instruction',
      options: [
        { id: 'a', text: "I prefer clear, sequenced lessons with defined objectives and structured activities", value: 5 },
        { id: 'b', text: "I prefer flexible lessons that adapt based on student responses and interests", value: 2 },
      ],
      traitMeasured: 'Lesson Structure',
      qualityScore: 8,
    },

    // FACILITATION
    {
      testType: 'teaching_style',
      questionText: "How do you typically handle student questions during lessons?",
      questionType: 'multiple_choice',
      dimension: 'Facilitation',
      options: [
        { id: 'a', text: "I redirect questions to the class to promote peer learning and discussion", value: 5 },
        { id: 'b', text: "I provide direct answers to maintain lesson flow and ensure accuracy", value: 2 },
        { id: 'c', text: "I guide students with additional questions to help them discover answers", value: 4 },
        { id: 'd', text: "I park questions for later if they're not directly relevant to the lesson objective", value: 3 },
      ],
      traitMeasured: 'Question Handling',
      qualityScore: 8,
    },
    {
      testType: 'teaching_style',
      questionText: "Your role during student group work:",
      questionType: 'scenario',
      dimension: 'Facilitation',
      scenario: "Students are working in groups on a research project. One group is struggling while another has finished early. Two groups are engaged in productive discussion.",
      options: [
        { id: 'a', text: "Move between groups asking probing questions that deepen thinking without providing answers", value: 5 },
        { id: 'b', text: "Provide direct support to the struggling group while giving extension tasks to the fast group", value: 3 },
        { id: 'c', text: "Observe from a distance, only intervening when groups request help", value: 2 },
        { id: 'd', text: "Redirect the finished group to mentor the struggling group", value: 4 },
      ],
      traitMeasured: 'Group Facilitation',
      qualityScore: 9,
    },

    // DIFFERENTIATION
    {
      testType: 'teaching_style',
      questionText: "How do you approach diverse learning needs?",
      questionType: 'scenario',
      dimension: 'Differentiation',
      scenario: "Your class includes students with reading abilities ranging from two years below to two years above grade level. You're planning a literature unit on a core novel.",
      options: [
        { id: 'a', text: "Use the same text with varied supports, activities, and assessments for different levels", value: 5 },
        { id: 'b', text: "Create ability-based groups using leveled texts with common themes", value: 4 },
        { id: 'c', text: "Offer choice boards with multiple ways to engage with and demonstrate understanding", value: 4 },
        { id: 'd', text: "Focus on grade-level text with additional support for struggling readers", value: 3 },
      ],
      traitMeasured: 'Differentiation Approach',
      qualityScore: 9,
    },
    {
      testType: 'teaching_style',
      questionText: "Your philosophy on student learning paths:",
      questionType: 'forced_choice',
      dimension: 'Differentiation',
      options: [
        { id: 'a', text: "Students learn best when given choice and autonomy in how they demonstrate understanding", value: 5 },
        { id: 'b', text: "Students need structured guidance and consistent expectations for optimal learning", value: 3 },
      ],
      traitMeasured: 'Learning Autonomy',
      qualityScore: 8,
    },

    // ASSESSMENT APPROACH
    {
      testType: 'teaching_style',
      questionText: "Your preferred approach to measuring student progress:",
      questionType: 'multiple_choice',
      dimension: 'Assessment',
      options: [
        { id: 'a', text: "Continuous formative assessment with immediate feedback and adjustment", value: 5 },
        { id: 'b', text: "Regular quizzes and tests with clear criteria and grading rubrics", value: 3 },
        { id: 'c', text: "Portfolio-based assessment showing growth over time", value: 4 },
        { id: 'd', text: "Project-based assessment demonstrating real-world application", value: 4 },
      ],
      traitMeasured: 'Assessment Philosophy',
      qualityScore: 8,
    },
  ],
};

// ============================================================================
// QUESTION BANK SERVICE FUNCTIONS
// ============================================================================

export class QuestionBankService {
  /**
   * Get available questions for an assessment type
   * Only returns questions that haven't been used
   */
  async getAvailableQuestions(
    testType: string, 
    count: number = 10,
    dimensions?: string[]
  ): Promise<ProfessionalQuestion[]> {
    const database = await getDb();
    
    // Try to get from database first
    if (database) {
      const dbQuestions = await database
        .select()
        .from(psychometricQuestions)
        .where(
          and(
            eq(psychometricQuestions.status, 'available'),
            sql`${psychometricQuestions.dimension} LIKE ${testType + '%'} OR ${psychometricQuestions.traitMeasured} LIKE ${testType + '%'}`
          )
        )
        .limit(count);

      if (dbQuestions.length >= count) {
        return dbQuestions.map(q => this.mapDbQuestionToQuestion(q));
      }
    }

    // Fall back to static question bank
    const staticQuestions = PROFESSIONAL_QUESTION_BANK[testType] || PROFESSIONAL_QUESTION_BANK['personality'];
    
    // Shuffle and return requested count
    const shuffled = [...staticQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Mark questions as used after assessment completion
   */
  async markQuestionsAsUsed(questionIds: number[], assessmentId: number): Promise<void> {
    const database = await getDb();
    if (!database) return;

    for (const id of questionIds) {
      await database
        .update(psychometricQuestions)
        .set({
          status: 'used',
          usedAt: new Date(),
          usedInAssessmentId: assessmentId,
        })
        .where(eq(psychometricQuestions.id, id));
    }

    // Trigger AI replenishment in background
    this.replenishQuestionBank(questionIds.length).catch(console.error);
  }

  /**
   * Replenish question bank with AI-generated questions
   */
  async replenishQuestionBank(count: number): Promise<void> {
    console.log(`[QuestionBank] Replenishing ${count} questions...`);
    
    try {
      // Get test types that need more questions
      const database = await getDb();
      if (!database) return;

      // Generate new questions for each test type
      for (const testType of ['personality', 'emotional_intelligence', 'leadership', 'cognitive']) {
        const questions = await aiRouterService.generatePsychometricQuestions(
          testType === 'personality' ? 'big5' : testType,
          'General',
          Math.ceil(count / 4)
        );

        // Store in database
        for (const q of questions) {
          await database.insert(psychometricQuestions).values({
            testTypeId: 1, // Default test type
            questionText: q.question,
            questionType: this.mapQuestionType(q.type),
            traitMeasured: q.dimension,
            dimension: q.dimension,
            scenario: q.scenario,
            options: JSON.stringify(q.options),
            isReverseCoded: q.scoring === 'reverse',
            orderIndex: 0,
            aiGenerated: true,
            status: 'available',
          });
        }
      }

      console.log(`[QuestionBank] Successfully replenished ${count} questions`);
    } catch (error) {
      console.error('[QuestionBank] Failed to replenish questions:', error);
    }
  }

  /**
   * Populate initial question bank from static questions
   */
  async populateInitialQuestionBank(): Promise<{ added: number }> {
    const database = await getDb();
    if (!database) return { added: 0 };

    let added = 0;

    for (const [testType, questions] of Object.entries(PROFESSIONAL_QUESTION_BANK)) {
      for (const q of questions) {
        try {
          await database.insert(psychometricQuestions).values({
            testTypeId: 1,
            questionText: q.questionText,
            questionType: this.mapQuestionType(q.questionType),
            traitMeasured: q.traitMeasured || q.dimension,
            dimension: q.dimension,
            scenario: q.scenario,
            options: JSON.stringify(q.options),
            isReverseCoded: q.isReverseCoded || false,
            orderIndex: added,
            aiGenerated: false,
            qualityScore: q.qualityScore || 8,
            status: 'available',
          });
          added++;
        } catch (error) {
          // Question may already exist
          console.warn('[QuestionBank] Could not add question:', error);
        }
      }
    }

    return { added };
  }

  /**
   * Get question bank statistics
   */
  async getQuestionBankStats(): Promise<{
    total: number;
    available: number;
    used: number;
    aiGenerated: number;
    byTestType: Record<string, number>;
    byDimension: Record<string, number>;
  }> {
    const database = await getDb();
    if (!database) {
      // Return stats from static bank
      let total = 0;
      const byTestType: Record<string, number> = {};
      for (const [type, questions] of Object.entries(PROFESSIONAL_QUESTION_BANK)) {
        byTestType[type] = questions.length;
        total += questions.length;
      }
      return {
        total,
        available: total,
        used: 0,
        aiGenerated: 0,
        byTestType,
        byDimension: {},
      };
    }

    const allQuestions = await database.select().from(psychometricQuestions);
    
    const stats = {
      total: allQuestions.length,
      available: allQuestions.filter(q => q.status === 'available').length,
      used: allQuestions.filter(q => q.status === 'used').length,
      aiGenerated: allQuestions.filter(q => q.aiGenerated).length,
      byTestType: {} as Record<string, number>,
      byDimension: {} as Record<string, number>,
    };

    for (const q of allQuestions) {
      const type = q.traitMeasured || 'other';
      const dimension = q.dimension || 'other';
      stats.byTestType[type] = (stats.byTestType[type] || 0) + 1;
      stats.byDimension[dimension] = (stats.byDimension[dimension] || 0) + 1;
    }

    return stats;
  }

  // Helper functions
  private mapDbQuestionToQuestion(dbQ: any): ProfessionalQuestion {
    return {
      id: dbQ.id,
      testType: dbQ.traitMeasured || 'personality',
      questionText: dbQ.questionText,
      questionType: dbQ.questionType as any,
      dimension: dbQ.dimension || '',
      scenario: dbQ.scenario,
      options: dbQ.options ? JSON.parse(dbQ.options) : [],
      traitMeasured: dbQ.traitMeasured,
      isReverseCoded: dbQ.isReverseCoded,
      qualityScore: dbQ.qualityScore,
    };
  }

  private mapQuestionType(type: string): 'likert' | 'multiple_choice' | 'true_false' | 'rating' {
    const mapping: Record<string, 'likert' | 'multiple_choice' | 'true_false' | 'rating'> = {
      'scenario': 'multiple_choice',
      'situational': 'multiple_choice',
      'forced_choice': 'multiple_choice',
      'multiple_choice': 'multiple_choice',
      'likert': 'likert',
    };
    return mapping[type] || 'multiple_choice';
  }
}

export const questionBankService = new QuestionBankService();
