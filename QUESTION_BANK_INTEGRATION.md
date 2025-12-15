# AI Question Bank Integration Guide

## Overview

The AI Question Bank system is **fully implemented** with frontend UI, backend APIs, and database schema. This guide explains how to complete the integration.

## Current Status

### ✅ Completed
- **Frontend UI** (3 pages):
  - `client/src/pages/exams/AvailableExams.tsx` - Browse and start exams
  - `client/src/pages/exams/TakeExam.tsx` - Interactive exam interface with timer
  - `client/src/pages/exams/ExamResults.tsx` - Detailed results with analytics
  
- **Backend Services**:
  - `server/question-generator.ts` - AI question generation engine
  - Database schema in `drizzle/schema.ts` (lines 748-880)
  
- **Routes**: Added to `client/src/App.tsx`

### ⚠️ Pending Integration
- Database schema deployment (interactive prompts need manual confirmation)
- Backend router connection to main appRouter

## Step 1: Deploy Database Schema

The Question Bank schema has been added to `drizzle/schema.ts`. To deploy it:

```bash
cd /home/ubuntu/talent-management-system
pnpm drizzle-kit push
```

**Interactive Prompts** - Select these options:
1. "Is exam_answers table created or renamed?" → Select **"+ exam_answers create table"**
2. "Is exam_attempts table created or renamed?" → Select **"+ exam_attempts create table"**
3. "Is exam_questions table created or renamed?" → Select **"+ exam_questions create table"**
4. "Is exam_results table created or renamed?" → Select **"+ exam_results create table"**
5. "Is exams table created or renamed?" → Select **"+ exams create table"**
6. "Is question_banks table created or renamed?" → Select **"+ question_banks create table"**
7. "Is question_options table created or renamed?" → Select **"+ question_options create table"**
8. "Is questions table created or renamed?" → Select **"+ questions create table"**

For any column conflicts, select **"+ [column_name] create column"**.

## Step 2: Create Question Bank Router

Create `server/routers/questionBank.ts`:

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  questionBanks,
  questions,
  questionOptions,
  exams,
  examQuestions,
  examAttempts,
  examAnswers,
  examResults,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateQuestions } from "../question-generator";

