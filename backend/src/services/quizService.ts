import db from '../lib/db'
import { createUser, getUserById, getUserByUsername } from './userService'
import { getModuleByCode } from './courseService'

const DEMO_USERNAME = 'demo_student'
const DEMO_PASSWORD_HASH = '$2a$10$Qx0j.8xJ2D7m9W8bq8x9UuM0xk8Z9kcvxA2A8xQ.8yN8uCwQ3Q9k2'

interface QuizQuestionRow {
  id: string
  module_code: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation: string | null
}

interface PracticeAttemptInput {
  userId?: string | null
  moduleCode?: string | null
  questionId: string
  userAnswer: string
  isCorrect: boolean
  score: number
  timeSpent: number
}

async function ensureUserId(userId?: string | null): Promise<string> {
  if (userId) {
    const user = await getUserById(userId)
    if (user) return user.id
  }

  const demoUser = await getUserByUsername(DEMO_USERNAME)
  if (demoUser) return demoUser.id

  const created = await createUser(DEMO_USERNAME, DEMO_PASSWORD_HASH, '演示学员')
  return created.id
}

export async function getQuizQuestions(moduleCode: string | null, limit: number) {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(20, Math.floor(limit))) : 5

  const queryWithModule = async (code: string) => {
    const result = await db.query(
      `SELECT q.id,
              m.code AS module_code,
              q.question_text,
              q.options,
              q.correct_answer,
              q.explanation
       FROM questions q
       JOIN modules m ON m.id = q.module_id
       WHERE m.code = $1 AND q.is_active = TRUE AND m.is_active = TRUE
       ORDER BY RANDOM()
       LIMIT $2`,
      [code, safeLimit],
    )
    return result.rows as QuizQuestionRow[]
  }

  if (moduleCode) {
    const scoped = await queryWithModule(moduleCode)
    if (scoped.length >= safeLimit) {
      return scoped
    }
  }

  const result = await db.query(
    `SELECT q.id,
            m.code AS module_code,
            q.question_text,
            q.options,
            q.correct_answer,
            q.explanation
     FROM questions q
     JOIN modules m ON m.id = q.module_id
     WHERE q.is_active = TRUE AND m.is_active = TRUE
     ORDER BY RANDOM()
     LIMIT $1`,
    [safeLimit],
  )

  return result.rows as QuizQuestionRow[]
}

export async function submitPracticeAttempt(input: PracticeAttemptInput) {
  const safeScore = Math.max(0, Math.min(100, Math.floor(input.score)))
  const safeTimeSpent = Math.max(0, Math.floor(input.timeSpent))
  const userId = await ensureUserId(input.userId)

  let moduleId: string | null = null
  let moduleCode: string | null = input.moduleCode ?? null

  if (moduleCode) {
    const module = await getModuleByCode(moduleCode)
    moduleId = module?.id ?? null
  }

  if (!moduleId) {
    const moduleFromQuestion = await db.query(
      `SELECT q.module_id, m.code
       FROM questions q
       JOIN modules m ON m.id = q.module_id
       WHERE q.id = $1`,
      [input.questionId],
    )

    const row = moduleFromQuestion.rows[0]
    moduleId = row?.module_id ?? null
    moduleCode = row?.code ?? moduleCode
  }

  if (!moduleId) {
    throw new Error('module_not_found_for_question')
  }

  const inserted = await db.query(
    `INSERT INTO practice_records (user_id, question_id, module_id, score, user_answer, is_correct, time_spent)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
     RETURNING *`,
    [userId, input.questionId, moduleId, safeScore, JSON.stringify(input.userAnswer), input.isCorrect, safeTimeSpent],
  )

  await db.query(
    `INSERT INTO learning_history (user_id, module_id, action_type, action_detail)
     VALUES ($1, $2, 'quiz_answer', $3::jsonb)`,
    [
      userId,
      moduleId,
      JSON.stringify({
        questionId: input.questionId,
        moduleCode,
        isCorrect: input.isCorrect,
        score: safeScore,
        timeSpent: safeTimeSpent,
      }),
    ],
  )

  return inserted.rows[0]
}
