// 练习记录服务层
import db from '../lib/db'
import type { PracticeRecord } from '../types'

interface PracticeRecordRow {
  id: string
  user_id: string
  question_id: string
  module_id: string
  score: number
  user_answer: unknown
  is_correct: boolean
  time_spent: number
  created_at: string
}

interface LearningHistoryRow {
  id: string
  user_id: string
  module_id: string | null
  action_type: string
  action_detail: unknown
  created_at: string
}

interface AccuracyAggRow {
  total: string
  correct: string | null
}

interface TodayStatsRow {
  total_exercises: string
  avg_time: string | null
  correct_count: string | null
}

// 记录练习
export async function createPracticeRecord(record: Omit<PracticeRecord, 'id' | 'createdAt'>) {
  const result = await db.query<PracticeRecordRow>(
    `INSERT INTO practice_records (user_id, question_id, module_id, score, user_answer, is_correct, time_spent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      record.userId,
      record.questionId,
      record.moduleId,
      record.score,
      JSON.stringify(record.userAnswer),
      record.isCorrect,
      record.timeSpent,
    ],
  )
  return result.rows[0]
}

// 获取用户练习记录（limit 上限保护，避免被请求 100 万条）
export async function getUserPracticeRecords(userId: string, limit = 50) {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit) || 50))
  const result = await db.query<PracticeRecordRow>(
    `SELECT * FROM practice_records
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, safeLimit],
  )
  return result.rows
}

// 获取用户某模块的练习记录
export async function getModulePracticeRecords(userId: string, moduleId: string) {
  const result = await db.query<PracticeRecordRow>(
    `SELECT * FROM practice_records
     WHERE user_id = $1 AND module_id = $2
     ORDER BY created_at DESC`,
    [userId, moduleId],
  )
  return result.rows
}

// 记录学习历史
export async function recordLearningHistory(
  userId: string,
  moduleId: string,
  actionType: string,
  actionDetail?: unknown,
) {
  const result = await db.query<LearningHistoryRow>(
    `INSERT INTO learning_history (user_id, module_id, action_type, action_detail)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, moduleId, actionType, JSON.stringify(actionDetail)],
  )
  return result.rows[0]
}

// 获取用户学习历史
export async function getUserLearningHistory(userId: string, limit = 100) {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit) || 100))
  const result = await db.query<LearningHistoryRow>(
    `SELECT * FROM learning_history
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, safeLimit],
  )
  return result.rows
}

// 计算正确率
export async function calculateAccuracy(userId: string, moduleId?: string) {
  if (moduleId) {
    const result = await db.query<AccuracyAggRow>(
      `SELECT COUNT(*)::text AS total,
              SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::text AS correct
       FROM practice_records
       WHERE user_id = $1 AND module_id = $2`,
      [userId, moduleId],
    )
    return accuracyFromAgg(result.rows[0])
  }

  const result = await db.query<AccuracyAggRow>(
    `SELECT COUNT(*)::text AS total,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::text AS correct
     FROM practice_records
     WHERE user_id = $1`,
    [userId],
  )
  return accuracyFromAgg(result.rows[0])
}

function accuracyFromAgg(row: AccuracyAggRow | undefined): number {
  if (!row) return 0
  const total = Number(row.total)
  const correct = Number(row.correct ?? 0)
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

// 获取今日学习统计
export async function getTodayStats(userId: string) {
  const result = await db.query<TodayStatsRow>(
    `SELECT COUNT(*)::text AS total_exercises,
            AVG(time_spent)::text AS avg_time,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::text AS correct_count
     FROM practice_records
     WHERE user_id = $1
     AND created_at >= CURRENT_DATE`,
    [userId],
  )
  const row = result.rows[0]
  return {
    total_exercises: Number(row?.total_exercises ?? 0),
    avg_time: row?.avg_time ? Number(row.avg_time) : 0,
    correct_count: Number(row?.correct_count ?? 0),
  }
}
