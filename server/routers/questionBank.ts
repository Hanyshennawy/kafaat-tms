import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { generateQuestions } from "../question-generator";

// Generate AI questions
export const questionBankRouter = router({
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

      const questionIds: number[] = [];
      
      for (const q of generatedQuestions) {
        const result = await db.execute(sql`
          INSERT INTO questions (
            question_text, question_context, question_type, difficulty_level,
            points, explanation, tags, is_ai_generated, ai_generation_prompt, created_by
          ) VALUES (
            ${q.questionText}, ${q.questionContext}, ${input.questionType}, ${input.difficultyLevel},
            ${q.points}, ${q.explanation}, ${JSON.stringify(q.tags)}, TRUE, ${JSON.stringify(input)}, ${ctx.user.id}
          )
        `);

        const questionId = (result as any).insertId;
        questionIds.push(questionId);

        // Save options
        for (let i = 0; i < q.options.length; i++) {
          await db.execute(sql`
            INSERT INTO question_options (question_id, option_text, is_correct, option_order)
            VALUES (${questionId}, ${q.options[i]}, ${q.correctAnswer === i}, ${i})
          `);
        }
      }

      return { success: true, questionIds, count: questionIds.length };
    }),

  // List available exams
  listExams: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const result = await db.execute(sql`
      SELECT * FROM exams
      WHERE status = 'published'
      ORDER BY created_at DESC
    `);

    return (result as any)[0] || [];
  }),

  // Get exam details with questions
  getExam: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const examResult = await db.execute(sql`
        SELECT * FROM exams WHERE id = ${input.examId}
      `);

      const exam = ((examResult as any)[0] || [])[0];
      if (!exam) return null;

      // Get questions with options
      const questionsResult = await db.execute(sql`
        SELECT 
          q.id, q.question_text, q.question_context, q.question_type,
          q.difficulty_level, q.points, q.explanation,
          eq.question_order
        FROM exam_questions eq
        JOIN questions q ON eq.question_id = q.id
        WHERE eq.exam_id = ${input.examId}
        ORDER BY eq.question_order
      `);

      const questions = (questionsResult as any)[0] || [];

      // Get options for each question
      for (const question of questions) {
        const optionsResult = await db.execute(sql`
          SELECT id, option_text, option_order
          FROM question_options
          WHERE question_id = ${question.id}
          ORDER BY option_order
        `);
        question.options = (optionsResult as any)[0] || [];
      }

      return { ...exam, questions };
    }),

  // Start exam attempt
  startExam: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check existing attempts
      const attemptsResult = await db.execute(sql`
        SELECT * FROM exam_attempts
        WHERE exam_id = ${input.examId} AND candidate_id = ${ctx.user.id}
      `);

      const attempts = (attemptsResult as any)[0] || [];
      const attemptNumber = attempts.length + 1;

      // Create new attempt
      const result = await db.execute(sql`
        INSERT INTO exam_attempts (exam_id, candidate_id, attempt_number, status)
        VALUES (${input.examId}, ${ctx.user.id}, ${attemptNumber}, 'in_progress')
      `);

      const attemptId = (result as any).insertId;

      // Get exam with questions
      const examData = await db.execute(sql`
        SELECT 
          e.*,
          q.id as question_id, q.question_text, q.question_context,
          q.question_type, q.difficulty_level, q.points,
          eq.question_order
        FROM exams e
        JOIN exam_questions eq ON e.id = eq.exam_id
        JOIN questions q ON eq.question_id = q.id
        WHERE e.id = ${input.examId}
        ORDER BY eq.question_order
      `);

      const rows = (examData as any)[0] || [];
      
      if (rows.length === 0) {
        throw new Error("Exam not found");
      }

      const exam = {
        id: rows[0].id,
        title: rows[0].title,
        description: rows[0].description,
        duration: rows[0].duration,
        totalQuestions: rows[0].total_questions,
        passingScore: rows[0].passing_score,
      };

      const questions = [];
      const questionIds = new Set();

      for (const row of rows) {
        if (!questionIds.has(row.question_id)) {
          questionIds.add(row.question_id);
          
          // Get options
          const optionsResult = await db.execute(sql`
            SELECT id, option_text, option_order
            FROM question_options
            WHERE question_id = ${row.question_id}
            ORDER BY option_order
          `);

          questions.push({
            id: row.question_id,
            questionText: row.question_text,
            questionContext: row.question_context,
            questionType: row.question_type,
            difficultyLevel: row.difficulty_level,
            points: row.points,
            questionOrder: row.question_order,
            options: (optionsResult as any)[0] || [],
          });
        }
      }

      return {
        attemptId,
        exam,
        questions,
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
        const optionResult = await db.execute(sql`
          SELECT is_correct FROM question_options WHERE id = ${input.selectedOptionId}
        `);

        const option = ((optionResult as any)[0] || [])[0];
        isCorrect = option?.is_correct || false;
        
        if (isCorrect) {
          const questionResult = await db.execute(sql`
            SELECT points FROM questions WHERE id = ${input.questionId}
          `);
          const question = ((questionResult as any)[0] || [])[0];
          pointsEarned = question?.points || 1;
        }
      }

      // Check if answer already exists
      const existingResult = await db.execute(sql`
        SELECT id FROM exam_answers
        WHERE attempt_id = ${input.attemptId} AND question_id = ${input.questionId}
      `);

      const existing = ((existingResult as any)[0] || [])[0];

      if (existing) {
        // Update existing answer
        await db.execute(sql`
          UPDATE exam_answers
          SET selected_option_id = ${input.selectedOptionId || null},
              answer_text = ${input.answerText || null},
              is_correct = ${isCorrect},
              points_earned = ${pointsEarned},
              answered_at = NOW()
          WHERE id = ${existing.id}
        `);
      } else {
        // Insert new answer
        await db.execute(sql`
          INSERT INTO exam_answers (
            attempt_id, question_id, selected_option_id, answer_text,
            is_correct, points_earned
          ) VALUES (
            ${input.attemptId}, ${input.questionId}, ${input.selectedOptionId || null},
            ${input.answerText || null}, ${isCorrect}, ${pointsEarned}
          )
        `);
      }

      return { success: true, isCorrect, pointsEarned };
    }),

  // Complete exam
  completeExam: protectedProcedure
    .input(z.object({ attemptId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get attempt details
      const attemptResult = await db.execute(sql`
        SELECT * FROM exam_attempts WHERE id = ${input.attemptId}
      `);

      const attempt = ((attemptResult as any)[0] || [])[0];
      if (!attempt) throw new Error("Attempt not found");

      // Get exam details
      const examResult = await db.execute(sql`
        SELECT * FROM exams WHERE id = ${attempt.exam_id}
      `);

      const exam = ((examResult as any)[0] || [])[0];

      // Calculate results
      const answersResult = await db.execute(sql`
        SELECT * FROM exam_answers WHERE attempt_id = ${input.attemptId}
      `);

      const answers = (answersResult as any)[0] || [];

      const totalQuestions = exam.total_questions;
      const questionsAnswered = answers.length;
      const correctAnswers = answers.filter((a: any) => a.is_correct).length;
      const incorrectAnswers = answers.filter((a: any) => !a.is_correct && a.selected_option_id).length;
      const skippedQuestions = totalQuestions - questionsAnswered;
      const pointsEarned = answers.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);
      const percentage = Math.round((pointsEarned / exam.total_points) * 100);
      const passed = percentage >= exam.passing_score;

      // Update attempt
      await db.execute(sql`
        UPDATE exam_attempts
        SET submitted_at = NOW(),
            status = 'graded',
            score = ${pointsEarned},
            percentage = ${percentage},
            passed = ${passed}
        WHERE id = ${input.attemptId}
      `);

      // Create result record
      await db.execute(sql`
        INSERT INTO exam_results (
          attempt_id, candidate_id, exam_id,
          total_questions, questions_answered, correct_answers,
          incorrect_answers, skipped_questions,
          total_points, points_earned, percentage, passed
        ) VALUES (
          ${input.attemptId}, ${ctx.user.id}, ${attempt.exam_id},
          ${totalQuestions}, ${questionsAnswered}, ${correctAnswers},
          ${incorrectAnswers}, ${skippedQuestions},
          ${exam.total_points}, ${pointsEarned}, ${percentage}, ${passed}
        )
      `);

      return {
        success: true,
        score: pointsEarned,
        percentage,
        passed,
        correctAnswers,
        incorrectAnswers,
        totalQuestions,
      };
    }),

  // Get exam results
  getResults: protectedProcedure
    .input(z.object({ attemptId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const resultData = await db.execute(sql`
        SELECT * FROM exam_results WHERE attempt_id = ${input.attemptId}
      `);

      return ((resultData as any)[0] || [])[0] || null;
    }),

  // Get my exam attempts
  myAttempts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db.execute(sql`
      SELECT 
        ea.*,
        e.title as exam_title,
        e.exam_type
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE ea.candidate_id = ${ctx.user.id}
      ORDER BY ea.created_at DESC
    `);

    return (result as any)[0] || [];
  }),

  // Get detailed exam review with answers and explanations
  getExamReview: protectedProcedure
    .input(z.object({ attemptId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get attempt details
      const attemptResult = await db.execute(sql`
        SELECT ea.*, e.title, e.total_questions, e.total_points, e.passing_score
        FROM exam_attempts ea
        JOIN exams e ON ea.exam_id = e.id
        WHERE ea.id = ${input.attemptId} AND ea.user_id = ${ctx.user.id}
      `);

      const attempt = (attemptResult as any)[0]?.[0];
      if (!attempt) throw new Error("Exam attempt not found");

      // Get all answers with question details
      const answersResult = await db.execute(sql`
        SELECT 
          ear.*, 
          q.question_text,
          q.question_context,
          q.question_type,
          q.difficulty_level,
          q.points,
          q.explanation,
          q.tags
        FROM exam_attempt_responses ear
        JOIN questions q ON ear.question_id = q.id
        WHERE ear.attempt_id = ${input.attemptId}
        ORDER BY ear.question_number
      `);

      const answers = (answersResult as any)[0] || [];

      // Get options for each question
      const answersWithOptions = await Promise.all(
        answers.map(async (answer: any) => {
          const optionsResult = await db.execute(sql`
            SELECT option_text, is_correct
            FROM question_options
            WHERE question_id = ${answer.question_id}
            ORDER BY option_order
          `);

          const options = (optionsResult as any)[0] || [];
          const correctOption = options.findIndex((opt: any) => opt.is_correct);

          return {
            ...answer,
            options: options.map((opt: any) => opt.option_text),
            correctAnswer: correctOption,
            isCorrect: answer.is_correct,
            selectedAnswer: answer.selected_option !== null ? answer.selected_option : null,
          };
        })
      );

      // Calculate performance analytics
      const totalQuestions = answersWithOptions.length;
      const correctAnswers = answersWithOptions.filter((a: any) => a.isCorrect).length;
      const scorePercentage = (correctAnswers / totalQuestions) * 100;

      // Performance by difficulty
      const byDifficulty = answersWithOptions.reduce((acc: any, answer: any) => {
        const level = answer.difficulty_level;
        if (!acc[level]) {
          acc[level] = { total: 0, correct: 0 };
        }
        acc[level].total++;
        if (answer.isCorrect) acc[level].correct++;
        return acc;
      }, {});

      // Performance by topic (tags)
      const byTopic: Record<string, { total: number; correct: number }> = {};
      answersWithOptions.forEach((answer: any) => {
        const tags = typeof answer.tags === 'string' ? JSON.parse(answer.tags) : answer.tags || [];
        tags.forEach((tag: string) => {
          if (!byTopic[tag]) {
            byTopic[tag] = { total: 0, correct: 0 };
          }
          byTopic[tag].total++;
          if (answer.isCorrect) byTopic[tag].correct++;
        });
      });

      return {
        attempt: {
          id: attempt.id,
          examTitle: attempt.title,
          startedAt: attempt.started_at,
          completedAt: attempt.completed_at,
          totalQuestions: attempt.total_questions,
          totalPoints: attempt.total_points,
          passingScore: attempt.passing_score,
          score: attempt.score,
          scorePercentage: attempt.score_percentage,
          passed: attempt.passed,
        },
        answers: answersWithOptions,
        analytics: {
          totalQuestions,
          correctAnswers,
          incorrectAnswers: totalQuestions - correctAnswers,
          scorePercentage,
          passed: scorePercentage >= attempt.passing_score,
          byDifficulty: Object.entries(byDifficulty).map(([level, stats]: [string, any]) => ({
            level,
            total: stats.total,
            correct: stats.correct,
            percentage: (stats.correct / stats.total) * 100,
          })),
          byTopic: Object.entries(byTopic).map(([topic, stats]: [string, any]) => ({
            topic,
            total: stats.total,
            correct: stats.correct,
            percentage: (stats.correct / stats.total) * 100,
          })),
        },
      };
    }),
});
