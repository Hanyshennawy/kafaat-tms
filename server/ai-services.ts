import { invokeLLM } from "./_core/llm";

/**
 * AI-powered career recommendations based on employee skills and goals
 */
export async function generateCareerRecommendations(params: {
  currentPosition: string;
  skills: string[];
  experience: number;
  interests?: string[];
  careerGoals?: string;
}) {
  const { currentPosition, skills, experience, interests, careerGoals } = params;

  const prompt = `You are an AI career advisor for the UAE Ministry of Education. Analyze the following employee profile and provide personalized career path recommendations.

Current Position: ${currentPosition}
Skills: ${skills.join(", ")}
Years of Experience: ${experience}
${interests ? `Interests: ${interests.join(", ")}` : ""}
${careerGoals ? `Career Goals: ${careerGoals}` : ""}

Provide 3-5 career path recommendations with:
1. Recommended position/role
2. Required skills to develop
3. Estimated timeline
4. Specific action steps
5. Potential salary range (AED)

Format as JSON array.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert career advisor for education sector in UAE." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "career_recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "string" },
                  requiredSkills: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  actionSteps: { type: "array", items: { type: "string" } },
                  salaryRange: { type: "string" },
                  reasoning: { type: "string" },
                },
                required: ["position", "requiredSkills", "timeline", "actionSteps", "salaryRange", "reasoning"],
                additionalProperties: false,
              },
            },
          },
          required: ["recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Parse resume and extract structured information
 */
export async function parseResume(resumeText: string) {
  const prompt = `Extract structured information from the following resume/CV:

${resumeText}

Extract and return the following information in JSON format:
- Full name
- Email
- Phone
- Current position
- Years of experience
- Education (degrees, institutions, years)
- Work experience (positions, companies, durations, responsibilities)
- Skills (categorized: technical, soft, languages)
- Certifications
- Summary/Objective`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert resume parser for HR systems." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "resume_data",
        strict: true,
        schema: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            currentPosition: { type: "string" },
            yearsOfExperience: { type: "number" },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  year: { type: "string" },
                },
                required: ["degree", "institution", "year"],
                additionalProperties: false,
              },
            },
            workExperience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "string" },
                  company: { type: "string" },
                  duration: { type: "string" },
                  responsibilities: { type: "array", items: { type: "string" } },
                },
                required: ["position", "company", "duration", "responsibilities"],
                additionalProperties: false,
              },
            },
            skills: {
              type: "object",
              properties: {
                technical: { type: "array", items: { type: "string" } },
                soft: { type: "array", items: { type: "string" } },
                languages: { type: "array", items: { type: "string" } },
              },
              required: ["technical", "soft", "languages"],
              additionalProperties: false,
            },
            certifications: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
          },
          required: ["fullName", "email", "phone", "currentPosition", "yearsOfExperience", "education", "workExperience", "skills", "certifications", "summary"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Analyze survey responses for sentiment and engagement insights
 */
export async function analyzeSentiment(responses: Array<{ question: string; answer: string }>) {
  const prompt = `Analyze the following survey responses and provide sentiment analysis and engagement insights:

${responses.map((r, i) => `Q${i + 1}: ${r.question}\nA: ${r.answer}`).join("\n\n")}

Provide:
1. Overall sentiment score (0-100)
2. Sentiment category (Very Positive, Positive, Neutral, Negative, Very Negative)
3. Key themes identified
4. Areas of concern
5. Recommendations for improvement`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert in employee engagement and sentiment analysis." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sentiment_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            sentimentScore: { type: "number" },
            sentimentCategory: { type: "string" },
            keyThemes: { type: "array", items: { type: "string" } },
            areasOfConcern: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
          },
          required: ["sentimentScore", "sentimentCategory", "keyThemes", "areasOfConcern", "recommendations", "summary"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Match candidates to job requisitions using AI
 */
export async function matchCandidateToJob(params: {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  candidateProfile: {
    name: string;
    currentPosition: string;
    skills: string[];
    experience: number;
    education: string[];
  };
}) {
  const { jobTitle, jobDescription, requiredSkills, candidateProfile } = params;

  const prompt = `Evaluate how well this candidate matches the job requirements:

JOB:
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${requiredSkills.join(", ")}

CANDIDATE:
Name: ${candidateProfile.name}
Current Position: ${candidateProfile.currentPosition}
Skills: ${candidateProfile.skills.join(", ")}
Experience: ${candidateProfile.experience} years
Education: ${candidateProfile.education.join(", ")}

Provide:
1. Match score (0-100)
2. Match category (Excellent, Good, Fair, Poor)
3. Strengths (what makes them a good fit)
4. Gaps (what they're missing)
5. Interview recommendation (Yes/No with reasoning)`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert recruiter and talent matcher." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "candidate_match",
        strict: true,
        schema: {
          type: "object",
          properties: {
            matchScore: { type: "number" },
            matchCategory: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            gaps: { type: "array", items: { type: "string" } },
            interviewRecommendation: { type: "boolean" },
            reasoning: { type: "string" },
          },
          required: ["matchScore", "matchCategory", "strengths", "gaps", "interviewRecommendation", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Generate performance review insights
 */
export async function generatePerformanceInsights(params: {
  employeeName: string;
  goals: Array<{ title: string; progress: number; status: string }>;
  feedback: string[];
  selfAppraisal?: string;
}) {
  const { employeeName, goals, feedback, selfAppraisal } = params;

  const prompt = `Analyze the performance data and provide insights:

Employee: ${employeeName}

Goals:
${goals.map((g, i) => `${i + 1}. ${g.title} - ${g.progress}% complete (${g.status})`).join("\n")}

Feedback Received:
${feedback.join("\n")}

${selfAppraisal ? `Self-Appraisal:\n${selfAppraisal}` : ""}

Provide:
1. Overall performance rating (1-5)
2. Key strengths
3. Areas for improvement
4. Development recommendations
5. Summary and next steps`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert performance management consultant." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "performance_insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            overallRating: { type: "number" },
            keyStrengths: { type: "array", items: { type: "string" } },
            areasForImprovement: { type: "array", items: { type: "string" } },
            developmentRecommendations: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            nextSteps: { type: "array", items: { type: "string" } },
          },
          required: ["overallRating", "keyStrengths", "areasForImprovement", "developmentRecommendations", "summary", "nextSteps"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Generate interview questions based on job requirements and candidate profile
 */
export async function generateInterviewQuestions(params: {
  jobTitle: string;
  requiredSkills: string[];
  candidateExperience: number;
  candidateBackground: string;
  questionTypes: ('behavioral' | 'technical' | 'situational' | 'cultural')[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
}) {
  const { jobTitle, requiredSkills, candidateExperience, candidateBackground, questionTypes, difficulty } = params;

  const prompt = `Generate interview questions for a candidate:

JOB: ${jobTitle}
REQUIRED SKILLS: ${requiredSkills.join(", ")}
CANDIDATE EXPERIENCE: ${candidateExperience} years
BACKGROUND: ${candidateBackground}
QUESTION TYPES: ${questionTypes.join(", ")}
DIFFICULTY: ${difficulty}

Generate 10 interview questions with:
1. The question itself
2. Question type (behavioral/technical/situational/cultural)
3. What to look for in the answer
4. Sample good answer
5. Red flags to watch for`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert interviewer and talent assessor." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "interview_questions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  type: { type: "string" },
                  lookFor: { type: "array", items: { type: "string" } },
                  sampleAnswer: { type: "string" },
                  redFlags: { type: "array", items: { type: "string" } },
                },
                required: ["question", "type", "lookFor", "sampleAnswer", "redFlags"],
                additionalProperties: false,
              },
            },
          },
          required: ["questions"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Analyze competency gaps and recommend training
 */
export async function analyzeCompetencyGaps(params: {
  currentCompetencies: Array<{ name: string; level: number; required: number }>;
  role: string;
  careerGoal?: string;
}) {
  const { currentCompetencies, role, careerGoal } = params;

  const prompt = `Analyze competency gaps for an employee:

CURRENT ROLE: ${role}
${careerGoal ? `CAREER GOAL: ${careerGoal}` : ''}

COMPETENCY ASSESSMENT:
${currentCompetencies.map(c => `- ${c.name}: Current ${c.level}/5, Required ${c.required}/5`).join('\n')}

Provide:
1. Priority competencies to develop
2. Recommended training programs
3. Learning path with timeline
4. Mentoring suggestions
5. Practical exercises`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert in competency development and training design." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "competency_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            priorityCompetencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  gap: { type: "number" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                },
                required: ["name", "gap", "priority", "reason"],
                additionalProperties: false,
              },
            },
            recommendedTraining: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  duration: { type: "string" },
                  provider: { type: "string" },
                },
                required: ["title", "type", "duration", "provider"],
                additionalProperties: false,
              },
            },
            learningPath: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "number" },
                  focus: { type: "string" },
                  timeline: { type: "string" },
                  activities: { type: "array", items: { type: "string" } },
                },
                required: ["phase", "focus", "timeline", "activities"],
                additionalProperties: false,
              },
            },
            mentoringSuggestions: { type: "array", items: { type: "string" } },
            practicalExercises: { type: "array", items: { type: "string" } },
          },
          required: ["priorityCompetencies", "recommendedTraining", "learningPath", "mentoringSuggestions", "practicalExercises"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Generate succession planning recommendations
 */
export async function generateSuccessionRecommendations(params: {
  position: string;
  currentHolder: { name: string; yearsInRole: number; retirementDate?: string };
  candidates: Array<{
    name: string;
    currentRole: string;
    readinessLevel: 'ready_now' | 'ready_1_2_years' | 'ready_3_5_years';
    strengths: string[];
    developmentNeeds: string[];
  }>;
}) {
  const { position, currentHolder, candidates } = params;

  const prompt = `Analyze succession planning for a critical position:

POSITION: ${position}
CURRENT HOLDER: ${currentHolder.name} (${currentHolder.yearsInRole} years in role)
${currentHolder.retirementDate ? `EXPECTED TRANSITION: ${currentHolder.retirementDate}` : ''}

CANDIDATES:
${candidates.map((c, i) => `
${i + 1}. ${c.name} - ${c.currentRole}
   Readiness: ${c.readinessLevel.replace('_', ' ')}
   Strengths: ${c.strengths.join(', ')}
   Development Needs: ${c.developmentNeeds.join(', ')}
`).join('')}

Provide succession planning recommendations including:
1. Candidate ranking with rationale
2. Development plans for each candidate
3. Risk assessment
4. Timeline recommendations
5. Knowledge transfer plan`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert in succession planning and talent development." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "succession_recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            candidateRankings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rank: { type: "number" },
                  name: { type: "string" },
                  score: { type: "number" },
                  rationale: { type: "string" },
                },
                required: ["rank", "name", "score", "rationale"],
                additionalProperties: false,
              },
            },
            developmentPlans: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  candidateName: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  expectedOutcome: { type: "string" },
                },
                required: ["candidateName", "actions", "timeline", "expectedOutcome"],
                additionalProperties: false,
              },
            },
            riskAssessment: {
              type: "object",
              properties: {
                overallRisk: { type: "string" },
                riskFactors: { type: "array", items: { type: "string" } },
                mitigationStrategies: { type: "array", items: { type: "string" } },
              },
              required: ["overallRisk", "riskFactors", "mitigationStrategies"],
              additionalProperties: false,
            },
            timelineRecommendations: { type: "array", items: { type: "string" } },
            knowledgeTransferPlan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  activities: { type: "array", items: { type: "string" } },
                  duration: { type: "string" },
                },
                required: ["phase", "activities", "duration"],
                additionalProperties: false,
              },
            },
          },
          required: ["candidateRankings", "developmentPlans", "riskAssessment", "timelineRecommendations", "knowledgeTransferPlan"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Generate workforce analytics insights
 */
export async function generateWorkforceInsights(params: {
  totalEmployees: number;
  departmentBreakdown: Record<string, number>;
  averageTenure: number;
  turnoverRate: number;
  demographicData?: {
    ageDistribution: Record<string, number>;
    genderDistribution: Record<string, number>;
  };
  performanceDistribution: Record<string, number>;
}) {
  const { totalEmployees, departmentBreakdown, averageTenure, turnoverRate, demographicData, performanceDistribution } = params;

  const prompt = `Analyze workforce data and provide strategic insights:

WORKFORCE OVERVIEW:
- Total Employees: ${totalEmployees}
- Average Tenure: ${averageTenure} years
- Turnover Rate: ${turnoverRate}%

DEPARTMENT BREAKDOWN:
${Object.entries(departmentBreakdown).map(([dept, count]) => `- ${dept}: ${count}`).join('\n')}

${demographicData ? `
AGE DISTRIBUTION:
${Object.entries(demographicData.ageDistribution).map(([age, count]) => `- ${age}: ${count}`).join('\n')}

GENDER DISTRIBUTION:
${Object.entries(demographicData.genderDistribution).map(([gender, count]) => `- ${gender}: ${count}`).join('\n')}
` : ''}

PERFORMANCE DISTRIBUTION:
${Object.entries(performanceDistribution).map(([rating, count]) => `- ${rating}: ${count}`).join('\n')}

Provide strategic workforce insights:
1. Key workforce metrics analysis
2. Potential risks and concerns
3. Opportunities for improvement
4. Recommendations for HR strategy
5. Predictive trends`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert in workforce analytics and HR strategy." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "workforce_insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            keyMetrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  value: { type: "string" },
                  assessment: { type: "string" },
                  benchmark: { type: "string" },
                },
                required: ["metric", "value", "assessment", "benchmark"],
                additionalProperties: false,
              },
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" },
                  mitigation: { type: "string" },
                },
                required: ["risk", "severity", "impact", "mitigation"],
                additionalProperties: false,
              },
            },
            opportunities: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            predictiveTrends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  likelihood: { type: "string" },
                  timeframe: { type: "string" },
                  action: { type: "string" },
                },
                required: ["trend", "likelihood", "timeframe", "action"],
                additionalProperties: false,
              },
            },
            summary: { type: "string" },
          },
          required: ["keyMetrics", "risks", "opportunities", "recommendations", "predictiveTrends", "summary"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}

/**
 * Analyze feedback and generate action items
 */
export async function analyzeFeedback(params: {
  feedbackType: 'performance' | '360' | 'exit' | 'survey' | 'engagement';
  feedback: Array<{ source: string; content: string; rating?: number }>;
  context?: string;
}) {
  const { feedbackType, feedback, context } = params;

  const prompt = `Analyze ${feedbackType} feedback and generate actionable insights:

${context ? `CONTEXT: ${context}\n` : ''}

FEEDBACK RECEIVED:
${feedback.map((f, i) => `
${i + 1}. Source: ${f.source}
   ${f.rating ? `Rating: ${f.rating}/5` : ''}
   Content: ${f.content}
`).join('')}

Provide:
1. Key themes and patterns
2. Sentiment analysis
3. Priority action items
4. Quick wins vs long-term improvements
5. Follow-up recommendations`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert in feedback analysis and organizational development." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "feedback_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  frequency: { type: "string" },
                  sentiment: { type: "string" },
                  examples: { type: "array", items: { type: "string" } },
                },
                required: ["theme", "frequency", "sentiment", "examples"],
                additionalProperties: false,
              },
            },
            sentimentSummary: {
              type: "object",
              properties: {
                overall: { type: "string" },
                score: { type: "number" },
                positiveAspects: { type: "array", items: { type: "string" } },
                negativeAspects: { type: "array", items: { type: "string" } },
              },
              required: ["overall", "score", "positiveAspects", "negativeAspects"],
              additionalProperties: false,
            },
            actionItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  owner: { type: "string" },
                  timeline: { type: "string" },
                },
                required: ["action", "priority", "owner", "timeline"],
                additionalProperties: false,
              },
            },
            quickWins: { type: "array", items: { type: "string" } },
            longTermImprovements: { type: "array", items: { type: "string" } },
            followUpRecommendations: { type: "array", items: { type: "string" } },
          },
          required: ["themes", "sentimentSummary", "actionItems", "quickWins", "longTermImprovements", "followUpRecommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) throw new Error("No response from AI");
  const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

  return JSON.parse(content);
}
