import { invokeLLM } from "./_core/llm";
import { aiRouterService } from "./services/ai-router.service";

interface GeneratedQuestion {
  questionText: string;
  questionContext?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  tags: string[];
}

export async function generateQuestions(
  jobRole: string,
  licenseTier: string,
  subjectArea: string,
  difficultyLevel: string,
  questionType: string,
  count: number
): Promise<GeneratedQuestion[]> {
  // Try AI Router first (uses Together.ai or OpenAI)
  try {
    const questions = await aiRouterService.generateLicensingQuestions(
      jobRole,
      licenseTier,
      subjectArea,
      difficultyLevel,
      questionType,
      count
    );
    
    if (questions && questions.length > 0) {
      return questions;
    }
  } catch (error) {
    console.warn('[Question Generator] AI Router failed, falling back to direct LLM:', error);
  }
  
  // Fallback to direct LLM invocation (original implementation)
  const prompt = "You are an expert educator assessment designer for the UAE Ministry of Education. Generate " + count + " high-quality " + difficultyLevel + " level " + questionType + " questions for " + jobRole + " candidates applying for " + licenseTier + " license in " + subjectArea + ".\n\nRequirements:\n- Questions should assess competencies specific to " + jobRole + " in UAE educational context\n- Include realistic teaching scenarios relevant to " + subjectArea + "\n- Difficulty level: " + difficultyLevel + "\n- Question type: " + questionType + "\n- Each question should have 4 options (for multiple choice)\n- Include detailed explanations for correct answers\n- Tag questions with relevant competency areas\n\nFocus on these competency areas for " + jobRole + ":\n- Pedagogical Knowledge\n- Subject Matter Expertise\n- Assessment and Evaluation Methods\n- Classroom Management\n- Student Engagement Strategies\n- Differentiated Instruction\n- Technology Integration\n- Professional Ethics and Standards\n\nGenerate exactly " + count + " questions now.";

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert educator assessment designer. Always respond with valid JSON arrays only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "questions_array",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionText: { type: "string" },
                    questionContext: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    correctAnswer: { type: "integer" },
                    explanation: { type: "string" },
                    points: { type: "integer" },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "questionText",
                    "options",
                    "correctAnswer",
                    "explanation",
                    "points",
                    "tags",
                  ],
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

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return parsed.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}
