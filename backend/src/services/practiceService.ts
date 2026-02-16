// 练习记录服务层
import db from '../lib/db'
import type { PracticeRecord } from '../types'

// 记录练习
export async function createPracticeRecord(record: Omit<PracticeRecord, 'id' | 'createdAt'>) {
  const result = await db.query(
    `INSERT INTO practice_records (user_id, question_id, module_id, score, user_answer, is_correct, time_spent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [record.userId, record.questionId, record.moduleId, record.score, JSON.stringify(record.userAnswer), record.isCorrect, record.timeSpent]
  )
  return result.rows[0]
}

// 获取用户练习记录
export async function getUserPracticeRecords(userId: string, limit = 50) {
  const result = await db.query(
    `SELECT * FROM practice_records 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

// 获取用户某模块的练习记录
export async function getModulePracticeRecords(userId: string, moduleId: string) {
  const result = await db.query(
    `SELECT * FROM practice_records 
     WHERE user_id = $1 AND module_id = $2 
     ORDER BY created_at DESC`,
    [userId, moduleId]
  )
  return result.rows
}

// 记录学习历史
export async function recordLearningHistory(userId: string, moduleId: string, actionType: string, actionDetail?: any) {
  const result = await db.query(
    `INSERT INTO learning_history (user_id, module_id, action_type, action_detail)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, moduleId, actionType, JSON.stringify(actionDetail)]
  )
  return result.rows[0]
}

// 获取用户学习历史
export async function getUserLearningHistory(userId: string, limit = 100) {
  const result = await db.query(
    `SELECT * FROM learning_history 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

// 计算正确率
export async function calculateAccuracy(userId: string, moduleId?: string) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
    FROM practice_records
    WHERE user_id = $1
  `
  const params = [userId]
  
  if (moduleId) {
    query += ` AND module_id = $2`
    params.push(moduleId)
  }
  
  const result = await db.query(query, params)
  const { total, correct } = result.rows[0]
  
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

// 获取今日学习统计
export async function getTodayStats(userId: string) {
  const result = await db.query(
    `SELECT 
        COUNT(*) as total_exercises,
        AVG(time_spent) as avg_time,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count
     FROM practice_records
     WHERE user_id = $1 
     AND created_at >= CURRENT_DATE`,
    [userId]
  )
  return result.rows[0]
}