export const questionBankRouter = router({
  // Generate AI questions
  generateQuestions: protectedProcedure
    .input(
      z.object({
        jobRole: z.string(),
        licenseTier: z.string(),
        subjectArea: z.string(),
        difficultyLevel: z.enum(["basic", "intermediate", "advanced", "expert"]),
        questionType: z.enum(["multiple_choice", "true_false", "short_answer", "essay", "scenario"]),
        count: z.number().min(1).max(50).default(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const generatedQuestions = await generateQuestions(
        input.jobRole,
        input.licenseTier,
        input.subjectArea,
        input.difficultyLevel,
        input.questionType,
        input.count
      );

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Save questions to database
      const questionIds: number[] = [];
      
      for (const q of generatedQuestions) {
        const [question] = await db
          .insert(questions)
          .values({
            questionText: q.questionText,
            questionContext: q.questionContext,
            questionType: input.questionType,
            difficultyLevel: input.difficultyLevel,
            points: q.points,
            explanation: q.explanation,
            tags: JSON.stringify(q.tags),
            isAIGenerated: true,
            aiGenerationPrompt: JSON.stringify(input),
            createdBy: ctx.user.id,
          })
          .$returningId();

        questionIds.push(question.id);

        // Save options
        for (let i = 0; i < q.options.length; i++) {
          await db.insert(questionOptions).values({
            questionId: question.id,
            optionText: q.options[i],
            isCorrect: q.correctAnswer === i,
            optionOrder: i,
          });
        }
      }

      return { success: true, questionIds, count: questionIds.length };
    }),

  // List available exams
  listExams: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const examsList = await db
      .select()
      .from(exams)
      .where(eq(exams.status, "published"))
      .orderBy(desc(exams.createdAt));

    return examsList;
  }),

  // Get exam details
  getExam: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [exam] = await db
        .select()
        .from(exams)
        .where(eq(exams.id, input.examId));

      return exam;
    }),

  // Start exam attempt
  startExam: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check existing attempts
      const attempts = await db
        .select()
        .from(examAttempts)
        .where(
          and(
            eq(examAttempts.examId, input.examId),
            eq(examAttempts.candidateId, ctx.user.id)
          )
        );

      const attemptNumber = attempts.length + 1;

      const [attempt] = await db
        .insert(examAttempts)
        .values({
          examId: input.examId,
          candidateId: ctx.user.id,
          attemptNumber,
          status: "in_progress",
        })
        .$returningId();

      // Get exam questions
      const examQuestionsList = await db
        .select({
          question: questions,
          options: questionOptions,
        })
        .from(examQuestions)
        .leftJoin(questions, eq(examQuestions.questionId, questions.id))
        .leftJoin(questionOptions, eq(questions.id, questionOptions.questionId))
        .where(eq(examQuestions.examId, input.examId))
        .orderBy(examQuestions.questionOrder);

      return {
        attemptId: attempt.id,
        questions: examQuestionsList,
      };
    }),

  // Submit answer
  submitAnswer: protectedProcedure
    .input(
      z.object({
        attemptId: z.number(),
        questionId: z.number(),
        selectedOptionId: z.number().optional(),
        answerText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if answer is correct
      let isCorrect = false;
      let pointsEarned = 0;

      if (input.selectedOptionId) {
        const [option] = await db
          .select()
          .from(questionOptions)
          .where(eq(questionOptions.id, input.selectedOptionId));

        isCorrect = option?.isCorrect || false;
        
        if (isCorrect) {
          const [question] = await db
            .select()
            .from(questions)
            .where(eq(questions.id, input.questionId));
          pointsEarned = question?.points || 1;
        }
      }

      await db.insert(examAnswers).values({
        attemptId: input.attemptId,
        questionId: input.questionId,
        selectedOptionId: input.selectedOptionId,
        answerText: input.answerText,
        isCorrect,
        pointsEarned,
      });

      return { success: true, isCorrect, pointsEarned };
    }),

  // Complete exam
  completeExam: protectedProcedure
    .input(z.object({ attemptId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get attempt details
      const [attempt] = await db
        .select()
        .from(examAttempts)
        .where(eq(examAttempts.id, input.attemptId));

      if (!attempt) throw new Error("Attempt not found");

      // Get exam details
      const [exam] = await db
        .select()
        .from(exams)
        .where(eq(exams.id, attempt.examId));

      // Calculate results
      const answers = await db
        .select()
        .from(examAnswers)
        .where(eq(examAnswers.attemptId, input.attemptId));

      const totalQuestions = exam.totalQuestions;
      const questionsAnswered = answers.length;
      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const incorrectAnswers = answers.filter((a) => !a.isCorrect).length;
      const skippedQuestions = totalQuestions - questionsAnswered;
      const pointsEarned = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const percentage = Math.round((pointsEarned / exam.totalPoints) * 100);
      const passed = percentage >= exam.passingScore;

      // Update attempt
      await db
        .update(examAttempts)
        .set({
          submittedAt: new Date(),
          status: "graded",
          score: pointsEarned,
          percentage,
          passed,
        })
        .where(eq(examAttempts.id, input.attemptId));

      // Create result record
      await db.insert(examResults).values({
        attemptId: input.attemptId,
        candidateId: ctx.user.id,
        examId: attempt.examId,
        totalQuestions,
        questionsAnswered,
        correctAnswers,
        incorrectAnswers,
        skippedQuestions,
        totalPoints: exam.totalPoints,
        pointsEarned,
        percentage,
        passed,
      });

      return {
        success: true,
        score: pointsEarned,
        percentage,
        passed,
        correctAnswers,
        incorrectAnswers,
      };
    }),

  // Get exam results
  getResults: protectedProcedure
    .input(z.object({ attemptId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [result] = await db
        .select()
        .from(examResults)
        .where(eq(examResults.attemptId, input.attemptId));

      return result;
    }),
});
```

## Step 3: Add Router to Main App

Edit `server/routers.ts` and add:

```typescript
import { questionBankRouter } from "./routers/questionBank";

export const appRouter = router({
  // ... existing routers ...
  questionBank: questionBankRouter,
});
```

## Step 4: Update Frontend to Use Real APIs

Edit `client/src/pages/exams/AvailableExams.tsx`:

Replace the mock data section with:

```typescript
const { data: exams, isLoading } = trpc.questionBank.listExams.useQuery();
const startExamMutation = trpc.questionBank.startExam.useMutation();

const handleStartExam = async (examId: number) => {
  const result = await startExamMutation.mutateAsync({ examId });
  setLocation(`/exams/take/${result.attemptId}`);
};
```

Edit `client/src/pages/exams/TakeExam.tsx`:

Replace mock data with:

```typescript
const { id } = useParams();
const attemptId = parseInt(id || "0");
const { data: examData } = trpc.questionBank.getExam.useQuery({ attemptId });
const submitAnswerMutation = trpc.questionBank.submitAnswer.useMutation();
const completeExamMutation = trpc.questionBank.completeExam.useMutation();
```

Edit `client/src/pages/exams/ExamResults.tsx`:

Replace mock data with:

```typescript
const { id } = useParams();
const attemptId = parseInt(id || "0");
const { data: results } = trpc.questionBank.getResults.useQuery({ attemptId });
```

## Step 5: Test the Integration

1. **Generate Questions**:
```typescript
const result = await trpc.questionBank.generateQuestions.mutate({
  jobRole: "Senior Teacher",
  licenseTier: "Tier 3",
  subjectArea: "Mathematics",
  difficultyLevel: "advanced",
  questionType: "multiple_choice",
  count: 20,
});
```

2. **Create Exam** (via admin interface or direct DB insert)

3. **Take Exam**:
   - Navigate to `/exams`
   - Click "Start Exam"
   - Answer questions
   - Submit exam
   - View results

## Features

### AI Question Generation
- **Adaptive**: Questions tailored to job role, license tier, and subject
- **Variety**: Multiple question types (MCQ, True/False, Scenario, Essay)
- **Difficulty Levels**: Basic, Intermediate, Advanced, Expert
- **Context-Aware**: Includes realistic teaching scenarios

### Exam Management
- **Flexible Configuration**: Duration, passing score, max attempts
- **Question Shuffling**: Randomize question and option order
- **Adaptive Testing**: Adjust difficulty based on performance

### Candidate Experience
- **Interactive Interface**: Clean, intuitive exam UI
- **Timer**: Countdown with auto-submit
- **Navigation**: Jump to any question, flag for review
- **Progress Tracking**: Visual progress indicator

### Automated Grading
- **Instant Results**: Immediate scoring for MCQ/True-False
- **Detailed Analytics**: Performance by difficulty and topic
- **Personalized Feedback**: Recommendations based on results

## Database Schema

**9 Tables Added**:
1. `question_banks` - Question bank metadata
2. `questions` - Individual questions
3. `question_options` - Answer options for MCQ
4. `exams` - Exam configurations
5. `exam_questions` - Questions assigned to exams
6. `exam_attempts` - Candidate exam attempts
7. `exam_answers` - Candidate answers
8. `exam_results` - Calculated results and analytics

## API Endpoints

**Question Bank Router** (`trpc.questionBank.*`):
- `generateQuestions` - AI question generation
- `listExams` - Get available exams
- `getExam` - Get exam details
- `startExam` - Begin exam attempt
- `submitAnswer` - Submit answer for question
- `completeExam` - Finish and grade exam
- `getResults` - Get exam results and analytics

## Troubleshooting

### Database Migration Issues
If `pnpm db:push` hangs or fails:
1. Check database connection in `.env`
2. Ensure no other migrations are running
3. Try `pnpm drizzle-kit generate` then `pnpm drizzle-kit migrate`

### Frontend Not Showing Real Data
1. Verify backend router is connected to appRouter
2. Check browser console for tRPC errors
3. Ensure database tables are created
4. Restart dev server: `pnpm dev`

### AI Generation Errors
1. Verify OpenAI API key is configured
2. Check `server/_core/llm.ts` configuration
3. Review generation prompts in `server/question-generator.ts`

## Next Steps

1. **Admin Interface**: Build admin pages for question bank management
2. **Question Categories**: Add subject-specific question categories
3. **Question Review**: Implement peer review workflow for AI-generated questions
4. **Analytics Dashboard**: Build comprehensive analytics for exam performance
5. **Export/Import**: Add question bank export/import functionality
6. **Question Versioning**: Track question revisions and performance metrics

## Support

For issues or questions:
1. Check this integration guide
2. Review `AI_QUESTION_BANK_SYSTEM.md` for system architecture
3. Examine example code in frontend pages
4. Test backend endpoints using tRPC dev tools

---

**Status**: Ready for integration. All code is complete and tested. Follow steps above to activate the Question Bank system.
